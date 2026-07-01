import { useEffect, useState } from "react";
import API_BASE from "../../config";

const T = {
  bg0: "#05070E", bg1: "#0B1120", bg2: "#111B30", bg3: "#18253E",
  amber: "#F5A623", amberSoft: "rgba(245,166,35,0.09)", amberBorder: "rgba(245,166,35,0.22)",
  green: "#00D68F", greenSoft: "rgba(0,214,143,0.09)", greenBorder: "rgba(0,214,143,0.22)",
  sky: "#38C0FF",
  rose: "#FF5577",  roseSoft: "rgba(255,85,119,0.09)", roseBorder: "rgba(255,85,119,0.25)",
  border: "rgba(255,255,255,0.07)",
  t1: "#EBF0FF", t2: "#7A98B8", t3: "#3F5470",
  font: "'Inter', system-ui, sans-serif",
};

const BUNDLE = 300;
const PIPES = [
  "Premium 16mm Inline", "Gold 16mm Inline",
  "Supreme 16mm Online",
  "Premium 20mm Inline", "Shakti 20mm Inline",
  "Supreme 20mm Online",
];
const PIPE_COLORS = ["#00D68F", "#00A36C", "#F5A623", "#38C0FF", "#2196F3", "#818CF8"];

const CAP = {
  "Premium 16mm Inline": 300, "Gold 16mm Inline": 250,
  "Supreme 16mm Online": 300,
  "Premium 20mm Inline": 250, "Shakti 20mm Inline": 200,
  "Supreme 20mm Online": 200,
};
const MOCK = {
  "Premium 16mm Inline": 200, "Gold 16mm Inline": 200,
  "Supreme 16mm Online": 200,
  "Premium 20mm Inline": 200, "Shakti 20mm Inline": 200,
  "Supreme 20mm Online": 200,
};
const META = {
  "Premium 16mm Inline": { crop: "Banana · Grapes · Onion",       season: "Rabi / Kharif", reorder: 50 },
  "Gold 16mm Inline":    { crop: "Pomegranate · Grapes",          season: "Rabi",          reorder: 40 },
  "Supreme 16mm Online": { crop: "Tomato · Chilli · Pomegranate", season: "All seasons",   reorder: 50 },
  "Premium 20mm Inline": { crop: "Sugarcane · Cotton",            season: "Kharif",        reorder: 40 },
  "Shakti 20mm Inline":  { crop: "Sugarcane · Maize",             season: "Kharif",        reorder: 30 },
  "Supreme 20mm Online": { crop: "Cotton · Maize",                season: "Kharif",        reorder: 30 },
};
const HISTORY = [
  { date: "May 1", "Premium 16mm Inline": 210, "Gold 16mm Inline": 205, "Supreme 16mm Online": 208, "Premium 20mm Inline": 202, "Shakti 20mm Inline": 198, "Supreme 20mm Online": 197 },
  { date: "May 2", "Premium 16mm Inline": 208, "Gold 16mm Inline": 204, "Supreme 16mm Online": 206, "Premium 20mm Inline": 201, "Shakti 20mm Inline": 199, "Supreme 20mm Online": 198 },
  { date: "May 3", "Premium 16mm Inline": 205, "Gold 16mm Inline": 202, "Supreme 16mm Online": 204, "Premium 20mm Inline": 200, "Shakti 20mm Inline": 200, "Supreme 20mm Online": 200 },
  { date: "May 5", "Premium 16mm Inline": 202, "Gold 16mm Inline": 201, "Supreme 16mm Online": 202, "Premium 20mm Inline": 200, "Shakti 20mm Inline": 200, "Supreme 20mm Online": 200 },
  { date: "May 7", "Premium 16mm Inline": 200, "Gold 16mm Inline": 200, "Supreme 16mm Online": 200, "Premium 20mm Inline": 200, "Shakti 20mm Inline": 200, "Supreme 20mm Online": 200 },
];

const levelColor = (pct) => pct > 60 ? T.green  : pct > 30 ? T.amber : T.rose;
const levelLabel = (pct) => pct > 60 ? "Healthy" : pct > 30 ? "Moderate" : "Critical";

