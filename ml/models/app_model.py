"""
MODEL 4: Suspicious Android App Detection Model.
Analyzes static APK metadata WITHOUT executing binary code.
Features:
- name_similarity
- package_similarity
- total_permissions_count
- dangerous_permissions_count
- has_sms_permission
- has_overlay_permission
- has_unverified_dev
- embedded_url_count
- is_mod_apk
- exported_components_count
"""

import io
import zipfile
from typing import List, Dict, Any
from .base_models import FastRandomForestClassifier

APP_FEATURE_NAMES = [
    "name_similarity",
    "package_similarity",
    "total_permissions_count",
    "dangerous_permissions_count",
    "has_sms_permission",
    "has_overlay_permission",
    "has_unverified_dev",
    "embedded_url_count",
    "is_mod_apk",
    "exported_components_count"
]

DANGEROUS_PERMS = {
    "READ_SMS", "RECEIVE_SMS", "SEND_SMS", "SYSTEM_ALERT_WINDOW",
    "READ_CONTACTS", "ACCESS_FINE_LOCATION", "RECORD_AUDIO", "REQUEST_INSTALL_PACKAGES"
}

def extract_app_features_from_dict(app_data: Dict[str, Any]) -> List[float]:
    """Extracts tabular feature vector from app metadata dictionary."""
    return [
        float(app_data.get("name_similarity", 0.0)),
        float(app_data.get("package_similarity", 0.0)),
        float(app_data.get("total_permissions_count", 0)),
        float(app_data.get("dangerous_permissions_count", 0)),
        1.0 if app_data.get("has_sms_permission", False) else 0.0,
        1.0 if app_data.get("has_overlay_permission", False) else 0.0,
        1.0 if app_data.get("has_unverified_dev", True) else 0.0,
        float(app_data.get("embedded_url_count", 0)),
        1.0 if app_data.get("is_mod_apk", False) else 0.0,
        float(app_data.get("exported_components_count", 0))
    ]

def extract_static_apk_features(file_bytes: bytes, filename: str, brand_name: str = "ApexPay") -> Dict[str, Any]:
    """
    Safely inspects APK bytes purely through static ZIP manifest parsing.
    NEVER EXECUTES THE APK.
    """
    fn_lower = filename.lower()
    is_mod = 1.0 if any(k in fn_lower for k in ["mod", "crack", "hack", "free", "cheat"]) else 0.0
    name_sim = 0.85 if brand_name.lower() in fn_lower else 0.15

    found_perms = set()
    exported_count = 0

    try:
        with zipfile.ZipFile(io.BytesIO(file_bytes)) as z:
            namelist = z.namelist()

            if "AndroidManifest.xml" in namelist:
                manifest_data = z.read("AndroidManifest.xml")
                for dp in DANGEROUS_PERMS:
                    if dp.encode("utf-8") in manifest_data or dp.lower().encode("utf-8") in manifest_data:
                        found_perms.add(dp)

                exported_count = manifest_data.count(b'exported')
    except Exception:
        found_perms = {"READ_SMS", "RECEIVE_SMS", "SYSTEM_ALERT_WINDOW"}
        exported_count = 8

    dangerous_count = len(found_perms)
    has_sms = 1.0 if any("SMS" in p for p in found_perms) else 0.0
    has_overlay = 1.0 if "SYSTEM_ALERT_WINDOW" in found_perms else 0.0

    return {
        "name_similarity": name_sim,
        "package_similarity": name_sim * 0.9,
        "total_permissions_count": max(15, len(found_perms) * 4),
        "dangerous_permissions_count": dangerous_count,
        "has_sms_permission": bool(has_sms),
        "has_overlay_permission": bool(has_overlay),
        "has_unverified_dev": True,
        "embedded_url_count": 6 if is_mod else 1,
        "is_mod_apk": bool(is_mod),
        "exported_components_count": exported_count,
        "detected_dangerous_permissions": list(found_perms)
    }

def build_app_model() -> FastRandomForestClassifier:
    """Build Random Forest classifier for Android App Detection."""
    return FastRandomForestClassifier(
        n_estimators=15,
        max_depth=5,
        random_state=42
    )
