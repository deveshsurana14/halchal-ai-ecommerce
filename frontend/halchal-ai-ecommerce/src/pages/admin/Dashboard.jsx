import { useEffect, useState, useCallback } from "react";
import API_BASE from "../../config";

const T = {
  bg0: "#05070E", bg1: "#0B1120", bg2: "#111B30", bg3: "#18253E",
  amber: "#F5A623", amberSoft: "rgba(245,166,35,0.09)", amberBorder: "rgba(245,166,35,0.20)",
  green: "#00D68F", greenSoft: "rgba(0,214,143,0.09)",
  sky: "#38C0FF",   skysoft: "rgba(56,192,255,0.09)",
  rose: "#FF5577",  roseSoft: "rgba(255,85,119,0.09)",
  indigo: "#818CF8",
  border: "rgba(255,255,255,0.07)",
  t1: "#EBF0FF", t2: "#7A98B8", t3: "#3F5470",
  font: "'Inter', system-ui, sans-serif",
};

const BUNDLE = 300;
const PIPES  = ["16mm Inline", "16mm Online", "20mm Inline", "20mm Online"];

const ZONES = [
  { id: "Z1", label: "Zone 1 – Maharashtra",    states: "Pune · Nashik · Nagpur · Aurangabad",           mult: 1.00 },
  { id: "Z2", label: "Zone 2 – West & Central",  states: "Gujarat · Goa · Madhya Pradesh",                mult: 1.07 },
  { id: "Z3", label: "Zone 3 – South India",     states: "Karnataka · Telangana · AP · Tamil Nadu",       mult: 1.12 },
  { id: "Z4", label: "Zone 4 – North India",     states: "Rajasthan · UP · Delhi · Haryana",              mult: 1.17 },
  { id: "Z5", label: "Zone 5 – East & NE",       states: "Bihar · West Bengal · Odisha · Assam",          mult: 1.22 },
];

const BASE_AI = {
  "16mm Inline": { demand: 148, price: 1180, trend: "+8%",  icon: "📈" },
  "16mm Online": { demand: 96,  price: 1350, trend: "+3%",  icon: "📊" },
  "20mm Inline": { demand: 82,  price: 1520, trend: "+12%", icon: "📈" },
  "20mm Online": { demand: 48,  price: 1680, trend: "-2%",  icon: "📉" },
};

const ZONE_DEMAND = [
  { name: "Zone 1 – Maharashtra",    val: 92, color: T.green  },
  { name: "Zone 2 – West & Central", val: 74, color: T.green  },
  { name: "Zone 3 – South India",    val: 61, color: T.amber  },
  { name: "Zone 4 – North India",    val: 48, color: T.amber  },
  { name: "Zone 5 – East & NE",      val: 27, color: T.sky    },
];

const MOCK_ORDERS = [
  { _id:"1", pipe_type:"16mm Inline", quantity:4, region:"Pune (Z1)",     status:"Approved",         customer:"Ramesh Agro Farms",       amount:4720  },
  { _id:"2", pipe_type:"20mm Inline", quantity:3, region:"Nashik (Z1)",   status:"Pending Approval", customer:"Grapes Valley Estate",     amount:4560  },
  { _id:"3", pipe_type:"16mm Online", quantity:6, region:"Surat (Z2)",    status:"Shipped",          customer:"Gujarat Agro Corp",        amount:8640  },
  { _id:"4", pipe_type:"20mm Online", quantity:2, region:"Bengaluru (Z3)",status:"Pending Approval", customer:"Karnataka Drip Systems",   amount:3750  },
  { _id:"5", pipe_type:"16mm Inline", quantity:8, region:"Jaipur (Z4)",   status:"Approved",         customer:"Rajasthan Farms Ltd.",     amount:11040 },
];

const STATUS = {
  "Approved":         { bg: T.greenSoft, color: T.green, dot: T.green   },
  "Pending Approval": { bg: T.amberSoft, color: T.amber, dot: T.amber   },
  "Shipped":          { bg: T.skysoft,   color: T.sky,   dot: T.sky     },
  "Cancelled":        { bg: T.roseSoft,  color: T.rose,  dot: T.rose    },
};

