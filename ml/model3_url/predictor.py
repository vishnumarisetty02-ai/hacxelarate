"""
MODEL 3: Predictor for Phishing/Suspicious URL Detection.
Outputs probability between 0.0 and 1.0.
"""

import os
import joblib
from typing import Tuple, List

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_ML_DIR = os.path.dirname(CURRENT_DIR)
MODEL_PATH = os.path.join(BASE_ML_DIR, "saved_models", "url_model.joblib")

from model import extract_features, SUSPICIOUS_KEYWORDS

class UrlPredictor:
    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.model = None
        self._load()

    def _load(self):
        if os.path.exists(self.model_path):
            artifact = joblib.load(self.model_path)
            self.model = artifact.get("model")

    def predict_proba(self, url: str) -> Tuple[float, List[str]]:
        feats = extract_features(url)
        reasons = []

        if feats[4] == 1.0:
            reasons.append("Suspicious TLD")
        if feats[5] == 1.0:
            reasons.append("IP address host")
        if feats[2] >= 2:
            reasons.append("Excessive hyphens")
        if feats[8] == 1.0:
            reasons.append("Suspicious keyword")
        if feats[6] == 0.0:
            reasons.append("Insecure HTTP")

        if self.model is None:
            prob = 0.88 if len(reasons) >= 2 else (0.50 if len(reasons) == 1 else 0.12)
            return round(prob, 4), reasons

        prob = float(self.model.predict_proba([feats])[0][1])
        return round(prob, 4), reasons

def predict(url: str) -> float:
    predictor = UrlPredictor()
    prob, _ = predictor.predict_proba(url)
    return prob
