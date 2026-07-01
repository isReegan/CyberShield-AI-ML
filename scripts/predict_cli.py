#!/usr/bin/env python3
"""
Quick CLI prediction test.
Usage:  python scripts/predict_cli.py "Your message here"
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from ai_engine.predictor import predict


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/predict_cli.py \"<message>\"")
        sys.exit(1)

    message = " ".join(sys.argv[1:])
    print(f"\nMessage: {message}\n")
    result = predict(message)

    icon = "🚨" if result["prediction"] == "Scam" else "✅"
    print(f"{icon}  Prediction  : {result['prediction']}")
    print(f"   Confidence  : {result['confidence']}%")
    print(f"   Risk Level  : {result['risk_level']}")
    print(f"   Category    : {result['category']}")
    print(f"   Time        : {result['prediction_time_ms']} ms\n")


if __name__ == "__main__":
    main()
