# -*- coding: utf-8 -*-
"""
Halchal Industries — Power BI CSV Dashboard
Reads the 6 CSV files and produces a single standalone HTML file
with all charts. Open the HTML in any browser — no Power BI needed.
"""

import os, json
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import seaborn as sns
import base64, io

os.chdir(os.path.dirname(os.path.abspath(__file__)))

BRAND   = "#1a3c5e"
ACCENT  = "#e8773f"
GREEN   = "#2ecc71"
RED     = "#e74c3c"
YELLOW  = "#f1c40f"
PURPLE  = "#8e44ad"

plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 9})

# ── Load CSVs ──────────────────────────────────────────────────────────────────
df_season  = pd.read_csv("01_seasonal_weights.csv")
df_adopt   = pd.read_csv("02_state_adoption_index.csv")
df_logi    = pd.read_csv("03_logistics_factors.csv")
df_water   = pd.read_csv("04_price_factor_waterfall.csv")
df_weights = pd.read_csv("05_weight_justification_summary.csv")
df_zone    = pd.read_csv("06_zone_price_comparison.csv")

charts = []   # list of (title, base64_png)

def fig_to_b64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode()
    plt.close(fig)
    return b64

# ══════════════════════════════════════════════════════════════════════════════
# CHART 1 — Seasonal demand multipliers (line + bar)
# ══════════════════════════════════════════════════════════════════════════════
fig, axes = plt.subplots(1, 2, figsize=(13, 4.5))

season_colors = {"Kharif": "#27ae60", "Rabi": "#2980b9", "Summer": ACCENT}
ax = axes[0]
for season, grp in df_season.groupby("Season"):
    ax.plot(grp["Month"], grp["Demand_Multiplier"], marker="o", ms=6,
            color=season_colors[season], lw=2, label=season)
    for _, row in grp.iterrows():
        ax.annotate(f'{row["Demand_Multiplier"]}',
                    (row["Month"], row["Demand_Multiplier"]),
                    textcoords="offset points", xytext=(0, 7), ha="center", fontsize=7.5)
ax.axhline(1.0, color="gray", ls="--", lw=0.8, label="Baseline (1.0)")
ax.set_xticks(range(1, 13))
ax.set_xticklabels(df_season["Month_Name"], rotation=45, ha="right", fontsize=8)
ax.set_ylabel("Demand Multiplier", fontsize=9)
ax.set_title("Monthly Demand Multiplier by Season", fontweight="bold", color=BRAND)
ax.legend(fontsize=8); ax.spines[["top","right"]].set_visible(False)
ax.set_ylim(0.65, 1.42)

ax2 = axes[1]
bar_colors = [season_colors[s] for s in df_season["Season"]]
bars = ax2.bar(df_season["Month_Name"], df_season["Demand_Multiplier"],
               color=bar_colors, edgecolor="white")
ax2.axhline(1.0, color="gray", ls="--", lw=0.8)
for bar, val in zip(bars, df_season["Demand_Multiplier"]):
    ax2.text(bar.get_x()+bar.get_width()/2, val+0.01, f"{val}", ha="center", fontsize=7.5)
ax2.set_xticks(range(len(df_season)))
ax2.set_xticklabels(df_season["Month_Name"], rotation=45, ha="right", fontsize=8)
ax2.set_ylabel("Demand Multiplier"); ax2.set_ylim(0.65, 1.45)
ax2.set_title("Bar View — Kharif Peak vs Summer Trough", fontweight="bold", color=BRAND)
legend_elems = [mpatches.Patch(color=c, label=s) for s, c in season_colors.items()]
ax2.legend(handles=legend_elems, fontsize=8)
ax2.spines[["top","right"]].set_visible(False)

fig.suptitle("Page 1 — Seasonal Demand Weights", fontsize=13, fontweight="bold", color=BRAND, y=1.02)
charts.append(("Page 1: Seasonal Demand Weights", fig_to_b64(fig)))

