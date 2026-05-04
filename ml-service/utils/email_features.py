import re


def preprocess_email(text: str) -> str:
    """
    Clean and preprocess email text for classification.
    """
    # Lowercase
    text = text.lower()

    # Remove URLs
    text = re.sub(r"http\S+|www\S+", " url ", text)

    # Remove email addresses
    text = re.sub(r"\S+@\S+", " email ", text)

    # Remove special characters but keep spaces
    text = re.sub(r"[^a-z0-9\s]", " ", text)

    # Remove extra whitespace
    text = re.sub(r"\s+", " ", text).strip()

    return text


SPAM_INDICATORS = [
    "free", "winner", "won", "prize", "claim", "urgent", "verify",
    "account", "suspended", "click here", "limited time", "offer",
    "congratulations", "selected", "lottery", "million", "dollars",
    "password", "credit card", "bank", "transfer", "investment",
    "act now", "exclusive", "guaranteed", "risk free", "double your",
    "earn money", "work from home", "make money fast"
]


def extract_email_features(text: str) -> dict:
    """
    Extract additional features for email analysis (used in response details).
    """
    text_lower = text.lower()
    return {
        "length": len(text),
        "word_count": len(text.split()),
        "url_count": len(re.findall(r"http\S+|www\S+", text_lower)),
        "exclamation_count": text.count("!"),
        "dollar_count": text.count("$"),
        "spam_indicator_count": sum(1 for word in SPAM_INDICATORS if word in text_lower),
        "uppercase_ratio": sum(1 for c in text if c.isupper()) / max(len(text), 1),
    }
