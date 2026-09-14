from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    key_hash = Column(String(128), unique=True, index=True, nullable=False)
    prefix = Column(String(32), nullable=False)  # Display prefix e.g. "med_live_ab...1234"
    permissions = Column(JSON, default=list, nullable=False)  # e.g. ["article:create", "article:publish"]
    is_active = Column(Boolean, default=True, nullable=False)
    last_used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_by = relationship("User")

    def has_permission(self, permission: str) -> bool:
        if not self.is_active:
            return False
        return permission in (self.permissions or [])
