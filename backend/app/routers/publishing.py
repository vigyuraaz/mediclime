from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.article import Article, ArticleStatus
from app.schemas.common import StandardResponse

router = APIRouter(prefix="/internal/publishing", tags=["Internal Publishing Pipeline"])

@router.post("/process-scheduled", response_model=StandardResponse[dict])
def process_scheduled_articles(
    x_cron_secret: str = Header(None, alias="X-Cron-Secret"),
    db: Session = Depends(get_db)
):
    """
    Called by Vercel Cron, external webhook, or scheduled job to publish scheduled articles.
    Protected by INTERNAL_CRON_SECRET.
    """
    if not x_cron_secret or x_cron_secret != settings.INTERNAL_CRON_SECRET:
        raise HTTPException(status_code=403, detail="Invalid cron authorization secret")

    now = datetime.now(timezone.utc)
    scheduled_articles = db.query(Article).filter(
        Article.status == ArticleStatus.SCHEDULED.value,
        Article.scheduled_at <= now
    ).all()

    published_count = 0
    for art in scheduled_articles:
        art.status = ArticleStatus.PUBLISHED.value
        art.published_at = now
        published_count += 1

    db.commit()
    return StandardResponse(
        data={"published_count": published_count},
        message=f"Processed {published_count} scheduled articles"
    )
