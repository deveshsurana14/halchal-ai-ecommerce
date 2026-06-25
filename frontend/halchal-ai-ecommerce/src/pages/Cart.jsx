import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import API_BASE from "../config";

/* ─── Design tokens ────────────────────────────────────────────────── */
const T = {
  bg0: "#05070F", bg1: "#080D1C", bg2: "#0D1628", bg3: "#121F38",
  accent: "#00E5A0", copper: "#FFB020",
  border: "rgba(255,255,255,0.07)", borderMd: "rgba(255,255,255,0.15)",
  text1: "#EEF3FF", text2: "#7A9EC6", text3: "#3D5A7A",
};

const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,600&family=Lora:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${T.bg0}; font-family: 'Lora', Georgia, serif; color: ${T.text1}; }

  .cart-item {
    background: ${T.bg2};
    border: 1px solid ${T.border};
    border-radius: 16px;
    padding: 24px;
    transition: border-color 0.2s;
  }
  .cart-item:hover { border-color: ${T.borderMd}; }

  .qty-btn {
    width: 32px; height: 32px;
    background: ${T.bg3}; border: 1px solid ${T.border};
    color: ${T.text1}; border-radius: 8px; cursor: pointer;
    font-size: 16px; font-family: 'Lora', Georgia, serif;
    display: flex; align-items: center; justify-content: center;
    transition: border-color 0.2s, background 0.2s;
  }
  .qty-btn:hover { border-color: ${T.accent}; background: rgba(0,214,143,0.08); color: ${T.accent}; }

  .qty-input {
    width: 52px; height: 32px; text-align: center;
    background: ${T.bg3}; border: 1px solid ${T.border};
    color: ${T.text1}; border-radius: 8px;
    font-size: 14px; font-family: 'Lora', Georgia, serif;
    outline: none;
  }
  .qty-input:focus { border-color: ${T.accent}; }

  .remove-btn {
    background: transparent; border: 1px solid rgba(232,131,74,0.25);
    color: ${T.copper}; padding: 6px 14px; border-radius: 8px;
    font-size: 12px; font-family: 'Lora', Georgia, serif;
    cursor: pointer; transition: all 0.2s;
  }
  .remove-btn:hover { background: rgba(232,131,74,0.08); border-color: rgba(232,131,74,0.5); }

  .place-btn {
    width: 100%; padding: 16px;
    background: ${T.accent}; color: #04080F;
    border: none; border-radius: 12px;
    font-size: 15px; font-weight: 700; font-family: 'Lora', Georgia, serif;
    cursor: pointer; transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    letter-spacing: 0.01em;
  }
  .place-btn:hover { background: #00F0A0; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,214,143,0.28); }
  .place-btn:active { transform: translateY(0); }
  .place-btn:disabled { background: ${T.bg3}; color: ${T.text3}; cursor: not-allowed; transform: none; box-shadow: none; }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeIn 0.35s ease both; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    width: 18px; height: 18px; border: 2px solid ${T.border};
    border-top-color: ${T.accent}; border-radius: 50%;
    animation: spin 0.8s linear infinite; display: inline-block;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${T.bg1}; }
  ::-webkit-scrollbar-thumb { background: ${T.bg3}; border-radius: 3px; }
