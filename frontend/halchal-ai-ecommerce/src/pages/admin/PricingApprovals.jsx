import { useEffect, useState, useCallback } from "react";

const T = {
  bg0: "#04080F", bg1: "#07101E", bg2: "#0B1628", bg3: "#101F35",
  accent: "#00E5A0", copper: "#FFB020", danger: "#FF6B6B", info: "#00B4D8",
  border: "rgba(255,255,255,0.07)", borderMd: "rgba(255,255,255,0.13)",
  text1: "#EEF3FF", text2: "#7A9EC6", text3: "#3D5A7A",
};

const PIPE_TYPES = ["16mm Inline", "16mm Online", "20mm Inline", "20mm Online"];

const ZONES = [
  { id: "Z1", label: "Zone 1 – Maharashtra",    states: "Pune · Nashik · Nagpur · Aurangabad + all MH",      multiplier: 1.00 },
  { id: "Z2", label: "Zone 2 – West & Central",  states: "Gujarat · Goa · Madhya Pradesh · Chhattisgarh",     multiplier: 1.07 },
  { id: "Z3", label: "Zone 3 – South India",     states: "Karnataka · Telangana · AP · Tamil Nadu · Kerala",  multiplier: 1.12 },
  { id: "Z4", label: "Zone 4 – North India",     states: "Rajasthan · UP · Delhi · Haryana · Punjab",         multiplier: 1.17 },
  { id: "Z5", label: "Zone 5 – East & NE",       states: "Bihar · West Bengal · Odisha · Assam · NE states",  multiplier: 1.22 },
];

// Base prices (Zone 1) PER BUNDLE (300m coil) — consistent with competitor prices ₹1214–₹1650/bundle
const MOCK_BASE = {
  "16mm Inline": { base: 1050, confidence: 91 },
  "16mm Online": { base: 1200, confidence: 88 },
  "20mm Inline": { base: 1350, confidence: 94 },
  "20mm Online": { base: 1500, confidence: 86 },
};

const APPROVED_HISTORY = [
  { zone: "Zone 1 – Maharashtra",    pipe: "16mm Inline", price: 1180, date: "Apr 28", status: "Active"  },
  { zone: "Zone 1 – Maharashtra",    pipe: "20mm Inline", price: 1460, date: "Apr 25", status: "Active"  },
  { zone: "Zone 2 – West & Central", pipe: "16mm Inline", price: 1260, date: "Apr 20", status: "Expired" },
  { zone: "Zone 3 – South India",    pipe: "16mm Online", price: 1345, date: "Apr 18", status: "Expired" },
  { zone: "Zone 4 – North India",    pipe: "20mm Online", price: 1760, date: "Apr 15", status: "Expired" },
];

const ZONE_CONTEXT = {
  Z1: "Home zone — no transport surcharge, Maharashtra market base.",
  Z2: "Gujarat has India's highest drip adoption (1.42×) — market supports a premium.",
  Z3: "South India — Deccan plateau logistics + moderate adoption premium.",
  Z4: "North India — higher freight cost from Maharashtra hub.",
  Z5: "East India developing market — competitive pricing to drive adoption.",
};

function getPriceDelta(aiPrice, base) {
  if (!aiPrice || !base) return null;
  const pct = ((aiPrice - base) / base * 100).toFixed(1);
  return { pct: Math.abs(pct), isAbove: aiPrice >= base, raw: parseFloat(pct) };
}

function getReason(zoneId, factors, delta, season) {
  const parts = [];

  // Zone context
  if (ZONE_CONTEXT[zoneId]) parts.push(ZONE_CONTEXT[zoneId]);

  // Demand signal
  const df = factors?.demand_factor;
  if (df >= 1.08)       parts.push(`Strong ${season || "seasonal"} demand is driving the price up.`);
  else if (df >= 1.03)  parts.push(`Above-average demand this ${season || "season"}.`);
  else if (df <= 0.92)  parts.push(`Below-average demand — AI is pricing competitively to move stock.`);

  // Adoption premium/discount
  const af = factors?.adoption_factor;
  if (af >= 1.03)       parts.push(`Market adoption premium: region can absorb higher price.`);
  else if (af <= 0.98)  parts.push(`Low adoption discount applied to stay competitive.`);

  return parts.slice(0, 2).join(" ") || "AI model balanced demand, logistics, and adoption data.";
}

