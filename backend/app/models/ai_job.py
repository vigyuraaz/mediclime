import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class JobStatus(str, enum.Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class JobType(str, enum.Enum):
    ARTICLE_GENERATION = "article_generation"
    PRODUCT_GENERATION = "product_generation"
    SEO_OPTIMIZATION = "seo_optimization"
    FAQ_GENERATION = "faq_generation"
    IMAGE_GENERATION = "image_generation"

class GenerationJob(Base):
    __tablename__ = "generation_jobs"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True, nullable=False)
    type = Column(String(50), default=JobType.ARTICLE_GENERATION.value, nullable=False)
    status = Column(String(50), default=JobStatus.QUEUED.value, index=True, nullable=False)
    
    provider = Column(String(50), default="gemini", nullable=False)
    model = Column(String(100), default="gemini-3.6-flash", nullable=False)
    
    input_data = Column(JSON, default=dict, nullable=False)
    output_data = Column(JSON, default=dict, nullable=True)
    error = Column(Text, nullable=True)
    
    input_tokens = Column(Integer, default=0, nullable=False)
    output_tokens = Column(Integer, default=0, nullable=False)
    estimated_cost = Column(Float, default=0.0, nullable=False)
    
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    created_by = relationship("User")
