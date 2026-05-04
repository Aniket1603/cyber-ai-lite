import re
import math
from urllib.parse import urlparse


def extract_url_features(url: str) -> list:
    """
    Extract numerical features from a URL for phishing detection.
    Returns a list of features.
    """
    features = []

    parsed = urlparse(url)
    hostname = parsed.hostname or ""
    path = parsed.path or ""

    # 1. URL length
    features.append(len(url))

    # 2. Hostname length
    features.append(len(hostname))

    # 3. Path length
    features.append(len(path))

    # 4. Number of dots in hostname
    features.append(hostname.count("."))

    # 5. Number of hyphens
    features.append(url.count("-"))

    # 6. Number of underscores
    features.append(url.count("_"))

    # 7. Number of @ symbols
    features.append(url.count("@"))

    # 8. Number of ? symbols
    features.append(url.count("?"))

    # 9. Number of = symbols
    features.append(url.count("="))

    # 10. Number of & symbols
    features.append(url.count("&"))

    # 11. Number of / in URL
    features.append(url.count("/"))

    # 12. Number of digits in URL
    features.append(sum(c.isdigit() for c in url))

    # 13. Is IP address in hostname?
    ip_pattern = re.compile(r"(\d{1,3}\.){3}\d{1,3}")
    features.append(1 if ip_pattern.search(hostname) else 0)

    # 14. Has HTTPS?
    features.append(1 if parsed.scheme == "https" else 0)

    # 15. Suspicious keywords count
    suspicious_words = [
        "login", "signin", "verify", "account", "banking", "secure",
        "update", "confirm", "paypal", "ebay", "amazon", "password",
        "credential", "free", "prize", "winner", "click", "urgent"
    ]
    count = sum(1 for word in suspicious_words if word in url.lower())
    features.append(count)

    # 16. Number of subdomains (dots in hostname - 1)
    subdomain_count = max(0, hostname.count(".") - 1)
    features.append(subdomain_count)

    # 17. Has port number?
    features.append(1 if parsed.port else 0)

    # 18. URL entropy (randomness)
    features.append(_calculate_entropy(url))

    # 19. Ratio of digits to length
    digit_ratio = sum(c.isdigit() for c in url) / max(len(url), 1)
    features.append(digit_ratio)

    # 20. Ratio of special chars to length
    special_chars = sum(1 for c in url if not c.isalnum() and c not in [".", "/", ":"])
    features.append(special_chars / max(len(url), 1))

    return features


def _calculate_entropy(text: str) -> float:
    """Calculate Shannon entropy of a string."""
    if not text:
        return 0
    freq = {}
    for c in text:
        freq[c] = freq.get(c, 0) + 1
    entropy = 0
    length = len(text)
    for count in freq.values():
        p = count / length
        entropy -= p * math.log2(p)
    return entropy
