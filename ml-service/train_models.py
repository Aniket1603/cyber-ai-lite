"""
Train and save all ML models for CyberEye AI Lite.
Run this script ONCE before starting the ML service.

Usage: python train_models.py
"""

import os
import numpy as np
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)


# ─────────────────────────────────────────────
# 1. URL Phishing Detection Model
# ─────────────────────────────────────────────

def generate_url_data():
    """Generate synthetic URL feature data."""
    from utils.url_features import extract_url_features

    safe_urls = [
        "https://www.google.com",
        "https://github.com/user/repo",
        "https://stackoverflow.com/questions/12345",
        "https://www.amazon.com/product/B08N5WRWNW",
        "https://docs.python.org/3/library/os.html",
        "https://www.wikipedia.org/wiki/Machine_learning",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://twitter.com/user/status/123456",
        "https://www.reddit.com/r/python",
        "https://linkedin.com/in/profile",
        "https://www.microsoft.com/en-us/windows",
        "https://support.apple.com/iphone",
        "https://www.coursera.org/learn/machine-learning",
        "https://www.medium.com/@user/article",
        "https://www.npmjs.com/package/react",
        "https://hub.docker.com/_/nginx",
        "https://www.cloudflare.com/products/",
        "https://aws.amazon.com/ec2/",
        "https://www.oracle.com/database/",
        "https://spring.io/projects/spring-boot",
    ]

    phishing_urls = [
        "http://192.168.1.1/login/verify?account=true&secure=1",
        "http://paypal-secure-login.xyz/verify/account",
        "http://amazon-account-update.ml/signin",
        "http://googl3.com/free-prize-winner",
        "http://bank-secure.tk/login?redirect=verify",
        "http://ebay.login-verify.com/signin?userid=123",
        "http://192.0.2.1/phishing/login.html",
        "http://free-iphone-winner.com/claim?id=abc123",
        "http://microsoft-support-urgent.com/update",
        "http://paypal.security-update-required.com/login",
        "http://secure-banking-login.xyz/account/verify",
        "http://amazon.security-check.com/signin",
        "http://urgent-account-verify.net/bank/login",
        "http://login.facebook.com.phish.tk/verify",
        "http://click-here-free-money.com/winner?prize=1000",
        "http://10.0.0.1/admin/login?bypass=true",
        "http://bit.ly/free-prize-claim-now",
        "http://discount-offer-limited.tk/exclusive?deal=99",
        "http://credential-update.net/account?urgent=1",
        "http://dropbox.login-secure.xyz/files/shared",
    ]

    X, y = [], []
    for url in safe_urls:
        X.append(extract_url_features(url))
        y.append(0)  # safe
    for url in phishing_urls:
        X.append(extract_url_features(url))
        y.append(1)  # phishing

    # Add noise/variation
    np.random.seed(42)
    for _ in range(200):
        # More synthetic safe
        length = np.random.randint(20, 80)
        feat = [length, np.random.randint(5, 30), np.random.randint(0, 20),
                np.random.randint(1, 3), 0, 0, 0, np.random.randint(0, 2),
                np.random.randint(0, 3), 0, np.random.randint(1, 4),
                np.random.randint(0, 5), 0, 1, 0,
                0, 0, np.random.uniform(3, 4), np.random.uniform(0, 0.1),
                np.random.uniform(0, 0.05)]
        X.append(feat)
        y.append(0)

    for _ in range(200):
        # More synthetic phishing
        length = np.random.randint(60, 200)
        feat = [length, np.random.randint(20, 60), np.random.randint(10, 50),
                np.random.randint(3, 7), np.random.randint(2, 8), np.random.randint(0, 3),
                np.random.randint(0, 2), np.random.randint(1, 4),
                np.random.randint(1, 5), np.random.randint(0, 3), np.random.randint(3, 8),
                np.random.randint(5, 20), np.random.randint(0, 2), 0,
                np.random.randint(2, 8),
                np.random.randint(1, 4), 0, np.random.uniform(4, 5.5),
                np.random.uniform(0.1, 0.3), np.random.uniform(0.1, 0.3)]
        X.append(feat)
        y.append(1)

    return np.array(X), np.array(y)


