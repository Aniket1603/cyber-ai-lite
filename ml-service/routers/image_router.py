from fastapi import APIRouter, UploadFile, File, HTTPException
import joblib
import os
import io
import numpy as np
from PIL import Image

router = APIRouter(prefix="/predict", tags=["Image"])

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "deepfake_model.pkl")
model = None


def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
    else:
        model = None


load_model()


def extract_features(img_array: np.ndarray) -> list:
    """Extract statistical image features for deepfake detection."""
    features = []
    img = img_array.astype(float)

    for channel in range(3):
        ch = img[:, :, channel].flatten()
        features.append(np.mean(ch))
        features.append(np.std(ch))
        features.append(np.percentile(ch, 25))
        features.append(np.percentile(ch, 75))

    gray = 0.299 * img[:, :, 0] + 0.587 * img[:, :, 1] + 0.114 * img[:, :, 2]
    features.append(np.mean(gray))
    features.append(np.std(gray))

    gy = np.diff(gray, axis=0)
    gx = np.diff(gray, axis=1)
    features.append(np.mean(np.abs(gy)))
    features.append(np.mean(np.abs(gx)))
    features.append(np.std(gy))
    features.append(np.std(gx))

    r = img[:, :, 0].flatten()
    g = img[:, :, 1].flatten()
    b = img[:, :, 2].flatten()
    features.append(np.corrcoef(r, g)[0, 1])
    features.append(np.corrcoef(g, b)[0, 1])
    features.append(np.corrcoef(r, b)[0, 1])

    for channel in range(3):
        hist, _ = np.histogram(img_array[:, :, channel].flatten(), bins=32, range=(0, 255))
        hist = hist / (hist.sum() + 1e-9)
        entropy = -np.sum(hist * np.log2(hist + 1e-9))
        features.append(entropy)

    return features


@router.post("/image")
async def predict_image(file: UploadFile = File(...)):
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/bmp"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, BMP images are supported")

    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB").resize((64, 64))
        img_array = np.array(img)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

    features = extract_features(img_array)

    if model is None:
        # Mock prediction using simple heuristics
        mean_brightness = np.mean(img_array)
        std_brightness = np.std(img_array)
        fake_score = max(0.0, min(1.0, 0.5 + (50 - std_brightness) / 100))
        label = "DEEPFAKE" if fake_score > 0.5 else "REAL"
        confidence = fake_score if label == "DEEPFAKE" else 1 - fake_score
        return {
            "result": label,
            "confidence": round(confidence * 100, 2),
            "threat_level": "MALICIOUS" if label == "DEEPFAKE" else "SAFE",
            "analysis": {
                "mean_brightness": round(float(mean_brightness), 2),
                "color_std": round(float(std_brightness), 2),
                "image_size": f"{img.size[0]}x{img.size[1]}",
            },
            "model": "mock"
        }

    features_array = np.array(features).reshape(1, -1)
    # Handle NaN from correlation if image is flat
    features_array = np.nan_to_num(features_array)

    proba = model.predict_proba(features_array)[0]
    fake_prob = proba[1]
    label = "DEEPFAKE" if fake_prob > 0.5 else "REAL"
    confidence = fake_prob if label == "DEEPFAKE" else proba[0]

    return {
        "result": label,
        "confidence": round(confidence * 100, 2),
        "threat_level": "MALICIOUS" if label == "DEEPFAKE" else "SAFE",
        "analysis": {
            "mean_brightness": round(float(np.mean(img_array)), 2),
            "color_std": round(float(np.std(img_array)), 2),
            "image_size": "64x64 (resized for analysis)",
            "channel_entropy": round(float(features[12]), 3),
        },
        "model": "random_forest"
    }
