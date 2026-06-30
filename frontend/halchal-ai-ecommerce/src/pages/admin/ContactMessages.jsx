import { useState, useEffect } from "react";

const T = {
  bg0: "#05070E", bg1: "#0B1120", bg2: "#111B30", bg3: "#18253E",
  amber: "#F5A623", amberSoft: "rgba(245,166,35,0.09)", amberBorder: "rgba(245,166,35,0.22)",
  green: "#00D68F", greenSoft: "rgba(0,214,143,0.09)",
  sky: "#38C0FF",
  rose: "#FF5577", roseSoft: "rgba(255,85,119,0.09)",
  indigo: "#818CF8",
  border: "rgba(255,255,255,0.07)",
  t1: "#EBF0FF", t2: "#7A98B8", t3: "#3F5470",
  font: "'Inter', system-ui, sans-serif",
};

const SUBJECT_COLOR = {
  "Product & Pricing Inquiry":  { color: T.sky,    bg: "rgba(56,192,255,0.09)"   },
  "Bulk Order / Dealer Inquiry":{ color: T.amber,  bg: T.amberSoft                },
  "Technical Support":          { color: T.indigo, bg: "rgba(129,140,248,0.09)"  },
  "Delivery & Logistics":       { color: T.green,  bg: T.greenSoft                },
  "Partnership Proposal":       { color: "#C084FC",bg: "rgba(192,132,252,0.09)"  },
  "Quality Complaint":          { color: T.rose,   bg: T.roseSoft                 },
  "Other":                      { color: T.t2,     bg: "rgba(122,152,184,0.09)"  },
};

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function ContactMessages() {
  const [messages, setMessages]   = useState([]);
  const [selected, setSelected]   = useState(null);
  const [filter,   setFilter]     = useState("all");

  useEffect(() => {
    const load = () => {
      const raw = JSON.parse(localStorage.getItem("halchal_contact_messages") || "[]");
      setMessages(raw);
    };
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  const save = (updated) => {
    setMessages(updated);
    localStorage.setItem("halchal_contact_messages", JSON.stringify(updated));
  };

  const markRead = (id) => {
    const updated = messages.map(m => m.id === id ? { ...m, read: true } : m);
    save(updated);
    setSelected(updated.find(m => m.id === id));
  };

  const deleteMsg = (id) => {
    const updated = messages.filter(m => m.id !== id);
    save(updated);
    if (selected?.id === id) setSelected(null);
  };

  const markAllRead = () => {
    const updated = messages.map(m => ({ ...m, read: true }));
    save(updated);
    if (selected) setSelected({ ...selected, read: true });
  };

  const unread  = messages.filter(m => !m.read).length;
  const visible = filter === "unread"
    ? messages.filter(m => !m.read)
    : filter === "read"
    ? messages.filter(m => m.read)
    : messages;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: T.font }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: T.t1, margin: 0, fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Contact Messages
          </h1>
          <p style={{ fontSize: 13, color: T.t2, margin: "4px 0 0" }}>
            Enquiries submitted via the public contact form
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              style={{
                background: T.greenSoft, border: "1px solid rgba(0,214,143,0.25)",
                color: T.green, fontSize: 12, fontWeight: 600, padding: "7px 16px",
                borderRadius: 8, cursor: "pointer", fontFamily: T.font,
              }}
            >
              Mark all read
            </button>
          )}
          <div style={{
            background: unread > 0 ? T.amberSoft : T.bg2,
            border: `1px solid ${unread > 0 ? T.amberBorder : T.border}`,
            borderRadius: 8, padding: "7px 16px",
            fontSize: 13, fontWeight: 700,
            color: unread > 0 ? T.amber : T.t3,
          }}>
            {unread > 0 ? `${unread} unread` : "All read"}
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Total Messages", value: messages.length, color: T.sky    },
          { label: "Unread",         value: unread,           color: T.amber  },
          { label: "Read",           value: messages.length - unread, color: T.green },
          { label: "This Week",      value: messages.filter(m => Date.now() - new Date(m.timestamp) < 7*86400*1000).length, color: T.indigo },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: T.bg1, border: `1px solid ${T.border}`,
            borderRadius: 12, padding: "16px 20px",
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>{value}</div>
            <div style={{ fontSize: 12, color: T.t3, marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8 }}>
        {["all", "unread", "read"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? T.amberSoft : "transparent",
              border: `1px solid ${filter === f ? T.amberBorder : T.border}`,
              color: filter === f ? T.amber : T.t2,
              fontSize: 12, fontWeight: 600, padding: "7px 18px",
              borderRadius: 8, cursor: "pointer", fontFamily: T.font,
              textTransform: "capitalize",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Main panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 16, minHeight: 500 }}>

        {/* Message list */}
        <div style={{
          background: T.bg1, border: `1px solid ${T.border}`,
          borderRadius: 14, overflow: "hidden",
          display: "flex", flexDirection: "column",
        }}>
          {visible.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 40 }}>
              <div style={{ fontSize: 36 }}>📭</div>
              <div style={{ fontSize: 14, color: T.t3 }}>
                {filter === "unread" ? "No unread messages" : "No messages yet"}
              </div>
            </div>
          ) : (
            <div style={{ overflowY: "auto", flex: 1 }}>
              {visible.map((msg, i) => {
                const sc = SUBJECT_COLOR[msg.subject] || SUBJECT_COLOR["Other"];
                const isOpen = selected?.id === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => { setSelected(msg); markRead(msg.id); }}
                    style={{
                      padding: "14px 18px",
                      borderBottom: `1px solid ${T.border}`,
                      cursor: "pointer",
                      background: isOpen ? T.bg2 : "transparent",
                      borderLeft: `3px solid ${isOpen ? T.amber : msg.read ? "transparent" : T.sky}`,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = T.bg2; }}
                    onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {!msg.read && (
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.sky, flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: 13, fontWeight: msg.read ? 400 : 700, color: T.t1 }}>
                          {msg.fullName}
                        </span>
                      </div>
                      <span style={{ fontSize: 10, color: T.t3, flexShrink: 0 }}>{timeAgo(msg.timestamp)}</span>
                    </div>
                    <div style={{
                      display: "inline-block", fontSize: 10, fontWeight: 600,
                      color: sc.color, background: sc.bg,
                      padding: "2px 8px", borderRadius: 5, marginBottom: 6,
                    }}>
                      {msg.subject}
                    </div>
                    <div style={{ fontSize: 12, color: T.t3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {msg.message}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail view */}
        <div style={{
          background: T.bg1, border: `1px solid ${T.border}`,
          borderRadius: 14, overflow: "hidden",
          display: "flex", flexDirection: "column",
        }}>
          {!selected ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 40 }}>
              <div style={{ fontSize: 40 }}>💬</div>
              <div style={{ fontSize: 14, color: T.t3 }}>Select a message to read</div>
            </div>
          ) : (() => {
            const sc = SUBJECT_COLOR[selected.subject] || SUBJECT_COLOR["Other"];
            return (
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                {/* Detail header */}
                <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: T.t1, marginBottom: 3 }}>{selected.fullName}</div>
                      <a href={`mailto:${selected.email}`} style={{ fontSize: 13, color: T.sky, textDecoration: "none" }}>{selected.email}</a>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <a
                        href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                        style={{
                          background: T.amberSoft, border: `1px solid ${T.amberBorder}`,
                          color: T.amber, fontSize: 11, fontWeight: 700,
                          padding: "6px 14px", borderRadius: 7,
                          textDecoration: "none", whiteSpace: "nowrap",
                        }}
                      >
                        Reply ↗
                      </a>
                      <button
                        onClick={() => deleteMsg(selected.id)}
                        style={{
                          background: T.roseSoft, border: "1px solid rgba(255,85,119,0.25)",
                          color: T.rose, fontSize: 11, fontWeight: 700,
                          padding: "6px 14px", borderRadius: 7, cursor: "pointer", fontFamily: T.font,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: sc.color, background: sc.bg,
                      padding: "3px 10px", borderRadius: 6,
                    }}>
                      {selected.subject}
                    </span>
                    {selected.phone && (
                      <span style={{ fontSize: 11, color: T.t2, background: T.bg3, padding: "3px 10px", borderRadius: 6 }}>
                        📞 {selected.phone}
                      </span>
                    )}
                    {selected.company && (
                      <span style={{ fontSize: 11, color: T.t2, background: T.bg3, padding: "3px 10px", borderRadius: 6 }}>
                        🏢 {selected.company}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: T.t3, background: T.bg3, padding: "3px 10px", borderRadius: 6, marginLeft: "auto" }}>
                      Ref: HI-{selected.id}
                    </span>
                  </div>
                </div>

                {/* Message body */}
                <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
                  <div style={{ fontSize: 11, color: T.t3, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Message · {new Date(selected.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </div>
                  <div style={{
                    fontSize: 14, color: T.t1, lineHeight: 1.8,
                    background: T.bg2, border: `1px solid ${T.border}`,
                    borderRadius: 10, padding: "18px 20px",
                    whiteSpace: "pre-wrap", wordBreak: "break-word",
                  }}>
                    {selected.message}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
