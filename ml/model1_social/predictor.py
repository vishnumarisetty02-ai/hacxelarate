"""
MODEL 1: Predictor for Fake Social Profile Detection.
Outputs probability between 0.0 and 1.0.
"""

import os
import joblib
from typing import Dict, Any, Tuple, List

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_ML_DIR = os.path.dirname(CURRENT_DIR)
MODEL_PATH = os.path.join(BASE_ML_DIR, "saved_models", "social_model.joblib")

try:
    from .model import extract_features
except ImportError:
    from model import extract_features

class SocialProfilePredictor:
    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.model = None
        self._load()

    def _load(self):
        if os.path.exists(self.model_path):
            artifact = joblib.load(self.model_path)
            self.model = artifact.get("model")

    def predict_proba(self, profile_data: Dict[str, Any]) -> Tuple[float, List[str]]:
        reasons = []
        uname_sim = profile_data.get("username_similarity", 0.0)
        followers = profile_data.get("followers", 0)
        following = profile_data.get("following", 0)
        age = profile_data.get("account_age_days", 30)
        has_url = profile_data.get("has_external_url", False) or profile_data.get("external_url")

        if uname_sim >= 0.70:
            reasons.append("High username similarity")
        if following > 400 and followers < 100:
            reasons.append("Follower/following anomaly")
        if age < 30:
            reasons.append("Account age anomaly")
        if has_url:
            reasons.append("Suspicious external URL")

        if self.model is None:
            prob = 0.90 if len(reasons) >= 2 else (0.50 if len(reasons) == 1 else 0.10)
            return round(prob, 4), reasons

        vec = [extract_features(profile_data)]
        prob = float(self.model.predict_proba(vec)[0][1])
        return round(prob, 4), reasons

def predict(profile_data: Dict[str, Any]) -> float:
    predictor = SocialProfilePredictor()
    prob, _ = predictor.predict_proba(profile_data)
    return prob
