"""
MODEL 1: Predictor for Fake Social Profile Detection.
Fast inference returning probability (0.0 to 1.0) and explainable reasons.
"""

import os
import joblib
from typing import Dict, Any, Tuple, List
from models.social_model import extract_social_features, FEATURE_NAMES

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "saved_models",
    "social_model.joblib"
)

class SocialProfilePredictor:
    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.artifact = None
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            self.artifact = joblib.load(self.model_path)
            self.model = self.artifact.get("model")
        else:
            self.model = None

    def predict_proba(self, profile_data: Dict[str, Any]) -> Tuple[float, List[str]]:
        """
        Returns:
            probability: float between 0.0 and 1.0 (impersonator probability)
            reasons: list of explainable detection drivers
        """
        reasons = []

        # If model is not trained yet, use rule-based fallback
        if self.model is None:
            uname_sim = profile_data.get("username_similarity", 0.0)
            has_url = profile_data.get("has_external_url", False) or profile_data.get("external_url")
            prob = min(0.99, max(0.05, (uname_sim * 0.6) + (0.3 if has_url else 0.0)))
            if uname_sim >= 0.7:
                reasons.append(f"High username similarity ({int(uname_sim*100)}%) to brand")
            if has_url:
                reasons.append("Suspicious external redirect link in bio")
            return round(prob, 3), reasons

        features = [extract_social_features(profile_data)]
        prob = float(self.model.predict_proba(features)[0][1])

        # Feature explanation logic
        uname_sim = profile_data.get("username_similarity", 0.0)
        followers = profile_data.get("followers", 0)
        following = profile_data.get("following", 0)
        age = profile_data.get("account_age_days", 30)
        has_url = profile_data.get("has_external_url", False) or profile_data.get("external_url")
        verified = profile_data.get("verified", False)

        if uname_sim >= 0.70:
            reasons.append(f"High username similarity ({int(uname_sim * 100)}%) to official brand")
        if following > 400 and followers < 100:
            reasons.append(f"Abnormal following-to-follower ratio ({following} following vs {followers} followers)")
        if age < 30:
            reasons.append(f"Fresh account age anomaly ({age} days old)")
        if has_url:
            reasons.append("External redirection URL embedded in profile bio")
        if not verified and uname_sim >= 0.60:
            reasons.append("Unverified profile lacking official verification badge")

        return round(prob, 4), reasons
