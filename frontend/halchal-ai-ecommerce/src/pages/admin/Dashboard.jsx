import { useEffect, useState, useCallback } from "react";

const T = {
  bg0: "#04080F", bg1: "#07101E", bg2: "#0B1628", bg3: "#101F35",
  accent: "#00E5A0", copper: "#FFB020", danger: "#FF6B6B", info: "#00B4D8",
  border: "rgba(255,255,255,0.07)", borderMd: "rgba(255,255,255,0.13)",
  text1: "#EEF3FF", text2: "#7A9EC6", text3: "#3D5A7A",
};

const BUNDLE_SIZE = 300; // metres per coil/bundle
const PIPE_TYPES  = ["16mm Inline", "16mm Online", "20mm Inline", "20mm Online"];

const ZONES = [
  { id: "Z1", label: "Zone 1 – Maharashtra",   states: "Pune · Nashik · Nagpur · Aurangabad + all MH", multiplier: 1.00 },
  { id: "Z2", label: "Zone 2 – West & Central", states: "Gujarat · Goa · Madhya Pradesh · Chhattisgarh",  multiplier: 1.07 },
  { id: "Z3", label: "Zone 3 – South India",    states: "Karnataka · Telangana · AP · Tamil Nadu · Kerala", multiplier: 1.12 },
  { id: "Z4", label: "Zone 4 – North India",    states: "Rajasthan · UP · Delhi · Haryana · Punjab",       multiplier: 1.17 },
  { id: "Z5", label: "Zone 5 – East & NE",      states: "Bihar · West Bengal · Odisha · Assam · NE states", multiplier: 1.22 },
];

// Base AI prices (Zone 1 / Maharashtra). Other zones are scaled by multiplier.
const BASE_AI = {
  "16mm Inline": { predicted_demand: 148, recommended_price: 1180, trend: "+8%"  },
  "16mm Online": { predicted_demand: 96,  recommended_price: 1350, trend: "+3%"  },
  "20mm Inline": { predicted_demand: 82,  recommended_price: 1520, trend: "+12%" },
  "20mm Online": { predicted_demand: 48,  recommended_price: 1680, trend: "-2%"  },
};

// quantity = bundles ordered (1 bundle = 300m coil)
const MOCK_ORDERS = [
  { _id: "1", pipe_type: "16mm Inline", quantity: 4,  zone: "Z1", region: "Pune (Z1)",        status: "Approved",         customer: "Ramesh Agro Farms",       amount: 4720,  date: "2026-05-07" },
  { _id: "2", pipe_type: "20mm Inline", quantity: 3,  zone: "Z1", region: "Nashik (Z1)",       status: "Pending Approval", customer: "Grapes Valley Estate",     amount: 4560,  date: "2026-05-07" },
  { _id: "3", pipe_type: "16mm Online", quantity: 6,  zone: "Z2", region: "Surat (Z2)",        status: "Shipped",          customer: "Gujarat Agro Corp",        amount: 8640,  date: "2026-05-06" },
  { _id: "4", pipe_type: "20mm Online", quantity: 2,  zone: "Z3", region: "Bengaluru (Z3)",    status: "Pending Approval", customer: "Karnataka Drip Systems",    amount: 3750,  date: "2026-05-06" },
  { _id: "5", pipe_type: "16mm Inline", quantity: 8,  zone: "Z4", region: "Jaipur (Z4)",       status: "Approved",         customer: "Rajasthan Farms Ltd.",     amount: 11040, date: "2026-05-05" },
];

const ZONE_DEMAND = [
  { name: "Zone 1 – Maharashtra",    value: 92, color: "#00E5A0" },
  { name: "Zone 2 – West & Central", value: 74, color: "#00E5A0" },
  { name: "Zone 3 – South India",    value: 61, color: "#FFB020" },
  { name: "Zone 4 – North India",    value: 48, color: "#FFB020" },
  { name: "Zone 5 – East & NE",      value: 27, color: "#00B4D8" },
];

const KPI_DATA = [
  { label: "Revenue This Month", value: "₹14,82,500", sub: "+11% vs last month",  color: T.accent,  icon: "₹" },
  { label: "Active Orders",      value: "47",         sub: "8 pending approval",   color: T.copper,  icon: "📦" },
  { label: "Low Stock Alerts",   value: "2",          sub: "20mm Online critical", color: T.danger,  icon: "⚠" },
  { label: "AI Accuracy",        value: "94.2%",      sub: "Demand forecast model",color: T.info,    icon: "🤖" },
];

