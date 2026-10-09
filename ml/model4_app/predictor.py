"""
MODEL 4: Predictor for Suspicious Android App Detection.
Outputs probability between 0.0 and 1.0.
"""

import os
import joblib
from typing import Tuple, List, Dict, Any

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_ML_DIR = os.path.dirname(CURRENT_DIR)
MODEL_PATH = os.path.join(BASE_ML_DIR, "saved_models", "app_model.joblib")

from model import extract_features_from_dict, extract_static_apk_features

class AppPredictor:
    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.model = None
        self._load()

    def _load(self):
        if os.path.exists(self.model_path):
            artifact = joblib.load(self.model_path)
            self.model = artifact.get("model")

    def predict_from_features(self, app_features: Dict[str, Any]) -> Tuple[float, List[str]]:
        reasons = []

        if app_features.get("has_sms_permission"):
            reasons.append("Critical SMS interception permissions requested")
        if app_features.get("has_overlay_permission"):
            reasons.append("Screen overlay permission requested (SYSTEM_ALERT_WINDOW)")
        if app_features.get("name_similarity", 0.0) >= 0.70:
            reasons.append("App title/package clones authorized brand trademarks")
        if app_features.get("is_mod_apk"):
            reasons.append("Repackaged/cracked APK modification signature detected")
        if app_features.get("dangerous_permissions_count", 0) >= 3:
            reasons.append(f"Elevated dangerous permissions count: {app_features.get('dangerous_permissions_count')}")

        if self.model is None:
            prob = 0.90 if len(reasons) >= 2 else (0.50 if len(reasons) == 1 else 0.15)
            return round(prob, 4), reasons

        vec = [extract_features_from_dict(app_features)]
        prob = float(self.model.predict_proba(vec)[0][1])
        return round(prob, 4), reasons

    def predict_from_apk_bytes(self, file_bytes: bytes, filename: str, brand_name: str = "ApexPay") -> Tuple[float, List[str], Dict[str, Any]]:
        app_features = extract_static_apk_features(file_bytes, filename, brand_name)
        prob, reasons = self.predict_from_features(app_features)
        return prob, reasons, app_features

def predict(app_features: Dict[str, Any]) -> float:
    predictor = AppPredictor()
    prob, _ = predictor.predict_from_features(app_features)
    return prob
