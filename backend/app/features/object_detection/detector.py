from __future__ import annotations

from PIL import Image
from ultralytics import YOLO

_model = YOLO("yolo26n.pt")


def detect(image: Image.Image) -> list[dict]:
    results = _model(image)[0]
    out = []

    for box in results.boxes:
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        cls_id = int(box.cls[0])
        conf = float(box.conf[0])

        out.append(
            {
                "label": results.names[cls_id],
                "confidence": conf,
                "bbox": {
                    "x": int(x1),
                    "y": int(y1),
                    "width": int(x2 - x1),
                    "height": int(y2 - y1),
                },
            }
        )
    return out
