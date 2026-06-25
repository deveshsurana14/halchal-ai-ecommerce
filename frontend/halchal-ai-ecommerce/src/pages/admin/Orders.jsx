import { useEffect, useState } from "react";
import API_BASE from "../../config";

const T = {
  bg0: "#05070E", bg1: "#0B1120", bg2: "#111B30", bg3: "#18253E",
  amber: "#F5A623", amberSoft: "rgba(245,166,35,0.09)", amberBorder: "rgba(245,166,35,0.22)",
  green: "#00D68F", greenSoft: "rgba(0,214,143,0.09)", greenBorder: "rgba(0,214,143,0.22)",
  sky: "#38C0FF",   skySoft: "rgba(56,192,255,0.09)",
  rose: "#FF5577",  roseSoft: "rgba(255,85,119,0.09)",
  border: "rgba(255,255,255,0.07)",
  t1: "#EBF0FF", t2: "#7A98B8", t3: "#3F5470",
  font: "'Inter', system-ui, sans-serif",
};

const MOCK_ORDERS = [
  { _id:"1",  pipe_type:"16mm Inline", quantity:4,  region:"Pune",       status:"Approved",         customer:"Ramesh Agro Farms",       amount:4720,  date:"2026-05-07", requires_approval:false },
  { _id:"2",  pipe_type:"20mm Inline", quantity:3,  region:"Nashik",     status:"Pending Approval", customer:"Grapes Valley Estate",     amount:4560,  date:"2026-05-07", requires_approval:true  },
  { _id:"3",  pipe_type:"16mm Online", quantity:6,  region:"Kolhapur",   status:"Shipped",          customer:"Sugarcane Growers Co.",    amount:8100,  date:"2026-05-06", requires_approval:false },
  { _id:"4",  pipe_type:"20mm Online", quantity:2,  region:"Solapur",    status:"Pending Approval", customer:"Pomegranate Farm Suresh",  amount:3360,  date:"2026-05-06", requires_approval:true  },
  { _id:"5",  pipe_type:"16mm Inline", quantity:8,  region:"Aurangabad", status:"Approved",         customer:"Cotton Fields Ltd.",       amount:9440,  date:"2026-05-05", requires_approval:false },
  { _id:"6",  pipe_type:"16mm Online", quantity:3,  region:"Nagpur",     status:"Shipped",          customer:"Nagpur Agri Corp",         amount:4050,  date:"2026-05-05", requires_approval:false },
  { _id:"7",  pipe_type:"20mm Inline", quantity:4,  region:"Kolhapur",   status:"Pending Approval", customer:"Deccan Farms",             amount:6080,  date:"2026-05-04", requires_approval:true  },
  { _id:"8",  pipe_type:"16mm Inline", quantity:5,  region:"Jalgaon",    status:"Approved",         customer:"Jalgaon Banana Growers",   amount:5900,  date:"2026-05-04", requires_approval:false },
  { _id:"9",  pipe_type:"20mm Online", quantity:2,  region:"Amravati",   status:"Cancelled",        customer:"Amravati Cotton Co.",      amount:3360,  date:"2026-05-03", requires_approval:false },
  { _id:"10", pipe_type:"16mm Inline", quantity:1,  region:"Pune",       status:"Shipped",          customer:"Pune Vegetable Nursery",   amount:1180,  date:"2026-05-03", requires_approval:false },
];

const STATUS_CFG = {
  "Approved":         { bg: "rgba(0,214,143,0.09)",  color: "#00D68F", dot: "#00D68F"  },
  "Pending Approval": { bg: "rgba(245,166,35,0.09)", color: "#F5A623", dot: "#F5A623"  },
  "Shipped":          { bg: "rgba(56,192,255,0.09)", color: "#38C0FF", dot: "#38C0FF"  },
  "Cancelled":        { bg: "rgba(255,85,119,0.09)", color: "#FF5577", dot: "#FF5577"  },
};

const Badge = ({ status }) => {
  const s = STATUS_CFG[status] || { bg: T.bg3, color: T.t2, dot: T.t2 };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.color, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }} />
      {status}
    </span>
  );
};

