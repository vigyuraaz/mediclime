from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: Optional[str] = "editor"
    avatar_url: Optional[str] = None
    bio: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    password: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: str
    is_active: bool
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    custom_permissions: List[str] = []
    last_login_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
