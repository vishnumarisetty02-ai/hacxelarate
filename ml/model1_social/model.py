"""
MODEL 1: Fake Social Profile Detection
Model architecture and tabular feature definitions.
"""

from typing import List, Dict, Any
import numpy as np

FEATURE_NAMES = [
    "username_similarity",
    "name_similarity",
    "bio_similarity",
    "followers",
    "following",
    "post_count",
    "account_age_days",
    "verified",
    "has_external_url",
    "profile_image_similarity"
]

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
    def __init__(self, max_depth=5, min_samples_split=3):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.root = None

    def _gini(self, y):
        if len(y) == 0: return 0.0
        p = np.mean(y)
        return float(1.0 - (p**2 + (1.0 - p)**2))

    def _best_split(self, X, y):
        best_gain = -1.0
        split_idx, split_thresh = None, None
        current_gini = self._gini(y)
        n_features = X.shape[1]

        for feat_idx in range(n_features):
            X_column = X[:, feat_idx]
            thresholds = np.unique(np.percentile(X_column, [20, 40, 60, 80]))
            for thresh in thresholds:
                left_mask = X_column <= thresh
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

    def _build_tree(self, X, y, depth=0):
        if depth >= self.max_depth or len(y) < self.min_samples_split or len(np.unique(y)) == 1:
            return TreeNode(value=float(np.mean(y)))

        feat_idx, thresh = self._best_split(X, y)
        if feat_idx is None:
            return TreeNode(value=float(np.mean(y)))

        left_mask = X[:, feat_idx] <= thresh
        right_mask = ~left_mask
        left = self._build_tree(X[left_mask], y[left_mask], depth + 1)
        right = self._build_tree(X[right_mask], y[right_mask], depth + 1)
        return TreeNode(feature=feat_idx, threshold=thresh, left=left, right=right)

    def fit(self, X, y):
        self.root = self._build_tree(np.array(X, dtype=float), np.array(y, dtype=float))

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

class SocialRandomForest:
    """Random Forest classifier for Social Profile Impersonation Detection."""
    def __init__(self, n_estimators=15, max_depth=5, random_state=42):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.random_state = random_state
        self.trees = []

    def fit(self, X, y):
        np.random.seed(self.random_state)
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

def build_model() -> SocialRandomForest:
    return SocialRandomForest()

def extract_features(profile_data: Dict[str, Any]) -> List[float]:
    return [
        float(profile_data.get("username_similarity", 0.0)),
        float(profile_data.get("name_similarity", 0.0)),
        float(profile_data.get("bio_similarity", 0.0)),
        float(profile_data.get("followers", 0)),
        float(profile_data.get("following", 0)),
        float(profile_data.get("post_count", 0)),
        float(profile_data.get("account_age_days", 30)),
        1.0 if profile_data.get("verified", False) else 0.0,
        1.0 if profile_data.get("has_external_url", False) or profile_data.get("external_url") else 0.0,
        float(profile_data.get("profile_image_similarity", 0.0))
    ]
