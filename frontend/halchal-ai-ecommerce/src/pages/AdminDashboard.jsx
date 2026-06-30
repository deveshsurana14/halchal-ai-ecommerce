import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.jpg";
import "../styles/admin.css";

const T = {
  bg0: "#05070E",
  bg1: "#0B1120",
  bg2: "#111B30",
  bg3: "#18253E",
  amber: "#F5A623",
  amberSoft: "rgba(245,166,35,0.09)",
  amberBorder: "rgba(245,166,35,0.22)",
  green: "#00D68F",
  sky: "#38C0FF",
  rose: "#FF5577",
  border: "rgba(255,255,255,0.07)",
  borderBright: "rgba(255,255,255,0.12)",
  t1: "#EBF0FF",
  t2: "#7A98B8",
  t3: "#3F5470",
  font: "'Inter', system-ui, -apple-system, sans-serif",
};

const Ic = (d, vb = "0 0 24 24") => (
  <svg width="16" height="16" viewBox={vb} fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

const Icons = {
  menu: Ic(<><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="17" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></>),
  grid: Ic(<><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></>),
  box: Ic(<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>),
  orders: Ic(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>),
  tag: Ic(<><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>),
  chart: Ic(<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>),
  mail: Ic(<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>),
  cog: Ic(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>),
  shield: Ic(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>),
  logout: Ic(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>),
};

// badge = number shown when there are pending items for that section
const NAV = [
  { label: "Dashboard",         path: "dashboard",         icon: Icons.grid,   badge: null },
  { label: "Stock Management",  path: "stock",             icon: Icons.box,    badge: 2    },
  { label: "Orders",            path: "orders",            icon: Icons.orders, badge: 3    },
  { label: "Pricing Approvals", path: "pricing-approvals", icon: Icons.tag,    badge: 4    },
  { label: "Reports",           path: "reports",           icon: Icons.chart,  badge: null },
  { label: "Messages",          path: "messages",          icon: Icons.mail,   badge: null },
  { label: "Settings",          path: "settings",          icon: Icons.cog,    badge: null },
];

export default function AdminDashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive    = (p) => location.pathname.includes(p);
  const currentPage = NAV.find(n => isActive(n.path))?.label || "Dashboard";

  const handleLogout = () => {
    localStorage.removeItem("halchal_admin_auth");
    navigate("/admin");
  };

  const sideW = collapsed ? 64 : 240;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg0, fontFamily: T.font }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sideW, flexShrink: 0,
        transition: "width 0.26s cubic-bezier(0.4,0,0.2,1)",
        background: T.bg1,
        borderRight: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh", overflow: "hidden",
      }}>

        {/* Brand */}
        <div style={{
          height: 64, padding: "0 16px", flexShrink: 0,
          borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", gap: 11,
        }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, overflow: "hidden", flexShrink: 0, background: T.bg3 }}>
            <img src={logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden", animation: "slideLeft 0.22s ease both" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: T.t1, whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>
                Halchal Industries
              </div>
              <div style={{ fontSize: 9.5, color: T.amber, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, whiteSpace: "nowrap" }}>
                Admin Portal
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
          {NAV.map(({ label, path, icon, badge }, i) => {
            const active = isActive(path);
            return (
              <div
                key={path}
                onClick={() => navigate(`/admin-dashboard/${path}`)}
                title={collapsed ? label : undefined}
                style={{
                  display: "flex", alignItems: "center",
                  gap: 10, padding: "10px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 9, cursor: "pointer",
                  background: active ? T.amberSoft : "transparent",
                  color: active ? T.amber : T.t2,
                  borderLeft: `2px solid ${active ? T.amber : "transparent"}`,
                  transition: "background 0.16s, color 0.16s",
                  animation: "slideLeft 0.28s ease both",
                  animationDelay: `${i * 28}ms`,
                  position: "relative",
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = T.bg2; e.currentTarget.style.color = T.t1; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.t2; } }}
              >
                <span style={{ flexShrink: 0 }}>{icon}</span>
                {!collapsed && (
                  <>
                    <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {label}
                    </span>
                    {badge && !active && (
                      <span style={{
                        background: T.rose, color: "#fff",
                        fontSize: 9.5, fontWeight: 700,
                        minWidth: 17, height: 17, borderRadius: 9,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, animation: "pulse-red 2.4s infinite",
                      }}>{badge}</span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: "10px 8px", borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", marginBottom: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #F5A623 0%, #C07200 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 800, color: "#04080F",
              }}>A</div>
              <div style={{ overflow: "hidden", flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.t1, whiteSpace: "nowrap" }}>Admin</div>
                <div style={{ fontSize: 10, color: T.t3 }}>Super Admin</div>
              </div>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, flexShrink: 0, animation: "pulse-dot 2.2s infinite" }} />
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{
              display: "flex", alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: 8, padding: "9px 12px", borderRadius: 9,
              background: "rgba(255,85,119,0.07)",
              border: "1px solid rgba(255,85,119,0.17)",
              color: T.rose, fontSize: 12, cursor: "pointer",
              width: "100%", fontFamily: T.font, fontWeight: 600,
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,85,119,0.14)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,85,119,0.07)"}
          >
            {Icons.logout}
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Top header */}
        <header style={{
          height: 64, flexShrink: 0,
          borderBottom: `1px solid ${T.border}`,
          background: T.bg1,
          display: "flex", alignItems: "center", gap: 16, padding: "0 28px",
        }}>
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              background: "none", border: "none", color: T.t2, cursor: "pointer",
              padding: 6, borderRadius: 8, display: "flex", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.bg2; e.currentTarget.style.color = T.t1; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = T.t2; }}
          >
            {Icons.menu}
          </button>

          <div style={{ fontSize: 12, color: T.t3, display: "flex", alignItems: "center", gap: 7 }}>
            <span>Admin</span>
            <span style={{ color: T.t3 }}>›</span>
            <span style={{ color: T.t1, fontWeight: 600 }}>{currentPage}</span>
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ fontSize: 11, color: T.t3 }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            background: T.amberSoft,
            border: `1px solid ${T.amberBorder}`,
            borderRadius: 20, padding: "5px 14px",
            color: T.amber, fontSize: 11, fontWeight: 700,
          }}>
            {Icons.shield}
            <span style={{ letterSpacing: "0.04em" }}>ADMIN</span>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "32px 32px 56px", animation: "fadeIn 0.3s ease both" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
