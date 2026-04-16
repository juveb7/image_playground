from __future__ import annotations

from fastapi import APIRouter, File, UploadFile, HTTPException

from app.features.audio.transcriber import transcribe

router = APIRouter()

ALLOWED_TYPES = {
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/wave",
    "audio/x-wav",
    "audio/m4a",
    "audio/mp4",
    "audio/ogg",
    "audio/flac",
    "audio/webm",
    "video/webm",  # some browsers report webm audio as video/webm
}


@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{file.content_type}'. Upload MP3, WAV, M4A, OGG, or FLAC.",
        )

    raw = await file.read()
    result = transcribe(raw, filename=file.filename or "audio.mp3")
    return result
