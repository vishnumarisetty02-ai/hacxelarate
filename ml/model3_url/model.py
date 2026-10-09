"""
MODEL 3: Phishing/Suspicious URL Detection.
Extracts 9 lexical/structural URL features and uses Random Forest.
"""

import re
from typing import List
from urllib.parse import urlparse
import numpy as np

URL_FEATURE_NAMES = [
    "url_length",
    "num_dots",
    "num_hyphens",
    "num_special_chars",
    "is_suspicious_tld",
    "has_ip_address",
    "is_https",
    "is_shortened_url",
    "has_suspicious_keywords"
]

SUSPICIOUS_TLDS = {
    ".top", ".xyz", ".cc", ".online", ".work", ".buzz", ".cam", ".vip",
    ".icu", ".monster", ".fit", ".rest", ".tk", ".cf", ".ga", ".ml"
}

SUSPICIOUS_KEYWORDS = [
    "login", "signin", "auth", "verify", "secure", "wallet", "recovery",
    "update", "confirm", "claim", "free", "gift", "bonus", "password", "otp"
]

SHORTENER_DOMAINS = {"bit.ly", "tinyurl.com", "t.co", "is.gd", "buff.ly", "ow.ly"}

def extract_features(url: str) -> List[float]:
    url_clean = str(url).strip()
    parsed = urlparse(url_clean if "://" in url_clean else f"http://{url_clean}")
    domain = parsed.netloc.lower()
    full_lower = url_clean.lower()

    url_len = float(len(url_clean))
    num_dots = float(url_clean.count("."))
    num_hyphens = float(url_clean.count("-"))
    special_chars = sum(url_clean.count(c) for c in ["@", "?", "=", "&", "%", "_", ";"])
    is_sus_tld = 1.0 if any(domain.endswith(tld) for tld in SUSPICIOUS_TLDS) else 0.0
    has_ip = 1.0 if re.search(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', domain) else 0.0
    is_https = 1.0 if parsed.scheme == "https" else 0.0
    is_shortened = 1.0 if any(s_domain in domain for s_domain in SHORTENER_DOMAINS) else 0.0
    has_keywords = 1.0 if any(kw in full_lower for kw in SUSPICIOUS_KEYWORDS) else 0.0

    return [
        url_len,
        num_dots,
        num_hyphens,
        float(special_chars),
        is_sus_tld,
        has_ip,
        is_https,
        is_shortened,
        has_keywords
    ]

# Tree implementation for URL model
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

class UrlRandomForest:
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

def build_model() -> UrlRandomForest:
    return UrlRandomForest()
