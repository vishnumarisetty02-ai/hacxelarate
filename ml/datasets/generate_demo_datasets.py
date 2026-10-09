"""
Synthetic/Demo Dataset Generator for Digital Risk Protection Platform ML Models.
Clearly labeled as demo training data for hackathon MVP reproducibility.
"""

import os
import pandas as pd
import numpy as np

DATASETS_DIR = os.path.dirname(os.path.abspath(__file__))

def generate_social_dataset():
    """
    Features for MODEL 1 (Fake Social Profile Detection):
    - username_similarity (0.0 to 1.0)
    - name_similarity (0.0 to 1.0)
    - bio_similarity (0.0 to 1.0)
    - followers (int)
    - following (int)
    - post_count (int)
    - account_age_days (int)
    - verified (0 or 1)
    - has_external_url (0 or 1)
    - profile_image_similarity (0.0 to 1.0)
    - label (1 = Impersonator/Scam profile, 0 = Legitimate/Safe)
    """
    np.random.seed(42)
    n_samples = 300

    # 1. Impersonators (label = 1)
    n_fake = n_samples // 2
    fake_data = {
        "username_similarity": np.random.uniform(0.70, 0.98, n_fake),
        "name_similarity": np.random.uniform(0.65, 0.99, n_fake),
        "bio_similarity": np.random.uniform(0.40, 0.95, n_fake),
        "followers": np.random.randint(5, 500, n_fake),
        "following": np.random.randint(400, 3000, n_fake), # High following (bot follow)
        "post_count": np.random.randint(0, 20, n_fake),    # Low post history
        "account_age_days": np.random.randint(1, 45, n_fake), # Newly created
        "verified": np.zeros(n_fake, dtype=int),          # Not verified
        "has_external_url": np.random.choice([0, 1], size=n_fake, p=[0.1, 0.9]), # Often link to phish
        "profile_image_similarity": np.random.uniform(0.80, 0.99, n_fake), # Cloned logo
        "label": np.ones(n_fake, dtype=int)
    }

    # 2. Legitimate Profiles (label = 0)
    n_real = n_samples - n_fake
    real_data = {
        "username_similarity": np.random.uniform(0.05, 0.50, n_real),
        "name_similarity": np.random.uniform(0.05, 0.50, n_real),
        "bio_similarity": np.random.uniform(0.00, 0.35, n_real),
        "followers": np.random.randint(150, 50000, n_real),
        "following": np.random.randint(50, 800, n_real),
        "post_count": np.random.randint(25, 400, n_real),
        "account_age_days": np.random.randint(180, 3600, n_real), # Established accounts
        "verified": np.random.choice([0, 1], size=n_real, p=[0.85, 0.15]),
        "has_external_url": np.random.choice([0, 1], size=n_real, p=[0.6, 0.4]),
        "profile_image_similarity": np.random.uniform(0.00, 0.35, n_real),
        "label": np.zeros(n_real, dtype=int)
    }

    df_fake = pd.DataFrame(fake_data)
    df_real = pd.DataFrame(real_data)
    df = pd.concat([df_fake, df_real], ignore_index=True).sample(frac=1.0, random_state=42)

    csv_path = os.path.join(DATASETS_DIR, "social_profiles.csv")
    df.to_csv(csv_path, index=False)
    print(f"[Dataset] Generated {len(df)} social profile samples -> {csv_path}")

