import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

const T = {
  bg0: "#05070F", bg1: "#080D1C", bg2: "#0D1628", bg3: "#121F38",
  accent: "#00E5A0", accentDk: "#00C080", copper: "#FFB020",
  border: "rgba(255,255,255,0.07)", borderMd: "rgba(255,255,255,0.15)",
  text1: "#EEF3FF", text2: "#7A9EC6", text3: "#3D5A7A",
  purple: "#8677FF", blue: "#00AEFF",
  error: "#FF6060",
};

const PROFILE_KEY = "halchal_profile_v1";

const DEFAULT_PROFILE = {
  fullName:     "Hrishikesh",
  email:        "hrishikesh@gmail.com",
  phone:        "",
  company:      "",
  gst:          "",
  businessType: "Individual / Farmer",
  state:        "Maharashtra",
  pincode:      "",
  address:      "",
};

const STATES = [
  "Andhra Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Jammu & Kashmir","Ladakh",
];

const BUSINESS_TYPES = [
  "Individual / Farmer",
  "Agricultural Contractor",
  "Pipe Dealer / Distributor",
  "Project Developer",
  "Government / NGO",
  "Other",
];

const css = `
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(0,229,160,0.35);} 70%{box-shadow:0 0 0 8px rgba(0,229,160,0);} 100%{box-shadow:0 0 0 0 rgba(0,229,160,0);} }

  .profile-fade { animation: fadeUp 0.4s ease both; }

  .profile-tab {
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px; font-weight: 500;
    cursor: pointer;
    border: none;
    background: transparent;
    color: ${T.text2};
    font-family: 'Lora', serif;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
  }
  .profile-tab:hover { background: ${T.bg3}; color: ${T.text1}; }
  .profile-tab.active {
    background: rgba(0,229,160,0.10);
    color: ${T.accent};
    font-weight: 600;
  }

  .profile-input {
    width: 100%;
    background: ${T.bg3};
    border: 1px solid ${T.border};
    border-radius: 10px;
    color: ${T.text1};
    font-family: 'Lora', serif;
    font-size: 14px;
    padding: 12px 16px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }
  .profile-input::placeholder { color: ${T.text3}; }
  .profile-input:focus { border-color: ${T.accent}; box-shadow: 0 0 0 3px rgba(0,229,160,0.08); }
  .profile-input:disabled { opacity: 0.5; cursor: default; }

  .profile-card {
    background: ${T.bg2};
    border: 1px solid ${T.border};
    border-radius: 16px;
    padding: 28px;
    margin-bottom: 20px;
  }

  .info-row {
    display: flex; align-items: flex-start; gap: 16px;
    padding: 14px 0;
    border-bottom: 1px solid ${T.border};
  }
  .info-row:last-child { border-bottom: none; padding-bottom: 0; }

  .save-btn {
    background: ${T.accent}; color: #04080F;
    border: none; border-radius: 10px;
    padding: 12px 28px;
    font-size: 14px; font-weight: 700;
    font-family: 'Lora', serif;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
  }
  .save-btn:hover { background: #00F0A0; transform: translateY(-1px); }
  .save-btn:disabled { background: ${T.bg3}; color: ${T.text3}; cursor: not-allowed; transform: none; }

  .cancel-btn {
    background: transparent; color: ${T.text2};
    border: 1.5px solid ${T.borderMd}; border-radius: 10px;
    padding: 11px 22px;
    font-size: 14px; font-weight: 500;
    font-family: 'Lora', serif;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .cancel-btn:hover { border-color: ${T.accent}; color: ${T.text1}; }

  .danger-btn {
    background: transparent; color: ${T.error};
    border: 1px solid rgba(255,96,96,0.25); border-radius: 8px;
    padding: 10px 20px;
    font-size: 13px; font-family: 'Lora', serif;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }
  .danger-btn:hover { background: rgba(255,96,96,0.07); border-color: rgba(255,96,96,0.5); }

  .stat-pill {
    background: ${T.bg3};
    border: 1px solid ${T.border};
    border-radius: 12px;
    padding: 16px 20px;
    text-align: center;
    flex: 1;
    min-width: 110px;
  }

  .footer-link {
    color: ${T.text2}; font-size: 14px; text-decoration: none;
    transition: color 0.2s; display: block; padding: 4px 0;
  }
  .footer-link:hover { color: ${T.text1}; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${T.bg1}; }
  ::-webkit-scrollbar-thumb { background: ${T.bg3}; border-radius: 3px; }
`;

