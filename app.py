"""
AirLedger - Flask REST API
Serves AQI predictions, risk classification, and dashboard data.
"""

import os, json
import numpy as np
import pandas as pd
import joblib
from flask import Flask, request, jsonify

app = Flask(__name__)

# ─── CORS (manual, no flask-cors needed) ─────────────────────────────────────
@app.after_request
def add_cors(response):
    response.headers['Access-Control-Allow-Origin']  = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    return jsonify({}), 200

# ─── Load models ─────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR  = os.path.join(BASE_DIR, 'model')
DATA_PATH  = os.path.join(BASE_DIR, 'data', 'delhi_aqi_data.csv')

regressor  = joblib.load(os.path.join(MODEL_DIR, 'aqi_regressor.joblib'))
classifier = joblib.load(os.path.join(MODEL_DIR, 'risk_classifier.joblib'))
scaler     = joblib.load(os.path.join(MODEL_DIR, 'scaler.joblib'))

with open(os.path.join(MODEL_DIR, 'meta.json')) as f:
    meta = json.load(f)

FEATURES = meta['features']

RISK_LABELS = {0: 'Safe', 1: 'Moderate', 2: 'High Risk'}
RISK_COLORS = {0: '#22c55e', 1: '#f59e0b', 2: '#ef4444'}

AQI_CATEGORIES = [
    (0,   50,  'Good',        '#22c55e'),
    (51,  100, 'Satisfactory','#84cc16'),
    (101, 200, 'Moderate',    '#f59e0b'),
    (201, 300, 'Poor',        '#f97316'),
    (301, 400, 'Very Poor',   '#ef4444'),
    (401, 500, 'Severe',      '#7c3aed'),
]

def categorize_aqi(aqi):
    for lo, hi, label, color in AQI_CATEGORIES:
        if lo <= aqi <= hi:
            return label, color
    return 'Severe', '#7c3aed'

def get_recommendations(aqi, risk):
    """Generate contextual pollution control recommendations."""
    recs = []
    if aqi > 300:
        recs += [
            {'icon': '🚗', 'action': 'Implement Odd-Even vehicle scheme', 'priority': 'High'},
            {'icon': '🏭', 'action': 'Halt brick kilns and construction activity', 'priority': 'High'},
            {'icon': '🏠', 'action': 'Issue Work-From-Home advisory', 'priority': 'High'},
            {'icon': '🚫', 'action': 'Ban stubble burning and open waste burning', 'priority': 'High'},
            {'icon': '😷', 'action': 'Advise N95 mask usage outdoors', 'priority': 'High'},
        ]
    elif aqi > 200:
        recs += [
            {'icon': '🚦', 'action': 'Enforce traffic signal timing optimization', 'priority': 'Medium'},
            {'icon': '🌿', 'action': 'Deploy water-sprinkler trucks on major roads', 'priority': 'Medium'},
            {'icon': '🏗️', 'action': 'Restrict construction dust-generating activities', 'priority': 'Medium'},
            {'icon': '🚌', 'action': 'Increase public transport frequency', 'priority': 'Medium'},
        ]
    elif aqi > 100:
        recs += [
            {'icon': '🚴', 'action': 'Promote cycling and walking for short distances', 'priority': 'Low'},
            {'icon': '🌳', 'action': 'Urban greening drives — plant more trees', 'priority': 'Low'},
            {'icon': '⚡', 'action': 'Push EV adoption awareness campaigns', 'priority': 'Low'},
        ]
    else:
        recs += [
            {'icon': '✅', 'action': 'Air quality is good — maintain current practices', 'priority': 'Info'},
            {'icon': '📊', 'action': 'Continue monitoring and data collection', 'priority': 'Info'},
        ]
    return recs

# ─── API Routes ───────────────────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'AirLedger API running'})


