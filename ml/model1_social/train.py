"""
MODEL 1: Training script for Fake Social Profile Detection.
"""

import os
import sys
import pandas as pd
import numpy as np
import joblib

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_ML_DIR = os.path.dirname(CURRENT_DIR)

try:
    from .model import build_model, FEATURE_NAMES
except ImportError:
    from model import build_model, FEATURE_NAMES

def train():
    dataset_path = os.path.join(BASE_ML_DIR, "datasets", "social_profiles.csv")
    output_model_path = os.path.join(BASE_ML_DIR, "saved_models", "social_model.joblib")

    print("[Model 1] Training Fake Social Profile Classifier...")
    df = pd.read_csv(dataset_path)

    # 80/20 train/test split
    np.random.seed(42)
    indices = np.random.permutation(len(df))
    split = int(len(df) * 0.8)
    train_idx, test_idx = indices[:split], indices[split:]

    X_train = df[FEATURE_NAMES].iloc[train_idx]
    y_train = df["label"].iloc[train_idx].to_numpy()
    X_test = df[FEATURE_NAMES].iloc[test_idx]
    y_test = df["label"].iloc[test_idx].to_numpy()

    model = build_model()
    model.fit(X_train, y_train)

    # Evaluation
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    accuracy = float(np.mean(y_pred == y_test))

    print(f"[Model 1] Test Accuracy: {accuracy * 100:.2f}% | Test Samples: {len(y_test)}")

    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
    artifact = {
        "model": model,
        "feature_names": FEATURE_NAMES,
        "model_type": "SocialRandomForest",
        "accuracy": accuracy
    }
    joblib.dump(artifact, output_model_path)
    print(f"[Model 1] Saved model to: {output_model_path}")
    return artifact

if __name__ == "__main__":
    train()
