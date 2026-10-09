"""
MODEL 3: Predictor for Phishing/Suspicious URL Detection.
Fast inference returning probability (0.0 to 1.0) and explainable reasons.
"""

import os
import joblib
from typing import Tuple, List
from models.url_model import extract_url_features, URL_FEATURE_NAMES, SUSPICIOUS_TLDS, SUSPICIOUS_KEYWORDS

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "saved_models",
    "url_model.joblib"
)

class UrlPredictor:
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

    def predict_proba(self, url: str) -> Tuple[float, List[str]]:
        """
        Returns:
            probability: float between 0.0 and 1.0 (phishing probability)
            reasons: list of explainable detection drivers
        """
        reasons = []
        features = extract_url_features(url)
        url_lower = url.lower()

        # Explainability signals from features
        # [url_len, num_dots, num_hyphens, num_special, is_sus_tld, has_ip, is_https, is_shortened, has_keywords]
        if features[4] == 1.0: # is_sus_tld
            reasons.append("High-abuse Top-Level Domain (TLD) detected")
        if features[5] == 1.0: # has_ip
            reasons.append("Raw IP address used as hostname instead of legitimate domain")
        if features[2] >= 2:   # num_hyphens
            reasons.append(f"Excessive hyphenation ({int(features[2])} hyphens) characteristic of typosquatting")
        if features[8] == 1.0: # has_keywords
            matched_kws = [kw for kw in SUSPICIOUS_KEYWORDS if kw in url_lower]
            reasons.append(f"Deceptive auth/harvesting keywords present: {', '.join(matched_kws[:3])}")
        if features[6] == 0.0: # no HTTPS
            reasons.append("Insecure plain HTTP protocol (lacks valid SSL/TLS certificate)")

        # Fallback if model artifact not yet present
        if self.model is None:
            prob = 0.88 if len(reasons) >= 2 else (0.55 if len(reasons) == 1 else 0.12)
            return round(prob, 4), reasons

        prob = float(self.model.predict_proba([features])[0][1])
        return round(prob, 4), reasons