def train_url_model():
    print("Training URL phishing detection model...")
    X, y = generate_url_data()

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(max_iter=1000, C=1.0, random_state=42))
    ])
    pipeline.fit(X, y)
    joblib.dump(pipeline, os.path.join(MODELS_DIR, "url_model.pkl"))
    print(f"  [OK] URL model saved to models/url_model.pkl  (samples: {len(X)})")


# ─────────────────────────────────────────────
# 2. Email Threat Detection Model
# ─────────────────────────────────────────────

SPAM_EMAILS = [
    "Congratulations! You have won $1,000,000 lottery. Click here to claim your prize now!",
    "URGENT: Your bank account has been suspended. Verify your credentials immediately.",
    "FREE iPhone 15 winner selected! You are chosen. Act now limited time offer!",
    "Your PayPal account needs verification. Login to avoid suspension.",
    "You have been selected for a special investment opportunity. Double your money guaranteed!",
    "Work from home earn $5000 per week. No experience needed. Click here!",
    "Alert: Your credit card has been compromised. Update your details now.",
    "Winner! You have been randomly selected. Send your details to claim your prize.",
    "IMPORTANT: Your email account will be deleted. Confirm password to prevent this.",
    "Make money fast with our exclusive trading system. Risk free guaranteed returns.",
    "Your account will expire in 24 hours. Click here to reactivate immediately.",
    "Free gift cards available. Click the link below to claim yours today!",
    "Exclusive offer: Earn passive income from home. No investment needed.",
    "Security Alert: Unauthorized access detected on your account. Verify now!",
    "Dear customer, your package is waiting. Provide credit card to release shipment.",
    "WINNER ANNOUNCEMENT: Your email has won $500,000. Contact us immediately.",
    "Hot singles in your area! Click here to view profiles now.",
    "Unclaimed inheritance waiting for you. Provide bank details to receive funds.",
    "Urgent: Complete KYC verification or your account will be permanently blocked.",
    "Limited offer! Buy crypto now and get 200% returns guaranteed.",
]

HAM_EMAILS = [
    "Hi John, following up on our meeting yesterday. Let me know if you need any documents.",
    "Please find attached the quarterly report for Q1 2024. Let me know your feedback.",
    "Team meeting scheduled for Monday at 10 AM in conference room B.",
    "Your order #12345 has been shipped and will arrive by Friday.",
    "Happy birthday! Hope you have a wonderful day.",
    "The project deadline has been moved to next Wednesday. Please update your tasks.",
    "Reminder: Submit your timesheet by end of day Friday.",
    "GitHub notification: Pull request #42 merged into main branch.",
    "Your subscription renewal is coming up in 30 days. No action required.",
    "Thank you for your purchase. Your receipt is attached.",
    "Interview scheduled for Thursday at 2 PM. Please bring your portfolio.",
    "Monthly newsletter: Here are the top stories from our team this month.",
    "Server maintenance scheduled for Sunday 2 AM - 4 AM. Brief downtime expected.",
    "Code review requested on your latest commit. See comments in the PR.",
    "Your password was changed successfully. If this was not you, contact support.",
    "Lunch tomorrow? There's a new Thai place that opened downtown.",
    "The documentation has been updated. See the changelog for details.",
    "Registration confirmed for the tech conference on June 15.",
    "Your invoice for April has been processed and payment will be made on the 28th.",
    "Welcome to the team! Your onboarding schedule is attached.",
]


def train_email_model():
    print("Training email threat detection model...")

    texts = SPAM_EMAILS * 15 + HAM_EMAILS * 15
    labels = [1] * (len(SPAM_EMAILS) * 15) + [0] * (len(HAM_EMAILS) * 15)

    # Add variation
    augmented_texts = []
    augmented_labels = []
    np.random.seed(42)
    for text, label in zip(texts, labels):
        augmented_texts.append(text)
        augmented_labels.append(label)
        # Simple augmentation: shuffle words slightly
        words = text.split()
        np.random.shuffle(words)
        augmented_texts.append(" ".join(words))
        augmented_labels.append(label)

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            stop_words="english",
            min_df=1
        )),
        ("clf", LogisticRegression(max_iter=500, C=1.0, random_state=42))
    ])
    pipeline.fit(augmented_texts, augmented_labels)
    joblib.dump(pipeline, os.path.join(MODELS_DIR, "email_model.pkl"))
    print(f"  [OK] Email model saved to models/email_model.pkl  (samples: {len(augmented_texts)})")


