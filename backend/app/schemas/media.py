from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class MediaUpdate(BaseModel):
    alt_text: Optional[str] = None
    caption: Optional[str] = None

class MediaOut(BaseModel):
    id: int
    filename: str
    storage_key: str
    url: str
    mime_type: str
    width: Optional[int] = None
    height: Optional[int] = None
    file_size: int
    alt_text: str = ""
    caption: Optional[str] = None
    uploaded_by_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
