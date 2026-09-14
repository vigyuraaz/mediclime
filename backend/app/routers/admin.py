from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import generate_api_key
from app.dependencies.auth import require_permission, get_current_user
from app.models.user import User
from app.models.article import Article, ArticleStatus
from app.models.product import Product, ProductStatus
from app.models.category import Category, Tag
from app.models.condition import Condition
from app.models.author import Author
from app.models.api_key import ApiKey
from app.models.ai_job import GenerationJob
from app.models.site_setting import SiteConfig
from app.schemas.article import ArticleCreate, ArticleUpdate, ArticleOut, ArticleDetailOut
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut, ProductDetailOut
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryOut
from app.schemas.author import AuthorCreate, AuthorUpdate, AuthorOut
from app.schemas.condition import ConditionCreate, ConditionUpdate, ConditionOut
from app.schemas.api_key import ApiKeyCreate, ApiKeyOut, ApiKeyCreatedOut
from app.schemas.settings import SiteConfigOut, SiteConfigUpdate
from app.schemas.common import StandardResponse, PaginatedResponse, PaginationMeta
from app.services.article_service import article_service
from app.services.product_service import product_service
from datetime import datetime, timezone

router = APIRouter(prefix="/admin", tags=["Admin CMS"])

# ----------------- Dashboard Overview Stats -----------------
@router.get("/overview/stats", response_model=StandardResponse[dict])
def get_dashboard_stats(
    user: User = Depends(require_permission("article:read")),
    db: Session = Depends(get_db)
):
    total_articles = db.query(Article).count()
    published_articles = db.query(Article).filter(Article.status == ArticleStatus.PUBLISHED.value).count()
    draft_articles = db.query(Article).filter(Article.status == ArticleStatus.DRAFT.value).count()
    review_articles = db.query(Article).filter(Article.status == ArticleStatus.NEEDS_REVIEW.value).count()
    
    total_products = db.query(Product).count()
    total_conditions = db.query(Condition).count()
    total_authors = db.query(Author).count()
    total_jobs = db.query(GenerationJob).count()

    return StandardResponse(data={
        "total_articles": total_articles,
        "published_articles": published_articles,
        "draft_articles": draft_articles,
        "needs_review_articles": review_articles,
        "total_products": total_products,
        "total_conditions": total_conditions,
        "total_authors": total_authors,
        "total_ai_jobs": total_jobs
    })

