"""
Prediction Engine — loads saved model + vectorizer and predicts.
Auto-trains if model files are missing.
"""

import os
import sys
import time
import pickle
import logging
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from ai_engine.preprocessor import preprocess_text

log = logging.getLogger(__name__)

MODEL_PATH      = ROOT / "models" / "scam_detector.pkl"
VECTORIZER_PATH = ROOT / "models" / "tfidf_vectorizer.pkl"

_model      = None
_vectorizer = None


def _load_or_train():
    global _model, _vectorizer

    if _model is not None and _vectorizer is not None:
        return  # Already loaded

    if not MODEL_PATH.exists() or not VECTORIZER_PATH.exists():
        log.warning("Model not found — running training pipeline first …")
        from ai_engine.trainer import run_training_pipeline
        run_training_pipeline()

    with open(MODEL_PATH, "rb") as f:
        _model = pickle.load(f)

    with open(VECTORIZER_PATH, "rb") as f:
        _vectorizer = pickle.load(f)

    log.info("Model + vectorizer loaded successfully")


def predict(message: str) -> dict:
    """
    Returns:
      prediction  : "Scam" | "Safe"
      confidence  : float (0-100)
      risk_level  : "Critical" | "High" | "Medium" | "Low"
      category    : str
      prediction_time_ms : float
    """
    _load_or_train()

    start = time.perf_counter()

    processed = preprocess_text(message)
    vec = _vectorizer.transform([processed])
    label_int = _model.predict(vec)[0]         # 0 = ham, 1 = scam
    proba = _model.predict_proba(vec)[0]        # [p_ham, p_scam]

    scam_prob = proba[1] * 100
    ham_prob  = proba[0] * 100

    is_scam = bool(label_int == 1)
    prediction = "Scam" if is_scam else "Safe"
    confidence = round(scam_prob if is_scam else ham_prob, 2)

    # Risk level
    if is_scam:
        if confidence >= 90:
            risk_level = "Critical"
        elif confidence >= 70:
            risk_level = "High"
        elif confidence >= 50:
            risk_level = "Medium"
        else:
            risk_level = "Low"
    else:
        risk_level = "None"

    # Category heuristic
    msg_lower = message.lower()
    if any(k in msg_lower for k in ("prize", "won", "winner", "lottery", "congratulation")):
        category = "Lottery / Prize Scam"
    elif any(k in msg_lower for k in ("bank", "account", "credit card", "paypal", "payment")):
        category = "Financial / Phishing"
    elif any(k in msg_lower for k in ("invest", "crypto", "bitcoin", "trading", "profit")):
        category = "Investment / Crypto Scam"
    elif any(k in msg_lower for k in ("job", "earn", "income", "salary", "work from home")):
        category = "Fake Job Offer"
    elif any(k in msg_lower for k in ("virus", "hack", "infected", "device", "computer")):
        category = "Tech Support Scam"
    elif any(k in msg_lower for k in ("arrest", "irs", "tax", "social security", "government")):
        category = "Government Impersonation"
    elif any(k in msg_lower for k in ("package", "delivery", "customs", "fedex", "dhl", "ups")):
        category = "Delivery / Shipping Scam"
    elif any(k in msg_lower for k in ("love", "romance", "lonely", "widow", "soldier")):
        category = "Romance Scam"
    elif is_scam:
        category = "General Scam"
    else:
        category = "Legitimate Message"

    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)

    return {
        "prediction": prediction,
        "confidence": confidence,
        "risk_level": risk_level,
        "category": category,
        "prediction_time_ms": elapsed_ms,
        "scam_probability": round(scam_prob, 2),
        "safe_probability": round(ham_prob, 2),
    }
