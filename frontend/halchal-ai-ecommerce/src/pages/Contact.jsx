import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";

/* ─── Page-specific accent palette (fixed, not theme-toggled) ── */
const ACCENT = "#00E5A0";
const COPPER = "#FFB020";
const PURPLE = "#8677FF";

const CONTACT_INFO = [
  {
    icon: "✉️", label: "Email Us", color: ACCENT, bg: "rgba(0,229,160,0.10)",
    primary: "contch.halchalindustries@gmail.com",
    primaryHref: "mailto:contch.halchalindustries@gmail.com",
    secondary: null,
    note: "We reply within 4 business hours",
  },
  {
    icon: "📞", label: "Call Us", color: "#00AEFF", bg: "rgba(0,174,255,0.10)",
    primary: "+91 94235 80386",
    primaryHref: "tel:+919423580386",
    secondary: "WhatsApp: +91 94235 80386",
    secondaryHref: "https://wa.me/919423580386",
    note: "Mon–Sat, 9 AM – 7 PM IST",
  },
  {
    icon: "📍", label: "Head Office", color: COPPER, bg: "rgba(255,176,32,0.10)",
    primary: "Halchal Industries",
    secondary: "Wajewadi, Pimple Jagtap Chaufulla, Shirur",
    note: "Pune – 412208, Maharashtra, India",
  },
  {
    icon: "🕐", label: "Business Hours", color: PURPLE, bg: "rgba(134,119,255,0.10)",
    primary: "Monday – Saturday",
    secondary: "9:00 AM – 7:00 PM IST",
    note: "Emergency support on WhatsApp 24×7",
  },
];

const OFFICES = [
  {
    city: "Shirur, Pune (Factory)", address: "Wajewadi, Pimple Jagtap Chaufulla, Taluka Shirur, Pune – 412208, Maharashtra",
    phone: "+91 94235 80386", email: "contch.halchalindustries@gmail.com",
    tag: "Manufacturing & HQ", color: ACCENT,
    mapHint: "Wajewadi village, Shirur Taluka, Pune district",
  },
];

