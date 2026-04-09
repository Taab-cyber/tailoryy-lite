# routers/uploads.py — Image upload to Cloudinary (with dev fallback)
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from typing import List
import uuid

from app.config import settings
from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE      = 10 * 1024 * 1024   # 10 MB


def _cloudinary_upload(content: bytes, folder: str = "tailoryy") -> str:
    if not settings.CLOUDINARY_CLOUD_NAME or "your-cloud" in (settings.CLOUDINARY_CLOUD_NAME or ""):
        # Dev placeholder — returns a reliable public sample image
        return f"https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop"

    import cloudinary
    import cloudinary.uploader
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
    )
    result = cloudinary.uploader.upload(
        content,
        folder=folder,
        public_id=f"{folder}/{uuid.uuid4()}",
        resource_type="image",
    )
    return result["secure_url"]


@router.post("/image")
async def upload_image(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and WEBP allowed")
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    url = _cloudinary_upload(content)
    return {"url": url}


@router.post("/images")
async def upload_images(files: List[UploadFile] = File(...), current_user: User = Depends(get_current_user)):
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Max 10 files at once")
    urls = []
    for f in files:
        if f.content_type not in ALLOWED_TYPES:
            continue
        content = await f.read()
        if len(content) <= MAX_SIZE:
            urls.append(_cloudinary_upload(content))
    return {"urls": urls}


@router.delete("/image")
async def delete_image(data: dict, current_user: User = Depends(get_current_user)):
    public_id = data.get("public_id")
    if not public_id or not settings.CLOUDINARY_CLOUD_NAME:
        return {"message": "Deletion skipped (dev mode)"}
    import cloudinary
    import cloudinary.uploader
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
    )
    cloudinary.uploader.destroy(public_id)
    return {"message": "Deleted"}
