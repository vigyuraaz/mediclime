from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel

class ConditionCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    summary: str
    description: Optional[str] = None
    category_id: Optional[int] = None
    featured_image: Optional[str] = None
    symptoms: List[str] = []
    causes: List[str] = []
    risk_factors: List[str] = []
    diagnosis_info: List[str] = []
    treatments: List[str] = []
    when_to_seek_care: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

class ConditionUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    featured_image: Optional[str] = None
    symptoms: Optional[List[str]] = None
    causes: Optional[List[str]] = None
    risk_factors: Optional[List[str]] = None
    diagnosis_info: Optional[List[str]] = None
    treatments: Optional[List[str]] = None
    when_to_seek_care: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

class ConditionOut(BaseModel):
    id: int
    name: str
    slug: str
    summary: str
    description: Optional[str] = None
    category_id: Optional[int] = None
    featured_image: Optional[str] = None
    symptoms: List[str] = []
    causes: List[str] = []
    risk_factors: List[str] = []
    diagnosis_info: List[str] = []
    treatments: List[str] = []
    when_to_seek_care: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
