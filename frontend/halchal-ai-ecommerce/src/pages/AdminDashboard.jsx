import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.jpg";

const T = {
  bg0: "#04080F", bg1: "#07101E", bg2: "#0B1628", bg3: "#101F35",
  accent: "#00E5A0", copper: "#FFB020", danger: "#FF6B6B", info: "#00B4D8",
  border: "rgba(255,255,255,0.07)", borderMd: "rgba(255,255,255,0.13)",
  text1: "#EEF3FF", text2: "#7A9EC6", text3: "#3D5A7A",
};

const ic = (d, s = "0 0 24 24") => (
  <svg width="16" height="16" viewBox={s} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const Icons = {
  menu:    ic(<><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>),
  grid:    ic(<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>),
  box:     ic(<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>),
  orders:  ic(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>),
  tag:     ic(<><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>),
  chart:   ic(<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>),
  settings:ic(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>),
  shield:  ic(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>),
  logout:  ic(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>),
};

const NAV = [
  { label: "Dashboard",        path: "dashboard",        icon: Icons.grid },
  { label: "Stock Management", path: "stock",            icon: Icons.box },
  { label: "Orders",           path: "orders",           icon: Icons.orders },
  { label: "Pricing Approvals",path: "pricing-approvals",icon: Icons.tag },
  { label: "Reports",          path: "reports",          icon: Icons.chart },
  { label: "Settings",         path: "settings",         icon: Icons.settings },
];

const AdminDashboard = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive   = (path) => location.pathname.includes(path);
  const currentPage = NAV.find(n => isActive(n.path))?.label || "Dashboard";

  const handleLogout = () => {
    localStorage.removeItem("halchal_admin_auth");
    navigate("/admin");
  };

  const sideW = collapsed ? 60 : 220;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg0, fontFamily: "'Lora', serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sideW, flexShrink: 0, transition: "width 0.22s ease",
        background: T.bg1, borderRight: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh", overflow: "hidden",
      }}>
        {/* Brand */}
        <div style={{ padding: "18px 14px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10, minHeight: 64, flexShrink: 0 }}>
          <img src={logo} alt="Halchal" style={{ height: 30, borderRadius: 5, objectFit: "contain", flexShrink: 0 }} />
          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: T.text1, whiteSpace: "nowrap" }}>Halchal</div>
              <div style={{ fontSize: 9, color: T.copper, letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Admin Portal</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
          {NAV.map(({ label, path, icon }) => {
            const active = isActive(path);
            return (
              <div
                key={path}
                onClick={() => navigate(`/admin-dashboard/${path}`)}
                title={collapsed ? label : ""}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: collapsed ? "10px 0" : "10px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 8, cursor: "pointer",
                  background: active ? "rgba(255,176,32,0.10)" : "transparent",
                  color: active ? T.copper : T.text2,
                  borderLeft: `2px solid ${active ? T.copper : "transparent"}`,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = T.bg3; e.currentTarget.style.color = T.text1; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.text2; } }}
              >
                <span style={{ flexShrink: 0 }}>{icon}</span>
                {!collapsed && <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden" }}>{label}</span>}
              </div>
            );
          })}
        </nav>

        {/* Admin user */}
        <div style={{ padding: "14px 10px", borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${T.copper}, #C06000)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#04080F", flexShrink: 0 }}>A</div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text1, whiteSpace: "nowrap" }}>Admin</div>
                <div style={{ fontSize: 10, color: T.text3, whiteSpace: "nowrap" }}>Super Admin</div>
              </div>
            </div>
          )}
          <div
            onClick={handleLogout}
            title="Sign Out"
            style={{
              display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
              gap: 8, padding: "7px 10px", borderRadius: 8,
              background: "rgba(255,107,107,0.06)", border: "1px solid rgba(255,107,107,0.18)",
              color: T.danger, fontSize: 12, cursor: "pointer",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,107,107,0.12)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,107,107,0.06)"}
          >
            {Icons.logout}
            {!collapsed && <span>Sign Out</span>}
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Top header */}
        <header style={{
          height: 60, borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", padding: "0 24px", gap: 16,
          background: T.bg1, flexShrink: 0,
        }}>
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{ background: "none", border: "none", color: T.text2, cursor: "pointer", padding: 4, display: "flex", borderRadius: 6, transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = T.text1}
            onMouseLeave={e => e.currentTarget.style.color = T.text2}
          >
            {Icons.menu}
          </button>

          <div style={{ fontSize: 12, color: T.text3 }}>
            Admin Portal
            <span style={{ margin: "0 6px", color: T.text3 }}>/</span>
            <span style={{ color: T.text1, fontWeight: 600 }}>{currentPage}</span>
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ fontSize: 11, color: T.text2 }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,176,32,0.08)", border: "1px solid rgba(255,176,32,0.18)", borderRadius: 20, padding: "4px 12px", color: T.copper, fontSize: 11, fontWeight: 600 }}>
            {Icons.shield}
            <span>Admin</span>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 28px 40px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
