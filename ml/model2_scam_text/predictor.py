"""
MODEL 2: Predictor for Scam Text Detection.
Outputs probability between 0.0 and 1.0.
"""

import os
import joblib
from typing import Tuple, List

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_ML_DIR = os.path.dirname(CURRENT_DIR)
MODEL_PATH = os.path.join(BASE_ML_DIR, "saved_models", "scam_text_model.joblib")

try:
    from .model import extract_text_reasons
except ImportError:
    from model import extract_text_reasons

class ScamTextPredictor:
    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.pipeline = None
        self._load()

    def _load(self):
        if os.path.exists(self.model_path):
            artifact = joblib.load(self.model_path)
            self.pipeline = artifact.get("pipeline")

    def predict_proba(self, text: str) -> Tuple[float, List[str]]:
        reasons = extract_text_reasons(text)

        if self.pipeline is None:
            prob = 0.85 if reasons else 0.15
            return round(prob, 4), reasons

        prob = float(self.pipeline.predict_proba([text])[0][1])
        if prob >= 0.50 and not reasons:
            reasons.append("Scam language detected")
        return round(prob, 4), reasons

def predict(text: str) -> float:
    predictor = ScamTextPredictor()
    prob, _ = predictor.predict_proba(text)
    return prob
