"""
ML Models Integration for Backend Services.
Exposes Model 1, Model 2, Model 3, Model 4, and the Unified Risk Engine.
"""

import os
import sys

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT_DIR = os.path.dirname(BACKEND_DIR)
ML_DIR = os.path.join(ROOT_DIR, "ml")

if ML_DIR not in sys.path:
    sys.path.insert(0, ML_DIR)

from model1_social.predictor import SocialProfilePredictor
from model2_scam_text.predictor import ScamTextPredictor
from model3_url.predictor import UrlPredictor
from model4_app.predictor import AppPredictor
from risk_engine import global_ml_risk_engine, MLRiskEngine

# Exported predictors
social_model_predictor = SocialProfilePredictor()
scam_text_model_predictor = ScamTextPredictor()
url_model_predictor = UrlPredictor()
app_model_predictor = AppPredictor()
unified_risk_engine = global_ml_risk_engine

__all__ = [
    "social_model_predictor",
    "scam_text_model_predictor",
    "url_model_predictor",
    "app_model_predictor",
    "unified_risk_engine"
]
