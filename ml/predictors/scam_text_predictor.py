"""
MODEL 2: Predictor for Scam Text Detection.
Fast inference returning probability (0.0 to 1.0) and explainable reasons.
"""

import os
import joblib
from typing import Tuple, List
from models.scam_text_model import identify_scam_categories

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "saved_models",
    "scam_text_model.joblib"
)

class ScamTextPredictor:
    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.artifact = None
        self.pipeline = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            self.artifact = joblib.load(self.model_path)
            self.pipeline = self.artifact.get("pipeline")
        else:
            self.pipeline = None

    def predict_proba(self, text: str) -> Tuple[float, List[str]]:
        """
        Returns:
            probability: float between 0.0 and 1.0 (scam probability)
            reasons: list of explainable detection drivers
        """
        reasons = []
        triggered_categories = identify_scam_categories(text)

        # Fallback if model artifact not yet present
        if self.pipeline is None:
            prob = 0.85 if triggered_categories else 0.15
            for cat in triggered_categories:
                reasons.append(f"Scam signal triggered: {cat}")
            return round(prob, 4), reasons

        prob = float(self.pipeline.predict_proba([text])[0][1])

        if triggered_categories:
            for cat in triggered_categories:
                reasons.append(f"High-risk pattern detected: {cat}")
        elif prob >= 0.50:
            reasons.append("NLP language model detected statistical similarity to known phishing lures.")

        return round(prob, 4), reasons
