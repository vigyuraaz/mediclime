import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Table, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class ProductStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

# Many-to-Many association for Article <-> Product
article_products = Table(
    "article_products",
    Base.metadata,
    Column("article_id", Integer, ForeignKey("articles.id", ondelete="CASCADE"), primary_key=True),
    Column("product_id", Integer, ForeignKey("products.id", ondelete="CASCADE"), primary_key=True)
)

# Many-to-Many association for Product <-> Related Product
product_related = Table(
    "product_related",
    Base.metadata,
    Column("product_id", Integer, ForeignKey("products.id", ondelete="CASCADE"), primary_key=True),
    Column("related_product_id", Integer, ForeignKey("products.id", ondelete="CASCADE"), primary_key=True)
)

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True, nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(500), nullable=False)
    brand = Column(String(255), nullable=False)
    short_description = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default=ProductStatus.DRAFT.value, index=True, nullable=False)
    
    rating = Column(Float, default=4.8, nullable=False)
    review_count = Column(Integer, default=0, nullable=False)
    price = Column(Float, default=0.0, nullable=False)
    currency = Column(String(10), default="USD", nullable=False)
    availability = Column(String(50), default="In Stock", nullable=False)
    
    serving_size = Column(String(100), default="2 Capsules Daily", nullable=False)
    form = Column(String(100), default="Vegetarian Capsules", nullable=False)
    
    featured_image_url = Column(String(1000), nullable=True)
    gallery_images = Column(JSON, default=list, nullable=False)
    highlight_badges = Column(JSON, default=list, nullable=False)  # e.g. ["GMP Certified", "Third-Party Tested"]
    image_prompts = Column(JSON, default=list, nullable=False)
    buy_now_url = Column(String(1000), nullable=True)
    
    # Clinical product facts and warnings
    dosage = Column(String(255), nullable=True)
    directions = Column(Text, nullable=True)
    warnings = Column(Text, nullable=True)
    allergens = Column(Text, nullable=True)
    contraindications = Column(Text, nullable=True)
    storage = Column(Text, nullable=True)
    disclaimer = Column(Text, nullable=True)
    
    seo_title = Column(String(255), nullable=True)
    seo_description = Column(Text, nullable=True)
    meta_keywords = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    category = relationship("Category")
    benefits = relationship("ProductBenefit", back_populates="product", cascade="all, delete-orphan", order_by="ProductBenefit.sort_order")
    ingredients = relationship("ProductIngredient", back_populates="product", cascade="all, delete-orphan", order_by="ProductIngredient.sort_order")
    supplement_facts = relationship("SupplementFact", back_populates="product", cascade="all, delete-orphan", order_by="SupplementFact.sort_order")
    faqs = relationship("ProductFAQ", back_populates="product", cascade="all, delete-orphan", order_by="ProductFAQ.sort_order")
    
    related_articles = relationship("Article", secondary=article_products, backref="related_products")
    related_products = relationship(
        "Product",
        secondary=product_related,
        primaryjoin=id == product_related.c.product_id,
        secondaryjoin=id == product_related.c.related_product_id
    )

class ProductBenefit(Base):
    __tablename__ = "product_benefits"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    benefit = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    icon_name = Column(String(100), nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)

    product = relationship("Product", back_populates="benefits")

class ProductIngredient(Base):
    __tablename__ = "product_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    amount = Column(String(100), nullable=False)
    unit = Column(String(50), nullable=True)
    daily_value = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)

    product = relationship("Product", back_populates="ingredients")

class SupplementFact(Base):
    __tablename__ = "supplement_facts"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    ingredient_name = Column(String(255), nullable=False)
    amount = Column(String(100), nullable=False)
    unit = Column(String(50), nullable=True)
    daily_value = Column(String(50), nullable=True)  # e.g., "100%", "** Daily Value not established"
    sort_order = Column(Integer, default=0, nullable=False)

    product = relationship("Product", back_populates="supplement_facts")

class ProductFAQ(Base):
    __tablename__ = "product_faqs"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    question = Column(String(500), nullable=False)
    answer = Column(Text, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)

    product = relationship("Product", back_populates="faqs")
