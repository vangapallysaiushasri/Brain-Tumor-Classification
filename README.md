# Neuro-XAI

Clinical-grade brain tumor MRI classification platform with explainable AI visualization, built with **Next.js** (frontend) and **Flask + TensorFlow** (backend).

## Features

- 7-step MRI diagnostics pipeline
- EfficientNetB0 classifier (4 classes)
- Explainability hub (Grad-CAM, SHAP, LIME views)
- Clinical report download (PDF)
- User login (name + specialization, no password)
- Scan Again workflow without page reload

## Tumor Classes

| Folder (training) | Display Name       | Severity   |
|-------------------|--------------------|------------|
| glioma            | Glioma             | High       |
| meningioma        | Meningioma         | Medium     |
| notumor           | No Tumor           | None       |
| pituitary         | Pituitary Adenoma  | Low-Medium |

Keras `ImageDataGenerator` sorts folders **alphabetically** → indices 0–3 as above.

Extended UI classes (Medulloblastoma, Ependymoma, etc.) are padded with 0% probability.

## Dataset Structure

```
backend/BrainTumorDataset/
├── Training/
│   ├── glioma/       (1400 images)
│   ├── meningioma/   (1400 images)
│   ├── notumor/      (1400 images)
│   └── pituitary/    (1400 images)
└── Testing/
    ├── glioma/       (400 images)
    ├── meningioma/   (400 images)
    ├── notumor/      (400 images)
    └── pituitary/    (400 images)
```

## Setup

### 1. Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Train the model

```powershell
cd backend
venv\Scripts\activate
python train_model.py
```

Outputs:
- `backend/models/brain_tumor_model.h5`
- `backend/models/class_indices.json`

Training uses all images in `Training/` and validates on `Testing/`.

### 3. Frontend

```powershell
cd frontend
npm install
```

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
```

## Run

### Option A — start.bat (project root)

Double-click `start.bat` to launch Flask (port 5000) and Next.js (port 3000).

### Option B — Manual

**Terminal 1 — Backend:**
```powershell
cd backend
venv\Scripts\activate
python app.py
```

**Terminal 2 — Frontend:**
```powershell
cd frontend
npm run dev
```

- Frontend: http://localhost:3000
- Backend health: http://localhost:5000/health
- API proxied via Next.js: http://localhost:3000/api/predict

## Login

Open http://localhost:3000 → redirects to **/login**.

Enter any full name and specialization (no password). Profile is saved in `localStorage`.

## Usage

1. Sign in with your name
2. Go to **MRI Diagnostics**
3. Upload a `.jpg` / `.png` MRI scan
4. View classification results and probabilities
5. Click **Scan New Image** to reset the pipeline
6. Click **Download Report** for a PDF summary

## Test API directly

```powershell
curl -X POST http://127.0.0.1:5000/predict -F "file=@backend\BrainTumorDataset\Testing\glioma\Te-gl_1.jpg"
```

## Project Structure

```
BRAIN TUMOR-2/
├── backend/
│   ├── app.py              # Flask API
│   ├── train_model.py      # Train EfficientNetB0
│   ├── predict.py          # Standalone CLI test
│   ├── labels.py           # Class mappings
│   ├── BrainTumorDataset/
│   └── models/
├── frontend/               # Next.js 14 App Router
├── start.bat
└── README.md
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Failed to fetch" | Restart both servers; use `/api` proxy (built into Next.js) |
| All probabilities 0% | Ensure `brain_tumor_model.h5` exists; run `train_model.py` |
| Wrong class labels | Verify `class_indices.json` matches alphabetical order |
| Port 5000 in use | `netstat -ano \| findstr :5000` then `taskkill /PID <id> /F` |
| Styles broken | `cd frontend && npm run fresh` |
