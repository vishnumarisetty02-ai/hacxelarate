"""
Pure NumPy implementations of Random Forest and Logistic Regression.
Provides 100% portable, fast, and explainable ML algorithms that operate
reliably without external C-extension binary dependencies.
"""

import numpy as np

# --- 1. TRAIN / TEST SPLIT & METRICS ---
def train_test_split_fast(X, y, test_size=0.20, random_state=42):
    np.random.seed(random_state)
    n = len(y)
    indices = np.random.permutation(n)
    split_point = int(n * (1 - test_size))
    train_idx, test_idx = indices[:split_point], indices[split_point:]

    if hasattr(X, "iloc"):
        X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    else:
        X_arr = np.array(X)
        X_train, X_test = X_arr[train_idx], X_arr[test_idx]

    if hasattr(y, "iloc"):
        y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
    else:
        y_arr = np.array(y)
        y_train, y_test = y_arr[train_idx], y_arr[test_idx]

    return X_train, X_test, np.array(y_train), np.array(y_test)

def compute_accuracy(y_true, y_pred):
    return float(np.mean(np.array(y_true) == np.array(y_pred)))

def compute_roc_auc_fast(y_true, y_prob):
    """Computes Wilcoxon-Mann-Whitney ROC-AUC metric."""
    y_true = np.array(y_true)
    y_prob = np.array(y_prob)
    pos = y_prob[y_true == 1]
    neg = y_prob[y_true == 0]
    if len(pos) == 0 or len(neg) == 0:
        return 0.5
    # Pairwise comparison
    comparisons = (pos[:, None] > neg[None, :]) + 0.5 * (pos[:, None] == neg[None, :])
    return float(np.mean(comparisons))

# --- 2. RANDOM FOREST CLASSIFIER ---
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
        if len(y) == 0:
            return 0.0
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

class FastRandomForestClassifier:
    """Random Forest ensemble of Decision Trees."""
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

# --- 3. LOGISTIC REGRESSION ---
class FastLogisticRegressionClassifier:
    """Logistic Regression with L2 regularization."""
    def __init__(self, lr=0.1, n_iters=250, l2_reg=0.01):
        self.lr = lr
        self.n_iters = n_iters
        self.l2_reg = l2_reg
        self.weights = None
        self.bias = 0.0

    def fit(self, X, y):
        if hasattr(X, "toarray"):
            X = X.toarray()
        X_arr = np.array(X, dtype=float)
        y_arr = np.array(y, dtype=float)
        n_samples, n_features = X_arr.shape

        self.weights = np.zeros(n_features)
        self.bias = 0.0

        for _ in range(self.n_iters):
            linear = np.dot(X_arr, self.weights) + self.bias
            # Safe sigmoid
            y_pred = 1.0 / (1.0 + np.exp(-np.clip(linear, -250, 250)))

            dw = (1.0 / n_samples) * np.dot(X_arr.T, (y_pred - y_arr)) + (self.l2_reg * self.weights)
            db = (1.0 / n_samples) * np.sum(y_pred - y_arr)

            self.weights -= self.lr * dw
            self.bias -= self.lr * db

    def predict_proba(self, X):
        if hasattr(X, "toarray"):
            X = X.toarray()
        X_arr = np.array(X, dtype=float)
        linear = np.dot(X_arr, self.weights) + self.bias
        p1 = 1.0 / (1.0 + np.exp(-np.clip(linear, -250, 250)))
        return np.column_stack([1.0 - p1, p1])

    def predict(self, X):
        return (self.predict_proba(X)[:, 1] >= 0.5).astype(int)
