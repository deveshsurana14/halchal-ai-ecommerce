import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import productImg from "../assets/product.jpg";
import bgImg from "../bg.jpg";
import ChatBot from "../components/ChatBot";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";

/* ─── SVG Icons ─────────────────────────────────────────────── */
const Ic = {
  Arrow: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Check: ({ size = 14, color }) => {
    const T = useTheme();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || T.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    );
  },
  ChevDown: ({ open }) => {
    const T = useTheme();
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.25s" }}>
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    );
  },
  Star: () => {
    const T = useTheme();
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill={T.amber} stroke={T.amber} strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    );
  },
  Map: () => {
    const T = useTheme();
    return (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    );
  },
  TrendUp: () => {
    const T = useTheme();
    return (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    );
  },
  Eye: () => {
    const T = useTheme();
    return (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    );
  },
  Layers: () => {
    const T = useTheme();
    return (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
      </svg>
    );
  },
  Receipt: () => {
    const T = useTheme();
    return (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={T.amber} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 6 2 18 2 18 9"/>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
        <rect x="6" y="14" width="12" height="8"/>
      </svg>
    );
  },
  Package: () => {
    const T = useTheme();
    return (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={T.amber} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    );
  },
  AlertTriangle: () => {
    const T = useTheme();
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    );
  },
  Quote: () => {
    const T = useTheme();
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill={T.green + "20"} stroke={T.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
      </svg>
    );
  },
  Cpu: () => {
    const T = useTheme();
    return (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
        <rect x="9" y="9" width="6" height="6"/>
        <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
        <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
        <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
        <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
      </svg>
    );
  },
};

/* ─── Shared primitives ─────────────────────────────────────── */
const Eyebrow = ({ children, color }) => {
  const T = useTheme();
  return (
    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: color || T.text3, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 14, fontFamily: T.font }}>
      {children}
    </span>
  );
};

const SectionHeading = ({ children, style = {} }) => {
  const T = useTheme();
  return (
    <h2 style={{ fontFamily: T.font, fontSize: "clamp(26px,3.5vw,38px)", fontWeight: 800, color: T.text1, lineHeight: 1.15, letterSpacing: "-0.025em", ...style }}>
      {children}
    </h2>
  );
};

const Btn = ({ children, onClick, variant = "primary", size = "md", style: extra = {} }) => {
  const T = useTheme();
  const base = {
    display: "inline-flex", alignItems: "center", gap: 8,
    fontFamily: T.font, fontWeight: 700, border: "none",
    cursor: "pointer", borderRadius: 10, letterSpacing: "-0.01em",
    transition: "background 0.2s, border-color 0.2s, transform 0.15s",
    whiteSpace: "nowrap",
    ...(size === "md" ? { fontSize: 14, padding: "11px 22px" } : { fontSize: 15, padding: "13px 28px" }),
  };
  const variants = {
    primary: { background: T.green, color: "#04080F", border: "none" },
    ghost:   { background: "transparent", color: T.text1, border: `1.5px solid ${T.borderH}` },
    outline: { background: "transparent", color: T.green, border: `1.5px solid ${T.greenBd}` },
  };
  return (
    <button
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...extra }}
      onMouseEnter={e => {
        if (variant === "primary") { e.currentTarget.style.background = T.greenLt; e.currentTarget.style.transform = "translateY(-2px)"; }
        if (variant === "ghost")   { e.currentTarget.style.borderColor = T.green + "50"; e.currentTarget.style.background = T.greenBg; e.currentTarget.style.transform = "translateY(-1px)"; }
        if (variant === "outline") { e.currentTarget.style.background = T.greenBg; e.currentTarget.style.borderColor = T.green; }
      }}
      onMouseLeave={e => {
        if (variant === "primary") { e.currentTarget.style.background = T.green; e.currentTarget.style.transform = "translateY(0)"; }
        if (variant === "ghost")   { e.currentTarget.style.borderColor = T.borderH; e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }
        if (variant === "outline") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.greenBd; }
      }}>
      {children}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 1 — HERO