def generate_scam_text_dataset():
    """
    Dataset for MODEL 2 (Scam Text Detection):
    - text: Social media post / DM / SMS message text
    - label: 1 = Scam/Phishing, 0 = Legitimate/Ham
    """
    scam_templates = [
        "URGENT: Your ApexPay wallet is locked. Send your OTP to support immediately to unlock.",
        "Congratulations! You won 1,000 USDT in our official customer giveaway. Claim here: https://apex-bonus.top",
        "ApexPay Support: An unauthorized login occurred. Verify your seed phrase to secure funds.",
        "Special bonus deposit: Deposit 100 USDT get 500 USDT return within 24 hours guaranteed.",
        "Security Alert: Your payment failed. Re-enter your credit card CVV and OTP to avoid penalty.",
        "Official customer care assistance. Send private message on Telegram @ApexPay_Care to resolve chargeback.",
        "Action required within 1 hour: Account verification incomplete. Click link to verify credentials.",
        "Free crypto airdrop for all verified token holders! Claim instant voucher voucher-claim.xyz",
        "We detected suspicious activity on your card. Call fake support line or send OTP immediately.",
        "Your transaction of $499.00 is pending. If you did not authorize this, click here to cancel.",
        "Limited time offer: Double your ApexPay rewards today only. Input login password to synchronize.",
        "Attention: Account termination scheduled. Update billing details via external portal now.",
        "Direct message our VIP support engineer on WhatsApp for fast funds recovery.",
        "Claim your $500 cashback voucher right now! Enter PIN and OTP at auth-rewards.net"
    ]

    legit_templates = [
        "Check out our new release notes for mobile app version 4.2 with enhanced dark mode.",
        "Thank you for contacting customer support. Our team will review your feedback shortly.",
        "Join our upcoming community developer webinar on Wednesday at 2 PM UTC.",
        "ApexPay quarterly financial results have been published on our investor relations website.",
        "We are proud to announce our partnership with Global Merchants Network.",
        "Scheduled maintenance notice: Systems will undergo brief routine updates tonight from 2 to 3 AM.",
        "Here are five practical tips to keep your mobile banking passwords and devices secure.",
        "Congratulations to our hackathon winners for outstanding contributions to fintech security.",
        "Loving the clean user interface on the new dashboard update!",
        "Can someone point me to the API documentation for recurring webhook subscriptions?",
        "Our customer service representatives will never ask you for your password or SMS OTP.",
        "We have expanded our customer support hours to 24/7 across all regions.",
        "Learn how end-to-end encryption keeps your transaction logs private and compliant.",
        "Happy Friday! Wishing everyone in the cybersecurity community a great weekend."
    ]

    texts = []
    labels = []

    # Multiply variations
    for s in scam_templates:
        for suffix in ["", " Hurry!", " Contact us now.", " Click below link.", " Reply STOP to opt out."]:
            texts.append(f"{s}{suffix}")
            labels.append(1)

    for l in legit_templates:
        for suffix in ["", " Have a good day.", " Stay tuned for updates.", " Read more on our blog."]:
            texts.append(f"{l}{suffix}")
            labels.append(0)

    df = pd.DataFrame({"text": texts, "label": labels}).sample(frac=1.0, random_state=42)
    csv_path = os.path.join(DATASETS_DIR, "scam_text.csv")
    df.to_csv(csv_path, index=False)
    print(f"[Dataset] Generated {len(df)} scam text samples -> {csv_path}")

def generate_url_dataset():
    """
    Dataset for MODEL 3 (Phishing URL Detection):
    Features extracted directly from URLs.
    """
    phishing_urls = [
        "https://apexpay-login-portal-auth.com/secure-signin",
        "http://apex-pay-refunds.top/claim-voucher",
        "https://apexpay.support-desk.cc/verify-otp",
        "http://198.51.100.44/apexpay/login.php",
        "https://apexpay-security-update.xyz/auth?user=victim",
        "https://apex-wallet-recovery.online/private-key",
        "http://free-apexpay-bonus.buzz/claim.html",
        "https://apexpay.customer-service-vip.tk/portal",
        "https://signin.apexpay-account-check.com/session",
        "http://45.154.255.89:8080/apexpay-login",
        "https://apex-card-verification.cam/card-input",
        "http://apexpay-direct-help.rest/t/support",
        "https://apexpay.official-giveaway-winner.vip/wallet",
        "https://portal.apexpay-auth-token.xyz/login.aspx"
    ]

    legit_urls = [
        "https://apexpay.com",
        "https://apexpay.com/about-us",
        "https://apexpay.com/login",
        "https://apexpay.com/security/whitepaper.pdf",
        "https://apexpay.io/developers/documentation",
        "https://api.apexpay.com/v1/health",
        "https://nexushealth.org",
        "https://nexushealth.org/patient-portal",
        "https://github.com/apexpay-security",
        "https://status.apexpay.com",
        "https://blog.apexpay.com/announcements/q3-report",
        "https://support.apexpay.com/articles/how-to-reset-password",
        "https://careers.apexpay.com/openings",
        "https://compliance.apexpay.com/soc2-audit"
    ]

    urls = []
    labels = []

    # Expand with query parameters and variations
    for u in phishing_urls:
        urls.append(u)
        labels.append(1)
        urls.append(f"{u}?token=94827103&redirect=account")
        labels.append(1)
        urls.append(f"{u}/step2-verify-otp")
        labels.append(1)

    for u in legit_urls:
        urls.append(u)
        labels.append(0)
        urls.append(f"{u}?ref=homepage")
        labels.append(0)
        urls.append(f"{u}/overview")
        labels.append(0)

    df = pd.DataFrame({"url": urls, "label": labels}).sample(frac=1.0, random_state=42)
    csv_path = os.path.join(DATASETS_DIR, "urls.csv")
    df.to_csv(csv_path, index=False)
    print(f"[Dataset] Generated {len(df)} URL samples -> {csv_path}")

