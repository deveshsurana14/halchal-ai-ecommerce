import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";

const T = {
  bg0: "#05070F", bg1: "#080D1C", bg2: "#0D1628", bg3: "#121F38",
  accent: "#00E5A0", accentDk: "#00C080", copper: "#FFB020",
  border: "rgba(255,255,255,0.07)", borderMd: "rgba(255,255,255,0.15)",
  text1: "#EEF3FF", text2: "#7A9EC6", text3: "#3D5A7A",
  danger: "#FF6B6B",
};

const ADMIN_CREDS = { username: "admin", password: "halchal@2024" };

const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

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

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!username.trim() || !password) {
      setError("Both fields are required.");
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (username.trim() === ADMIN_CREDS.username && password === ADMIN_CREDS.password) {
        localStorage.setItem("halchal_admin_auth", "1");
        navigate("/admin-dashboard");
      } else {
        const next = attempts + 1;
        setAttempts(next);
        if (next >= 3) {
          setError("Too many failed attempts. Please verify your credentials with your system administrator.");
        } else {
          setError(`Invalid username or password. ${3 - next} attempt${3 - next === 1 ? "" : "s"} remaining.`);
        }
        setLoading(false);
      }
    }, 900);
  };

  const inputStyle = (hasErr) => ({
    width: "100%", boxSizing: "border-box",
    padding: "11px 14px",
    background: T.bg3, border: `1px solid ${hasErr ? T.danger : T.border}`,
    borderRadius: 8, color: T.text1, fontSize: 14,
    fontFamily: "'Lora', serif", outline: "none",
    transition: "border-color 0.2s",
  });

  const locked = attempts >= 3;

  return (
    <div style={{ minHeight: "100vh", background: T.bg0, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Lora', serif" }}>
      {/* Background glow orbs — amber/red tint to signal admin context */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "10%", right: "8%", width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,176,32,0.06) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "15%", left: "5%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(180,0,80,0.05) 0%, transparent 70%)" }} />
      </div>

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        {/* Main card */}
        <div style={{ background: T.bg1, border: `1px solid rgba(255,176,32,0.15)`, borderRadius: 20, padding: "44px 40px", boxShadow: "0 24px 80px rgba(0,0,0,0.55)" }}>

          {/* Brand + shield badge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src={logo} alt="Halchal" style={{ height: 38, borderRadius: 6, objectFit: "contain" }} />
              <div style={{ borderLeft: `1px solid ${T.border}`, paddingLeft: 14 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: T.text1, lineHeight: 1.2 }}>Halchal</div>
                <div style={{ fontSize: 10, color: T.text3, letterSpacing: "0.1em", textTransform: "uppercase" }}>Industries</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,176,32,0.1)", border: "1px solid rgba(255,176,32,0.2)", borderRadius: 20, padding: "5px 12px", color: T.copper, fontSize: 11, fontWeight: 600 }}>
              <ShieldIcon />
              <span>Admin</span>
            </div>
          </div>

          <div style={{ marginBottom: 30 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: T.text1, margin: 0, fontFamily: "'Playfair Display', serif" }}>Admin Portal</h1>
            <p style={{ fontSize: 13, color: T.text2, margin: "6px 0 0" }}>Restricted access — authorised personnel only</p>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: 8, padding: "12px 14px", marginBottom: 20 }}>
              <span style={{ color: T.danger, flexShrink: 0, marginTop: 1 }}><AlertIcon /></span>
              <span style={{ fontSize: 13, color: T.danger, lineHeight: 1.4 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.text2, marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(""); }}
                placeholder="admin"
                autoComplete="username"
                disabled={locked}
                style={{ ...inputStyle(!!error), opacity: locked ? 0.5 : 1 }}
                onFocus={e => { if (!error) e.target.style.borderColor = T.copper; }}
                onBlur={e => { if (!error) e.target.style.borderColor = T.border; }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: T.text2, marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  disabled={locked}
                  style={{ ...inputStyle(!!error), paddingRight: 44, opacity: locked ? 0.5 : 1 }}
                  onFocus={e => { if (!error) e.target.style.borderColor = T.copper; }}
                  onBlur={e => { if (!error) e.target.style.borderColor = T.border; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: T.text2, cursor: "pointer", padding: 2, display: "flex" }}
                >
                  {showPass ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || locked}
              style={{
                width: "100%", padding: "12px 0", borderRadius: 8, border: "none",
                background: (loading || locked) ? T.bg3 : `linear-gradient(135deg, ${T.copper} 0%, #E07000 100%)`,
                color: (loading || locked) ? T.text3 : "#04080F",
                fontSize: 14, fontWeight: 700, cursor: (loading || locked) ? "not-allowed" : "pointer",
                fontFamily: "'Lora', serif", letterSpacing: "0.03em",
                transition: "opacity 0.2s", opacity: (loading || locked) ? 0.65 : 1,
              }}
            >
              {loading ? "Authenticating…" : locked ? "Account locked" : "Access Admin Panel →"}
            </button>
          </form>
        </div>

        {/* Demo hint */}
        <div style={{ marginTop: 16, background: "rgba(255,176,32,0.05)", border: "1px solid rgba(255,176,32,0.12)", borderRadius: 10, padding: "12px 18px", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 15, lineHeight: 1.4 }}>🔑</span>
          <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
            <span style={{ color: T.copper, fontWeight: 600 }}>Demo credentials: </span>
            Username <code style={{ background: T.bg3, padding: "1px 5px", borderRadius: 4 }}>admin</code>{" "}
            · Password <code style={{ background: T.bg3, padding: "1px 5px", borderRadius: 4 }}>halchal@2024</code>
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: T.text3, marginTop: 18 }}>
          <Link to="/home" style={{ color: T.text2, textDecoration: "none" }}>← Back to site</Link>
        </p>
      </div>
    </div>
  );
}
