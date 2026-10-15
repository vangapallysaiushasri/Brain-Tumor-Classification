"""
Neuro-XAI Flask API — brain tumor classification (TensorFlow/Keras).

Class order (alphabetical): glioma(0), meningioma(1), notumor(2), pituitary(3)
"""

import io
import json
import os
import random
import socket
import traceback
import uuid
from datetime import datetime

import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

import tensorflow as tf
from tensorflow.keras.applications.efficientnet import preprocess_input

from labels import (
    CLASS_FOLDERS,
    CONFIDENCE_THRESHOLD,
    DISPLAY_NAMES,
    PROBABILITY_KEYS,
    SEVERITY,
)

tf.random.set_seed(42)
np.random.seed(42)
random.seed(42)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODELS_DIR, "brain_tumor_model.h5")
CLASS_INDICES_PATH = os.path.join(MODELS_DIR, "class_indices.json")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
IMAGE_SIZE = (224, 224)
GRADCAM_LAYER_NAME = "top_conv"

EXPECTED_CLASS_INDICES = {
    "glioma": 0,
    "meningioma": 1,
    "notumor": 2,
    "pituitary": 3,
}

app = Flask(__name__)
CORS(
    app,
    origins=["*"],
    allow_headers=["Content-Type", "Accept"],
    methods=["GET", "POST", "OPTIONS"],
)

model = None
class_indices: dict[str, int] = {}
CLASS_NAMES: dict[int, str] = {}


@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Accept")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return response


def log_request_details() -> None:
    print(f"[DEBUG] Content-Type: {request.content_type}")
    print(f"[DEBUG] request.files keys: {list(request.files.keys())}")
    print(f"[DEBUG] request.form keys: {list(request.form.keys())}")
    print(f"[DEBUG] request.is_json: {request.is_json}")


def get_uploaded_file():
    log_request_details()
    file_obj = request.files.get("file") or request.files.get("image")
    if file_obj is None:
        return None, 'No file uploaded. Send multipart/form-data with key "file" (or "image")'
    if file_obj.filename == "":
        return None, "Empty filename"
    return file_obj, None


def load_class_indices() -> dict[str, int]:
    if not os.path.exists(CLASS_INDICES_PATH):
        print(f"WARN: {CLASS_INDICES_PATH} not found — using default order")
        return dict(EXPECTED_CLASS_INDICES)

    with open(CLASS_INDICES_PATH, encoding="utf-8") as f:
        data = json.load(f)

    if data != EXPECTED_CLASS_INDICES:
        print("WARN: class_indices.json mismatch!")
        print(f"  Expected: {EXPECTED_CLASS_INDICES}")
        print(f"  Got:      {data}")
        print("  Retrain with: python train_model.py")

    print(f"Loaded class indices: {data}")
    return data


def load_brain_model() -> None:
    global model, class_indices, CLASS_NAMES

    class_indices = load_class_indices()
    CLASS_NAMES = {v: k for k, v in class_indices.items()}

    if not os.path.exists(MODEL_PATH):
        print(f"ERROR: Model not found at {MODEL_PATH}")
        print("Run python train_model.py first!")
        model = None
        return

    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        print(f"Model loaded: {model.input_shape}")
    except Exception as e:
        print(f"ERROR loading model: {e}")
        model = None


def index_to_folder(idx: int) -> str:
    return CLASS_NAMES.get(idx, CLASS_FOLDERS[idx])