`;

/* ─── Cart icon ────────────────────────────────────────────────────── */
const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

/* ─── Category badge colour ────────────────────────────────────────── */
function categoryColor(name) {
  if (name.includes("16mm")) return { bg: "rgba(0,214,143,0.10)", color: T.accent };
  return { bg: "rgba(155,138,255,0.10)", color: "#9B8AFF" };
}

/* ─── Single cart item row ─────────────────────────────────────────── */
const CartItemRow = ({ item, onRemove, onQtyChange }) => {
  const { bg, color } = categoryColor(item.name);
  const [localQty, setLocalQty] = useState(String(item.quantity));

  const commit = (val) => {
    const n = Math.max(1, Number(val) || 1);
    setLocalQty(String(n));
    onQtyChange(item.id, n);
  };

  return (
    <div className="cart-item fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>

        {/* Left: product info */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: bg, color, padding: "3px 9px", borderRadius: 4 }}>
              {item.name.includes("Online") ? "Online" : "Inline"}
            </span>
            {item.discountPercent > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(0,214,143,0.10)", color: T.accent, padding: "2px 8px", borderRadius: 4, letterSpacing: "0.06em" }}>
                −{item.discountPercent}% BULK
              </span>
            )}
          </div>

          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: T.text1, marginBottom: 4 }}>
            {item.name}
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: T.text3 }}>📍 {item.state}</span>
            <span style={{ fontSize: 12, color: T.text3 }}>·</span>
            <span style={{ fontSize: 12, color: T.text3 }}>
              {item.season} season · {item.zone} zone
            </span>
          </div>
        </div>

        {/* Right: qty controls + remove */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button className="qty-btn"
              onClick={() => commit(item.quantity - 1)}>−</button>
            <input
              className="qty-input"
              type="number" min="1"
              value={localQty}
              onChange={e => setLocalQty(e.target.value)}
              onBlur={e => commit(e.target.value)}
              onKeyDown={e => e.key === "Enter" && commit(localQty)}
            />
            <button className="qty-btn"
              onClick={() => commit(item.quantity + 1)}>+</button>
          </div>
          <button className="remove-btn" onClick={() => onRemove(item.id)}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <TrashIcon /> Remove
            </span>
          </button>
        </div>
      </div>

      {/* Pricing breakdown */}
      <div style={{
        marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.border}`,
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12
      }}>
        <div>
          <div style={{ fontSize: 10, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
            AI Price / Coil
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text2 }}>
            ₹{item.approvedPrice?.toLocaleString("en-IN")}
          </div>
        </div>
        {item.discountPercent > 0 && (
          <div>
            <div style={{ fontSize: 10, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
              After Bulk Discount
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.accent }}>
              ₹{item.finalPrice?.toLocaleString("en-IN")} / coil
            </div>
          </div>
        )}
        <div>
          <div style={{ fontSize: 10, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
            Subtotal ({item.quantity} coils)
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text2 }}>
            ₹{item.totalExGST?.toLocaleString("en-IN")}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
            GST @ 12%
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text2 }}>
            ₹{item.totalGST?.toLocaleString("en-IN")}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
            Total (incl. GST)
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: T.accent, fontFamily: "'Playfair Display', serif" }}>
            ₹{item.totalWithGST?.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* ML insight strip */}
      {item.factors && (
        <div style={{
          marginTop: 14, display: "flex", gap: 16, flexWrap: "wrap",
          padding: "10px 14px", background: T.bg3, borderRadius: 8
        }}>
          {[
            ["Predicted Demand", `${Math.round(item.predicted_demand || 0)} units`],
            ["Demand Factor",    `×${item.factors.demand_factor?.toFixed(3)}`],
            ["Logistics",        `×${item.factors.logistics_factor?.toFixed(3)}`],
            ["Market",           `×${item.factors.market_factor?.toFixed(3)}`],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: T.text3 }}>{k}:</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.text2 }}>{v}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: T.text3 }}>Total length:</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.text2 }}>
              {((item.quantity || 0) * 300).toLocaleString("en-IN")} m
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Order result badge ───────────────────────────────────────────── */
const OrderResult = ({ name, status, message }) => (
  <div style={{
    display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px",
    background: status === "ok" ? "rgba(0,214,143,0.07)" : "rgba(232,131,74,0.07)",
    border: `1px solid ${status === "ok" ? "rgba(0,214,143,0.2)" : "rgba(232,131,74,0.2)"}`,
    borderRadius: 8, marginBottom: 8,
  }}>
    <span style={{ marginTop: 1 }}>
      {status === "ok"
        ? <CheckIcon />
        : <span style={{ color: T.copper, fontSize: 14 }}>✗</span>}
    </span>
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: status === "ok" ? T.accent : T.copper }}>{name}</div>
      <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>{message}</div>
    </div>
  </div>
);

