from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from app.schemas.category import CategoryOut

class ProductBenefitCreate(BaseModel):
    benefit: str
    description: Optional[str] = None
    icon_name: Optional[str] = None
    sort_order: Optional[int] = 0

class ProductBenefitOut(BaseModel):
    id: int
    benefit: str
    description: Optional[str] = None
    icon_name: Optional[str] = None
    sort_order: int

    class Config:
        from_attributes = True

class ProductIngredientCreate(BaseModel):
    name: str
    amount: str
    unit: Optional[str] = None
    daily_value: Optional[str] = None
    notes: Optional[str] = None
    sort_order: Optional[int] = 0

class ProductIngredientOut(BaseModel):
    id: int
    name: str
    amount: str
    unit: Optional[str] = None
    daily_value: Optional[str] = None
    notes: Optional[str] = None
    sort_order: int

    class Config:
        from_attributes = True

class SupplementFactCreate(BaseModel):
    ingredient_name: str
    amount: str
    unit: Optional[str] = None
    daily_value: Optional[str] = None
    sort_order: Optional[int] = 0

class SupplementFactOut(BaseModel):
    id: int
    ingredient_name: str
    amount: str
    unit: Optional[str] = None
    daily_value: Optional[str] = None
    sort_order: int

    class Config:
        from_attributes = True

class ProductFAQCreate(BaseModel):
    question: str
    answer: str
    sort_order: Optional[int] = 0

class ProductFAQOut(BaseModel):
    id: int
    question: str
    answer: str
    sort_order: int

    class Config:
        from_attributes = True

class ProductCreate(BaseModel):
    name: str
    brand: str
    slug: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    status: Optional[str] = "draft"
    rating: Optional[float] = 4.8
    review_count: Optional[int] = 0
    price: Optional[float] = 0.0
    currency: Optional[str] = "USD"
    availability: Optional[str] = "In Stock"
    serving_size: Optional[str] = "2 Capsules Daily"
    form: Optional[str] = "Vegetarian Capsules"
    featured_image_url: Optional[str] = None
    gallery_images: List[str] = []
    highlight_badges: List[str] = []
    image_prompts: List[str] = []
    buy_now_url: Optional[str] = None
    dosage: Optional[str] = None
    directions: Optional[str] = None
    warnings: Optional[str] = None
    allergens: Optional[str] = None
    contraindications: Optional[str] = None
    storage: Optional[str] = None
    disclaimer: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    benefits: List[ProductBenefitCreate] = []
    ingredients: List[ProductIngredientCreate] = []
    supplement_facts: List[SupplementFactCreate] = []
    faqs: List[ProductFAQCreate] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    slug: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    status: Optional[str] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    availability: Optional[str] = None
    serving_size: Optional[str] = None
    form: Optional[str] = None
    featured_image_url: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    highlight_badges: Optional[List[str]] = None
    image_prompts: Optional[List[str]] = None
    buy_now_url: Optional[str] = None
    dosage: Optional[str] = None
    directions: Optional[str] = None
    warnings: Optional[str] = None
    allergens: Optional[str] = None
    contraindications: Optional[str] = None
    storage: Optional[str] = None
    disclaimer: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    meta_keywords: Optional[str] = None

class ProductOut(BaseModel):
    id: int
    uuid: str
    slug: str
    name: str
    brand: str
    short_description: Optional[str] = None
    category_id: Optional[int] = None
    status: str
    rating: float
    review_count: int
    price: float
    currency: str
    availability: str
    serving_size: str
    form: str
    featured_image_url: Optional[str] = None
    gallery_images: List[str] = []
    highlight_badges: List[str] = []
    dosage: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    category: Optional[CategoryOut] = None

    class Config:
        from_attributes = True

class ProductDetailOut(ProductOut):
    description: Optional[str] = None
    directions: Optional[str] = None
    warnings: Optional[str] = None
    allergens: Optional[str] = None
    contraindications: Optional[str] = None
    storage: Optional[str] = None
    disclaimer: Optional[str] = None
    image_prompts: List[str] = []
    buy_now_url: Optional[str] = None
    benefits: List[ProductBenefitOut] = []
    ingredients: List[ProductIngredientOut] = []
    supplement_facts: List[SupplementFactOut] = []
    faqs: List[ProductFAQOut] = []
    related_products: List[ProductOut] = []