# ══════════════════════════════════════════════════════════════════════════════
# CHART 2 — State adoption index (ranked bar + scatter)
# ══════════════════════════════════════════════════════════════════════════════
df_adopt_s = df_adopt.sort_values("Adoption_Index", ascending=False)
zone_palette = {"Z1": BRAND, "Z2": ACCENT, "Z3": GREEN, "Z4": YELLOW, "Z5": RED}
fig, axes = plt.subplots(1, 2, figsize=(14, 5.5))

ax = axes[0]
bar_cols = [zone_palette.get(z, "gray") for z in df_adopt_s["Zone_ID"]]
bars = ax.barh(df_adopt_s["State"], df_adopt_s["Adoption_Index"],
               color=bar_cols, edgecolor="white")
ax.axvline(1.0, color="gray", ls="--", lw=1, label="Maharashtra baseline")
for bar, val in zip(bars, df_adopt_s["Adoption_Index"]):
    ax.text(val+0.01, bar.get_y()+bar.get_height()/2, f"{val}", va="center", fontsize=7.5)
ax.set_xlabel("Adoption Index (Maharashtra = 1.0)")
ax.set_title("State Drip Adoption Index (NABARD 2023)", fontweight="bold", color=BRAND)
legend_elems = [mpatches.Patch(color=c, label=z) for z, c in zone_palette.items()]
ax.legend(handles=legend_elems, fontsize=8, title="Zone", loc="lower right")
ax.spines[["top","right"]].set_visible(False)

ax2 = axes[1]
for zone, grp in df_adopt.groupby("Zone_ID"):
    col = zone_palette.get(zone, "gray")
    ax2.scatter(grp["Area_Under_MicroIrrigation_LakhHa"], grp["Adoption_Index"],
                color=col, s=80, label=zone, zorder=3)
    for _, row in grp.iterrows():
        ax2.annotate(row["State"], (row["Area_Under_MicroIrrigation_LakhHa"], row["Adoption_Index"]),
                     textcoords="offset points", xytext=(5, 3), fontsize=6.5)
ax2.set_xlabel("Area Under Micro-Irrigation (Lakh Ha)")
ax2.set_ylabel("Adoption Index")
ax2.set_title("Adoption Index vs Irrigated Area", fontweight="bold", color=BRAND)
ax2.legend(title="Zone", fontsize=8)
ax2.spines[["top","right"]].set_visible(False)
ax2.grid(alpha=0.3)

fig.suptitle("Page 2 — State Adoption Index", fontsize=13, fontweight="bold", color=BRAND, y=1.02)
charts.append(("Page 2: State Adoption Index (Map)", fig_to_b64(fig)))

# ══════════════════════════════════════════════════════════════════════════════
# CHART 3 — Logistics factor
# ══════════════════════════════════════════════════════════════════════════════
df_logi_s = df_logi.sort_values("Logistics_Factor")
tier_colors = {"Home Base": BRAND, "Tier 1": GREEN, "Tier 2": YELLOW, "Tier 3": ACCENT, "Tier 4": RED}
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

ax = axes[0]
bar_cols = [tier_colors.get(t, "gray") for t in df_logi_s["Freight_Cost_Tier"]]
bars = ax.barh(df_logi_s["State"], df_logi_s["Logistics_Factor"]-1,
               color=bar_cols, edgecolor="white", left=1.0)
ax.axvline(1.0, color="gray", ls="--", lw=0.8)
for bar, val in zip(bars, df_logi_s["Logistics_Factor"]):
    ax.text(val+0.001, bar.get_y()+bar.get_height()/2, f"+{(val-1)*100:.1f}%",
            va="center", fontsize=7)
ax.set_xlabel("Logistics Factor (1.0 = no surcharge)")
ax.set_title("Freight Surcharge by State (ex-factory from Pune)", fontweight="bold", color=BRAND)
legend_elems = [mpatches.Patch(color=c, label=t) for t, c in tier_colors.items()]
ax.legend(handles=legend_elems, fontsize=8)
ax.spines[["top","right"]].set_visible(False)

