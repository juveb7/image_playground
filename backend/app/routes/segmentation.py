from __future__ import annotations

import io
from fastapi import APIRouter, File, UploadFile, HTTPException
from PIL import Image, UnidentifiedImageError

from app.features.segmentation.segmenter import segment

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@router.post("/segment")
async def segment_image(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{file.content_type}'. Upload JPEG, PNG, or WebP.",
        )

    raw = await file.read()

    try:
        image = Image.open(io.BytesIO(raw)).convert("RGB")
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="File could not be decoded as an image.")

    segments = segment(image)

    return {
        "segments": segments,
        "image_width": image.width,
        "image_height": image.height,
    }
