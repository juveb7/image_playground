from __future__ import annotations
from PIL import Image
from ultralytics import YOLO

_model = YOLO("yolov8n-seg.pt")


def segment(image: Image.Image) -> list[dict]:
    results = _model(image)[0]
    out = []
    if results.masks is None:
        return out
    for mask_xy, box in zip(results.masks.xy, results.boxes):
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        out.append({
            "label":      results.names[int(box.cls)],
            "confidence": float(box.conf),
            "bbox": {
                "x":      int(x1),
                "y":      int(y1),
                "width":  int(x2 - x1),
                "height": int(y2 - y1),
            },
            "mask": [[int(x), int(y)] for x, y in mask_xy.tolist()],
        })
    return out
