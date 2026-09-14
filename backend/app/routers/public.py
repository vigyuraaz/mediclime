from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.article import Article, ArticleStatus
from app.models.product import Product, ProductStatus
from app.models.condition import Condition
from app.models.author import Author
from app.models.category import Category
from app.models.common import NewsletterSubscriber, ContactMessage
from app.models.site_setting import SiteConfig
from app.schemas.article import ArticleOut, ArticleDetailOut
from app.schemas.product import ProductOut, ProductDetailOut
from app.schemas.condition import ConditionOut
from app.schemas.author import AuthorOut
from app.schemas.category import CategoryOut
from app.schemas.search import SearchResponse
from app.schemas.settings import SiteConfigOut
from app.schemas.common import StandardResponse, PaginatedResponse, PaginationMeta
from app.services.article_service import article_service
from app.services.product_service import product_service
from app.services.search_service import search_service
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/public", tags=["Public Content"])

def get_or_create_site_config(db: Session) -> SiteConfig:
    config = db.query(SiteConfig).first()
    if not config:
        config = SiteConfig()
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.get("/settings", response_model=StandardResponse[SiteConfigOut])
def get_public_site_settings(db: Session = Depends(get_db)):
    config = get_or_create_site_config(db)
    return StandardResponse(data=SiteConfigOut.model_validate(config))

class NewsletterRequest(BaseModel):
    email: EmailStr
    source: Optional[str] = "footer"

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

# ----------------- Articles -----------------
@router.get("/articles", response_model=PaginatedResponse[ArticleOut])
def list_public_articles(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    is_featured: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    skip = (page - 1) * page_size
    articles, total = article_service.get_articles(
        db=db,
        skip=skip,
        limit=page_size,
        status=ArticleStatus.PUBLISHED.value,
        category_id=category_id,
        search=search,
        is_featured=is_featured
    )
    total_pages = max(1, (total + page_size - 1) // page_size)
    return PaginatedResponse(
        data=[ArticleOut.model_validate(a) for a in articles],
        pagination=PaginationMeta(page=page, page_size=page_size, total=total, total_pages=total_pages)
    )

@router.get("/articles/{slug}", response_model=StandardResponse[ArticleDetailOut])
def get_public_article(slug: str, db: Session = Depends(get_db)):
    article = article_service.get_article_by_slug(db, slug=slug, public_only=True)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found or not published")
        
    article_out = ArticleDetailOut.model_validate(article).model_dump()
    if not article_out.get("related_articles"):
        related = db.query(Article).filter(
            Article.id != article.id,
            Article.status == ArticleStatus.PUBLISHED.value,
            Article.category_id == article.category_id
        ).order_by(Article.created_at.desc()).limit(3).all()
        article_out["related_articles"] = [ArticleOut.model_validate(a).model_dump() for a in related]
        
    return StandardResponse(data=article_out)

# ----------------- Products -----------------
@router.get("/products", response_model=PaginatedResponse[ProductOut])
def list_public_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    category_id: Optional[int] = None,
    brand: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    skip = (page - 1) * page_size
    products, total = product_service.get_products(
        db=db,
        skip=skip,
        limit=page_size,
        status=ProductStatus.PUBLISHED.value,
        category_id=category_id,
        brand=brand,
        search=search
    )
    total_pages = max(1, (total + page_size - 1) // page_size)
    return PaginatedResponse(
        data=[ProductOut.model_validate(p) for p in products],
        pagination=PaginationMeta(page=page, page_size=page_size, total=total, total_pages=total_pages)
    )

@router.get("/products/{slug}", response_model=StandardResponse[ProductDetailOut])
def get_public_product(slug: str, db: Session = Depends(get_db)):
    product = product_service.get_product_by_slug(db, slug=slug, public_only=True)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or not published")
        
    product_out = ProductDetailOut.model_validate(product).model_dump()
    if not product_out.get("related_products"):
        related = db.query(Product).filter(
            Product.id != product.id,
            Product.status == ProductStatus.PUBLISHED.value,
            Product.category_id == product.category_id
        ).order_by(Product.created_at.desc()).limit(3).all()
        product_out["related_products"] = [ProductOut.model_validate(p).model_dump() for p in related]
        
    return StandardResponse(data=product_out)

# ----------------- Conditions -----------------
@router.get("/conditions", response_model=StandardResponse[List[ConditionOut]])
def list_public_conditions(db: Session = Depends(get_db)):
    conditions = db.query(Condition).order_by(Condition.name.asc()).all()
    return StandardResponse(data=[ConditionOut.model_validate(c) for c in conditions])

@router.get("/conditions/{slug}", response_model=StandardResponse[ConditionOut])
def get_public_condition(slug: str, db: Session = Depends(get_db)):
    condition = db.query(Condition).filter(Condition.slug == slug).first()
    if not condition:
        raise HTTPException(status_code=404, detail="Health condition not found")
    return StandardResponse(data=ConditionOut.model_validate(condition))

# ----------------- Authors -----------------
@router.get("/authors", response_model=StandardResponse[List[AuthorOut]])
def list_public_authors(db: Session = Depends(get_db)):
    authors = db.query(Author).order_by(Author.name.asc()).all()
    return StandardResponse(data=[AuthorOut.model_validate(a) for a in authors])

@router.get("/authors/{slug}", response_model=StandardResponse[AuthorOut])
def get_public_author(slug: str, db: Session = Depends(get_db)):
    author = db.query(Author).filter(Author.slug == slug).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author profile not found")
    return StandardResponse(data=AuthorOut.model_validate(author))

# ----------------- Categories -----------------
@router.get("/categories", response_model=StandardResponse[List[CategoryOut]])
def list_public_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).filter(Category.is_active == True).order_by(Category.sort_order.asc()).all()
    return StandardResponse(data=[CategoryOut.model_validate(c) for c in categories])

# ----------------- Search -----------------
@router.get("/search", response_model=StandardResponse[SearchResponse])
def public_search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    results = search_service.search(db, query=q)
    return StandardResponse(data=results)

# ----------------- Newsletter & Contact -----------------
@router.post("/newsletter/subscribe", response_model=StandardResponse[dict])
def subscribe_newsletter(req: NewsletterRequest, db: Session = Depends(get_db)):
    existing = db.query(NewsletterSubscriber).filter(NewsletterSubscriber.email == req.email).first()
    if not existing:
        sub = NewsletterSubscriber(email=req.email, source=req.source or "footer")
        db.add(sub)
        db.commit()
    return StandardResponse(data={"subscribed": True}, message="Thank you for subscribing to Mediclime Clinical Updates")

@router.post("/contact", response_model=StandardResponse[dict])
def submit_contact(req: ContactRequest, db: Session = Depends(get_db)):
    msg = ContactMessage(name=req.name, email=req.email, subject=req.subject, message=req.message)
    db.add(msg)
    db.commit()
    return StandardResponse(data={"sent": True}, message="Your message has been safely received by the Mediclime editorial team")
