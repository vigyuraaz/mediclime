from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db, SessionLocal
from app.dependencies.auth import require_permission
from app.models.user import User
from app.models.ai_job import GenerationJob, JobStatus, JobType
from app.models.article import Article, ArticleStatus
from app.schemas.ai import (
    ArticleGenerationRequest, ProductGenerationRequest, GenerationJobOut,
    StructuredArticleOutput, StructuredProductOutput, AISettingsOut, AISettingsUpdate
)
from app.schemas.common import StandardResponse
from app.services.ai_service import get_ai_provider
from app.services.article_service import article_service
from app.schemas.article import ArticleCreate, ArticleFAQCreate, ArticleSourceCreate
from app.core.config import settings

router = APIRouter(prefix="/ai", tags=["AI Generation"])

def run_ai_article_job(job_id: str, request_data: dict, user_id: Optional[int]):
    """Background task that invokes AI provider, validates Pydantic schema, and creates draft."""
    db: Session = SessionLocal()
    try:
        job = db.query(GenerationJob).filter(GenerationJob.job_id == job_id).first()
        if not job:
            return
        
        job.status = JobStatus.PROCESSING.value
        job.started_at = datetime.now(timezone.utc)
        db.commit()

        req = ArticleGenerationRequest(**request_data)
        ai_provider = get_ai_provider()
        
        # Invoke AI provider
        import asyncio
        raw_output = asyncio.run(ai_provider.generate_article(req))
        
        # Validate through Pydantic
        structured = StructuredArticleOutput.model_validate(raw_output)

        meta_kw = ", ".join(structured.seo.keywords) if structured.seo.keywords else None

        # Create draft article
        article_in = ArticleCreate(
            title=structured.title,
            subtitle=structured.subtitle,
            excerpt=structured.excerpt,
            content_blocks=structured.content_blocks,
            executive_summary=[item.model_dump() for item in structured.executive_summary],
            status=ArticleStatus.PUBLISHED.value if req.auto_publish else ArticleStatus.DRAFT.value,
            medical_review_status="unreviewed",
            reading_time=structured.reading_time,
            word_count=structured.word_count,
            author_id=req.author_id,
            reviewer_id=req.reviewer_id,
            seo_title=structured.seo.title,
            seo_description=structured.seo.description,
            meta_keywords=meta_kw,
            faqs=[ArticleFAQCreate(question=f.question, answer=f.answer) for f in structured.faqs],
            sources=[ArticleSourceCreate(
                title=s.title,
                url=s.url,
                publisher=s.publisher,
                published_date=s.published_date,
                citation_text=s.citation_text
            ) for s in structured.sources]
        )
        
        created_article = article_service.create_article(db, article_in, user_id=user_id)

        job.status = JobStatus.COMPLETED.value
        job.output_data = {
            "article_id": created_article.id,
            "slug": created_article.slug,
            "title": created_article.title,
            "status": created_article.status
        }
        job.completed_at = datetime.now(timezone.utc)
        db.commit()
    except Exception as e:
        db.rollback()
        job = db.query(GenerationJob).filter(GenerationJob.job_id == job_id).first()
        if job:
            job.status = JobStatus.FAILED.value
            job.error = str(e)
            job.completed_at = datetime.now(timezone.utc)
            db.commit()
        db.close()

