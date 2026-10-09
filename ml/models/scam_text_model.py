"""
MODEL 2: Scam Text Detection Model.
TF-IDF Vectorizer + FastLogisticRegressionClassifier.
Detects: OTP requests, payment requests, urgency, fake rewards, phishing language, suspicious links, credential requests.
"""

from sklearn.feature_extraction.text import TfidfVectorizer
from .base_models import FastLogisticRegressionClassifier

class TfidfLogisticPipeline:
    def __init__(self, max_features=1200):
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=max_features,
            lowercase=True,
            stop_words="english",
            sublinear_tf=True
        )
        self.classifier = FastLogisticRegressionClassifier(lr=0.2, n_iters=300)

    def fit(self, texts, y):
        X_vec = self.vectorizer.fit_transform(texts)
        self.classifier.fit(X_vec, y)

    def predict_proba(self, texts):
        X_vec = self.vectorizer.transform(texts)
        return self.classifier.predict_proba(X_vec)

    def predict(self, texts):
        return (self.predict_proba(texts)[:, 1] >= 0.5).astype(int)

SCAM_CATEGORIES = {
    "OTP Request": ["otp", "one-time password", "sms code", "verification code", "pin"],
    "Payment / Transfer Request": ["send usdt", "crypto transfer", "deposit 100", "wire transfer", "western union"],
    "Psychological Urgency": ["urgent", "immediately", "within 24 hours", "locked", "action required", "act now"],
    "Fake Rewards / Giveaway": ["giveaway", "free crypto", "congratulations", "you won", "cashback voucher", "airdrop"],
    "Credential Harvesting": ["seed phrase", "private key", "password", "security pin", "re-enter your card"],
    "Suspicious Redirection": ["telegram", "whatsapp", "dm support", "click link", "voucher-claim"]
}

def identify_scam_categories(text: str):
    """Identifies which specific scam sub-categories were triggered."""
    text_lower = text.lower()
    triggered = []
    for category, triggers in SCAM_CATEGORIES.items():
        for trigger in triggers:
            if trigger in text_lower:
                triggered.append(category)
                break
    return triggered
