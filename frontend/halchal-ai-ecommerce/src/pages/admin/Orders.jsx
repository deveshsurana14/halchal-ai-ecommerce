import { useEffect, useState } from "react";

const T = {
  bg0: "#04080F", bg1: "#07101E", bg2: "#0B1628", bg3: "#101F35",
  accent: "#00E5A0", copper: "#FFB020", danger: "#FF6B6B", info: "#00B4D8",
  border: "rgba(255,255,255,0.07)", borderMd: "rgba(255,255,255,0.13)",
  text1: "#EEF3FF", text2: "#7A9EC6", text3: "#3D5A7A",
};

// quantity = number of bundles (1 bundle = 300m coil); amount = ₹ total for the order
const MOCK_ORDERS = [
  { _id: "1",  pipe_type: "16mm Inline", quantity: 4,  region: "Pune",       status: "Approved",         customer: "Ramesh Agro Farms",      amount: 4720,  date: "2026-05-07", requires_approval: false },
  { _id: "2",  pipe_type: "20mm Inline", quantity: 3,  region: "Nashik",     status: "Pending Approval", customer: "Grapes Valley Estate",    amount: 4560,  date: "2026-05-07", requires_approval: true  },
  { _id: "3",  pipe_type: "16mm Online", quantity: 6,  region: "Kolhapur",   status: "Shipped",          customer: "Sugarcane Growers Co.",   amount: 8100,  date: "2026-05-06", requires_approval: false },
  { _id: "4",  pipe_type: "20mm Online", quantity: 2,  region: "Solapur",    status: "Pending Approval", customer: "Pomegranate Farm Suresh", amount: 3360,  date: "2026-05-06", requires_approval: true  },
  { _id: "5",  pipe_type: "16mm Inline", quantity: 8,  region: "Aurangabad", status: "Approved",         customer: "Cotton Fields Ltd.",      amount: 9440,  date: "2026-05-05", requires_approval: false },
  { _id: "6",  pipe_type: "16mm Online", quantity: 3,  region: "Nagpur",     status: "Shipped",          customer: "Nagpur Agri Corp",        amount: 4050,  date: "2026-05-05", requires_approval: false },
  { _id: "7",  pipe_type: "20mm Inline", quantity: 4,  region: "Kolhapur",   status: "Pending Approval", customer: "Deccan Farms",            amount: 6080,  date: "2026-05-04", requires_approval: true  },
  { _id: "8",  pipe_type: "16mm Inline", quantity: 5,  region: "Jalgaon",    status: "Approved",         customer: "Jalgaon Banana Growers",  amount: 5900,  date: "2026-05-04", requires_approval: false },
  { _id: "9",  pipe_type: "20mm Online", quantity: 2,  region: "Amravati",   status: "Cancelled",        customer: "Amravati Cotton Co.",     amount: 3360,  date: "2026-05-03", requires_approval: false },
  { _id: "10", pipe_type: "16mm Inline", quantity: 1,  region: "Pune",       status: "Shipped",          customer: "Pune Vegetable Nursery",  amount: 1180,  date: "2026-05-03", requires_approval: false },
];

const STATUS_CONFIG = {
  "Approved":         { bg: "rgba(0,229,160,0.10)",  color: "#00E5A0", dot: "#00E5A0" },
  "Pending Approval": { bg: "rgba(255,176,32,0.10)", color: "#FFB020", dot: "#FFB020" },
  "Shipped":          { bg: "rgba(0,180,216,0.10)",  color: "#00B4D8", dot: "#00B4D8" },
  "Cancelled":        { bg: "rgba(255,107,107,0.10)",color: "#FF6B6B", dot: "#FF6B6B" },
};

const Badge = ({ status }) => {
  const s = STATUS_CONFIG[status] || { bg: T.bg3, color: T.text2, dot: T.text2 };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.color, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }} />
      {status}
    </span>
  );
};

const Card = ({ children, style }) => (
  <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, ...style }}>
    {children}
  </div>
);

