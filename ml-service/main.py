from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import url_router, email_router, image_router

app = FastAPI(
    title="CyberEye AI – ML Service",
    description="AI-powered threat detection: URL phishing, Email classification, Deepfake image detection",
    version="1.0.0"
)

# CORS – allow Spring Boot and React frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(url_router.router)
app.include_router(email_router.router)
app.include_router(image_router.router)


@app.get("/")
def root():
    return {"service": "CyberEye ML Service", "status": "running", "version": "1.0.0"}


@app.get("/health")
def health():
    import os
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    url_model = os.path.exists(os.path.join(models_dir, "url_model.pkl"))
    email_model = os.path.exists(os.path.join(models_dir, "email_model.pkl"))
    deepfake_model = os.path.exists(os.path.join(models_dir, "deepfake_model.pkl"))

    return {
        "status": "healthy",
        "models": {
            "url_phishing": "loaded" if url_model else "mock (run train_models.py)",
            "email_threat": "loaded" if email_model else "mock (run train_models.py)",
            "deepfake_image": "loaded" if deepfake_model else "mock (run train_models.py)",
        }
    }
