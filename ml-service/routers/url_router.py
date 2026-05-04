from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib
import os
import numpy as np

from utils.url_features import extract_url_features

router = APIRouter(prefix="/predict", tags=["URL"])

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "url_model.pkl")
model = None


def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
    else:
        model = None


load_model()


class URLRequest(BaseModel):
    url: str


@router.post("/url")
async def predict_url(request: URLRequest):
    url = request.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty")

    features = extract_url_features(url)
    features_array = np.array(features).reshape(1, -1)

    if model is None:
        # Mock prediction if model not trained yet
        is_phishing = any(word in url.lower() for word in ["login", "verify", "secure", "account", "free", "prize"])
        is_ip = any(c.isdigit() for c in url.split("/")[2].split(".")) and len(url.split("/")[2].split(".")) == 4
        score = 0.85 if (is_phishing or is_ip) else 0.12
        label = "PHISHING" if score > 0.5 else "SAFE"
        confidence = score if label == "PHISHING" else 1 - score
        return {
            "result": label,
            "confidence": round(confidence * 100, 2),
            "threat_level": _threat_level(confidence, label),
            "features": {
                "url_length": len(url),
                "has_ip": is_ip,
                "suspicious_keywords": is_phishing,
            },
            "model": "mock"
        }

    proba = model.predict_proba(features_array)[0]
    phishing_prob = proba[1]
    label = "PHISHING" if phishing_prob > 0.5 else "SAFE"
    confidence = phishing_prob if label == "PHISHING" else proba[0]

    return {
        "result": label,
        "confidence": round(confidence * 100, 2),
        "threat_level": _threat_level(phishing_prob, label),
        "features": {
            "url_length": len(url),
            "has_ip": bool(features[12]),
            "has_https": bool(features[13]),
            "suspicious_keywords": int(features[14]),
            "num_dots": int(features[3]),
            "entropy": round(features[17], 3),
        },
        "model": "logistic_regression"
    }


def _threat_level(prob: float, label: str) -> str:
    if label == "SAFE":
        return "SAFE"
    if prob >= 0.8:
        return "MALICIOUS"
    if prob >= 0.5:
        return "SUSPICIOUS"
    return "SAFE"