ax2 = axes[1]
cols2 = [zone_palette.get(z, "gray") for z in df_logi["Zone_ID"]]
ax2.scatter(df_logi["Approx_Distance_from_Pune_km"], df_logi["Logistics_Factor"],
            c=cols2, s=90, zorder=3)
for _, row in df_logi.iterrows():
    ax2.annotate(row["State"], (row["Approx_Distance_from_Pune_km"], row["Logistics_Factor"]),
                 textcoords="offset points", xytext=(4, 3), fontsize=6.5)
z = np.polyfit(df_logi["Approx_Distance_from_Pune_km"], df_logi["Logistics_Factor"], 1)
xline = np.linspace(0, 2700, 100)
ax2.plot(xline, np.poly1d(z)(xline), "--", color="gray", lw=1, label="Trend line")
ax2.set_xlabel("Distance from Pune (km)")
ax2.set_ylabel("Logistics Factor")
ax2.set_title("Distance vs Logistics Factor (Linear Relationship)", fontweight="bold", color=BRAND)
ax2.legend(fontsize=8); ax2.grid(alpha=0.3); ax2.spines[["top","right"]].set_visible(False)

fig.suptitle("Page 3 — Logistics Factor by State", fontsize=13, fontweight="bold", color=BRAND, y=1.02)
charts.append(("Page 3: Logistics Factor by State", fig_to_b64(fig)))

# ══════════════════════════════════════════════════════════════════════════════
# CHART 4 — Price waterfall
# ══════════════════════════════════════════════════════════════════════════════
df_w = df_water.copy()
labels   = df_w["Factor_Name"].tolist()
prices   = df_w["Price_After_Step"].tolist()
effects  = df_w["Effect_Type"].tolist()

short_labels = ["Base Price", "Demand\nFactor", "Competitor\nFactor",
                "Smoothing", "Logistics\nFactor", "Adoption\nFactor", "Final\nRounded"]

fig, ax = plt.subplots(figsize=(13, 5.5))
running = prices[0]
bar_bottoms, bar_heights, bar_colors_w = [], [], []

prev = 0
for i, (p, e) in enumerate(zip(prices, effects)):
    if i == 0:
        bar_bottoms.append(0); bar_heights.append(p); bar_colors_w.append(BRAND)
        prev = p
    elif i == len(prices)-1:
        bar_bottoms.append(0); bar_heights.append(p); bar_colors_w.append(BRAND)
    else:
        diff = p - prev
        if diff >= 0:
            bar_bottoms.append(prev); bar_heights.append(diff); bar_colors_w.append(GREEN)
        else:
            bar_bottoms.append(p); bar_heights.append(abs(diff)); bar_colors_w.append(RED)
        prev = p

bars = ax.bar(range(len(prices)), bar_heights, bottom=bar_bottoms,
              color=bar_colors_w, edgecolor="white", width=0.5)
for i, (bot, h, p) in enumerate(zip(bar_bottoms, bar_heights, prices)):
    ax.text(i, bot+h+5, f"Rs.{p}", ha="center", fontsize=8.5, fontweight="bold", color=BRAND)
    if i > 0 and i < len(prices)-1:
        diff = prices[i]-prices[i-1]
        sign = "+" if diff >= 0 else ""
        ax.text(i, bot+h/2, f"{sign}{diff}", ha="center", va="center",
                fontsize=7.5, color="white", fontweight="bold")

ax.set_xticks(range(len(prices)))
ax.set_xticklabels(short_labels, fontsize=8.5)
ax.set_ylabel("Price (Rs.)")
ax.set_ylim(900, 1260)
ax.set_title("Price Waterfall — How Base Price Builds to Final Price (16mm Inline, Gujarat, Kharif)",
             fontweight="bold", color=BRAND, fontsize=11)
