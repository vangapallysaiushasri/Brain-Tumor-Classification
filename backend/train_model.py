"""
Train brain tumor classifier — EfficientNetB0 two-phase transfer learning.

Phase 1 (5 epochs):  frozen EfficientNet backbone, train classification head
Phase 2 (10 epochs): unfreeze last 20 backbone layers, fine-tune

Training:   backend/BrainTumorDataset/Training/
Validation: backend/BrainTumorDataset/Testing/

Class order (alphabetical): glioma=0, meningioma=1, notumor=2, pituitary=3
"""

from __future__ import annotations

import json
import os

import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.callbacks import Callback, EarlyStopping, ModelCheckpoint
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator

from labels import CLASS_FOLDERS

tf.random.set_seed(42)
np.random.seed(42)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TRAIN_DIR = os.path.join(BASE_DIR, "BrainTumorDataset", "Training")
VAL_DIR = os.path.join(BASE_DIR, "BrainTumorDataset", "Testing")
MODELS_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODELS_DIR, "brain_tumor_model.h5")
INDICES_PATH = os.path.join(MODELS_DIR, "class_indices.json")

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
PHASE1_EPOCHS = 5
PHASE2_EPOCHS = 10
TOTAL_EPOCHS = PHASE1_EPOCHS + PHASE2_EPOCHS
UNFREEZE_LAYERS = 20
TARGET_VAL_ACC = 0.85

EXPECTED_CLASS_INDICES = {name: idx for idx, name in enumerate(CLASS_FOLDERS)}


class ValAccuracyLogger(Callback):
    """Print validation accuracy at the end of every epoch."""

    def on_epoch_end(self, epoch: int, logs: dict | None = None) -> None:
        logs = logs or {}
        val_acc = logs.get("val_accuracy", 0.0)
        train_acc = logs.get("accuracy", 0.0)
        print(
            f"Epoch {epoch + 1} — "
            f"train_acc: {train_acc * 100:.2f}%, "
            f"val_accuracy: {val_acc * 100:.2f}%"
        )


def build_model(num_classes: int = 4) -> tuple[tf.keras.Model, EfficientNetB0]:
    """EfficientNetB0 (ImageNet) backbone + classification head."""
    base = EfficientNetB0(
        include_top=False,
        weights="imagenet",
        input_shape=(*IMG_SIZE, 3),
    )
    base.trainable = False

    inputs = tf.keras.Input(shape=(*IMG_SIZE, 3))
    x = base(inputs, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    x = tf.keras.layers.Dense(128, activation="relu")(x)
    x = tf.keras.layers.Dropout(0.2)(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax")(x)

    model = tf.keras.Model(inputs, outputs)
    return model, base


def unfreeze_last_layers(base: tf.keras.Model, num_layers: int = UNFREEZE_LAYERS) -> None:
    """Unfreeze only the last N layers of the EfficientNet backbone."""
    base.trainable = True
    for layer in base.layers[:-num_layers]:
        layer.trainable = False
    for layer in base.layers[-num_layers:]:
        layer.trainable = True

    trainable_count = sum(1 for layer in base.layers if layer.trainable)
    print(
        f"Fine-tuning: unfroze last {num_layers} backbone layers "
        f"({trainable_count} trainable layers in backbone)"
    )


def make_generators():
    """Load train/val data with augmentation and EfficientNet preprocessing."""
    train_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input,
        rotation_range=20,
        zoom_range=0.2,
        horizontal_flip=True,
        width_shift_range=0.2,
        height_shift_range=0.2,
    )
    val_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)

    flow_kwargs = {
        "target_size": IMG_SIZE,
        "batch_size": BATCH_SIZE,
        "class_mode": "categorical",
        "classes": CLASS_FOLDERS,
    }

    train_gen = train_datagen.flow_from_directory(
        TRAIN_DIR,
        shuffle=True,
        seed=42,
        **flow_kwargs,
    )
    val_gen = val_datagen.flow_from_directory(
        VAL_DIR,
        shuffle=False,
        **flow_kwargs,
    )
    return train_gen, val_gen


def make_callbacks() -> list[Callback]:
    return [
        ModelCheckpoint(
            MODEL_PATH,
            monitor="val_accuracy",
            save_best_only=True,
            verbose=1,
        ),
        EarlyStopping(
            monitor="val_accuracy",
            patience=5,
            restore_best_weights=True,
            verbose=1,
        ),
        ValAccuracyLogger(),
    ]


def main() -> None:
    if not os.path.isdir(TRAIN_DIR):
        raise FileNotFoundError(f"Training data not found: {TRAIN_DIR}")
    if not os.path.isdir(VAL_DIR):
        raise FileNotFoundError(f"Validation data not found: {VAL_DIR}")

    os.makedirs(MODELS_DIR, exist_ok=True)

    train_gen, val_gen = make_generators()

    print("Class indices:", train_gen.class_indices)
    print("Training samples:", train_gen.samples)
    print("Validation samples:", val_gen.samples)

    if train_gen.class_indices != EXPECTED_CLASS_INDICES:
        raise ValueError(
            "Unexpected class order!\n"
            f"  Expected: {EXPECTED_CLASS_INDICES}\n"
            f"  Got:      {train_gen.class_indices}"
        )

    with open(INDICES_PATH, "w", encoding="utf-8") as f:
        json.dump(train_gen.class_indices, f, indent=2)
    print(f"Saved class indices to {INDICES_PATH}")

    model, base = build_model(num_classes=len(CLASS_FOLDERS))
    callbacks = make_callbacks()

    # --- Phase 1: frozen backbone, train head only ---
    print("\n" + "=" * 60)
    print(f"PHASE 1 — Frozen backbone, training head ({PHASE1_EPOCHS} epochs)")
    print("=" * 60 + "\n")

    model.compile(
        optimizer=Adam(learning_rate=1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    model.summary()

    history1 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=PHASE1_EPOCHS,
        callbacks=callbacks,
        verbose=1,
    )

    # --- Phase 2: unfreeze last 20 layers, fine-tune ---
    print("\n" + "=" * 60)
    print(f"PHASE 2 — Fine-tune last {UNFREEZE_LAYERS} layers ({PHASE2_EPOCHS} epochs)")
    print("=" * 60 + "\n")

    unfreeze_last_layers(base, UNFREEZE_LAYERS)
    model.compile(
        optimizer=Adam(learning_rate=1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    history2 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=TOTAL_EPOCHS,
        initial_epoch=PHASE1_EPOCHS,
        callbacks=callbacks,
        verbose=1,
    )

    model.save(MODEL_PATH)
    print(f"\nBest model saved to {MODEL_PATH}")

    val_loss, val_acc = model.evaluate(val_gen, verbose=0)
    print(f"\nFinal validation accuracy: {val_acc * 100:.2f}%")
    print(f"Final validation loss: {val_loss:.4f}")

    all_val_acc = (
        history1.history.get("val_accuracy", [])
        + history2.history.get("val_accuracy", [])
    )
    best_val_acc = max(all_val_acc) if all_val_acc else val_acc
    print(f"Best validation accuracy during training: {best_val_acc * 100:.2f}%")

    if val_acc < TARGET_VAL_ACC:
        print(
            f"\nWARNING: Validation accuracy {val_acc * 100:.2f}% is below "
            f"target {TARGET_VAL_ACC * 100:.0f}%. "
            "Try re-running or increasing PHASE2_EPOCHS."
        )
    else:
        print(f"\nTarget reached: validation accuracy >= {TARGET_VAL_ACC * 100:.0f}%")


if __name__ == "__main__":
    main()
