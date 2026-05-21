import { useState } from "react";

const T = {
  bg0: "#04080F", bg1: "#07101E", bg2: "#0B1628", bg3: "#101F35",
  accent: "#00E5A0", copper: "#FFB020", danger: "#FF6B6B", info: "#00B4D8",
  border: "rgba(255,255,255,0.07)", borderMd: "rgba(255,255,255,0.13)",
  text1: "#EEF3FF", text2: "#7A9EC6", text3: "#3D5A7A",
};

const MONTHLY = [
  { month: "Dec", revenue: 8.4,  orders: 28 },
  { month: "Jan", revenue: 9.2,  orders: 33 },
  { month: "Feb", revenue: 10.1, orders: 38 },
  { month: "Mar", revenue: 12.8, orders: 44 },
  { month: "Apr", revenue: 13.5, orders: 41 },
  { month: "May", revenue: 14.8, orders: 47 },
];

const BY_PIPE = [
  { name: "16mm Inline", revenue: 5200, orders: 21, pct: 65 },
  { name: "16mm Online", revenue: 3800, orders: 14, pct: 48 },
  { name: "20mm Inline", revenue: 3200, orders: 8,  pct: 40 },
  { name: "20mm Online", revenue: 2600, orders: 4,  pct: 32 },
];

const BY_REGION = [
  { name: "Pune",        revenue: 3820, orders: 12, pct: 88 },
  { name: "Nashik",      revenue: 3240, orders: 10, pct: 74 },
  { name: "Kolhapur",    revenue: 2860, orders: 8,  pct: 65 },
  { name: "Aurangabad",  revenue: 2100, orders: 7,  pct: 48 },
  { name: "Solapur",     revenue: 1540, orders: 5,  pct: 35 },
  { name: "Nagpur",      revenue: 820,  orders: 3,  pct: 19 },
  { name: "Jalgaon",     revenue: 620,  orders: 2,  pct: 14 },
  { name: "Amravati",    revenue: 400,  orders: 0,  pct: 9  },
];

const SEASONAL_MIX = [
  { season: "Kharif (Cotton, Sugarcane)", share: 45, color: T.copper },
  { season: "Rabi (Onion, Chilli)",       share: 35, color: T.accent },
  { season: "Zaid (Vegetables)",          share: 20, color: T.info   },
];

const KPI = [
  { label: "Total Revenue",    value: "₹14,82,500", sub: "+11% MoM",  color: T.accent  },
  { label: "Total Orders",     value: "47",          sub: "+14% MoM",  color: T.copper  },
  { label: "Avg Order Value",  value: "₹31,543",    sub: "per order", color: T.info    },
  { label: "Revenue / Metre",  value: "₹11.8",      sub: "blended",   color: T.text1   },
  { label: "Regions Active",   value: "8",           sub: "all zones", color: T.accent  },
  { label: "AI Price Saves",   value: "₹2.1L",      sub: "vs manual", color: T.copper  },
];

const TABS = ["Revenue", "Orders", "Regions"];

const Card = ({ children, style }) => (
  <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, ...style }}>
    {children}
  </div>
);

