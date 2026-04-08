from __future__ import annotations
from PIL import Image


def segment(image: Image.Image) -> list[dict]:
    """
    Run image segmentation on a PIL image and return a list of segments.

    This is the only function you need to implement. The HTTP endpoint and
    frontend mask drawing are already wired up and expect this exact return format.

    Parameters
    ----------
    image : PIL.Image.Image
        The uploaded image, already converted to RGB.

    Returns
    -------
    list[dict]
        Each dict represents one detected segment and must have these keys:

        {
            "label":      str,    # human-readable class name, e.g. "cat"
            "confidence": float,  # score between 0.0 and 1.0
            "bbox": {
                "x":      int,    # left edge in original image pixels
                "y":      int,    # top edge in original image pixels
                "width":  int,    # box width in original image pixels
                "height": int,    # box height in original image pixels
            },
            "mask": [[x1, y1], [x2, y2], ...]
                # Polygon contour of the segment in original image pixels.
                # Each element is a two-element list [x, y].
                # The frontend closes the path automatically, so you don't
                # need to repeat the first point at the end.
        }

        Return an empty list [] if nothing is detected.

    Implementation notes
    --------------------
    - Load your model once at module level (outside this function) so it isn't
      reloaded on every request. Example:
          _model = YOLO("yolov8n-seg.pt")
    - The recommended lightweight model is YOLOv8n-seg (~6 MB download on first run).
      Install it with: pip install ultralytics
      Then add "ultralytics" to backend/requirements.txt.
    - The mask field must be a list of [x, y] polygon points, NOT a binary mask array.
      ultralytics gives you these directly via results.masks.xy (one numpy array per segment).

    Example with ultralytics YOLOv8n-seg (lightest available option)
    -----------------------------------------------------------------
        from ultralytics import YOLO

        _model = YOLO("yolov8n-seg.pt")  # loads once at startup

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
    """
    # TODO: implement segmentation here
    raise NotImplementedError("Implement segment() in this file.")
