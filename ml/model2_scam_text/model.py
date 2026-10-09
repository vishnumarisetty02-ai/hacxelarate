"""
MODEL 2: Scam Text Detection Model.
TF-IDF Vectorizer + Logistic Regression.
"""

from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

class TextLogisticRegression:
    def __init__(self, lr=0.2, n_iters=300):
        self.lr = lr
        self.n_iters = n_iters
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
            y_pred = 1.0 / (1.0 + np.exp(-np.clip(linear, -250, 250)))
            dw = (1.0 / n_samples) * np.dot(X_arr.T, (y_pred - y_arr))
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

class ScamTextPipeline:
    def __init__(self, max_features=1200):
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=max_features,
            lowercase=True,
            stop_words="english",
            sublinear_tf=True
        )
        self.classifier = TextLogisticRegression()

    def fit(self, texts, y):
        X_vec = self.vectorizer.fit_transform(texts)
        self.classifier.fit(X_vec, y)

    def predict_proba(self, texts):
        X_vec = self.vectorizer.transform(texts)
        return self.classifier.predict_proba(X_vec)

    def predict(self, texts):
        return (self.predict_proba(texts)[:, 1] >= 0.5).astype(int)

def build_model() -> ScamTextPipeline:
    return ScamTextPipeline()

SCAM_TRIGGERS = [
    "otp", "urgent", "password", "seed phrase", "giveaway", "deposit",
    "voucher", "congratulations", "wallet locked", "telegram", "claim"
]

def extract_text_reasons(text: str):
    t_lower = text.lower()
    reasons = []
    if "otp" in t_lower:
        reasons.append("OTP request detected")
    if any(k in t_lower for k in ["urgent", "locked", "immediately"]):
        reasons.append("Urgency trigger detected")
    if any(k in t_lower for k in ["giveaway", "voucher", "free crypto", "won"]):
        reasons.append("Fake reward solicitation")
    if any(k in t_lower for k in ["seed phrase", "private key", "password"]):
        reasons.append("Credential request detected")
    return reasons
