"""
Unified ML Risk Engine for Digital Risk Protection Platform.
Combines probabilities from 4 ML models into a calibrated 0-100 explainable risk score.
Output Schema:
{
  "risk_score": 91,
  "risk_level": "CRITICAL",
  "reasons": [
    "High username similarity",
    "Suspicious external URL",
    "Scam language detected"
  ],
  "confidence": 95.2,
  "probabilities": {
    "social": 0.92,
    "scam_text": 0.88,
    "url": 0.94,
    "app": 0.90
  }
}
"""

import os
import sys
from typing import Dict, Any, List, Optional

BASE_ML_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_ML_DIR not in sys.path:
    sys.path.insert(0, BASE_ML_DIR)

from predictors.social_predictor import SocialProfilePredictor
from predictors.scam_text_predictor import ScamTextPredictor
from predictors.url_predictor import UrlPredictor
from predictors.app_predictor import AppPredictor

def get_risk_level_string(score: int) -> str:
    if score >= 80:
        return "CRITICAL"
    if score >= 60:
        return "HIGH"
    if score >= 40:
        return "MEDIUM"
    return "LOW"

class MLRiskEngine:
    def __init__(self):
        self.social_predictor = SocialProfilePredictor()
        self.scam_text_predictor = ScamTextPredictor()
        self.url_predictor = UrlPredictor()
        self.app_predictor = AppPredictor()

    def evaluate_social_entity(
        self,
        profile_data: Dict[str, Any],
        bio_text: Optional[str] = None,
        attached_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """Evaluates suspect social account combining Model 1, Model 2 (bio), and Model 3 (URL)."""
        reasons = []
        probabilities = {}
        weights = []

        # 1. Model 1: Social Profile ML
        social_prob, social_reasons = self.social_predictor.predict_proba(profile_data)
        probabilities["social_profile_model"] = social_prob
        reasons.extend(social_reasons)
        weights.append((social_prob, 0.50))

        # 2. Model 2: Bio text scam classification
        bio_to_check = bio_text or profile_data.get("bio", "")
        if bio_to_check:
            text_prob, text_reasons = self.scam_text_predictor.predict_proba(bio_to_check)
            probabilities["scam_text_model"] = text_prob
            reasons.extend(text_reasons)
            weights.append((text_prob, 0.25))

        # 3. Model 3: External URL classification
        url_to_check = attached_url or profile_data.get("external_url")
        if url_to_check:
            url_prob, url_reasons = self.url_predictor.predict_proba(url_to_check)
            probabilities["url_phishing_model"] = url_prob
            reasons.extend(url_reasons)
            weights.append((url_prob, 0.25))

        # Weighted combination
        total_weight = sum(w for _, w in weights)
        combined_prob = sum(p * w for p, w in weights) / total_weight if total_weight > 0 else social_prob

        # Calibrate to 0-100 score
        risk_score = int(round(combined_prob * 100))
        risk_score = min(100, max(0, risk_score))
        risk_level = get_risk_level_string(risk_score)

        # De-duplicate reasons
        dedup_reasons = list(dict.fromkeys(reasons))
        if not dedup_reasons:
            dedup_reasons.append("Baseline background telemetry normal.")

        confidence = round(min(99.0, 75.0 + (len(dedup_reasons) * 4.5)), 1)

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "confidence": confidence,
            "reasons": dedup_reasons,
            "probabilities": probabilities
        }

    def evaluate_url_entity(self, url: str) -> Dict[str, Any]:
        """Evaluates suspect URL with Model 3."""
        prob, reasons = self.url_predictor.predict_proba(url)
        risk_score = int(round(prob * 100))
        risk_level = get_risk_level_string(risk_score)
        confidence = round(min(98.8, 70.0 + (len(reasons) * 7.0)), 1)

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "confidence": confidence,
            "reasons": reasons if reasons else ["Standard structural domain patterns."],
            "probabilities": {"url_model": prob}
        }

    def evaluate_text_content(self, text: str, url: Optional[str] = None) -> Dict[str, Any]:
        """Evaluates message text with Model 2 and embedded link with Model 3."""
        text_prob, text_reasons = self.scam_text_predictor.predict_proba(text)
        reasons = list(text_reasons)
        probabilities = {"scam_text_model": text_prob}

        if url:
            url_prob, url_reasons = self.url_predictor.predict_proba(url)
            probabilities["url_model"] = url_prob
            reasons.extend(url_reasons)
            combined_prob = (text_prob * 0.6) + (url_prob * 0.4)
        else:
            combined_prob = text_prob

        risk_score = int(round(combined_prob * 100))
        risk_level = get_risk_level_string(risk_score)

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "confidence": round(min(98.5, 72.0 + len(reasons) * 6.0), 1),
            "reasons": list(dict.fromkeys(reasons)) or ["Normal communication patterns."],
            "probabilities": probabilities
        }

    def evaluate_app_entity(self, file_bytes: bytes, filename: str, brand_name: str = "ApexPay") -> Dict[str, Any]:
        """Evaluates uploaded APK using Model 4."""
        prob, reasons, app_features = self.app_predictor.predict_from_apk_bytes(file_bytes, filename, brand_name)
        risk_score = int(round(prob * 100))
        risk_level = get_risk_level_string(risk_score)
        confidence = round(min(99.0, 75.0 + len(reasons) * 6.0), 1)

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "confidence": confidence,
            "reasons": reasons if reasons else ["Standard Android APK profile."],
            "probabilities": {"app_model": prob},
            "features": app_features
        }

# Global singleton instance
global_ml_risk_engine = MLRiskEngine()
