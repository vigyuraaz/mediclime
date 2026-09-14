from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Media(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    storage_key = Column(String(500), nullable=False)
    url = Column(String(1000), nullable=False)
    mime_type = Column(String(100), nullable=False)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    file_size = Column(Integer, nullable=False)  # in bytes
    alt_text = Column(String(500), default="", nullable=False)
    caption = Column(Text, nullable=True)
    uploaded_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    uploaded_by = relationship("User")
