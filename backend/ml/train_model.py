# -*- coding: utf-8 -*-
"""
Phase 4 - Ex-Factory Pricing Model
- Prev_Month_Sales normalized by zone average so zone/season features are not drowned out
- No logistics (company sells ex-factory; transport is buyer's responsibility)
- Zone drives demand forecasting; season + subsidy + adoption drive price variation
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score
import pickle
import json
import warnings
warnings.filterwarnings('ignore')

np.random.seed(42)

print("=" * 60)
print("  HALCHAL INDUSTRIES - ML PRICING ENGINE (PHASE 4)")
print("=" * 60)

PIPE_TYPES = ['16mm Inline', '20mm Inline', '16mm Online', '20mm Online']
YEARS      = [2022, 2023, 2024, 2025, 2026]

BASE_PRICES = {
    '16mm Inline': 1050,
    '20mm Inline': 1350,
    '16mm Online': 1200,
    '20mm Online': 1500,
}

# Monthly base demand (bundles, Maharashtra baseline)
BASE_DEMAND = {
    '16mm Inline': 480,
    '20mm Inline': 350,
    '16mm Online': 260,
    '20mm Online': 190,
}

# Pan-India states with zone and drip adoption index
# Adoption index: NABARD Micro-Irrigation Report 2023-24
STATES = {
    "Maharashtra":    {"zone": 1, "adoption": 1.00},
    "Gujarat":        {"zone": 2, "adoption": 1.42},
    "Goa":            {"zone": 2, "adoption": 0.82},
    "Madhya Pradesh": {"zone": 2, "adoption": 0.86},
    "Chhattisgarh":   {"zone": 2, "adoption": 0.68},
    "Karnataka":      {"zone": 3, "adoption": 1.20},
    "Andhra Pradesh": {"zone": 3, "adoption": 1.38},
    "Telangana":      {"zone": 3, "adoption": 1.26},
    "Tamil Nadu":     {"zone": 3, "adoption": 1.16},
    "Kerala":         {"zone": 3, "adoption": 0.72},
    "Rajasthan":      {"zone": 4, "adoption": 1.22},
    "Haryana":        {"zone": 4, "adoption": 0.84},
    "Punjab":         {"zone": 4, "adoption": 0.78},
    "Uttar Pradesh":  {"zone": 4, "adoption": 0.68},
    "Delhi":          {"zone": 4, "adoption": 0.58},
    "Bihar":          {"zone": 5, "adoption": 0.52},
    "West Bengal":    {"zone": 5, "adoption": 0.48},
    "Odisha":         {"zone": 5, "adoption": 0.44},
    "Jharkhand":      {"zone": 5, "adoption": 0.40},
    "Assam":          {"zone": 5, "adoption": 0.36},
}

SEASON_MULT = {
    'Kharif': 1.28,
    'Rabi':   1.12,
    'Summer': 0.80,
}

MONTH_PATTERN = {
    1: 1.05, 2: 0.88, 3: 0.82, 4: 0.85, 5: 0.78,
    6: 1.18, 7: 1.25, 8: 1.28, 9: 1.20,
    10: 1.12, 11: 1.06, 12: 1.02,
}

YEAR_GROWTH = {2022: 0.80, 2023: 0.90, 2024: 1.00, 2025: 1.10, 2026: 1.20}

def get_season(month):
    if   month in [6, 7, 8, 9]:    return 'Kharif'
    elif month in [10, 11, 12, 1]: return 'Rabi'
    return 'Summer'

# ── Generate dataset ───────────────────────────────────────────────────────────
records = []

for year in YEARS:
    for month in range(1, 13):
        season = get_season(month)
        for state, meta in STATES.items():
            for pipe in PIPE_TYPES:
                n_samples = np.random.randint(8, 15)
                for _ in range(n_samples):
                    expected = (
                        BASE_DEMAND[pipe]
                        * meta["adoption"]
                        * SEASON_MULT[season]
                        * MONTH_PATTERN[month]
                        * YEAR_GROWTH[year]
                    )
                    subsidy = np.random.choice([0, 1], p=[0.28, 0.72])
                    if subsidy:
                        expected *= 1.18

                    # Zone average demand (used to normalize prev_sales)
                    zone_avg = BASE_DEMAND[pipe] * SEASON_MULT[season] * MONTH_PATTERN[month] * YEAR_GROWTH[year]

                    prev_raw  = np.clip(expected * np.random.uniform(0.72, 1.28), 20, 1400)
                    # KEY FIX: store prev_sales as ratio vs zone average
                    # This prevents prev_sales from dominating and allows zone/season to show up
                    prev_sales_ratio = prev_raw / max(zone_avg, 1)

                    noise    = np.random.normal(0, expected * 0.12)
                    qty_sold = max(20, expected + noise)

                    records.append({
                        'Pipe_Type':            pipe,
                        'Zone_ID':              meta["zone"],
                        'Adoption_Index':       meta["adoption"],
                        'Season':               season,
                        'Month':                month,
                        'Year':                 year,
                        'Base_Price':           BASE_PRICES[pipe],
                        'Prev_Sales_Ratio':     round(prev_sales_ratio, 3),  # normalized
                        'Govt_Subsidy_Active':  int(subsidy),
                        'Quantity_Sold':        round(qty_sold),
                    })

df = pd.DataFrame(records)
print(f"\nDataset: {len(df):,} records")
print(f"Demand range: {df['Quantity_Sold'].min():.0f} - {df['Quantity_Sold'].max():.0f}")

# ── Encode categoricals ────────────────────────────────────────────────────────
encoders = {}
for col in ['Pipe_Type', 'Season']:
    le = LabelEncoder()
    df[col + '_enc'] = le.fit_transform(df[col])
    encoders[col] = le

FEATURE_COLS = [
    'Pipe_Type_enc', 'Zone_ID', 'Adoption_Index', 'Season_enc',
    'Month', 'Year', 'Base_Price', 'Prev_Sales_Ratio', 'Govt_Subsidy_Active'
]

X = df[FEATURE_COLS]
y = df['Quantity_Sold']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ── Train both models ──────────────────────────────────────────────────────────
print("\nTraining models...")

gb = GradientBoostingRegressor(
    n_estimators=350, learning_rate=0.05,
    max_depth=5, min_samples_leaf=8,
    subsample=0.8, random_state=42
)
gb.fit(X_train, y_train)
gb_mae = mean_absolute_error(y_test, gb.predict(X_test))
gb_r2  = r2_score(y_test, gb.predict(X_test))

rf = RandomForestRegressor(
    n_estimators=200, max_depth=14,
    min_samples_leaf=4, random_state=42
)
rf.fit(X_train, y_train)
rf_mae = mean_absolute_error(y_test, rf.predict(X_test))
rf_r2  = r2_score(y_test, rf.predict(X_test))

print(f"  GradientBoosting -> MAE: {gb_mae:6.1f}   R2: {gb_r2:.4f}")
print(f"  RandomForest     -> MAE: {rf_mae:6.1f}   R2: {rf_r2:.4f}")

best      = gb if gb_r2 > rf_r2 else rf
best_name = "GradientBoosting" if best is gb else "RandomForest"
print(f"\n  Selected: {best_name}  (R2 = {max(gb_r2, rf_r2):.4f})")

# ── Feature importance ─────────────────────────────────────────────────────────
print("\nFeature Importance:")
pairs = sorted(zip(FEATURE_COLS, best.feature_importances_), key=lambda x: -x[1])
for feat, imp in pairs:
    bar = '#' * int(imp * 60)
    print(f"  {feat:<28} {imp:.4f}  {bar}")

# ── Demand stats ───────────────────────────────────────────────────────────────
avg_demand = {
    "by_pipe_type": df.groupby('Pipe_Type')['Quantity_Sold'].mean().round(2).to_dict(),
    "by_zone_pipe": df.groupby(['Zone_ID', 'Pipe_Type'])['Quantity_Sold'].mean().round(2).unstack().to_dict(),
    "overall": round(float(df['Quantity_Sold'].mean()), 2)
}

print("\nAverage monthly demand by pipe type:")
for k, v in avg_demand["by_pipe_type"].items():
    print(f"  {k:<15} {v:.1f} bundles/month")

# ── Save ───────────────────────────────────────────────────────────────────────
with open("rf_demand_model.pkl", "wb") as f: pickle.dump(best, f)
with open("label_encoders.pkl",  "wb") as f: pickle.dump(encoders, f)
with open("avg_demand.json",     "w")  as f: json.dump(avg_demand, f, indent=2)

print("\n[OK] Saved: rf_demand_model.pkl, label_encoders.pkl, avg_demand.json")
print("-> Restart ml_api.py to load updated model.\n")
