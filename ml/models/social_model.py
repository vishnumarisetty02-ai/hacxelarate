"""
MODEL 1: Fake Social Profile Detection
Model architecture and tabular feature definitions.
Uses FastRandomForestClassifier for lightweight, explainable, and fast tabular inference.
"""

from typing import List, Dict, Any
from .base_models import FastRandomForestClassifier

FEATURE_NAMES = [
    "username_similarity",
    "name_similarity",
    "bio_similarity",
    "followers",
    "following",
    "post_count",
    "account_age_days",
    "verified",
    "has_external_url",
    "profile_image_similarity"
]

def build_social_model() -> FastRandomForestClassifier:
    """Instantiate lightweight explainable Random Forest classifier."""
    return FastRandomForestClassifier(
        n_estimators=15,
        max_depth=5,
        random_state=42
    )

def extract_social_features(profile_data: Dict[str, Any]) -> List[float]:
    """
    Extracts tabular feature vector from profile data dictionary.
    Safe fallbacks for missing values.
    """
    return [
        float(profile_data.get("username_similarity", 0.0)),
        float(profile_data.get("name_similarity", 0.0)),
        float(profile_data.get("bio_similarity", 0.0)),
        float(profile_data.get("followers", 0)),
        float(profile_data.get("following", 0)),
        float(profile_data.get("post_count", 0)),
        float(profile_data.get("account_age_days", 30)),
        1.0 if profile_data.get("verified", False) else 0.0,
        1.0 if profile_data.get("has_external_url", False) or profile_data.get("external_url") else 0.0,
        float(profile_data.get("profile_image_similarity", 0.0))
    ]
