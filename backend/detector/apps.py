from django.apps import AppConfig


class DetectorConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "detector"

    def ready(self):
        """Warm-up: ensure model is trained and loaded when Django starts."""
        import threading

        def warmup():
            try:
                from ai_engine.predictor import _load_or_train
                _load_or_train()
            except Exception as exc:
                import logging
                logging.getLogger(__name__).error(f"Model warmup failed: {exc}")

        # Run in background thread so server starts immediately
        t = threading.Thread(target=warmup, daemon=True)
        t.start()