def generate_apps_dataset():
    """
    Dataset for MODEL 4 (Suspicious Android App Detection):
    Tabular features extracted from static APK metadata:
    - name_similarity (0.0 to 1.0)
    - package_similarity (0.0 to 1.0)
    - total_permissions_count (int)
    - dangerous_permissions_count (int: READ_SMS, RECEIVE_SMS, etc.)
    - has_sms_permission (0 or 1)
    - has_overlay_permission (0 or 1)
    - has_unverified_dev (0 or 1)
    - embedded_url_count (int)
    - is_mod_apk (0 or 1)
    - exported_components_count (int)
    - label (1 = Malicious/Trojanized APK, 0 = Safe/Legitimate App)
    """
    np.random.seed(42)
    n_samples = 240

    n_mal = n_samples // 2
    mal_data = {
        "name_similarity": np.random.uniform(0.70, 0.99, n_mal),
        "package_similarity": np.random.uniform(0.65, 0.98, n_mal),
        "total_permissions_count": np.random.randint(18, 55, n_mal),
        "dangerous_permissions_count": np.random.randint(4, 12, n_mal),
        "has_sms_permission": np.random.choice([0, 1], size=n_mal, p=[0.1, 0.9]), # 90% have SMS spy
        "has_overlay_permission": np.random.choice([0, 1], size=n_mal, p=[0.2, 0.8]), # 80% have overlay
        "has_unverified_dev": np.ones(n_mal, dtype=int),
        "embedded_url_count": np.random.randint(3, 25, n_mal),
        "is_mod_apk": np.random.choice([0, 1], size=n_mal, p=[0.25, 0.75]),
        "exported_components_count": np.random.randint(6, 30, n_mal),
        "label": np.ones(n_mal, dtype=int)
    }

    n_safe = n_samples - n_mal
    safe_data = {
        "name_similarity": np.random.uniform(0.00, 0.40, n_safe),
        "package_similarity": np.random.uniform(0.00, 0.35, n_safe),
        "total_permissions_count": np.random.randint(4, 15, n_safe),
        "dangerous_permissions_count": np.random.randint(0, 2, n_safe),
        "has_sms_permission": np.zeros(n_safe, dtype=int),
        "has_overlay_permission": np.zeros(n_safe, dtype=int),
        "has_unverified_dev": np.zeros(n_safe, dtype=int),
        "embedded_url_count": np.random.randint(0, 3, n_safe),
        "is_mod_apk": np.zeros(n_safe, dtype=int),
        "exported_components_count": np.random.randint(0, 4, n_safe),
        "label": np.zeros(n_safe, dtype=int)
    }

    df_mal = pd.DataFrame(mal_data)
    df_safe = pd.DataFrame(safe_data)
    df = pd.concat([df_mal, df_safe], ignore_index=True).sample(frac=1.0, random_state=42)

    csv_path = os.path.join(DATASETS_DIR, "apps.csv")
    df.to_csv(csv_path, index=False)
    print(f"[Dataset] Generated {len(df)} app metadata samples -> {csv_path}")

if __name__ == "__main__":
    generate_social_dataset()
    generate_scam_text_dataset()
    generate_url_dataset()
    generate_apps_dataset()
    print("[Datasets] All 4 synthetic demo datasets created successfully.")
