from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.category import CategoryOut, TagOut
from app.schemas.author import AuthorOut

class ContentBlock(BaseModel):
    type: str  # heading, paragraph, callout, pathology_diagram, nutrient_card, exercise_steps, pull_quote, table, image, warning, info, list
    level: Optional[int] = None
    title: Optional[str] = None
    text: Optional[str] = None
    variant: Optional[str] = None  # info, warning, success
    paragraphs: Optional[List[str]] = None
    items: Optional[List[Any]] = None
    data: Optional[Dict[str, Any]] = None

class ArticleFAQCreate(BaseModel):
    question: str
    answer: str
    sort_order: Optional[int] = 0

class ArticleFAQOut(BaseModel):
    id: int
    question: str
    answer: str
    sort_order: int

    class Config:
        from_attributes = True

class ArticleSourceCreate(BaseModel):
    title: str
    url: Optional[str] = None
    publisher: Optional[str] = None
    published_date: Optional[str] = None
    citation_text: Optional[str] = None
    sort_order: Optional[int] = 0

class ArticleSourceOut(BaseModel):
    id: int
    title: str
    url: Optional[str] = None
    publisher: Optional[str] = None
    published_date: Optional[str] = None
    citation_text: Optional[str] = None
    sort_order: int

    class Config:
        from_attributes = True

class ExecutiveSummaryItem(BaseModel):
    bold: str
    text: str

class ArticleCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    subtitle: Optional[str] = None
    excerpt: Optional[str] = None
    content_blocks: List[Dict[str, Any]] = []
    executive_summary: List[Dict[str, str]] = []
    image_prompts: List[str] = []
    status: Optional[str] = "draft"
    medical_review_status: Optional[str] = "unreviewed"
    reading_time: Optional[str] = "8 Min Read"
    word_count: Optional[int] = 0
    category_id: Optional[int] = None
    author_id: Optional[int] = None
    reviewer_id: Optional[int] = None
    featured_image_url: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    canonical_url: Optional[str] = None
    og_image: Optional[str] = None
    is_featured: Optional[bool] = False
    is_trending: Optional[bool] = False
    scheduled_at: Optional[datetime] = None
    tag_ids: List[int] = []
    related_article_ids: List[int] = []
    faqs: List[ArticleFAQCreate] = []
    sources: List[ArticleSourceCreate] = []

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    subtitle: Optional[str] = None
    excerpt: Optional[str] = None
    content_blocks: Optional[List[Dict[str, Any]]] = None
    executive_summary: Optional[List[Dict[str, str]]] = None
    image_prompts: Optional[List[str]] = None
    status: Optional[str] = None
    medical_review_status: Optional[str] = None
    reading_time: Optional[str] = None
    word_count: Optional[int] = None
    category_id: Optional[int] = None
    author_id: Optional[int] = None
    reviewer_id: Optional[int] = None
    featured_image_url: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    canonical_url: Optional[str] = None
    og_image: Optional[str] = None
    is_featured: Optional[bool] = None
    is_trending: Optional[bool] = None
    scheduled_at: Optional[datetime] = None
    tag_ids: Optional[List[int]] = None
    related_article_ids: Optional[List[int]] = None

class ArticleOut(BaseModel):
    id: int
    uuid: str
    slug: str
    title: str
    subtitle: Optional[str] = None
    excerpt: Optional[str] = None
    status: str
    medical_review_status: str
    medical_review_date: Optional[datetime] = None
    reading_time: str
    word_count: int
    category_id: Optional[int] = None
    author_id: Optional[int] = None
    reviewer_id: Optional[int] = None
    featured_image_url: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    is_featured: bool
    is_trending: bool
    published_at: Optional[datetime] = None
    scheduled_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    category: Optional[CategoryOut] = None
    author: Optional[AuthorOut] = None
    reviewer: Optional[AuthorOut] = None
    tags: List[TagOut] = []

    class Config:
        from_attributes = True

class ArticleDetailOut(ArticleOut):
    content_blocks: List[Dict[str, Any]] = []
    executive_summary: List[Dict[str, str]] = []
    image_prompts: List[str] = []
    faqs: List[ArticleFAQOut] = []
    sources: List[ArticleSourceOut] = []
    related_articles: List[ArticleOut] = []
