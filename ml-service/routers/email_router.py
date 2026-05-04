from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib
import os
import numpy as np

from utils.email_features import preprocess_email, extract_email_features

router = APIRouter(prefix="/predict", tags=["Email"])

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "email_model.pkl")
model = None


def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
    else:
        model = None


load_model()


class EmailRequest(BaseModel):
    text: str


@router.post("/email")
async def predict_email(request: EmailRequest):
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Email text cannot be empty")
    if len(text) < 10:
        raise HTTPException(status_code=400, detail="Email text too short")

    meta = extract_email_features(text)
    processed = preprocess_email(text)

    if model is None:
        # Mock prediction
        spam_score = min(1.0, (
            meta["exclamation_count"] * 0.05
            + meta["dollar_count"] * 0.1
            + meta["spam_indicator_count"] * 0.15
            + meta["uppercase_ratio"] * 0.3
        ))
        label = "SPAM/PHISHING" if spam_score > 0.4 else "LEGITIMATE"
        return {
            "result": label,
            "confidence": round(min(spam_score * 100, 98), 2) if label == "SPAM/PHISHING" else round((1 - spam_score) * 100, 2),
            "threat_level": "MALICIOUS" if spam_score > 0.6 else ("SUSPICIOUS" if spam_score > 0.4 else "SAFE"),
            "features": meta,
            "model": "mock"
        }

    proba = model.predict_proba([processed])[0]
    spam_prob = proba[1]
    label = "SPAM/PHISHING" if spam_prob > 0.5 else "LEGITIMATE"
    confidence = spam_prob if label == "SPAM/PHISHING" else proba[0]

    return {
        "result": label,
        "confidence": round(confidence * 100, 2),
        "threat_level": _threat_level(spam_prob),
        "features": meta,
        "model": "tfidf_logistic_regression"
    }


def _threat_level(prob: float) -> str:
    if prob >= 0.75:
        return "MALICIOUS"
    if prob >= 0.5:
        return "SUSPICIOUS"
    return "SAFE"
