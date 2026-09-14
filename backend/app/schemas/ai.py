from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class ArticleGenerationRequest(BaseModel):
    title: str
    category: Optional[str] = "Nervous Health"
    primary_keyword: Optional[str] = None
    secondary_keywords: List[str] = []
    search_intent: Optional[str] = "Informational / Clinical"
    target_audience: Optional[str] = "Patients & Wellness Seekers"
    desired_word_count: Optional[int] = 1500
    tone: Optional[str] = "Authoritative, compassionate, evidence-based"
    country_region: Optional[str] = "United States"
    content_type: Optional[str] = "Medical Guide"
    author_id: Optional[int] = None
    reviewer_id: Optional[int] = None
    include_faq: bool = True
    include_references: bool = True
    include_table: bool = True
    include_callouts: bool = True
    generate_images: bool = False
    auto_publish: bool = False
    idempotency_key: Optional[str] = None
    additional_instructions: Optional[str] = None

class ProductGenerationRequest(BaseModel):
    name: str
    brand: str
    category: Optional[str] = "Neuropathy Support"
    product_type: Optional[str] = "Clinical Supplement"
    ingredients_info: Optional[str] = None
    serving_size: Optional[str] = "2 Capsules Daily"
    form: Optional[str] = "Vegetarian Capsules"
    target_audience: Optional[str] = "Adults seeking nerve comfort"
    auto_publish: bool = False
    additional_instructions: Optional[str] = None

# Structured Output Models (for validating AI provider responses)
class StructuredExecutiveSummary(BaseModel):
    bold: str
    text: str

class StructuredNutrient(BaseModel):
    name: str
    grade: str
    description: str
    dosage: str
    mechanism: str

class StructuredSection(BaseModel):
    id: str
    heading: str
    paragraphs: List[str]
    pull_quote: Optional[str] = None
    nutrients: Optional[List[StructuredNutrient]] = None

class StructuredFAQ(BaseModel):
    question: str
    answer: str

class StructuredSource(BaseModel):
    title: str
    url: Optional[str] = None
    publisher: Optional[str] = None
    published_date: Optional[str] = None
    citation_text: Optional[str] = None

class StructuredSEO(BaseModel):
    title: str
    description: str
    keywords: List[str] = []

class StructuredArticleOutput(BaseModel):
    title: str
    subtitle: str
    excerpt: str
    category: str
    tags: List[str] = []
    reading_time: str = "10 Min Read"
    word_count: int = 1500
    executive_summary: List[StructuredExecutiveSummary] = []
    content_blocks: List[Dict[str, Any]] = []
    faqs: List[StructuredFAQ] = []
    sources: List[StructuredSource] = []
    seo: StructuredSEO
    image_prompts: List[str] = []
    clinical_disclaimer: str = (
        "The medical and nutritional information provided in this article is for educational "
        "and informational purposes only and does not constitute formal medical diagnosis or treatment."
    )

class StructuredProductOutput(BaseModel):
    name: str
    brand: str
    short_description: str
    description: str
    serving_size: str
    form: str
    rating: float = 4.8
    price: float = 49.0
    highlight_badges: List[str] = []
    dosage: str
    directions: str
    warnings: str
    allergens: str
    storage: str
    benefits: List[Dict[str, str]] = []
    ingredients: List[Dict[str, str]] = []
    supplement_facts: List[Dict[str, str]] = []
    faqs: List[StructuredFAQ] = []
    seo: StructuredSEO
    image_prompts: List[str] = []

class GenerationJobOut(BaseModel):
    id: int
    job_id: str
    type: str
    status: str
    provider: str
    model: str
    input_data: Dict[str, Any]
    output_data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    input_tokens: int = 0
    output_tokens: int = 0
    estimated_cost: float = 0.0
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AISettingsUpdate(BaseModel):
    default_ai_provider: Optional[str] = None
    default_text_model: Optional[str] = None
    default_image_provider: Optional[str] = None
    groq_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None

class AISettingsOut(BaseModel):
    default_ai_provider: str
    default_text_model: str
    default_image_provider: str
    has_groq_key: bool
    has_gemini_key: bool
    has_openai_key: bool
