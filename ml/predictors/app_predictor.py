"""
MODEL 4: Predictor for Suspicious Android App Detection.
Fast inference returning probability (0.0 to 1.0) and explainable reasons.
"""

import os
import joblib
from typing import Tuple, List, Dict, Any
from models.app_model import extract_app_features_from_dict, extract_static_apk_features, APP_FEATURE_NAMES

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "saved_models",
    "app_model.joblib"
)

class AppPredictor:
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

    def predict_from_features(self, app_features: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Predict using pre-extracted metadata dictionary."""
        reasons = []

        if app_features.get("has_sms_permission"):
            reasons.append("Critical SMS interception permissions requested (READ_SMS / RECEIVE_SMS)")
        if app_features.get("has_overlay_permission"):
            reasons.append("Screen overlay permission requested (SYSTEM_ALERT_WINDOW), used in banking credential phishing")
        if app_features.get("name_similarity", 0.0) >= 0.70:
            reasons.append("App title/package clones authorized brand trademarks")
        if app_features.get("is_mod_apk"):
            reasons.append("Repackaged/cracked APK modification signature detected in binary")
        if app_features.get("dangerous_permissions_count", 0) >= 3:
            reasons.append(f"Elevated dangerous permissions count: {app_features.get('dangerous_permissions_count')}")

        if self.model is None:
            prob = 0.90 if len(reasons) >= 2 else (0.60 if len(reasons) == 1 else 0.15)
            return round(prob, 4), reasons

        feature_vector = [extract_app_features_from_dict(app_features)]
        prob = float(self.model.predict_proba(feature_vector)[0][1])
        return round(prob, 4), reasons

    def predict_from_apk_bytes(self, file_bytes: bytes, filename: str, brand_name: str = "ApexPay") -> Tuple[float, List[str], Dict[str, Any]]:
        """Safe static inspection and prediction from raw uploaded APK bytes."""
        app_features = extract_static_apk_features(file_bytes, filename, brand_name)
        prob, reasons = self.predict_from_features(app_features)
        return prob, reasons, app_features
