import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.jpg";

const T = {
  bg0: "#05070F", bg1: "#080D1C", bg2: "#0D1628", bg3: "#121F38",
  accent: "#00E5A0", accentDk: "#00C080", copper: "#FFB020",
  border: "rgba(255,255,255,0.07)", borderMd: "rgba(255,255,255,0.15)",
  text1: "#EEF3FF", text2: "#7A9EC6", text3: "#3D5A7A",
};

const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeClosed = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function UserLogin() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Must be at least 6 characters";
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("halchal_auth", "1");
      navigate("/home");
    }, 1000);
  };

  const clearErr = (field) => setErrors(prev => ({ ...prev, [field]: undefined }));

  const inputStyle = (hasErr) => ({
    width: "100%", boxSizing: "border-box",
    padding: "11px 14px",
    background: T.bg3, border: `1px solid ${hasErr ? "#FF6B6B" : T.border}`,
    borderRadius: 8, color: T.text1, fontSize: 14,
    fontFamily: "'Lora', serif", outline: "none",
    transition: "border-color 0.2s",
  });

  return (
    <div style={{ minHeight: "100vh", background: T.bg0, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Lora', serif" }}>
      {/* Background glow orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,229,160,0.055) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,100,220,0.07) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: "55%", left: "45%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,176,32,0.04) 0%, transparent 70%)" }} />
      </div>

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
        {/* Main card */}
        <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 20, padding: "44px 40px", boxShadow: "0 24px 80px rgba(0,0,0,0.55)" }}>

          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
            <img src={logo} alt="Halchal" style={{ height: 38, borderRadius: 6, objectFit: "contain" }} />
            <div style={{ borderLeft: `1px solid ${T.border}`, paddingLeft: 14 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: T.text1, lineHeight: 1.2 }}>Halchal</div>
              <div style={{ fontSize: 10, color: T.text3, letterSpacing: "0.1em", textTransform: "uppercase" }}>Industries</div>
            </div>
          </div>

          <div style={{ marginBottom: 30 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: T.text1, margin: 0, fontFamily: "'Playfair Display', serif" }}>Welcome back</h1>
            <p style={{ fontSize: 13, color: T.text2, margin: "6px 0 0" }}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.text2, marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); clearErr("email"); }}
                placeholder="you@example.com"
                style={inputStyle(errors.email)}
                onFocus={e => { if (!errors.email) e.target.style.borderColor = T.accent; }}
                onBlur={e => { if (!errors.email) e.target.style.borderColor = T.border; }}
              />
              {errors.email && <div style={{ fontSize: 11, color: "#FF6B6B", marginTop: 5 }}>{errors.email}</div>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.text2, marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearErr("password"); }}
                  placeholder="Enter your password"
                  style={{ ...inputStyle(errors.password), paddingRight: 44 }}
                  onFocus={e => { if (!errors.password) e.target.style.borderColor = T.accent; }}
                  onBlur={e => { if (!errors.password) e.target.style.borderColor = T.border; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: T.text2, cursor: "pointer", padding: 2, display: "flex" }}
                >
                  {showPass ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>
              {errors.password && <div style={{ fontSize: 11, color: "#FF6B6B", marginTop: 5 }}>{errors.password}</div>}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
              <span style={{ fontSize: 12, color: T.accent, cursor: "pointer" }}>Forgot password?</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "12px 0", borderRadius: 8, border: "none",
                background: loading ? T.bg3 : `linear-gradient(135deg, ${T.accent} 0%, #00B4D8 100%)`,
                color: loading ? T.text3 : "#04080F",
                fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Lora', serif", letterSpacing: "0.03em",
                transition: "opacity 0.2s", opacity: loading ? 0.75 : 1,
              }}
            >
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ margin: "24px 0", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: T.border }} />
            <span style={{ fontSize: 11, color: T.text3 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: T.border }} />
          </div>

          {/* Browse as guest */}
          <button
            type="button"
            onClick={() => navigate("/home")}
            style={{
              width: "100%", padding: "11px 0", borderRadius: 8,
              background: "transparent", border: `1px solid ${T.border}`,
              color: T.text2, fontSize: 13, cursor: "pointer",
              fontFamily: "'Lora', serif", transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderMd; e.currentTarget.style.color = T.text1; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text2; }}
          >
            Browse as Guest
          </button>

          <p style={{ textAlign: "center", fontSize: 13, color: T.text2, marginTop: 22, marginBottom: 0 }}>
            New customer?{" "}
            <span style={{ color: T.accent, cursor: "pointer", fontWeight: 500 }}>Create an account</span>
          </p>
        </div>

        {/* Demo credentials hint */}
        <div style={{ marginTop: 16, background: "rgba(0,229,160,0.05)", border: "1px solid rgba(0,229,160,0.14)", borderRadius: 10, padding: "12px 18px", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 15, lineHeight: 1.4 }}>💡</span>
          <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
            <span style={{ color: T.accent, fontWeight: 600 }}>Demo: </span>
            Use any valid email and a password of 6+ characters to sign in.
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: T.text3, marginTop: 18 }}>
          Admin access?{" "}
          <Link to="/admin" style={{ color: T.text2, textDecoration: "none" }}>Admin portal →</Link>
        </p>
      </div>
    </div>
  );
}
