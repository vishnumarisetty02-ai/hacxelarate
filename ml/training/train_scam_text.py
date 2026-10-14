"""
MODEL 2: Training Script for Scam Text Detection.
Trained on TOP BENCHMARK DATASET:
3. TwiBot-22 Dataset (Luo et al., NeurIPS 2022)
"""

import os
import sys
import pandas as pd
import numpy as np
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

    print("=" * 70)
    print("TRAINING MODEL 2: Scam Text Detection (TF-IDF + Logistic Regression)")
    print("Benchmark Dataset:")
    print("  - TwiBot-22 Dataset (Luo et al., NeurIPS 2022)")
    print("=" * 70)

    df = pd.read_csv(dataset_path)
    X = df["text"].astype(str)
    y = df["label"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split_fast(
        X, y, test_size=0.20, random_state=42
    )

    pipeline = TfidfLogisticPipeline()
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

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

    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
    artifact = {
        "pipeline": pipeline,
        "model_type": "TfidfLogisticPipeline",
        "description": "Model 2: Scam Text & Phishing Message Classifier",
        "trained_on": "TwiBot-22 Benchmark Scam & Bot Dataset",
        "datasets": [
            "TwiBot-22 Dataset (Luo et al., NeurIPS 2022)"
        ],
        "dataset_urls": [
            "https://github.com/LuoUndergradXJTU/TwiBot-22"
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
    train_scam_text_model()
