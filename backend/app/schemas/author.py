from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class AuthorCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    profile_image: Optional[str] = None
    professional_title: str
    short_bio: Optional[str] = None
    full_bio: Optional[str] = None
    credentials: Optional[str] = None
    areas_of_expertise: List[str] = []
    hospital_affiliations: List[str] = []
    website: Optional[str] = None
    social_links: Dict[str, str] = {}
    is_medical_reviewer: bool = False

class AuthorUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    profile_image: Optional[str] = None
    professional_title: Optional[str] = None
    short_bio: Optional[str] = None
    full_bio: Optional[str] = None
    credentials: Optional[str] = None
    areas_of_expertise: Optional[List[str]] = None
    hospital_affiliations: Optional[List[str]] = None
    website: Optional[str] = None
    social_links: Optional[Dict[str, str]] = None
    is_medical_reviewer: Optional[bool] = None

class AuthorOut(BaseModel):
    id: int
    name: str
    slug: str
    profile_image: Optional[str] = None
    professional_title: str
    short_bio: Optional[str] = None
    full_bio: Optional[str] = None
    credentials: Optional[str] = None
    areas_of_expertise: List[str] = []
    hospital_affiliations: List[str] = []
    website: Optional[str] = None
    social_links: Dict[str, str] = {}
    is_medical_reviewer: bool
    created_at: datetime

    class Config:
        from_attributes = True
