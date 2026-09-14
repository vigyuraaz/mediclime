import re
import math
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.models.article import Article, ArticleFAQ, ArticleSource, ArticleStatus, article_tags
from app.models.category import Tag
from app.schemas.article import ArticleCreate, ArticleUpdate

def generate_slug(title: str) -> str:
    """Generate a clean URL slug from title."""
    cleaned = re.sub(r'[^a-zA-Z0-9\s-]', '', title.lower())
    slug = re.sub(r'[\s-]+', '-', cleaned).strip('-')
    return slug or "untitled-article"

def calculate_reading_time(text: str) -> Tuple[str, int]:
    """Calculates word count and estimated reading time at 200 words per minute."""
    words = len(text.split())
    minutes = max(1, math.ceil(words / 200))
    return f"{minutes} Min Read", words

class ArticleService:
    def get_articles(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None,
        category_id: Optional[int] = None,
        author_id: Optional[int] = None,
        search: Optional[str] = None,
        is_featured: Optional[bool] = None
    ) -> Tuple[List[Article], int]:
        query = db.query(Article)
        
        if status:
            query = query.filter(Article.status == status)
        if category_id:
            query = query.filter(Article.category_id == category_id)
        if author_id:
            query = query.filter(Article.author_id == author_id)
        if is_featured is not None:
            query = query.filter(Article.is_featured == is_featured)
        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                or_(
                    Article.title.ilike(search_filter),
                    Article.subtitle.ilike(search_filter),
                    Article.excerpt.ilike(search_filter)
                )
            )
            
        total = query.count()
        articles = query.order_by(desc(Article.created_at)).offset(skip).limit(limit).all()
        return articles, total

    def get_article_by_slug(self, db: Session, slug: str, public_only: bool = True) -> Optional[Article]:
        query = db.query(Article).filter(Article.slug == slug)
        if public_only:
            query = query.filter(Article.status == ArticleStatus.PUBLISHED.value)
        return query.first()

    def get_article_by_id(self, db: Session, article_id: int) -> Optional[Article]:
        return db.query(Article).filter(Article.id == article_id).first()

    def create_article(self, db: Session, data: ArticleCreate, user_id: Optional[int] = None) -> Article:
        slug = data.slug or generate_slug(data.title)
        # Ensure unique slug
        base_slug = slug
        counter = 1
        while db.query(Article).filter(Article.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1

        # Calculate word count & read time from blocks
        all_text = f"{data.title} {data.subtitle or ''} {data.excerpt or ''} "
        for block in data.content_blocks:
            if isinstance(block, dict):
                all_text += block.get("text", "") + " "
                for p in block.get("paragraphs", []):
                    all_text += str(p) + " "
        read_time, word_count = calculate_reading_time(all_text)

        article = Article(
            title=data.title,
            slug=slug,
            subtitle=data.subtitle,
            excerpt=data.excerpt,
            content_blocks=data.content_blocks,
            executive_summary=data.executive_summary,
            status=data.status or ArticleStatus.DRAFT.value,
            medical_review_status=data.medical_review_status or "unreviewed",
            reading_time=read_time,
            word_count=word_count,
            category_id=data.category_id,
            author_id=data.author_id,
            reviewer_id=data.reviewer_id,
            featured_image_url=data.featured_image_url,
            seo_title=data.seo_title or data.title,
            seo_description=data.seo_description or data.excerpt,
            meta_keywords=data.meta_keywords,
            canonical_url=data.canonical_url,
            og_image=data.og_image or data.featured_image_url,
            is_featured=data.is_featured or False,
            is_trending=data.is_trending or False,
            scheduled_at=data.scheduled_at,
            created_by_id=user_id,
            updated_by_id=user_id
        )
        
        if article.status == ArticleStatus.PUBLISHED.value:
            article.published_at = datetime.now(timezone.utc)

        db.add(article)
        db.flush()

        # Add FAQs
        for item in data.faqs:
            faq = ArticleFAQ(
                article_id=article.id,
                question=item.question,
                answer=item.answer,
                sort_order=item.sort_order or 0
            )
            db.add(faq)

        # Add Sources
        for item in data.sources:
            src = ArticleSource(
                article_id=article.id,
                title=item.title,
                url=item.url,
                publisher=item.publisher,
                published_date=item.published_date,
                citation_text=item.citation_text,
                sort_order=item.sort_order or 0
            )
            db.add(src)

        # Attach Tags
        if data.tag_ids:
            tags = db.query(Tag).filter(Tag.id.in_(data.tag_ids)).all()
            article.tags = tags

        db.commit()
        db.refresh(article)
        return article

    def update_article(self, db: Session, article_id: int, data: ArticleUpdate, user_id: Optional[int] = None) -> Optional[Article]:
        article = self.get_article_by_id(db, article_id)
        if not article:
            return None

        update_data = data.model_dump(exclude_unset=True)
        
        # Check if slug changed
        if "slug" in update_data and update_data["slug"] != article.slug:
            new_slug = update_data["slug"]
            if db.query(Article).filter(Article.slug == new_slug, Article.id != article_id).first():
                raise ValueError("An article with this slug already exists")

        # Handle tag update
        if "tag_ids" in update_data and update_data["tag_ids"] is not None:
            tag_ids = update_data.pop("tag_ids")
            article.tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()

        for key, value in update_data.items():
            setattr(article, key, value)

        if article.status == ArticleStatus.PUBLISHED.value and not article.published_at:
            article.published_at = datetime.now(timezone.utc)

        article.updated_by_id = user_id
        db.commit()
        db.refresh(article)
        return article

    def delete_article(self, db: Session, article_id: int) -> bool:
        article = self.get_article_by_id(db, article_id)
        if not article:
            return False
        db.delete(article)
        db.commit()
        return True

article_service = ArticleService()
