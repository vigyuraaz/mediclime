from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.auth import require_permission
from app.models.api_key import ApiKey
from app.models.ai_job import GenerationJob, JobStatus, JobType
from app.models.article import Article, ArticleStatus
from app.schemas.ai import ArticleGenerationRequest, GenerationJobOut
from app.schemas.article import ArticleCreate, ArticleOut
from app.schemas.common import StandardResponse
from app.services.article_service import article_service
from app.routers.ai import run_ai_article_job
from app.core.config import settings

router = APIRouter(prefix="/integrations", tags=["External Automation Integrations"])

@router.post("/articles/generate", response_model=StandardResponse[dict])
def external_generate_article(
    req: ArticleGenerationRequest,
    background_tasks: BackgroundTasks,
    auth_entity: Any = Depends(require_permission("ai:generate")),
    db: Session = Depends(get_db)
):
    """
    Endpoint for external Python scripts to request automated clinical article generation.
    Protected by API Key with 'ai:generate' permission.
    """
    # Check idempotency key if provided
    if req.idempotency_key:
        existing_job = db.query(GenerationJob).filter(
            GenerationJob.input_data["idempotency_key"].astext == req.idempotency_key
        ).first() if hasattr(GenerationJob.input_data, "astext") else None
        if existing_job:
            return StandardResponse(
                data={"job_id": existing_job.job_id, "status": existing_job.status},
                message="Returning existing generation job (idempotent)"
            )

    job = GenerationJob(
        type=JobType.ARTICLE_GENERATION.value,
        status=JobStatus.QUEUED.value,
        provider=settings.DEFAULT_AI_PROVIDER,
        model=settings.DEFAULT_TEXT_MODEL,
        input_data=req.model_dump()
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    background_tasks.add_task(run_ai_article_job, job.job_id, req.model_dump(), None)

    return StandardResponse(
        data={
            "success": True,
            "job_id": job.job_id,
            "status": "queued",
            "message": "AI article generation job queued"
        },
        message="Job created successfully"
    )

@router.post("/articles", response_model=StandardResponse[dict])
def external_submit_article(
    data: ArticleCreate,
    auth_entity: Any = Depends(require_permission("article:create")),
    db: Session = Depends(get_db)
):
    """
    Endpoint for external Python scripts to submit already-generated structured article JSON.
    Protected by API Key with 'article:create' permission.
    If 'article:publish' permission is missing on the key, automatically downgrades to draft.
    """
    can_publish = False
    if isinstance(auth_entity, ApiKey):
        can_publish = auth_entity.has_permission("article:publish")
    elif hasattr(auth_entity, "has_permission"):
        can_publish = auth_entity.has_permission("article:publish")

    if data.status == ArticleStatus.PUBLISHED.value and not can_publish:
        data.status = ArticleStatus.NEEDS_REVIEW.value

    article = article_service.create_article(db, data, user_id=None)

    return StandardResponse(
        data={
            "success": True,
            "article_id": article.id,
            "slug": article.slug,
            "status": article.status
        },
        message=f"Article saved with status '{article.status}'"
    )