const Bar = ({ value, max, color, height = 80 }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
    <div style={{ width: 28, height, background: T.bg3, borderRadius: 6, display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>
      <div style={{ width: "100%", height: `${(value / max) * 100}%`, background: color, borderRadius: 4, transition: "height 1s ease" }} />
    </div>
  </div>
);

export default function Reports() {
  const [tab, setTab] = useState("Revenue");

  const maxRev    = Math.max(...MONTHLY.map(m => m.revenue));
  const maxOrders = Math.max(...MONTHLY.map(m => m.orders));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text1, margin: 0, fontFamily: "'Playfair Display', serif" }}>Reports & Analytics</h1>
          <p style={{ fontSize: 13, color: T.text2, margin: "4px 0 0" }}>Business performance overview · May 2026</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.text2, fontSize: 12, cursor: "pointer", fontFamily: "'Lora', serif" }}>
            Export CSV
          </button>
          <button style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: T.copper, color: "#04080F", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Lora', serif" }}>
            Download PDF
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
        {KPI.map(({ label, value, sub, color }) => (
          <Card key={label} style={{ padding: "16px 16px" }}>
            <div style={{ fontSize: 10, color: T.text3, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color, fontFamily: "monospace", marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 10, color: T.text3 }}>{sub}</div>
          </Card>
        ))}
      </div>

      {/* Monthly trend chart */}
      <Card style={{ padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: T.text1, margin: 0 }}>Monthly Trend</h2>
            <p style={{ fontSize: 12, color: T.text2, margin: "4px 0 0" }}>Revenue (₹L) and Orders — last 6 months</p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "5px 14px", borderRadius: 20, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Lora', serif", background: tab === t ? T.copper : T.bg3, color: tab === t ? "#04080F" : T.text2 }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 0, alignItems: "flex-end", height: 120 }}>
          {MONTHLY.map((m, i) => {
            const rev = tab !== "Orders";
            const val = rev ? m.revenue : m.orders;
            const max = rev ? maxRev : maxOrders;
            const color = rev ? T.accent : T.copper;
            const pct = (val / max) * 100;
            return (
              <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 11, color: T.accent, fontWeight: 700 }}>{rev ? `₹${val}L` : val}</div>
                <div style={{ width: "60%", height: 90, background: T.bg3, borderRadius: "4px 4px 0 0", display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>
                  <div style={{ width: "100%", height: `${pct}%`, background: `linear-gradient(180deg, ${color}CC, ${color}66)`, borderRadius: "4px 4px 0 0", transition: "height 1s ease" }} />
                </div>
                <div style={{ fontSize: 11, color: T.text3 }}>{m.month}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>

        {/* By pipe type */}
        <Card style={{ padding: "22px 24px" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: T.text1, margin: "0 0 16px" }}>Revenue by Pipe</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {BY_PIPE.map(({ name, revenue, orders, pct }, i) => {
              const colors = [T.accent, T.copper, T.info, T.danger];
              return (
                <div key={name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: T.text2 }}>{name}</span>
                    <span style={{ fontSize: 12, color: colors[i], fontWeight: 700, fontFamily: "monospace" }}>₹{revenue.toLocaleString()}</span>
                  </div>
                  <div style={{ height: 6, background: T.bg3, borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: colors[i], borderRadius: 6, transition: "width 1s" }} />
                  </div>
                  <div style={{ fontSize: 10, color: T.text3, marginTop: 3 }}>{orders} orders</div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* By region */}
        <Card style={{ padding: "22px 24px" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: T.text1, margin: "0 0 16px" }}>Revenue by Region</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {BY_REGION.map(({ name, revenue, pct }) => (
              <div key={name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: T.text2 }}>{name}</span>
                  <span style={{ fontSize: 11, color: T.text1, fontFamily: "monospace" }}>₹{revenue.toLocaleString()}</span>
                </div>
                <div style={{ height: 5, background: T.bg3, borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: pct > 60 ? T.accent : pct > 30 ? T.copper : T.info, borderRadius: 5, transition: "width 1s" }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Seasonal mix + summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card style={{ padding: "22px 24px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: T.text1, margin: "0 0 14px" }}>Seasonal Sales Mix</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {SEASONAL_MIX.map(({ season, share, color }) => (
                <div key={season}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: T.text2 }}>{season}</span>
                    <span style={{ fontSize: 12, color, fontWeight: 700 }}>{share}%</span>
                  </div>
                  <div style={{ height: 6, background: T.bg3, borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${share}%`, background: color, borderRadius: 6, transition: "width 1s" }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding: "20px 22px", background: "rgba(255,176,32,0.05)", border: "1px solid rgba(255,176,32,0.15)" }}>
            <div style={{ fontSize: 12, color: T.copper, fontWeight: 700, marginBottom: 8 }}>AI Pricing Impact</div>
            <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>
              AI-optimised pricing generated an estimated <span style={{ color: T.accent, fontWeight: 700 }}>₹2.1 lakh</span> additional margin this month vs. flat manual pricing, with <span style={{ color: T.copper, fontWeight: 700 }}>94.2%</span> forecast accuracy.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
