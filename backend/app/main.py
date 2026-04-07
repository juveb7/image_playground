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

# Resolve paths relative to this file so the app works from any working directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # repo root
FRONTEND_DIR = BASE_DIR / "frontend"
STATIC_DIR = FRONTEND_DIR / "static"

app = FastAPI(title="Image Playground")

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
app.include_router(detection_router, prefix="/api")


@app.get("/")
async def serve_index():
    return FileResponse(str(FRONTEND_DIR / "index.html"))


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=5000,
        reload=True,
        reload_dirs=[str(BASE_DIR / "backend")],
    )
