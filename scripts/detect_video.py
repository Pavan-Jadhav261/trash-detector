"""Run the locally trained YOLO model over a video and emit browser-playable output."""
import json
import os
import shutil
import subprocess
import sys

import cv2
import numpy as np
from ultralytics import YOLO


def main(input_path: str, output_path: str, report_path: str) -> None:
    model_path = os.environ.get(
        "WASTE_MODEL_PATH",
        r"C:\Users\pavan\OneDrive\Desktop\trash-segration\runs\detect\train\weights\best.pt",
    )
    model = YOLO(model_path)
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        raise RuntimeError("Could not open the uploaded video.")

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    temp_path = output_path + ".intermediate.mp4"
    writer = cv2.VideoWriter(temp_path, cv2.VideoWriter_fourcc(*"mp4v"), fps, (width, height))
    if not writer.isOpened():
        raise RuntimeError("Could not create the annotated video.")

    # The source is a controlled single-item feed. A visual scene transition
    # starts the next item, so each item gets one best-confidence YOLO label.
    items: dict[int, dict] = {}
    frame_index = 0
    item_index = 0
    previous_thumbnail = None
    last_scene_change = -999
    scene_threshold = 10
    scene_cooldown_frames = max(4, int(fps * 0.35))
    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            thumbnail = cv2.resize(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY), (64, 48))
            if previous_thumbnail is not None:
                change = float(np.mean(cv2.absdiff(thumbnail, previous_thumbnail)))
                if change >= scene_threshold and frame_index - last_scene_change >= scene_cooldown_frames:
                    item_index += 1
                    last_scene_change = frame_index
            previous_thumbnail = thumbnail
            result = model.predict(frame, conf=0.05, verbose=False)[0]
            writer.write(result.plot())
            boxes = result.boxes
            if boxes is not None and len(boxes) > 0:
                classes = boxes.cls.int().cpu().tolist()
                confidences = boxes.conf.cpu().tolist()
                coordinates = boxes.xyxy.cpu().tolist()
                for class_id, confidence, (x1, y1, x2, y2) in zip(classes, confidences, coordinates):
                    record = items.get(item_index)
                    if record is None or confidence > record["confidence"]:
                        items[item_index] = {
                            "id": f"item-{item_index + 1:03d}", "classId": int(class_id), "trueClassId": int(class_id),
                            "confidence": round(float(confidence), 4), "appearAt": round(frame_index / fps, 3),
                            "disappearAt": round(frame_index / fps, 3),
                            "box": {"xStart": max(0, x1 / width), "xEnd": max(0, x1 / width),
                                    "y": max(0, y1 / height), "width": min(1, (x2 - x1) / width),
                                    "height": min(1, (y2 - y1) / height)},
                        }
            frame_index += 1
    finally:
        cap.release()
        writer.release()

    ffmpeg = shutil.which("ffmpeg") or r"C:\Users\pavan\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-full_build\bin\ffmpeg.exe"
    subprocess.run([ffmpeg, "-y", "-i", temp_path, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", output_path], check=True, capture_output=True)
    os.remove(temp_path)

    detections = [items[index] for index in sorted(items)]
    for detection in detections:
        detection["decisionAt"] = round((detection["appearAt"] + detection["disappearAt"]) / 2, 3)
    with open(report_path, "w", encoding="utf-8") as report:
        json.dump({"detections": detections, "sampledFrames": frame_index, "samplingFps": fps}, report)


if __name__ == "__main__":
    if len(sys.argv) != 4:
        raise SystemExit("Usage: detect_video.py INPUT OUTPUT REPORT")
    main(*sys.argv[1:])
