"""Shared class label configuration (alphabetical ImageDataGenerator order)."""

from __future__ import annotations

# Keras ImageDataGenerator sorts folder names alphabetically:
# 0 → glioma, 1 → meningioma, 2 → notumor, 3 → pituitary
CLASS_FOLDERS = ["glioma", "meningioma", "notumor", "pituitary"]

CLASS_INDEX = {name: idx for idx, name in enumerate(CLASS_FOLDERS)}

DISPLAY_NAMES = {
    "glioma": "Glioma",
    "meningioma": "Meningioma",
    "notumor": "No Tumor",
    "pituitary": "Pituitary Adenoma",
}

SEVERITY = {
    "glioma": "High",
    "meningioma": "Medium",
    "notumor": "None",
    "pituitary": "Low-Medium",
}

# API probability keys (4 trained + 5 padded zeros)
PROBABILITY_KEYS = [
    "Glioma",
    "Meningioma",
    "No Tumor",
    "Pituitary Adenoma",
    "Medulloblastoma",
    "Ependymoma",
    "Acoustic Neuroma",
    "Primary CNS Lymphoma",
    "Metastatic Tumor",
]

CONFIDENCE_THRESHOLD = 40.0
