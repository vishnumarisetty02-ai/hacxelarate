"""
ML Bridge: Connects FastAPI backend directly to the trained ML models in ml/
"""

import os
import sys

BASE_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT_DIR = os.path.dirname(BASE_BACKEND_DIR)
ML_DIR = os.path.join(ROOT_DIR, "ml")

if ML_DIR not in sys.path:
    sys.path.insert(0, ML_DIR)

try:
    from risk_engine import global_ml_risk_engine, MLRiskEngine
    ML_AVAILABLE = True
except Exception as e:
    print(f"[AegisGuard ML Bridge] Warning: Could not initialize ML Risk Engine: {e}")
    global_ml_risk_engine = None
    ML_AVAILABLE = False
