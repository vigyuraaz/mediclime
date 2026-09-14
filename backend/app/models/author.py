from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
from app.core.database import Base

class Author(Base):
    __tablename__ = "authors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    profile_image = Column(String(500), nullable=True)
    professional_title = Column(String(255), nullable=False)  # e.g., "Board-Certified Neurologist"
    short_bio = Column(Text, nullable=True)
    full_bio = Column(Text, nullable=True)
    credentials = Column(String(255), nullable=True)  # e.g., "MD, FAAN"
    areas_of_expertise = Column(JSON, default=list, nullable=False)
    hospital_affiliations = Column(JSON, default=list, nullable=False)
    website = Column(String(500), nullable=True)
    social_links = Column(JSON, default=dict, nullable=False)
    is_medical_reviewer = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
