# AI Playground

AI Playground is a modular, multi-modal AI web app built by Abdoul, Juve, and Gio. Users land on a category page, choose a modality (image, video, audio, or text), and interact with AI-powered features entirely in the browser. Under the hood the app combines a static frontend, a FastAPI backend, and pluggable model-inference modules.

The project is designed to help the team learn production-style machine learning engineering, prepare for technical interviews, and grow a portfolio-quality application that can continue expanding over time.

## Team

- Abdoul — model experimentation, feature implementation, evaluation, technical writeups
- Juve — backend integration, API contracts, application structure, infrastructure
- Gio — frontend UX, visualization, user flow, presentation polish

All three are M.S. students in Data Science and AI using this project as both a learning platform and a serious portfolio piece.

## Live Features

### Image

| Feature | Model | Status |
|---|---|---|
| Object Detection | YOLOv8n (`yolo26n.pt`) | ✅ Working |
| Segmentation | YOLOv8n-seg (`yolov8n-seg.pt`) | ✅ Working |

### Audio

| Feature | Model | Status |
|---|---|---|
| Speech-to-Text | Whisper tiny (~39 MB, auto-downloaded) | ✅ Working |

### Coming Soon

- **Video** — object tracking, action recognition
- **Audio** — audio classification
- **Text** — sentiment analysis, NER, summarization

## Project Structure

```
ai_playground/
├── backend/
│   ├── app/
│   │   ├── main.py                        # FastAPI app, route registration, static file serving
│   │   ├── routes/
│   │   │   ├── object_detection.py        # POST /api/detect
│   │   │   ├── segmentation.py            # POST /api/segment
│   │   │   └── audio.py                   # POST /api/transcribe
│   │   └── features/
│   │       ├── object_detection/
│   │       │   └── detector.py            # detect(image) → list[dict]
│   │       ├── segmentation/
│   │       │   └── segmenter.py           # segment(image) → list[dict]
│   │       └── audio/
│   │           └── transcriber.py         # transcribe(bytes, filename) → dict
│   └── requirements.txt
├── frontend/
│   ├── landing.html                       # Category picker (/, home page)
│   ├── image.html                         # Image feature page (/image)
│   ├── audio.html                         # Audio feature page (/audio)
│   ├── index.html                         # Legacy — kept for reference
│   └── static/
│       ├── css/
│       │   ├── landing.css                # Landing page styles
│       │   ├── style.css                  # Image page styles
│       │   └── audio.css                  # Audio page styles
│       └── js/
│           ├── app.js                     # Frontend logic for image page
│           └── audio.js                   # Frontend logic for audio page
├── uploads/                               # Temporary image storage (gitignored)
├── yolo26n.pt                             # Object detection model weights
└── yolov8n-seg.pt                         # Segmentation model weights (auto-downloaded)
```

## Architecture

```
Browser → FastAPI → feature module → model inference → JSON response → canvas overlay
```

1. User uploads an image on the frontend.
2. Frontend POSTs it to a FastAPI route (`/api/detect` or `/api/segment`).
3. The route calls the relevant feature module (`detect()` or `segment()`).
4. The module runs inference and returns structured JSON.
5. The frontend draws bounding boxes or segmentation masks on a canvas overlay.

Each feature is a self-contained module with a single function signature. Adding a new feature means adding a route file and a feature directory — nothing else needs to change.

## Getting Started

**Prerequisites:** Python 3.10+, and `ffmpeg` installed on your system (required by Whisper for audio decoding).