ax.spines[["top","right"]].set_visible(False)
legend_elems = [mpatches.Patch(color=BRAND, label="Base / Final"),
                mpatches.Patch(color=GREEN, label="Price increase"),
                mpatches.Patch(color=RED,   label="Price decrease")]
ax.legend(handles=legend_elems, fontsize=8)

for i in range(1, len(prices)-1):
    prev_p = prices[i-1]
    ax.plot([i-0.25, i+0.25], [prev_p, prev_p], color="gray", lw=0.8, ls=":")

fig.suptitle("Page 4 — Step-by-Step Price Build (Waterfall)", fontsize=13, fontweight="bold", color=BRAND, y=1.02)
charts.append(("Page 4: Price Waterfall (How Price is Built)", fig_to_b64(fig)))

# ══════════════════════════════════════════════════════════════════════════════
# CHART 5 — Weight justification table (visual)
# ══════════════════════════════════════════════════════════════════════════════
fig, ax = plt.subplots(figsize=(14, 6))
ax.axis("off")
col_headers = ["Weight / Parameter", "Value", "Data Source", "Price Impact"]
rows_disp = []
for _, row in df_weights.iterrows():
    rows_disp.append([row["Weight_Name"][:45], row["Value_or_Range"][:18],
                      row["Data_Source"][:38], row["Impact_on_Price"][:45]])

table = ax.table(cellText=rows_disp, colLabels=col_headers,
                 cellLoc="left", loc="center",
                 colWidths=[0.30, 0.13, 0.28, 0.29])
table.auto_set_font_size(False)
table.set_fontsize(7.8)
table.scale(1, 1.75)
for (r, c), cell in table.get_celld().items():
    cell.set_edgecolor("#cccccc")
    if r == 0:
        cell.set_facecolor(BRAND); cell.set_text_props(color="white", fontweight="bold")
    elif r % 2 == 0:
        cell.set_facecolor("#f0f5fc")
    else:
        cell.set_facecolor("white")
    if c == 3 and r > 0:
        txt = cell.get_text().get_text()
        if "+" in txt and "price up" in txt.lower():
            cell.set_facecolor("#d5f5e3")
        elif "-" in txt or "discount" in txt.lower() or "conserv" in txt.lower():
            cell.set_facecolor("#fde8e8")

ax.set_title("Page 5 — All Weights with Sources & Justification",
             fontsize=13, fontweight="bold", color=BRAND, pad=20)
charts.append(("Page 5: Weight Justification Table", fig_to_b64(fig)))

# ══════════════════════════════════════════════════════════════════════════════
# CHART 6 — Zone price comparison (clustered bar + delta heatmap)
# ══════════════════════════════════════════════════════════════════════════════
pipes      = ["16mm Inline", "16mm Online", "20mm Inline", "20mm Online"]
base_cols  = ["16mm_Inline_Base","16mm_Online_Base","20mm_Inline_Base","20mm_Online_Base"]
ai_cols    = ["16mm_Inline_AI",  "16mm_Online_AI",  "20mm_Inline_AI",  "20mm_Online_AI"]
delta_cols = ["16mm_Inline_Delta_Pct","16mm_Online_Delta_Pct","20mm_Inline_Delta_Pct","20mm_Online_Delta_Pct"]

fig, axes = plt.subplots(1, 2, figsize=(14, 5.5))
x     = np.arange(len(df_zone))
width = 0.10
pipe_colors = [BRAND, ACCENT, GREEN, PURPLE]

ax = axes[0]
for i, (pipe, ai_col, base_col, col) in enumerate(zip(pipes, ai_cols, base_cols, pipe_colors)):
    offset = (i - 1.5) * width
    ax.bar(x + offset, df_zone[ai_col],   width, color=col,   alpha=0.9, label=f"{pipe} AI", edgecolor="white")
    ax.bar(x + offset, df_zone[base_col], width, color=col, alpha=0.25,
           linestyle="--", edgecolor=col, linewidth=1)

