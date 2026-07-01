import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import productImg from "../assets/product.jpg";
import ChatBot from "../components/ChatBot";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";
import API_BASE from "../config";

/* ─── Pricing helpers ──────────────────────────────────────── */
const FALLBACK_APPROVED = {
  "16mm Inline":  1240,
  "20mm Inline":  1590,
  "16mm Online":  1410,
  "20mm Online":  1760,
};
const FALLBACK_DEMAND = {
  "16mm Inline":  724,
  "20mm Inline":  528,
  "16mm Online":  392,
  "20mm Online":  286,
};
const BASE_PRICES  = { "16mm Inline": 1050, "20mm Inline": 1350, "16mm Online": 1200, "20mm Online": 1500 };
const ZONE_LABELS  = { Z1: "Zone 1 – Maharashtra", Z2: "Zone 2 – West & Central", Z3: "Zone 3 – South India", Z4: "Zone 4 – North India", Z5: "Zone 5 – East & NE" };
const STATE_TO_ZONE = {
  Maharashtra: "Z1",
  Gujarat: "Z2", Goa: "Z2", "Madhya Pradesh": "Z2", Chhattisgarh: "Z2",
  Karnataka: "Z3", "Andhra Pradesh": "Z3", Telangana: "Z3", "Tamil Nadu": "Z3", Kerala: "Z3",
  Rajasthan: "Z4", Haryana: "Z4", Punjab: "Z4", "Uttar Pradesh": "Z4", Delhi: "Z4",
  Bihar: "Z5", "West Bengal": "Z5", Odisha: "Z5", Jharkhand: "Z5", Assam: "Z5",
};
function pipeCategory(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("20mm") && n.includes("online")) return "20mm Online";
  if (n.includes("20mm"))   return "20mm Inline";
  if (n.includes("online")) return "16mm Online";
  return "16mm Inline";
}
function currentSeason() {
  const m = new Date().getMonth() + 1;
  if (m >= 6 && m <= 9)  return "Kharif";
  if (m >= 10 || m <= 2) return "Rabi";
  return "Summer";
}
function buildAiDataFromPrice(pipeName, qty, stateName, basePerBundle) {
  const cat             = pipeCategory(pipeName);
  const quantity        = Number(qty) || 1;
  const discountFactor  = quantity >= 100 ? 0.80 : quantity >= 5 ? 0.90 : 1.00;
  const discountPercent = Number(((1 - discountFactor) * 100).toFixed(1));
  const finalPrice      = Math.round((basePerBundle * discountFactor) / 10) * 10;
  const totalExGST      = finalPrice * quantity;
  const totalGST        = Math.round(totalExGST * 0.12 * 100) / 100;
  const totalWithGST    = Math.round((totalExGST + totalGST) * 100) / 100;
  const zoneId          = STATE_TO_ZONE[stateName] || "Z1";
  return {
    approvedPrice: basePerBundle, quantity, discountPercent, finalPrice,
    gstRate: 12, totalExGST, totalGST, totalWithGST,
    predicted_demand: FALLBACK_DEMAND[cat],
    season: currentSeason(),
    base_price: BASE_PRICES[cat],
    ex_factory_price: basePerBundle,
    factors: { zone: ZONE_LABELS[zoneId] || ZONE_LABELS.Z1, adoption_index: 1.0, season_multiplier: 1.28, govt_subsidy: true },
    pipe_type: pipeName,
    state: stateName || "Maharashtra",
    zone: zoneId,
  };
}

/* ─── All Indian states / UTs ─────────────────────────────── */
const ALL_STATES = [
  "Andaman and Nicobar Islands","Andhra Pradesh","Arunachal Pradesh",
  "Assam","Bihar","Chandigarh","Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jammu & Kashmir","Jharkhand","Karnataka",
  "Kerala","Ladakh","Lakshadweep","Madhya Pradesh","Maharashtra",
  "Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Puducherry",
  "Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal",
];

const NOMINATIM_ALIASES = {
  "jammu and kashmir":               "Jammu & Kashmir",
  "uttaranchal":                     "Uttarakhand",
  "orissa":                          "Odisha",
  "pondicherry":                     "Puducherry",
  "daman and diu":                   "Dadra and Nagar Haveli and Daman and Diu",
  "dadra and nagar haveli":          "Dadra and Nagar Haveli and Daman and Diu",
  "national capital territory of delhi": "Delhi",
  "andaman and nicobar":             "Andaman and Nicobar Islands",
};