const KPI = [
  { label: "Revenue This Month", value: "₹14,82,500", sub: "↑ 11% vs last month", accent: T.green,  icon: "💰" },
  { label: "Active Orders",      value: "47",          sub: "8 pending approval",  accent: T.amber,  icon: "📦" },
  { label: "Low Stock Alerts",   value: "2",           sub: "20mm Online critical",accent: T.rose,   icon: "⚠️" },
  { label: "AI Accuracy",        value: "94.2%",       sub: "Demand forecast",     accent: T.indigo, icon: "🤖" },
];

const Card = ({ children, style, delay = 0 }) => (
  <div style={{
    background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14,
    animation: "slideUp 0.35s ease both",
    animationDelay: `${delay}ms`,
    transition: "box-shadow 0.2s",
    ...style,
  }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,0,0,0.35)"}
    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
  >{children}</div>
);

const StatusBadge = ({ status }) => {
  const s = STATUS[status] || { bg: T.bg3, color: T.t2, dot: T.t2 };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.color, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }} />
      {status}
    </span>
  );
};

export default function Dashboard() {
  const [zone,    setZone]    = useState("Z1");
  const [aiData,  setAiData]  = useState(() => {
    const d = {};
    for (const p of PIPES) d[p] = { demand: BASE_AI[p].demand, price: BASE_AI[p].price, trend: BASE_AI[p].trend };
    return d;
  });
  const [loading, setLoading] = useState(false);
  const [orders,  setOrders]  = useState(MOCK_ORDERS);

  const activeZone = ZONES.find(z => z.id === zone) || ZONES[0];

  const fetchAI = useCallback(async () => {
    setLoading(true);
    const month = new Date().getMonth() + 1;
    const year  = new Date().getFullYear();

    // Base fallback — already realistic zone-adjusted values
    const results = {};
    for (const pipe of PIPES) {
      const base = BASE_AI[pipe];
      results[pipe] = {
        demand: base.demand,
        price:  Math.round(base.price * activeZone.mult / 10) * 10,
        trend:  base.trend,
      };
    }

    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      setAiData({ ...results });
      setLoading(false);
    }, 10000);

    for (const pipe of PIPES) {
      if (settled) break;
      try {
        const res  = await fetch(`${API_BASE}/api/ai-price`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pipe_type: pipe, zone, month, year }),
        });
        const data = await res.json();
        let price = data.recommended_price ?? data.final_price;
        if (price && price < 100) price = Math.round(price * BUNDLE / 10) * 10;
        if (price) price = Math.round(price * activeZone.mult / 10) * 10;
        if (price) results[pipe].price = price;
        if (data.predicted_demand) results[pipe].demand = data.predicted_demand;
      } catch { /* use zoned mock */ }
    }

    if (!settled) {
      settled = true;
      clearTimeout(timer);
      setAiData(results);
      setLoading(false);
    }
  }, [zone, activeZone.mult]);

  useEffect(() => { fetchAI(); }, [fetchAI]);

  useEffect(() => {
    fetch(`${API_BASE}/api/orders`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length) setOrders(d); })
      .catch(() => {});
  }, []);

  const pipeColors = [T.green, T.amber, T.sky, T.indigo];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: T.font }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", animation: "slideUp 0.3s ease both" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: T.t1, margin: 0, fontFamily: "'DM Serif Display', Georgia, serif", letterSpacing: "-0.01em" }}>
            Overview
          </h1>
          <p style={{ fontSize: 13, color: T.t2, margin: "4px 0 0" }}>
            AI-driven pricing & inventory · Halchal Industries · Pan India
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            value={zone}
            onChange={e => setZone(e.target.value)}
            style={{
              background: T.bg2, border: `1px solid ${T.border}`,
              borderRadius: 9, color: T.t1, fontSize: 13,
              padding: "8px 12px", fontFamily: T.font, cursor: "pointer", minWidth: 210,
              outline: "none",
            }}
          >
            {ZONES.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}
          </select>
          <button
            onClick={fetchAI} disabled={loading}
            style={{
              padding: "8px 18px", borderRadius: 9, border: "none",
              background: loading ? T.bg3 : T.amber,
              color: loading ? T.t3 : "#04080F",
              fontSize: 12, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: T.font, opacity: loading ? 0.7 : 1, transition: "opacity 0.2s",
            }}
          >{loading ? "Refreshing…" : "↻ Refresh AI"}</button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {KPI.map(({ label, value, sub, accent, icon }, i) => (
          <Card key={label} delay={i * 50} style={{ padding: "22px 22px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: T.t2, fontWeight: 500, lineHeight: 1.3 }}>{label}</span>
              <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: accent, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em", marginBottom: 5 }}>{value}</div>
            <div style={{ fontSize: 11, color: T.t3 }}>{sub}</div>
          </Card>
        ))}
      </div>

      {/* AI Price cards */}
      <div>
        <div style={{ marginBottom: 14, animation: "slideUp 0.3s ease both", animationDelay: "160ms" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: T.t1, margin: 0 }}>AI Demand Forecast & Pricing</h2>
          <p style={{ fontSize: 12, color: T.t2, margin: "4px 0 0" }}>
            {activeZone.label} · Updated {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {PIPES.map((pipe, i) => {
            const d   = aiData[pipe];
            const pos = d?.trend?.startsWith("+");
            const col = pipeColors[i];
            return (
              <Card key={pipe} delay={160 + i * 50} style={{ padding: "20px", overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${col}, transparent)` }} />
                <div style={{ fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>{pipe}</div>
                {loading ? (
                  <div style={{ height: 60, color: T.t3, fontSize: 12, display: "flex", alignItems: "center" }}>Fetching…</div>
                ) : (
                  <>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10, color: T.t3, marginBottom: 4 }}>Predicted Demand</div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: col, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{d?.demand ?? "—"}</div>
                      <div style={{ fontSize: 10, color: T.t3 }}>bundles / month</div>
                    </div>
                    <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
                      <div style={{ fontSize: 10, color: T.t3, marginBottom: 4 }}>Recommended Price</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: T.amber, fontVariantNumeric: "tabular-nums" }}>
                        ₹{d?.price ?? "—"}<span style={{ fontSize: 10, fontWeight: 400, color: T.t3 }}>/bundle</span>
                      </div>
                      {d?.trend && (
                        <div style={{ fontSize: 11, color: pos ? T.green : T.rose, marginTop: 5, fontWeight: 600 }}>
                          {pos ? "▲" : "▼"} {d.trend} vs last month
                        </div>
                      )}
                    </div>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Bottom row: Orders + Zone Demand */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 20 }}>

        {/* Recent Orders */}
        <Card delay={300} style={{ padding: "22px 24px", overflow: "hidden" }}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: T.t1, margin: 0 }}>Recent Orders</h2>
            <p style={{ fontSize: 12, color: T.t2, margin: "4px 0 0" }}>Latest 5 orders across all zones</p>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Customer", "Pipe", "Qty", "Region", "Amount", "Status"].map(h => (
                  <th key={h} style={{ textAlign: "left", fontSize: 10, color: T.t3, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", paddingBottom: 10, borderBottom: `1px solid ${T.border}`, paddingRight: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o, i) => (
                <tr key={o._id || i}>
                  <td style={{ padding: "12px 12px 12px 0", fontSize: 12, color: T.t1, fontWeight: 500, borderBottom: `1px solid ${T.border}` }}>{o.customer || "—"}</td>
                  <td style={{ padding: "12px 12px 12px 0", fontSize: 12, color: T.t2, borderBottom: `1px solid ${T.border}` }}>{o.pipe_type}</td>
                  <td style={{ padding: "12px 12px 12px 0", fontSize: 12, color: T.t2, borderBottom: `1px solid ${T.border}` }}>{o.quantity}×</td>
                  <td style={{ padding: "12px 12px 12px 0", fontSize: 12, color: T.t2, borderBottom: `1px solid ${T.border}` }}>{o.region || "—"}</td>
                  <td style={{ padding: "12px 12px 12px 0", fontSize: 12, color: T.green, fontWeight: 700, fontVariantNumeric: "tabular-nums", borderBottom: `1px solid ${T.border}` }}>₹{(o.amount || 0).toLocaleString()}</td>
                  <td style={{ padding: "12px 0", borderBottom: `1px solid ${T.border}` }}><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Zone Demand */}
        <Card delay={320} style={{ padding: "22px 24px" }}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: T.t1, margin: 0 }}>Demand by Zone</h2>
            <p style={{ fontSize: 12, color: T.t2, margin: "4px 0 0" }}>Relative index · current season</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {ZONE_DEMAND.map(({ name, val, color }) => (
              <div key={name}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: T.t2 }}>{name}</span>
                  <span style={{ fontSize: 13, color: T.t1, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{val}</span>
                </div>
                <div style={{ height: 7, background: T.bg3, borderRadius: 7, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${val}%`, background: color, borderRadius: 7, transition: "width 1.1s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
