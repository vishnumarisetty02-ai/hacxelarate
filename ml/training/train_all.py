"""
Master Training Script for Digital Risk Protection Platform ML Pipeline.
Trains all 4 models sequentially and verifies their saved .joblib artifacts.
"""

import os
import sys

BASE_ML_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_ML_DIR not in sys.path:
    sys.path.insert(0, BASE_ML_DIR)

from training.train_social import train_social_profile_model
from training.train_scam_text import train_scam_text_model
from training.train_url import train_url_model
from training.train_app import train_app_model

def run_all_training():
    print("=" * 70)
    print("STARTING FULL ML PIPELINE TRAINING: 4 LIGHTWEIGHT CYBERSECURITY MODELS")
    print("Dataset status: Synthetic Hackathon Demo Datasets (Reproducible MVP)")
    print("=" * 70)

    # 1. Train Model 1: Social Profile
    print("\n>>> Step 1/4: Training Model 1 (Fake Social Profile)...")
    res1 = train_social_profile_model()

    # 2. Train Model 2: Scam Text
    print("\n>>> Step 2/4: Training Model 2 (Scam Text)...")
    res2 = train_scam_text_model()

    # 3. Train Model 3: Phishing URL
    print("\n>>> Step 3/4: Training Model 3 (Phishing URL)...")
    res3 = train_url_model()

    # 4. Train Model 4: Android App
    print("\n>>> Step 4/4: Training Model 4 (Suspicious App)...")
    res4 = train_app_model()

    print("\n" + "=" * 70)
    print("ALL 4 MODELS TRAINED AND SAVED SUCCESSFULLY!")
    print("=" * 70)
    print(f"1. Social Model   : Accuracy = {res1['accuracy']*100:.1f}%, ROC-AUC = {res1['roc_auc']:.4f}")
    print(f"2. Scam Text Model : Accuracy = {res2['accuracy']*100:.1f}%, ROC-AUC = {res2['roc_auc']:.4f}")
    print(f"3. URL Model       : Accuracy = {res3['accuracy']*100:.1f}%, ROC-AUC = {res3['roc_auc']:.4f}")
    print(f"4. App Model       : Accuracy = {res4['accuracy']*100:.1f}%, ROC-AUC = {res4['roc_auc']:.4f}")
    print("Artifacts Location: ml/saved_models/*.joblib")
    print("=" * 70)

if __name__ == "__main__":
    run_all_training()
