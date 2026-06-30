import { useEffect, useState, useCallback } from "react";
import API_BASE from "../../config";

const T = {
  bg0: "#05070E", bg1: "#0B1120", bg2: "#111B30", bg3: "#18253E",
  amber: "#F5A623", amberSoft: "rgba(245,166,35,0.09)", amberBorder: "rgba(245,166,35,0.22)",
  green: "#00D68F", greenSoft: "rgba(0,214,143,0.09)", greenBorder: "rgba(0,214,143,0.25)",
  sky: "#38C0FF",
  rose: "#FF5577", roseSoft: "rgba(255,85,119,0.09)",
  border: "rgba(255,255,255,0.07)",
  t1: "#EBF0FF", t2: "#7A98B8", t3: "#3F5470",
  font: "'Inter', system-ui, sans-serif",
};

const PIPES = ["16mm Inline", "16mm Online", "20mm Inline", "20mm Online"];
const ZONES = [
  { id: "Z1", label: "Zone 1 – Maharashtra",    states: "Pune · Nashik · Nagpur · Aurangabad",      mult: 1.00, ctx: "Home zone — base pricing, no transport surcharge." },
  { id: "Z2", label: "Zone 2 – West & Central",  states: "Gujarat · Goa · MP · Chhattisgarh",       mult: 1.07, ctx: "Gujarat has India's highest drip adoption — market supports a modest premium." },
  { id: "Z3", label: "Zone 3 – South India",     states: "Karnataka · Telangana · AP · TN · Kerala", mult: 1.12, ctx: "Deccan plateau logistics + moderate adoption premium applied." },
  { id: "Z4", label: "Zone 4 – North India",     states: "Rajasthan · UP · Delhi · Haryana",         mult: 1.17, ctx: "Higher freight cost from Maharashtra hub reflected in pricing." },
  { id: "Z5", label: "Zone 5 – East & NE",       states: "Bihar · West Bengal · Odisha · Assam",     mult: 1.22, ctx: "Developing market — competitive pricing to drive adoption." },
];

const BASE = {
  "16mm Inline": { base: 1050, confidence: 91, crop: "Banana · Grapes · Onion" },
  "16mm Online": { base: 1200, confidence: 88, crop: "Tomato · Chilli · Pomegranate" },
  "20mm Inline": { base: 1350, confidence: 94, crop: "Sugarcane · Cotton" },
  "20mm Online": { base: 1500, confidence: 86, crop: "Cotton · Maize" },
};

const PIPE_COLORS = ["#00D68F", "#F5A623", "#38C0FF", "#818CF8"];

const HISTORY = [
  { zone: "Zone 1 – Maharashtra",    pipe: "16mm Inline", price: 1180, date: "Apr 28", status: "Active"  },
  { zone: "Zone 1 – Maharashtra",    pipe: "20mm Inline", price: 1460, date: "Apr 25", status: "Active"  },
  { zone: "Zone 2 – West & Central", pipe: "16mm Inline", price: 1260, date: "Apr 20", status: "Expired" },
  { zone: "Zone 3 – South India",    pipe: "16mm Online", price: 1345, date: "Apr 18", status: "Expired" },
  { zone: "Zone 4 – North India",    pipe: "20mm Online", price: 1760, date: "Apr 15", status: "Expired" },
];

