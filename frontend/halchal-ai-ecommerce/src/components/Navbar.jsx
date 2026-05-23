import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import logo from "../assets/logo.jpg";
import { useCart } from "../context/CartContext";
import { useTheme, useThemeToggle } from "../context/ThemeContext";

/* ─── Icons ────────────────────────────────────────────────── */
const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const OrderIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const HamburgerIcon = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const NAV_LINKS = [
  ["Home",     "/home"],
  ["Products", "/products"],
  ["About",    "/about"],
  ["Contact",  "/contact"],
];

/* ─── Trust Ticker ──────────────────────────────────────────── */
const TrustTicker = () => {
  const T = useTheme();
  const items = [
    "ISO 9001:2015 Certified",
    "BIS Mark Approved",
    "GST Registered",
    "Pan-India Delivery",
    "HSN 3917 Compliant",
    "HDPE UV-Stabilised",
    "18 States Covered",
    "₹50Cr+ Pipes Sold",
  ];
  const doubled = [...items, ...items];
  return (
    <div style={{
      background: T.isDark ? "#071A0F" : "#F0FDF4",
      borderTop: `1px solid ${T.greenBd}`,
      borderBottom: `1px solid ${T.greenBd}`,
      height: 34,
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
    }}>
      <div style={{
        animation: "ticker 30s linear infinite",
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        paddingLeft: "100%",
      }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: T.text2,
              letterSpacing: "0.05em",
              fontFamily: T.font,
            }}>
              {item}
            </span>
            <span style={{
              display: "inline-block",
              width: 4, height: 4,
              borderRadius: "50%",
              background: T.green,
              margin: "0 14px",
              opacity: 0.55,
              flexShrink: 0,
            }} />
          </span>
        ))}
      </div>
    </div>
  );
};

