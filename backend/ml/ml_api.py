from flask import Flask, request, jsonify
import pickle
import json
import pandas as pd

app = Flask(__name__)

# Load trained model and configs
rf_model = pickle.load(open("rf_demand_model.pkl", "rb"))
encoders = pickle.load(open("label_encoders.pkl", "rb"))

avg_data = json.load(open("avg_demand.json"))
REGION_FACTORS = json.load(open("region_factors.json"))
BASE_PRICES = json.load(open("base_prices.json"))

ALPHA = 0.2
BETA = 0.15


def get_season(month):
    if month in [6, 7, 8, 9]:
        return "Kharif"
    elif month in [10, 11, 12, 1]:
        return "Rabi"
    else:
        return "Summer"


@app.route("/calculate-price", methods=["POST"])
def calculate_price():
    data = request.json

    pipe_type = data["pipe_type"]
    region = data["region"]
    month = data["month"]
    year = data["year"]
    prev_sales = data.get("prev_month_sales", 450)
    subsidy = data.get("govt_subsidy", 1)

    season = get_season(month)

    pipe_enc = encoders["Pipe_Type"].transform([pipe_type])[0]
    region_enc = encoders["Region"].transform([region])[0]
    season_enc = encoders["Season"].transform([season])[0]

    base_price = BASE_PRICES[pipe_type]

    features = pd.DataFrame([[
        pipe_enc,
        region_enc,
        season_enc,
        month,
        year,
        base_price,
        prev_sales,
        subsidy
    ]], columns=[
        'Pipe_Type_enc',
        'Region_enc',
        'Season_enc',
        'Month',
        'Year',
        'Base_Price',
        'Prev_Month_Sales',
        'Govt_Subsidy_Active'
    ])

    predicted_demand = rf_model.predict(features)[0]

    avg_demand = avg_data["by_pipe_type"].get(
        pipe_type,
        avg_data["overall"]
    )

    demand_factor = 1 + ALPHA * (predicted_demand / avg_demand)
    region_factor = REGION_FACTORS.get(region, 1.0)

    final_price = base_price * demand_factor * region_factor

    return jsonify({
        "predicted_demand": round(float(predicted_demand), 2),
        "recommended_price": round(float(final_price), 2)
    })


if __name__ == "__main__":
    app.run(port=5001)