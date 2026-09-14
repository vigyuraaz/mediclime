import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Text, JSON
from app.core.database import Base

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    EDITOR = "editor"
    AUTHOR = "author"
    REVIEWER = "reviewer"
    CONTENT_GENERATOR = "content_generator"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.EDITOR.value, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    custom_permissions = Column(JSON, default=list, nullable=False)  # optional custom overrides
    last_login_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def has_permission(self, permission: str) -> bool:
        """Role-based permission check with optional custom permission overrides."""
        if not self.is_active:
            return False
        if self.role in [UserRole.SUPER_ADMIN.value, UserRole.ADMIN.value]:
            return True
            
        role_permissions = {
            UserRole.EDITOR.value: [
                "article:read", "article:create", "article:update", "article:publish",
                "product:read", "product:create", "product:update", "product:publish",
                "media:read", "media:upload", "media:delete", "ai:generate",
                "category:read", "category:create", "category:update",
                "condition:read", "condition:create", "condition:update"
            ],
            UserRole.AUTHOR.value: [
                "article:read", "article:create", "article:update",
                "product:read", "media:read", "media:upload", "ai:generate"
            ],
            UserRole.REVIEWER.value: [
                "article:read", "article:review", "product:read", "product:review"
            ],
            UserRole.CONTENT_GENERATOR.value: [
                "article:read", "article:create", "ai:generate"
            ]
        }
        
        allowed = role_permissions.get(self.role, [])
        if permission in allowed:
            return True
        return permission in (self.custom_permissions or [])
