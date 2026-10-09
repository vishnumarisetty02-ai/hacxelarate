"""
MODEL 1: Training Script for Fake Social Profile Detection.
Trains Random Forest model on tabular profile features and saves artifact.
"""

import os
import sys
import pandas as pd
import joblib

BASE_ML_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_ML_DIR not in sys.path:
    sys.path.insert(0, BASE_ML_DIR)

from models.social_model import build_social_model, FEATURE_NAMES
from models.base_models import train_test_split_fast, compute_accuracy, compute_roc_auc_fast

def train_social_profile_model():
    dataset_path = os.path.join(BASE_ML_DIR, "datasets", "social_profiles.csv")
    output_model_path = os.path.join(BASE_ML_DIR, "saved_models", "social_model.joblib")

    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at: {dataset_path}")

    print("=" * 60)
    print("TRAINING MODEL 1: Fake Social Profile Detection (Random Forest)")
    print("Data Source: Synthetic Hackathon Demo Dataset (social_profiles.csv)")
    print("=" * 60)

    df = pd.read_csv(dataset_path)
    X = df[FEATURE_NAMES]
    y = df["label"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split_fast(
        X, y, test_size=0.20, random_state=42
    )

    model = build_social_model()
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    acc = compute_accuracy(y_test, y_pred)
    auc = compute_roc_auc_fast(y_test, y_prob)

    print(f"\n[Validation Results - Demo Training]")
    print(f"Accuracy: {acc * 100:.2f}% | ROC-AUC: {auc:.4f}")
    print(f"Test Samples: {len(y_test)} | Positives: {int(sum(y_test))}")

    # Save artifact
    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
    artifact = {
        "model": model,
        "feature_names": FEATURE_NAMES,
        "model_type": "FastRandomForestClassifier",
        "description": "Model 1: Fake Social Profile Detector",
        "trained_on": "Demo Synthetic Dataset",
        "accuracy": float(acc),
        "roc_auc": float(auc)
    }
    joblib.dump(artifact, output_model_path)
    print(f"[Saved] Model artifact saved -> {output_model_path}")
    return artifact

if __name__ == "__main__":
    train_social_profile_model()
