"""
MODEL 3: Training script for Phishing/Suspicious URL Detection.
"""

import os
import sys
import pandas as pd
import numpy as np
import joblib

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_ML_DIR = os.path.dirname(CURRENT_DIR)

from model import build_model, extract_features, URL_FEATURE_NAMES

def train():
    dataset_path = os.path.join(BASE_ML_DIR, "datasets", "urls.csv")
    output_model_path = os.path.join(BASE_ML_DIR, "saved_models", "url_model.joblib")

    print("[Model 3] Training Phishing URL Classifier (Random Forest)...")
    df = pd.read_csv(dataset_path)

    features = [extract_features(u) for u in df["url"]]
    X = pd.DataFrame(features, columns=URL_FEATURE_NAMES)
    y = df["label"].astype(int).to_numpy()

    # 75/25 split
    np.random.seed(42)
    indices = np.random.permutation(len(df))
    split = int(len(df) * 0.75)
    train_idx, test_idx = indices[:split], indices[split:]

    X_train, y_train = X.iloc[train_idx], y[train_idx]
    X_test, y_test = X.iloc[test_idx], y[test_idx]

    model = build_model()
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = float(np.mean(y_pred == y_test))

    print(f"[Model 3] Test Accuracy: {accuracy * 100:.2f}% | Test Samples: {len(y_test)}")

    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
    artifact = {
        "model": model,
        "feature_names": URL_FEATURE_NAMES,
        "model_type": "UrlRandomForest",
        "accuracy": accuracy
    }
    joblib.dump(artifact, output_model_path)
    print(f"[Model 3] Saved model to: {output_model_path}")
    return artifact

if __name__ == "__main__":
    train()
