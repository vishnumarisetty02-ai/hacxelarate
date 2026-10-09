"""
MODEL 4: Suspicious Android App Detection Model.
Safe static metadata inspection without binary execution.
"""

import io
import zipfile
from typing import List, Dict, Any
import numpy as np

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

def extract_features_from_dict(app_data: Dict[str, Any]) -> List[float]:
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

class TreeNode:
    def __init__(self, feature=None, threshold=None, left=None, right=None, value=None):
        self.feature = feature
        self.threshold = threshold
        self.left = left
        self.right = right
        self.value = value

    @property
    def is_leaf(self):
        return self.value is not None

class DecisionTree:
    def __init__(self, max_depth=5):
        self.max_depth = max_depth
        self.root = None

    def _gini(self, y):
        if len(y) == 0: return 0.0
        p = np.mean(y)
        return float(1.0 - (p**2 + (1.0 - p)**2))

    def _best_split(self, X, y):
        best_gain = -1.0
        split_idx, split_thresh = None, None
        current_gini = self._gini(y)
        for feat_idx in range(X.shape[1]):
            X_col = X[:, feat_idx]
            for thresh in np.unique(np.percentile(X_col, [25, 50, 75])):
                left_mask = X_col <= thresh
                right_mask = ~left_mask
                if np.sum(left_mask) == 0 or np.sum(right_mask) == 0:
                    continue
                w_left = np.sum(left_mask) / len(y)
                w_right = np.sum(right_mask) / len(y)
                gain = current_gini - (w_left * self._gini(y[left_mask]) + w_right * self._gini(y[right_mask]))
                if gain > best_gain:
                    best_gain = gain
                    split_idx = feat_idx
                    split_thresh = thresh
        return split_idx, split_thresh

    def _build(self, X, y, depth=0):
        if depth >= self.max_depth or len(y) < 2 or len(np.unique(y)) == 1:
            return TreeNode(value=float(np.mean(y)))
        idx, thresh = self._best_split(X, y)
        if idx is None:
            return TreeNode(value=float(np.mean(y)))
        left = self._build(X[X[:, idx] <= thresh], y[X[:, idx] <= thresh], depth + 1)
        right = self._build(X[X[:, idx] > thresh], y[X[:, idx] > thresh], depth + 1)
        return TreeNode(feature=idx, threshold=thresh, left=left, right=right)

    def fit(self, X, y):
        self.root = self._build(np.array(X, dtype=float), np.array(y, dtype=float))

    def _traverse(self, x, node):
        if node.is_leaf:
            return node.value
        if x[node.feature] <= node.threshold:
            return self._traverse(x, node.left)
        return self._traverse(x, node.right)

    def predict_proba(self, X):
        X_arr = np.array(X, dtype=float)
        p1 = np.array([self._traverse(x, self.root) for x in X_arr])
        return np.column_stack([1.0 - p1, p1])

class AppRandomForest:
    def __init__(self, n_estimators=15, max_depth=5):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.trees = []

    def fit(self, X, y):
        X_arr = np.array(X, dtype=float)
        y_arr = np.array(y, dtype=float)
        self.trees = []
        n_samples = len(X_arr)
        for _ in range(self.n_estimators):
            idxs = np.random.choice(n_samples, n_samples, replace=True)
            tree = DecisionTree(max_depth=self.max_depth)
            tree.fit(X_arr[idxs], y_arr[idxs])
            self.trees.append(tree)

    def predict_proba(self, X):
        X_arr = np.array(X, dtype=float)
        tree_probs = np.array([tree.predict_proba(X_arr)[:, 1] for tree in self.trees])
        mean_p1 = np.mean(tree_probs, axis=0)
        return np.column_stack([1.0 - mean_p1, mean_p1])

    def predict(self, X):
        return (self.predict_proba(X)[:, 1] >= 0.5).astype(int)

def build_model() -> AppRandomForest:
    return AppRandomForest()