# ─────────────────────────────────────────────
# 3. Deepfake Image Detection Model
# ─────────────────────────────────────────────

def extract_image_features_for_training(img_array):
    """Extract statistical features from a numpy image array."""
    features = []

    # Per-channel statistics
    for channel in range(3):
        ch = img_array[:, :, channel].flatten().astype(float)
        features.append(np.mean(ch))
        features.append(np.std(ch))
        features.append(np.percentile(ch, 25))
        features.append(np.percentile(ch, 75))

    # Overall brightness
    gray = 0.299 * img_array[:, :, 0] + 0.587 * img_array[:, :, 1] + 0.114 * img_array[:, :, 2]
    features.append(np.mean(gray))
    features.append(np.std(gray))

    # Edge-like features using simple gradient
    from numpy.linalg import norm
    gy = np.diff(gray, axis=0)
    gx = np.diff(gray, axis=1)
    features.append(np.mean(np.abs(gy)))
    features.append(np.mean(np.abs(gx)))
    features.append(np.std(gy))
    features.append(np.std(gx))

    # Color channel correlation (deepfakes may have slightly off correlations)
    r = img_array[:, :, 0].flatten().astype(float)
    g = img_array[:, :, 1].flatten().astype(float)
    b = img_array[:, :, 2].flatten().astype(float)
    features.append(np.corrcoef(r, g)[0, 1])
    features.append(np.corrcoef(g, b)[0, 1])
    features.append(np.corrcoef(r, b)[0, 1])

    # Histogram entropy per channel
    for channel in range(3):
        hist, _ = np.histogram(img_array[:, :, channel].flatten(), bins=32, range=(0, 255))
        hist = hist / (hist.sum() + 1e-9)
        entropy = -np.sum(hist * np.log2(hist + 1e-9))
        features.append(entropy)

    return features


def generate_deepfake_training_data(n_samples=500):
    """Generate synthetic training data simulating real vs deepfake image features."""
    np.random.seed(42)
    X, y = [], []

    for _ in range(n_samples):
        # Real images: natural color distributions, natural gradients
        img = np.random.normal(loc=128, scale=40, size=(64, 64, 3)).clip(0, 255).astype(np.uint8)
        # Add natural correlation between channels
        img[:, :, 1] = (img[:, :, 0] * 0.6 + img[:, :, 1] * 0.4).clip(0, 255)
        img[:, :, 2] = (img[:, :, 0] * 0.3 + img[:, :, 2] * 0.7).clip(0, 255)
        features = extract_image_features_for_training(img)
        X.append(features)
        y.append(0)  # real

    for _ in range(n_samples):
        # Fake images: more uniform distributions, slightly off correlations, smoother gradients
        img = np.random.normal(loc=128, scale=20, size=(64, 64, 3)).clip(0, 255).astype(np.uint8)
        # Less natural correlation (overly smooth)
        noise = np.random.normal(0, 5, size=(64, 64, 3))
        img = (img + noise).clip(0, 255).astype(np.uint8)
        features = extract_image_features_for_training(img)
        X.append(features)
        y.append(1)  # fake

    return np.array(X), np.array(y)


def train_deepfake_model():
    print("Training deepfake image detection model...")
    X, y = generate_deepfake_training_data(n_samples=600)

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42))
    ])
    pipeline.fit(X, y)
    joblib.dump(pipeline, os.path.join(MODELS_DIR, "deepfake_model.pkl"))
    print(f"  [OK] Deepfake model saved to models/deepfake_model.pkl  (samples: {len(X)})")


# ─────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────

if __name__ == "__main__":
    print("\n[CyberEye AI] Training All Models\n" + "=" * 40)
    train_url_model()
    train_email_model()
    train_deepfake_model()
    print("\n[OK] All models trained and saved to ./models/")
    print("     Now start the service with: uvicorn main:app --reload --port 8000\n")
