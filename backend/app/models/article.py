import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Table, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class ArticleStatus(str, enum.Enum):
    DRAFT = "draft"
    AI_GENERATED = "ai_generated"
    NEEDS_REVIEW = "needs_review"
    REVIEWED = "reviewed"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class MedicalReviewStatus(str, enum.Enum):
    UNREVIEWED = "unreviewed"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    FLAGGED = "flagged"

# Many-to-Many association for Article <-> Tag
article_tags = Table(
    "article_tags",
    Base.metadata,
    Column("article_id", Integer, ForeignKey("articles.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)
)

# Many-to-Many association for Article <-> Related Article
article_related = Table(
    "article_related",
    Base.metadata,
    Column("article_id", Integer, ForeignKey("articles.id", ondelete="CASCADE"), primary_key=True),
    Column("related_article_id", Integer, ForeignKey("articles.id", ondelete="CASCADE"), primary_key=True)
)

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True, nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    title = Column(String(500), nullable=False)
    subtitle = Column(Text, nullable=True)
    excerpt = Column(Text, nullable=True)
    
    # Structured JSON content blocks (headings, paragraphs, callouts, diagrams, nutrient cards, etc.)
    content_blocks = Column(JSON, default=list, nullable=False)
    executive_summary = Column(JSON, default=list, nullable=False)  # [{bold: '...', text: '...'}]
    image_prompts = Column(JSON, default=list, nullable=False)
    
    status = Column(String(50), default=ArticleStatus.DRAFT.value, index=True, nullable=False)
    medical_review_status = Column(String(50), default=MedicalReviewStatus.UNREVIEWED.value, nullable=False)
    medical_review_date = Column(DateTime, nullable=True)
    reviewer_notes = Column(Text, nullable=True)
    
    reading_time = Column(String(50), default="5 Min Read", nullable=False)
    word_count = Column(Integer, default=0, nullable=False)
    
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    author_id = Column(Integer, ForeignKey("authors.id", ondelete="SET NULL"), nullable=True)
    reviewer_id = Column(Integer, ForeignKey("authors.id", ondelete="SET NULL"), nullable=True)
    featured_image_url = Column(String(1000), nullable=True)
    
    seo_title = Column(String(255), nullable=True)
    seo_description = Column(Text, nullable=True)
    meta_keywords = Column(Text, nullable=True)
    canonical_url = Column(String(500), nullable=True)
    og_image = Column(String(1000), nullable=True)
    
    is_featured = Column(Boolean, default=False, nullable=False)
    is_trending = Column(Boolean, default=False, nullable=False)
    
    published_at = Column(DateTime, nullable=True)
    scheduled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    category = relationship("Category")
    author = relationship("Author", foreign_keys=[author_id])
    reviewer = relationship("Author", foreign_keys=[reviewer_id])
    created_by = relationship("User", foreign_keys=[created_by_id])
    updated_by = relationship("User", foreign_keys=[updated_by_id])
    
    faqs = relationship("ArticleFAQ", back_populates="article", cascade="all, delete-orphan", order_by="ArticleFAQ.sort_order")
    sources = relationship("ArticleSource", back_populates="article", cascade="all, delete-orphan", order_by="ArticleSource.sort_order")
    tags = relationship("Tag", secondary=article_tags, backref="articles")
    related_articles = relationship(
        "Article",
        secondary=article_related,
        primaryjoin=id == article_related.c.article_id,
        secondaryjoin=id == article_related.c.related_article_id
    )

class ArticleFAQ(Base):
    __tablename__ = "article_faqs"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("articles.id", ondelete="CASCADE"), nullable=False)
    question = Column(String(500), nullable=False)
    answer = Column(Text, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)

    article = relationship("Article", back_populates="faqs")

class ArticleSource(Base):
    __tablename__ = "article_sources"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("articles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    url = Column(String(1000), nullable=True)
    publisher = Column(String(255), nullable=True)
    published_date = Column(String(100), nullable=True)
    citation_text = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)

    article = relationship("Article", back_populates="sources")