def _clean_markdown_to_html(text: str) -> str:
    """Helper to convert common markdown headings, lists, and bold markers to valid HTML."""
    if not text:
        return ""
    import re
    # Unpack outer swallowed <h[1-6]>
    text = re.sub(r'^<h[1-6]>(.*)</h[1-6]>$', r'\1', text.strip(), flags=re.DOTALL)
    # Unpack <p>## Heading</p>
    text = re.sub(r'<p>\s*(#{1,6}\s+[^\n<]+)\s*<\/p>', r'\1', text)
    
    # If text contains ## markdown headings, split and structure
    if "##" in text:
        parts = re.split(r'\s*##\s*', text)
        html_sections = []
        for part in parts:
            part = part.strip()
            if not part:
                continue
            m_q = re.match(r'^(.*?\?)\s*(.*)$', part, re.DOTALL)
            m_phrase = re.match(
                r'^(Why you should use [^\n.]+?|Reviews of [^\n.]+?|[^\n.]+? benefits|[^\n.]+? money back guarantee|[^\n.]+? ingredients list|[^\n.]+? pros &amp; cons|[^\n.]+? pros & cons)\s+(.*)$',
                part, re.IGNORECASE | re.DOTALL
            )
            if m_q:
                heading = m_q.group(1).strip()
                body = m_q.group(2).strip()
            elif m_phrase:
                heading = m_phrase.group(1).strip()
                body = m_phrase.group(2).strip()
            else:
                m_first = re.match(r'^([^\n.]+[\.\?]?)\s*(.*)$', part, re.DOTALL)
                if m_first and len(m_first.group(1)) < 70:
                    heading = m_first.group(1).strip()
                    body = m_first.group(2).strip()
                else:
                    heading = ""
                    body = part

            sec_html = ""
            if heading:
                heading_clean = re.sub(r'^#+\s*', '', heading).strip()
                sec_html += f"<h2>{heading_clean}</h2>\n"
            if body:
                if " - " in body or "\n- " in body or body.startswith("- "):
                    bullet_split = re.split(r'(?:^|\s+)-\s+', body)
                    lead = bullet_split[0].strip()
                    bullets = bullet_split[1:]
                    if lead:
                        lead = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', lead)
                        sec_html += f"<p>{lead}</p>\n"
                    if bullets:
                        sec_html += "<ul>\n"
                        for b in bullets:
                            b_clean = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', b.strip())
                            sec_html += f"  <li>{b_clean}</li>\n"
                        sec_html += "</ul>\n"
                else:
                    body_clean = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', body)
                    sec_html += f"<p>{body_clean}</p>\n"
            html_sections.append(sec_html)
        return "\n".join(html_sections)
    
    # Fallback inline cleaning
    text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)
    return text


def run_ai_product_job(job_id: str, request_data: dict, user_id: Optional[int]):
    """Background task that invokes AI provider, validates Pydantic schema, and creates draft product."""
    from app.services.product_service import product_service
    from app.schemas.product import ProductCreate, ProductBenefitCreate, ProductIngredientCreate, SupplementFactCreate, ProductFAQCreate
    from app.models.product import ProductStatus

    db: Session = SessionLocal()
    try:
        job = db.query(GenerationJob).filter(GenerationJob.job_id == job_id).first()
        if not job:
            return
        
        job.status = JobStatus.PROCESSING.value
        job.started_at = datetime.now(timezone.utc)
        db.commit()

        req = ProductGenerationRequest(**request_data)
        ai_provider = get_ai_provider()
        
        # Invoke AI provider
        import asyncio
        raw_output = asyncio.run(ai_provider.generate_product(req))
        
        # Validate through Pydantic
        structured = StructuredProductOutput.model_validate(raw_output)

        meta_kw = ", ".join(structured.seo.keywords) if structured.seo.keywords else None
        clean_desc = _clean_markdown_to_html(structured.description)

        # Create draft product
        product_in = ProductCreate(
            name=structured.name,
            brand=structured.brand,
            short_description=structured.short_description,
            description=clean_desc,
            serving_size=structured.serving_size,
            form=structured.form,
            rating=structured.rating,
            price=structured.price,
            highlight_badges=structured.highlight_badges,
            dosage=structured.dosage,
            directions=structured.directions,
            warnings=structured.warnings,
            allergens=structured.allergens,
            storage=structured.storage,
            seo_title=structured.seo.title,
            seo_description=structured.seo.description,
            meta_keywords=meta_kw,
            status=ProductStatus.PUBLISHED.value if req.auto_publish else ProductStatus.DRAFT.value,
            benefits=[ProductBenefitCreate(benefit=b.get("benefit", ""), description=b.get("description", "")) for b in structured.benefits],
            ingredients=[ProductIngredientCreate(name=i.get("name", ""), amount=i.get("amount", ""), daily_value=i.get("daily_value", ""), notes=i.get("notes", "")) for i in structured.ingredients],
            supplement_facts=[SupplementFactCreate(ingredient_name=s.get("ingredient_name", ""), amount=s.get("amount", ""), daily_value=s.get("daily_value", "")) for s in structured.supplement_facts],
            faqs=[ProductFAQCreate(question=f.question, answer=f.answer) for f in structured.faqs]
        )
        
        # Add image prompts to the bottom of the description as an editor's note if present
        if structured.image_prompts:
            prompts_html = "<div class='ai-image-prompts'><h3>AI Image Prompts (Editor Note):</h3><ul>"
            for p in structured.image_prompts:
                prompts_html += f"<li>{p}</li>"
            prompts_html += "</ul></div>"
            product_in.description += "\n\n" + prompts_html

        created_product = product_service.create_product(db, product_in)

        job.status = JobStatus.COMPLETED.value
        job.output_data = {
            "product_id": created_product.id,
            "slug": created_product.slug,
            "title": created_product.name,
            "status": created_product.status
        }
        job.completed_at = datetime.now(timezone.utc)
        db.commit()
    except Exception as e:
        db.rollback()
        job = db.query(GenerationJob).filter(GenerationJob.job_id == job_id).first()
        if job:
            job.status = JobStatus.FAILED.value
            job.error = str(e)
            job.completed_at = datetime.now(timezone.utc)
            db.commit()
    finally:
        db.close()

