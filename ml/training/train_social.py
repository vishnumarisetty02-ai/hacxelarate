"""
MODEL 1: Training Script for Fake Social Profile & Impersonator Detection.
Trained on TOP BENCHMARK DATASETS:
1. Instagram Fake Spammer Genuine Accounts Dataset (Kaggle/free4ever1)
2. Cresci-2017 Social Bot Dataset (Botometer / IU OSOME)
"""

import os
import sys
import pandas as pd
import numpy as np
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

    print("=" * 70)
    print("TRAINING MODEL 1: Fake Social Profile Detection (Random Forest)")
    print("Benchmark Datasets:")
    print("  - Instagram Fake Spammer Genuine Accounts (Kaggle/free4ever1)")
    print("  - Cresci-2017 Social Bot Dataset (Botometer / IU OSOME)")
    print("=" * 70)

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

    tp = int(np.sum((y_test == 1) & (y_pred == 1)))
    fp = int(np.sum((y_test == 0) & (y_pred == 1)))
    fn = int(np.sum((y_test == 1) & (y_pred == 0)))
    tn = int(np.sum((y_test == 0) & (y_pred == 0)))

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0

    print(f"\n[Validation Results - Top 5 Datasets Benchmark]")
    print(f"Total Samples : {len(df)} (Train: {len(y_train)}, Test: {len(y_test)})")
    print(f"Accuracy      : {acc * 100:.2f}%")
    print(f"Precision     : {precision * 100:.2f}%")
    print(f"Recall        : {recall * 100:.2f}%")
    print(f"F1-Score      : {f1 * 100:.2f}%")
    print(f"ROC-AUC       : {auc:.4f}")
    print(f"Confusion Mtx : TP={tp}, FP={fp}, FN={fn}, TN={tn}")

    # Save artifact
    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
    artifact = {
        "model": model,
        "feature_names": FEATURE_NAMES,
        "model_type": "FastRandomForestClassifier",
        "description": "Model 1: Fake Social Profile & Impersonator Detector",
        "trained_on": "Instagram Fake Spammer & Cresci-2017 Social Bot Datasets",
        "datasets": [
            "Instagram Fake Spammer Genuine Accounts (Kaggle/free4ever1)",
            "Cresci-2017 Social Bot Dataset (Botometer / IU OSOME)"
        ],
        "dataset_urls": [
            "https://www.kaggle.com/datasets/free4ever1/instagram-fake-spammer-genuine-accounts",
            "https://botometer.osome.iu.edu/bot-repository/datasets/cresci-2017/cresci-2017.csv.zip"
        ],
        "total_samples": int(len(df)),
        "accuracy": float(acc),
        "precision": float(precision),
        "recall": float(recall),
        "f1_score": float(f1),
        "roc_auc": float(auc)
    }
    joblib.dump(artifact, output_model_path)
    print(f"[Saved] Model artifact saved -> {output_model_path}")
    return artifact

if __name__ == "__main__":
    train_social_profile_model()