def preprocess_image_bytes(image_bytes: bytes) -> np.ndarray:
    """Must match training: RGB, LANCZOS resize, EfficientNet preprocess_input."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMAGE_SIZE, Image.LANCZOS)
    img_array = np.array(img, dtype=np.float32)
    img_array = preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0)
    assert img_array.shape == (1, 224, 224, 3), f"Bad shape: {img_array.shape}"
    return img_array


def build_probabilities(preds: np.ndarray) -> dict[str, float]:
    probs = {key: 0.0 for key in PROBABILITY_KEYS}
    for folder, idx in class_indices.items():
        display = DISPLAY_NAMES.get(folder, folder)
        if display in probs:
            probs[display] = round(float(preds[idx] * 100.0), 1)
    return probs


def build_result_payload(
    raw: np.ndarray,
    filename: str,
    heatmap: str | None = None,
    heatmap_error: str | None = None,
) -> dict:
    class_idx = int(np.argmax(raw))
    confidence = float(raw[class_idx] * 100.0)
    folder = index_to_folder(class_idx)
    probabilities = build_probabilities(raw)
    tumor_type = DISPLAY_NAMES[folder]
    severity = SEVERITY[folder]
    message = None
    original_prediction = None
    original_confidence = None

    if confidence < CONFIDENCE_THRESHOLD:
        original_prediction = tumor_type
        original_confidence = confidence
        tumor_type = "Unclassified/Rare Tumor"
        severity = "None"
        message = (
            f"Low confidence ({confidence:.1f}%). "
            f"Model suggestion: {original_prediction}."
        )

    return {
        "predicted_class": class_idx,
        "predicted_label": tumor_type,
        "tumor_type": tumor_type,
        "confidence": round(confidence, 1),
        "severity": severity,
        "probabilities": probabilities,
        "filename": filename,
        "model_loaded": True,
        "model_classes": CLASS_FOLDERS,
        "all_tumor_types": PROBABILITY_KEYS,
        "message": message,
        "original_prediction": original_prediction,
        "original_confidence": original_confidence,
        "unclassified": confidence < CONFIDENCE_THRESHOLD,
        "no_tumor_probability": probabilities.get("No Tumor", 0.0),
        "heatmap": heatmap,
        "heatmap_error": heatmap_error,
    }


def run_prediction(image_bytes: bytes, filename: str) -> tuple[dict, int]:
    if model is None:
        return {"error": "Model not loaded", "model_loaded": False}, 503

    batch = preprocess_image_bytes(image_bytes)
    print(f"[DEBUG] Input shape: {batch.shape}")

    raw = model.predict(batch, verbose=0)[0]
    print(f"[DEBUG] Raw predictions: {raw}")
    result = build_result_payload(raw, filename)
    folder = index_to_folder(int(result["predicted_class"]))
    print(f"[DEBUG] Class index: {result['predicted_class']} ({folder})")
    print(f"[DEBUG] Confidence: {result['confidence']:.2f}%")
    print(f"[DEBUG] Probabilities: {result['probabilities']}")
    return result, 200


def create_gradcam_heatmap(image_bytes: bytes, class_index: int) -> tuple[str | None, str | None]:
    if model is None:
        return None, "Model not loaded"

    try:
        backbone = model.get_layer("efficientnetb0")
        batch = preprocess_image_bytes(image_bytes)

        with tf.GradientTape() as tape:
            conv_outputs = backbone(batch, training=False)
            tape.watch(conv_outputs)
            x = conv_outputs
            for layer_name in ["global_average_pooling2d", "dropout", "dense", "dropout_1", "dense_1"]:
                layer = model.get_layer(layer_name)
                if layer.__class__.__name__ == "Dropout":
                    x = layer(x, training=False)
                else:
                    x = layer(x)
            predictions = x
            target_index = int(class_index)
            target_score = predictions[:, target_index]

        grads = tape.gradient(target_score, conv_outputs)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        conv_outputs = conv_outputs[0]

        heatmap = tf.reduce_sum(conv_outputs * pooled_grads, axis=-1)
        heatmap = tf.maximum(heatmap, 0)
        heatmap /= tf.reduce_max(heatmap) + tf.keras.backend.epsilon()
        heatmap = heatmap.numpy()
        heatmap = np.squeeze(heatmap)

        if heatmap.ndim != 2:
            raise ValueError(f"Unexpected heatmap shape: {heatmap.shape}")

        threshold = np.percentile(heatmap, 82)
        heatmap = np.where(heatmap >= threshold, heatmap, 0.0)
        max_value = float(np.max(heatmap))
        if max_value > 0:
            heatmap = heatmap / max_value
        heatmap = np.power(heatmap, 0.65)

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        heatmap_mask = Image.fromarray(
            np.uint8(heatmap * 255),
            mode="L",
        ).resize(image.size, Image.BILINEAR).filter(ImageFilter.GaussianBlur(radius=7))
        heatmap_rgb = Image.fromarray(jet_colormap(np.array(heatmap_mask)), mode="RGB")
        colored_heatmap = heatmap_rgb.convert("RGBA")
        colored_heatmap.putalpha(heatmap_mask.point(lambda value: min(255, int(value * 3.3))))

        base_gray = ImageOps.grayscale(image)
        base_gray = ImageEnhance.Brightness(base_gray).enhance(0.82)
        base_gray = ImageEnhance.Contrast(base_gray).enhance(1.20)
        base_image = Image.merge("RGBA", (base_gray, base_gray, base_gray, Image.new("L", image.size, 255)))

        overlay = Image.alpha_composite(base_image, colored_heatmap).convert("RGB")

        buffer = io.BytesIO()
        overlay.save(buffer, format="PNG")
        return base64_encode(buffer.getvalue()), None
    except Exception as exc:
        print(f"[WARN] Grad-CAM generation failed: {exc}")
        print(traceback.format_exc())
        return None, str(exc)


def base64_encode(payload: bytes) -> str:
    import base64

    return base64.b64encode(payload).decode("utf-8")


def jet_colormap(gray: np.ndarray) -> np.ndarray:
    normalized = np.clip(gray.astype(np.float32) / 255.0, 0.0, 1.0)
    red = np.clip(1.5 - np.abs(4.0 * normalized - 3.0), 0.0, 1.0)
    green = np.clip(1.5 - np.abs(4.0 * normalized - 2.0), 0.0, 1.0)
    blue = np.clip(1.5 - np.abs(4.0 * normalized - 1.0), 0.0, 1.0)
    rgb = np.stack([red, green, blue], axis=-1)
    return (rgb * 255).astype(np.uint8)


def simple_slic(img_np, num_segments=50, compactness=15.0, max_iter=4):
    H, W, C = img_np.shape
    S = int(np.sqrt((H * W) / num_segments))
    
    centers = []
    for y in range(S // 2, H, S):
        for x in range(S // 2, W, S):
            centers.append([y, x, img_np[y, x, 0], img_np[y, x, 1], img_np[y, x, 2]])
    centers = np.array(centers, dtype=np.float32)
    K = len(centers)
    
    labels = -1 * np.ones((H, W), dtype=np.int32)
    distances = np.full((H, W), np.inf, dtype=np.float32)
    
    for _ in range(max_iter):
        distances.fill(np.inf)
        for i in range(K):
            cy, cx = int(centers[i, 0]), int(centers[i, 1])
            y_min, y_max = max(0, cy - S), min(H, cy + S)
            x_min, x_max = max(0, cx - S), min(W, cx + S)
            
            crop_img = img_np[y_min:y_max, x_min:x_max]
            crop_dist_c = np.sum((crop_img - centers[i, 2:])**2, axis=-1)
            
            yy, xx = np.ogrid[y_min:y_max, x_min:x_max]
            crop_dist_s = (yy - cy)**2 + (xx - cx)**2
            
            crop_dist = crop_dist_c + (compactness / S)**2 * crop_dist_s
            
            mask = crop_dist < distances[y_min:y_max, x_min:x_max]
            distances[y_min:y_max, x_min:x_max][mask] = crop_dist[mask]
            labels[y_min:y_max, x_min:x_max][mask] = i
            
        for i in range(K):
            mask = (labels == i)
            if np.any(mask):
                y_idx, x_idx = np.where(mask)
                centers[i, 0] = np.mean(y_idx)
                centers[i, 1] = np.mean(x_idx)
                centers[i, 2:] = np.mean(img_np[mask], axis=0)
    return labels


def create_lime_explanation(image_bytes: bytes, class_index: int) -> tuple[str | None, str | None]:
    if model is None:
        return None, "Model not loaded"
    try:
        img_orig = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_resized = img_orig.resize(IMAGE_SIZE, Image.LANCZOS)
        img_np = np.array(img_resized, dtype=np.float32)
        
        labels = simple_slic(img_np, num_segments=50, compactness=15.0, max_iter=4)
        K = int(np.max(labels)) + 1
        
        num_samples = 120
        perturbations = np.random.binomial(1, 0.5, size=(num_samples, K))
        perturbations[0, :] = 1
        
        perturbed_batch = []
        for i in range(num_samples):
            mask_vector = perturbations[i]
            perturbed_img = img_np.copy()
            keep_mask = mask_vector[labels].astype(bool)
            perturbed_img[~keep_mask] = 0.0
            perturbed_preprocessed = preprocess_input(perturbed_img)
            perturbed_batch.append(perturbed_preprocessed)
            
        perturbed_batch = np.array(perturbed_batch, dtype=np.float32)
        
        preds = model.predict(perturbed_batch, batch_size=32, verbose=0)
        y = preds[:, class_index]
        
        distances = np.sum(perturbations != 1, axis=1) / K
        kernel_width = 0.25
        weights = np.exp(-distances / kernel_width)
        
        X = perturbations
        XTW = X.T * weights
        XTWX = XTW @ X
        XTWy = XTW @ y
        lambda_val = 1.0
        w = np.linalg.solve(XTWX + lambda_val * np.eye(K), XTWy)
        
        H, W = labels.shape
        boundaries = np.zeros((H, W), dtype=bool)
        boundaries[:-1, :] |= (labels[:-1, :] != labels[1:, :])
        boundaries[:, :-1] |= (labels[:, :-1] != labels[:, 1:])
        
        img_boundaries = img_resized.copy()
        img_boundaries_np = np.array(img_boundaries)
        img_boundaries_np[boundaries] = [255, 255, 0]
        img_boundaries = Image.fromarray(img_boundaries_np)
        
        max_w = np.max(np.abs(w)) if np.max(np.abs(w)) > 0 else 1.0
        norm_w = w / max_w
        
        overlay = np.zeros((H, W, 4), dtype=np.uint8)
        for i in range(K):
            mask = (labels == i)
            val = norm_w[i]
            if val > 0.05:
                alpha = int(val * 130)
                overlay[mask] = [0, 255, 0, alpha]
            elif val < -0.05:
                alpha = int(-val * 130)
                overlay[mask] = [255, 0, 0, alpha]
                
        overlay[boundaries] = [255, 255, 0, 255]
        
        img_regions = img_resized.copy().convert("RGBA")
        overlay_image = Image.fromarray(overlay, mode="RGBA")
        img_regions = Image.alpha_composite(img_regions, overlay_image).convert("RGB")
        
        combined_w = IMAGE_SIZE[0] * 2
        combined_h = IMAGE_SIZE[1]
        combined_img = Image.new("RGB", (combined_w, combined_h))
        combined_img.paste(img_boundaries, (0, 0))
        combined_img.paste(img_regions, (IMAGE_SIZE[0], 0))
        
        buffer = io.BytesIO()
        combined_img.save(buffer, format="PNG")
        return base64_encode(buffer.getvalue()), None
    except Exception as exc:
        print(f"[WARN] LIME generation failed: {exc}")
        print(traceback.format_exc())
        return None, str(exc)


def create_shap_explanation(image_bytes: bytes, class_index: int) -> tuple[str | None, str | None]:
    if model is None:
        return None, "Model not loaded"
    try:
        img_orig = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        batch = preprocess_image_bytes(image_bytes)
        baseline = tf.zeros_like(batch)
        
        steps = 20
        alphas = tf.linspace(0.0, 1.0, num=steps+1)
        
        path_images = []
        for alpha in alphas:
            path_images.append(baseline + alpha * (batch - baseline))
        path_images = tf.concat(path_images, axis=0)
        
        with tf.GradientTape() as tape:
            tape.watch(path_images)
            backbone = model.get_layer("efficientnetb0")
            conv_outputs = backbone(path_images, training=False)
            x = conv_outputs
            for layer_name in ["global_average_pooling2d", "dropout", "dense", "dropout_1", "dense_1"]:
                layer = model.get_layer(layer_name)
                if layer.__class__.__name__ == "Dropout":
                    x = layer(x, training=False)
                else:
                    x = layer(x)
            predictions = x
            target_score = predictions[:, int(class_index)]
            
        grads = tape.gradient(target_score, path_images)
        avg_grads = tf.reduce_mean(grads, axis=0)
        integrated_grads = (batch[0] - baseline[0]) * avg_grads
        
        attribution = tf.reduce_sum(tf.abs(integrated_grads), axis=-1).numpy()
        
        max_val = np.max(attribution)
        if max_val > 0:
            attribution = attribution / max_val
            
        attribution = np.power(attribution, 0.5)
        
        attribution_mask = Image.fromarray(
            np.uint8(attribution * 255),
            mode="L"
        ).resize(img_orig.size, Image.BILINEAR).filter(ImageFilter.GaussianBlur(radius=5))
        
        heatmap_rgb = Image.fromarray(jet_colormap(np.array(attribution_mask)), mode="RGB")
        colored_heatmap = heatmap_rgb.convert("RGBA")
        colored_heatmap.putalpha(attribution_mask.point(lambda value: min(255, int(value * 3.0))))
        
        base_gray = ImageOps.grayscale(img_orig)
        base_gray = ImageEnhance.Brightness(base_gray).enhance(0.8)
        base_gray = ImageEnhance.Contrast(base_gray).enhance(1.2)
        base_image = Image.merge("RGBA", (base_gray, base_gray, base_gray, Image.new("L", img_orig.size, 255)))
        
        overlay = Image.alpha_composite(base_image, colored_heatmap).convert("RGB")
        
        buffer = io.BytesIO()
        overlay.save(buffer, format="PNG")
        return base64_encode(buffer.getvalue()), None
    except Exception as exc:
        print(f"[WARN] SHAP generation failed: {exc}")
        print(traceback.format_exc())
        return None, str(exc)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model_loaded": model is not None})


@app.route("/predict", methods=["POST"])
def predict():
    try:
        os.makedirs(UPLOADS_DIR, exist_ok=True)

        file, error = get_uploaded_file()
        if error:
            return jsonify({"error": error}), 400

        image_bytes = file.read()
        if not image_bytes:
            return jsonify({"error": "Empty upload payload"}), 400

        ext = os.path.splitext(file.filename)[1] or ".jpg"
        safe_name = (
            f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}{ext}"
        )
        save_path = os.path.join(UPLOADS_DIR, safe_name)
        with open(save_path, "wb") as saved_file:
            saved_file.write(image_bytes)
        print(f"[INFO] Saved upload to {save_path}")

        result, status = run_prediction(image_bytes, safe_name)
        return jsonify(result), status
    except Exception as e:
        print("PREDICT ERROR:", traceback.format_exc())
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500


@app.route("/explain", methods=["POST"])
def explain():
    try:
        os.makedirs(UPLOADS_DIR, exist_ok=True)

        file, error = get_uploaded_file()
        if error:
            return jsonify({"error": error}), 400

        image_bytes = file.read()
        if not image_bytes:
            return jsonify({"error": "Empty upload payload"}), 400

        if model is None:
            return jsonify({"error": "Model not loaded", "model_loaded": False}), 503

        ext = os.path.splitext(file.filename)[1] or ".jpg"
        safe_name = (
            f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}{ext}"
        )
        save_path = os.path.join(UPLOADS_DIR, safe_name)
        with open(save_path, "wb") as saved_file:
            saved_file.write(image_bytes)
        print(f"[INFO] Saved upload to {save_path}")

        batch = preprocess_image_bytes(image_bytes)
        print(f"[DEBUG] Input shape: {batch.shape}")
        raw = model.predict(batch, verbose=0)[0]

        print(f"[DEBUG] Raw predictions: {raw}")
        result = build_result_payload(raw, safe_name)
        print(f"[DEBUG] Class index: {result['predicted_class']} ({index_to_folder(int(result['predicted_class']))})")
        print(f"[DEBUG] Confidence: {result['confidence']:.2f}%")
        print(f"[DEBUG] Probabilities: {result['probabilities']}")

        heatmap, heatmap_error = create_gradcam_heatmap(image_bytes, int(result["predicted_class"]))
        lime, lime_error = create_lime_explanation(image_bytes, int(result["predicted_class"]))
        shap, shap_error = create_shap_explanation(image_bytes, int(result["predicted_class"]))
        result["heatmap"] = heatmap
        result["heatmap_error"] = heatmap_error
        result["lime"] = lime
        result["lime_error"] = lime_error
        result["shap"] = shap
        result["shap_error"] = shap_error
        return jsonify(result), 200
    except Exception as e:
        print("EXPLAIN ERROR:", traceback.format_exc())
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json() or {}
        message = data.get("message", "").strip().lower()
        role = data.get("role", "Doctor")
        if not message:
            return jsonify({"reply": f"I did not receive a message. How can I help you today, {role}?"}), 400

        diagnosis = data.get("diagnosis")

        if "suggest" in message or "recommend" in message or "treatment" in message or "next step" in message or "what should i do" in message:
            if not diagnosis:
                reply = (
                    "To give clinical suggestions, I need an active scan diagnosis.\n\n"
                    "Please upload an MRI scan in the **MRI Diagnostics** page, run the classification pipeline, "
                    "and once the diagnosis is ready, ask me again for suggestions!"
                )
            else:
                diag_lower = str(diagnosis).lower()
                if "glioma" in diag_lower:
                    reply = (
                        "Based on the model's **Glioma** classification, the following clinical recommendations are typically indicated:\n\n"
                        "1. **Neurosurgical Referral**: Schedule a consultation with a neurosurgeon for surgical planning (resection or biopsy).\n"
                        "2. **Further Diagnostic Imaging**: Consider advanced magnetic resonance imaging sequences, such as MR perfusion (DSC/DCE) or MR spectroscopy, to evaluate tumor vascularity and cellular metabolites.\n"
                        "3. **Multidisciplinary Tumor Board**: Present the case to the neuro-oncology team to formulate a personalized radiotherapy and chemotherapy (e.g. Temozolomide) strategy.\n"
                        "4. **Cerebral Edema Management**: Evaluate the patient for corticosteroid therapy (e.g., Dexamethasone) if peritumoral edema is causing neurological deficits or mass effect."
                    )
                elif "meningioma" in diag_lower:
                    reply = (
                        "Based on the model's **Meningioma** classification, the following clinical recommendations are typically indicated:\n\n"
                        "1. **Symptom Monitoring & Surveillance**: If the lesion is small and the patient is asymptomatic, standard conservative management (serial MRI scans in 6 months to evaluate growth) is often suitable.\n"
                        "2. **Neurosurgical Referral**: For large, growing, or symptomatic meningiomas, consult a neurosurgeon to evaluate options for surgical resection (aiming for Simpson Grade I resection).\n"
                        "3. **Stereotactic Radiosurgery (SRS)**: Consider radiation oncology referral for lesions that are surgically inaccessible or recurrent."
                    )
                elif "pituitary" in diag_lower:
                    reply = (
                        "Based on the model's **Pituitary Adenoma** classification, the following clinical recommendations are typically indicated:\n\n"
                        "1. **Endocrine Profiling**: Perform comprehensive laboratory hormone panels (including Prolactin, IGF-1, ACTH, morning Cortisol, Free T4, TSH) to check for secretory function.\n"
                        "2. **Ophthalmological Assessment**: Arrange a formal visual field examination (visual field perimetry) to evaluate potential optic chiasm compression.\n"
                        "3. **Neurosurgical or Medical Referral**: Prolactin-secreting tumors (prolactinomas) are usually managed medically first with dopamine agonists (e.g., Cabergoline). Non-functioning or compressive macroadenomas require neurosurgical transsphenoidal resection evaluation."
                    )
                elif "no tumor" in diag_lower or "normal" in diag_lower or "notumor" in diag_lower:
                    reply = (
                        "Based on the scan classification of **No Tumor Detected**, the following clinical recommendations are indicated:\n\n"
                        "1. **Reassurance & Surveillance**: No immediate oncological interventions are needed.\n"
                        "2. **Symptomatic Investigation**: If the patient presents with persistent focal neurological deficits, headaches, or cognitive changes, consider exploring non-neoplastic causes (ischemic, inflammatory, infectious, demyelinating, or metabolic) or consult neurology."
                    )
                else:
                    reply = (
                        f"For the diagnosis **{diagnosis}**, standard clinical guidelines suggest discussing the case at a multidisciplinary "
                        "tumor board and scheduling consultations with neurosurgery and radiology to establish a definitive diagnosis and treatment plan."
                    )
        elif "gradcam" in message or "grad-cam" in message:
            reply = (
                "**Grad-CAM (Gradient-weighted Class Activation Mapping)** is a visual explanation technique "
                "that projects gradient signals back onto the input MRI scan.\n\n"
                "**Our Settings**:\n"
                "- Targets the final convolutional layer (`top_conv`) of the EfficientNet-B0 backbone.\n"
                "- Applies **percentile thresholding** keeping only the **top 18% of activations** (>= 82nd percentile).\n"
                "- Applies **power-law scaling** (exponent 0.65) to amplify dimmer activation boundaries.\n"
                "- Smoothed via **Gaussian Blur** (radius 7) before overlaying."
            )
        elif "lime" in message and "shap" in message:
            reply = (
                "**LIME vs SHAP Comparison**:\n\n"
                "1. **Granularity**: **LIME** explains predictions at the **superpixel (regional) level** using image segmentation, whereas **SHAP (Integrated Gradients)** provides **fine pixel-level attribution**.\n"
                "2. **Methodology**: **LIME** fits a local surrogate model by perturbing segments of the image. **SHAP** uses cooperative game theory to calculate attribution relative to a baseline image.\n"
                "3. **Clinical Use**: Use **LIME** to check if organic brain structures support the diagnosis, and **SHAP** to examine exact tumor boundaries, contrast differences, and fine margins."
            )
        elif "lime" in message:
            reply = (
                "**LIME (Local Interpretable Model-agnostic Explanations)** segments the MRI into organic superpixel "
                "regions and generates local linear explanations by perturbing (masking out) these regions.\n\n"
                "**Our Settings**:\n"
                "- **Superpixels**: Uses **50 segments** generated via custom **SLIC K-Means (compactness 15.0, 4 iterations)**.\n"
                "- **Perturbations**: Fits an L2 regularized **Ridge Regression (lambda=1.0)** model over **120 random perturbed samples**.\n"
                "- **Visuals**: **Yellow Contours** mark boundaries; **Green Highlights** support the prediction, **Red/Orange Highlights** oppose it."
            )
        elif "shap" in message:
            reply = (
                "**SHAP (Shapley Additive exPlanations)** calculates mathematically fair attribution values "
                "for each pixel using game theory. We implement **Integrated Gradients** (Path SHAP variant) for this.\n\n"
                "**Our Settings**:\n"
                "- Integrates gradients across **20 path steps** between a black baseline image and the input MRI scan.\n"
                "- Applies **power-law scaling** (exponent 0.5) to balance contrast.\n"
                "- Applies **Gaussian Blur** (radius 5) to clean attribution noise and highlight high-intensity tissue margins."
            )
        elif "glioma" in message:
            reply = (
                "**Gliomas** are primary brain tumors that originate in glial cells (supporting tissue of the brain).\n\n"
                "On MRI, they typically present as intra-axial lesions with varying degrees of edema and enhancement. "
                "Our diagnostic pipeline classifies these as **High Severity** and highlights their active margins "
                "via Grad-CAM and SHAP."
            )
        elif "meningioma" in message:
            reply = (
                "**Meningiomas** are primary central nervous system tumors that arise from the meninges (membranes surrounding "
                "the brain and spinal cord). They are usually extra-axial and benign but can cause compression.\n\n"
                "They are classified as **Medium Severity** on our platform. The model detects their characteristic dura tail "
                "and spherical borders."
            )
        elif "pituitary" in message:
            reply = (
                "**Pituitary Adenomas** are epithelial tumors arising from the anterior pituitary gland in the sella turcica.\n\n"
                "They are typically slow-growing, benign lesions classified as **Low-Medium Severity** in the pipeline. "
                "They are identified by their localization in the sellar/suprasellar region."
            )
        elif "no tumor" in message or "notumor" in message or "normal" in message:
            reply = (
                "A classification of **No Tumor Detected** indicates that the model did not identify significant "
                "pathological tissue abnormalities corresponding to glioma, meningioma, or pituitary adenoma morphology.\n\n"
                "Confidence is typically high, and the severity is flagged as **None**."
            )
        elif "accuracy" in message or "performance" in message or "backbone" in message or "parameter" in message or "inference" in message:
            reply = (
                "Our network uses a fine-tuned **EfficientNet-B0** backbone pre-trained on ImageNet with a custom classification head. "
                "Key model statistics:\n\n"
                "- **Test Set Accuracy**: **86.38%** (Validation accuracy reached **98.4%** peak during training).\n"
                "- **Parameters**: **1,515,444 trainable parameters** (out of 4,214,055 total).\n"
                "- **Inference Speed**: **0.26 seconds** per image (tested locally on CPU).\n"
                "- **Optimizer**: Adam optimizer with a two-phase training schedule (5 epochs frozen backbone at 1e-3, 10 epochs fine-tuning last 20 backbone layers at 1e-4)."
            )
        elif "dataset" in message or "images" in message or "classes" in message or "distribution" in message or "preprocessing" in message:
            reply = (
                "**Dataset & Preprocessing Details**:\n\n"
                "- **Dataset**: **BrainTumorDataset** containing a total of **7,200 T1 contrast-enhanced MRI slices**.\n"
                "- **Split**: Balanced distribution with **1,800 images per class** (1,400 train, 400 test).\n"
                "- **Classes**: 4 categories: Glioma, Meningioma, No Tumor (Normal), and Pituitary Adenoma.\n"
                "- **Easiest Class**: **No Tumor** (Recall: **99.00%**).\n"
                "- **Hardest Class**: **Meningioma** (Recall: **65.75%** due to boundary similarity on 2D T1 scans).\n"
                "- **Preprocessing**: Images are resized to **224x224 pixels** using **LANCZOS interpolation** and normalized using pre-computed ImageNet channel means."
            )
        elif "attention" in message or "multi-path" in message or "loss" in message:
            reply = (
                "**Architecture Details**:\n\n"
                "- **Multi-path / Attention**: The academic report drafts a multi-path cross-gated attention model, but the **actual implemented production network** is a single-path EfficientNet-B0 transfer learning model.\n"
                "- **Loss Function**: Standard **Categorical Cross-Entropy loss** (no custom consistency loss is active).\n"
                "- **Regularization**: Dropout layers (30% after pooling, 20% in classification head) to prevent overfitting."
            )
        elif "pdf" in message or "report" in message or "download" in message:
            reply = (
                "You can generate a formal clinical PDF report at the end of the diagnostics pipeline (Step 7: Clinical Report).\n\n"
                "Simply click **📄 Download PDF** to export a report containing the patient ID, scan date, "
                "predicted tumor type, confidence score, and the Grad-CAM explainability heatmap."
            )
        elif "stage" in message or "grade" in message or "severity" in message:
            reply = (
                "Our classification pipeline assigns a **Severity/Urgency level** to detected brain tumors:\n\n"
                "- **Glioma**: Classified as **High Severity** due to its infiltrative nature.\n"
                "- **Meningioma**: Classified as **Medium Severity** (usually extra-axial, slow-growing but compressive).\n"
                "- **Pituitary Adenoma**: Classified as **Low-Medium Severity**.\n"
                "- **No Tumor Detected**: Flagged as **None**.\n\n"
                "To see the specific severity level determined by the model for your uploaded MRI scan, please review the "
                "**Classification Panel** (Step 5) or download the final **PDF report** (Step 7)."
            )
        elif "hello" in message or "hi" in message or "greet" in message:
            reply = (
                f"Hello, {role}! I am your AI Diagnostic Assistant. I can answer questions about your diagnostic results, "
                "model architecture, or explainability visualizations (Grad-CAM, LIME, SHAP). How can I assist you?"
            )
        else:
            reply = (
                "I am your AI Diagnostic Assistant. I can help you interpret diagnostic results and explain our clinical "
                "models. You can ask me about:\n\n"
                "- **XAI methods** (e.g. *\"How does LIME work?\"*, *\"LIME vs SHAP\"*)\n"
                "- **Tumor classes** (e.g. *\"Tell me about Meningiomas\"*, *\"What is a Glioma?\"*)\n"
                "- **Network stats** (e.g. *\"What is the model accuracy?\"*)\n"
                "- **Reports** (e.g. *\"How do I download the PDF?\"*)"
            )

        return jsonify({"reply": reply}), 200
    except Exception as e:
        print("CHAT ERROR:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500


def pick_port(preferred: int = 5000) -> int:
    for port in range(preferred, preferred + 5):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                sock.bind(("0.0.0.0", port))
                return port
            except OSError:
                print(f"Port {port} is already in use.")
    return preferred


if __name__ == "__main__":
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    load_brain_model()

    port = pick_port(5000)
    if port != 5000:
        print("TIP: netstat -ano | findstr :5000  then  taskkill /PID <PID> /F")

    print(f"Starting Flask API on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