export default function Orders() {
  const [orders,   setOrders]   = useState(MOCK_ORDERS);
  const [filter,   setFilter]   = useState("All");
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(false);
  const [toast,    setToast]    = useState(null);
  const [expanded, setExpanded] = useState(null);

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/orders`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length) setOrders(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const approveOrder = async (id) => {
    try { await fetch(`${API_BASE}/api/orders/approve/${id}`, { method: "POST" }); } catch {}
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status: "Approved", requires_approval: false } : o));
    showToast("Order approved successfully");
  };

  const cancelOrder = (id) => {
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status: "Cancelled", requires_approval: false } : o));
    showToast("Order cancelled", false);
  };

  const TABS = ["All", "Pending Approval", "Approved", "Shipped", "Cancelled"];
  const filtered = orders.filter(o => {
    const okFilter = filter === "All" || o.status === filter;
    const okSearch = !search || [o.customer, o.pipe_type, o.region].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    return okFilter && okSearch;
  });

  const stats = {
    total:    orders.length,
    pending:  orders.filter(o => o.status === "Pending Approval").length,
    approved: orders.filter(o => o.status === "Approved").length,
    shipped:  orders.filter(o => o.status === "Shipped").length,
    revenue:  orders.filter(o => o.status !== "Cancelled").reduce((s, o) => s + (o.amount || 0), 0),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, fontFamily: T.font }}>

      {toast && (
        <div style={{ position: "fixed", top: 22, right: 26, zIndex: 9999, background: toast.ok ? T.greenSoft : T.roseSoft, border: `1px solid ${toast.ok ? T.greenBorder : "rgba(255,85,119,0.3)"}`, borderRadius: 12, padding: "12px 22px", color: toast.ok ? T.green : T.rose, fontSize: 13, fontWeight: 600, boxShadow: "0 10px 40px rgba(0,0,0,0.45)", animation: "slideUp 0.22s ease both" }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ animation: "slideUp 0.3s ease both" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: T.t1, margin: 0, fontFamily: "'DM Serif Display', Georgia, serif" }}>Orders</h1>
        <p style={{ fontSize: 13, color: T.t2, margin: "4px 0 0" }}>Manage and approve incoming orders across all regions</p>
      </div>

      {/* Pending alert banner */}
      {stats.pending > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: T.amberSoft, border: `1px solid ${T.amberBorder}`, borderRadius: 12, padding: "13px 20px", animation: "slideUp 0.3s ease both", animationDelay: "30ms" }}>
          <span style={{ fontSize: 18 }}>⏳</span>
          <div style={{ fontSize: 13, color: T.t1 }}>
            <strong style={{ color: T.amber }}>{stats.pending} order{stats.pending > 1 ? "s" : ""}</strong>{" "}
            need your approval — use the filter below to find them quickly.
          </div>
          <button onClick={() => setFilter("Pending Approval")} style={{ marginLeft: "auto", padding: "7px 16px", borderRadius: 8, border: `1px solid ${T.amberBorder}`, background: T.amberSoft, color: T.amber, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.font, whiteSpace: "nowrap" }}>
            View Pending →
          </button>
        </div>
      )}

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
        {[
          { label: "Total Orders",  value: stats.total,    color: T.t1    },
          { label: "Pending",       value: stats.pending,  color: T.amber },
          { label: "Approved",      value: stats.approved, color: T.green },
          { label: "Shipped",       value: stats.shipped,  color: T.sky   },
          { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, color: T.green },
        ].map(({ label, value, color }, i) => (
          <div key={label} style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 18px", animation: "slideUp 0.35s ease both", animationDelay: `${i * 40}ms` }}>
            <div style={{ fontSize: 10, color: T.t3, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 18px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", animation: "slideUp 0.35s ease both", animationDelay: "140ms" }}>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setFilter(tab)} style={{
              padding: "6px 14px", borderRadius: 20,
              border: `1px solid ${filter === tab ? T.amberBorder : T.border}`,
              background: filter === tab ? T.amberSoft : "transparent",
              color: filter === tab ? T.amber : T.t2,
              fontSize: 12, fontWeight: filter === tab ? 700 : 400, cursor: "pointer",
              fontFamily: T.font, transition: "all 0.15s",
            }}>{tab}</button>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by customer, pipe type, region…"
            style={{ width: "100%", boxSizing: "border-box", background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 12px", color: T.t1, fontSize: 12, fontFamily: T.font, outline: "none" }}
            onFocus={e => e.target.style.borderColor = T.amber}
            onBlur={e => e.target.style.borderColor = T.border}
          />
        </div>
        <div style={{ fontSize: 12, color: T.t3 }}>{filtered.length} orders</div>
      </div>

      {/* Orders table */}
      <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", animation: "slideUp 0.35s ease both", animationDelay: "180ms" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: T.t3, fontSize: 13 }}>Loading orders…</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  {["#", "Customer", "Pipe Type", "Qty", "Region", "Amount", "Date", "Status", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", fontSize: 10, color: T.t3, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", padding: "14px 16px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => (
                  <>
                    <tr
                      key={order._id}
                      style={{ borderBottom: `1px solid ${T.border}`, cursor: "pointer", transition: "background 0.12s" }}
                      onMouseEnter={e => e.currentTarget.style.background = T.bg2}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                    >
                      <td style={{ padding: "13px 16px", fontSize: 11, color: T.t3 }}>{i + 1}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: T.t1, fontWeight: 500 }}>{order.customer || "—"}</td>
                      <td style={{ padding: "13px 16px", fontSize: 12, color: T.t2 }}>{order.pipe_type}</td>
                      <td style={{ padding: "13px 16px", fontSize: 12, color: T.t2 }}>{order.quantity} bundle{order.quantity !== 1 ? "s" : ""}</td>
                      <td style={{ padding: "13px 16px", fontSize: 12, color: T.t2 }}>{order.region}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: T.green, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>₹{(order.amount || 0).toLocaleString()}</td>
                      <td style={{ padding: "13px 16px", fontSize: 11, color: T.t3 }}>{order.date || "—"}</td>
                      <td style={{ padding: "13px 16px" }}><Badge status={order.status} /></td>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                          {order.requires_approval && (
                            <button onClick={() => approveOrder(order._id)} style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: T.greenSoft, color: T.green, fontSize: 11, fontWeight: 700, cursor: "pointer", border: `1px solid ${T.greenBorder}` }}>
                              Approve
                            </button>
                          )}
                          {order.status !== "Cancelled" && order.status !== "Shipped" && (
                            <button onClick={() => cancelOrder(order._id)} style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid rgba(255,85,119,0.2)", background: T.roseSoft, color: T.rose, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                              Cancel
                            </button>
                          )}
                          {!order.requires_approval && order.status === "Approved" && (
                            <span style={{ fontSize: 11, color: T.t3, padding: "5px 0" }}>—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expanded === order._id && (
                      <tr key={`${order._id}-d`} style={{ background: T.bg2, borderBottom: `1px solid ${T.border}` }}>
                        <td colSpan={9} style={{ padding: "14px 24px" }}>
                          <div style={{ display: "flex", gap: 28, fontSize: 12, color: T.t2, flexWrap: "wrap" }}>
                            <div><span style={{ color: T.t3 }}>Order ID: </span><span style={{ color: T.t1, fontFamily: "monospace" }}>ORD-{String(order._id).padStart(5, "0")}</span></div>
                            <div><span style={{ color: T.t3 }}>Pipe: </span>{order.pipe_type}</div>
                            <div><span style={{ color: T.t3 }}>Qty: </span>{order.quantity} bundle{order.quantity !== 1 ? "s" : ""} ({(order.quantity * 300).toLocaleString()}m)</div>
                            <div><span style={{ color: T.t3 }}>Region: </span>{order.region}</div>
                            <div><span style={{ color: T.t3 }}>Amount: </span><span style={{ color: T.green, fontWeight: 700 }}>₹{(order.amount || 0).toLocaleString()}</span></div>
                            <div><span style={{ color: T.t3 }}>Status: </span>{order.status}</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ padding: 48, textAlign: "center", color: T.t3, fontSize: 13 }}>No orders match your filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
