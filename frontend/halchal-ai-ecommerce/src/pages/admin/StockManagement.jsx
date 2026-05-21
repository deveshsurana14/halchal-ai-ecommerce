import { useEffect, useState } from "react";

const T = {
  bg0: "#04080F", bg1: "#07101E", bg2: "#0B1628", bg3: "#101F35",
  accent: "#00E5A0", copper: "#FFB020", danger: "#FF6B6B", info: "#00B4D8",
  border: "rgba(255,255,255,0.07)", borderMd: "rgba(255,255,255,0.13)",
  text1: "#EEF3FF", text2: "#7A9EC6", text3: "#3D5A7A",
};

const BUNDLE_SIZE = 300; // metres per coil/bundle
const PIPE_TYPES  = ["16mm Inline", "16mm Online", "20mm Inline", "20mm Online"];

// All quantities in BUNDLES (coils of 300m each)
const CAPACITY = {
  "16mm Inline": 20,
  "16mm Online": 20,
  "20mm Inline": 16,
  "20mm Online": 16,
};

const MOCK_STOCK = {
  "16mm Inline": 14,
  "16mm Online": 9,
  "20mm Inline": 6,
  "20mm Online": 3,
};

const PIPE_META = {
  "16mm Inline": { crop: "Banana, Grapes, Onion", season: "Rabi / Kharif", reorder: 5 },
  "16mm Online": { crop: "Tomato, Chilli, Pomegranate", season: "All seasons", reorder: 5 },
  "20mm Inline": { crop: "Sugarcane, Cotton", season: "Kharif", reorder: 4 },
  "20mm Online": { crop: "Cotton, Maize", season: "Kharif", reorder: 3 },
};

// History in bundles
const STOCK_HISTORY = [
  { date: "May 1", "16mm Inline": 13, "16mm Online": 10, "20mm Inline": 7, "20mm Online": 4 },
  { date: "May 2", "16mm Inline": 13, "16mm Online": 10, "20mm Inline": 7, "20mm Online": 4 },
  { date: "May 3", "16mm Inline": 14, "16mm Online": 9,  "20mm Inline": 7, "20mm Online": 3 },
  { date: "May 5", "16mm Inline": 14, "16mm Online": 9,  "20mm Inline": 6, "20mm Online": 3 },
  { date: "May 7", "16mm Inline": 14, "16mm Online": 9,  "20mm Inline": 6, "20mm Online": 3 },
];

const levelColor = (pct) => pct > 60 ? T.accent : pct > 30 ? T.copper : T.danger;
const levelLabel = (pct) => pct > 60 ? "Healthy"  : pct > 30 ? "Moderate" : "Critical";

const Card = ({ children, style }) => (
  <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, ...style }}>
    {children}
  </div>
);

