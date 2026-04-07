from __future__ import annotations
from PIL import Image


def detect(image: Image.Image) -> list[dict]:
    """
    Run object detection on a PIL image and return a list of detections.

    This is the only function you need to implement. The rest of the pipeline
    (HTTP endpoint, frontend drawing) is already wired up and expects this
    exact return format.

    Parameters
    ----------
    image : PIL.Image.Image
        The uploaded image, already converted to RGB.

    Returns
    -------
    list[dict]
        Each dict represents one detected object and must have these keys:

        {
            "label":      str,    # human-readable class name, e.g. "cat"
            "confidence": float,  # score between 0.0 and 1.0
            "bbox": {
                "x":      int,    # left edge in original image pixels
                "y":      int,    # top edge in original image pixels
                "width":  int,    # box width in original image pixels
                "height": int,    # box height in original image pixels
            }
        }

        Return an empty list [] if no objects are detected.

    Implementation notes
    --------------------
    - image.size gives you (width, height) if you need the image dimensions.
    - Load your model once at module level (outside this function) so it isn't
      reloaded on every request.
    - If your model returns xyxy coordinates (x1, y1, x2, y2), convert like:
          "x": x1, "y": y1, "width": x2 - x1, "height": y2 - y1

    Example with ultralytics YOLO
    ------------------------------
        from ultralytics import YOLO

        _model = YOLO("yolov8n.pt")   # loads once at startup

        def detect(image: Image.Image) -> list[dict]:
            results = _model(image)[0]
            out = []
            for box in results.boxes:
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
                })
            return out

    Example with torchvision Faster R-CNN
    --------------------------------------
        import torch
        import torchvision
        from torchvision.transforms.functional import to_tensor

        _model = torchvision.models.detection.fasterrcnn_resnet50_fpn(pretrained=True)
        _model.eval()

        COCO_LABELS = [...]  # 91-class COCO label list

        def detect(image: Image.Image) -> list[dict]:
            tensor = to_tensor(image).unsqueeze(0)
            with torch.no_grad():
                predictions = _model(tensor)[0]
            out = []
            for box, label, score in zip(
                predictions["boxes"], predictions["labels"], predictions["scores"]
            ):
                if score < 0.5:
                    continue
                x1, y1, x2, y2 = box.tolist()
                out.append({
                    "label":      COCO_LABELS[label],
                    "confidence": float(score),
                    "bbox": {
                        "x":      int(x1),
                        "y":      int(y1),
                        "width":  int(x2 - x1),
                        "height": int(y2 - y1),
                    },
                })
            return out
    """
    # TODO: implement object detection here
    raise NotImplementedError("Implement detect() in this file.")