ax.set_xticks(x)
ax.set_xticklabels(df_zone["Zone_Label"], fontsize=8.5)
ax.set_ylabel("Price (Rs.)")
ax.set_title("AI Price vs Base Price per Zone\n(faded bars = base price)", fontweight="bold", color=BRAND)
ax.legend(fontsize=7.5, ncol=2)
ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda v,_: f"Rs.{int(v):,}"))
ax.spines[["top","right"]].set_visible(False)

ax2 = axes[1]
delta_data = df_zone[delta_cols].copy()
delta_data.columns = pipes
delta_data.index = df_zone["Zone_Label"]
delta_num = delta_data.apply(lambda col: pd.to_numeric(col.astype(str).str.replace("+",""), errors="coerce"))
sns.heatmap(delta_num, ax=ax2, cmap="RdYlGn", center=0, annot=True, fmt=".1f",
            annot_kws={"size":9, "weight":"bold"}, linewidths=0.5,
            cbar_kws={"label":"Delta % from Base"})
ax2.set_title("AI Price Delta % vs Base Price\n(green = premium, red = discount)", fontweight="bold", color=BRAND)
ax2.set_xlabel("Pipe Type"); ax2.set_ylabel("Zone")
ax2.tick_params(axis="x", rotation=15, labelsize=8)

fig.suptitle("Page 6 — Zone Price Comparison", fontsize=13, fontweight="bold", color=BRAND, y=1.02)
charts.append(("Page 6: Zone Price Comparison", fig_to_b64(fig)))

# ══════════════════════════════════════════════════════════════════════════════
# BONUS — Adoption factor price effect bar
# ══════════════════════════════════════════════════════════════════════════════
df_adopt_s2 = df_adopt.sort_values("Adoption_Index", ascending=False)
effect = [(a-1.0)*0.06*100 for a in df_adopt_s2["Adoption_Index"]]
fig, ax = plt.subplots(figsize=(12, 5))
bar_cols3 = [GREEN if e >= 0 else RED for e in effect]
bars = ax.bar(df_adopt_s2["State"], effect, color=bar_cols3, edgecolor="white")
for bar, val in zip(bars, effect):
    ypos = val+0.02 if val >= 0 else val-0.18
    ax.text(bar.get_x()+bar.get_width()/2, ypos, f"{val:+.2f}%", ha="center", fontsize=7)
ax.axhline(0, color="black", lw=0.8)
ax.set_xticks(range(len(df_adopt_s2)))
ax.set_xticklabels(df_adopt_s2["State"], rotation=45, ha="right", fontsize=8)
ax.set_ylabel("Price Premium / Discount (%)")
ax.set_title("Adoption Factor Price Effect per State (coeff = 0.06)", fontweight="bold", color=BRAND)
ax.spines[["top","right"]].set_visible(False)
charts.append(("Bonus: Adoption Factor Price Effect by State", fig_to_b64(fig)))

