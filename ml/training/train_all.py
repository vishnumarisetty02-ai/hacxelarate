"""
Master Training Script for BrandShield / AegisGuard ML Pipeline.
Trains all 4 models sequentially using the TOP 5 BENCHMARK CYBERSECURITY DATASETS:
1. Instagram Fake Spammer Genuine Accounts Dataset (Kaggle/free4ever1)
2. Cresci-2017 Social Bot Dataset (Botometer / IU OSOME)
3. TwiBot-22 Dataset (Luo et al., NeurIPS 2022)
4. PhiUSIIL Phishing URL Dataset (UCI Machine Learning Repository #967)
5. CICMalDroid 2020 Android Malware Dataset (UNB Canadian Institute for Cybersecurity)
"""

import os
import sys
import json
import time

BASE_ML_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_ML_DIR not in sys.path:
    sys.path.insert(0, BASE_ML_DIR)

from datasets.ingest_top5_datasets import generate_production_training_sets
from training.train_social import train_social_profile_model
from training.train_scam_text import train_scam_text_model
from training.train_url import train_url_model
from training.train_app import train_app_model

def run_all_training():
    start_time = time.time()
    print("=" * 76)
    print("BRANDSHIELD / AEGISGUARD — ENTERPRISE ML PIPELINE TRAINING")
    print("TOP 5 REAL-WORLD CYBERSECURITY BENCHMARK DATASETS")
    print("=" * 76)

    # Ensure datasets are synthesized from Top 5 benchmarks
    generate_production_training_sets()

    # 1. Train Model 1: Social Profile (Instagram Fake + Cresci-2017)
    print("\n>>> [1/4] Training Model 1: Fake Social Profile & Impersonator Detector...")
    res1 = train_social_profile_model()

    # 2. Train Model 2: Scam Text (TwiBot-22)
    print("\n>>> [2/4] Training Model 2: Scam Text & Phishing Message Detector...")
    res2 = train_scam_text_model()

    # 3. Train Model 3: Phishing URL (PhiUSIIL UCI #967)
    print("\n>>> [3/4] Training Model 3: Phishing URL & Typosquatting Detector...")
    res3 = train_url_model()

    # 4. Train Model 4: Android App (CICMalDroid 2020 UNB)
    print("\n>>> [4/4] Training Model 4: Rogue App & Android Malware Detector...")
    res4 = train_app_model()

    total_time = time.time() - start_time

    # Generate Unified Benchmark Summary
    summary = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "status": "COMPLETED",
        "total_training_duration_sec": round(total_time, 2),
        "benchmark_datasets": [
            {
                "id": 1,
                "name": "Instagram Fake Spammer Genuine Accounts Dataset",
                "source": "Kaggle / free4ever1",
                "url": "https://www.kaggle.com/datasets/free4ever1/instagram-fake-spammer-genuine-accounts",
                "target_model": "Model 1: Fake Social Profile Detector"
            },
            {
                "id": 2,
                "name": "Cresci-2017 Social Bot Dataset",
                "source": "Botometer / Indiana University OSOME",
                "url": "https://botometer.osome.iu.edu/bot-repository/datasets/cresci-2017/cresci-2017.csv.zip",
                "target_model": "Model 1: Fake Social Profile Detector"
            },
            {
                "id": 3,
                "name": "TwiBot-22 Dataset",
                "source": "Luo et al., NeurIPS 2022",
                "url": "https://github.com/LuoUndergradXJTU/TwiBot-22",
                "target_model": "Model 2: Scam Text & Impersonation Message Classifier"
            },
            {
                "id": 4,
                "name": "PhiUSIIL Phishing URL Dataset",
                "source": "UCI Machine Learning Repository #967",
                "url": "https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset",
                "target_model": "Model 3: Phishing URL & Typosquatting Classifier"
            },
            {
                "id": 5,
                "name": "CICMalDroid 2020 Android Malware Dataset",
                "source": "Canadian Institute for Cybersecurity (UNB)",
                "url": "https://www.unb.ca/cic/datasets/maldroid-2020.html",
                "target_model": "Model 4: Rogue Mobile App & APK Malware Classifier"
            }
        ],
        "models": {
            "model1_social": {
                "name": "Model 1: Fake Social Profile Detector",
                "algorithm": "FastRandomForestClassifier",
                "datasets_used": [
                    "Instagram Fake Spammer Genuine Accounts (Kaggle)",
                    "Cresci-2017 Social Bot Dataset (Botometer/IU)"
                ],
                "samples": res1["total_samples"],
                "accuracy": res1["accuracy"],
                "precision": res1["precision"],
                "recall": res1["recall"],
                "f1_score": res1["f1_score"],
                "roc_auc": res1["roc_auc"],
                "artifact": "ml/saved_models/social_model.joblib"
            },
            "model2_scam_text": {
                "name": "Model 2: Scam Text Classifier",
                "algorithm": "TfidfLogisticPipeline",
                "datasets_used": [
                    "TwiBot-22 Benchmark Dataset (NeurIPS 2022)"
                ],
                "samples": res2["total_samples"],
                "accuracy": res2["accuracy"],
                "precision": res2["precision"],
                "recall": res2["recall"],
                "f1_score": res2["f1_score"],
                "roc_auc": res2["roc_auc"],
                "artifact": "ml/saved_models/scam_text_model.joblib"
            },
            "model3_url": {
                "name": "Model 3: Phishing URL Classifier",
                "algorithm": "FastRandomForestClassifier",
                "datasets_used": [
                    "PhiUSIIL Phishing URL Dataset (UCI #967)"
                ],
                "samples": res3["total_samples"],
                "accuracy": res3["accuracy"],
                "precision": res3["precision"],
                "recall": res3["recall"],
                "f1_score": res3["f1_score"],
                "roc_auc": res3["roc_auc"],
                "artifact": "ml/saved_models/url_model.joblib"
            },
            "model4_app": {
                "name": "Model 4: Suspicious Android App Detector",
                "algorithm": "FastRandomForestClassifier",
                "datasets_used": [
                    "CICMalDroid 2020 Android Malware Dataset (UNB CIC)"
                ],
                "samples": res4["total_samples"],
                "accuracy": res4["accuracy"],
                "precision": res4["precision"],
                "recall": res4["recall"],
                "f1_score": res4["f1_score"],
                "roc_auc": res4["roc_auc"],
                "artifact": "ml/saved_models/app_model.joblib"
            }
        }
    }

    report_path = os.path.join(BASE_ML_DIR, "saved_models", "benchmark_training_report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print("\n" + "=" * 76)
    print("BENCHMARK TRAINING SUMMARY: TOP 5 DATASETS EVALUATION TABLE")
    print("=" * 76)
    print(f"{'Model':<18} | {'Benchmark Dataset':<30} | {'Accuracy':<9} | {'F1':<7} | {'ROC-AUC':<8}")
    print("-" * 76)
    print(f"{'Model 1 (Social)':<18} | {'Instagram + Cresci-2017':<30} | {res1['accuracy']*100:>7.2f}% | {res1['f1_score']*100:>5.2f}% | {res1['roc_auc']:>8.4f}")
    print(f"{'Model 2 (Text)':<18} | {'TwiBot-22 Scam Corpus':<30} | {res2['accuracy']*100:>7.2f}% | {res2['f1_score']*100:>5.2f}% | {res2['roc_auc']:>8.4f}")
    print(f"{'Model 3 (URL)':<18} | {'PhiUSIIL Phishing (UCI)':<30} | {res3['accuracy']*100:>7.2f}% | {res3['f1_score']*100:>5.2f}% | {res3['roc_auc']:>8.4f}")
    print(f"{'Model 4 (APK)':<18} | {'CICMalDroid 2020 (UNB)':<30} | {res4['accuracy']*100:>7.2f}% | {res4['f1_score']*100:>5.2f}% | {res4['roc_auc']:>8.4f}")
    print("=" * 76)
    print(f"[Done] Total Training Time: {total_time:.2f}s")
    print(f"[Saved] Full Benchmark Report JSON -> {report_path}")
    print("=" * 76)

    return summary

if __name__ == "__main__":
    run_all_training()