const statusStyle = (s) => {
  if (s === "Approved")         return { bg: "rgba(0,229,160,0.1)",  color: T.accent,  label: "Approved" };
  if (s === "Pending Approval") return { bg: "rgba(255,176,32,0.1)", color: T.copper,  label: "Pending" };
  if (s === "Shipped")          return { bg: "rgba(0,180,216,0.1)",  color: T.info,    label: "Shipped" };
  return { bg: T.bg3, color: T.text2, label: s };
};

const Card = ({ children, style }) => (
  <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, ...style }}>
    {children}
  </div>
);

const SectionHead = ({ title, sub }) => (
  <div style={{ marginBottom: 18 }}>
    <h2 style={{ fontSize: 15, fontWeight: 700, color: T.text1, margin: 0 }}>{title}</h2>
    {sub && <p style={{ fontSize: 12, color: T.text2, margin: "4px 0 0" }}>{sub}</p>}
  </div>
);

export default function Dashboard() {
  const [zone,    setZone]    = useState("Z1");
  const [aiData,  setAiData]  = useState(BASE_AI);
  const [loading, setLoading] = useState(false);
  const [orders,  setOrders]  = useState(MOCK_ORDERS);

  const activeZone = ZONES.find(z => z.id === zone) || ZONES[0];

  const getZonedAI = useCallback((baseData, mult) => {
    const result = {};
    for (const pipe of PIPE_TYPES) {
      const base = baseData[pipe];
      result[pipe] = {
        ...base,
        recommended_price: Math.round(base.recommended_price * mult / 10) * 10,
      };
    }
    return result;
  }, []);

  const fetchAI = useCallback(async () => {
    setLoading(true);
    const month = new Date().getMonth() + 1;
    const year  = new Date().getFullYear();
    const mult  = activeZone.multiplier;
    const results = getZonedAI(BASE_AI, mult);

    for (const pipe of PIPE_TYPES) {
      try {
        const res  = await fetch("http://localhost:5000/api/ai-price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pipe_type: pipe, zone, month, year }),
        });
        const data = await res.json();
        let price = data.recommended_price ?? data.final_price;
        if (price && price < 100) price = Math.round(price * BUNDLE_SIZE / 10) * 10;
        if (price) price = Math.round(price * mult / 10) * 10;
        results[pipe] = { ...results[pipe], ...(price ? { recommended_price: price } : {}), ...(data.predicted_demand ? { predicted_demand: data.predicted_demand } : {}) };
      } catch { /* use zoned mock */ }
    }
    setAiData(results);
    setLoading(false);
  }, [zone, activeZone.multiplier, getZonedAI]);

  useEffect(() => { fetchAI(); }, [fetchAI]);

  useEffect(() => {
    fetch("http://localhost:5000/api/orders")
      .then(r => r.json())
      .then(d => { if (d?.length) setOrders(d); })
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text1, margin: 0, fontFamily: "'Playfair Display', serif" }}>Overview</h1>
          <p style={{ fontSize: 13, color: T.text2, margin: "4px 0 0" }}>AI-driven pricing & inventory intelligence · Halchal Industries · Pan India</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            value={zone}
            onChange={e => setZone(e.target.value)}
            style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text1, fontSize: 13, padding: "8px 12px", fontFamily: "'Lora', serif", cursor: "pointer", minWidth: 210 }}
          >
            {ZONES.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}
          </select>
          <button
            onClick={fetchAI}
            disabled={loading}
            style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: T.copper, color: "#04080F", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Lora', serif", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Refreshing…" : "↻ Refresh AI"}
          </button>
        </div>
      </div>

      {/* Zone info strip */}
      <div style={{ background: "rgba(255,176,32,0.05)", border: "1px solid rgba(255,176,32,0.12)", borderRadius: 10, padding: "10px 18px", display: "flex", alignItems: "center", gap: 16, fontSize: 12 }}>
        <span style={{ color: T.copper, fontWeight: 700 }}>{activeZone.label}</span>
        <span style={{ color: T.text3 }}>·</span>
        <span style={{ color: T.text2 }}>{activeZone.states}</span>
        <span style={{ color: T.text3 }}>·</span>
        <span style={{ color: T.text3 }}>Transport multiplier: <span style={{ color: T.text1, fontWeight: 600 }}>{activeZone.multiplier}×</span></span>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {KPI_DATA.map(({ label, value, sub, color, icon }) => (
          <Card key={label} style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: T.text2, fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: "monospace", letterSpacing: "-0.02em", marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 11, color: T.text3 }}>{sub}</div>
          </Card>
        ))}
      </div>

      {/* AI Demand + Price cards */}
      <div>
        <SectionHead title="AI Demand Forecast & Pricing" sub={`${activeZone.label} · Updated ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {PIPE_TYPES.map(pipe => {
            const d = aiData[pipe];
            const pos = d?.trend?.startsWith("+");
            return (
              <Card key={pipe} style={{ padding: "20px 20px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: pos ? `linear-gradient(90deg, ${T.accent}, transparent)` : `linear-gradient(90deg, ${T.danger}, transparent)` }} />
                <div style={{ fontSize: 11, fontWeight: 700, color: T.text2, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>{pipe}</div>

                {loading ? (
                  <div style={{ height: 60, display: "flex", alignItems: "center", color: T.text3, fontSize: 12 }}>Fetching AI data…</div>
                ) : (
                  <>
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, color: T.text3, marginBottom: 3 }}>Predicted Monthly Demand</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: T.accent, fontFamily: "monospace" }}>{d?.predicted_demand?.toLocaleString() ?? "—"}</div>
                      <div style={{ fontSize: 10, color: T.text3 }}>bundles / month</div>
                    </div>
                    <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
                      <div style={{ fontSize: 11, color: T.text3, marginBottom: 3 }}>Recommended Price</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: T.copper, fontFamily: "monospace" }}>₹{d?.recommended_price ?? "—"}<span style={{ fontSize: 11, fontWeight: 400, color: T.text3 }}>/bundle</span></div>
                      {d?.trend && (
                        <div style={{ fontSize: 11, color: pos ? T.accent : T.danger, marginTop: 4 }}>
                          {d.trend} from last month
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

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>

        {/* Recent Orders */}
        <Card style={{ padding: "20px 22px" }}>
          <SectionHead title="Recent Orders" sub="Latest orders across all zones" />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Customer", "Pipe", "Qty", "City (Zone)", "Amount", "Status"].map(h => (
                  <th key={h} style={{ textAlign: "left", fontSize: 11, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o, i) => {
                const s = statusStyle(o.status);
                return (
                  <tr key={o._id || i}>
                    <td style={{ padding: "11px 0", fontSize: 12, color: T.text1, borderBottom: `1px solid ${T.border}` }}>{o.customer || "—"}</td>
                    <td style={{ padding: "11px 8px 11px 0", fontSize: 12, color: T.text2, borderBottom: `1px solid ${T.border}` }}>{o.pipe_type}</td>
                    <td style={{ padding: "11px 8px 11px 0", fontSize: 12, color: T.text2, borderBottom: `1px solid ${T.border}` }}>{o.quantity} bundle{o.quantity !== 1 ? "s" : ""}</td>
                    <td style={{ padding: "11px 8px 11px 0", fontSize: 12, color: T.text2, borderBottom: `1px solid ${T.border}` }}>{o.region || "—"}</td>
                    <td style={{ padding: "11px 8px 11px 0", fontSize: 12, color: T.accent, fontWeight: 600, borderBottom: `1px solid ${T.border}` }}>₹{(o.amount || 0).toLocaleString()}</td>
                    <td style={{ padding: "11px 0", borderBottom: `1px solid ${T.border}` }}>
                      <span style={{ background: s.bg, color: s.color, fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20 }}>{s.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {/* Zone demand bars */}
        <Card style={{ padding: "20px 22px" }}>
          <SectionHead title="Demand by Zone" sub="Relative index · all India (current season)" />
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {ZONE_DEMAND.map(({ name, value, color }) => (
              <div key={name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: T.text2 }}>{name}</span>
                  <span style={{ fontSize: 12, color: T.text1, fontWeight: 600 }}>{value}</span>
                </div>
                <div style={{ height: 6, background: T.bg3, borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 6, transition: "width 1s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