export default function StockManagement() {
  const [stock,   setStock]   = useState(MOCK_STOCK);
  const [draft,   setDraft]   = useState({});
  const [saving,  setSaving]  = useState({});
  const [toast,   setToast]   = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/stock")
      .then(r => r.json())
      .then(data => {
        const formatted = {};
        data.forEach(item => { formatted[item.pipe_type] = Math.floor(item.quantity / BUNDLE_SIZE); });
        setStock(prev => ({ ...prev, ...formatted }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdate = async (pipe) => {
    const newQty = Number(draft[pipe]);
    if (!newQty || newQty < 0) return;
    setSaving(s => ({ ...s, [pipe]: true }));
    try {
      await fetch("http://localhost:5000/api/stock/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipe_type: pipe, quantity: newQty * BUNDLE_SIZE }), // send in metres
      });
      setStock(s => ({ ...s, [pipe]: newQty }));
      setDraft(d => ({ ...d, [pipe]: "" }));
      showToast(`${pipe} stock updated to ${newQty} bundle${newQty !== 1 ? "s" : ""} (${newQty * BUNDLE_SIZE}m)`);
    } catch {
      setStock(s => ({ ...s, [pipe]: newQty }));
      setDraft(d => ({ ...d, [pipe]: "" }));
      showToast(`${pipe} updated to ${newQty} bundle${newQty !== 1 ? "s" : ""} (offline mode)`);
    } finally {
      setSaving(s => ({ ...s, [pipe]: false }));
    }
  };

  const alerts = PIPE_TYPES.filter(p => stock[p] < PIPE_META[p].reorder);
  const totalStock = PIPE_TYPES.reduce((sum, p) => sum + (stock[p] || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 24, zIndex: 9999, background: toast.ok ? "rgba(0,229,160,0.12)" : "rgba(255,107,107,0.12)", border: `1px solid ${toast.ok ? T.accent : T.danger}`, borderRadius: 10, padding: "12px 20px", color: toast.ok ? T.accent : T.danger, fontSize: 13, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text1, margin: 0, fontFamily: "'Playfair Display', serif" }}>Stock Management</h1>
          <p style={{ fontSize: 13, color: T.text2, margin: "4px 0 0" }}>Monitor inventory levels and update stock quantities</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {alerts.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 8, padding: "8px 14px", color: T.danger, fontSize: 12 }}>
              ⚠ {alerts.length} pipe{alerts.length > 1 ? "s" : ""} below reorder level
            </div>
          )}
          <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 14px" }}>
            <div style={{ fontSize: 11, color: T.text3 }}>Total Stock</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.accent, fontFamily: "monospace" }}>{totalStock} bundles</div>
            <div style={{ fontSize: 10, color: T.text3 }}>{(totalStock * BUNDLE_SIZE).toLocaleString()}m total</div>
          </div>
        </div>
      </div>

      {/* Stock cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {PIPE_TYPES.map(pipe => {
          const qty  = stock[pipe] || 0;
          const cap  = CAPACITY[pipe];
          const pct  = Math.round((qty / cap) * 100);
          const col  = levelColor(pct);
          const meta = PIPE_META[pipe];
          const isCritical = qty < meta.reorder;

          return (
            <Card key={pipe} style={{ padding: "22px 24px", position: "relative", overflow: "hidden", border: isCritical ? `1px solid rgba(255,107,107,0.3)` : `1px solid ${T.border}` }}>
              {isCritical && (
                <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,107,107,0.12)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 20, padding: "2px 8px", fontSize: 10, color: T.danger, fontWeight: 700 }}>
                  REORDER
                </div>
              )}

              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.text1, marginBottom: 4 }}>{pipe}</div>
                  <div style={{ fontSize: 11, color: T.text3 }}>Crops: {meta.crop}</div>
                  <div style={{ fontSize: 11, color: T.text3 }}>Peak: {meta.season}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: col, fontFamily: "monospace" }}>{qty}</div>
                  <div style={{ fontSize: 11, color: T.text3 }}>bundles in stock</div>
                  <div style={{ fontSize: 10, color: T.text3 }}>{(qty * BUNDLE_SIZE).toLocaleString()}m total</div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: T.text2 }}>{pct}% of capacity</span>
                  <span style={{ fontSize: 11, color: col, fontWeight: 600 }}>{levelLabel(pct)}</span>
                </div>
                <div style={{ height: 8, background: T.bg3, borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: col, borderRadius: 8, transition: "width 1s ease" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: T.text3 }}>Reorder at {meta.reorder} bundles</span>
                  <span style={{ fontSize: 10, color: T.text3 }}>Max {cap} bundles</span>
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
                  style={{ flex: 1, background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", color: T.text1, fontSize: 13, fontFamily: "'Lora', serif", outline: "none" }}
                  onFocus={e => e.target.style.borderColor = T.copper}
                  onBlur={e => e.target.style.borderColor = T.border}
                />
                <button
                  onClick={() => handleUpdate(pipe)}
                  disabled={saving[pipe] || !draft[pipe]}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: saving[pipe] || !draft[pipe] ? T.bg3 : T.copper, color: saving[pipe] || !draft[pipe] ? T.text3 : "#04080F", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Lora', serif", transition: "background 0.2s", whiteSpace: "nowrap" }}
                >
                  {saving[pipe] ? "Saving…" : "Update"}
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Stock history table */}
      <Card style={{ padding: "22px 24px" }}>
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: T.text1, margin: 0 }}>Stock History (Last 5 Days)</h2>
          <p style={{ fontSize: 12, color: T.text2, margin: "4px 0 0" }}>Inventory levels in metres</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
            <thead>
              <tr>
                {["Date", ...PIPE_TYPES].map(h => (
                  <th key={h} style={{ textAlign: "left", fontSize: 11, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", paddingBottom: 10, borderBottom: `1px solid ${T.border}`, paddingRight: 16 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STOCK_HISTORY.map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: "10px 16px 10px 0", fontSize: 12, color: T.text2, borderBottom: `1px solid ${T.border}` }}>{row.date}</td>
                  {PIPE_TYPES.map(pipe => {
                    const isLow = row[pipe] < PIPE_META[pipe].reorder;
                    return (
                      <td key={pipe} style={{ padding: "10px 16px 10px 0", fontSize: 12, color: isLow ? T.danger : T.text1, fontWeight: isLow ? 700 : 400, borderBottom: `1px solid ${T.border}`, fontFamily: "monospace" }}>
                        {row[pipe].toLocaleString()}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
