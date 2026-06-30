import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ChatBot from "../components/ChatBot";
import { useTheme } from "../context/ThemeContext";

/* ─── Page-specific accent palette (fixed, not theme-toggled) ── */
const ACCENT   = "#00E5A0";
const ACCENTDK = "#00C080";
const COPPER   = "#FFB020";
const PURPLE   = "#8677FF";

const TEAM = [
  {
    initials: "NS", name: "Natha Sonawane", role: "Partner & Head of Manufacturing",
    color: ACCENT, bg: "rgba(0,229,160,0.12)",
    bio: "20+ years of hands-on experience in HDPE pipe extrusion and drip irrigation manufacturing. Oversees production quality, machine operations, and raw material procurement at the Shirur facility.",
    since: "Since 2015",
  },
  {
    initials: "SS", name: "Sachin Sonawane", role: "Partner & Sales Director",
    color: PURPLE, bg: "rgba(134,119,255,0.12)",
    bio: "Drives B2B sales across Maharashtra, Gujarat, and Rajasthan. Built Halchal's agri-dealer network from the ground up with 500+ active distributor relationships across the Pune–Nashik belt.",
    since: "Since 2022",
  },
  {
    initials: "MS", name: "Mihir Sancheti", role: "Partner & Business Development",
    color: COPPER, bg: "rgba(255,176,32,0.12)",
    bio: "Leads market expansion and new product line development. Specialises in identifying high-potential agri-zones and onboarding large-scale institutional buyers across central and western India.",
    since: "Since 2018",
  },
];

const TIMELINE = [
  { year: "2015", event: "Founded in Shirur, Pune", detail: "Halchal Industries was established in Wajewadi, Shirur with a vision to supply quality inline drip irrigation pipes to Indian farmers at fair, transparent prices." },
  { year: "2017", event: "ISO 9001:2015 Certified", detail: "Achieved international quality certification — validating our manufacturing processes, batch testing, and quality control systems across both product lines." },
  { year: "2019", event: "Pan-India Expansion", detail: "Opened distribution centres in Nashik and Hyderabad. Nationwide delivery capability unlocked. Customer base reached 2,000+." },
  { year: "2023", event: "AI Pricing Engine Launched", detail: "Deployed our proprietary ML model for demand forecasting and dynamic pricing — a first in the Indian pipe supply industry. Pricing accuracy improved 38%." },
];

const STATS = [
  { value: "10,000+", label: "Happy Customers",    color: ACCENT  },
  { value: "₹5Cr+",   label: "Annual GMV",          color: COPPER  },
  { value: "28",      label: "States Covered",       color: PURPLE  },
  { value: "99.8%",   label: "Quality Pass Rate",    color: ACCENT  },
  { value: "9+",      label: "Years of Excellence",  color: "#00AEFF" },
  { value: "ISO",     label: "9001:2015 Certified",  color: COPPER  },
];

const TECH_FEATURES = [
  { icon: "🧠", title: "ML Demand Forecasting", desc: "Random Forest model trained on 4 years of sales data predicts per-product demand for each state and season combination." },
  { icon: "📍", title: "Geo-Based Logistics Pricing", desc: "Logistics cost factor computed per state using distance from Pune/Nashik hubs, road connectivity, and freight rates." },
  { icon: "📈", title: "Dynamic Market Factors", desc: "Market adoption rates, competitor pricing signals, and seasonal agri trends automatically adjust the final price in real time." },
  { icon: "⚡", title: "Sub-2s Price Calculation", desc: "Every price quote is computed live in under 2 seconds, incorporating all four pricing factors simultaneously." },
  { icon: "🔒", title: "Admin Approval Workflow", desc: "Orders above 100 coils are automatically routed to admin review before confirmation, ensuring margin protection." },
  { icon: "📊", title: "Bulk Discount Engine", desc: "Tiered discount logic (5–8%) kicks in automatically for volume orders, incentivising larger purchases without manual negotiation." },
];

const CERTS = [
  { icon: "🏆", label: "ISO 9001:2015", sub: "Quality Management System", color: COPPER },
  { icon: "🌿", label: "BIS Certified", sub: "Bureau of Indian Standards", color: ACCENT },
  { icon: "🛡️", label: "MSME Registered", sub: "Ministry of MSME, Govt. of India", color: PURPLE },
  { icon: "🚜", label: "Agri Ministry Listed", sub: "Approved supplier under PMKSY", color: "#00AEFF" },
];


