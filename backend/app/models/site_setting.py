from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from app.core.database import Base

class SiteConfig(Base):
    __tablename__ = "site_configs"

    id = Column(Integer, primary_key=True, index=True)
    site_name = Column(String(255), default="Mediclime", nullable=False)
    site_name_highlight = Column(String(255), default="clime", nullable=True)
    site_tagline = Column(String(255), default="Evidence-Led Health", nullable=True)
    site_description = Column(Text, default="Mediclime is an evidence-first medical publishing platform combining peer-reviewed clinical summaries, third-party verified nutraceutical facts, and daily therapeutic protocols.", nullable=True)
    
    logo_url = Column(String(1000), nullable=True)
    favicon_url = Column(String(1000), nullable=True)

    announcement_enabled = Column(Boolean, default=True, nullable=False)
    announcement_text = Column(String(500), default="Clinical Evidence-First Editorial • Updated Medical Research 2026", nullable=True)

    default_meta_title = Column(String(255), default="Mediclime — Evidence-Based Health & Supplement Reviews", nullable=True)
    default_meta_description = Column(Text, default="Evidence-based medical publishing platform providing peer-reviewed clinical guides, supplement facts, and therapeutic wellness protocols.", nullable=True)
    default_meta_keywords = Column(Text, default="medical blog, health guides, supplements, clinical nutrition, evidence-based wellness", nullable=True)
    google_search_console_verification = Column(Text, nullable=True)
    bing_webmaster_verification = Column(Text, nullable=True)

    contact_email = Column(String(255), default="support@mediclime.com", nullable=True)
    contact_phone = Column(String(100), default="+1 (800) 555-0199", nullable=True)
    footer_copyright = Column(String(500), default="Mediclime Clinical Publishing Group. All rights reserved.", nullable=True)

    social_twitter = Column(String(500), nullable=True)
    social_facebook = Column(String(500), nullable=True)
    social_instagram = Column(String(500), nullable=True)
    social_youtube = Column(String(500), nullable=True)
    social_linkedin = Column(String(500), nullable=True)

    primary_color = Column(String(50), default="#094749", nullable=True)
    accent_color = Column(String(50), default="#F43F5E", nullable=True)

    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