/* ─── Field label ─────────────────────────────────────────────────────── */
const Label = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{children}</div>
);

/* ─── Read-only row ───────────────────────────────────────────────────── */
const InfoRow = ({ icon, label, value, placeholder = "Not set" }) => (
  <div className="info-row">
    <div style={{ width: 34, height: 34, borderRadius: 8, background: T.bg3, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, color: value ? T.text1 : T.text3, fontWeight: value ? 500 : 400 }}>{value || placeholder}</div>
    </div>
  </div>
);

/* ─── Profile page ────────────────────────────────────────────────────── */
const Profile = () => {
  const navigate = useNavigate();
  const { items, grandTotalWithGST, itemCount } = useCart();

  const [profile, setProfile]     = useState(DEFAULT_PROFILE);
  const [draft,   setDraft]       = useState(DEFAULT_PROFILE);
  const [editing, setEditing]     = useState(false);
  const [saving,  setSaving]      = useState(false);
  const [saved,   setSaved]       = useState(false);
  const [tab,     setTab]         = useState("overview");
  const [memberSince] = useState(() => {
    const stored = localStorage.getItem("halchal_member_since");
    if (stored) return stored;
    const date = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    localStorage.setItem("halchal_member_since", date);
    return date;
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setProfile(parsed);
        setDraft(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  const set = (field) => (e) => setDraft(d => ({ ...d, [field]: e.target.value }));

  const handleEdit  = () => { setDraft({ ...profile }); setEditing(true); setSaved(false); };
  const handleCancel = () => { setDraft({ ...profile }); setEditing(false); };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    localStorage.setItem(PROFILE_KEY, JSON.stringify(draft));
    setProfile({ ...draft });
    setSaving(false);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Compute cart-based stats
  const totalCoils   = items.reduce((s, i) => s + (i.quantity || 0), 0);
  const totalSpend   = grandTotalWithGST;
  const initials     = (profile.fullName || "H").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  const tabContent = {

    /* ── Overview tab ───────────────────────── */
    overview: (
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24, alignItems: "start" }}>

        {/* Left: Personal + Business */}
        <div>
          {/* Personal Information */}
          <div className="profile-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: T.text1 }}>Personal Information</h3>
              {!editing
                ? <button onClick={handleEdit} style={{ background: T.bg3, border: `1px solid ${T.border}`, color: T.text2, padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Lora',serif" }}>Edit Profile</button>
                : <div style={{ display: "flex", gap: 10 }}>
                    <button className="save-btn" onClick={handleSave} disabled={saving} style={{ padding: "8px 20px", fontSize: 13 }}>
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                    <button className="cancel-btn" onClick={handleCancel} style={{ padding: "7px 16px", fontSize: 13 }}>Cancel</button>
                  </div>
              }
            </div>

            {saved && (
              <div style={{ background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.25)", borderRadius: 10, padding: "10px 16px", marginBottom: 18, fontSize: 13, color: T.accent, display: "flex", alignItems: "center", gap: 8 }}>
                ✓ Profile saved successfully
              </div>
            )}

            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <Label>Full Name</Label>
                    <input className="profile-input" value={draft.fullName} onChange={set("fullName")} placeholder="Your full name" />
                  </div>
                  <div>
                    <Label>Email Address</Label>
                    <input className="profile-input" type="email" value={draft.email} onChange={set("email")} placeholder="you@email.com" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <Label>Phone Number</Label>
                    <input className="profile-input" type="tel" value={draft.phone} onChange={set("phone")} placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <Label>State</Label>
                    <select className="profile-input" value={draft.state} onChange={set("state")} style={{ cursor: "pointer" }}>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Delivery Address</Label>
                  <input className="profile-input" value={draft.address} onChange={set("address")} placeholder="Street address, city" />
                </div>
                <div>
                  <Label>Pincode</Label>
                  <input className="profile-input" value={draft.pincode} onChange={set("pincode")} placeholder="e.g. 411026" maxLength={6} style={{ width: 160 }} />
                </div>
              </div>
            ) : (
              <>
                <InfoRow icon="👤" label="Full Name"    value={profile.fullName} />
                <InfoRow icon="✉️" label="Email"        value={profile.email} />
                <InfoRow icon="📞" label="Phone"        value={profile.phone} />
                <InfoRow icon="📍" label="State"        value={profile.state} />
                <InfoRow icon="🏠" label="Address"      value={profile.address} />
                <InfoRow icon="📮" label="Pincode"      value={profile.pincode} />
              </>
            )}
          </div>

          {/* Business Details */}
          <div className="profile-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: T.text1 }}>Business Details</h3>
              {!editing && (
                <span style={{ fontSize: 11, color: T.text3 }}>Edit above to update</span>
              )}
            </div>

            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <Label>Company / Farm Name</Label>
                  <input className="profile-input" value={draft.company} onChange={set("company")} placeholder="e.g. Surana Agro Farms" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <Label>GST Number</Label>
                    <input className="profile-input" value={draft.gst} onChange={set("gst")} placeholder="27AAAAA0000A1Z5" maxLength={15} style={{ fontFamily: "monospace", letterSpacing: "0.04em" }} />
                  </div>
                  <div>
                    <Label>Business Type</Label>
                    <select className="profile-input" value={draft.businessType} onChange={set("businessType")} style={{ cursor: "pointer" }}>
                      {BUSINESS_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <InfoRow icon="🏢" label="Company / Farm"   value={profile.company} />
                <InfoRow icon="🧾" label="GST Number"       value={profile.gst} />
                <InfoRow icon="💼" label="Business Type"    value={profile.businessType} />
              </>
            )}
          </div>
        </div>

        {/* Right: Account summary + quick links */}
        <div>
          {/* Account Summary */}
          <div className="profile-card">
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: T.text1, marginBottom: 20 }}>Account Summary</h3>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              {[
                { label: "Cart Items", value: itemCount,    color: T.accent },
                { label: "Total Coils",value: totalCoils,   color: T.copper },
                { label: "Cart Value", value: totalSpend > 0 ? `₹${Math.round(totalSpend).toLocaleString("en-IN")}` : "₹0", color: T.purple },
              ].map(({ label, value, color }) => (
                <div key={label} className="stat-pill">
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, color, marginBottom: 4 }}>{value}</div>
                  <div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Account Status",    value: "Active",         badge: { text: "Verified", color: T.accent, bg: "rgba(0,229,160,0.10)" } },
                { label: "Account Type",      value: "Customer",       badge: null },
                { label: "Member Since",      value: memberSince,      badge: null },
                { label: "Pricing Model",     value: "AI Dynamic",     badge: { text: "Live", color: T.copper, bg: "rgba(255,176,32,0.10)" } },
                { label: "GST Invoice",       value: "Included on every order", badge: null },
              ].map(({ label, value, badge }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 13, color: T.text3 }}>{label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: T.text1 }}>{value}</span>
                    {badge && (
                      <span style={{ fontSize: 10, fontWeight: 700, background: badge.bg, color: badge.color, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{badge.text}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="profile-card">
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: T.text1, marginBottom: 16 }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Browse Products",   icon: "🛍️", path: "/products", color: T.accent  },
                { label: "View Cart",         icon: "🛒", path: "/cart",     color: T.copper  },
                { label: "Contact Support",   icon: "💬", path: "/contact",  color: T.blue    },
                { label: "About Halchal",     icon: "ℹ️",  path: "/about",   color: T.purple  },
              ].map(({ label, icon, path, color }) => (
                <div
                  key={label}
                  onClick={() => navigate(path)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 10, cursor: "pointer", transition: "border-color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = T.borderMd}
                  onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                >
                  <span style={{ fontSize: 16 }}>{icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: T.text1, flex: 1 }}>{label}</span>
                  <span style={{ color, fontSize: 14 }}>→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),

    /* ── Orders tab ─────────────────────────── */
    orders: (
      <div>
        {/* Order stats */}
        <div className="profile-card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: T.text1, marginBottom: 20 }}>Session Order Summary</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14 }}>
            {[
              { label: "Products in Cart", value: itemCount,    color: T.accent },
              { label: "Total Coils",      value: totalCoils,   color: T.copper },
              { label: "Ex-GST Value",     value: totalSpend > 0 ? `₹${Math.round(totalSpend * (100/112)).toLocaleString("en-IN")}` : "₹0", color: T.text2 },
              { label: "Total (incl. GST)", value: totalSpend > 0 ? `₹${Math.round(totalSpend).toLocaleString("en-IN")}` : "₹0", color: T.purple },
            ].map(({ label, value, color }) => (
              <div key={label} className="stat-pill">
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 800, color, marginBottom: 5 }}>{value}</div>
                <div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart items */}
        {items.length === 0 ? (
          <div className="profile-card" style={{ textAlign: "center", padding: "60px 40px" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🛒</div>
            <h4 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: T.text1, marginBottom: 10 }}>No active orders</h4>
            <p style={{ color: T.text2, fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>Your cart is empty. Browse our products to get an AI-powered live price.</p>
            <button onClick={() => navigate("/products")} style={{ background: T.accent, color: "#04080F", border: "none", padding: "12px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: "'Lora',serif", cursor: "pointer" }}>
              Browse Products →
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: T.text1 }}>Current Cart ({itemCount} item{itemCount !== 1 ? "s" : ""})</h3>
              <button onClick={() => navigate("/cart")} style={{ background: T.accent, color: "#04080F", border: "none", padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: "'Lora',serif", cursor: "pointer" }}>
                Go to Cart →
              </button>
            </div>
            {items.map((item) => (
              <div key={item.id} className="profile-card" style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: T.text1, marginBottom: 4 }}>{item.name}</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {[
                        item.quantity + " coil" + (item.quantity !== 1 ? "s" : ""),
                        item.state,
                        item.season + " season",
                        item.zone + " zone",
                      ].map(tag => (
                        <span key={tag} style={{ fontSize: 11, color: T.text3, background: T.bg3, padding: "2px 8px", borderRadius: 4 }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: T.text3, marginBottom: 3 }}>Total (incl. GST)</div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, color: T.accent }}>₹{item.totalWithGST?.toLocaleString("en-IN")}</div>
                    {item.discountPercent > 0 && (
                      <div style={{ fontSize: 11, color: T.accent, marginTop: 3 }}>−{item.discountPercent}% bulk discount applied</div>
                    )}
                  </div>
                </div>
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.border}`, display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {[
                    ["AI Price / Coil", `₹${item.approvedPrice?.toLocaleString("en-IN")}`],
                    ["Final Price / Coil", `₹${item.finalPrice?.toLocaleString("en-IN")}`],
                    ["Subtotal (ex-GST)", `₹${item.totalExGST?.toLocaleString("en-IN")}`],
                    ["GST @ 12%", `₹${item.totalGST?.toLocaleString("en-IN")}`],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: 10, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{k}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text2 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order history note */}
        <div style={{ background: T.bg2, border: `1px dashed ${T.border}`, borderRadius: 14, padding: "22px 26px", display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 24 }}>📋</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text1, marginBottom: 4 }}>Full Order History</div>
            <div style={{ fontSize: 12, color: T.text3 }}>Complete order history with GST invoices and dispatch tracking will be available here once account-based authentication is enabled.</div>
          </div>
        </div>
      </div>
    ),

    /* ── Security tab ───────────────────────── */
    security: (
      <div>
        {/* Password */}
        <div className="profile-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: T.text1, marginBottom: 4 }}>Password</h3>
              <p style={{ fontSize: 13, color: T.text3 }}>Last changed: account creation</p>
            </div>
            <button style={{ background: T.bg3, border: `1px solid ${T.border}`, color: T.text2, padding: "8px 16px", borderRadius: 8, fontSize: 12, fontFamily: "'Lora',serif", cursor: "pointer" }}>Change Password</button>
          </div>
          <div style={{ background: T.bg3, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 18 }}>🔒</span>
            <div>
              <div style={{ fontSize: 13, color: T.text1, fontWeight: 500 }}>••••••••••••</div>
              <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>We recommend using at least 12 characters with a mix of letters, numbers and symbols</div>
            </div>
          </div>
        </div>

        {/* Active session */}
        <div className="profile-card">
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: T.text1, marginBottom: 20 }}>Active Session</h3>
          <div style={{ background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(0,229,160,0.10)", border: "1px solid rgba(0,229,160,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>💻</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text1, marginBottom: 3 }}>Current Device</div>
                  <div style={{ fontSize: 12, color: T.text3 }}>{navigator.userAgent.includes("Chrome") ? "Chrome" : "Web Browser"} · {profile.state || "Unknown location"}</div>
                  <div style={{ fontSize: 11, color: T.accent, marginTop: 4 }}>● Active now</div>
                </div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(0,229,160,0.10)", color: T.accent, padding: "3px 10px", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Current</span>
            </div>
          </div>
        </div>

        {/* Two-factor */}
        <div className="profile-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: T.text1, marginBottom: 4 }}>Two-Factor Authentication</h3>
              <p style={{ fontSize: 13, color: T.text3 }}>Add an extra layer of security to your account</p>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(255,176,32,0.10)", color: T.copper, padding: "3px 10px", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Not Set</span>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["SMS OTP", "Authenticator App", "Email OTP"].map(method => (
              <div key={method} style={{ background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 18px", flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.text2, marginBottom: 8 }}>{method}</div>
                <button style={{ background: "transparent", border: `1px solid ${T.borderMd}`, color: T.text2, padding: "6px 14px", borderRadius: 6, fontSize: 12, fontFamily: "'Lora',serif", cursor: "pointer" }}>Setup</button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div style={{ background: "rgba(255,96,96,0.04)", border: "1px solid rgba(255,96,96,0.15)", borderRadius: 16, padding: "28px" }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: T.error, marginBottom: 6 }}>Danger Zone</h3>
          <p style={{ fontSize: 13, color: T.text3, marginBottom: 20 }}>Irreversible actions — proceed with caution.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="danger-btn">Export My Data</button>
            <button className="danger-btn">Deactivate Account</button>
            <button className="danger-btn">Delete Account</button>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: T.bg0, color: T.text1 }}>
        <Navbar />

        {/* ── Profile Banner ────────────────────────────────── */}
        <div style={{ background: T.bg1, borderBottom: `1px solid ${T.border}`, position: "relative", overflow: "hidden" }}>
          {/* Background mesh */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 80% at 30% 50%, rgba(0,229,160,0.05), transparent)` }} />

          <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "48px 40px 40px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 28, flexWrap: "wrap" }}>
              {/* Avatar */}
              <div style={{ position: "relative" }}>
                <div style={{ width: 88, height: 88, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accentDk}, #0066CC)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 800, color: "#fff", border: `3px solid ${T.borderMd}` }}>
                  {initials}
                </div>
                {/* Verified dot */}
                <div style={{ position: "absolute", bottom: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: T.accent, border: `2px solid ${T.bg1}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>✓</div>
              </div>

              {/* Name + meta */}
              <div style={{ flex: 1, minWidth: 200, paddingBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
                  <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(20px,3vw,28px)", fontWeight: 800, color: T.text1 }}>{profile.fullName || "User"}</h1>
                  <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(0,229,160,0.12)", color: T.accent, padding: "3px 10px", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>Verified Customer</span>
                </div>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {[
                    profile.email && { icon: "✉️", text: profile.email },
                    { icon: "📍", text: profile.state || "Maharashtra" },
                    { icon: "🗓️", text: `Member since ${memberSince}` },
                    profile.businessType && { icon: "💼", text: profile.businessType },
                  ].filter(Boolean).map(({ icon, text }) => (
                    <span key={text} style={{ fontSize: 13, color: T.text3, display: "flex", alignItems: "center", gap: 5 }}>
                      {icon} {text}
                    </span>
                  ))}
                </div>
              </div>

              {/* Header stats */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[
                  { label: "Cart Items",  value: itemCount,   color: T.accent  },
                  { label: "Total Coils", value: totalCoils,  color: T.copper  },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ textAlign: "center", background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 20px" }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 800, color }}>{value}</div>
                    <div style={{ fontSize: 10, color: T.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────── */}
        <div style={{ background: T.bg1, borderBottom: `1px solid ${T.border}`, padding: "0 40px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 4, overflowX: "auto" }}>
            {[
              { id: "overview", label: "Overview",  icon: "👤" },
              { id: "orders",   label: "Orders",    icon: "📦" },
              { id: "security", label: "Security",  icon: "🔒" },
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                className={`profile-tab${tab === id ? " active" : ""}`}
                onClick={() => setTab(id)}
                style={{ paddingTop: 16, paddingBottom: 16 }}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ──────────────────────────────────── */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 40px 80px" }}>
          <div className="profile-fade" key={tab}>
            {tabContent[tab]}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
