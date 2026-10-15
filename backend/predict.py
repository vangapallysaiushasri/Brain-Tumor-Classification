"""
Standalone TensorFlow prediction for debugging.

Usage:
  python predict.py --image path/to/test_image.jpg
"""

from __future__ import annotations

import argparse
import json
import os
import random

import numpy as np
import tensorflow as tf
from PIL import Image

from labels import CLASS_FOLDERS, DISPLAY_NAMES, SEVERITY

tf.random.set_seed(42)
np.random.seed(42)
random.seed(42)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "brain_tumor_model.h5")
INDICES_PATH = os.path.join(BASE_DIR, "models", "class_indices.json")
IMAGE_SIZE = (224, 224)


def load_class_indices() -> dict[str, int]:
    if os.path.exists(INDICES_PATH):
        with open(INDICES_PATH, encoding="utf-8") as f:
            return json.load(f)
    return {name: idx for idx, name in enumerate(CLASS_FOLDERS)}


def preprocess(image_path: str) -> np.ndarray:
    img = Image.open(image_path).convert("RGB")
    img = img.resize(IMAGE_SIZE, Image.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True)
    args = parser.parse_args()

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

    class_indices = load_class_indices()
    inv = {v: k for k, v in class_indices.items()}
    model = tf.keras.models.load_model(MODEL_PATH)

    batch = preprocess(args.image)
    preds = model.predict(batch, verbose=0)[0]
    idx = int(np.argmax(preds))
    folder = inv.get(idx, CLASS_FOLDERS[idx])
    confidence = float(preds[idx] * 100.0)

    result = {
        "tumor_type": DISPLAY_NAMES[folder],
        "confidence": round(confidence, 2),
        "severity": SEVERITY[folder],
        "class_index": idx,
        "folder": folder,
        "raw_predictions": [round(float(p) * 100, 2) for p in preds],
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
