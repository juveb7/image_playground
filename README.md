# Image Playground

Image Playground is a modular computer vision web app built by Abdoul, Juve, and Gio. The project is designed to help the team learn production-style machine learning engineering, prepare for technical interviews, and grow a portfolio-quality application that can continue expanding over time.

Users upload an image in the browser, choose a computer vision feature, and receive visual results such as object detections or segmentation overlays. Under the hood, the app combines a frontend UI, a FastAPI backend, and pluggable model-inference modules.

## Project Vision

This project has three goals:

1. Learn how to build end-to-end ML systems beyond notebooks.
2. Prepare strong interview stories around architecture, experimentation, and deployment.
3. Create a reusable foundation for more advanced image intelligence features.

The project is intentionally structured so each new feature can be added as a focused module while the team gains experience with:

- frontend and backend integration
- API design
- model inference workflows
- image preprocessing and validation
- result visualization
- clean code organization
- collaboration in a team repository

## Team

- Abdoul
- Juve
- Gio

All three contributors are M.S. students in Data Science and AI and are using this project as both a learning platform and a serious portfolio piece.

## Current Scope

The current app already provides the system structure:

- a FastAPI backend
- a browser-based frontend
- upload and preview flow
- feature tabs
- API routes for object detection and segmentation
- frontend rendering for boxes and masks

The main remaining work is implementing the model-backed feature modules and improving the app into a polished interview-ready project.

## Features

- Object detection
- Image segmentation
- Additional CV features planned as the project grows

## Project Structure

```text
image_playground/
├── backend/                  # Python backend (API + ML models)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # App entry point
│   │   ├── routes/           # API route handlers
│   │   └── features/         # Image processing features
│   │       ├── object_detection/
│   │       └── segmentation/
│   └── requirements.txt
├── frontend/                 # Web UI
│   ├── index.html
│   ├── static/
│   │   ├── css/
│   │   └── js/
│   └── templates/
└── uploads/                  # Temporary image storage (gitignored)
```

## Architecture Overview

The app follows a simple end-to-end ML application flow:

1. The user uploads an image in the frontend.
2. The frontend sends the image to a FastAPI route.
3. The backend validates and decodes the image.
4. A feature module runs model inference.
5. The backend returns structured JSON results.
6. The frontend draws predictions on top of the uploaded image.

This structure is useful for interviews because it demonstrates how machine learning systems connect to real product interfaces.

## Getting Started

### Prerequisites

- Python 3.10+

### Setup

```bash
git clone https://github.com/juveb7/image_playground.git
cd image_playground

python -m venv .venv
source .venv/bin/activate

pip install -r backend/requirements.txt

python backend/app/main.py
```

Then open your browser at [http://localhost:5000](http://localhost:5000).

## Usage

1. Open the web app.
2. Upload an image.
3. Select a feature such as object detection or segmentation.
4. Inspect the visual output and result list.

## Team Roadmap

The roadmap is designed around four phases so the team can learn, ship, and prepare strong interview narratives at the same time.

### Phase 1: Foundation and Alignment

Goal: make the current codebase stable and ensure everyone understands the architecture.

Deliverables:

- finalize README and project vision
- agree on coding standards and branch workflow
- make local setup consistent for all team members
- confirm backend routes and frontend flows work end to end
- assign primary ownership areas for each teammate

Interview value:

- explain the overall system design
- describe team collaboration and code organization choices

### Phase 2: Core Feature Completion

Goal: implement the first working CV features cleanly.

Deliverables:

- implement object detection inference
- implement image segmentation inference
- define consistent JSON output contracts
- add input validation and error handling
- test model loading and response behavior

Interview value:

- explain model selection tradeoffs
- discuss inference pipelines and prediction formatting
- talk about quality, latency, and engineering constraints

### Phase 3: Product Quality and Engineering Depth

Goal: make the app look and behave like a serious ML portfolio project.

Deliverables:

- improve frontend polish and UX
- add better loading states and error messages
- introduce basic test coverage
- document API behavior and assumptions
- improve performance where needed
- support cleaner configuration for ports, models, and environments

Interview value:

- discuss production-readiness considerations
- show that the team thought about maintainability and user experience
- demonstrate debugging and software engineering maturity

### Phase 4: Expansion and Differentiation

Goal: grow the app into a stronger portfolio and learning platform.

Possible feature additions:

- image classification
- OCR
- image captioning
- edge detection
- depth estimation
- model comparison mode
- upload history or saved results

Interview value:

- shows extensible system design
- creates stronger project depth for resume and portfolio discussions

## Suggested Team Ownership

The team should still collaborate across the stack, but assigning primary areas will help execution.

- Abdoul: model experimentation, feature implementation, evaluation, technical writeups
- Juve: backend integration, API contracts, application structure, infra cleanup
- Gio: frontend UX, visualization, user flow, presentation polish

This is only a starting point. Everyone should still understand the full pipeline and be able to explain it.

## Working Style

To get the most value from the project, the team should work in a way that supports both learning and shipping:

- keep each feature small and demoable
- use issues or a lightweight task board
- create short-lived branches for focused work
- review each other’s code
- document why technical decisions were made
- track interview stories while building

## Recommended Milestones

### Milestone 1: MVP Demo

- app runs locally for all teammates
- object detection works end to end
- frontend correctly renders boxes and labels
- README clearly explains the project

### Milestone 2: Multi-Feature Demo

- segmentation works end to end
- feature tabs are stable
- error handling is improved
- sample demo images are ready

### Milestone 3: Portfolio Quality

- tests added for key API behaviors
- UX improvements completed
- project is polished enough for GitHub and interviews
- each teammate can explain their contributions clearly

### Milestone 4: Advanced Extension

- one differentiated feature added beyond the basics
- architecture remains modular
- project story is strong enough for resumes, interviews, and demos

## Near-Term Task Breakdown

These are the highest-value next steps for the team:

1. Implement `detect()` in `backend/app/features/object_detection/detector.py`.
2. Implement `segment()` in `backend/app/features/segmentation/segmenter.py`.
3. Add model dependencies and document setup clearly.
4. Improve frontend messaging for loading and failures.
5. Add API and feature tests.
6. Add one polished demo workflow for interviews.

## How To Talk About This Project In Interviews

This project is strongest when described as an end-to-end ML engineering system, not just a vision demo.

Good framing:

> We built a modular computer vision playground to practice full-stack ML engineering. The frontend handles image upload and visualization, the FastAPI backend exposes feature-specific inference routes, and each CV capability is implemented as a pluggable backend module. We used the project to learn how to structure production-style ML applications, collaborate as a team, and build strong examples for interviews.

## Future Enhancements

- model versioning
- benchmarking different vision backbones
- async/background processing for heavier models
- cloud deployment
- authentication and saved user sessions
- observability and request logging