# ----------------- Articles CMS -----------------
@router.get("/articles", response_model=PaginatedResponse[ArticleOut])
def admin_list_articles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    user: User = Depends(require_permission("article:read")),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * page_size
    articles, total = article_service.get_articles(
        db=db, skip=skip, limit=page_size, status=status, category_id=category_id, search=search
    )
    total_pages = max(1, (total + page_size - 1) // page_size)
    return PaginatedResponse(
        data=[ArticleOut.model_validate(a) for a in articles],
        pagination=PaginationMeta(page=page, page_size=page_size, total=total, total_pages=total_pages)
    )

@router.post("/articles", response_model=StandardResponse[ArticleDetailOut])
def admin_create_article(
    data: ArticleCreate,
    user: User = Depends(require_permission("article:create")),
    db: Session = Depends(get_db)
):
    article = article_service.create_article(db, data, user_id=user.id)
    return StandardResponse(data=ArticleDetailOut.model_validate(article), message="Article draft created")

@router.get("/articles/{article_id}", response_model=StandardResponse[ArticleDetailOut])
def admin_get_article(
    article_id: int,
    user: User = Depends(require_permission("article:read")),
    db: Session = Depends(get_db)
):
    article = article_service.get_article_by_id(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return StandardResponse(data=ArticleDetailOut.model_validate(article))

@router.put("/articles/{article_id}", response_model=StandardResponse[ArticleDetailOut])
def admin_update_article(
    article_id: int,
    data: ArticleUpdate,
    user: User = Depends(require_permission("article:update")),
    db: Session = Depends(get_db)
):
    article = article_service.update_article(db, article_id, data, user_id=user.id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return StandardResponse(data=ArticleDetailOut.model_validate(article), message="Article updated")

@router.post("/articles/{article_id}/publish", response_model=StandardResponse[ArticleOut])
def admin_publish_article(
    article_id: int,
    user: User = Depends(require_permission("article:publish")),
    db: Session = Depends(get_db)
):
    article = article_service.update_article(
        db, article_id, ArticleUpdate(status=ArticleStatus.PUBLISHED.value), user_id=user.id
    )
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return StandardResponse(data=ArticleOut.model_validate(article), message="Article published successfully")

@router.post("/articles/{article_id}/unpublish", response_model=StandardResponse[ArticleOut])
def admin_unpublish_article(
    article_id: int,
    user: User = Depends(require_permission("article:publish")),
    db: Session = Depends(get_db)
):
    article = article_service.update_article(
        db, article_id, ArticleUpdate(status=ArticleStatus.DRAFT.value), user_id=user.id
    )
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return StandardResponse(data=ArticleOut.model_validate(article), message="Article unpublished to draft")

@router.delete("/articles/{article_id}", response_model=StandardResponse[dict])
def admin_delete_article(
    article_id: int,
    user: User = Depends(require_permission("article:update")),
    db: Session = Depends(get_db)
):
    success = article_service.delete_article(db, article_id)
    if not success:
        raise HTTPException(status_code=404, detail="Article not found")
    return StandardResponse(data={"deleted": True}, message="Article removed")

# ----------------- Products CMS -----------------
@router.get("/products", response_model=PaginatedResponse[ProductOut])
def admin_list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    search: Optional[str] = None,
    user: User = Depends(require_permission("product:read")),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * page_size
    products, total = product_service.get_products(
        db=db, skip=skip, limit=page_size, status=status, search=search
    )
    total_pages = max(1, (total + page_size - 1) // page_size)
    return PaginatedResponse(
        data=[ProductOut.model_validate(p) for p in products],
        pagination=PaginationMeta(page=page, page_size=page_size, total=total, total_pages=total_pages)
    )

@router.post("/products", response_model=StandardResponse[ProductDetailOut])
def admin_create_product(
    data: ProductCreate,
    user: User = Depends(require_permission("product:create")),
    db: Session = Depends(get_db)
):
    product = product_service.create_product(db, data)
    return StandardResponse(data=ProductDetailOut.model_validate(product), message="Product created")

@router.get("/products/{product_id}", response_model=StandardResponse[ProductDetailOut])
def admin_get_product(
    product_id: int,
    user: User = Depends(require_permission("product:read")),
    db: Session = Depends(get_db)
):
    product = product_service.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return StandardResponse(data=ProductDetailOut.model_validate(product))

@router.put("/products/{product_id}", response_model=StandardResponse[ProductDetailOut])
def admin_update_product(
    product_id: int,
    data: ProductUpdate,
    user: User = Depends(require_permission("product:update")),
    db: Session = Depends(get_db)
):
    product = product_service.update_product(db, product_id, data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return StandardResponse(data=ProductDetailOut.model_validate(product), message="Product updated")

# ----------------- API Keys -----------------
@router.get("/api-keys", response_model=StandardResponse[List[ApiKeyOut]])
def list_api_keys(
    user: User = Depends(require_permission("admin")),
    db: Session = Depends(get_db)
):
    keys = db.query(ApiKey).order_by(ApiKey.created_at.desc()).all()
    return StandardResponse(data=[ApiKeyOut.model_validate(k) for k in keys])

@router.post("/api-keys", response_model=StandardResponse[ApiKeyCreatedOut])
def create_new_api_key(
    data: ApiKeyCreate,
    user: User = Depends(require_permission("admin")),
    db: Session = Depends(get_db)
):
    raw_key, key_hash, prefix_display = generate_api_key()
    api_key = ApiKey(
        name=data.name,
        key_hash=key_hash,
        prefix=prefix_display,
        permissions=data.permissions,
        created_by_id=user.id
    )
    db.add(api_key)
    db.commit()
    db.refresh(api_key)

    response_data = ApiKeyCreatedOut(
        id=api_key.id,
        name=api_key.name,
        prefix=api_key.prefix,
        permissions=api_key.permissions,
        is_active=api_key.is_active,
        created_at=api_key.created_at,
        secret_key=raw_key
    )
    return StandardResponse(
        data=response_data,
        message="API Key created. Copy the secret key now; it cannot be displayed again."
    )

@router.delete("/api-keys/{key_id}", response_model=StandardResponse[dict])
def revoke_api_key(
    key_id: int,
    user: User = Depends(require_permission("admin")),
    db: Session = Depends(get_db)
):
    key = db.query(ApiKey).filter(ApiKey.id == key_id).first()
    if not key:
        raise HTTPException(status_code=404, detail="API Key not found")
    key.is_active = False
    db.commit()
    return StandardResponse(data={"revoked": True}, message="API Key revoked")

# ----------------- Site Settings (White-label & Website Cloning) -----------------
@router.get("/settings", response_model=StandardResponse[SiteConfigOut])
def admin_get_site_settings(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    config = db.query(SiteConfig).first()
    if not config:
        config = SiteConfig()
        db.add(config)
        db.commit()
        db.refresh(config)
    return StandardResponse(data=SiteConfigOut.model_validate(config))

@router.put("/settings", response_model=StandardResponse[SiteConfigOut])
def admin_update_site_settings(
    data: SiteConfigUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    config = db.query(SiteConfig).first()
    if not config:
        config = SiteConfig()
        db.add(config)
        db.commit()
        db.refresh(config)

    update_dict = data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        if hasattr(config, key):
            setattr(config, key, value)

    config.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(config)
    return StandardResponse(data=SiteConfigOut.model_validate(config), message="Website settings updated successfully")
