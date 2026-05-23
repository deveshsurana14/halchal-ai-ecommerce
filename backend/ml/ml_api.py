from flask import Flask, request, jsonify
import pickle
import json
import pandas as pd
from datetime import datetime

app = Flask(__name__)

rf_model = pickle.load(open("rf_demand_model.pkl", "rb"))
encoders = pickle.load(open("label_encoders.pkl", "rb"))
avg_data = json.load(open("avg_demand.json"))

# Per-bundle base prices (1 bundle = 300m coil) — company's manufacturing cost base
BASE_PRICES = {
    "16mm Inline": 1050,
    "16mm Online": 1200,
    "20mm Inline": 1350,
    "20mm Online": 1500,
}

# Competitor market prices per bundle (Maharashtra benchmark)
COMPETITOR_PRICES = {
    "16mm Inline": 1214,
    "16mm Online": 1380,
    "20mm Inline": 1500,
    "20mm Online": 1650,
}

# Zone definitions — used for demand forecasting and market premium
# No logistics factor: company sells ex-factory, transport is buyer's cost
ZONE_META = {
    "Z1": {"zone_id": 1, "adoption": 1.00, "label": "Zone 1 - Maharashtra"},
    "Z2": {"zone_id": 2, "adoption": 1.42, "label": "Zone 2 - West & Central"},
    "Z3": {"zone_id": 3, "adoption": 1.20, "label": "Zone 3 - South India"},
    "Z4": {"zone_id": 4, "adoption": 1.22, "label": "Zone 4 - North India"},
    "Z5": {"zone_id": 5, "adoption": 0.52, "label": "Zone 5 - East & NE"},
}

STATE_META = {
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

FEATURE_COLS = [
    'Pipe_Type_enc', 'Zone_ID', 'Adoption_Index', 'Season_enc',
    'Month', 'Year', 'Base_Price', 'Prev_Sales_Ratio', 'Govt_Subsidy_Active'
]

def get_season(month):
    if month in [6, 7, 8, 9]:      return "Kharif"
    elif month in [10, 11, 12, 1]: return "Rabi"
    return "Summer"

def get_base_key(pipe_type):
    if "16mm" in pipe_type and "Inline" in pipe_type:   return "16mm Inline"
    elif "16mm" in pipe_type and "Online" in pipe_type: return "16mm Online"
    elif "20mm" in pipe_type and "Inline" in pipe_type: return "20mm Inline"
    elif "20mm" in pipe_type and "Online" in pipe_type: return "20mm Online"
    return "16mm Inline"


@app.route("/calculate-price", methods=["POST"])
def calculate_price():
    try:
        data = request.json

        pipe_type  = data.get("pipeType") or data.get("pipe_type")
        month      = int(data.get("month",  datetime.now().month))
        year       = int(data.get("year",   datetime.now().year))
        prev_sales = float(data.get("prev_month_sales", 450))
        subsidy    = int(data.get("govt_subsidy", 1))
        zone_id    = data.get("zone_id") or data.get("zone")
        state_name = data.get("state", "Maharashtra")

        if not pipe_type:
            return jsonify({"error": "Missing pipe_type"}), 400

        # Resolve zone and adoption
        if zone_id and zone_id in ZONE_META:
            zm       = ZONE_META[zone_id]
            zone_num = zm["zone_id"]
            adoption = zm["adoption"]
        else:
            sm       = STATE_META.get(state_name, STATE_META["Maharashtra"])
            zone_num = sm["zone"]
            adoption = sm["adoption"]
            zone_id  = f"Z{zone_num}"

        base_key = get_base_key(pipe_type)
        season   = get_season(month)

        pipe_enc   = int(encoders["Pipe_Type"].transform([base_key])[0])
        season_enc = int(encoders["Season"].transform([season])[0])

        base_price       = BASE_PRICES[base_key]
        competitor_price = COMPETITOR_PRICES[base_key]
        avg_demand       = avg_data["by_pipe_type"].get(base_key, avg_data["overall"])

        # Normalize prev_sales as ratio vs overall average (matches training)
        prev_sales_ratio = prev_sales / max(avg_demand, 1)

        features = pd.DataFrame([[
            pipe_enc, zone_num, adoption, season_enc,
            month, year, base_price, prev_sales_ratio, subsidy
        ]], columns=FEATURE_COLS)

        # ── STEP 1: ML demand prediction ──────────────────────────────────────
        predicted_demand = float(rf_model.predict(features)[0])

        # ── STEP 2: Demand factor [0.82 – 1.22] ──────────────────────────────
        # Sensitivity 0.35 — moderate enough to show meaningful price variation
        # without making prices volatile for distributors
        demand_ratio  = predicted_demand / avg_demand
        demand_factor = 1.0 + 0.35 * (demand_ratio - 1.0)
        demand_factor = max(0.82, min(demand_factor, 1.22))

        # ── STEP 3: Adoption-based market factor ──────────────────────────────
        # High adoption (Gujarat 1.42) = strong market = price premium sustainable
        # Low adoption (Assam 0.36) = developing market = need competitive pricing
        # Coefficient 0.15 — meaningful but bounded
        # Max effect: Gujarat +6.3%, Assam -9.6%
        adoption_factor = 1.0 + (adoption - 1.0) * 0.15
        adoption_factor = max(0.90, min(adoption_factor, 1.10))

        # ── STEP 4: Competitor-aware pricing ─────────────────────────────────
        price_diff_ratio = (competitor_price - base_price) / base_price

        if demand_factor >= 1.10:
            # Strong demand — price toward competitor ceiling to capture margin
            competitor_factor = 1.0 + 0.60 * price_diff_ratio
            competitor_factor = max(0.99, min(competitor_factor, 1.10))
        elif demand_factor <= 0.92:
            # Weak demand — undercut to stimulate sales
            competitor_factor = 1.0 - 0.25 * abs(price_diff_ratio)
            competitor_factor = max(0.92, min(competitor_factor, 0.99))
        else:
            # Normal — slight undercut to stay competitive
            competitor_factor = 1.0 - 0.06 * price_diff_ratio
            competitor_factor = max(0.96, min(competitor_factor, 1.04))

        # ── STEP 5: Ex-factory price (no logistics — buyer handles transport) ─
        # 0.50 / 0.50 split: equal weight to base stability and ML signal
        raw_price      = base_price * demand_factor * competitor_factor * adoption_factor
        smoothed_price = 0.50 * base_price + 0.50 * raw_price
        final_price    = max(base_price * 0.85, min(smoothed_price, base_price * 1.20))

        # ── STEP 6: Round to nearest ₹10 ─────────────────────────────────────
        final_price = round(final_price / 10) * 10

        return jsonify({
            "pipe_type":         base_key,
            "zone_id":           zone_id,
            "season":            season,
            "predicted_demand":  round(predicted_demand, 1),
            "recommended_price": round(float(final_price), 2),
            "final_price":       round(float(final_price), 2),
            "base_price":        base_price,
            "competitor_price":  competitor_price,
            "factors": {
                "demand_factor":     round(demand_factor,     4),
                "competitor_factor": round(competitor_factor, 4),
                "logistics_factor":  1.0,
                "market_factor":     round(adoption_factor,   4),
            }
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5001, debug=False)