# ══════════════════════════════════════════════════════════════════════════════
# BUILD HTML
# ══════════════════════════════════════════════════════════════════════════════
html_parts = [f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Halchal Industries - ML Pricing Dashboard</title>
<style>
  * {{ box-sizing:border-box; margin:0; padding:0; }}
  body {{ font-family:'Segoe UI',Arial,sans-serif; background:#f0f4f8; color:#222; }}
  .header {{ background:#1a3c5e; color:#fff; padding:28px 40px; }}
  .header h1 {{ font-size:26px; margin-bottom:6px; }}
  .header p  {{ font-size:13px; color:#a8c4e0; }}
  .nav {{ background:#fff; padding:12px 40px; display:flex; gap:12px; flex-wrap:wrap;
          border-bottom:2px solid #e0e8f0; position:sticky; top:0; z-index:10; }}
  .nav a {{ background:#1a3c5e; color:#fff; padding:6px 14px; border-radius:20px;
            text-decoration:none; font-size:12px; }}
  .nav a:hover {{ background:#e8773f; }}
  .section {{ background:#fff; margin:24px 40px; padding:28px; border-radius:10px;
              box-shadow:0 2px 10px rgba(0,0,0,0.07); }}
  .section h2 {{ color:#1a3c5e; font-size:17px; margin-bottom:8px; padding-bottom:8px;
                 border-bottom:2px solid #e8773f; }}
  .section img {{ width:100%; border-radius:6px; margin-top:12px; }}
  .note {{ background:#fff8f0; border-left:4px solid #e8773f; padding:10px 14px;
           margin-top:14px; font-size:12.5px; border-radius:0 6px 6px 0; }}
  .warning {{ background:#fff3cd; border-left:4px solid #f1c40f; padding:10px 14px;
              margin-top:14px; font-size:12.5px; border-radius:0 6px 6px 0; }}
  .footer {{ text-align:center; padding:24px; color:#888; font-size:12px; }}
</style>
</head>
<body>
<div class="header">
  <h1>Halchal Industries - ML Pricing Engine Dashboard</h1>
  <p>Visualisation of all 6 Power BI CSV datasets | Generated from Python | Open in any browser</p>
</div>
<div class="nav">
"""]

for i, (title, _) in enumerate(charts):
    html_parts.append(f'  <a href="#chart{i}">{title.split(":")[0]}</a>\n')
html_parts.append("</div>\n")

notes = [
    "Peak demand: August (Kharif 1.28) is 64% higher than trough month May (Summer 0.78). "
    "This directly drives the highest AI prices in Jul-Sep.",

    "Gujarat ranks #1 nationally with 7.2 lakh ha under micro-irrigation. Assam is last at 0.2 lakh ha. "
    "The adoption index drives a price spread of +6.3% (Gujarat) to -9.6% (Assam) in the current model.",

    "Every 100km from Pune adds approximately +0.46% to logistics cost. Assam at 2600km incurs a "
    "+12.2% surcharge. Note: the current production model (ml_api.py) is ex-factory — logistics "
    "is buyer's responsibility. This CSV represents an earlier model version.",

    "The waterfall shows the step-by-step price build for 16mm Inline shipped to Gujarat in Kharif. "
    "Base Rs.1050 -> Final Rs.1140 after all 6 factors. Note: the current model uses "
    "demand sensitivity 0.35 (not 0.25 shown here) and smoothing 50/50 (not 55/45).",

    "Green shading = factor pushes price up. Red shading = factor is a discount. "
    "All weights are sourced from NABARD, NCPAH, and NIC LEADS reports.",

    "Zone 2 (Gujarat) shows the highest AI premiums: +15.8% on 16mm Online, +17.3% on 20mm Online. "
    "Zone 5 (Bihar) shows near-zero premium despite higher logistics, because low adoption "
    "offsets the freight cost in the price formula.",

    "Adoption coefficient 0.06 in this CSV is from an earlier model version. "
    "The current ml_api.py uses 0.15, producing a larger +-10% adoption band across states.",
]

for i, (title, b64) in enumerate(charts):
    note = notes[i] if i < len(notes) else ""
    is_warning = i in [2, 3, 6]
    note_class = "warning" if is_warning else "note"
    note_prefix = "Note (version diff):" if is_warning else "Key Insight:"
    html_parts.append(f"""
<div class="section" id="chart{i}">
  <h2>{title}</h2>
  <img src="data:image/png;base64,{b64}" alt="{title}">
  {'<div class="'+note_class+'"><strong>'+note_prefix+'</strong> '+note+'</div>' if note else ''}
</div>
""")

html_parts.append("""
<div class="footer">
  Halchal Industries Final Year Project &mdash; ML Pricing Engine Dashboard &mdash;
  Generated with Python (matplotlib + seaborn) from Power BI CSV datasets
</div>
</body></html>""")

out_path = "dashboard.html"
with open(out_path, "w", encoding="utf-8") as f:
    f.write("".join(html_parts))

print(f"[OK] Dashboard saved: {os.path.abspath(out_path)}")
print("     Open dashboard.html in any browser (Chrome / Edge / Firefox)")
