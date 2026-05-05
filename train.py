"""
AirLedger - Model Training Pipeline
Trains AQI regression model + risk classification model.
Saves models with joblib for use in Flask API.
"""

import pandas as pd
import numpy as np
import joblib
import json
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import (mean_absolute_error, r2_score, mean_squared_error,
                             accuracy_score, classification_report, confusion_matrix)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'delhi_aqi_data.csv')
MODEL_DIR = os.path.join(BASE_DIR, 'model')
os.makedirs(MODEL_DIR, exist_ok=True)

# ─── Features ────────────────────────────────────────────────────────────────
FEATURES = ['pm25', 'pm10', 'no2', 'so2', 'co',
            'temperature', 'humidity', 'wind_speed', 'rainfall',
            'visibility', 'month', 'day_of_week', 'is_weekend']
TARGET_REG   = 'aqi'
TARGET_CLASS = 'risk_level'

LOCATION_MAP = {
    'Anand Vihar': 0, 'ITO': 1, 'RK Puram': 2, 'Rohini': 3,
    'Dwarka': 4, 'Noida': 5, 'Gurugram': 6
}

def load_and_prepare():
    df = pd.read_csv(DATA_PATH)
    df = df.dropna()
    df['location_enc'] = df['location'].map(LOCATION_MAP).fillna(0).astype(int)
    feats = FEATURES  # location omitted to keep inference simpler
    X = df[feats]
    y_reg   = df[TARGET_REG]
    y_class = df[TARGET_CLASS]
    return X, y_reg, y_class, df

def train_regression(X_train, X_test, y_train, y_test):
    models = {
        'Linear Regression': LinearRegression(),
        'Random Forest':     RandomForestRegressor(n_estimators=120, random_state=42, n_jobs=-1),
        'Gradient Boosting': GradientBoostingRegressor(n_estimators=120, learning_rate=0.1, random_state=42),
    }
    results = {}
    best_model, best_r2 = None, -999

    for name, model in models.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        mae  = mean_absolute_error(y_test, preds)
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        r2   = r2_score(y_test, preds)
        results[name] = {'mae': round(mae,2), 'rmse': round(rmse,2), 'r2': round(r2,4)}
        print(f"  [{name}] MAE={mae:.1f}  RMSE={rmse:.1f}  R²={r2:.4f}")
        if r2 > best_r2:
            best_r2, best_model = r2, model

    print(f"  → Best regression model: {type(best_model).__name__}")
    return best_model, results

def train_classification(X_train, X_test, y_train, y_test):
    models = {
        'Logistic Regression': LogisticRegression(max_iter=500, random_state=42),
        'Random Forest':       RandomForestClassifier(n_estimators=120, random_state=42, n_jobs=-1),
    }
    results = {}
    best_model, best_acc = None, -1

    for name, model in models.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        acc = accuracy_score(y_test, preds)
        results[name] = {
            'accuracy': round(acc, 4),
            'report': classification_report(y_test, preds, output_dict=True)
        }
        print(f"  [{name}] Accuracy={acc:.4f}")
        if acc > best_acc:
            best_acc, best_model = acc, model

    # Confusion matrix of best model
    cm = confusion_matrix(y_test, best_model.predict(X_test)).tolist()
    print(f"  → Best classification model: {type(best_model).__name__}")
    return best_model, results, cm

def main():
    print("Loading data...")
    X, y_reg, y_class, df = load_and_prepare()

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Regression split
    Xr_tr, Xr_te, yr_tr, yr_te = train_test_split(X_scaled, y_reg,   test_size=0.2, random_state=42)
    # Classification split
    Xc_tr, Xc_te, yc_tr, yc_te = train_test_split(X_scaled, y_class, test_size=0.2, random_state=42)

    print("\nTraining regression models...")
    reg_model, reg_results = train_regression(Xr_tr, Xr_te, yr_tr, yr_te)

    print("\nTraining classification models...")
    cls_model, cls_results, conf_matrix = train_classification(Xc_tr, Xc_te, yc_tr, yc_te)

    # Feature importance (from Random Forest regressor if available)
    feat_importance = {}
    if hasattr(reg_model, 'feature_importances_'):
        feat_importance = dict(zip(FEATURES, reg_model.feature_importances_.round(4).tolist()))

    # Monthly averages for dashboard
    df['month_name'] = pd.to_datetime(df['date']).dt.strftime('%b')
    monthly = df.groupby('month')['aqi'].mean().round(1).to_dict()

    # Risk distribution
    risk_dist = df['risk_level'].value_counts().sort_index().to_dict()

    # Location averages
    loc_avg = df.groupby('location')['aqi'].mean().round(1).to_dict()

    # Save artefacts
    joblib.dump(reg_model, os.path.join(MODEL_DIR, 'aqi_regressor.joblib'))
    joblib.dump(cls_model, os.path.join(MODEL_DIR, 'risk_classifier.joblib'))
    joblib.dump(scaler,    os.path.join(MODEL_DIR, 'scaler.joblib'))

    meta = {
        'features': FEATURES,
        'regression_results': reg_results,
        'classification_results': {k: {'accuracy': v['accuracy']} for k,v in cls_results.items()},
        'confusion_matrix': conf_matrix,
        'feature_importance': feat_importance,
        'monthly_avg_aqi': monthly,
        'risk_distribution': risk_dist,
        'location_avg_aqi': loc_avg,
        'location_map': LOCATION_MAP,
    }
    with open(os.path.join(MODEL_DIR, 'meta.json'), 'w') as f:
        json.dump(meta, f, indent=2)

    print("\nAll models saved to /model/")
    print("Meta saved to model/meta.json")

if __name__ == '__main__':
    main()
