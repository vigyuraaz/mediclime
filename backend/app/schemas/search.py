from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class SearchResultItem(BaseModel):
    type: str  # article, product, condition, author, category
    id: Any
    title: str
    slug: str
    excerpt: Optional[str] = None
    image_url: Optional[str] = None
    badge: Optional[str] = None
    url: str

class SearchResponse(BaseModel):
    query: str
    total: int
    results: List[SearchResultItem]
