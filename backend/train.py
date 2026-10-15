"""
Train BrainTumorCNN and save weights + class_indices.json.
"""

from __future__ import annotations

import json
from pathlib import Path

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

from model import BrainTumorCNN

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "BrainTumorDataset"
MODELS_DIR = BASE_DIR / "models"
MODEL_PATH = MODELS_DIR / "brain_tumor_model.pth"
INDICES_PATH = MODELS_DIR / "class_indices.json"

EPOCHS = 10
BATCH_SIZE = 32
LR = 0.001
IMAGE_SIZE = 224

NORMALIZE = transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])

train_transform = transforms.Compose(
    [
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        NORMALIZE,
    ]
)

test_transform = transforms.Compose(
    [
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        NORMALIZE,
    ]
)


def evaluate(model, loader, criterion, device) -> tuple[float, float]:
    model.eval()
    total_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            total_loss += criterion(outputs, labels).item()
            correct += (outputs.argmax(dim=1) == labels).sum().item()
            total += labels.size(0)

    avg_loss = total_loss / max(len(loader), 1)
    accuracy = 100.0 * correct / max(total, 1)
    return avg_loss, accuracy


def main() -> None:
    train_dir = DATA_DIR / "Training"
    test_dir = DATA_DIR / "Testing"
    if not train_dir.is_dir():
        raise FileNotFoundError(f"Training data not found: {train_dir}")
    if not test_dir.is_dir():
        raise FileNotFoundError(f"Testing data not found: {test_dir}")

    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    train_data = datasets.ImageFolder(str(train_dir), transform=train_transform)
    test_data = datasets.ImageFolder(str(test_dir), transform=test_transform)

    with open(INDICES_PATH, "w", encoding="utf-8") as f:
        json.dump(train_data.class_to_idx, f, indent=2)
    print(f"Class indices: {train_data.class_to_idx}", flush=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}", flush=True)

    model = BrainTumorCNN(num_classes=len(train_data.classes)).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LR)

    train_loader = DataLoader(
        train_data, batch_size=BATCH_SIZE, shuffle=True, num_workers=0
    )
    test_loader = DataLoader(
        test_data, batch_size=BATCH_SIZE, shuffle=False, num_workers=0
    )

    best_acc = 0.0
    for epoch in range(EPOCHS):
        model.train()
        train_loss = 0.0
        for batch_idx, (images, labels) in enumerate(train_loader, start=1):
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            train_loss += loss.item()
            if batch_idx % 25 == 0 or batch_idx == len(train_loader):
                print(
                    f"  Epoch {epoch + 1} batch {batch_idx}/{len(train_loader)}",
                    flush=True,
                )

        val_loss, val_acc = evaluate(model, test_loader, criterion, device)
        avg_train_loss = train_loss / len(train_loader)
        print(
            f"Epoch {epoch + 1}/{EPOCHS} — "
            f"train loss: {avg_train_loss:.4f}, "
            f"val loss: {val_loss:.4f}, val acc: {val_acc:.2f}%",
            flush=True,
        )

        if val_acc >= best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), MODEL_PATH)
            print(
                f"  Saved best model ({best_acc:.2f}% val acc) -> {MODEL_PATH}",
                flush=True,
            )

    print(f"Training complete. Best validation accuracy: {best_acc:.2f}%", flush=True)


if __name__ == "__main__":
    main()