function normalize(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}
function detectStateFromGeo(address) {
  const raw = normalize(address.state || address["ISO3166-2-lvl4"] || "");
  if (!raw) return null;
  if (NOMINATIM_ALIASES[raw]) return NOMINATIM_ALIASES[raw];
  const direct = ALL_STATES.find(s => normalize(s) === raw);
  if (direct) return direct;
  return ALL_STATES.find(s => raw.includes(normalize(s)) || normalize(s).includes(raw)) || null;
}


/* ─── Icons ────────────────────────────────────────────────── */
const CartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const CheckIcon = () => {
  const T = useTheme();
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
};
const AlertIcon = () => {
  const T = useTheme();
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.amber} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
};
const PinIcon = () => {
  const T = useTheme();
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
};

/* ─── ProductDetails ───────────────────────────────────────── */
const ProductDetails = () => {
  const T              = useTheme();
  const { pipeType }   = useParams();
  const navigate       = useNavigate();
  const { addToCart }  = useCart();
  const decodedName    = decodeURIComponent(pipeType);
  const isInline       = decodedName.includes("Inline");
  const is16mm         = decodedName.includes("16mm");
  const coilLength     = is16mm ? 400 : 200;

  const css = `
    .select-field, .qty-input {
      width: 100%;
      background: ${T.bg3};
      border: 1px solid ${T.border};
      color: ${T.text1};
      padding: 11px 14px;
      border-radius: 9px;
      font-size: 14px;
      font-family: ${T.font};
      outline: none;
      transition: border-color 0.2s;
      appearance: none;
      -webkit-appearance: none;
    }
    .select-field:focus, .qty-input:focus { border-color: rgba(34,197,94,0.4); }
    .select-field option { background: ${T.bg3}; }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner {
      width: 20px; height: 20px;
      border: 2px solid ${T.border};
      border-top-color: ${T.green};
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
      margin: 0 auto 12px;
    }

    @keyframes pulseDot2 { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
    .pulse-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: ${T.green};
      animation: pulseDot2 1.4s ease-in-out infinite;
      display: inline-block; flex-shrink: 0;
    }

    @keyframes toastIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
    .toast-msg {
      animation: toastIn 0.25s ease both;
      position: fixed; top: 80px; right: 24px; z-index: 9999;
      padding: 11px 18px; border-radius: 10px;
      font-family: ${T.font}; font-size: 14px; font-weight: 600;
      backdrop-filter: blur(16px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1.1fr;
      gap: 48px;
      align-items: start;
    }
    @media (max-width: 900px) {
      .detail-grid { grid-template-columns: 1fr !important; }
    }
  `;

  const [quantity,   setQuantity]   = useState(1);
  const [state,      setState]      = useState("Maharashtra");
  const [detecting,  setDetecting]  = useState(true);
  const [overriding, setOverriding] = useState(false);
  const [geoStatus,  setGeoStatus]  = useState("detecting");
  const [toast,      setToast]      = useState(null);
  const [aiData,     setAiData]     = useState(null);
  const [loading,    setLoading]    = useState(false);

  /* Geolocation on mount */
  useEffect(() => {
    if (!navigator.geolocation) { setDetecting(false); setGeoStatus("denied"); return; }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, { headers: { "Accept-Language": "en-US,en" } });
          const data = await res.json();
          const detected = detectStateFromGeo(data.address || {});
          if (detected) { setState(detected); setGeoStatus("found"); }
          else            setGeoStatus("outside");
        } catch { setGeoStatus("outside"); }
        finally  { setDetecting(false); }
      },
      () => { setDetecting(false); setGeoStatus("denied"); },
      { timeout: 8000 }
    );
  }, []);

  /* Fetch price — checks admin-approved first, then ML API with 10s fallback */
  const fetchPrice = useCallback(async () => {
    setLoading(true);
    setAiData(null);

    const cat    = pipeCategory(decodedName);
    const zoneId = STATE_TO_ZONE[state] || "Z1";

    // 1. Check if admin approved a price for this pipe + zone this month
    try {
      const ctrl = new AbortController();
      const tmr  = setTimeout(() => ctrl.abort(), 3000);
      const approvedRes  = await fetch(
        `${API_BASE}/api/approved-prices/current?pipe_type=${encodeURIComponent(cat)}&zone=${zoneId}`,
        { signal: ctrl.signal }
      );
      clearTimeout(tmr);
      const approvedData = await approvedRes.json();
      if (approvedData.approved && approvedData.price) {
        setAiData(buildAiDataFromPrice(decodedName, quantity, state, approvedData.price));
        setLoading(false);
        return;
      }
    } catch {}

    // 2. ML API with 10s timeout → pre-set fallback
    const controller = new AbortController();
    let settled = false;

    const finish = (data) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      setAiData(data);
      setLoading(false);
    };

    const timer = setTimeout(() => {
      finish(buildAiDataFromPrice(decodedName, quantity, state, FALLBACK_APPROVED[cat]));
      controller.abort();
    }, 10000);

    try {
      const res  = await fetch(`${API_BASE}/api/ai-price`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ pipe_type: decodedName, quantity: Number(quantity), state }),
        signal:  controller.signal,
      });
      const data = await res.json();
      finish(res.ok && data.finalPrice ? data : buildAiDataFromPrice(decodedName, quantity, state, FALLBACK_APPROVED[cat]));
    } catch {
      finish(buildAiDataFromPrice(decodedName, quantity, state, FALLBACK_APPROVED[cat]));
    }
  }, [decodedName, state, quantity]);

  useEffect(() => { if (!detecting) fetchPrice(); }, [detecting, fetchPrice]);

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2800);
  };

  const buildCartItem = () => ({
    id:               `${decodedName}__${state}`,
    name:             decodedName,
    state,
    quantity:         Number(quantity),
    approvedPrice:    aiData.approvedPrice,
    finalPrice:       aiData.finalPrice,
    discountPercent:  aiData.discountPercent,
    totalExGST:       aiData.totalExGST,
    totalGST:         aiData.totalGST,
    totalWithGST:     aiData.totalWithGST,
    gstRate:          12,
    season:           aiData.season,
    zone:             aiData.zone,
    predicted_demand: aiData.predicted_demand,
    factors:          aiData.factors,
  });

  const handleAddToCart = () => {
    if (!aiData) { showToast("AI price unavailable — check backend.", "error"); return; }
    addToCart(buildCartItem());
    showToast(`${decodedName} added to cart`);
  };

  const handleBuyNow = () => {
    if (!aiData) { showToast("AI price unavailable — check backend.", "error"); return; }
    addToCart(buildCartItem());
    navigate("/cart");
  };

  const canAct = !!aiData && !loading && !detecting;

  /* ── State selector sub-component ── */
  const StateSelector = () => {
    if (overriding) return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <label style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: T.font }}>
            Select state / UT
          </label>
          <button onClick={() => setOverriding(false)} style={{ fontSize: 12, color: T.green, background: "none", border: "none", cursor: "pointer", fontFamily: T.font, fontWeight: 600 }}>
            Cancel
          </button>
        </div>
        <select
          className="select-field"
          value={state}
          onChange={e => { setState(e.target.value); setOverriding(false); }}>
          {ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    );

    return (
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 11, color: T.text3, fontWeight: 700, display: "block", marginBottom: 8, letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: T.font }}>
          Delivery state
        </label>
        <div style={{ background: T.bg3, border: `1px solid ${detecting ? T.greenBd : T.border}`, borderRadius: 9, padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          {detecting ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="pulse-dot" />
              <span style={{ color: T.text2, fontSize: 13, fontFamily: T.font }}>Detecting your location…</span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "flex", flexShrink: 0 }}><PinIcon /></span>
              <div>
                <div style={{ color: T.text1, fontSize: 14, fontWeight: 600, fontFamily: T.font }}>{state}</div>
                <div style={{ color: T.text3, fontSize: 11, marginTop: 2, fontFamily: T.font }}>
                  {geoStatus === "found"  ? "Auto-detected · nationwide pricing" :
                   geoStatus === "denied" ? "Location access denied · default" :
                                            "Outside detected area · default"}
                </div>
              </div>
            </div>
          )}
          {!detecting && (
            <button onClick={() => setOverriding(true)} style={{ fontSize: 12, color: T.green, background: "none", border: "none", cursor: "pointer", fontFamily: T.font, fontWeight: 600, flexShrink: 0 }}>
              Change
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: T.bg0, color: T.text1 }}>

        {/* Toast */}
        {toast && (
          <div className="toast-msg" style={{
            background: toast.type === "success" ? "rgba(34,197,94,0.94)" : "rgba(245,158,11,0.94)",
            color: "#04080F",
          }}>
            {toast.type === "success" ? "Added to cart" : toast.text}
          </div>
        )}

        <Navbar />

        <div className="m-page-pad" style={{ maxWidth: 1160, margin: "0 auto", padding: "40px 40px 88px" }}>

          {/* Back breadcrumb */}
          <button
            onClick={() => navigate("/products")}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: T.text3, fontFamily: T.font, background: "none", border: "none", cursor: "pointer", padding: "0 0 32px", transition: "color 0.2s", fontWeight: 500 }}
            onMouseEnter={e => e.currentTarget.style.color = T.text2}
            onMouseLeave={e => e.currentTarget.style.color = T.text3}>
            <BackIcon /> All products
          </button>

          <div className="detail-grid">

            {/* ── LEFT: Product info ─────────────────── */}
            <div>
              <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 28, border: `1px solid ${T.border}` }}>
                <img src={productImg} alt={decodedName} style={{ width: "100%", height: 360, objectFit: "cover", display: "block" }} />
              </div>

              <h1 style={{ fontFamily: T.font, fontSize: "clamp(22px,3vw,30px)", fontWeight: 800, color: T.text1, marginBottom: 16, lineHeight: 1.2, letterSpacing: "-0.025em" }}>
                {decodedName}
              </h1>

              <div style={{ display: "flex", gap: 7, marginBottom: 22, flexWrap: "wrap" }}>
                {[
                  [isInline ? "Inline" : "Online", T.green,   T.greenBg, T.greenBd],
                  [is16mm   ? "16mm"   : "20mm",   T.text2,   "rgba(255,255,255,0.05)", T.border],
                  [`${coilLength}m / coil`,         T.amber,   T.amberBg, T.amberBd],
                  ["HDPE · UV Stabilised",          T.text3,   "rgba(255,255,255,0.04)", T.border],
                ].map(([label, color, bg, bd]) => (
                  <span key={label} style={{ background: bg, color, border: `1px solid ${bd}`, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 5, letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: T.font }}>
                    {label}
                  </span>
                ))}
              </div>

              <p style={{ color: T.text2, lineHeight: 1.8, fontSize: 14, fontFamily: T.font, marginBottom: 28 }}>
                Precision-engineered for consistent water distribution in drip irrigation systems. BIS-certified, rated for 5+ seasons of field use under normal Indian conditions.
              </p>

              {/* Specs table */}
              <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: "12px 18px", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: T.font }}>
                    Specifications
                  </span>
                </div>
                {[
                  ["Type",          isInline ? "Inline drip" : "Online drip"],
                  ["Diameter",      is16mm ? "16mm" : "20mm"],
                  ["Coil length",   `${coilLength} metres`],
                  ["Material",      "HDPE (UV-stabilised)"],
                  ["Certification", "BIS Mark · ISO 9001:2015"],
                  ["GST code",      "HSN 3917 · 12% GST"],
                ].map(([k, v], i, arr) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none" }}>
                    <span style={{ color: T.text3, fontSize: 13, fontFamily: T.font }}>{k}</span>
                    <span style={{ color: T.text1, fontSize: 13, fontWeight: 600, fontFamily: T.font }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Pricing panel ───────────────── */}
            <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 20, padding: "28px", position: "sticky", top: 80 }}>

              {/* Panel header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${T.border}` }}>
                <span style={{ width: 7, height: 7, background: T.green, borderRadius: "50%", animation: "pulseDot2 2s ease-in-out infinite", flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: T.green, letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: T.font }}>
                  AI Pricing Engine
                </span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: T.text3, fontFamily: T.font }}>Pan-India</span>
              </div>

              {/* State selector */}
              <StateSelector />

              {/* Quantity */}
              <label style={{ fontSize: 11, color: T.text3, fontWeight: 700, display: "block", marginBottom: 8, letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: T.font }}>
                Quantity (coils)
              </label>
              <input
                type="number" min="1" value={quantity}
                onChange={e => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="qty-input"
                style={{ marginBottom: 14 }}
                aria-label="Number of coils"
              />

              {/* Total length */}
              <div style={{ background: T.bg0, border: `1px solid ${T.border}`, borderRadius: 8, padding: "11px 14px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: T.text3, fontSize: 13, fontFamily: T.font }}>Total pipe length</span>
                <span style={{ color: T.text1, fontSize: 13, fontWeight: 700, fontFamily: T.font }}>
                  {(quantity * coilLength).toLocaleString("en-IN")} m
                </span>
              </div>

              {/* Price breakdown */}
              {detecting || loading ? (
                <div style={{ background: T.bg0, borderRadius: 14, padding: "32px 20px", textAlign: "center", marginBottom: 20, border: `1px solid ${T.border}` }}>
                  <div className="spinner" />
                  <div style={{ color: T.green, fontSize: 13, fontFamily: T.font, fontWeight: 600, marginBottom: 4 }}>
                    {detecting ? "Detecting your location…" : "Calculating AI price…"}
                  </div>
                  <div style={{ color: T.text3, fontSize: 12, fontFamily: T.font }}>
                    {detecting ? "Fetching state for accurate pricing" : "Analysing demand, season & zone factors"}
                  </div>
                </div>
              ) : aiData ? (
                <div style={{ background: T.bg0, border: `1px solid ${T.greenBd}`, borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
                  {/* Price summary */}
                  <div style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ color: T.text3, fontSize: 12, fontFamily: T.font }}>AI price / coil</span>
                      <span style={{ color: T.text1, fontSize: 13, fontWeight: 700, fontFamily: T.font }}>₹{aiData.approvedPrice?.toLocaleString("en-IN")}</span>
                    </div>

                    {aiData.discountPercent > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ color: T.green, fontSize: 12, fontFamily: T.font, fontWeight: 600 }}>Bulk discount −{aiData.discountPercent}%</span>
                        <span style={{ color: T.green, fontSize: 12, fontWeight: 700, fontFamily: T.font }}>₹{aiData.finalPrice?.toLocaleString("en-IN")} / coil</span>
                      </div>
                    )}

                    <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 12, paddingTop: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ color: T.text3, fontSize: 12, fontFamily: T.font }}>
                          Subtotal ({quantity} × ₹{aiData.finalPrice?.toLocaleString("en-IN")})
                        </span>
                        <span style={{ color: T.text2, fontSize: 12, fontFamily: T.font }}>₹{aiData.totalExGST?.toLocaleString("en-IN")}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                        <span style={{ color: T.text3, fontSize: 12, fontFamily: T.font }}>GST @ 12% (HSN 3917)</span>
                        <span style={{ color: T.text2, fontSize: 12, fontFamily: T.font }}>₹{aiData.totalGST?.toLocaleString("en-IN")}</span>
                      </div>

                      <div style={{ background: T.greenBg, border: `1px solid ${T.greenBd}`, borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ color: T.text1, fontSize: 13, fontWeight: 700, fontFamily: T.font }}>Total payable</div>
                          <div style={{ color: T.text3, fontSize: 10, marginTop: 2, fontFamily: T.font }}>incl. 12% GST</div>
                        </div>
                        <span style={{ color: T.green, fontSize: 26, fontWeight: 800, fontFamily: T.font, letterSpacing: "-0.025em" }}>
                          ₹{aiData.totalWithGST?.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: T.bg0, borderRadius: 14, padding: "22px 18px", textAlign: "center", marginBottom: 20, border: `1px solid ${T.amberBd}` }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><AlertIcon /></div>
                  <div style={{ color: T.amber, fontSize: 13, fontFamily: T.font, fontWeight: 600, marginBottom: 4 }}>Price unavailable</div>
                  <div style={{ color: T.text3, fontSize: 12, fontFamily: T.font }}>Make sure the backend and ML API are running</div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <button
                  onClick={handleAddToCart}
                  disabled={!canAct}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "transparent", color: canAct ? T.green : T.text3, border: `1.5px solid ${canAct ? T.greenBd : T.border}`, padding: "13px 10px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: T.font, cursor: canAct ? "pointer" : "not-allowed", transition: "background 0.2s, border-color 0.2s" }}
                  onMouseEnter={e => { if (canAct) { e.currentTarget.style.background = T.greenBg; e.currentTarget.style.borderColor = T.green; } }}
                  onMouseLeave={e => { if (canAct) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.greenBd; } }}>
                  <CartIcon /> Add to cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!canAct}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: canAct ? T.green : T.bg3, color: canAct ? "#04080F" : T.text3, border: "none", padding: "13px 10px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: T.font, cursor: canAct ? "pointer" : "not-allowed", transition: "background 0.2s" }}
                  onMouseEnter={e => { if (canAct) e.currentTarget.style.background = T.greenLt; }}
                  onMouseLeave={e => { if (canAct) e.currentTarget.style.background = T.green; }}>
                  {detecting ? "Detecting…" : loading ? "Calculating…" : aiData ? <><span>Buy now</span><ArrowIcon /></> : "Unavailable"}
                </button>
              </div>

              {/* Trust signals */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "No account needed to see price",
                  "GST invoice downloadable instantly",
                  "Bulk discounts applied automatically",
                ].map(line => (
                  <div key={line} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckIcon />
                    <span style={{ fontSize: 12, color: T.text3, fontFamily: T.font }}>{line}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        <ChatBot />
      </div>
    </>
  );
};

export default ProductDetails;
