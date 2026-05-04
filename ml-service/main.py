from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 🔥 SAFE IMPORTS (avoid crash if routers fail)
try:
    from routers.url_router import router as url_router
    from routers.email_router import router as email_router
    from routers.image_router import router as image_router
    ROUTERS_LOADED = True
except Exception as e:
    print("Router import failed:", e)
    ROUTERS_LOADED = False

app = FastAPI(
    title="CyberEye AI – ML Service",
    version="1.0.0"
)

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow all for now (safe for deployment)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include routers only if loaded
if ROUTERS_LOADED:
    app.include_router(url_router)
    app.include_router(email_router)
    app.include_router(image_router)


# ✅ Root endpoint (Render test ke liye)
@app.get("/")
def root():
    return {
        "status": "ML service running 🚀",
        "routers_loaded": ROUTERS_LOADED
    }


# ✅ Health check
@app.get("/health")
def health():
    import os
    models_dir = os.path.join(os.path.dirname(__file__), "models")

    return {
        "status": "healthy",
        "models_folder_exists": os.path.exists(models_dir)
    }