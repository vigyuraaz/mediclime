import os
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.dependencies.auth import require_permission
from app.models.media import Media
from app.models.user import User
from app.schemas.media import MediaOut
from app.schemas.common import StandardResponse, PaginatedResponse, PaginationMeta
from app.services.storage_service import storage_service

router = APIRouter(prefix="/media", tags=["Media Library"])

@router.get("", response_model=PaginatedResponse[MediaOut])
def list_media(
    page: int = Query(1, ge=1),
    page_size: int = Query(24, ge=1, le=100),
    user: User = Depends(require_permission("media:read")),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * page_size
    query = db.query(Media).order_by(Media.created_at.desc())
    total = query.count()
    items = query.offset(skip).limit(page_size).all()
    total_pages = max(1, (total + page_size - 1) // page_size)
    return PaginatedResponse(
        data=[MediaOut.model_validate(m) for m in items],
        pagination=PaginationMeta(page=page, page_size=page_size, total=total, total_pages=total_pages)
    )

@router.post("", response_model=StandardResponse[MediaOut])
async def upload_media_file(
    file: UploadFile = File(...),
    user: User = Depends(require_permission("media:upload")),
    db: Session = Depends(get_db)
):
    storage_key, public_url, file_size, width, height = await storage_service.upload_file(file)
    
    media = Media(
        filename=file.filename or "uploaded_image",
        storage_key=storage_key,
        url=public_url,
        mime_type=file.content_type or "image/jpeg",
        file_size=file_size,
        width=width,
        height=height,
        uploaded_by_id=user.id
    )
    db.add(media)
    db.commit()
    db.refresh(media)
    return StandardResponse(data=MediaOut.model_validate(media), message="Media uploaded successfully")

@router.delete("/{media_id}", response_model=StandardResponse[dict])
def delete_media_file(
    media_id: int,
    user: User = Depends(require_permission("media:delete")),
    db: Session = Depends(get_db)
):
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
        
    storage_service.delete_file(media.storage_key)
    db.delete(media)
    db.commit()
    return StandardResponse(data={"deleted": True}, message="Media record deleted")

@router.get("/files/{subfolder}/{filename}")
def serve_uploaded_file(subfolder: str, filename: str):
    """Serves local uploaded media files in development."""
    file_path = os.path.join(os.path.abspath(settings.UPLOAD_DIR), subfolder, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)
