"""
MODEL 3: Training Script for Phishing/Suspicious URL Detection.
Extracts lexical features from URLs and trains Random Forest classifier.
"""

import os
import sys
import pandas as pd
import joblib

BASE_ML_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_ML_DIR not in sys.path:
    sys.path.insert(0, BASE_ML_DIR)

from models.url_model import extract_url_features, build_url_model, URL_FEATURE_NAMES
from models.base_models import train_test_split_fast, compute_accuracy, compute_roc_auc_fast

def train_url_model():
    dataset_path = os.path.join(BASE_ML_DIR, "datasets", "urls.csv")
    output_model_path = os.path.join(BASE_ML_DIR, "saved_models", "url_model.joblib")

    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at: {dataset_path}")

    print("=" * 60)
    print("TRAINING MODEL 3: Phishing URL Detection (Random Forest)")
    print("Data Source: Synthetic Hackathon Demo Dataset (urls.csv)")
    print("=" * 60)

    df = pd.read_csv(dataset_path)

    # Feature extraction
    feature_matrix = [extract_url_features(u) for u in df["url"]]
    X = pd.DataFrame(feature_matrix, columns=URL_FEATURE_NAMES)
    y = df["label"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split_fast(
        X, y, test_size=0.25, random_state=42
    )

    model = build_url_model()
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    acc = compute_accuracy(y_test, y_pred)
    auc = compute_roc_auc_fast(y_test, y_prob)

    print(f"\n[Validation Results - Demo Training]")
    print(f"Accuracy: {acc * 100:.2f}% | ROC-AUC: {auc:.4f}")
    print(f"Test Samples: {len(y_test)} | Positives: {int(sum(y_test))}")

    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
    artifact = {
        "model": model,
        "feature_names": URL_FEATURE_NAMES,
        "model_type": "FastRandomForestClassifier",
        "description": "Model 3: Phishing/Suspicious URL Classifier",
        "trained_on": "Demo Synthetic Dataset",
        "accuracy": float(acc),
        "roc_auc": float(auc)
    }
    joblib.dump(artifact, output_model_path)
    print(f"[Saved] Model artifact saved -> {output_model_path}")
    return artifact

if __name__ == "__main__":
    train_url_model()