const Card = ({ children, style }) => (
  <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, ...style }}>
    {children}
  </div>
);

const ConfidenceBar = ({ value }) => {
  const color = value >= 90 ? T.accent : value >= 75 ? T.copper : T.danger;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 10, color: T.text3 }}>AI Confidence</span>
        <span style={{ fontSize: 10, color, fontWeight: 700 }}>{value}%</span>
      </div>
      <div style={{ height: 4, background: T.bg3, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 4, transition: "width 1s" }} />
      </div>
    </div>
  );
};

export default function PricingApprovals() {
  const [zone,      setZone]      = useState("Z1");
  const [subsidy,   setSubsidy]   = useState(true);   // PMKSY / govt subsidy toggle
  const [priceData, setPriceData] = useState({});     // { [pipe]: { price, noSubPrice, factors, demand, season } }
  const [overrides, setOverrides] = useState({});
  const [approved,  setApproved]  = useState({});
  const [loading,   setLoading]   = useState(false);
  const [toast,     setToast]     = useState(null);

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const activeZone = ZONES.find(z => z.id === zone) || ZONES[0];

  const getMockPrice = useCallback((pipe) => {
    return Math.round(MOCK_BASE[pipe].base * activeZone.multiplier / 10) * 10;
  }, [activeZone.multiplier]);

  const callAPI = useCallback(async (pipe, month, year, subsidyFlag) => {
    const res = await fetch("http://localhost:5000/api/ai-price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pipe_type: pipe, zone, month, year, govt_subsidy: subsidyFlag ? 1 : 0 }),
    });
    const data = await res.json();
    let price = data.recommended_price ?? data.final_price;
    if (price && price < 100) price = Math.round(price * 300 / 10) * 10;
    return { price, data };
  }, [zone]);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    const month = new Date().getMonth() + 1;
    const year  = new Date().getFullYear();
    const results = {};

    for (const pipe of PIPE_TYPES) {
      try {
        // Fetch both subsidy=1 and subsidy=0 in parallel for comparison
        const [withSub, noSub] = await Promise.all([
          callAPI(pipe, month, year, true),
          callAPI(pipe, month, year, false),
        ]);
        results[pipe] = {
          price:      withSub.price,
          noSubPrice: noSub.price,
          factors:    withSub.data.factors || null,
          demand:     withSub.data.predicted_demand || null,
          noSubDemand: noSub.data.predicted_demand || null,
          season:     withSub.data.season || null,
        };
      } catch {
        const fallback = getMockPrice(pipe);
        results[pipe] = { price: fallback, noSubPrice: Math.round(fallback * 0.93 / 10) * 10, factors: null, demand: null, noSubDemand: null, season: null };
      }
    }
    setPriceData(results);
    setApproved({});
    setOverrides({});
    setLoading(false);
  }, [zone, getMockPrice, callAPI]);

  useEffect(() => { fetchPrices(); }, [fetchPrices]);

  const approvePrice = async (pipe, price) => {
    try {
      await fetch("http://localhost:5000/api/approve-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipe_type: pipe, zone, price }),
      });
    } catch {}
    setApproved(a => ({ ...a, [pipe]: true }));
    showToast(`${pipe} — ₹${price}/bundle approved for ${activeZone.label}`);
  };

  const approveAll = () => {
    PIPE_TYPES.forEach(pipe => {
      const price = overrides[pipe] || priceData[pipe]?.price;
      if (price && !approved[pipe]) approvePrice(pipe, price);
    });
  };

  const pendingCount = PIPE_TYPES.filter(p => !approved[p]).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 24, zIndex: 9999, background: toast.ok ? "rgba(0,229,160,0.12)" : "rgba(255,107,107,0.12)", border: `1px solid ${toast.ok ? T.accent : T.danger}`, borderRadius: 10, padding: "12px 20px", color: toast.ok ? T.accent : T.danger, fontSize: 13, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text1, margin: 0, fontFamily: "'Playfair Display', serif" }}>Pricing Approvals</h1>
          <p style={{ fontSize: 13, color: T.text2, margin: "4px 0 0" }}>Review AI-recommended prices and approve or override before publishing</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* PMKSY Subsidy toggle */}
          <div
            onClick={() => setSubsidy(s => !s)}
            style={{ display: "flex", alignItems: "center", gap: 8, background: subsidy ? "rgba(0,229,160,0.08)" : "rgba(255,107,107,0.08)", border: `1px solid ${subsidy ? "rgba(0,229,160,0.25)" : "rgba(255,107,107,0.25)"}`, borderRadius: 8, padding: "7px 14px", cursor: "pointer", userSelect: "none" }}
          >
            <div style={{ width: 32, height: 18, borderRadius: 9, background: subsidy ? T.accent : T.text3, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 3, left: subsidy ? 16 : 3, width: 12, height: 12, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: subsidy ? T.accent : T.danger, whiteSpace: "nowrap" }}>
              PMKSY Subsidy {subsidy ? "Active" : "Inactive"}
            </span>
          </div>
          <select
            value={zone}
            onChange={e => setZone(e.target.value)}
            style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text1, fontSize: 13, padding: "8px 12px", fontFamily: "'Lora', serif", cursor: "pointer", minWidth: 220 }}
          >
            {ZONES.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}
          </select>
          <button
            onClick={fetchPrices}
            disabled={loading}
            style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.text2, fontSize: 12, cursor: "pointer", fontFamily: "'Lora', serif" }}
          >
            {loading ? "Fetching…" : "↻ Refresh"}
          </button>
          {pendingCount > 0 && (
            <button
              onClick={approveAll}
              style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: T.accent, color: "#04080F", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Lora', serif" }}
            >
              Approve All ({pendingCount})
            </button>
          )}
        </div>
      </div>

      {/* Info strip */}
      <div style={{ background: "rgba(255,176,32,0.06)", border: "1px solid rgba(255,176,32,0.14)", borderRadius: 10, padding: "12px 18px", display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: T.text2, alignItems: "center" }}>
        <span style={{ color: T.copper, fontWeight: 700 }}>{activeZone.label}</span>
        <span style={{ color: T.text3 }}>·</span>
        <span style={{ color: T.text3 }}>{activeZone.states}</span>
        <span style={{ color: T.text3 }}>·</span>
        <span>
          PMKSY: <span style={{ color: subsidy ? T.accent : T.danger, fontWeight: 600 }}>{subsidy ? "Active — demand +18%, prices higher" : "Inactive — demand lower, prices adjusted down"}</span>
        </span>
        <span style={{ color: T.text3 }}>·</span>
        <span>Cards show both subsidy states for comparison. Approve the price that matches current scheme status.</span>
      </div>

      {/* Price cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {PIPE_TYPES.map(pipe => {
          const pd          = priceData[pipe];
          const aiPrice     = subsidy ? pd?.price : pd?.noSubPrice;   // show price for current subsidy state
          const altPrice    = subsidy ? pd?.noSubPrice : pd?.price;   // opposite state for comparison
          const altLabel    = subsidy ? "Without subsidy" : "With subsidy";
          const override    = overrides[pipe];
          const finalPr     = override ? parseFloat(override) : aiPrice;
          const isApproved  = approved[pipe];
          const meta        = MOCK_BASE[pipe];
          const delta       = getPriceDelta(aiPrice, meta.base);
          const reason      = pd ? getReason(zone, pd.factors, delta, pd.season) : null;
          const deltaColor  = delta?.isAbove ? T.accent : T.danger;
          const subsidyDiff = (aiPrice && altPrice) ? Math.abs(aiPrice - altPrice) : null;

          return (
            <Card key={pipe} style={{ padding: "22px 24px", opacity: isApproved ? 0.7 : 1, position: "relative", border: isApproved ? `1px solid rgba(0,229,160,0.3)` : `1px solid ${T.border}` }}>
              {isApproved && (
                <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(0,229,160,0.12)", border: "1px solid rgba(0,229,160,0.3)", borderRadius: 20, padding: "2px 10px", fontSize: 10, color: T.accent, fontWeight: 700 }}>
                  ✓ APPROVED
                </div>
              )}

              {/* Title row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text1 }}>{pipe}</div>
                {delta && !isApproved && (
                  <div style={{ background: delta.isAbove ? "rgba(0,229,160,0.1)" : "rgba(255,107,107,0.1)", border: `1px solid ${delta.isAbove ? "rgba(0,229,160,0.25)" : "rgba(255,107,107,0.25)"}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: deltaColor }}>
                    {delta.isAbove ? "+" : "−"}{delta.pct}% vs base
                  </div>
                )}
              </div>
              <div style={{ fontSize: 11, color: T.text3, marginBottom: 16 }}>{activeZone.label}</div>

              {loading ? (
                <div style={{ height: 60, color: T.text3, fontSize: 12, display: "flex", alignItems: "center" }}>Fetching AI price…</div>
              ) : (
                <>
                  {/* Price comparison */}
                  <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                    <div style={{ flex: 1, background: subsidy ? "rgba(0,229,160,0.06)" : "rgba(255,107,107,0.06)", border: `1px solid ${subsidy ? "rgba(0,229,160,0.2)" : "rgba(255,107,107,0.2)"}`, borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontSize: 10, color: T.text3, marginBottom: 4 }}>
                        AI Price · <span style={{ color: subsidy ? T.accent : T.danger }}>{subsidy ? "PMKSY Active" : "No Subsidy"}</span>
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: T.copper, fontFamily: "monospace" }}>
                        ₹{aiPrice ?? "—"}<span style={{ fontSize: 11, fontWeight: 400, color: T.text3 }}>/bundle</span>
                      </div>
                      {pd && (
                        <div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>
                          Demand: {Math.round(subsidy ? pd.demand : pd.noSubDemand) || "—"} bundles · {pd.season}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, background: T.bg3, borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontSize: 10, color: T.text3, marginBottom: 4 }}>Base Price</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: T.text2, fontFamily: "monospace" }}>
                        ₹{meta.base}<span style={{ fontSize: 11, fontWeight: 400, color: T.text3 }}>/bundle</span>
                      </div>
                      {delta && (
                        <div style={{ fontSize: 10, color: deltaColor, marginTop: 4, fontWeight: 600 }}>
                          {delta.isAbove ? "▲" : "▼"} ₹{Math.abs(aiPrice - meta.base)} {delta.isAbove ? "above" : "below"} base
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subsidy impact row */}
                  {subsidyDiff > 0 && (
                    <div style={{ background: T.bg3, borderRadius: 8, padding: "8px 12px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: T.text3 }}>{altLabel}:</span>
                      <span style={{ fontSize: 12, color: T.text2, fontFamily: "monospace", fontWeight: 600 }}>
                        ₹{altPrice}/bundle
                        <span style={{ fontSize: 10, color: T.text3, fontWeight: 400 }}>
                          {" "}({subsidy ? "−" : "+"}₹{subsidyDiff} impact)
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Reason */}
                  {reason && (
                    <div style={{ background: "rgba(0,180,216,0.06)", border: "1px solid rgba(0,180,216,0.14)", borderRadius: 8, padding: "10px 12px", marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: T.info, fontSize: 12, flexShrink: 0 }}>ℹ</span>
                      <span style={{ fontSize: 11, color: T.text2, lineHeight: 1.5 }}>{reason}</span>
                    </div>
                  )}

                  {/* Factor breakdown */}
                  {pd?.factors && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                      {[
                        { label: "Demand", val: pd.factors.demand_factor, base: 1 },
                        { label: "Logistics", val: pd.factors.logistics_factor, base: 1 },
                        { label: "Adoption", val: pd.factors.adoption_factor, base: 1 },
                      ].map(({ label, val, base }) => {
                        const up  = val >= base;
                        const pct = ((val - base) * 100).toFixed(1);
                        return (
                          <div key={label} style={{ background: T.bg3, borderRadius: 6, padding: "4px 10px", fontSize: 10, color: T.text3 }}>
                            {label}: <span style={{ color: up ? T.accent : T.danger, fontWeight: 700 }}>{up ? "+" : ""}{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <ConfidenceBar value={meta.confidence} />

                  {/* Override input */}
                  <div style={{ marginTop: 14, marginBottom: 14 }}>
                    <label style={{ fontSize: 11, color: T.text3, display: "block", marginBottom: 6 }}>Override Price (optional)</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="number"
                        step="10"
                        placeholder={`AI: ₹${aiPrice ?? "—"}/bundle`}
                        value={override || ""}
                        disabled={isApproved}
                        onChange={e => setOverrides(o => ({ ...o, [pipe]: e.target.value }))}
                        style={{ flex: 1, background: T.bg0, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", color: T.text1, fontSize: 13, fontFamily: "'Lora', serif", outline: "none", opacity: isApproved ? 0.5 : 1 }}
                        onFocus={e => e.target.style.borderColor = T.copper}
                        onBlur={e => e.target.style.borderColor = T.border}
                      />
                      {override && (
                        <button onClick={() => setOverrides(o => ({ ...o, [pipe]: "" }))} style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.text2, fontSize: 11, cursor: "pointer" }}>✕</button>
                      )}
                    </div>
                  </div>

                  {/* Approve button */}
                  <button
                    onClick={() => approvePrice(pipe, finalPr)}
                    disabled={isApproved || !finalPr}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: isApproved ? T.bg3 : `linear-gradient(135deg, ${T.accent}, #00B4D8)`, color: isApproved ? T.text3 : "#04080F", fontSize: 13, fontWeight: 700, cursor: isApproved ? "not-allowed" : "pointer", fontFamily: "'Lora', serif" }}
                  >
                    {isApproved ? `Approved at ₹${finalPr}/bundle` : `Approve ₹${finalPr ?? "—"}/bundle for ${activeZone.label}`}
                  </button>
                </>
              )}
            </Card>
          );
        })}
      </div>

      {/* Approval history */}
      <Card style={{ padding: "22px 24px" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: T.text1, margin: "0 0 16px" }}>Recent Approval History</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Zone", "Pipe Type", "Approved Price", "Date", "Status"].map(h => (
                <th key={h} style={{ textAlign: "left", fontSize: 11, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", paddingBottom: 10, borderBottom: `1px solid ${T.border}`, paddingRight: 16 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {APPROVED_HISTORY.map((row, i) => (
              <tr key={i}>
                <td style={{ padding: "10px 16px 10px 0", fontSize: 12, color: T.text2, borderBottom: `1px solid ${T.border}` }}>{row.zone}</td>
                <td style={{ padding: "10px 16px 10px 0", fontSize: 12, color: T.text1, borderBottom: `1px solid ${T.border}` }}>{row.pipe}</td>
                <td style={{ padding: "10px 16px 10px 0", fontSize: 13, color: T.copper, fontWeight: 700, fontFamily: "monospace", borderBottom: `1px solid ${T.border}` }}>₹{row.price}/bundle</td>
                <td style={{ padding: "10px 16px 10px 0", fontSize: 11, color: T.text3, borderBottom: `1px solid ${T.border}` }}>{row.date}</td>
                <td style={{ padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ background: row.status === "Active" ? "rgba(0,229,160,0.1)" : "rgba(100,100,100,0.1)", color: row.status === "Active" ? T.accent : T.text3, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
