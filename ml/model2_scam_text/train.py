"""
MODEL 2: Training script for Scam Text Detection.
"""

import os
import sys
import pandas as pd
import numpy as np
import joblib

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_ML_DIR = os.path.dirname(CURRENT_DIR)

from model import build_model

def train():
    dataset_path = os.path.join(BASE_ML_DIR, "datasets", "scam_text.csv")
    output_model_path = os.path.join(BASE_ML_DIR, "saved_models", "scam_text_model.joblib")

    print("[Model 2] Training Scam Text Classifier (TF-IDF + Logistic Regression)...")
    df = pd.read_csv(dataset_path)

    # 75/25 split
    np.random.seed(42)
    indices = np.random.permutation(len(df))
    split = int(len(df) * 0.75)
    train_idx, test_idx = indices[:split], indices[split:]

    X_train = df["text"].iloc[train_idx].astype(str)
    y_train = df["label"].iloc[train_idx].to_numpy()
    X_test = df["text"].iloc[test_idx].astype(str)
    y_test = df["label"].iloc[test_idx].to_numpy()

    pipeline = build_model()
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    accuracy = float(np.mean(y_pred == y_test))

    print(f"[Model 2] Test Accuracy: {accuracy * 100:.2f}% | Test Samples: {len(y_test)}")

    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
    artifact = {
        "pipeline": pipeline,
        "model_type": "ScamTextPipeline",
        "accuracy": accuracy
    }
    joblib.dump(artifact, output_model_path)
    print(f"[Model 2] Saved model to: {output_model_path}")
    return artifact

if __name__ == "__main__":
    train()
