"""
Full AI Training Pipeline:
  Dataset Validation → Cleaning → Preprocessing →
  TF-IDF → Train/Test Split → Logistic Regression → Save Model
"""

import os
import sys
import json
import time
import pickle
import logging
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, classification_report, confusion_matrix,
)
from sklearn.pipeline import Pipeline

# Add project root to path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from ai_engine.preprocessor import preprocess_text

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()],
)
log = logging.getLogger(__name__)

# Paths
DATASET_PATH = ROOT / "datasets" / "scam_dataset.csv"
MODEL_PATH    = ROOT / "models" / "scam_detector.pkl"
VECTORIZER_PATH = ROOT / "models" / "tfidf_vectorizer.pkl"
REPORT_PATH   = ROOT / "reports" / "training_report.json"


# ─────────────────────────────────────────────
# 1. VALIDATE DATASET
# ─────────────────────────────────────────────
def validate_dataset(df: pd.DataFrame) -> pd.DataFrame:
    log.info("Step 1: Dataset Validation")
    required_cols = {"text", "label"}
    if not required_cols.issubset(df.columns):
        raise ValueError(f"Dataset must contain columns: {required_cols}. Found: {set(df.columns)}")

    log.info(f"  Rows: {len(df)}, Columns: {list(df.columns)}")
    log.info(f"  Label distribution:\n{df['label'].value_counts().to_string()}")

    valid_labels = {"scam", "ham", "safe", "spam"}
    unknown = set(df["label"].str.lower().unique()) - valid_labels
    if unknown:
        log.warning(f"  Unknown labels found: {unknown} — will be mapped to 'ham'")
    return df


# ─────────────────────────────────────────────
# 2. CLEAN DATASET
# ─────────────────────────────────────────────
def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    log.info("Step 2: Dataset Cleaning")
    original_len = len(df)

    df = df.copy()
    df.columns = df.columns.str.strip().str.lower()

    # Drop nulls
    df.dropna(subset=["text", "label"], inplace=True)

    # Drop empty strings
    df = df[df["text"].str.strip() != ""]

    # Drop duplicates
    df.drop_duplicates(subset=["text"], inplace=True)

    # Normalise labels  →  scam=1  ham=0
    df["label"] = df["label"].str.strip().str.lower()
    df["label"] = df["label"].map(
        lambda x: "scam" if x in ("scam", "spam") else "ham"
    )

    log.info(f"  Rows after cleaning: {len(df)} (removed {original_len - len(df)})")
    return df.reset_index(drop=True)


# ─────────────────────────────────────────────
# 3. NLP PREPROCESSING
# ─────────────────────────────────────────────
def apply_preprocessing(df: pd.DataFrame) -> pd.DataFrame:
    log.info("Step 3: NLP Preprocessing")
    df = df.copy()
    df["processed_text"] = df["text"].apply(preprocess_text)
    df = df[df["processed_text"].str.strip() != ""].reset_index(drop=True)
    log.info(f"  Preprocessed {len(df)} messages")
    return df


# ─────────────────────────────────────────────
# 4. FEATURE ENGINEERING — TF-IDF
# ─────────────────────────────────────────────
def build_vectorizer() -> TfidfVectorizer:
    return TfidfVectorizer(
        max_features=10_000,
        ngram_range=(1, 2),       # unigrams + bigrams
        min_df=1,
        max_df=0.95,
        sublinear_tf=True,        # log normalization
        strip_accents="unicode",
    )


# ─────────────────────────────────────────────
# 5. TRAIN / TEST SPLIT
# ─────────────────────────────────────────────
def split_data(df: pd.DataFrame):
    log.info("Step 4: Train/Test Split (80/20, stratified)")
    X = df["processed_text"]
    y = df["label"].map({"scam": 1, "ham": 0})

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    log.info(f"  Train: {len(X_train)}  Test: {len(X_test)}")
    return X_train, X_test, y_train, y_test


# ─────────────────────────────────────────────
# 6. TRAIN MODEL
# ─────────────────────────────────────────────
def train_model(X_train, y_train, vectorizer: TfidfVectorizer):
    log.info("Step 5: TF-IDF Vectorization + Logistic Regression Training")
    X_train_tfidf = vectorizer.fit_transform(X_train)

    model = LogisticRegression(
        C=1.0,
        max_iter=1000,
        solver="lbfgs",
        class_weight="balanced",
        random_state=42,
    )
    model.fit(X_train_tfidf, y_train)
    log.info("  Model trained successfully")
    return model, vectorizer, X_train_tfidf


# ─────────────────────────────────────────────
# 7. EVALUATE MODEL
# ─────────────────────────────────────────────
def evaluate_model(model, vectorizer, X_test, y_test) -> dict:
    log.info("Step 6: Model Evaluation")
    X_test_tfidf = vectorizer.transform(X_test)
    y_pred = model.predict(X_test_tfidf)
    y_prob = model.predict_proba(X_test_tfidf)[:, 1]

    metrics = {
        "accuracy":  round(accuracy_score(y_test, y_pred) * 100, 2),
        "precision": round(precision_score(y_test, y_pred, zero_division=0) * 100, 2),
        "recall":    round(recall_score(y_test, y_pred, zero_division=0) * 100, 2),
        "f1_score":  round(f1_score(y_test, y_pred, zero_division=0) * 100, 2),
        "roc_auc":   round(roc_auc_score(y_test, y_prob) * 100, 2),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "classification_report": classification_report(
            y_test, y_pred, target_names=["Ham", "Scam"]
        ),
    }

    log.info(f"  Accuracy : {metrics['accuracy']}%")
    log.info(f"  F1 Score : {metrics['f1_score']}%")
    log.info(f"  ROC AUC  : {metrics['roc_auc']}%")
    log.info(f"\n{metrics['classification_report']}")
    return metrics


# ─────────────────────────────────────────────
# 8. SAVE MODEL
# ─────────────────────────────────────────────
def save_model(model, vectorizer):
    log.info("Step 7: Saving Model + Vectorizer")
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)

    with open(VECTORIZER_PATH, "wb") as f:
        pickle.dump(vectorizer, f)

    log.info(f"  Model saved   → {MODEL_PATH}")
    log.info(f"  Vectorizer    → {VECTORIZER_PATH}")


# ─────────────────────────────────────────────
# MASTER PIPELINE
# ─────────────────────────────────────────────
def run_training_pipeline() -> dict:
    start = time.time()
    log.info("=" * 60)
    log.info("CyberShield AI — Training Pipeline Started")
    log.info("=" * 60)

    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH)
    df = validate_dataset(df)
    df = clean_dataset(df)
    df = apply_preprocessing(df)

    X_train, X_test, y_train, y_test = split_data(df)

    vectorizer = build_vectorizer()
    model, vectorizer, _ = train_model(X_train, y_train, vectorizer)
    metrics = evaluate_model(model, vectorizer, X_test, y_test)

    save_model(model, vectorizer)

    elapsed = round(time.time() - start, 2)
    report = {
        "trained_at": datetime.now().isoformat(),
        "dataset_rows": len(df),
        "training_time_seconds": elapsed,
        "metrics": metrics,
        "model_path": str(MODEL_PATH),
        "vectorizer_path": str(VECTORIZER_PATH),
    }

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(REPORT_PATH, "w") as f:
        json.dump(report, f, indent=2)

    log.info(f"\nTraining completed in {elapsed}s. Report → {REPORT_PATH}")
    log.info("=" * 60)
    return report


if __name__ == "__main__":
    run_training_pipeline()
