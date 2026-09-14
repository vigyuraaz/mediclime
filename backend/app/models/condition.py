from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Condition(Base):
    __tablename__ = "conditions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    summary = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    featured_image = Column(String(500), nullable=True)
    
    # Structured pathology & symptom arrays
    symptoms = Column(JSON, default=list, nullable=False)
    causes = Column(JSON, default=list, nullable=False)
    risk_factors = Column(JSON, default=list, nullable=False)
    diagnosis_info = Column(JSON, default=list, nullable=False)
    treatments = Column(JSON, default=list, nullable=False)
    when_to_seek_care = Column(Text, nullable=True)
    
    seo_title = Column(String(255), nullable=True)
    seo_description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    category = relationship("Category")
