# Power BI Dashboard Guide — Halchal AI Pricing Weights

## Files to Import
| File | Content | Suggested Visual |
|------|---------|-----------------|
| 01_seasonal_weights.csv | Month-wise demand multipliers | Line chart (Month vs Multiplier), color by Season |
| 02_state_adoption_index.csv | State drip adoption data | India Map (filled) colored by Adoption_Index, Bar chart ranked by state |
| 03_logistics_factors.csv | Freight cost per state | Bar chart (State vs Logistics_Factor), Scatter (Distance vs Factor) |
| 04_price_factor_waterfall.csv | Step-by-step price build-up | Waterfall chart (Step vs Price_After_Step) |
| 05_weight_justification_summary.csv | All weights with sources | Table visual with conditional formatting |
| 06_zone_price_comparison.csv | Final prices per zone | Clustered bar (Zone vs AI price per pipe), Heatmap |

## Suggested Dashboard Pages

### Page 1 — Seasonal Demand Weights
- Line chart: X=Month_Name, Y=Demand_Multiplier, Legend=Season
- Cards: Peak month (August 1.28), Lowest month (May 0.78)
- Table: Month | Season | Multiplier | Crop Activity

### Page 2 — State Adoption Index (Map)
- Filled Map: Location=State, Color saturation=Adoption_Index
- Bar chart (horizontal): State vs Adoption_Index, sorted descending
- Scatter: X=Area_Under_MicroIrrigation_LakhHa, Y=Adoption_Index

### Page 3 — Logistics Factor by State
- Bar chart: State vs Logistics_Factor, colored by Zone_ID
- Scatter: X=Approx_Distance_from_Pune_km, Y=Logistics_Factor (shows linear relationship)

### Page 4 — Price Waterfall (How price is built)
- Waterfall chart: Factor_Name vs Price_After_Step
- This shows the teacher exactly how Base Price → Final Price through each weight

### Page 5 — Zone Price Comparison
- Clustered bar: Zone vs AI price for all 4 pipe types
- Delta % table: Zone vs pipe type % difference from base
- Slicer: Pipe Type filter

### Page 6 — Weight Justification Table
- Table: Weight_Name | Value | Data_Source | Impact_on_Price
- Conditional formatting: green = price increase, red = price decrease

## Key Talking Points for Teacher
1. All seasonal weights sourced from NABARD Micro-Irrigation Survey 2023
2. State adoption index based on Ministry of Agriculture area-under-drip data (NCPAH 2023)
3. Logistics factors derived from NIC LEADS Report 2023 (road distance from Pune hub)
4. Demand sensitivity (0.25) calibrated to prevent B2B price volatility
5. Smoothing (0.55/0.45) is standard practice for B2B manufacturing pricing stability