/* ─── Navbar ────────────────────────────────────────────────── */
const Navbar = ({ activePage }) => {
  const navigate            = useNavigate();
  const location            = useLocation();
  const { cartCount }       = useCart();
  const T                   = useTheme();
  const { toggle, isDark }  = useThemeToggle();

  const [scrolled,    setScrolled]    = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [isLoggedIn,  setIsLoggedIn]  = useState(() => !!localStorage.getItem("halchal_auth"));

  const profileRef  = useRef(null);
  const searchRef   = useRef(null);
  const currentPath = location.pathname;

  const isActive = (path) => {
    if (activePage) return activePage === path;
    if (path === "/home") return currentPath === "/home";
    return currentPath.startsWith(path);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [currentPath]);

  const handleLogout = () => {
    localStorage.removeItem("halchal_auth");
    setIsLoggedIn(false);
    setProfileOpen(false);
    navigate("/home");
  };

  const navBg = scrolled
    ? isDark ? "rgba(7,12,23,0.95)" : "rgba(248,250,252,0.95)"
    : T.bg0;

  const iconBtn = {
    padding: "8px", cursor: "pointer", color: T.text2,
    borderRadius: 8, transition: "background 0.2s, color 0.2s",
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100 }}>
      <nav style={{
        background: navBg,
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: `1px solid ${scrolled ? T.borderH : T.border}`,
        transition: "background 0.3s, border-color 0.3s",
        padding: "0 28px",
        display: "flex", alignItems: "center", height: 62,
        gap: 24,
        fontFamily: T.font,
      }}>

        {/* Logo */}
        <div
          onClick={() => navigate("/home")}
          style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, cursor: "pointer" }}>
          <img src={logo} alt="Halchal Industries" style={{ height: 34, objectFit: "contain", borderRadius: 6 }} />
          <div style={{ borderLeft: `1px solid ${T.border}`, paddingLeft: 12 }}>
            <div style={{ fontFamily: T.font, fontSize: 14, fontWeight: 800, color: T.text1, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
              Halchal
            </div>
            <div style={{ fontSize: 10, fontWeight: 500, color: T.text3, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Industries
            </div>
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="nav-desktop-links" style={{ display: "flex", alignItems: "center", gap: 22, marginLeft: 4 }}>
          {NAV_LINKS.map(([label, path]) => (
            <span
              key={label}
              className={`nav-link${isActive(path) ? " active" : ""}`}
              onClick={() => navigate(path)}>
              {label}
            </span>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Search */}
        <div
          ref={searchRef}
          className="nav-search-container"
          onClick={() => setSearchOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: T.bg2,
            border: `1px solid ${searchOpen ? "rgba(34,197,94,0.3)" : T.border}`,
            borderRadius: 8, padding: "7px 12px",
            width: searchOpen ? 210 : 148,
            transition: "width 0.3s ease, border-color 0.2s",
            cursor: "text",
          }}>
          <span style={{ color: T.text3, flexShrink: 0 }}><SearchIcon /></span>
          <input
            style={{
              background: "transparent", border: "none", outline: "none",
              color: T.text1, fontSize: 13, fontFamily: T.font, width: "100%",
            }}
            placeholder="Search products…"
            aria-label="Search products"
          />
        </div>

        {/* Right icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>

          {/* Cart */}
          <div
            onClick={() => navigate("/cart")}
            style={{ ...iconBtn, position: "relative" }}
            onMouseEnter={e => { e.currentTarget.style.background = T.bg3; e.currentTarget.style.color = T.text1; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.text2; }}
            aria-label={`Cart — ${cartCount} item${cartCount !== 1 ? "s" : ""}`}>
            <CartIcon />
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: 4, right: 4,
                width: 16, height: 16, borderRadius: "50%",
                background: T.green, color: "#04080F",
                fontSize: 9, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `2px solid ${T.bg0}`,
              }}>
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </div>

          {/* Theme toggle */}
          <div
            onClick={toggle}
            style={iconBtn}
            onMouseEnter={e => { e.currentTarget.style.background = T.bg3; e.currentTarget.style.color = T.text1; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.text2; }}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
            {isDark ? <SunIcon /> : <MoonIcon />}
          </div>

          {/* Auth — desktop */}
          {isLoggedIn ? (
            <div ref={profileRef} style={{ position: "relative", marginLeft: 4 }}>
              <button
                onClick={() => setProfileOpen(p => !p)}
                style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: profileOpen ? T.green + "25" : T.green + "15",
                  border: `1.5px solid ${profileOpen ? T.greenBd : T.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, color: T.green,
                  cursor: "pointer", transition: "border-color 0.2s, background 0.2s",
                  flexShrink: 0, fontFamily: T.font,
                }}
                aria-label="Open profile menu"
                aria-expanded={profileOpen}>
                H
              </button>
              {profileOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  width: 206, background: T.bg2,
                  border: `1px solid ${T.borderH}`,
                  borderRadius: 12, boxShadow: "0 20px 56px rgba(0,0,0,0.6)",
                  overflow: "hidden", zIndex: 200,
                }}>
                  <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: T.green + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: T.green, flexShrink: 0 }}>H</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.text1, fontFamily: T.font }}>Hrishikesh</div>
                        <div style={{ fontSize: 11, color: T.text3, marginTop: 1, fontFamily: T.font }}>Customer account</div>
                      </div>
                    </div>
                  </div>
                  {[
                    { icon: <UserIcon />,  label: "My profile", action: () => { setProfileOpen(false); navigate("/profile"); } },
                    { icon: <OrderIcon />, label: "My orders",  action: () => { setProfileOpen(false); navigate("/cart");    } },
                  ].map(({ icon, label, action }) => (
                    <div
                      key={label} onClick={action}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", color: T.text2, fontSize: 13, cursor: "pointer", transition: "background 0.15s, color 0.15s", fontFamily: T.font }}
                      onMouseEnter={e => { e.currentTarget.style.background = T.bg3; e.currentTarget.style.color = T.text1; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.text2; }}>
                      <span style={{ color: T.green, display: "flex" }}>{icon}</span>{label}
                    </div>
                  ))}
                  <div style={{ borderTop: `1px solid ${T.border}` }}>
                    <div
                      onClick={handleLogout}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", color: T.text2, fontSize: 13, cursor: "pointer", transition: "background 0.15s, color 0.15s", fontFamily: T.font }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.color = "#EF4444"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.text2; }}>
                      <span style={{ display: "flex" }}><LogoutIcon /></span>Sign out
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              className="nav-sign-in-btn"
              onClick={() => navigate("/login")}
              style={{
                display: "inline-flex", alignItems: "center",
                background: T.green, color: "#04080F",
                fontFamily: T.font, fontSize: 13, fontWeight: 700,
                padding: "7px 16px", border: "none", borderRadius: 8,
                cursor: "pointer", marginLeft: 6, whiteSpace: "nowrap",
                transition: "background 0.2s, transform 0.15s",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = T.greenLt; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = T.green;   e.currentTarget.style.transform = "translateY(0)"; }}>
              Sign in
            </button>
          )}

          {/* Hamburger — mobile only */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(p => !p)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}>
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="nav-mobile-drawer">
          {NAV_LINKS.map(([label, path]) => (
            <span
              key={label}
              className={`nav-mobile-link${isActive(path) ? " m-active" : ""}`}
              onClick={() => { navigate(path); setMenuOpen(false); }}>
              {label}
            </span>
          ))}
          <div className="nav-mobile-sep" />
          <div style={{ display: "flex", gap: 8, padding: "4px 0" }}>
            <button
              onClick={() => { navigate("/cart"); setMenuOpen(false); }}
              style={{ flex: 1, padding: "11px", background: T.greenBg, border: `1px solid ${T.greenBd}`, borderRadius: 8, color: T.green, fontSize: 14, fontFamily: T.font, cursor: "pointer", fontWeight: 600 }}>
              Cart{cartCount > 0 ? ` (${cartCount})` : ""}
            </button>
            <button
              onClick={toggle}
              style={{ padding: "11px 14px", background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text2, fontSize: 14, fontFamily: T.font, cursor: "pointer" }}>
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            {isLoggedIn ? (
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                style={{ flex: 1, padding: "11px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, color: "#EF4444", fontSize: 14, fontFamily: T.font, cursor: "pointer", fontWeight: 500 }}>
                Sign out
              </button>
            ) : (
              <button
                onClick={() => { navigate("/login"); setMenuOpen(false); }}
                style={{ flex: 1, padding: "11px", background: T.green, border: "none", borderRadius: 8, color: "#04080F", fontSize: 14, fontWeight: 700, fontFamily: T.font, cursor: "pointer" }}>
                Sign in
              </button>
            )}
          </div>
        </div>
      )}

      {/* Trust ticker — visible on all pages */}
      <TrustTicker />
    </div>
  );
};

export default Navbar;
