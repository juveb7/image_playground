# LLM Context — AI Playground

This file gives an AI assistant the essential context needed to work on this codebase without reading every file. Keep it up to date as the project evolves.

## What this project is

A multi-modal AI web app. Users land on a category picker page, select a modality (image, video, audio, text), and interact with AI features. Built with FastAPI (backend) and vanilla JS (frontend). No framework on the frontend.

## Current state

- **Landing page** (`/`) — four category cards; Image and Audio are active, Video and Text show "Coming Soon"
- **Image page** (`/image`) — two working features: Object Detection and Segmentation
- **Audio page** (`/audio`) — one working feature: Speech-to-Text transcription via Whisper tiny
- **Video, Text** — UI cards exist but nothing is implemented yet

## Key file map

| File | Purpose |
|---|---|
| `backend/app/main.py` | FastAPI app entry point. Registers routers, serves HTML pages, mounts `/static`. Run with `python backend/app/main.py`. Port 8002. |
| `backend/app/routes/object_detection.py` | `POST /api/detect` — validates upload, calls `detect()`, returns JSON |
| `backend/app/routes/segmentation.py` | `POST /api/segment` — validates upload, calls `segment()`, returns JSON |
| `backend/app/routes/audio.py` | `POST /api/transcribe` — validates upload, calls `transcribe()`, returns JSON |
| `backend/app/features/object_detection/detector.py` | `detect(image: PIL.Image) → list[dict]` — runs YOLO inference |
| `backend/app/features/segmentation/segmenter.py` | `segment(image: PIL.Image) → list[dict]` — runs YOLOv8n-seg inference |
| `backend/app/features/audio/transcriber.py` | `transcribe(audio_bytes, filename) → dict` — runs Whisper tiny inference |
| `frontend/landing.html` | Home page. Four category cards. Served at `/`. |
| `frontend/image.html` | Image feature page. Served at `/image`. Has back link to `/`. |
| `frontend/audio.html` | Audio feature page. Served at `/audio`. Has back link to `/`. |
| `frontend/index.html` | Legacy file — kept but not actively served. |
| `frontend/static/css/landing.css` | Styles for landing page only |
| `frontend/static/css/style.css` | Styles for image feature page |
| `frontend/static/css/audio.css` | Styles for audio feature page |
| `frontend/static/js/app.js` | Frontend logic for image page: upload, tab switching, API calls, canvas drawing |
| `frontend/static/js/audio.js` | Frontend logic for audio page: upload, custom player, transcript rendering |
| `backend/requirements.txt` | `fastapi`, `uvicorn`, `pillow`, `python-multipart`, `ultralytics`, `openai-whisper` |

## Response contracts

### `/api/transcribe`
```json
{
  "text": "Full transcript string",
  "language": "en",
  "segments": [
    { "start": 0.0, "end": 2.5, "text": "Hello world" }
  ]
}
```

`transcribe()` saves the upload to a temp file (preserving extension for ffmpeg), runs Whisper, then deletes the temp file. Requires `ffmpeg` installed on the system.

### `/api/detect`
```json
{
  "detections": [
    { "label": "str", "confidence": 0.0, "bbox": { "x": 0, "y": 0, "width": 0, "height": 0 } }
  ],
  "image_width": 0,
  "image_height": 0
}
```

### `/api/segment`
```json
{
  "segments": [
    {
      "label": "str",
      "confidence": 0.0,
      "bbox": { "x": 0, "y": 0, "width": 0, "height": 0 },
      "mask": [[x, y], "..."]
    }
  ],
  "image_width": 0,
  "image_height": 0
}
```

`mask` is a polygon contour in original image pixels. The frontend draws it with `ctx.beginPath / moveTo / lineTo / closePath`.

## Models

| File | Model | Used by |
|---|---|---|
| `yolo26n.pt` | Custom YOLOv8n variant | `detector.py` |
| `yolov8n-seg.pt` | YOLOv8n-seg (auto-downloaded on first run) | `segmenter.py` |
| Whisper tiny | Downloaded to `~/.cache/whisper/` on first run (~39 MB) | `transcriber.py` |

All models are loaded once at module level so they are not reloaded per request.

## Frontend logic

### app.js (image page)
- `currentFile` — persists the uploaded file across tab switches
- `currentFeature` — `"detection"` or `"segmentation"`, set by tab clicks
- Tab click: if `currentFile` exists, re-runs the current feature on the same image automatically
- Clear button: resets `currentFile`, hides result section, clears canvas
- `drawDetections()` — draws bounding boxes and label chips on `<canvas id="overlay">`
- `drawSegments()` — draws filled polygon masks and label chips on the same canvas
- Canvas is positioned absolutely over `<img id="preview">` and scaled to match display size

### audio.js (audio page)
- `currentObjectUrl` — object URL for the loaded audio file; revoked on clear
- Audio is playable immediately on upload — transcription runs in parallel
- Custom player built on the HTML5 `<audio>` element (no library)
- `updateProgress()` — updates progress bar fill, thumb position, and time display on `timeupdate`
- Click or drag on `#progress-track` to seek; left/right arrow keys seek ±5s
- Spacebar toggles play/pause when `document.body` is focused
- Segments are rendered as a clickable list — clicking a segment seeks to its start time and plays
- `highlightActiveSegment()` adds `.active` class to the segment matching current playback time

## Conventions

- Image feature modules expose a single function taking `PIL.Image.Image` (already RGB), returning `list[dict]`.
- Audio feature modules take `bytes` + `filename` string, return a `dict`.
- Routes handle all validation (file type, decode errors) and call the feature function.
- CSS version query strings (`?v=N`) are used on `<link>` and `<script>` tags to bust browser cache. Increment `N` whenever you change a JS or CSS file.
- System dependency: `ffmpeg` must be installed for Whisper to decode audio formats.

## How to add a new image feature (e.g. classification)

1. `backend/app/features/classification/classifier.py` — implement `classify(image) → list[dict]`
2. `backend/app/routes/classification.py` — `POST /api/classify`, same pattern as existing routes
3. `backend/app/main.py` — import and register the new router
4. `frontend/image.html` — add a `<button class="tab" data-feature="classification">` tab
5. `frontend/static/js/app.js` — add `runClassification()`, `drawClassification()`, wire into `handleFile()`

## How to add a new audio feature (e.g. classification)

1. `backend/app/features/audio/classifier.py` — implement `classify(audio_bytes, filename) → list[dict]`
2. `backend/app/routes/audio.py` — add a new `POST /api/classify-audio` endpoint
3. `frontend/audio.html` — add a feature tab (same tab pattern as image page)
4. `frontend/static/js/audio.js` — add `runClassification()` and a display function, wire into `handleFile()`

## How to add a new modality (e.g. text)

1. Create `backend/app/features/text/` and `backend/app/routes/text.py`
2. Register the router in `main.py`, add a `GET /text` route returning `text.html`
3. Create `frontend/text.html` and `frontend/static/css/text.css` and `frontend/static/js/text.js`
4. Update the landing page card: change `<div class="card card--soon">` to `<a href="/text" class="card">`, remove the `<span class="badge">` and add `<span class="card-cta">Explore →</span>`

## Running locally

```bash
source .venv/bin/activate
python backend/app/main.py
# → http://localhost:8002
```