Install ffmpeg if you don't have it:
- **macOS:** `brew install ffmpeg`
- **Ubuntu/Debian:** `sudo apt install ffmpeg`
- **Windows:** download from [ffmpeg.org](https://ffmpeg.org/download.html)

```bash
git clone https://github.com/juveb7/image_playground.git
cd image_playground

python -m venv .venv
source .venv/bin/activate

pip install -r backend/requirements.txt

python backend/app/main.py
```

Open your browser at `http://localhost:8002`.

On first run, models are downloaded automatically:
- `yolov8n-seg.pt` — ~6 MB, downloaded by `ultralytics`
- Whisper tiny — ~39 MB, downloaded to `~/.cache/whisper/`

## API Reference

### `POST /api/transcribe`

Transcribes speech in an uploaded audio file using Whisper tiny.

**Request:** `multipart/form-data` with a `file` field (MP3, WAV, M4A, OGG, FLAC).

**Response:**
```json
{
  "text": "Full transcript of the audio.",
  "language": "en",
  "segments": [
    { "start": 0.0, "end": 2.5, "text": "Full transcript" }
  ]
}
```

### `POST /api/detect`

Runs object detection on an uploaded image.

**Request:** `multipart/form-data` with a `file` field (JPEG, PNG, or WebP).

**Response:**
```json
{
  "detections": [
    {
      "label": "person",
      "confidence": 0.91,
      "bbox": { "x": 10, "y": 20, "width": 100, "height": 200 }
    }
  ],
  "image_width": 1280,
  "image_height": 720
}
```

### `POST /api/segment`

Runs instance segmentation on an uploaded image.

**Request:** `multipart/form-data` with a `file` field (JPEG, PNG, or WebP).

**Response:**
```json
{
  "segments": [
    {
      "label": "cat",
      "confidence": 0.87,
      "bbox": { "x": 10, "y": 20, "width": 100, "height": 200 },
      "mask": [[x1, y1], [x2, y2], "..."]
    }
  ],
  "image_width": 640,
  "image_height": 480
}
```

`mask` is a polygon contour in original image pixels. The frontend closes the path automatically.

## Adding a New Feature

1. Create `backend/app/features/<name>/<name>.py` with a single entry-point function.
2. Create `backend/app/routes/<name>.py` with a FastAPI router and one POST endpoint.
3. Register the router in `backend/app/main.py`.
4. Add frontend handling in `app.js` (a new `run<Name>()` function and a `draw<Name>()` function).
5. Add a tab button in `image.html` and wire it to the new feature string.

## Roadmap

### Phase 1 — Foundation ✅
- Project structure, FastAPI backend, frontend upload flow
- Object detection end-to-end
- Segmentation end-to-end
- Multi-category landing page
- Audio transcription with Whisper (custom player: play/pause, seek, segment timestamps)

### Phase 2 — Polish & Testing
- Unit tests for all API routes (`/api/detect`, `/api/segment`, `/api/transcribe`)
- Unit tests for feature modules (`detector.py`, `segmenter.py`, `transcriber.py`)
- Integration tests with sample fixtures (image, audio)
- Improve error messages and loading states on the frontend
- Performance improvements (async inference, model caching)
- Image classification tab (easy win — YOLO supports it natively)

### Phase 3 — New Modalities
- **Audio** — audio classification (environmental sounds, music genre)
- **Text** — sentiment analysis and NER with a small HuggingFace model; summarization
- **Video** — object tracking with YOLOv8 across frames; action recognition
- Unit tests for each new feature module as it ships

### Phase 4 — Production Quality
- Cloud deployment (render or HuggingFace Spaces)
- Model versioning and benchmarking
- Async/background processing for heavier models (video, large audio)
- Observability and request logging

## Interview Framing

> We built a modular, multi-modal AI playground to practice full-stack ML engineering. The frontend handles upload, feature selection, and result visualization. The FastAPI backend exposes pluggable inference routes — each feature is a self-contained module so new capabilities can be added without touching existing code. We used the project to learn how to structure production-style ML applications, collaborate as a team, and build concrete examples for interviews.

Strong talking points:
- **System design:** modular inference pipeline, clean separation of frontend/backend/model layers
- **Model selection:** why YOLOv8n for speed vs. accuracy tradeoffs
- **Engineering depth:** JSON contracts between backend and frontend, canvas-based visualization, error handling
- **Extensibility:** how the architecture supports adding video, audio, and text without refactoring
