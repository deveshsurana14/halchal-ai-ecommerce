import { useState } from "react";

const T = {
  bg0: "#04080F", bg1: "#07101E", bg2: "#0B1628", bg3: "#101F35",
  accent: "#00E5A0", copper: "#FFB020", danger: "#FF6B6B", info: "#00B4D8",
  border: "rgba(255,255,255,0.07)", borderMd: "rgba(255,255,255,0.13)",
  text1: "#EEF3FF", text2: "#7A9EC6", text3: "#3D5A7A",
};

const USERS = [
  { name: "Admin",          email: "admin@halchal.in",    role: "Super Admin", status: "Active",   last: "Just now"   },
  { name: "Devesh Surana",  email: "devesh@halchal.in",   role: "Manager",     status: "Active",   last: "2h ago"     },
  { name: "Priya Sharma",   email: "priya@halchal.in",    role: "Analyst",     status: "Active",   last: "Yesterday"  },
  { name: "Amit Kulkarni",  email: "amit@halchal.in",     role: "Sales",       status: "Inactive", last: "3 days ago" },
];

const NOTIF_DEFAULTS = {
  lowStock:      true,
  newOrder:      true,
  priceApproval: true,
  aiAlert:       false,
  weeklyReport:  true,
  smsAlerts:     false,
};

const MODEL_CONFIG = {
  model:    "Random Forest",
  trained:  "2026-04-15",
  accuracy: "94.2%",
  features: "Crop type, Region, Season, Month, Year, Historical demand",
  nextTrain:"2026-06-01",
};

const Card = ({ children, style }) => (
  <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, ...style }}>
    {children}
  </div>
);