/* ─── Cart page ────────────────────────────────────────────────────── */
const Cart = () => {
  const navigate = useNavigate();
  const {
    items, sessionId, removeFromCart, updateQuantity, clearCart,
    itemCount, grandTotalExGST, grandTotalGST, grandTotalWithGST,
  } = useCart();

  const [placing,    setPlacing]    = useState(false);
  const [results,    setResults]    = useState(null);   // array of { name, status, message }
  const [ordersDone, setOrdersDone] = useState(false);

  const handlePlaceAllOrders = async () => {
    setPlacing(true);
    setResults(null);
    const outcomes = [];
    for (const item of items) {
      try {
        const res  = await fetch(`${API_BASE}/api/orders`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pipe_type:        item.name,
            quantity:         item.quantity,
            region:           item.state,
            session_id:       sessionId,
            // Full pricing snapshot saved to Atlas
            approved_price:   item.approvedPrice,
            final_price:      item.finalPrice,
            discount_percent: item.discountPercent,
            total_ex_gst:     item.totalExGST,
            total_gst:        item.totalGST,
            total_with_gst:   item.totalWithGST,
            season:           item.season,
            zone:             item.zone,
            predicted_demand: item.predicted_demand,
          }),
        });
        const data = await res.json();
        outcomes.push({
          name:    item.name,
          status:  res.ok ? "ok" : "err",
          message: res.ok ? data.message : (data.error || "Order failed"),
        });
      } catch {
        outcomes.push({ name: item.name, status: "err", message: "Network error" });
      }
    }
    setResults(outcomes);
    setPlacing(false);
    const allOk = outcomes.every(o => o.status === "ok");
    if (allOk) { clearCart(); setOrdersDone(true); }
  };

  /* ── Empty cart ─────────────────────────────────────── */
  if (itemCount === 0 && !ordersDone) return (
    <>
      <style>{fontStyle}</style>
      <div style={{ minHeight: "100vh", background: T.bg0 }}>
        <Navbar />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: 40 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: T.bg2, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, color: T.text3 }}>
            <CartIcon />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: T.text1, marginBottom: 10 }}>
            Your cart is empty
          </h2>
          <p style={{ color: T.text2, fontSize: 15, marginBottom: 32, textAlign: "center", maxWidth: 360 }}>
            Browse our products and get AI-powered pricing tailored to your delivery state.
          </p>
          <button
            onClick={() => navigate("/products")}
            style={{ background: T.accent, color: "#04080F", border: "none", padding: "13px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700, fontFamily: "'Lora', Georgia, serif", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            Browse Products <ArrowIcon />
          </button>
        </div>
      </div>
    </>
  );

  /* ── Order success screen ───────────────────────────── */
  if (ordersDone) return (
    <>
      <style>{fontStyle}</style>
      <div style={{ minHeight: "100vh", background: T.bg0 }}>
        <Navbar />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: 40 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(0,214,143,0.10)", border: "1px solid rgba(0,214,143,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
            <span style={{ fontSize: 32 }}>✓</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: T.accent, marginBottom: 10 }}>
            Orders Placed Successfully!
          </h2>
          <p style={{ color: T.text2, fontSize: 15, marginBottom: 32, textAlign: "center", maxWidth: 400 }}>
            All your orders have been received. Large orders (100+ coils) are sent for admin approval; others are confirmed immediately.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => navigate("/products")} style={{ background: T.accent, color: "#04080F", border: "none", padding: "12px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: "'Lora', Georgia, serif", cursor: "pointer" }}>
              Continue Shopping
            </button>
            <button onClick={() => navigate("/home")} style={{ background: "transparent", border: `1px solid ${T.borderMd}`, color: T.text2, padding: "12px 28px", borderRadius: 10, fontSize: 14, fontFamily: "'Lora', Georgia, serif", cursor: "pointer" }}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );

  /* ── Main cart page ─────────────────────────────────── */
  return (
    <>
      <style>{fontStyle}</style>
      <div style={{ minHeight: "100vh", background: T.bg0 }}>

        <Navbar />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 40px 80px" }}>

          {/* Page title */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: T.text1 }}>
                Your Cart
              </h1>
              <span style={{ background: "rgba(0,214,143,0.12)", color: T.accent, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.06em" }}>
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </span>
            </div>
            <p style={{ color: T.text2, fontSize: 14 }}>
              AI-priced at time of adding · prices reflect season, demand &amp; delivery state
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32, alignItems: "start" }}>

            {/* ── Cart items ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {items.map(item => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onRemove={removeFromCart}
                  onQtyChange={updateQuantity}
                />
              ))}

              {/* Results from placing orders */}
              {results && (
                <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
                    Order Results
                  </div>
                  {results.map((r, i) => <OrderResult key={i} {...r} />)}
                  {results.some(r => r.status === "err") && (
                    <p style={{ color: T.text3, fontSize: 12, marginTop: 12 }}>
                      Some orders failed. Items remain in your cart — try again or contact support.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ── Order Summary sidebar ── */}
            <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 20, padding: 28, position: "sticky", top: 88 }}>

              <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
                Order Summary
              </div>

              {/* Per-item summary */}
              <div style={{ marginBottom: 20 }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
                      <div style={{ fontSize: 12, color: T.text2, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>
                        {item.quantity} coil{item.quantity !== 1 ? "s" : ""} · {item.state}
                      </div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.text1, flexShrink: 0 }}>
                      ₹{item.totalExGST?.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: T.text3, fontSize: 13 }}>Subtotal (ex-GST)</span>
                  <span style={{ color: T.text1, fontSize: 13, fontWeight: 600 }}>
                    ₹{grandTotalExGST.toLocaleString("en-IN")}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: T.text3, fontSize: 13 }}>GST @ 12% (HSN 3917)</span>
                  <span style={{ color: T.text2, fontSize: 13 }}>
                    ₹{grandTotalGST.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Grand total */}
              <div style={{
                background: "rgba(0,214,143,0.07)", border: "1px solid rgba(0,214,143,0.18)",
                borderRadius: 12, padding: "16px 18px", marginBottom: 24,
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div>
                  <div style={{ color: T.text1, fontSize: 13, fontWeight: 600 }}>Grand Total</div>
                  <div style={{ color: T.text3, fontSize: 10, marginTop: 2 }}>incl. 12% GST on all items</div>
                </div>
                <span style={{ color: T.accent, fontSize: 22, fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
                  ₹{grandTotalWithGST.toLocaleString("en-IN")}
                </span>
              </div>

              {/* CTA */}
              <button
                className="place-btn"
                disabled={placing}
                onClick={handlePlaceAllOrders}
              >
                {placing
                  ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <span className="spinner" /> Placing Orders...
                    </span>
                  : `Place ${itemCount > 1 ? "All " + itemCount + " Orders" : "Order"}`}
              </button>

              {/* Trust signals */}
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "GST Tax Invoice included",
                  "Orders above 100 coils routed to admin approval",
                  "Stock confirmed at time of order",
                  "Pan-India delivery from Pune/Nashik hub",
                ].map(text => (
                  <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ marginTop: 1 }}><CheckIcon /></span>
                    <span style={{ fontSize: 12, color: T.text3, lineHeight: 1.5 }}>{text}</span>
                  </div>
                ))}
              </div>

              {/* Clear cart */}
              <button
                onClick={clearCart}
                style={{ marginTop: 20, width: "100%", background: "transparent", border: `1px solid rgba(232,131,74,0.20)`, color: T.copper, padding: "9px", borderRadius: 8, fontSize: 12, fontFamily: "'Lora', Georgia, serif", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(232,131,74,0.07)"; e.currentTarget.style.borderColor = "rgba(232,131,74,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(232,131,74,0.20)"; }}
              >
                Clear Cart
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