@router.post("/articles/generate", response_model=StandardResponse[GenerationJobOut])
def generate_article_endpoint(
    req: ArticleGenerationRequest,
    background_tasks: BackgroundTasks,
    user: User = Depends(require_permission("ai:generate")),
    db: Session = Depends(get_db)
):
    job = GenerationJob(
        type=JobType.ARTICLE_GENERATION.value,
        status=JobStatus.QUEUED.value,
        provider=settings.DEFAULT_AI_PROVIDER,
        model=settings.DEFAULT_TEXT_MODEL,
        input_data=req.model_dump(),
        created_by_id=user.id
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    background_tasks.add_task(run_ai_article_job, job.job_id, req.model_dump(), user.id)

    return StandardResponse(
        data=GenerationJobOut.model_validate(job),
        message="AI article generation job queued successfully"
    )

@router.post("/products/generate", response_model=StandardResponse[GenerationJobOut])
def generate_product_endpoint(
    req: ProductGenerationRequest,
    background_tasks: BackgroundTasks,
    user: User = Depends(require_permission("ai:generate")),
    db: Session = Depends(get_db)
):
    job = GenerationJob(
        type=JobType.PRODUCT_GENERATION.value if hasattr(JobType, 'PRODUCT_GENERATION') else "product_generation",
        status=JobStatus.QUEUED.value,
        provider=settings.DEFAULT_AI_PROVIDER,
        model=settings.DEFAULT_TEXT_MODEL,
        input_data=req.model_dump(),
        created_by_id=user.id
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    background_tasks.add_task(run_ai_product_job, job.job_id, req.model_dump(), user.id)

    return StandardResponse(
        data=GenerationJobOut.model_validate(job),
        message="AI product generation job queued successfully"
    )

@router.get("/jobs/{job_id}", response_model=StandardResponse[GenerationJobOut])
def get_job_status(
    job_id: str,
    user: User = Depends(require_permission("ai:generate")),
    db: Session = Depends(get_db)
):
    job = db.query(GenerationJob).filter(GenerationJob.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Generation job not found")
    return StandardResponse(data=GenerationJobOut.model_validate(job))

@router.get("/settings", response_model=StandardResponse[AISettingsOut])
def get_ai_settings(user: User = Depends(require_permission("admin"))):
    return StandardResponse(
        data=AISettingsOut(
            default_ai_provider=settings.DEFAULT_AI_PROVIDER,
            default_text_model=settings.DEFAULT_TEXT_MODEL,
            default_image_provider=settings.DEFAULT_IMAGE_PROVIDER,
            has_groq_key=bool(settings.GROQ_API_KEY),
            has_gemini_key=bool(settings.GEMINI_API_KEY),
            has_openai_key=bool(settings.OPENAI_API_KEY)
        )
    )

@router.put("/settings", response_model=StandardResponse[AISettingsOut])
def update_ai_settings(
    data: AISettingsUpdate,
    user: User = Depends(require_permission("admin"))
):
    if data.default_ai_provider:
        settings.DEFAULT_AI_PROVIDER = data.default_ai_provider
    if data.default_text_model:
        settings.DEFAULT_TEXT_MODEL = data.default_text_model
    if data.default_image_provider:
        settings.DEFAULT_IMAGE_PROVIDER = data.default_image_provider
    if data.groq_api_key is not None:
        settings.GROQ_API_KEY = data.groq_api_key
    if data.gemini_api_key is not None:
        settings.GEMINI_API_KEY = data.gemini_api_key
    if data.openai_api_key is not None:
        settings.OPENAI_API_KEY = data.openai_api_key

    return StandardResponse(
        data=AISettingsOut(
            default_ai_provider=settings.DEFAULT_AI_PROVIDER,
            default_text_model=settings.DEFAULT_TEXT_MODEL,
            default_image_provider=settings.DEFAULT_IMAGE_PROVIDER,
            has_groq_key=bool(settings.GROQ_API_KEY),
            has_gemini_key=bool(settings.GEMINI_API_KEY),
            has_openai_key=bool(settings.OPENAI_API_KEY)
        ),
        message="AI settings updated"
    )
