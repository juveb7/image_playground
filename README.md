# Image Playground

A web application for exploring and learning about image data. Upload an image and apply various computer vision features — starting with object detection.

## Features

- **Object Detection** — upload an image and get bounding boxes + labels for detected objects
- More features coming soon...

## Project Structure

```
image_playground/
├── backend/                  # Python backend (API + ML models)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # App entry point
│   │   ├── routes/           # API route handlers
│   │   └── features/         # Image processing features
│   │       └── object_detection/
│   └── requirements.txt
├── frontend/                 # Web UI
│   ├── index.html
│   ├── static/
│   │   ├── css/
│   │   └── js/
│   └── templates/
└── uploads/                  # Temporary image storage (gitignored)
```

## Getting Started

### Prerequisites

- Python 3.10+

### Setup

```bash
# Clone the repo
git clone https://github.com/juveb7/image_playground.git
cd image_playground

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Run the app
python backend/app/main.py
```

Then open your browser at `http://localhost:5000`.

## Usage

1. Open the web app
2. Upload an image using the file picker
3. Select a feature (e.g. Object Detection)
4. View the results overlaid on your image

## Roadmap

- [x] Project scaffolding
- [ ] Object detection (YOLO / torchvision)
- [ ] Image segmentation
- [ ] Image classification
- [ ] Edge detection
- [ ] Depth estimation
