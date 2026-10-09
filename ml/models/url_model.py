"""
MODEL 3: Phishing/Suspicious URL Detection Model.
Extracts lexical & structural URL features for Random Forest classification.
Features:
- url_length
- num_dots
- num_hyphens
- num_special_chars
- is_suspicious_tld
- has_ip_address
- is_https
- is_shortened_url
- has_suspicious_keywords
"""

import re
from typing import List
from urllib.parse import urlparse
from .base_models import FastRandomForestClassifier

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

def extract_url_features(url: str) -> List[float]:
    """Extract 9 structural and lexical features from URL string."""
    url_clean = str(url).strip()
    parsed = urlparse(url_clean if "://" in url_clean else f"http://{url_clean}")

    domain = parsed.netloc.lower()
    path = parsed.path.lower()
    full_lower = url_clean.lower()

    # 1. URL length
    url_len = float(len(url_clean))

    # 2. Number of dots
    num_dots = float(url_clean.count("."))

    # 3. Number of hyphens
    num_hyphens = float(url_clean.count("-"))

    # 4. Special characters count
    special_chars = sum(url_clean.count(c) for c in ["@", "?", "=", "&", "%", "_", ";"])
    num_special = float(special_chars)

    # 5. Suspicious TLD check
    is_sus_tld = 1.0 if any(domain.endswith(tld) for tld in SUSPICIOUS_TLDS) else 0.0

    # 6. IP address usage
    has_ip = 1.0 if re.search(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', domain) else 0.0

    # 7. HTTPS presence
    is_https = 1.0 if parsed.scheme == "https" else 0.0

    # 8. Shortened URL check
    is_shortened = 1.0 if any(s_domain in domain for s_domain in SHORTENER_DOMAINS) else 0.0

    # 9. Suspicious keywords in path/domain
    kw_hits = sum(1 for kw in SUSPICIOUS_KEYWORDS if kw in full_lower)
    has_keywords = 1.0 if kw_hits > 0 else 0.0

    return [
        url_len,
        num_dots,
        num_hyphens,
        num_special,
        is_sus_tld,
        has_ip,
        is_https,
        is_shortened,
        has_keywords
    ]

def build_url_model() -> FastRandomForestClassifier:
    """Build Random Forest classifier for URL detection."""
    return FastRandomForestClassifier(
        n_estimators=15,
        max_depth=5,
        random_state=42
    )
