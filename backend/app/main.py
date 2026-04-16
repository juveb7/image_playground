from __future__ import annotations

import sys
from pathlib import Path

# When run directly (python backend/app/main.py), add backend/ to sys.path
# so that `from app.routes...` imports resolve correctly.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import uvicorn
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.routes.object_detection import router as detection_router
from app.routes.segmentation import router as segmentation_router
from app.routes.audio import router as audio_router

# Resolve paths relative to this file so the app works from any working directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # repo root
FRONTEND_DIR = BASE_DIR / "frontend"
STATIC_DIR = FRONTEND_DIR / "static"

app = FastAPI(title="Image Playground")

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
app.include_router(detection_router, prefix="/api")
app.include_router(segmentation_router, prefix="/api")
app.include_router(audio_router, prefix="/api")


@app.get("/")
async def serve_landing():
    return FileResponse(str(FRONTEND_DIR / "landing.html"))


@app.get("/image")
async def serve_image():
    return FileResponse(str(FRONTEND_DIR / "image.html"))


@app.get("/audio")
async def serve_audio():
    return FileResponse(str(FRONTEND_DIR / "audio.html"))


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8002,
        reload=True,
        reload_dirs=[str(BASE_DIR / "backend")],
    )
