# CyberEye AI Lite 🔐
### Threat + Deepfake Detection System

A full-stack AI-powered cybersecurity platform with **Phishing URL Detection**, **Email Threat Analysis**, and **Deepfake Image Detection** — all running locally without Docker.

---

## 🏗️ Architecture

```
CyberEye AI Lite
├── ml-service/     FastAPI (Python) – All AI models    → port 8000
├── backend/        Spring Boot (Java) – Auth + API     → port 8080
└── frontend/       React + Tailwind – Cyber Dark UI    → port 5173
```

---

## ✅ Prerequisites

| Tool       | Version     | Check Command        |
|------------|-------------|----------------------|
| Java JDK   | 17+         | `java -version`      |
| Maven      | 3.8+        | `mvn -version`       |
| Python     | 3.9+        | `python --version`   |
| Node.js    | 18+         | `node --version`     |
| npm        | 9+          | `npm --version`      |

---

## 🚀 Local Setup — Step by Step

### Step 1: Clone / Navigate to Project

```bash
cd "C:\Users\anike\OneDrive\Desktop\Cyber-Ai"
```

---

### Step 2: Start ML Service (FastAPI)

```bash
cd ml-service

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train AI models (ONE TIME only – takes ~30 seconds)
python train_models.py

# Start the ML service
uvicorn main:app --reload --port 8000
```

✅ Verify at: http://localhost:8000/health

---

### Step 3: Start Backend (Spring Boot)

Open a **new terminal**:

```bash
cd backend

# Build and run (first run downloads dependencies ~2 min)
mvn spring-boot:run
```

✅ Verify at: http://localhost:8080/api/auth/ping

> **H2 Console** (view database): http://localhost:8080/h2-console
> - JDBC URL: `jdbc:h2:mem:cybereye`
> - Username: `sa` | Password: *(empty)*

> **Switch to PostgreSQL**: Edit `backend/src/main/resources/application.properties`
> Comment out H2 lines and uncomment PostgreSQL lines. Create DB: `CREATE DATABASE cybereye;`

---

### Step 4: Start Frontend (React)

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

✅ Open: http://localhost:5173

---

## 🎮 First-Time Usage

1. Go to http://localhost:5173/register
2. Create an account (any username/email/password)
3. You'll be auto-logged in and redirected to the Dashboard

### Test Each Feature:

**URL Scanner** → Try these URLs:
- Safe: `https://www.google.com`
- Phishing: `http://paypal-secure-login.xyz/verify/account`

**Email Analyzer** → Click "Try Spam" or "Try Legit" for example emails

**Deepfake Detector** → Upload any `.jpg` / `.png` image

---

## 📡 API Reference

### Auth (Public)
```
POST /api/auth/register   { username, email, password }
POST /api/auth/login      { username, password }
GET  /api/auth/ping       → health check
```

### Scans (Requires JWT Bearer Token)
```
POST /api/scan/url        { url }
POST /api/scan/email      { text }
POST /api/scan/image      multipart/form-data (file)
```

### Reports (Requires JWT Bearer Token)
```
GET /api/reports/history  → list of all user's scans
GET /api/reports/stats    → scan counts and threat stats
```

### ML Service (Direct)
```
GET  /health              → model status
POST /predict/url         { url }
POST /predict/email       { text }
POST /predict/image       multipart/form-data (file)
```

---

## 📁 Project Structure

```
Cyber-Ai/
├── ml-service/
│   ├── main.py              FastAPI app entry point
│   ├── train_models.py      Train & save all ML models
│   ├── requirements.txt
│   ├── models/              Saved model files (.pkl) after training
│   ├── routers/
│   │   ├── url_router.py    Phishing detection
│   │   ├── email_router.py  Spam/phishing classification
│   │   └── image_router.py  Deepfake detection
│   └── utils/
│       ├── url_features.py  URL feature extractor (20 features)
│       └── email_features.py Email preprocessor
│
├── backend/
│   ├── pom.xml              Maven dependencies
│   └── src/main/java/com/cybereye/backend/
│       ├── config/          SecurityConfig (JWT + CORS)
│       ├── controller/      Auth, Scan, Report controllers
│       ├── dto/             Request/Response objects
│       ├── entity/          User, ScanResult, enums
│       ├── repository/      JPA repositories
│       ├── security/        JwtUtil, JwtAuthFilter
│       └── service/         AuthService, ScanService, MlServiceClient
│
└── frontend/
    └── src/
        ├── api/             Axios client
        ├── components/      Sidebar, ThreatGauge, StatsCard
        ├── context/         AuthContext (JWT state)
        └── pages/           Login, Register, Dashboard, URLScanner,
                             EmailAnalyzer, DeepfakeDetector, Reports
```

---

## 🤖 AI Models

| Model | Algorithm | Features |
|-------|-----------|----------|
| URL Phishing | Logistic Regression | 20 URL features (length, entropy, IP, keywords, etc.) |
| Email Threat | TF-IDF + Logistic Regression | Bag-of-words, bigrams, spam indicators |
| Deepfake Image | Random Forest | 19 statistical image features (color, gradients, entropy) |

> Models fall back to rule-based mock predictions if not yet trained.

---

## 🔐 Security

- **JWT** tokens (24h expiry) stored in `localStorage`
- **BCrypt** password hashing
- **Spring Security 6** stateless sessions
- **CORS** restricted to `localhost:5173`
- **Role-based access**: USER / ADMIN

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---------|-----|
| `java: error: release version 17 not supported` | Install JDK 17+ and set `JAVA_HOME` |
| `ModuleNotFoundError` in Python | Run `pip install -r requirements.txt` inside `venv` |
| `CORS error` in browser | Ensure Spring Boot is running on port 8080 |
| `ML service unavailable` | Start FastAPI first (`uvicorn main:app --port 8000`) |
| Models show `mock` | Run `python train_models.py` once |
| H2 data lost on restart | Expected — H2 is in-memory. Switch to PostgreSQL for persistence |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Framer Motion, Recharts |
| Backend | Spring Boot 3.2, Spring Security 6, JJWT 0.12 |
| ML Service | FastAPI, scikit-learn, Pillow |
| Database | H2 (default) / PostgreSQL |
| Auth | JWT Bearer tokens |

---

Built with ❤️ by Aniket Chourasiya — Resume-ready AI Cybersecurity Project