export default function Orders() {
  const [orders,  setOrders]  = useState(MOCK_ORDERS);
  const [filter,  setFilter]  = useState("All");
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState(null);
  const [expanded, setExpanded] = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/orders")
      .then(r => r.json())
      .then(d => { if (d?.length) setOrders(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const approveOrder = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/orders/approve/${id}`, { method: "POST" });
    } catch {}
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status: "Approved", requires_approval: false } : o));
    showToast("Order approved successfully");
  };

  const cancelOrder = (id) => {
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status: "Cancelled", requires_approval: false } : o));
    showToast("Order cancelled", false);
  };

  const STATUS_TABS = ["All", "Pending Approval", "Approved", "Shipped", "Cancelled"];
  const filtered = orders.filter(o => {
    const matchFilter = filter === "All" || o.status === filter;
    const matchSearch = !search || [o.customer, o.pipe_type, o.region].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const stats = {
    total:    orders.length,
    pending:  orders.filter(o => o.status === "Pending Approval").length,
    approved: orders.filter(o => o.status === "Approved").length,
    shipped:  orders.filter(o => o.status === "Shipped").length,
    revenue:  orders.filter(o => o.status !== "Cancelled").reduce((s, o) => s + (o.amount || 0), 0),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 24, zIndex: 9999, background: toast.ok ? "rgba(0,229,160,0.12)" : "rgba(255,107,107,0.12)", border: `1px solid ${toast.ok ? T.accent : T.danger}`, borderRadius: 10, padding: "12px 20px", color: toast.ok ? T.accent : T.danger, fontSize: 13, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text1, margin: 0, fontFamily: "'Playfair Display', serif" }}>Orders</h1>
        <p style={{ fontSize: 13, color: T.text2, margin: "4px 0 0" }}>Manage and approve incoming orders across all regions</p>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {[
          { label: "Total Orders",    value: stats.total,    color: T.text1 },
          { label: "Pending",         value: stats.pending,  color: T.copper },
          { label: "Approved",        value: stats.approved, color: T.accent },
          { label: "Shipped",         value: stats.shipped,  color: T.info },
          { label: "Total Revenue",   value: `₹${stats.revenue.toLocaleString()}`, color: T.accent },
        ].map(({ label, value, color }) => (
          <Card key={label} style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: T.text3, marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "monospace" }}>{value}</div>
          </Card>
        ))}
      </div>

      {/* Filters + Search */}
      <Card style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {STATUS_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{ padding: "6px 14px", borderRadius: 20, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Lora', serif", background: filter === tab ? T.copper : T.bg3, color: filter === tab ? "#04080F" : T.text2, transition: "all 0.15s" }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search customer, pipe, region…"
              style={{ width: "100%", boxSizing: "border-box", background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 12px", color: T.text1, fontSize: 12, fontFamily: "'Lora', serif", outline: "none" }}
              onFocus={e => e.target.style.borderColor = T.copper}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>
          <div style={{ fontSize: 12, color: T.text3 }}>{filtered.length} orders</div>
        </div>
      </Card>

      {/* Orders table */}
      <Card style={{ padding: "0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: T.text3 }}>Loading orders…</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  {["#", "Customer", "Pipe Type", "Qty", "Region", "Amount", "Date", "Status", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", fontSize: 11, color: T.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", padding: "14px 16px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => (
                  <>
                    <tr
                      key={order._id}
                      style={{ borderBottom: `1px solid ${T.border}`, cursor: "pointer", transition: "background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = T.bg2}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                    >
                      <td style={{ padding: "13px 16px", fontSize: 11, color: T.text3 }}>{i + 1}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: T.text1, fontWeight: 500 }}>{order.customer || "—"}</td>
                      <td style={{ padding: "13px 16px", fontSize: 12, color: T.text2 }}>{order.pipe_type}</td>
                      <td style={{ padding: "13px 16px", fontSize: 12, color: T.text2 }}>{order.quantity} bundle{order.quantity !== 1 ? "s" : ""}</td>
                      <td style={{ padding: "13px 16px", fontSize: 12, color: T.text2 }}>{order.region}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: T.accent, fontWeight: 600, fontFamily: "monospace" }}>₹{(order.amount || 0).toLocaleString()}</td>
                      <td style={{ padding: "13px 16px", fontSize: 11, color: T.text3 }}>{order.date || "—"}</td>
                      <td style={{ padding: "13px 16px" }}><Badge status={order.status} /></td>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                          {order.requires_approval && (
                            <button onClick={() => approveOrder(order._id)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: "rgba(0,229,160,0.12)", color: T.accent, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                              Approve
                            </button>
                          )}
                          {order.status !== "Cancelled" && order.status !== "Shipped" && (
                            <button onClick={() => cancelOrder(order._id)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: "rgba(255,107,107,0.08)", color: T.danger, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                              Cancel
                            </button>
                          )}
                          {!order.requires_approval && order.status === "Approved" && (
                            <span style={{ fontSize: 11, color: T.text3, padding: "5px 0" }}>—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expanded === order._id && (
                      <tr key={`${order._id}-detail`} style={{ background: T.bg2, borderBottom: `1px solid ${T.border}` }}>
                        <td colSpan={9} style={{ padding: "14px 24px" }}>
                          <div style={{ display: "flex", gap: 32, fontSize: 12, color: T.text2 }}>
                            <div><span style={{ color: T.text3 }}>Order ID:</span> <span style={{ color: T.text1, fontFamily: "monospace" }}>ORD-{order._id.padStart(5, "0")}</span></div>
                            <div><span style={{ color: T.text3 }}>Pipe:</span> {order.pipe_type}</div>
                            <div><span style={{ color: T.text3 }}>Quantity:</span> {order.quantity} bundle{order.quantity !== 1 ? "s" : ""} ({order.quantity * 300}m)</div>
                            <div><span style={{ color: T.text3 }}>Region:</span> {order.region}</div>
                            <div><span style={{ color: T.text3 }}>Amount:</span> <span style={{ color: T.accent }}>₹{(order.amount || 0).toLocaleString()}</span></div>
                            <div><span style={{ color: T.text3 }}>Status:</span> {order.status}</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ padding: 40, textAlign: "center", color: T.text3, fontSize: 13 }}>No orders match your filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