export default function PricingApprovals() {
  const [zone,      setZone]      = useState("Z1");
  const [subsidy,   setSubsidy]   = useState(true);
  const [prices,    setPrices]    = useState({});
  const [overrides, setOverrides] = useState({});
  const [approved,  setApproved]  = useState({});
  const [loading,   setLoading]   = useState(false);
  const [toast,     setToast]     = useState(null);
  const [histOpen,  setHistOpen]  = useState(false);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  };

  const activeZone = ZONES.find(z => z.id === zone) || ZONES[0];

  const getMock = useCallback((pipe) => BASE[pipe].base, []);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    const month = new Date().getMonth() + 1;
    const year  = new Date().getFullYear();
    const res   = {};
    for (const pipe of PIPES) {
      try {
        const [ws, ns] = await Promise.all([
          fetch(`${API_BASE}/api/ai-price`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pipe_type: pipe, zone, month, year, govt_subsidy: 1 }),
          }).then(r => r.json()),
          fetch(`${API_BASE}/api/ai-price`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pipe_type: pipe, zone, month, year, govt_subsidy: 0 }),
          }).then(r => r.json()),
        ]);
        let wp = ws.approvedPrice ?? ws.finalPrice;
        let np = ns.approvedPrice ?? ns.finalPrice;
        res[pipe] = {
          withSub: wp || getMock(pipe),
          noSub:   np || getMock(pipe),
          season:  ws.season || null,
          demand:  ws.predicted_demand || null,
          factors: ws.factors || null,
        };
      } catch {
        const mock = getMock(pipe);
        res[pipe] = { withSub: mock, noSub: mock, season: null, demand: null, factors: null };
      }
    }
    setPrices(res);
    setApproved({});
    setOverrides({});
    setLoading(false);
  }, [zone, activeZone.mult, getMock]);

  useEffect(() => { fetchPrices(); }, [fetchPrices]);

  const doApprove = async (pipe, price) => {
    try {
      await fetch(`${API_BASE}/api/approve-price`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipe_type: pipe, region: zone, approved_price: price }),
      });
    } catch {}
    setApproved(a => ({ ...a, [pipe]: price }));
    showToast(`✓ ${pipe} — ₹${price}/bundle approved for ${activeZone.label}`);
  };

  const approveAll = () => {
    PIPES.forEach(pipe => {
      if (!approved[pipe]) {
        const ai  = subsidy ? prices[pipe]?.withSub : prices[pipe]?.noSub;
        const fin = overrides[pipe] ? parseFloat(overrides[pipe]) : ai;
        if (fin) doApprove(pipe, fin);
      }
    });
  };

  const pendingCount = PIPES.filter(p => !approved[p]).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: T.font }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 22, right: 26, zIndex: 9999,
          background: toast.ok ? T.greenSoft : T.roseSoft,
          border: `1px solid ${toast.ok ? T.greenBorder : "rgba(255,85,119,0.3)"}`,
          borderRadius: 12, padding: "13px 22px",
          color: toast.ok ? T.green : T.rose, fontSize: 13, fontWeight: 600,
          boxShadow: "0 10px 40px rgba(0,0,0,0.45)",
          animation: "slideUp 0.22s ease both",
        }}>{toast.msg}</div>
      )}

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", animation: "slideUp 0.3s ease both" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: T.t1, margin: 0, fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Pricing Approvals
          </h1>
          <p style={{ fontSize: 13, color: T.t2, margin: "4px 0 0" }}>
            Review AI-recommended prices and approve before they go live
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* PMKSY subsidy toggle */}
          <div
            onClick={() => setSubsidy(s => !s)}
            style={{
              display: "flex", alignItems: "center", gap: 9,
              background: subsidy ? T.greenSoft : T.roseSoft,
              border: `1px solid ${subsidy ? T.greenBorder : "rgba(255,85,119,0.25)"}`,
              borderRadius: 9, padding: "8px 14px", cursor: "pointer", userSelect: "none",
            }}
          >
            <div style={{ width: 34, height: 20, borderRadius: 10, background: subsidy ? T.green : T.t3, position: "relative", transition: "background 0.22s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 3, left: subsidy ? 17 : 3, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left 0.22s" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: subsidy ? T.green : T.rose }}>PMKSY Subsidy</div>
              <div style={{ fontSize: 10, color: T.t3 }}>{subsidy ? "Active — demand +18%" : "Inactive — adjusted down"}</div>
            </div>
          </div>

          <select
            value={zone}
            onChange={e => setZone(e.target.value)}
            style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 9, color: T.t1, fontSize: 13, padding: "8px 12px", fontFamily: T.font, cursor: "pointer", minWidth: 220, outline: "none" }}
          >
            {ZONES.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}
          </select>

          <button onClick={fetchPrices} disabled={loading} style={{ padding: "8px 14px", borderRadius: 9, border: `1px solid ${T.border}`, background: "transparent", color: T.t2, fontSize: 12, cursor: "pointer", fontFamily: T.font, transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = T.bg2}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >{loading ? "Fetching…" : "↻ Refresh"}</button>
        </div>
      </div>

      {/* Action required banner */}
      {pendingCount > 0 ? (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(245,166,35,0.08)",
          border: `1px solid ${T.amberBorder}`,
          borderRadius: 12, padding: "14px 22px",
          animation: "slideUp 0.3s ease both", animationDelay: "40ms",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.amberSoft, border: `1px solid ${T.amberBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, animation: "amber-glow 2.5s infinite" }}>⏳</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.t1 }}>
                {pendingCount} price{pendingCount > 1 ? "s" : ""} waiting for your approval
              </div>
              <div style={{ fontSize: 12, color: T.t2, marginTop: 2 }}>
                {activeZone.label} · {subsidy ? "PMKSY Active" : "No Subsidy"} · Review each price below and click Approve
              </div>
            </div>
          </div>
          <button
            onClick={approveAll}
            style={{
              padding: "10px 22px", borderRadius: 9, border: "none",
              background: T.amber, color: "#04080F",
              fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: T.font,
              boxShadow: "0 4px 14px rgba(245,166,35,0.3)",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >Approve All {pendingCount}</button>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: T.greenSoft, border: `1px solid ${T.greenBorder}`, borderRadius: 12, padding: "14px 22px", animation: "slideUp 0.3s ease both" }}>
          <span style={{ fontSize: 18 }}>✅</span>
          <div style={{ fontSize: 14, color: T.green, fontWeight: 600 }}>All prices approved for {activeZone.label}</div>
        </div>
      )}

      {/* Price cards — one per pipe type */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
        {PIPES.map((pipe, i) => {
          const pd         = prices[pipe];
          const aiPrice    = subsidy ? pd?.withSub : pd?.noSub;
          const altPrice   = subsidy ? pd?.noSub : pd?.withSub;
          const meta       = BASE[pipe];
          const override   = overrides[pipe];
          const finalPrice = override ? parseFloat(override) : aiPrice;
          const isApproved = !!approved[pipe];
          const diff       = aiPrice && meta.base ? aiPrice - meta.base : null;
          const diffPct    = diff !== null ? ((diff / meta.base) * 100).toFixed(1) : null;
          const isAbove    = diff > 0;
          const pipeColor  = PIPE_COLORS[i];

          return (
            <div
              key={pipe}
              style={{
                background: T.bg1,
                border: `1px solid ${isApproved ? T.greenBorder : T.border}`,
                borderRadius: 14,
                padding: "24px 24px",
                position: "relative",
                opacity: isApproved ? 0.72 : 1,
                transition: "opacity 0.3s, border-color 0.3s",
                animation: "slideUp 0.35s ease both",
                animationDelay: `${80 + i * 55}ms`,
              }}
            >
              {/* Approved badge */}
              {isApproved && (
                <div style={{ position: "absolute", top: 14, right: 14, background: T.greenSoft, border: `1px solid ${T.greenBorder}`, borderRadius: 20, padding: "3px 12px", fontSize: 10, color: T.green, fontWeight: 700 }}>
                  ✓ APPROVED AT ₹{approved[pipe]}
                </div>
              )}

              {/* Card header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 4, height: 42, borderRadius: 4, background: pipeColor, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.t1, marginBottom: 2 }}>{pipe}</div>
                  <div style={{ fontSize: 11, color: T.t3 }}>{meta.crop}</div>
                </div>
              </div>

              {loading ? (
                <div style={{ color: T.t3, fontSize: 13, padding: "10px 0" }}>Loading AI prices…</div>
              ) : (
                <>
                  {/* Price comparison block */}
                  <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    {/* AI recommended */}
                    <div style={{ flex: 1, background: T.bg2, borderRadius: 10, padding: "14px 16px" }}>
                      <div style={{ fontSize: 10, color: T.t3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                        AI Recommends
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: T.amber, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
                        ₹{aiPrice ?? "—"}
                      </div>
                      <div style={{ fontSize: 10, color: T.t3, marginTop: 4 }}>
                        /bundle · {subsidy ? "PMKSY Active" : "No Subsidy"}
                      </div>
                    </div>

                    {/* vs base */}
                    <div style={{ flex: 1, background: T.bg3, borderRadius: 10, padding: "14px 16px" }}>
                      <div style={{ fontSize: 10, color: T.t3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                        Base Price
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: T.t2, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
                        ₹{meta.base}
                      </div>
                      {diffPct !== null && (
                        <div style={{ fontSize: 11, color: isAbove ? T.green : T.rose, marginTop: 4, fontWeight: 700 }}>
                          {isAbove ? "▲" : "▼"} ₹{Math.abs(diff)} ({isAbove ? "+" : "-"}{Math.abs(diffPct)}%)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Other subsidy state comparison */}
                  {altPrice && (
                    <div style={{ fontSize: 12, color: T.t3, background: T.bg3, borderRadius: 8, padding: "9px 14px", marginBottom: 14, display: "flex", justifyContent: "space-between" }}>
                      <span>{subsidy ? "Without PMKSY" : "With PMKSY"}:</span>
                      <span style={{ color: T.t2, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                        ₹{altPrice}/bundle{" "}
                        <span style={{ color: T.t3, fontWeight: 400 }}>
                          ({subsidy ? "−" : "+"}₹{Math.abs(aiPrice - altPrice)} impact)
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Why this price — zone context */}
                  <div style={{ background: "rgba(56,192,255,0.06)", border: "1px solid rgba(56,192,255,0.13)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: T.sky, fontSize: 13, flexShrink: 0, lineHeight: 1.5 }}>ℹ</span>
                    <span style={{ fontSize: 11.5, color: T.t2, lineHeight: 1.55 }}>{activeZone.ctx}</span>
                  </div>

                  {/* Confidence bar */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 10, color: T.t3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>AI Confidence</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: meta.confidence >= 90 ? T.green : meta.confidence >= 75 ? T.amber : T.rose }}>{meta.confidence}%</span>
                    </div>
                    <div style={{ height: 5, background: T.bg3, borderRadius: 5, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${meta.confidence}%`, background: meta.confidence >= 90 ? T.green : meta.confidence >= 75 ? T.amber : T.rose, borderRadius: 5, transition: "width 1s" }} />
                    </div>
                  </div>

                  {/* Override input */}
                  {!isApproved && (
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 10, color: T.t3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
                        Override Price <span style={{ textTransform: "none", fontWeight: 400, letterSpacing: 0 }}>(optional — leave blank to approve AI price)</span>
                      </label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="number" step="10"
                          placeholder={`AI: ₹${aiPrice ?? "—"}`}
                          value={override || ""}
                          onChange={e => setOverrides(o => ({ ...o, [pipe]: e.target.value }))}
                          style={{ flex: 1, background: T.bg0, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", color: T.t1, fontSize: 13, fontFamily: T.font, outline: "none" }}
                          onFocus={e => e.target.style.borderColor = T.amber}
                          onBlur={e => e.target.style.borderColor = T.border}
                        />
                        {override && (
                          <button onClick={() => setOverrides(o => ({ ...o, [pipe]: "" }))} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.t2, fontSize: 12, cursor: "pointer" }}>✕</button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Approve button */}
                  <button
                    onClick={() => !isApproved && finalPrice && doApprove(pipe, finalPrice)}
                    disabled={isApproved || !finalPrice}
                    style={{
                      width: "100%", padding: "13px 0", borderRadius: 10, border: "none",
                      background: isApproved
                        ? T.bg3
                        : `linear-gradient(135deg, ${T.green} 0%, #00A870 100%)`,
                      color: isApproved ? T.t3 : "#04080F",
                      fontSize: 14, fontWeight: 700, cursor: isApproved ? "default" : "pointer",
                      fontFamily: T.font, letterSpacing: "0.01em",
                      boxShadow: isApproved ? "none" : "0 4px 16px rgba(0,214,143,0.25)",
                      transition: "box-shadow 0.2s",
                    }}
                    onMouseEnter={e => { if (!isApproved) e.currentTarget.style.boxShadow = "0 6px 22px rgba(0,214,143,0.35)"; }}
                    onMouseLeave={e => { if (!isApproved) e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,214,143,0.25)"; }}
                  >
                    {isApproved
                      ? `Approved at ₹${approved[pipe]}/bundle`
                      : `✓  Approve ₹${finalPrice ?? "—"}/bundle`}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Approval history (collapsible) */}
      <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", animation: "slideUp 0.35s ease both", animationDelay: "320ms" }}>
        <button
          onClick={() => setHistOpen(h => !h)}
          style={{ width: "100%", padding: "18px 24px", background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", fontFamily: T.font }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.t1, textAlign: "left" }}>Recent Approval History</div>
            <div style={{ fontSize: 12, color: T.t2, marginTop: 2, textAlign: "left" }}>Last 5 approved prices across all zones</div>
          </div>
          <span style={{ fontSize: 16, color: T.t3, transition: "transform 0.2s", transform: histOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
        </button>
        {histOpen && (
          <div style={{ borderTop: `1px solid ${T.border}`, padding: "0 0 4px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Zone", "Pipe Type", "Approved Price", "Date", "Status"].map(h => (
                    <th key={h} style={{ textAlign: "left", fontSize: 10, color: T.t3, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", padding: "12px 24px", borderBottom: `1px solid ${T.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HISTORY.map((r, i) => (
                  <tr key={i}
                    onMouseEnter={e => e.currentTarget.style.background = T.bg2}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    style={{ transition: "background 0.1s" }}
                  >
                    <td style={{ padding: "12px 24px", fontSize: 12, color: T.t2, borderBottom: `1px solid ${T.border}` }}>{r.zone}</td>
                    <td style={{ padding: "12px 24px", fontSize: 12, color: T.t1, fontWeight: 500, borderBottom: `1px solid ${T.border}` }}>{r.pipe}</td>
                    <td style={{ padding: "12px 24px", fontSize: 13, color: T.amber, fontWeight: 700, fontVariantNumeric: "tabular-nums", borderBottom: `1px solid ${T.border}` }}>₹{r.price}/bundle</td>
                    <td style={{ padding: "12px 24px", fontSize: 11, color: T.t3, borderBottom: `1px solid ${T.border}` }}>{r.date}</td>
                    <td style={{ padding: "12px 24px", borderBottom: `1px solid ${T.border}` }}>
                      <span style={{
                        background: r.status === "Active" ? T.greenSoft : "rgba(80,80,100,0.15)",
                        color: r.status === "Active" ? T.green : T.t3,
                        fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                      }}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