═══════════════════════════════════════════════════════════════ */
const Hero = ({ onShop }) => {
  const T = useTheme();
  return (
    <div style={{ position: "relative", overflow: "hidden", background: T.bg0 }}>
      {/* Background image — faded and integrated */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${bgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: T.isDark ? 0.18 : 0.26,
      }} />
      {/* Edge fade overlays — blend image into page bg */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(180deg, ${T.bg0} 0%, transparent 12%, transparent 88%, ${T.bg0} 100%)`,
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(90deg, ${T.bg0} 0%, transparent 8%, transparent 92%, ${T.bg0} 100%)`,
      }} />
      {/* Subtle dot-grid texture on top of image */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`, backgroundSize: "32px 32px", pointerEvents: "none" }} />
      {/* Single soft green glow */}
      <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: "50%", height: "50%", background: "radial-gradient(ellipse, rgba(34,197,94,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div className="m-hero-pad" style={{ position: "relative", maxWidth: 860, margin: "0 auto", padding: "108px 40px 100px", textAlign: "center" }}>

        {/* Status chip */}
        <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.greenBg, border: `1px solid ${T.greenBd}`, borderRadius: 100, padding: "5px 14px 5px 10px", marginBottom: 36 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, animation: "pulseDot 2s ease-in-out infinite", flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: T.green, letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: T.font }}>
            AI Pricing Engine · Live
          </span>
        </div>

        {/* Headline */}
        <h1 className="fade-up-1" style={{ fontFamily: T.font, fontSize: "clamp(38px,6vw,66px)", fontWeight: 800, lineHeight: 1.07, color: T.text1, marginBottom: 26, letterSpacing: "-0.03em" }}>
          Buy drip pipes at prices<br />
          <span style={{ color: T.green }}>that fit your farm.</span>
        </h1>

        {/* Subheadline */}
        <p className="fade-up-2" style={{ fontSize: "clamp(15px,2vw,18px)", color: T.text2, lineHeight: 1.72, maxWidth: 530, margin: "0 auto 44px", fontFamily: T.font, fontWeight: 400 }}>
          Halchal's ML model prices 16mm and 20mm drip pipes based on your state, crop, and order size — not a uniform MRP your supplier decides.
        </p>

        {/* CTAs */}
        <div className="fade-up-3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn onClick={onShop} size="lg">
            Calculate your price <Ic.Arrow size={15} />
          </Btn>
          <Btn
            variant="ghost" size="lg"
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
            See how it works
          </Btn>
        </div>

        {/* Stats strip */}
        <div className="fade-up-4" style={{ display: "flex", justifyContent: "center", gap: 0, marginTop: 68, paddingTop: 36, borderTop: `1px solid ${T.border}`, flexWrap: "wrap" }}>
          {[
            ["1,400+",  "Active farmers"],
            ["18",      "States covered"],
            ["₹200–300", "Saved per coil vs. market"],
            ["4.8 / 5", "Customer rating"],
          ].map(([num, label], i, arr) => (
            <div key={label} style={{ textAlign: "center", minWidth: 130, padding: "0 28px", borderRight: i < arr.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ fontFamily: T.font, fontSize: 26, fontWeight: 800, color: T.text1, lineHeight: 1, letterSpacing: "-0.025em" }}>{num}</div>
              <div style={{ fontSize: 12, color: T.text3, fontWeight: 500, marginTop: 7, letterSpacing: "0.02em" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 3 — PROBLEM
═══════════════════════════════════════════════════════════════ */
const ProblemSection = () => {
  const T = useTheme();
  return (
    <section className="m-section" style={{ padding: "88px 40px", background: T.bg0 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="scroll-reveal" style={{ maxWidth: 540, marginBottom: 52 }}>
          <Eyebrow color={T.red + "BB"}>The problem</Eyebrow>
          <SectionHeading style={{ marginBottom: 16 }}>Pipe pricing in India is broken.</SectionHeading>
          <p style={{ color: T.text2, fontSize: 16, lineHeight: 1.72, fontFamily: T.font }}>
            If you've called three distributors for the same pipe and got three different quotes, you already know this.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
          {[
            {
              title: "Market rates vary 25–40% by district",
              desc:  "The same 16mm inline pipe costs ₹480 near the factory and ₹640 further away. Distributors set prices based on relationships and proximity — not actual cost data.",
            },
            {
              title: "No way to verify you're paying fairly",
              desc:  "Without a benchmark, the first price you hear becomes your reference. You're negotiating without knowing whether the number is fair to begin with.",
            },
            {
              title: "Seasonal demand isn't reflected in price",
              desc:  "A contractor buying 50 coils before Kharif pays the same rate as someone buying 5 coils in November off-season. That's not how supply and demand works.",
            },
          ].map(({ title, desc }, i) => (
            <div key={title} className={`problem-card scroll-reveal sr-d${i + 1}`}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: T.redBg, border: `1px solid ${T.redBd}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <Ic.AlertTriangle />
                </div>
                <h3 style={{ fontFamily: T.font, fontSize: 15, fontWeight: 700, color: T.text1, lineHeight: 1.35, paddingTop: 7 }}>{title}</h3>
              </div>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.75, fontFamily: T.font, paddingLeft: 52 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 4 — SOLUTION
═══════════════════════════════════════════════════════════════ */
const SolutionSection = ({ onShop }) => {
  const T = useTheme();
  return (
    <section className="m-section" style={{ padding: "88px 40px", background: T.bg1, borderTop: `1px solid ${T.border}` }}>
      <div className="solution-grid" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
        <div className="scroll-reveal">
          <Eyebrow color={T.green}>The fix</Eyebrow>
          <SectionHeading style={{ marginBottom: 20 }}>
            Pricing that reads the market — not a rate card.
          </SectionHeading>
          <p style={{ color: T.text2, fontSize: 16, lineHeight: 1.75, fontFamily: T.font, marginBottom: 14 }}>
            Halchal's Random Forest model is trained on 3 years of drip pipe sales across Kharif, Rabi, and Zaid seasons. It factors in your state's agri zone, seasonal demand curves, competitor activity, and your order size.
          </p>
          <p style={{ color: T.text2, fontSize: 16, lineHeight: 1.75, fontFamily: T.font, marginBottom: 34 }}>
            The result is a price that makes sense for your situation — and every factor that went into it is visible to you.
          </p>
          <Btn onClick={onShop}>Try the pricing engine <Ic.Arrow size={14} /></Btn>
        </div>

        {/* Live breakdown mockup */}
        <div className="scroll-reveal sr-d2" style={{ background: T.bg0, border: `1px solid ${T.border}`, borderRadius: 20, padding: "28px", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.text3, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: T.font, marginBottom: 4 }}>Live price breakdown</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text2, fontFamily: T.font }}>Maharashtra · Kharif · 50 coils</div>
            </div>
            <span style={{ background: T.greenBg, border: `1px solid ${T.greenBd}`, borderRadius: 100, padding: "3px 10px", fontSize: 10, fontWeight: 700, color: T.green, letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: T.font }}>Live</span>
          </div>

          <div style={{ fontSize: 18, fontWeight: 800, color: T.text1, fontFamily: T.font, marginBottom: 22, letterSpacing: "-0.02em" }}>
            16mm Inline Drip Pipe
          </div>

          {[
            { label: "Seasonal demand factor",  val: "1.12×", note: "Pre-Kharif surge", color: T.green },
            { label: "Zone logistics factor",    val: "0.97×", note: "Shirur, Pune",      color: T.amber },
            { label: "Market adoption factor",   val: "1.03×", note: "Vidarbha-adjacent", color: T.green },
            { label: "Bulk discount (50 coils)", val: "−10%",  note: "5+ coil tier",      color: T.green },
          ].map(({ label, val, note, color }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${T.border}`, fontFamily: T.font }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.text2 }}>{label}</div>
                <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{note}</div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: T.font }}>{val}</span>
            </div>
          ))}

          <div style={{ background: T.greenBg, border: `1px solid ${T.greenBd}`, borderRadius: 10, padding: "16px", marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: T.green, fontWeight: 700, fontFamily: T.font, marginBottom: 3 }}>Your price (ex-GST)</div>
              <div style={{ fontSize: 11, color: T.text3, fontFamily: T.font }}>+12% GST (HSN 3917) applied at checkout</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: T.text1, fontFamily: T.font, letterSpacing: "-0.025em" }}>₹1,060<span style={{ fontSize: 13, fontWeight: 500, color: T.text3 }}>/coil</span></div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 5 — FEATURES
═══════════════════════════════════════════════════════════════ */
const FeaturesSection = () => {
  const T = useTheme();
  const features = [
    { icon: <Ic.Map />,      color: T.green, bg: T.greenBg, bd: T.greenBd, title: "Zone-aware pricing",          desc: "Vidarbha cotton and Konkan vegetable growers don't pay the same logistics rate. Your delivery zone across all 36 states is priced accordingly." },
    { icon: <Ic.TrendUp />,  color: T.green, bg: T.greenBg, bd: T.greenBd, title: "Seasonal demand model",       desc: "ML trained on 3 seasons of real sales data. Prices reflect actual Kharif, Rabi, and Zaid demand curves — not a static yearly rate card." },
    { icon: <Ic.Eye />,      color: T.green, bg: T.greenBg, bd: T.greenBd, title: "Full factor transparency",    desc: "See the four factors driving your price: demand, competitor activity, logistics, and market adoption. No hidden markups." },
    { icon: <Ic.Layers />,   color: T.green, bg: T.greenBg, bd: T.greenBd, title: "Bulk discount calculator",   desc: "Automatic tier pricing from 5 coils to 500+. Know your exact price break before you commit to any order size." },
    { icon: <Ic.Receipt />,  color: T.amber, bg: T.amberBg, bd: T.amberBd, title: "GST-ready billing",          desc: "12% GST under HSN 3917 is auto-calculated. Download a complete tax invoice immediately after placing your order." },
    { icon: <Ic.Package />,  color: T.amber, bg: T.amberBg, bd: T.amberBd, title: "Complete pipe range",        desc: "16mm and 20mm, inline and online emitters. All variants stocked at our Pune factory, year-round." },
  ];
  return (
    <section id="features" className="m-section" style={{ padding: "88px 40px", background: T.bg0 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="scroll-reveal" style={{ textAlign: "center", marginBottom: 60 }}>
          <Eyebrow>What Halchal does</Eyebrow>
          <SectionHeading>Built for how drip irrigation<br />actually works.</SectionHeading>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
          {features.map(({ icon, bg, bd, title, desc }, i) => (
            <div key={title} className={`feat-card scroll-reveal sr-d${(i % 3) + 1}`}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: bg, border: `1px solid ${bd}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                {icon}
              </div>
              <h3 style={{ fontFamily: T.font, fontSize: 15, fontWeight: 700, color: T.text1, marginBottom: 10, lineHeight: 1.35 }}>{title}</h3>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.75, fontFamily: T.font }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 6 — HOW IT WORKS
═══════════════════════════════════════════════════════════════ */
const HowItWorks = () => {
  const T = useTheme();
  return (
    <section id="how-it-works" className="m-section" style={{ padding: "88px 40px", background: T.bg1, borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
        <div className="scroll-reveal" style={{ marginBottom: 60 }}>
          <Eyebrow>How it works</Eyebrow>
          <SectionHeading style={{ marginBottom: 16 }}>Three inputs. One transparent price.</SectionHeading>
          <p style={{ fontSize: 16, color: T.text2, lineHeight: 1.7, fontFamily: T.font, maxWidth: 460, margin: "0 auto" }}>
            The pricing engine runs in under 2 seconds. No account needed to see your price.
          </p>
        </div>

        <div className="m-2col" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 36 }}>
          {[
            { step: "01", title: "Pick your state and crop", desc: "We auto-detect your location via GPS or let you choose manually. This sets your agri zone and logistics cost baseline." },
            { step: "02", title: "Enter your quantity",       desc: "How many coils you need — from a single coil to a 500+ project order. Volume discounts apply in real time." },
            { step: "03", title: "Add to cart and pay",        desc: "Review your AI price, apply bulk discount if eligible, and pay securely via Razorpay. GST invoice generated instantly." },
          ].map(({ step, title, desc }, i) => (
            <div key={step} className={`scroll-reveal sr-d${i + 1}`} style={{ position: "relative" }}>
              {i < 2 && <div className="step-connector" />}
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.bg0, border: `2px solid ${T.green}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", boxShadow: `0 0 0 5px ${T.bg1}, 0 0 0 6px ${T.greenBd}` }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: T.green, fontFamily: T.font }}>{step}</span>
              </div>
              <h3 style={{ fontFamily: T.font, fontSize: 15, fontWeight: 700, color: T.text1, marginBottom: 10, lineHeight: 1.35 }}>{title}</h3>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.75, fontFamily: T.font }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 7 — PRODUCT PREVIEW
═══════════════════════════════════════════════════════════════ */
const ProductsPreview = ({ navigate, sectionRef }) => {
  const T = useTheme();
  const products = [
    { name: "16mm Inline Drip Pipe", category: "Inline emitter · 400m coil",  badge: "Best seller", pipeType: "Premium 16mm Inline" },
    { name: "20mm Inline Drip Pipe", category: "Inline emitter · 200m coil",  badge: "Popular",     pipeType: "Premium 20mm Inline" },
    { name: "16mm Online Drip Pipe", category: "Online emitter · 400m coil",  badge: "Top pick",    pipeType: "Supreme 16mm Online" },
    { name: "20mm Online Drip Pipe", category: "Online emitter · 200m coil",  badge: null,           pipeType: "Shakti 20mm Inline"  },
  ];
  return (
    <section ref={sectionRef} id="products" className="m-section" style={{ padding: "88px 40px", background: T.bg0 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="scroll-reveal" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
          <div>
            <Eyebrow>Our products</Eyebrow>
            <SectionHeading>All sizes. All variants.</SectionHeading>
          </div>
          <Btn variant="outline" onClick={() => navigate("/products")}>
            Browse all <Ic.Arrow size={14} />
          </Btn>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
          {products.map((p, i) => (
            <div key={i} className="product-card" onClick={() => navigate(`/product/${encodeURIComponent(p.pipeType)}`)}>
              <div style={{ position: "relative", overflow: "hidden" }}>
                <img src={productImg} alt={p.name} className="card-img" />
                {p.badge && (
                  <span style={{ position: "absolute", top: 10, left: 10, background: "rgba(7,12,23,0.85)", border: `1px solid ${T.greenBd}`, backdropFilter: "blur(8px)", borderRadius: 5, padding: "3px 9px", fontSize: 10, fontWeight: 700, color: T.green, letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: T.font }}>
                    {p.badge}
                  </span>
                )}
              </div>
              <div style={{ padding: "18px" }}>
                <div style={{ fontSize: 11, color: T.text3, fontFamily: T.font, marginBottom: 6, letterSpacing: "0.02em" }}>{p.category}</div>
                <h4 style={{ fontFamily: T.font, fontSize: 15, fontWeight: 700, color: T.text1, marginBottom: 14, lineHeight: 1.3 }}>{p.name}</h4>
                <div style={{ background: T.greenBg, border: `1px solid ${T.greenBd}`, borderRadius: 8, padding: "9px 12px", marginBottom: 13, textAlign: "center" }}>
                  <span style={{ fontSize: 12, color: T.green, fontWeight: 600, fontFamily: T.font }}>Get AI price for your state</span>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/product/${encodeURIComponent(p.pipeType)}`); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: T.green, color: "#04080F", fontFamily: T.font, fontSize: 13, fontWeight: 700, padding: "10px", border: "none", borderRadius: 8, cursor: "pointer", transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = T.greenLt}
                  onMouseLeave={e => e.currentTarget.style.background = T.green}>
                  Calculate price <Ic.Arrow size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 8 — BENEFITS
═══════════════════════════════════════════════════════════════ */
const BenefitsSection = () => {
  const T = useTheme();
  return (
    <section className="m-section" style={{ padding: "88px 40px", background: T.bg1, borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="scroll-reveal" style={{ background: T.bg0, border: `1px solid ${T.border}`, borderRadius: 20, padding: "52px 48px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32 }}>
          {[
            { val: "1,400+",  label: "Farmers trust Halchal",  color: T.green },
            { val: "₹5Cr+",   label: "Worth of pipes sold",    color: T.amber },
            { val: "99.2%",   label: "On-time delivery rate",  color: T.green },
            { val: "28",      label: "States covered by 2025", color: T.green },
            { val: "< 2s",    label: "Price calculation time", color: T.amber },
          ].map(({ val, label, color }, i) => (
            <div key={label} className={`scroll-reveal sr-d${(i % 3) + 1}`} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: T.font, fontSize: 30, fontWeight: 800, color, lineHeight: 1, marginBottom: 8, letterSpacing: "-0.025em" }}>{val}</div>
              <div style={{ fontSize: 12, color: T.text3, fontWeight: 500, letterSpacing: "0.03em", fontFamily: T.font }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 9 — TESTIMONIALS
═══════════════════════════════════════════════════════════════ */
const TestimonialsSection = () => {
  const T = useTheme();
  return (
    <section className="m-section" style={{ padding: "88px 40px", background: T.bg0 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="scroll-reveal" style={{ textAlign: "center", marginBottom: 56 }}>
          <Eyebrow>From farmers</Eyebrow>
          <SectionHeading>What buyers actually say.</SectionHeading>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {[
            {
              quote: "Ordered 80 coils for our grape farm near Pune. Delivery arrived within 5 days — well packed, no damage, and the pipe quality is excellent. Emitter spacing is consistent throughout. Will definitely reorder next season.",
              name:  "Sandip Mhaske",
              role:  "Grape farmer · Pune, Maharashtra",
              stars: 5,
            },
            {
              quote: "We needed 200 coils urgently before Kharif sowing. Halchal delivered on time to our farm in Solapur. The HDPE quality is noticeably better than what we were getting from local dealers — thicker wall, UV finish is good.",
              name:  "Prakash Kamble",
              role:  "Sugarcane farmer · Solapur, Maharashtra",
              stars: 5,
            },
            {
              quote: "Compared prices from three suppliers before ordering. Halchal gave the best rate — almost ₹150 cheaper per coil than the others. With 100 coils that's a big saving. Pricing is transparent, no hidden charges.",
              name:  "Rajan Patel",
              role:  "Cotton farmer · Surat, Gujarat",
              stars: 5,
            },
          ].map(({ quote, name, role, stars }) => (
            <div key={name} className="testimonial-card scroll-reveal">
              <div style={{ marginBottom: 18 }}><Ic.Quote /></div>
              <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.78, fontFamily: T.font, marginBottom: 22 }}>"{quote}"</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 18, borderTop: `1px solid ${T.border}` }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text1, fontFamily: T.font }}>{name}</div>
                  <div style={{ fontSize: 12, color: T.text3, fontFamily: T.font, marginTop: 2 }}>{role}</div>
                </div>
                <div style={{ display: "flex", gap: 2 }}>
                  {[...Array(stars)].map((_, i) => <Ic.Star key={i} />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 10 — PRICING / VOLUME TIERS
═══════════════════════════════════════════════════════════════ */
const PricingSection = ({ navigate }) => {
  const T = useTheme();
  const tiers = [
    {
      label:    "Small farm",
      qty:      "1–4 coils",
      discount: "Market price",
      note:     "Standard AI-calculated rate",
      items:    ["Full AI pricing engine", "Factor breakdown", "Online ordering", "Instant GST invoice"],
      cta:      "Start ordering",
      featured: false,
    },
    {
      label:    "Growing farm",
      qty:      "5–99 coils",
      discount: "Up to 10% off",
      note:     "Bulk tiers applied automatically",
      items:    ["Everything in Standard", "10% bulk discount", "Priority dispatch", "Order tracking"],
      cta:      "See bulk pricing",
      featured: true,
    },
    {
      label:    "Commercial / Distributor",
      qty:      "100+ coils",
      discount: "Up to 20% off",
      note:     "Best rate + dedicated support",
      items:    ["Everything in Bulk", "20% maximum discount", "Dedicated account manager", "Flexible delivery schedule"],
      cta:      "Contact us",
      featured: false,
    },
  ];
  return (
    <section id="pricing" className="m-section" style={{ padding: "88px 40px", background: T.bg1, borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="scroll-reveal" style={{ textAlign: "center", marginBottom: 56 }}>
          <Eyebrow>Volume pricing</Eyebrow>
          <SectionHeading style={{ marginBottom: 14 }}>More you order, less you pay.</SectionHeading>
          <p style={{ fontSize: 16, color: T.text2, fontFamily: T.font, maxWidth: 440, margin: "0 auto" }}>
            No negotiations. Discounts apply automatically based on your quantity.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          {tiers.map(({ label, qty, discount, note, items, cta, featured }) => (
            <div key={label} className={`vol-card${featured ? " featured" : ""}`}>
              {featured && (
                <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: T.green, color: "#04080F", fontSize: 10, fontWeight: 800, padding: "3px 14px", borderRadius: "0 0 8px 8px", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: T.font, whiteSpace: "nowrap" }}>
                  Most common
                </div>
              )}
              <div style={{ marginTop: featured ? 8 : 0 }}>
                <div style={{ fontSize: 11, color: T.text3, fontFamily: T.font, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>{qty}</div>
                <div style={{ fontFamily: T.font, fontSize: 21, fontWeight: 800, color: T.text1, letterSpacing: "-0.025em", lineHeight: 1 }}>{label}</div>
              </div>
              <div style={{ marginTop: 12, marginBottom: 24 }}>
                <div style={{ fontFamily: T.font, fontSize: 17, fontWeight: 700, color: T.green }}>{discount}</div>
                <div style={{ fontSize: 12, color: T.text3, fontFamily: T.font, marginTop: 3 }}>{note}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {items.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Ic.Check size={14} color={T.green} />
                    <span style={{ fontSize: 13, color: T.text2, fontFamily: T.font }}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/products")}
                style={{ width: "100%", padding: "11px", background: featured ? T.green : "transparent", color: featured ? "#04080F" : T.text1, fontFamily: T.font, fontSize: 14, fontWeight: 700, border: featured ? "none" : `1.5px solid ${T.borderH}`, borderRadius: 9, cursor: "pointer", transition: "background 0.2s, border-color 0.2s", letterSpacing: "-0.01em" }}
                onMouseEnter={e => {
                  if (featured) { e.currentTarget.style.background = T.greenLt; }
                  else { e.currentTarget.style.borderColor = T.green + "60"; e.currentTarget.style.background = T.greenBg; }
                }}
                onMouseLeave={e => {
                  if (featured) { e.currentTarget.style.background = T.green; }
                  else { e.currentTarget.style.borderColor = T.borderH; e.currentTarget.style.background = "transparent"; }
                }}>
                {cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 11 — FAQ
═══════════════════════════════════════════════════════════════ */
const faqs = [
  { q: "How does the AI pricing engine actually work?", a: "Our Random Forest ML model combines four weighted factors: seasonal demand curves (Kharif/Rabi/Zaid), your state's agri zone logistics rate, competitor activity in your region, and market adoption levels. These multiply with your order quantity to produce a fair market price. You can see each factor's value in the breakdown." },
  { q: "Is there a minimum order quantity?", a: "No minimum. You can buy as few as 1 coil. Bulk discounts kick in automatically at 5, 10, 50, 100, and 500 coils — you'll see them applied in the calculator before checkout." },
  { q: "Which Indian states do you ship to?", a: "Currently we ship to 18 states across Maharashtra, Gujarat, Rajasthan, Karnataka, Andhra Pradesh, Telangana, Punjab, Haryana, and Madhya Pradesh, among others. We're expanding quarterly — check the product page for your state's availability." },
  { q: "How is GST handled on my invoice?", a: "12% GST applies under HSN code 3917 (plastic pipes and fittings). The calculator shows you the ex-GST price and adds GST as a separate line on checkout. Your tax invoice is downloadable immediately after the order is placed." },
  { q: "Can I see pricing without creating an account?", a: "Yes. The AI pricing engine — including bulk discount tiers — runs without any registration. You only need to sign in when you add to cart or confirm an order." },
  { q: "What pipe specifications do you stock?", a: "We stock 16mm and 20mm pipes in both inline and online emitter configurations. Standard coil lengths are 400m for 16mm and 200m for 20mm. All are HDPE-grade, UV-stabilised, BIS-certified, and rated for 5+ seasons under normal Indian field conditions." },
];

const FAQSection = () => {
  const T = useTheme();
  const [open, setOpen] = useState(null);
  return (
    <section id="faq" className="m-section" style={{ padding: "88px 40px", background: T.bg0 }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div className="scroll-reveal" style={{ textAlign: "center", marginBottom: 52 }}>
          <Eyebrow>Questions</Eyebrow>
          <SectionHeading>Common questions answered.</SectionHeading>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {faqs.map(({ q, a }, i) => (
            <div key={i} className={`faq-item scroll-reveal${open === i ? " is-open" : ""}`}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", background: "transparent", border: "none", cursor: "pointer", gap: 16, textAlign: "left" }}
                aria-expanded={open === i}>
                <span style={{ fontSize: 15, fontWeight: 600, color: T.text1, fontFamily: T.font, lineHeight: 1.4 }}>{q}</span>
                <span style={{ flexShrink: 0 }}><Ic.ChevDown open={open === i} /></span>
              </button>
              {open === i && (
                <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${T.border}` }}>
                  <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.78, fontFamily: T.font, paddingTop: 16 }}>{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 12 — FINAL CTA
═══════════════════════════════════════════════════════════════ */
const FinalCTA = ({ navigate }) => {
  const T = useTheme();
  return (
    <section className="m-section" style={{ padding: "88px 40px", background: T.bg1, borderTop: `1px solid ${T.border}` }}>
      <div className="scroll-reveal" style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
        <SectionHeading style={{ marginBottom: 18 }}>
          See what you should actually be paying.
        </SectionHeading>
        <p style={{ fontSize: 16, color: T.text2, lineHeight: 1.72, fontFamily: T.font, marginBottom: 40, maxWidth: 440, margin: "0 auto 40px" }}>
          No account required. Pick a pipe, enter your state and quantity, and get a full breakdown in under 2 seconds.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn onClick={() => navigate("/products")} size="lg">
            Browse products <Ic.Arrow size={15} />
          </Btn>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: T.text1, fontFamily: T.font, fontSize: 15, fontWeight: 500, padding: "13px 28px", border: `1.5px solid ${T.borderH}`, borderRadius: 10, cursor: "pointer", textDecoration: "none", transition: "border-color 0.2s, background 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(37,211,102,0.4)"; e.currentTarget.style.background = "rgba(37,211,102,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.borderH; e.currentTarget.style.background = "transparent"; }}>
            WhatsApp us
          </a>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 13 — FOOTER
═══════════════════════════════════════════════════════════════ */
const Footer = () => {
  const T = useTheme();
  const [email, setEmail]         = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = () => {
    if (email.includes("@")) setSubmitted(true);
  };

  return (
    <footer style={{ background: T.bg0, borderTop: `1px solid ${T.border}` }}>
      {/* Newsletter strip */}
      <div style={{ background: T.bg1, borderBottom: `1px solid ${T.border}`, padding: "36px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
          <div>
            <h3 style={{ fontFamily: T.font, fontSize: 17, fontWeight: 800, color: T.text1, marginBottom: 6, letterSpacing: "-0.02em" }}>Seasonal pricing alerts</h3>
            <p style={{ color: T.text2, fontSize: 14, fontFamily: T.font }}>Know when Kharif and Rabi prices shift — before your supplier adjusts their quote.</p>
          </div>
          {submitted ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.greenBg, border: `1px solid ${T.greenBd}`, borderRadius: 8, padding: "10px 18px" }}>
              <Ic.Check size={14} />
              <span style={{ fontSize: 14, color: T.green, fontFamily: T.font, fontWeight: 600 }}>You're subscribed</span>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubscribe()}
                placeholder="your@email.com"
                aria-label="Email address for pricing alerts"
                style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text1, fontFamily: T.font, fontSize: 14, padding: "10px 14px", outline: "none", width: 220, transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "rgba(34,197,94,0.4)"}
                onBlur={e => e.target.style.borderColor = T.border}
              />
              <button
                onClick={handleSubscribe}
                style={{ background: T.green, color: "#04080F", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 700, fontFamily: T.font, cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = T.greenLt}
                onMouseLeave={e => e.currentTarget.style.background = T.green}>
                Subscribe
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main footer grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 40px 36px" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr 1fr 1.3fr", gap: 40, marginBottom: 44 }}>

          {/* Brand column */}
          <div>
            <div style={{ fontFamily: T.font, fontSize: 15, fontWeight: 800, color: T.text1, marginBottom: 12, letterSpacing: "-0.02em" }}>
              Halchal Industries
            </div>
            <p style={{ color: T.text3, fontSize: 13, lineHeight: 1.8, fontFamily: T.font, marginBottom: 20, maxWidth: 230 }}>
              Drip irrigation pipes with transparent, data-driven pricing. Serving farmers across India since 2015.
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["ISO 9001:2015", "BIS Certified", "GST Registered"].map(tag => (
                <span key={tag} style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 5, padding: "3px 9px", fontSize: 11, color: T.text3, fontFamily: T.font, fontWeight: 500 }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Products column */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16, fontFamily: T.font }}>Products</div>
            {[
              ["16mm Inline Pipe", "/products"],
              ["20mm Inline Pipe", "/products"],
              ["16mm Online Pipe", "/products"],
              ["20mm Online Pipe", "/products"],
            ].map(([label, path]) => (
              <Link key={label} to={path} className="footer-link">{label}</Link>
            ))}
          </div>

          {/* Company column */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16, fontFamily: T.font }}>Company</div>
            {[
              ["About us",           "/about"],
              ["Contact",            "/contact"],
              ["Privacy policy",     "/privacy-policy"],
              ["Terms & conditions", "/terms"],
            ].map(([label, path]) => (
              <Link key={label} to={path} className="footer-link">{label}</Link>
            ))}
          </div>

          {/* Contact column */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16, fontFamily: T.font }}>Contact</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { text: "Shirur, Pune – 412208, Maharashtra", href: null },
                { text: "+91 98765 43210",           href: "tel:+919876543210" },
                { text: "hello@halchal.in",           href: "mailto:hello@halchal.in" },
                { text: "Mon–Sat, 9 am–6 pm IST",    href: null },
              ].map(({ text, href }) =>
                href ? (
                  <a key={text} href={href} style={{ fontSize: 13, color: T.text3, fontFamily: T.font, textDecoration: "none", lineHeight: 1.5, transition: "color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.color = T.text2}
                    onMouseLeave={e => e.currentTarget.style.color = T.text3}>
                    {text}
                  </a>
                ) : (
                  <span key={text} style={{ fontSize: 13, color: T.text3, fontFamily: T.font, lineHeight: 1.5 }}>{text}</span>
                )
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 13, color: T.text3, fontFamily: T.font }}>© 2025 Halchal Industries Pvt. Ltd. All rights reserved.</span>
          <div style={{ display: "flex", gap: 22 }}>
            {[["Privacy", "/privacy-policy"], ["Terms", "/terms"]].map(([label, path]) => (
              <Link key={label} to={path} style={{ fontSize: 13, color: T.text3, textDecoration: "none", fontFamily: T.font, transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = T.text2}
                onMouseLeave={e => e.currentTarget.style.color = T.text3}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

/* ═══════════════════════════════════════════════════════════════
   HOME — main export
═══════════════════════════════════════════════════════════════ */
const Home = () => {
  const T         = useTheme();
  const navigate  = useNavigate();
  const productsRef = useRef(null);

  const css = `
    .feat-card {
      background: ${T.bg1};
      border: 1px solid ${T.border};
      border-radius: 16px;
      padding: 28px 24px;
      transition: border-color 0.2s, transform 0.25s, box-shadow 0.25s;
      cursor: default;
    }
    .feat-card:hover {
      border-color: ${T.borderH};
      transform: translateY(-4px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.35);
    }

    .problem-card {
      background: ${T.bg0};
      border: 1px solid ${T.border};
      border-left: 3px solid rgba(239,68,68,0.35);
      border-radius: 12px;
      padding: 26px 24px;
      transition: border-color 0.2s;
    }
    .problem-card:hover { border-color: ${T.borderH}; }

    .testimonial-card {
      background: ${T.bg1};
      border: 1px solid ${T.border};
      border-radius: 16px;
      padding: 28px 24px;
      transition: border-color 0.2s;
    }
    .testimonial-card:hover { border-color: ${T.borderH}; }

    .vol-card {
      background: ${T.bg1};
      border: 1.5px solid ${T.border};
      border-radius: 16px;
      padding: 28px 24px;
      cursor: pointer;
      transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
      position: relative;
    }
    .vol-card:hover {
      border-color: ${T.borderH};
      transform: translateY(-3px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.4);
    }
    .vol-card.featured {
      border-color: ${T.greenBd};
      background: linear-gradient(160deg, rgba(34,197,94,0.05) 0%, ${T.bg1} 60%);
    }
    .vol-card.featured:hover {
      border-color: ${T.green};
      box-shadow: 0 14px 40px rgba(34,197,94,0.1);
    }

    .product-card {
      background: ${T.bg1};
      border: 1px solid ${T.border};
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
    }
    .product-card:hover {
      border-color: rgba(34,197,94,0.28);
      transform: translateY(-4px);
      box-shadow: 0 20px 48px rgba(0,0,0,0.4);
    }
    .product-card .card-img {
      width: 100%; height: 196px;
      object-fit: cover;
      transition: transform 0.4s ease;
      display: block;
    }
    .product-card:hover .card-img { transform: scale(1.04); }

    .faq-item {
      background: ${T.bg1};
      border: 1px solid ${T.border};
      border-radius: 12px;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .faq-item:hover   { border-color: ${T.borderH}; }
    .faq-item.is-open { border-color: ${T.greenBd}; }

    .step-connector {
      position: absolute;
      top: 27px;
      left: calc(50% + 34px);
      right: calc(-50% + 34px);
      height: 1px;
      background: linear-gradient(90deg, ${T.green}, ${T.greenBg});
    }

    @media (max-width: 768px) {
      .solution-grid { grid-template-columns: 1fr !important; }
      .footer-grid   { grid-template-columns: 1fr 1fr !important; }
      .step-connector { display: none; }
    }
    @media (max-width: 560px) {
      .footer-grid { grid-template-columns: 1fr !important; }
    }
  `;

  /* Scroll-reveal observer */
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add("sr-visible")),
      { threshold: 0.10, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".scroll-reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollToProducts = () => productsRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: T.bg0 }}>
        <Navbar />
        <Hero onShop={scrollToProducts} />
        <ProblemSection />
        <SolutionSection onShop={scrollToProducts} />
        <FeaturesSection />
        <HowItWorks />
        <ProductsPreview navigate={navigate} sectionRef={productsRef} />
        <BenefitsSection />
        <TestimonialsSection />
        <PricingSection navigate={navigate} />
        <FAQSection />
        <FinalCTA navigate={navigate} />
        <ChatBot />
        <Footer />
      </div>
    </>
  );
};

export default Home;