const SUBJECTS = [
  "Product & Pricing Inquiry",
  "Bulk Order / Dealer Inquiry",
  "Technical Support",
  "Delivery & Logistics",
  "Partnership Proposal",
  "Quality Complaint",
  "Other",
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
            { title: "Legal", links: [["Privacy Policy", "/privacy-policy"], ["Terms & Conditions", "/terms"]] },
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

/* ─── Contact page ────────────────────────────────────────────────────── */
const Contact = () => {
  const navigate = useNavigate();
  const theme    = useTheme();
  const T        = { ...theme, accent: ACCENT, copper: COPPER, purple: PURPLE, borderMd: theme.borderH };

  const css = `
    @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
    @keyframes shimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
    @keyframes ticker { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }
    @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(0,229,160,0.35);} 70%{box-shadow:0 0 0 10px rgba(0,229,160,0);} 100%{box-shadow:0 0 0 0 rgba(0,229,160,0);} }
    @keyframes checkPop { 0%{transform:scale(0.5);opacity:0;} 70%{transform:scale(1.15);} 100%{transform:scale(1);opacity:1;} }
    @keyframes spin { to { transform: rotate(360deg); } }

    .contact-input {
      width: 100%;
      background: ${T.bg3};
      border: 1px solid ${T.border};
      border-radius: 10px;
      color: ${T.text1};
      font-family: 'Lora', serif;
      font-size: 14px;
      padding: 13px 16px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
    }
    .contact-input::placeholder { color: ${T.text3}; }
    .contact-input:focus {
      border-color: ${ACCENT};
      box-shadow: 0 0 0 3px rgba(0,229,160,0.08);
    }
    .contact-input.error { border-color: rgba(255,80,80,0.6); }

    .contact-card {
      background: ${T.bg2};
      border: 1px solid ${T.border};
      border-radius: 16px;
      padding: 24px;
      display: flex; align-items: flex-start; gap: 16px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .contact-card:hover {
      border-color: ${T.borderMd};
      box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    }

    .submit-btn {
      width: 100%;
      background: ${ACCENT};
      color: #04080F;
      border: none;
      border-radius: 10px;
      padding: 15px;
      font-size: 15px;
      font-weight: 700;
      font-family: 'Lora', serif;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
      letter-spacing: 0.01em;
    }
    .submit-btn:hover { background: #00F0A0; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,229,160,0.28); }
    .submit-btn:active { transform: translateY(0); }
    .submit-btn:disabled { background: ${T.bg3}; color: ${T.text3}; cursor: not-allowed; transform: none; box-shadow: none; }

    .office-card {
      background: ${T.bg2};
      border: 1px solid ${T.border};
      border-radius: 16px;
      padding: 28px;
      transition: border-color 0.2s;
    }
    .office-card:hover { border-color: ${T.borderMd}; }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: ${T.bg1}; }
    ::-webkit-scrollbar-thumb { background: ${T.bg3}; border-radius: 3px; }
  `;

  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", company: "", subject: "", message: "",
  });
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())                        e.fullName = "Full name is required";
    if (!form.email.match(/^[^@]+@[^@]+\.[^@]+$/))   e.email    = "Enter a valid email address";
    if (!form.subject)                                e.subject  = "Please select a subject";
    if (form.message.trim().length < 20)              e.message  = "Message must be at least 20 characters";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1400));

    const existing = JSON.parse(localStorage.getItem("halchal_contact_messages") || "[]");
    const newMsg = {
      id: Date.now().toString(36).toUpperCase().slice(-8),
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      company: form.company,
      subject: form.subject,
      message: form.message,
      timestamp: new Date().toISOString(),
      read: false,
    };
    localStorage.setItem("halchal_contact_messages", JSON.stringify([newMsg, ...existing]));

    setSubmitting(false);
    setSubmitted(true);
  };

  /* ── Success screen ─────────────────────────────── */
  if (submitted) return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: T.bg0 }}>
        <Navbar />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: "60px 40px", textAlign: "center" }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", background: "rgba(0,229,160,0.10)", border: "2px solid rgba(0,229,160,0.30)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28, fontSize: 36, animation: "checkPop 0.4s ease" }}>
            ✓
          </div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: T.accent, marginBottom: 12 }}>Message Sent!</h2>
          <p style={{ color: T.text2, fontSize: 15, maxWidth: 420, lineHeight: 1.7, marginBottom: 8 }}>
            Thanks, <strong style={{ color: T.text1 }}>{form.fullName.split(" ")[0]}</strong>. We've received your message and will reply to <strong style={{ color: T.text1 }}>{form.email}</strong> within 4 business hours.
          </p>
          <p style={{ color: T.text3, fontSize: 13, marginBottom: 36 }}>
            Reference: <span style={{ fontFamily: "monospace", color: T.text2 }}>HI-{Date.now().toString(36).toUpperCase().slice(-8)}</span>
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => navigate("/products")} style={{ background: T.accent, color: "#04080F", border: "none", padding: "12px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: "'Lora',serif", cursor: "pointer" }}>
              Browse Products
            </button>
            <button onClick={() => setSubmitted(false)} style={{ background: "transparent", border: `1.5px solid ${T.borderMd}`, color: T.text2, padding: "11px 24px", borderRadius: 10, fontSize: 14, fontFamily: "'Lora',serif", cursor: "pointer" }}>
              Send Another
            </button>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );

  /* ── Main form page ─────────────────────────────── */
  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: T.bg0, color: T.text1 }}>
        <Navbar />

        {/* Page header */}
        <section style={{ position: "relative", padding: "70px 40px 56px", textAlign: "center", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 50% at 50% 0%, rgba(0,229,160,0.06), transparent)" }} />
          <div style={{ position: "relative", maxWidth: 640, margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,229,160,0.10)", border: "1px solid rgba(0,229,160,0.25)", borderRadius: 20, padding: "6px 16px", marginBottom: 20 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.accent, animation: "pulse-ring 2s infinite", display: "inline-block" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: T.accent, letterSpacing: "0.08em", textTransform: "uppercase" }}>Reply within 4 hours</span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4.5vw,50px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 16, color: T.text1 }}>
              Let's Talk
            </h1>
            <p style={{ fontSize: 16, color: T.text2, lineHeight: 1.7, fontWeight: 300 }}>
              Whether you need a bulk price quote, have a dealer inquiry, or just want to say hello — our team is here.
            </p>
          </div>
        </section>

        {/* Main content: form + info */}
        <section style={{ padding: "0 40px 80px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 40, alignItems: "start" }}>

            {/* ── Contact Form ── */}
            <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 20, padding: "40px" }}>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: T.text1, marginBottom: 6 }}>Send a Message</h2>
                <p style={{ fontSize: 13, color: T.text3 }}>All fields marked * are required</p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: T.text2, display: "block", marginBottom: 7, letterSpacing: "0.04em" }}>FULL NAME *</label>
                    <input className={`contact-input${errors.fullName ? " error" : ""}`} placeholder="Rajesh Kumar" value={form.fullName} onChange={set("fullName")} />
                    {errors.fullName && <div style={{ fontSize: 11, color: "#FF6060", marginTop: 5 }}>{errors.fullName}</div>}
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: T.text2, display: "block", marginBottom: 7, letterSpacing: "0.04em" }}>EMAIL ADDRESS *</label>
                    <input className={`contact-input${errors.email ? " error" : ""}`} type="email" placeholder="rajesh@company.com" value={form.email} onChange={set("email")} />
                    {errors.email && <div style={{ fontSize: 11, color: "#FF6060", marginTop: 5 }}>{errors.email}</div>}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: T.text2, display: "block", marginBottom: 7, letterSpacing: "0.04em" }}>PHONE NUMBER</label>
                    <input className="contact-input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: T.text2, display: "block", marginBottom: 7, letterSpacing: "0.04em" }}>COMPANY / FARM NAME</label>
                    <input className="contact-input" placeholder="Rajesh Agro Pvt. Ltd." value={form.company} onChange={set("company")} />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: T.text2, display: "block", marginBottom: 7, letterSpacing: "0.04em" }}>SUBJECT *</label>
                  <select
                    className={`contact-input${errors.subject ? " error" : ""}`}
                    value={form.subject} onChange={set("subject")}
                    style={{ cursor: "pointer" }}
                  >
                    <option value="">Select a subject…</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.subject && <div style={{ fontSize: 11, color: "#FF6060", marginTop: 5 }}>{errors.subject}</div>}
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: T.text2, display: "block", marginBottom: 7, letterSpacing: "0.04em" }}>MESSAGE *</label>
                  <textarea
                    className={`contact-input${errors.message ? " error" : ""}`}
                    placeholder="Tell us about your requirements — product type, quantity, delivery state, and any specific questions…"
                    value={form.message} onChange={set("message")}
                    rows={5}
                    style={{ resize: "vertical", minHeight: 120 }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                    {errors.message
                      ? <div style={{ fontSize: 11, color: "#FF6060" }}>{errors.message}</div>
                      : <div />}
                    <span style={{ fontSize: 11, color: form.message.length < 20 ? T.text3 : T.accent }}>{form.message.length} chars</span>
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting
                    ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                        <span style={{ width: 16, height: 16, border: "2px solid rgba(4,8,15,0.3)", borderTopColor: "#04080F", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                        Sending…
                      </span>
                    : "Send Message →"
                  }
                </button>

                <p style={{ fontSize: 12, color: T.text3, textAlign: "center", marginTop: 16 }}>
                  We never spam. Your data is protected under our{" "}
                  <Link to="/privacy-policy" style={{ color: T.accent, textDecoration: "none" }}>Privacy Policy</Link>.
                </p>
              </form>
            </div>

            {/* ── Contact Info ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: T.text1, marginBottom: 8 }}>Contact Information</h2>
                <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>Reach us directly through any of the channels below. Our sales team is also available on WhatsApp for quick queries.</p>
              </div>

              {CONTACT_INFO.map(({ icon, label, color, bg: bgColor, primary, primaryHref, secondary, secondaryHref, note }) => (
                <div key={label} className="contact-card">
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: bgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>{label}</div>
                    {primaryHref
                      ? <a href={primaryHref} target={primaryHref.startsWith("http") ? "_blank" : undefined} rel="noreferrer" style={{ fontSize: 14, fontWeight: 600, color: T.text1, marginBottom: 2, display: "block", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = color} onMouseLeave={e => e.currentTarget.style.color = T.text1}>{primary}</a>
                      : <div style={{ fontSize: 14, fontWeight: 600, color: T.text1, marginBottom: 2 }}>{primary}</div>
                    }
                    {secondary && (secondaryHref
                      ? <a href={secondaryHref} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: T.text2, marginBottom: 5, display: "block", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = color} onMouseLeave={e => e.currentTarget.style.color = T.text2}>{secondary}</a>
                      : <div style={{ fontSize: 13, color: T.text2, marginBottom: 5 }}>{secondary}</div>
                    )}
                    <div style={{ fontSize: 11, color: T.text3 }}>{note}</div>
                  </div>
                </div>
              ))}

              <div style={{ background: "rgba(37,211,102,0.07)", border: "1px solid rgba(37,211,102,0.20)", borderRadius: 14, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: 28 }}>💬</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text1, marginBottom: 4 }}>WhatsApp Business</div>
                  <div style={{ fontSize: 12, color: T.text2 }}>Instant quotes & order support · 24×7</div>
                </div>
                <a href="https://wa.me/919423580386" target="_blank" rel="noreferrer" style={{ background: "#25D366", color: "#fff", border: "none", padding: "9px 18px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "none", whiteSpace: "nowrap" }}>
                  Chat Now
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Office Locations ──────────────────────────────── */}
        <section style={{ padding: "70px 40px 80px", background: T.bg1, borderTop: `1px solid ${T.border}` }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ marginBottom: 36 }}>
              <span style={{ background: "rgba(255,176,32,0.10)", border: "1px solid rgba(255,176,32,0.25)", borderRadius: 20, padding: "5px 14px", fontSize: 11, fontWeight: 600, color: T.copper, letterSpacing: "0.1em", textTransform: "uppercase" }}>Our Offices</span>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(22px,3vw,32px)", fontWeight: 700, color: T.text1, marginTop: 16 }}>Our Factory</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 24 }}>
              {OFFICES.map(({ city, address, phone, email, tag, color, mapHint }) => (
                <div key={city} className="office-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, animation: "pulse-ring 2.5s infinite" }} />
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: T.text1 }}>{city}</h3>
                    <span style={{ fontSize: 10, fontWeight: 700, background: `${color}20`, color, padding: "3px 9px", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{tag}</span>
                  </div>

                  <div style={{ background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 12, height: 140, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
                    <div style={{ textAlign: "center", position: "relative" }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>📍</div>
                      <div style={{ fontSize: 12, color: T.text3 }}>{mapHint}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["📬", address,  null],
                      ["📞", phone,    `tel:${phone.replace(/\s/g, "")}`],
                      ["✉️", email,    `mailto:${email}`],
                    ].map(([ico, val, href]) => (
                      <div key={val} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{ico}</span>
                        {href
                          ? <a href={href} style={{ fontSize: 13, color: T.text2, lineHeight: 1.5, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = color} onMouseLeave={e => e.currentTarget.style.color = T.text2}>{val}</a>
                          : <span style={{ fontSize: 13, color: T.text2, lineHeight: 1.5 }}>{val}</span>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ strip ──────────────────────────────────────── */}
        <section style={{ padding: "70px 40px 80px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: T.text1, marginBottom: 10 }}>Frequently Asked Questions</h2>
              <p style={{ color: T.text2, fontSize: 14, fontWeight: 300 }}>Quick answers before you write to us.</p>
            </div>
            {[
              ["What is the minimum order quantity?", "There is no minimum order — you can order as little as 1 coil. Bulk discounts apply from 5 coils onwards."],
              ["How long does delivery take?", "Standard Pan-India delivery is 5–7 business days. Express options are available for Maharashtra and Gujarat (2–3 days)."],
              ["Do you provide GST invoices?", "Yes. Every order generates a proper GST Tax Invoice (HSN 3917) which is emailed within 2 hours of dispatch."],
              ["Can I get a custom quote for a large project?", "Absolutely. Send us your project details via the form above, or WhatsApp us directly. Orders above 100 coils go through our admin approval workflow automatically."],
              ["What are your payment terms for bulk orders?", "For orders above ₹10L we offer 30-day credit terms (subject to KYC and business verification). All other orders are prepaid via NEFT/UPI/Card."],
            ].map(([q, a]) => (
              <details key={q} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "18px 22px", marginBottom: 10, cursor: "pointer" }}>
                <summary style={{ fontSize: 15, fontWeight: 600, color: T.text1, listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {q}
                  <span style={{ color: T.accent, fontSize: 18, flexShrink: 0 }}>+</span>
                </summary>
                <p style={{ marginTop: 14, fontSize: 13, color: T.text2, lineHeight: 1.7, fontWeight: 300 }}>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Contact;
