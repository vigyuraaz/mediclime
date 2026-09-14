from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class ApiKeyCreate(BaseModel):
    name: str
    permissions: List[str] = ["article:create", "article:publish"]

class ApiKeyOut(BaseModel):
    id: int
    name: str
    prefix: str
    permissions: List[str]
    is_active: bool
    last_used_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ApiKeyCreatedOut(ApiKeyOut):
    secret_key: str  # Only returned once upon creation!