const SectionHead = ({ title, sub }) => (
  <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${T.border}` }}>
    <h2 style={{ fontSize: 15, fontWeight: 700, color: T.text1, margin: 0 }}>{title}</h2>
    {sub && <p style={{ fontSize: 12, color: T.text2, margin: "4px 0 0" }}>{sub}</p>}
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <div
    onClick={() => onChange(!checked)}
    style={{ width: 40, height: 22, borderRadius: 11, background: checked ? T.accent : T.bg3, cursor: "pointer", position: "relative", transition: "background 0.25s", flexShrink: 0 }}
  >
    <div style={{ position: "absolute", top: 3, left: checked ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: checked ? "#04080F" : T.text3, transition: "left 0.25s" }} />
  </div>
);

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  background: T.bg3, border: `1px solid ${T.border}`,
  borderRadius: 8, padding: "9px 12px", color: T.text1,
  fontSize: 13, fontFamily: "'Lora', serif", outline: "none",
};

export default function Settings() {
  const [company, setCompany] = useState({
    name: "Halchal Industries Pvt. Ltd.",
    email: "contact@halchal.in",
    phone: "+91-20-26543210",
    address: "Plot 42, MIDC, Chinchwad, Pune – 411019",
    gst: "27AABCH1234K1Z5",
    website: "www.halchal.in",
  });
  const [notif, setNotif] = useState(NOTIF_DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [toast,  setToast]  = useState(null);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [activeTab, setActiveTab] = useState("General");

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const saveCompany = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); showToast("Company settings saved successfully"); }, 800);
  };

  const savePassword = () => {
    if (!pwForm.current) { showToast("Enter current password", false); return; }
    if (pwForm.next.length < 8) { showToast("New password must be 8+ characters", false); return; }
    if (pwForm.next !== pwForm.confirm) { showToast("Passwords do not match", false); return; }
    setSaving(true);
    setTimeout(() => { setSaving(false); setPwForm({ current: "", next: "", confirm: "" }); showToast("Password updated successfully"); }, 800);
  };

  const TABS = ["General", "Notifications", "Users", "AI Model", "Security"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 24, zIndex: 9999, background: toast.ok ? "rgba(0,229,160,0.12)" : "rgba(255,107,107,0.12)", border: `1px solid ${toast.ok ? T.accent : T.danger}`, borderRadius: 10, padding: "12px 20px", color: toast.ok ? T.accent : T.danger, fontSize: 13, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text1, margin: 0, fontFamily: "'Playfair Display', serif" }}>Settings</h1>
        <p style={{ fontSize: 13, color: T.text2, margin: "4px 0 0" }}>Manage your admin preferences, team, and system configuration</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${T.border}`, paddingBottom: 0 }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ padding: "9px 18px", border: "none", background: "transparent", color: activeTab === tab ? T.text1 : T.text3, fontSize: 13, fontWeight: activeTab === tab ? 700 : 400, cursor: "pointer", fontFamily: "'Lora', serif", borderBottom: `2px solid ${activeTab === tab ? T.copper : "transparent"}`, marginBottom: -1, transition: "all 0.15s" }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── General ── */}
      {activeTab === "General" && (
        <Card>
          <SectionHead title="Company Information" sub="Business details used across invoices, emails, and reports" />
          <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { label: "Company Name",  key: "name",    type: "text" },
              { label: "Email",         key: "email",   type: "email" },
              { label: "Phone",         key: "phone",   type: "tel" },
              { label: "GST Number",    key: "gst",     type: "text" },
              { label: "Website",       key: "website", type: "text" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label style={{ display: "block", fontSize: 11, color: T.text3, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</label>
                <input type={type} value={company[key]} onChange={e => setCompany(c => ({ ...c, [key]: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = T.copper}
                  onBlur={e => e.target.style.borderColor = T.border}
                />
              </div>
            ))}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: 11, color: T.text3, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Address</label>
              <input type="text" value={company.address} onChange={e => setCompany(c => ({ ...c, address: e.target.value }))}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = T.copper}
                onBlur={e => e.target.style.borderColor = T.border}
              />
            </div>
          </div>
          <div style={{ padding: "16px 24px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end" }}>
            <button onClick={saveCompany} disabled={saving} style={{ padding: "9px 24px", borderRadius: 8, border: "none", background: saving ? T.bg3 : T.copper, color: saving ? T.text3 : "#04080F", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "'Lora', serif" }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </Card>
      )}

      {/* ── Notifications ── */}
      {activeTab === "Notifications" && (
        <Card>
          <SectionHead title="Notification Preferences" sub="Choose which alerts and emails you receive" />
          <div style={{ padding: "8px 0" }}>
            {[
              { key: "lowStock",      label: "Low Stock Alerts",              sub: "Notify when any pipe falls below reorder level" },
              { key: "newOrder",      label: "New Order Notifications",       sub: "Email alert on every new order received" },
              { key: "priceApproval", label: "Price Approval Requests",       sub: "Alert when AI generates a new price for review" },
              { key: "aiAlert",       label: "AI Model Performance Alerts",   sub: "Notify if demand forecast accuracy drops below 85%" },
              { key: "weeklyReport",  label: "Weekly Summary Report",         sub: "Automated PDF report every Monday morning" },
              { key: "smsAlerts",     label: "SMS Alerts",                    sub: "Critical alerts via SMS (additional charges may apply)" },
            ].map(({ key, label, sub }) => (
              <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: `1px solid ${T.border}` }}>
                <div>
                  <div style={{ fontSize: 13, color: T.text1, fontWeight: 500, marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 11, color: T.text3 }}>{sub}</div>
                </div>
                <Toggle checked={notif[key]} onChange={v => setNotif(n => ({ ...n, [key]: v }))} />
              </div>
            ))}
          </div>
          <div style={{ padding: "16px 24px", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => showToast("Notification preferences saved")} style={{ padding: "9px 24px", borderRadius: 8, border: "none", background: T.copper, color: "#04080F", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Lora', serif" }}>
              Save Preferences
            </button>
          </div>
        </Card>
      )}

      {/* ── Users ── */}
      {activeTab === "Users" && (
        <Card>
          <SectionHead title="Team Members" sub="Manage admin portal access and roles" />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Name", "Email", "Role", "Status", "Last Active", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", fontSize: 11, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", padding: "12px 24px", borderBottom: `1px solid ${T.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {USERS.map((u, i) => (
                  <tr key={i} onMouseEnter={e => e.currentTarget.style.background = T.bg2} onMouseLeave={e => e.currentTarget.style.background = "transparent"} style={{ transition: "background 0.1s" }}>
                    <td style={{ padding: "14px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${T.copper}, #005588)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>{u.name[0]}</div>
                        <span style={{ fontSize: 13, color: T.text1, fontWeight: 500 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 24px", fontSize: 12, color: T.text2 }}>{u.email}</td>
                    <td style={{ padding: "14px 24px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, background: u.role === "Super Admin" ? "rgba(255,176,32,0.1)" : "rgba(0,180,216,0.1)", color: u.role === "Super Admin" ? T.copper : T.info, padding: "3px 9px", borderRadius: 20 }}>{u.role}</span>
                    </td>
                    <td style={{ padding: "14px 24px" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: u.status === "Active" ? T.accent : T.text3, display: "inline-block", marginRight: 6 }} />
                      <span style={{ fontSize: 12, color: u.status === "Active" ? T.accent : T.text3 }}>{u.status}</span>
                    </td>
                    <td style={{ padding: "14px 24px", fontSize: 11, color: T.text3 }}>{u.last}</td>
                    <td style={{ padding: "14px 24px" }}>
                      {u.role !== "Super Admin" && (
                        <button style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${T.border}`, background: "transparent", color: T.text2, fontSize: 11, cursor: "pointer", fontFamily: "'Lora', serif" }}>
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "16px 24px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => showToast("Invite sent! (demo)")} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: T.copper, color: "#04080F", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Lora', serif" }}>
              + Invite Member
            </button>
          </div>
        </Card>
      )}

      {/* ── AI Model ── */}
      {activeTab === "AI Model" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionHead title="AI Demand Forecast Model" sub="Configuration and performance of the pricing intelligence engine" />
            <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {Object.entries(MODEL_CONFIG).map(([k, v]) => (
                <div key={k} style={{ background: T.bg3, borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{k.replace(/([A-Z])/g, " $1")}</div>
                  <div style={{ fontSize: 13, color: T.text1, fontWeight: k === "accuracy" ? 700 : 400, color: k === "accuracy" ? T.accent : T.text1 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "14px 24px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => showToast("Retraining scheduled for next maintenance window (demo)")} style={{ padding: "9px 20px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.text2, fontSize: 12, cursor: "pointer", fontFamily: "'Lora', serif" }}>
                Schedule Retrain
              </button>
              <button onClick={() => showToast("Model diagnostics exported (demo)")} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: T.copper, color: "#04080F", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Lora', serif" }}>
                Export Diagnostics
              </button>
            </div>
          </Card>
          <Card style={{ background: "rgba(0,229,160,0.04)", border: "1px solid rgba(0,229,160,0.14)" }}>
            <div style={{ padding: "18px 24px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, marginBottom: 8 }}>How the AI Model Works</div>
              <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.7 }}>
                The Random Forest model is trained on historical pipe demand data across all 8 Maharashtra regions. It takes <strong style={{ color: T.text1 }}>crop type, season (month), region, and year</strong> as inputs and outputs a predicted monthly demand in metres. The pricing engine then applies a <strong style={{ color: T.text1 }}>regional demand multiplier</strong> to the base cost to generate the recommended selling price. Prices are advisory — approval by an admin is required before publishing.
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Security ── */}
      {activeTab === "Security" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionHead title="Change Password" sub="Admin portal password" />
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14, maxWidth: 420 }}>
              {[
                { label: "Current Password", key: "current" },
                { label: "New Password",     key: "next"    },
                { label: "Confirm Password", key: "confirm" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 11, color: T.text3, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</label>
                  <input type="password" value={pwForm[key]} onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = T.copper}
                    onBlur={e => e.target.style.borderColor = T.border}
                  />
                </div>
              ))}
              <button onClick={savePassword} style={{ padding: "10px", borderRadius: 8, border: "none", background: T.copper, color: "#04080F", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Lora', serif", marginTop: 4 }}>
                Update Password
              </button>
            </div>
          </Card>

          <Card style={{ border: "1px solid rgba(255,107,107,0.2)" }}>
            <SectionHead title="Danger Zone" sub="Irreversible actions — proceed with caution" />
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Clear All Pending Approvals", desc: "Reject all pending pricing and order approvals" },
                { label: "Reset AI Model Data",         desc: "Wipe all custom training adjustments and revert to defaults" },
                { label: "Export All Data",             desc: "Download a full backup of orders, stock, and pricing data" },
              ].map(({ label, desc }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "rgba(255,107,107,0.04)", border: "1px solid rgba(255,107,107,0.1)", borderRadius: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, color: T.text1, fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: 11, color: T.text3, marginTop: 3 }}>{desc}</div>
                  </div>
                  <button onClick={() => showToast(`${label} — action logged (demo)`, false)} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(255,107,107,0.3)", background: "transparent", color: T.danger, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Lora', serif", whiteSpace: "nowrap", marginLeft: 16 }}>
                    {label.startsWith("Export") ? "Export" : "Execute"}
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
