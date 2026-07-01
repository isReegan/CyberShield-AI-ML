#!/usr/bin/env python3
"""
Standalone training script.
Run from CyberShield-AI/ root:
    python scripts/train.py
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from ai_engine.trainer import run_training_pipeline

if __name__ == "__main__":
    report = run_training_pipeline()
    print("\n✅ Training complete!")
    print(f"   Accuracy : {report['metrics']['accuracy']}%")
    print(f"   F1 Score : {report['metrics']['f1_score']}%")
    print(f"   ROC AUC  : {report['metrics']['roc_auc']}%")
    print(f"   Model    : {report['model_path']}")
