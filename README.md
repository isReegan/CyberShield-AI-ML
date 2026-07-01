# 🛡️ CyberShield AI — Production-Ready Scam Message Detector

An AI-powered web application that detects scam messages in real time using Machine Learning.

---

## 🏗️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18 · Vite · Tailwind CSS · Axios |
| Backend   | Python · Django 4 · Django REST Framework |
| ML Engine | scikit-learn · TF-IDF · Logistic Regression |

---

## 📁 Project Structure

```
CyberShield-AI/
├── ai_engine/           # ML pipeline (preprocessor, trainer, predictor)
├── backend/             # Django project
│   ├── cybershield/     # Django settings, urls, wsgi
│   └── detector/        # REST API app (views, urls)
├── datasets/            # scam_dataset.csv
├── models/              # Saved model files (auto-generated)
├── reports/             # Training report JSON (auto-generated)
├── scripts/             # train.py, predict_cli.py
├── frontend/            # React + Vite app
├── requirements.txt
└── README.md
```

---

## 🚀 Quick Start

### 1. Install Python dependencies

```bash
cd CyberShield-AI
pip install -r requirements.txt
```

### 2. Train the model (one-time, auto-runs on server start too)

```bash
python scripts/train.py
```

### 3. Start the Django backend

```bash
cd backend
python manage.py runserver 8000
```

The server auto-trains the model if `models/` is empty.

### 4. Start the React frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔌 API Reference

### `POST /api/predict/`

**Request:**
```json
{ "message": "Congratulations! You've won $1,000,000..." }
```

**Response:**
```json
{
  "prediction": "Scam",
  "confidence": 98.5,
  "risk_level": "Critical",
  "category": "Lottery / Prize Scam",
  "prediction_time_ms": 3.2,
  "scam_probability": 98.5,
  "safe_probability": 1.5
}
```

### `GET /api/health/`

```json
{ "status": "ok", "model_ready": true, "version": "1.0.0" }
```

---

## 🤖 AI Pipeline

```
CSV Dataset
    ↓
Dataset Validation   — check columns, label distribution
    ↓
Dataset Cleaning     — drop nulls, duplicates, normalise labels
    ↓
NLP Preprocessing    — lowercase, remove URLs/phones/emails,
                       remove punctuation, stop-word removal
    ↓
TF-IDF Vectorization — 10,000 features, unigrams + bigrams
    ↓
Train/Test Split     — 80/20 stratified
    ↓
Logistic Regression  — class_weight=balanced, C=1.0
    ↓
Model Evaluation     — Accuracy, F1, Precision, Recall, ROC-AUC
    ↓
Save Model           — models/scam_detector.pkl
                       models/tfidf_vectorizer.pkl
    ↓
Prediction Engine    — predictor.py (reuses same preprocessor)
    ↓
Django REST API      — POST /api/predict/
    ↓
React Website        — CyberShield AI UI
```

---

## 📊 Model Performance

After training on the included dataset you can expect:

| Metric    | Score    |
|-----------|----------|
| Accuracy  | ~97–99%  |
| F1 Score  | ~97–99%  |
| ROC AUC   | ~98–100% |

Check `reports/training_report.json` for your exact figures.

---

## 🖥️ CLI Tools

```bash
# Train model
python scripts/train.py

# Quick prediction in terminal
python scripts/predict_cli.py "You've won a free iPhone! Claim now."
```

---

## ⚙️ Environment

No `.env` file required for development. For production:
- Set `DEBUG=False` in `backend/cybershield/settings.py`
- Change `SECRET_KEY` to a strong random value
- Set `ALLOWED_HOSTS` to your domain
- Add `VITE_API_URL=https://your-api.com` to `frontend/.env`
