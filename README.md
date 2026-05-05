# 🌬️ AirLedger — AI-Driven Pollution Budgeting for Delhi-NCR

> **B-Tech Semester 4 Project** | Jaypee Institute of Information Technology  
> **Team:** Niket Malik · Kapil Chaudhary · Kashish  
> **Guide:** Dr. Shreya Aron

---

## 🎯 What is AirLedger?

AirLedger treats air pollution like a **financial budget**. Just as we can't overspend without consequences, a city can't exceed its "pollution budget" (AQI > 100) without health impacts.

**Key capabilities:**
- Predicts AQI using ML regression (R² = 0.99)
- Classifies days as Safe / Moderate / High-Risk (94.5% accuracy)
- Recommends targeted, proportionate pollution control actions
- Visualizes trends across Delhi-NCR locations and seasons
- 7-day forecast based on baseline atmospheric conditions

---

## 🏗️ Project Structure

```
airledger/
├── backend/
│   ├── app.py                 ← Flask REST API (6 endpoints)
│   ├── train.py               ← ML training pipeline
│   ├── requirements.txt
│   ├── data/
│   │   └── delhi_aqi_data.csv ← Dataset (1095 rows)
│   └── model/                 ← Generated after training
│       ├── aqi_regressor.joblib
│       ├── risk_classifier.joblib
│       ├── scaler.joblib
│       └── meta.json
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── components/
        │   ├── Sidebar.jsx
        │   ├── StatCard.jsx
        │   ├── AqiGauge.jsx
        │   ├── Spinner.jsx
        │   ├── ErrorCard.jsx
        │   ├── PageHeader.jsx
        │   └── CustomTooltip.jsx
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── Predict.jsx
        │   ├── Forecast.jsx
        │   └── ModelInsights.jsx
        ├── services/
        │   └── api.js
        ├── hooks/
        │   └── useApi.js
        └── utils/
            └── aqi.js
```

---

## ⚡ Quick Start

### Step 1 — Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Linux/Mac
# OR: venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Train ML models (generates /model/ directory)
python train.py

# Start Flask API server
python app.py
# → Running on http://localhost:5000
```

### Step 2 — Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start development server with hot reload
npm run dev
# → Running on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

### Step 3 — Build for Production (optional)

```bash
cd frontend
npm run build
# Output in frontend/dist/
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| POST | `/api/predict` | Predict AQI + risk level |
| GET | `/api/dashboard` | Aggregated dashboard data |
| GET | `/api/model-info` | Model metrics + feature importance |
| POST | `/api/forecast` | 7-day AQI forecast |

### POST /api/predict — Request Body
```json
{
  "pm25": 180, "pm10": 270, "no2": 65, "so2": 30, "co": 3.5,
  "temperature": 15, "humidity": 78, "wind_speed": 2, "rainfall": 0,
  "visibility": 3, "month": 12, "day_of_week": 1, "is_weekend": 0
}
```

### POST /api/forecast — Request Body
```json
{
  "month": 12,
  "base_pm25": 150,
  "base_temp": 16,
  "base_humidity": 72,
  "base_wind": 3
}
```

---

## 🧠 ML Model Details

| Task | Best Model | Score |
|------|------------|-------|
| AQI Regression | Linear Regression | R² = 0.9914 |
| Risk Classification | Random Forest | Accuracy = 94.52% |

**Feature Importance (Top 5):**  PM2.5 (48%) · PM10 (22%) · NO₂ (9%) · Temperature (7%) · Humidity (5%)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | Python 3.10+, Flask |
| ML | scikit-learn, pandas, numpy |
| Storage | joblib model persistence |

---

*AirLedger — Making pollution control smarter, one prediction at a time.*