/* ─── Simple footer ───────────────────────────────────────────────────── */
const Footer = () => {
  const T = useTheme();
  return (
    <footer style={{ background: T.bg1, borderTop: `1px solid ${T.border}`, padding: "48px 40px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "space-between", marginBottom: 36 }}>
        <div style={{ maxWidth: 300 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: T.text1, marginBottom: 10 }}>Halchal Industries</div>
          <p style={{ fontSize: 13, color: T.text3, lineHeight: 1.7 }}>Precision-engineered irrigation pipes backed by AI-powered pricing. Trusted across India since 2015.</p>
        </div>
        <div style={{ display: "flex", gap: 60, flexWrap: "wrap" }}>
          {[
            { title: "Company", links: [["Home", "/home"], ["Products", "/products"], ["About", "/about"], ["Contact", "/contact"]] },
            { title: "Legal",   links: [["Privacy Policy", "/privacy-policy"], ["Terms & Conditions", "/terms"]] },
          ].map(({ title, links }) => (
            <div key={title}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>{title}</div>
              {links.map(([label, path]) => (
                <Link key={label} to={path} style={{ color: T.text2, fontSize: 14, textDecoration: "none", transition: "color 0.2s", display: "block", padding: "4px 0" }}
                  onMouseEnter={e => e.currentTarget.style.color = T.text1}
                  onMouseLeave={e => e.currentTarget.style.color = T.text2}>
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: "0 auto", borderTop: `1px solid ${T.border}`, paddingTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <span style={{ fontSize: 12, color: T.text3 }}>© 2024 Halchal Industries Pvt. Ltd. All rights reserved.</span>
        <span style={{ fontSize: 12, color: T.text3 }}>Wajewadi, Shirur, Pune – 412208, Maharashtra</span>
      </div>
    </footer>
  );
};

/* ─── About page ──────────────────────────────────────────────────────── */
const About = () => {
  const navigate = useNavigate();
  const theme    = useTheme();
  const T        = { ...theme, accent: ACCENT, accentDk: ACCENTDK, copper: COPPER, purple: PURPLE, borderMd: theme.borderH };

  const css = `
    @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes shimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
    @keyframes ticker { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }
    @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(0,229,160,0.35);} 70%{box-shadow:0 0 0 10px rgba(0,229,160,0);} 100%{box-shadow:0 0 0 0 rgba(0,229,160,0);} }

    .about-fade { animation: fadeUp 0.6s ease both; }
    .about-fade-1 { animation: fadeUp 0.6s 0.1s ease both; }
    .about-fade-2 { animation: fadeUp 0.6s 0.22s ease both; }

    .about-card {
      background: ${T.bg2};
      border: 1px solid ${T.border};
      border-radius: 16px;
      transition: border-color 0.25s, box-shadow 0.25s;
    }
    .about-card:hover {
      border-color: ${T.borderMd};
      box-shadow: 0 12px 40px rgba(0,0,0,0.35);
    }

    .team-card {
      background: ${T.bg2};
      border: 1px solid ${T.border};
      border-radius: 20px;
      padding: 32px 28px;
      text-align: center;
      transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
    }
    .team-card:hover {
      border-color: rgba(0,229,160,0.25);
      transform: translateY(-4px);
      box-shadow: 0 20px 48px rgba(0,0,0,0.4);
    }

    .timeline-item {
      display: flex; gap: 28px; position: relative;
    }
    .timeline-item::before {
      content: '';
      position: absolute;
      left: 19px; top: 44px;
      width: 2px;
      height: calc(100% + 16px);
      background: linear-gradient(to bottom, ${ACCENT}40, transparent);
    }
    .timeline-item:last-child::before { display: none; }

    .cert-badge {
      background: ${T.bg2};
      border: 1px solid ${T.border};
      border-radius: 12px;
      padding: 20px 24px;
      display: flex; align-items: center; gap: 16px;
      transition: border-color 0.2s;
    }
    .cert-badge:hover { border-color: ${T.borderMd}; }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: ${T.bg1}; }
    ::-webkit-scrollbar-thumb { background: ${T.bg3}; border-radius: 3px; }
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: T.bg0, color: T.text1 }}>
        <Navbar />

        {/* ── Hero ─────────────────────────────────────────── */}
        <section style={{ position: "relative", overflow: "hidden", padding: "90px 40px 80px", textAlign: "center" }}>
          {/* Grid bg */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,229,160,0.07), transparent)` }} />

          <div style={{ position: "relative", maxWidth: 760, margin: "0 auto" }}>
            <div className="about-fade" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,229,160,0.10)", border: "1px solid rgba(0,229,160,0.25)", borderRadius: 20, padding: "6px 16px", marginBottom: 24 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.accent, animation: "pulse-ring 2s infinite", display: "inline-block" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: T.accent, letterSpacing: "0.08em", textTransform: "uppercase" }}>Est. 2015 · Shirur, Pune, Maharashtra</span>
            </div>

            <h1 className="about-fade-1" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px,5vw,58px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 20, color: T.text1 }}>
              India's Most Advanced<br />
              <span style={{ background: `linear-gradient(90deg, ${T.accent}, #00AEFF, ${T.accent})`, backgroundSize: "200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 4s linear infinite" }}>
                Pipe Supply Platform
              </span>
            </h1>

            <p className="about-fade-2" style={{ fontSize: 17, color: T.text2, lineHeight: 1.75, fontWeight: 300, marginBottom: 36 }}>
              We combine 9+ years of manufacturing expertise with cutting-edge machine learning to deliver precision-engineered inline irrigation pipes — priced dynamically, delivered Pan-India.
            </p>

            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => navigate("/products")} style={{ background: T.accent, color: "#04080F", border: "none", padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 700, fontFamily: "'Lora',serif", cursor: "pointer" }}>
                Explore Products →
              </button>
              <button onClick={() => navigate("/contact")} style={{ background: "transparent", color: T.text1, border: `1.5px solid ${T.borderMd}`, padding: "11px 26px", borderRadius: 8, fontSize: 14, fontWeight: 500, fontFamily: "'Lora',serif", cursor: "pointer" }}>
                Get in Touch
              </button>
            </div>
          </div>
        </section>

        {/* ── Stats strip ──────────────────────────────────── */}
        <section style={{ padding: "0 40px 70px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 20, padding: "40px 48px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 24 }}>
              {STATS.map(({ value, label, color }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 800, color, marginBottom: 6 }}>{value}</div>
                  <div style={{ fontSize: 11, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mission & Vision ─────────────────────────────── */}
        <section style={{ padding: "0 40px 80px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span style={{ background: "rgba(0,229,160,0.10)", border: "1px solid rgba(0,229,160,0.25)", borderRadius: 20, padding: "5px 14px", fontSize: 11, fontWeight: 600, color: T.accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>Who We Are</span>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 700, color: T.text1, marginTop: 16, marginBottom: 12 }}>Purpose-Driven from Day One</h2>
              <p style={{ color: T.text2, fontSize: 15, fontWeight: 300, maxWidth: 520, margin: "0 auto" }}>Everything we build, every pipe we ship, is guided by two foundational commitments.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 24 }}>
              {[
                {
                  icon: "🎯", label: "Our Mission", color: T.accent,
                  title: "Democratise precision irrigation",
                  body: "Make high-quality inline drip irrigation pipes — backed by real-time AI pricing — accessible to every farmer, contractor, and agri-business across India, regardless of their geography or order size.",
                },
                {
                  icon: "🔭", label: "Our Vision", color: T.purple,
                  title: "Lead India's agri-infrastructure transformation",
                  body: "Become the default supply platform for India's 140M+ farm holdings by 2028, combining manufacturing excellence with AI-intelligence to eliminate opaque pricing from the agricultural supply chain.",
                },
              ].map(({ icon, label, color, title, body }) => (
                <div key={label} className="about-card" style={{ padding: "36px" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20 }}>{icon}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: T.text1, margin: "10px 0 14px" }}>{title}</h3>
                  <p style={{ color: T.text2, fontSize: 14, lineHeight: 1.75, fontWeight: 300 }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Company Timeline ─────────────────────────────── */}
        <section style={{ padding: "0 40px 80px", background: T.bg1, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ maxWidth: 860, margin: "0 auto", paddingTop: 70 }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span style={{ background: "rgba(255,176,32,0.10)", border: "1px solid rgba(255,176,32,0.25)", borderRadius: 20, padding: "5px 14px", fontSize: 11, fontWeight: 600, color: T.copper, letterSpacing: "0.1em", textTransform: "uppercase" }}>Our Journey</span>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 700, color: T.text1, marginTop: 16 }}>A Decade of Building Trust</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {TIMELINE.map(({ year, event, detail }) => (
                <div key={year} className="timeline-item" style={{ paddingBottom: 16 }}>
                  <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingTop: 4 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}33, ${T.accent}11)`, border: `2px solid ${T.accent}55`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: T.accent }}>{year.slice(2)}</span>
                    </div>
                  </div>
                  <div className="about-card" style={{ flex: 1, padding: "22px 28px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: T.text1 }}>{event}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: T.accent, background: "rgba(0,229,160,0.10)", padding: "2px 10px", borderRadius: 12 }}>{year}</span>
                    </div>
                    <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.7, fontWeight: 300 }}>{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AI Technology ────────────────────────────────── */}
        <section style={{ padding: "80px 40px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span style={{ background: "rgba(134,119,255,0.10)", border: "1px solid rgba(134,119,255,0.25)", borderRadius: 20, padding: "5px 14px", fontSize: 11, fontWeight: 600, color: T.purple, letterSpacing: "0.1em", textTransform: "uppercase" }}>AI Technology</span>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 700, color: T.text1, marginTop: 16, marginBottom: 12 }}>Pricing Powered by Machine Learning</h2>
              <p style={{ color: T.text2, fontSize: 15, fontWeight: 300, maxWidth: 540, margin: "0 auto" }}>Our Random Forest model analyses demand, season, logistics, and market factors in real time to compute the fairest price for every order.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
              {TECH_FEATURES.map(({ icon, title, desc }) => (
                <div key={title} className="about-card" style={{ padding: "28px" }}>
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{icon}</div>
                  <h4 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: T.text1, marginBottom: 10 }}>{title}</h4>
                  <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.7, fontWeight: 300 }}>{desc}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 48, background: `linear-gradient(135deg, rgba(0,229,160,0.08), rgba(134,119,255,0.06))`, border: `1px solid rgba(0,229,160,0.20)`, borderRadius: 20, padding: "40px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
              <div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: T.text1, marginBottom: 8 }}>See the AI in action</h3>
                <p style={{ color: T.text2, fontSize: 14, fontWeight: 300 }}>Get a live price for any product in under 2 seconds — no registration needed.</p>
              </div>
              <button onClick={() => navigate("/products")} style={{ background: T.accent, color: "#04080F", border: "none", padding: "13px 32px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: "'Lora',serif", cursor: "pointer", whiteSpace: "nowrap" }}>
                Try AI Pricing →
              </button>
            </div>
          </div>
        </section>

        {/* ── Leadership Team ──────────────────────────────── */}
        <section style={{ padding: "0 40px 80px", background: T.bg1, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", paddingTop: 70 }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span style={{ background: "rgba(0,174,255,0.10)", border: "1px solid rgba(0,174,255,0.25)", borderRadius: 20, padding: "5px 14px", fontSize: 11, fontWeight: 600, color: "#00AEFF", letterSpacing: "0.1em", textTransform: "uppercase" }}>Leadership</span>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 700, color: T.text1, marginTop: 16 }}>The Team Behind Halchal</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 24 }}>
              {TEAM.map(({ initials, name, role, color, bg: bgColor, bio, since }) => (
                <div key={name} className="team-card">
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: bgColor, border: `2px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color, margin: "0 auto 20px", fontFamily: "'Playfair Display',serif" }}>
                    {initials}
                  </div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: T.text1, marginBottom: 4 }}>{name}</div>
                  <div style={{ fontSize: 12, color, fontWeight: 600, marginBottom: 4 }}>{role}</div>
                  <div style={{ fontSize: 11, color: T.text3, marginBottom: 16 }}>{since}</div>
                  <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.7, fontWeight: 300 }}>{bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Certifications ──────────────────────────────── */}
        <section style={{ padding: "80px 40px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span style={{ background: "rgba(255,176,32,0.10)", border: "1px solid rgba(255,176,32,0.25)", borderRadius: 20, padding: "5px 14px", fontSize: 11, fontWeight: 600, color: T.copper, letterSpacing: "0.1em", textTransform: "uppercase" }}>Trust & Compliance</span>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(22px,3vw,32px)", fontWeight: 700, color: T.text1, marginTop: 16 }}>Certified, Compliant, Trusted</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
              {CERTS.map(({ icon, label, sub, color }) => (
                <div key={label} className="cert-badge">
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text1 }}>{label}</div>
                    <div style={{ fontSize: 12, color: T.text3, marginTop: 3 }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 64, textAlign: "center" }}>
              <p style={{ color: T.text2, fontSize: 15, marginBottom: 20 }}>Questions about our manufacturing process or certifications?</p>
              <button onClick={() => navigate("/contact")} style={{ background: T.accent, color: "#04080F", border: "none", padding: "13px 32px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: "'Lora',serif", cursor: "pointer" }}>
                Contact Our Team →
              </button>
            </div>
          </div>
        </section>

        <ChatBot />
        <Footer />
      </div>
    </>
  );
};

export default About;
