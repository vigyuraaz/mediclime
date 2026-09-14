from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal, get_db
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.routers import auth, public, admin, media, ai, integrations, publishing
from app.dependencies.license_check import LicenseProtectionMiddleware
from slowapi import _rate_limit_exceeded_handler, Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema is initialized
    Base.metadata.create_all(bind=engine)
    
    # Ensure seed super admin exists
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == settings.INITIAL_ADMIN_EMAIL).first()
        if not admin_user:
            admin_user = User(
                email=settings.INITIAL_ADMIN_EMAIL,
                password_hash=get_password_hash(settings.INITIAL_ADMIN_PASSWORD),
                name=settings.INITIAL_ADMIN_NAME,
                role=UserRole.SUPER_ADMIN.value,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
    finally:
        db.close()
        
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Production Medical Publishing and Clinical Supplement Platform API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows local React dev server and Vercel deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# License Protection Middleware
app.add_middleware(LicenseProtectionMiddleware)

# Register v1 Routers
api_prefix = settings.API_V1_PREFIX
app.include_router(auth.router, prefix=api_prefix)
app.include_router(public.router, prefix=api_prefix)
app.include_router(admin.router, prefix=api_prefix)
app.include_router(media.router, prefix=api_prefix)
app.include_router(ai.router, prefix=api_prefix)
app.include_router(integrations.router, prefix=api_prefix)
app.include_router(publishing.router, prefix=api_prefix)

@app.get("/health", tags=["Health"])
@app.get(f"{api_prefix}/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    # Ping the database to keep Supabase alive
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"disconnected ({str(e)})"
        
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "app": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0"
    }

from fastapi.responses import HTMLResponse, Response
import re
from app.models.site_setting import SiteConfig

@app.get("/google{token}.html", response_class=HTMLResponse, tags=["SEO"])
def google_html_verification(token: str):
    """Responds to Google Search Console HTML file verification requests."""
    return f"google-site-verification: google{token}.html"

@app.get("/BingSiteAuth.xml", tags=["SEO"])
def bing_xml_verification(db: Session = Depends(get_db)):
    """Responds to Bing Webmaster Tools XML verification requests."""
    config = db.query(SiteConfig).first()
    raw = getattr(config, "bing_webmaster_verification", "") or ""
    token = ""
    if raw:
        xml_match = re.search(r"<user>([^<]+)</user>", raw, re.IGNORECASE)
        meta_match = re.search(r'content=["\']([^"\']+)["\']', raw, re.IGNORECASE)
        if xml_match:
            token = xml_match.group(1).strip()
        elif meta_match:
            token = meta_match.group(1).strip()
        elif raw.lower().startswith("msvalidate.01="):
            token = raw[len("msvalidate.01="):].strip()
        else:
            token = raw.strip()

    xml_content = f"""<?xml version="1.0"?>
<users>
    <user>{token}</user>
</users>"""
    return Response(content=xml_content, media_type="application/xml")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
