from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class TagCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None

class TagOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class CategoryCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    icon_name: Optional[str] = None
    parent_id: Optional[int] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    sort_order: Optional[int] = 0
    is_active: Optional[bool] = True

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    icon_name: Optional[str] = None
    parent_id: Optional[int] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    icon_name: Optional[str] = None
    parent_id: Optional[int] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    sort_order: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
