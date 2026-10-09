"""
MODEL 4: Training script for Suspicious Android App Detection.
"""

import os
import sys
import pandas as pd
import numpy as np
import joblib

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_ML_DIR = os.path.dirname(CURRENT_DIR)

from model import build_model, APP_FEATURE_NAMES

def train():
    dataset_path = os.path.join(BASE_ML_DIR, "datasets", "apps.csv")
    output_model_path = os.path.join(BASE_ML_DIR, "saved_models", "app_model.joblib")

    print("[Model 4] Training Suspicious Android App Classifier (Random Forest)...")
    df = pd.read_csv(dataset_path)

    X = df[APP_FEATURE_NAMES]
    y = df["label"].astype(int).to_numpy()

    # 80/20 split
    np.random.seed(42)
    indices = np.random.permutation(len(df))
    split = int(len(df) * 0.8)
    train_idx, test_idx = indices[:split], indices[split:]

    X_train, y_train = X.iloc[train_idx], y[train_idx]
    X_test, y_test = X.iloc[test_idx], y[test_idx]

    model = build_model()
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = float(np.mean(y_pred == y_test))

    print(f"[Model 4] Test Accuracy: {accuracy * 100:.2f}% | Test Samples: {len(y_test)}")

    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
    artifact = {
        "model": model,
        "feature_names": APP_FEATURE_NAMES,
        "model_type": "AppRandomForest",
        "accuracy": accuracy
    }
    joblib.dump(artifact, output_model_path)
    print(f"[Model 4] Saved model to: {output_model_path}")
    return artifact

if __name__ == "__main__":
    train()