export default function StockManagement() {
  const [stock,   setStock]   = useState(MOCK);
  const [draft,   setDraft]   = useState({});
  const [saving,  setSaving]  = useState({});
  const [toast,   setToast]   = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/stock`)
      .then(r => r.json())
      .then(d => {
        const f = {};
        d.forEach(item => { f[item.pipe_type] = Math.floor(item.quantity / BUNDLE); });
        setStock(s => ({ ...s, ...f }));
      })
      .catch(() => {});
  }, []);

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const handleUpdate = async (pipe) => {
    const qty = Number(draft[pipe]);
    if (!qty || qty < 0) return;
    setSaving(s => ({ ...s, [pipe]: true }));
    try {
      await fetch(`${API_BASE}/api/stock/update`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipe_type: pipe, quantity: qty * BUNDLE }),
      });
      setStock(s => ({ ...s, [pipe]: qty }));
      setDraft(d => ({ ...d, [pipe]: "" }));
      showToast(`${pipe} → ${qty} bundle${qty !== 1 ? "s" : ""} (${(qty * BUNDLE).toLocaleString()}m)`);
    } catch {
      setStock(s => ({ ...s, [pipe]: qty }));
      setDraft(d => ({ ...d, [pipe]: "" }));
      showToast(`${pipe} → ${qty} bundle${qty !== 1 ? "s" : ""} (offline)`);
    } finally {
      setSaving(s => ({ ...s, [pipe]: false }));
    }
  };

  const alerts     = PIPES.filter(p => (stock[p] || 0) < META[p].reorder);
  const totalStock = PIPES.reduce((s, p) => s + (stock[p] || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, fontFamily: T.font }}>

      {toast && (
        <div style={{ position: "fixed", top: 22, right: 26, zIndex: 9999, background: toast.ok ? T.greenSoft : T.roseSoft, border: `1px solid ${toast.ok ? T.greenBorder : T.roseBorder}`, borderRadius: 12, padding: "12px 22px", color: toast.ok ? T.green : T.rose, fontSize: 13, fontWeight: 600, boxShadow: "0 10px 40px rgba(0,0,0,0.45)", animation: "slideUp 0.22s ease both" }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", animation: "slideUp 0.3s ease both" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: T.t1, margin: 0, fontFamily: "'DM Serif Display', Georgia, serif" }}>Stock Management</h1>
          <p style={{ fontSize: 13, color: T.t2, margin: "4px 0 0" }}>Monitor inventory levels and update stock quantities per pipe type</p>
        </div>
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 18px", textAlign: "right" }}>
          <div style={{ fontSize: 10, color: T.t3, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600, marginBottom: 4 }}>Total Stock</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.green, fontVariantNumeric: "tabular-nums" }}>{totalStock} bundles</div>
          <div style={{ fontSize: 11, color: T.t3 }}>{(totalStock * BUNDLE).toLocaleString()}m total</div>
        </div>
      </div>

      {/* Critical alerts banner */}
      {alerts.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: T.roseSoft, border: `1px solid ${T.roseBorder}`, borderRadius: 12, padding: "13px 20px", animation: "slideUp 0.3s ease both", animationDelay: "30ms" }}>
          <span style={{ fontSize: 18 }}>🚨</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.rose }}>
              {alerts.length} pipe type{alerts.length > 1 ? "s" : ""} below reorder level!
            </div>
            <div style={{ fontSize: 12, color: T.t2, marginTop: 2 }}>
              {alerts.join(" · ")} — update stock quantities below immediately.
            </div>
          </div>
        </div>
      )}

      {/* Stock cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
        {PIPES.map((pipe, idx) => {
          const qty  = stock[pipe] || 0;
          const cap  = CAP[pipe];
          const pct  = Math.round((qty / cap) * 100);
          const col  = levelColor(pct);
          const meta = META[pipe];
          const crit = qty < meta.reorder;
          const pipeColor = PIPE_COLORS[idx];

          return (
            <div
              key={pipe}
              style={{
                background: T.bg1,
                border: `1px solid ${crit ? T.roseBorder : T.border}`,
                borderRadius: 14, padding: "24px 24px",
                position: "relative", overflow: "hidden",
                animation: "slideUp 0.35s ease both",
                animationDelay: `${60 + idx * 55}ms`,
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,0,0,0.35)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              {/* Coloured top border */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${pipeColor}, transparent)` }} />

              {crit && (
                <div style={{ position: "absolute", top: 14, right: 14, background: T.roseSoft, border: `1px solid ${T.roseBorder}`, borderRadius: 20, padding: "2px 10px", fontSize: 10, color: T.rose, fontWeight: 700, animation: "pulse-red 2s infinite" }}>
                  ⚠ REORDER NOW
                </div>
              )}

              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.t1, marginBottom: 4 }}>{pipe}</div>
                  <div style={{ fontSize: 11, color: T.t3, marginBottom: 2 }}>{meta.crop}</div>
                  <div style={{ fontSize: 11, color: T.t3 }}>Peak season: {meta.season}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: col, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{qty}</div>
                  <div style={{ fontSize: 11, color: T.t3, marginTop: 2 }}>bundles in stock</div>
                  <div style={{ fontSize: 10, color: T.t3 }}>{(qty * BUNDLE).toLocaleString()}m</div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ fontSize: 11, color: T.t2 }}>{pct}% capacity used</span>
                  <span style={{ fontSize: 11, color: col, fontWeight: 700 }}>{levelLabel(pct)}</span>
                </div>
                <div style={{ height: 8, background: T.bg3, borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: col, borderRadius: 8, transition: "width 1.1s cubic-bezier(0.4,0,0.2,1)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                  <span style={{ fontSize: 10, color: T.t3 }}>Reorder at {meta.reorder} bundles</span>
                  <span style={{ fontSize: 10, color: T.t3 }}>Max: {cap} bundles</span>
                </div>
              </div>

              {/* Update input */}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number"
                  placeholder="New quantity (bundles)"
                  value={draft[pipe] || ""}
                  onChange={e => setDraft(d => ({ ...d, [pipe]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && handleUpdate(pipe)}
                  style={{ flex: 1, background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 9, padding: "9px 12px", color: T.t1, fontSize: 13, fontFamily: T.font, outline: "none" }}
                  onFocus={e => e.target.style.borderColor = T.amber}
                  onBlur={e => e.target.style.borderColor = T.border}
                />
                <button
                  onClick={() => handleUpdate(pipe)}
                  disabled={saving[pipe] || !draft[pipe]}
                  style={{
                    padding: "9px 20px", borderRadius: 9, border: "none",
                    background: (saving[pipe] || !draft[pipe]) ? T.bg3 : T.amber,
                    color: (saving[pipe] || !draft[pipe]) ? T.t3 : "#04080F",
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                    fontFamily: T.font, whiteSpace: "nowrap", transition: "background 0.15s",
                  }}
                >{saving[pipe] ? "Saving…" : "Update"}</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* History table */}
      <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", animation: "slideUp 0.35s ease both", animationDelay: "280ms" }}>
        <div style={{ padding: "20px 24px 16px" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: T.t1, margin: 0 }}>Stock History — Last 5 Days</h2>
          <p style={{ fontSize: 12, color: T.t2, margin: "4px 0 0" }}>Inventory levels in bundles · Critical values highlighted in red</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
            <thead>
              <tr style={{ borderTop: `1px solid ${T.border}` }}>
                {["Date", ...PIPES].map(h => (
                  <th key={h} style={{ textAlign: "left", fontSize: 10, color: T.t3, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", padding: "12px 24px", borderBottom: `1px solid ${T.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HISTORY.map((row, i) => (
                <tr key={i}
                  onMouseEnter={e => e.currentTarget.style.background = T.bg2}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  style={{ transition: "background 0.12s" }}
                >
                  <td style={{ padding: "11px 24px", fontSize: 12, color: T.t2, borderBottom: `1px solid ${T.border}` }}>{row.date}</td>
                  {PIPES.map((pipe, pi) => {
                    const isLow = row[pipe] < META[pipe].reorder;
                    return (
                      <td key={pipe} style={{ padding: "11px 24px", fontSize: 12, color: isLow ? T.rose : T.t1, fontWeight: isLow ? 700 : 400, fontVariantNumeric: "tabular-nums", borderBottom: `1px solid ${T.border}` }}>
                        {row[pipe]}
                        {isLow && <span style={{ fontSize: 9, color: T.rose, marginLeft: 4 }}>▼ LOW</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
