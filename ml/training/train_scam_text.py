"""
MODEL 2: Training Script for Scam Text Detection.
Trains TF-IDF + Logistic Regression model on synthetic demo messages.
"""

import os
import sys
import pandas as pd
import joblib

BASE_ML_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_ML_DIR not in sys.path:
    sys.path.insert(0, BASE_ML_DIR)

from models.scam_text_model import TfidfLogisticPipeline
from models.base_models import train_test_split_fast, compute_accuracy, compute_roc_auc_fast

def train_scam_text_model():
    dataset_path = os.path.join(BASE_ML_DIR, "datasets", "scam_text.csv")
    output_model_path = os.path.join(BASE_ML_DIR, "saved_models", "scam_text_model.joblib")

    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at: {dataset_path}")

    print("=" * 60)
    print("TRAINING MODEL 2: Scam Text Detection (TF-IDF + Logistic Regression)")
    print("Data Source: Synthetic Hackathon Demo Dataset (scam_text.csv)")
    print("=" * 60)

    df = pd.read_csv(dataset_path)
    X = df["text"].astype(str)
    y = df["label"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split_fast(
        X, y, test_size=0.25, random_state=42
    )

    pipeline = TfidfLogisticPipeline()
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    acc = compute_accuracy(y_test, y_pred)
    auc = compute_roc_auc_fast(y_test, y_prob)

    print(f"\n[Validation Results - Demo Training]")
    print(f"Accuracy: {acc * 100:.2f}% | ROC-AUC: {auc:.4f}")
    print(f"Test Samples: {len(y_test)} | Positives: {int(sum(y_test))}")

    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
    artifact = {
        "pipeline": pipeline,
        "model_type": "TfidfLogisticPipeline",
        "description": "Model 2: Scam Text Classifier",
        "trained_on": "Demo Synthetic Dataset",
        "accuracy": float(acc),
        "roc_auc": float(auc)
    }
    joblib.dump(artifact, output_model_path)
    print(f"[Saved] Model artifact saved -> {output_model_path}")
    return artifact

if __name__ == "__main__":
    train_scam_text_model()
