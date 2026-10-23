"""Detect waste objects in one camera frame and print normalized boxes as JSON."""
import json
import os
import sys

import cv2
from ultralytics import YOLO


def main(image_path: str) -> None:
    model_path = os.environ.get(
        "WASTE_MODEL_PATH",
        r"C:\Users\pavan\OneDrive\Desktop\trash-segration\runs\detect\train\weights\best.pt",
    )
    frame = cv2.imread(image_path)
    if frame is None:
        raise RuntimeError("Could not read camera frame.")
    height, width = frame.shape[:2]
    result = YOLO(model_path).predict(frame, conf=0.05, verbose=False)[0]
    detections = []
    if result.boxes is not None:
        for class_id, confidence, (x1, y1, x2, y2) in zip(
            result.boxes.cls.int().cpu().tolist(),
            result.boxes.conf.cpu().tolist(),
            result.boxes.xyxy.cpu().tolist(),
        ):
            detections.append({
                "classId": int(class_id),
                "confidence": round(float(confidence), 4),
                "box": {
                    "x": max(0, x1 / width), "y": max(0, y1 / height),
                    "width": min(1, (x2 - x1) / width), "height": min(1, (y2 - y1) / height),
                },
            })
    print(json.dumps({"detections": detections}))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: detect_image.py IMAGE")
    main(sys.argv[1])
