from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class SiteConfigBase(BaseModel):
    site_name: str = "Mediclime"
    site_name_highlight: Optional[str] = "clime"
    site_tagline: Optional[str] = "Evidence-Led Health"
    site_description: Optional[str] = (
        "Mediclime is an evidence-first medical publishing platform combining peer-reviewed clinical summaries, "
        "third-party verified nutraceutical facts, and daily therapeutic protocols."
    )
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    announcement_enabled: bool = True
    announcement_text: Optional[str] = "Clinical Evidence-First Editorial • Updated Medical Research 2026"
    default_meta_title: Optional[str] = "Mediclime — Evidence-Based Health & Supplement Reviews"
    default_meta_description: Optional[str] = (
        "Evidence-based medical publishing platform providing peer-reviewed clinical guides, supplement facts, and therapeutic wellness protocols."
    )
    default_meta_keywords: Optional[str] = "medical blog, health guides, supplements, clinical nutrition, evidence-based wellness"
    google_search_console_verification: Optional[str] = None
    bing_webmaster_verification: Optional[str] = None
    contact_email: Optional[str] = "support@mediclime.com"
    contact_phone: Optional[str] = "+1 (800) 555-0199"
    footer_copyright: Optional[str] = "Mediclime Clinical Publishing Group. All rights reserved."
    social_twitter: Optional[str] = "https://twitter.com"
    social_facebook: Optional[str] = "https://facebook.com"
    social_instagram: Optional[str] = "https://instagram.com"
    social_youtube: Optional[str] = "https://youtube.com"
    social_linkedin: Optional[str] = "https://linkedin.com"
    primary_color: Optional[str] = "#094749"
    accent_color: Optional[str] = "#F43F5E"

class SiteConfigUpdate(BaseModel):
    site_name: Optional[str] = None
    site_name_highlight: Optional[str] = None
    site_tagline: Optional[str] = None
    site_description: Optional[str] = None
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    announcement_enabled: Optional[bool] = None
    announcement_text: Optional[str] = None
    default_meta_title: Optional[str] = None
    default_meta_description: Optional[str] = None
    default_meta_keywords: Optional[str] = None
    google_search_console_verification: Optional[str] = None
    bing_webmaster_verification: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    footer_copyright: Optional[str] = None
    social_twitter: Optional[str] = None
    social_facebook: Optional[str] = None
    social_instagram: Optional[str] = None
    social_youtube: Optional[str] = None
    social_linkedin: Optional[str] = None
    primary_color: Optional[str] = None
    accent_color: Optional[str] = None

class SiteConfigOut(SiteConfigBase):
    id: int
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
