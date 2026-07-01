"""
REST API Views — POST /api/predict/
"""

import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

log = logging.getLogger(__name__)


class PredictView(APIView):
    """
    POST /api/predict/
    Body: { "message": "..." }
    Returns full prediction result.
    """

    def post(self, request, *args, **kwargs):
        message = request.data.get("message", "").strip()

        if not message:
            return Response(
                {"error": "Message cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(message) > 5000:
            return Response(
                {"error": "Message too long. Maximum 5000 characters."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            from ai_engine.predictor import predict
            result = predict(message)

            return Response(
                {
                    "prediction": result["prediction"],
                    "confidence": result["confidence"],
                    "risk_level": result["risk_level"],
                    "category": result["category"],
                    "prediction_time_ms": result["prediction_time_ms"],
                    "scam_probability": result["scam_probability"],
                    "safe_probability": result["safe_probability"],
                },
                status=status.HTTP_200_OK,
            )

        except Exception as exc:
            log.exception("Prediction error")
            return Response(
                {"error": f"Prediction failed: {str(exc)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class HealthView(APIView):
    """GET /api/health/ — liveness probe"""

    def get(self, request, *args, **kwargs):
        from pathlib import Path
        from django.conf import settings

        root = Path(settings.BASE_DIR).parent
        model_ready = (root / "models" / "scam_detector.pkl").exists()

        return Response({
            "status": "ok",
            "model_ready": model_ready,
            "version": "1.0.0",
        })