@app.route('/api/predict', methods=['POST'])
def predict():
    """
    POST /api/predict
    Body: { pm25, pm10, no2, so2, co, temperature, humidity,
            wind_speed, rainfall, visibility, month, day_of_week, is_weekend }
    Returns: { aqi, category, risk_level, risk_label, recommendations }
    """
    data = request.get_json(force=True)
    try:
        input_vec = np.array([[float(data.get(f, 0)) for f in FEATURES]])
        input_scaled = scaler.transform(input_vec)

        aqi  = float(regressor.predict(input_scaled)[0])
        aqi  = max(0, min(500, aqi))
        risk = int(classifier.predict(input_scaled)[0])
        risk_prob = classifier.predict_proba(input_scaled)[0].tolist()

        category, cat_color = categorize_aqi(aqi)
        recs = get_recommendations(aqi, risk)

        return jsonify({
            'aqi':          round(aqi, 1),
            'category':     category,
            'category_color': cat_color,
            'risk_level':   risk,
            'risk_label':   RISK_LABELS[risk],
            'risk_color':   RISK_COLORS[risk],
            'risk_probabilities': {
                'Safe':      round(risk_prob[0]*100, 1),
                'Moderate':  round(risk_prob[1]*100, 1),
                'High Risk': round(risk_prob[2]*100, 1),
            },
            'recommendations': recs,
            'pollution_budget': {
                'safe_limit': 100,
                'predicted':  round(aqi, 1),
                'exceeded':   aqi > 100,
                'overshoot':  round(max(0, aqi - 100), 1),
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    """Returns aggregated stats for the dashboard."""
    df = pd.read_csv(DATA_PATH)

    # Latest 30 days trend
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')
    recent = df.tail(60).groupby('date')['aqi'].mean().reset_index()
    trend = [{'date': str(r['date'].date()), 'aqi': round(r['aqi'],1)}
             for _, r in recent.iterrows()]

    # Monthly averages (Jan–Dec)
    monthly = df.groupby('month')['aqi'].mean().round(1)
    month_names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    monthly_data = [{'month': month_names[m-1], 'aqi': monthly.get(m, 0)}
                    for m in range(1, 13)]

    # Location averages
    loc_avg = df.groupby('location')['aqi'].mean().round(1).reset_index()
    location_data = [{'location': r['location'], 'aqi': r['aqi']} for _, r in loc_avg.iterrows()]

    # Risk distribution
    risk_counts = df['risk_level'].value_counts().sort_index()
    risk_data = [
        {'label': 'Safe',      'count': int(risk_counts.get(0, 0)), 'color': '#22c55e'},
        {'label': 'Moderate',  'count': int(risk_counts.get(1, 0)), 'color': '#f59e0b'},
        {'label': 'High Risk', 'count': int(risk_counts.get(2, 0)), 'color': '#ef4444'},
    ]

    # Summary stats
    stats = {
        'avg_aqi':       round(float(df['aqi'].mean()), 1),
        'max_aqi':       round(float(df['aqi'].max()), 1),
        'min_aqi':       round(float(df['aqi'].min()), 1),
        'high_risk_days': int((df['risk_level'] == 2).sum()),
        'safe_days':      int((df['risk_level'] == 0).sum()),
        'total_days':     len(df),
    }

    return jsonify({
        'trend':         trend,
        'monthly':       monthly_data,
        'by_location':   location_data,
        'risk_dist':     risk_data,
        'stats':         stats,
    })


@app.route('/api/model-info', methods=['GET'])
def model_info():
    """Returns model evaluation metrics."""
    return jsonify({
        'regression':      meta['regression_results'],
        'classification':  meta['classification_results'],
        'confusion_matrix': meta['confusion_matrix'],
        'feature_importance': meta['feature_importance'],
        'features':        FEATURES,
    })


@app.route('/api/forecast', methods=['POST'])
def forecast():
    """
    Simple 7-day forecast based on seasonality.
    POST: { month, base_pm25, base_temp, base_humidity, base_wind }
    """
    data = request.get_json(force=True)
    month = int(data.get('month', 1))
    base_pm25 = float(data.get('base_pm25', 80))
    base_temp = float(data.get('base_temp', 25))
    base_humidity = float(data.get('base_humidity', 55))
    base_wind = float(data.get('base_wind', 5))

    forecasts = []
    from datetime import datetime, timedelta
    today = datetime.today()
    for i in range(7):
        day = today + timedelta(days=i+1)
        noise = np.random.normal(0, 15)
        pm25 = max(5, base_pm25 + noise)
        pm10 = pm25 * 1.5
        no2  = pm25 * 0.33
        so2  = pm25 * 0.15
        co   = pm25 * 0.022
        vis  = max(0.5, 10 - pm25/80)

        vec = np.array([[pm25, pm10, no2, so2, co,
                         base_temp + np.random.normal(0,1),
                         base_humidity + np.random.normal(0,3),
                         base_wind + np.random.normal(0,0.5),
                         0, vis, day.month, day.weekday(), int(day.weekday()>=5)]])
        vec_scaled = scaler.transform(vec)
        aqi = float(regressor.predict(vec_scaled)[0])
        aqi = max(0, min(500, aqi))
        risk = int(classifier.predict(vec_scaled)[0])
        category, color = categorize_aqi(aqi)

        forecasts.append({
            'date': day.strftime('%a %b %d'),
            'aqi': round(aqi, 1),
            'risk': RISK_LABELS[risk],
            'risk_color': RISK_COLORS[risk],
            'category': category,
            'color': color,
        })

    return jsonify({'forecast': forecasts})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
