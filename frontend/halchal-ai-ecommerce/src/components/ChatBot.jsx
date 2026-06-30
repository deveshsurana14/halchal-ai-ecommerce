import { useState, useEffect, useRef } from "react";

const T = {
  bg0: "#05070F", bg1: "#080D1C", bg2: "#0D1628", bg3: "#121F38",
  accent: "#00E5A0", accentDk: "#00C080", copper: "#FFB020",
  border: "rgba(255,255,255,0.07)", borderMd: "rgba(255,255,255,0.15)",
  text1: "#EEF3FF", text2: "#7A9EC6", text3: "#3D5A7A",
};

const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

const SYSTEM_PROMPT = `You are Halchal AI, an expert drip irrigation assistant for Halchal Industries — an Indian drip irrigation pipe manufacturer based in Pune, Maharashtra.

Help farmers and buyers choose the right irrigation products. Key knowledge:

PRODUCTS:
- 16mm Inline Drip Pipe: banana, pomegranate, grapes, onion, tomato, chilli, sugarcane (narrow rows)
- 20mm Inline Drip Pipe: cotton, maize, sunflower, wide-row crops
- PVC Main Line (63–110mm): supply lines; LLDPE Submain (32–50mm): distribution lines
- Flat Drip Tape: seasonal vegetables on raised beds
- Micro-sprinklers / Foggers: orchards, nurseries

CROP RECOMMENDATIONS:
- Sugarcane: 16mm inline, 60cm emitter spacing, 1.2L/hr, ~3500m/acre
- Banana: 16mm inline, twin-lateral system, 2–4L/hr, ~4500m/acre
- Cotton: 20mm inline, 90cm emitter spacing, 2L/hr
- Grapes: 16mm inline, double lateral per row, 50cm spacing (Pune region)
- Pomegranate: 16mm inline or micro-sprinklers, 5×5m spacing (Solapur, Maharashtra)
- Onion/Garlic: Flat drip tape or 16mm on raised beds, 30cm spacing
- Tomato/Chilli: 16mm inline on raised beds, 30–40cm spacing

SEASONS:
- Kharif (Jun–Oct): Cotton, sugarcane, soybean — high rainfall supplement
- Rabi (Nov–Mar): Onion, chilli, wheat — most water-critical season, drip saves 40–50%
- Zaid (Mar–Jun): Vegetables, watermelon, cucumber — peak irrigation demand

REGIONS: Maharashtra (sugarcane Kolhapur/Pune, grapes Pune, pomegranate Solapur, onion Pune), Gujarat (cotton, banana), Rajasthan (pomegranate, vegetables), Karnataka/AP (banana)

PRICING: 16mm ₹8–12/m · 20mm ₹14–18/m · PVC main line ₹25–60/m · Complete 1-acre system ₹18,000–40,000

RULES:
- Be concise. Use bullet points for lists. Max 4–5 bullet points per response.
- If crop, land size, or region are not mentioned, ask for them — they are critical.
- For quantity questions: give the formula and calculate (e.g. row spacing × rows per acre).
- Respond in the same language as the user (Hindi, Marathi, or English).
- If the question is unrelated to irrigation/farming/Halchal products, politely redirect.`;

/* ─── Per-acre pipe usage map ─── */
const CROP_DATA = {
  onion:       { pipe: "16mm Inline Drip Pipe", mPerAcre: 3800, spacing: "30cm emitter spacing, raised beds",   season: "Rabi" },
  kanda:       { pipe: "16mm Inline Drip Pipe", mPerAcre: 3800, spacing: "30cm emitter spacing, raised beds",   season: "Rabi" },
  sugarcane:   { pipe: "16mm Inline Drip Pipe", mPerAcre: 3500, spacing: "60cm emitter spacing, 90–120cm rows", season: "Kharif" },
  ganna:       { pipe: "16mm Inline Drip Pipe", mPerAcre: 3500, spacing: "60cm emitter spacing, 90–120cm rows", season: "Kharif" },
  cotton:      { pipe: "20mm Inline Drip Pipe", mPerAcre: 3200, spacing: "90cm emitter spacing",                season: "Kharif" },
  tomato:      { pipe: "16mm Inline Drip Pipe", mPerAcre: 4000, spacing: "30–40cm emitter spacing",             season: "Rabi" },
  banana:      { pipe: "16mm Inline Drip Pipe", mPerAcre: 4500, spacing: "50cm spacing, twin-lateral",          season: "Year-round" },
  grape:       { pipe: "16mm Inline Drip Pipe", mPerAcre: 4200, spacing: "50cm spacing, double lateral",        season: "Year-round" },
  angoor:      { pipe: "16mm Inline Drip Pipe", mPerAcre: 4200, spacing: "50cm spacing, double lateral",        season: "Year-round" },
  pomegranate: { pipe: "16mm Inline Drip Pipe", mPerAcre: 2800, spacing: "5×5m tree spacing",                  season: "Year-round" },
  anar:        { pipe: "16mm Inline Drip Pipe", mPerAcre: 2800, spacing: "5×5m tree spacing",                  season: "Year-round" },
  soybean:     { pipe: "16mm Inline Drip Pipe", mPerAcre: 3500, spacing: "45cm emitter spacing",               season: "Kharif" },
  wheat:       { pipe: "16mm Inline Drip Pipe", mPerAcre: 3200, spacing: "20–25cm emitter spacing",            season: "Rabi" },
  chilli:      { pipe: "16mm Inline Drip Pipe", mPerAcre: 4000, spacing: "30cm emitter spacing",               season: "Rabi" },
  mirchi:      { pipe: "16mm Inline Drip Pipe", mPerAcre: 4000, spacing: "30cm emitter spacing",               season: "Rabi" },
};

/* ─── Extract acre/bigha number from message ─── */
function extractAcres(q) {
  const m = q.match(/(\d+(\.\d+)?)\s*(acr|acre|acres|bigha|biga)/i);
  if (!m) return null;
  let val = parseFloat(m[1]);
  if (/bigha/i.test(m[3])) val = val * 0.62; // 1 bigha ≈ 0.62 acre
  return val;
}

/* ─── Fallback keyword matching when no API key is set ─── */
function keywordFallback(q) {
  q = q.toLowerCase();

  // Greetings
  if (q.match(/^(hi|hello|hey|hii|helo|namaste|good\s*(morning|evening|afternoon)|how are you|what's up|whats up)/)) {
    return "Hello! I'm **Halchal AI**, your drip irrigation advisor.\n\nTell me your **crop**, **land size** (in acres), and **region** — I'll recommend the right pipe and estimate the quantity you need.";
  }
  // What can you do
  if (q.includes("what can you") || q.includes("help me") || q.includes("what do you") || q.includes("your purpose") || q.includes("groq") || q.includes("connected")) {
    return "I help farmers and distributors choose the right drip irrigation pipe.\n\nJust tell me:\n- **Crop** (sugarcane, onion, cotton, grape…)\n- **Land size** (acres or bigha)\n- **Region/State** (Maharashtra, Gujarat…)\n\nI'll recommend the pipe type and total metres needed.";
  }

  // Detect crop + acres together → full recommendation
  const acres = extractAcres(q);
  const matchedCrop = Object.keys(CROP_DATA).find(k => q.includes(k));
  if (matchedCrop && acres) {
    const c = CROP_DATA[matchedCrop];
    const totalM = Math.round(c.mPerAcre * acres);
    const coils  = Math.ceil(totalM / 300);
    const region = q.includes("maharashtra") ? "Maharashtra" : q.includes("gujarat") ? "Gujarat" : q.includes("rajasthan") ? "Rajasthan" : null;
    return `For **${acres} acres of ${matchedCrop}** ${region ? `in ${region}` : ""}:\n- **Pipe:** ${c.pipe}\n- **Spacing:** ${c.spacing}\n- **Season:** ${c.season}\n- **Total pipe needed:** ~${totalM.toLocaleString("en-IN")}m (~**${coils} coils** of 300m each)\n\nVisit the **Products** page to see AI-priced coils for your region.`;
  }

  // Crop only (no acres given)
  if (matchedCrop) {
    const c = CROP_DATA[matchedCrop];
    return `For **${matchedCrop}**: **${c.pipe}** (${c.spacing}). Season: ${c.season}.\n\nEstimated usage: ~${c.mPerAcre.toLocaleString("en-IN")}m per acre (~${Math.ceil(c.mPerAcre/300)} coils/acre).\n\nHow many acres do you have?`;
  }

  // Acres only (no crop)
  if (acres) return `For ${acres} acres, the total pipe needed depends on your crop.\n\n- Onion/Tomato: ~${Math.round(3800*acres).toLocaleString("en-IN")}m\n- Sugarcane: ~${Math.round(3500*acres).toLocaleString("en-IN")}m\n- Cotton: ~${Math.round(3200*acres).toLocaleString("en-IN")}m\n\nWhat crop are you growing?`;

  // Pricing
  if (q.includes("price") || q.includes("cost") || q.includes("rate") || q.includes("kitna")) return "**16mm Drip Pipe**: ₹1,050–₹1,200 per coil (300m) · **20mm Drip Pipe**: ₹1,350–₹1,500 per coil.\n\nOur AI prices dynamically based on season, region, and demand — check the **Products** page for live pricing.";
  // Season
  if (q.includes("kharif")) return "For Kharif season (June–Oct): Cotton, sugarcane, soybean. Recommend **pressure-compensating drippers** to handle monsoon rain variations.";
  if (q.includes("rabi")) return "For Rabi season (Nov–Mar): Onion, chilli, wheat. Most water-critical season — drip irrigation saves 40–50% water vs. flood irrigation.";
  // Region only
  if (q.includes("maharashtra") || q.includes("nashik") || q.includes("pune") || q.includes("solapur")) return "In Maharashtra: Sugarcane (Kolhapur/Pune), Grapes (Pune), Pomegranate (Solapur), Onion (Pune).\n\nTell me your crop and land size for a full recommendation.";
  if (q.includes("gujarat")) return "In Gujarat: Cotton, groundnut, and castor benefit most from drip. Recommend **20mm Inline** for cotton and **16mm Inline** for smaller crops.\n\nTell me your crop and land size for a full recommendation.";
  if (q.includes("rajasthan")) return "In Rajasthan: Pomegranate, jatropha, and vegetables. Water is scarce — drip irrigation is essential. **16mm Inline** is most common.\n\nTell me your crop and land size for a full recommendation.";
  // Default
  return "I can help with crop-specific drip pipe recommendations and quantity estimates.\n\nTell me your **crop**, **land size** (acres), and **state** to get started.";
}

/* ─── Icons ─── */
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const BotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    <line x1="12" y1="3" x2="12" y2="1"/>
    <circle cx="9" cy="16" r="1" fill="currentColor"/>
    <circle cx="15" cy="16" r="1" fill="currentColor"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

/* ─── Markdown-lite renderer for bold and bullets ─── */
function renderText(text) {
  const lines = text.split("\n").filter(l => l.trim() !== "");
  return lines.map((line, i) => {
    const parts = line.split(/\*\*(.+?)\*\*/g).map((part, j) =>
      j % 2 === 1 ? <strong key={j} style={{ color: T.text1, fontWeight: 700 }}>{part}</strong> : part
    );
    const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("• ");
    return (
      <div key={i} style={{ display: "flex", gap: isBullet ? 6 : 0, marginBottom: i < lines.length - 1 ? 4 : 0 }}>
        {isBullet && <span style={{ color: T.accent, flexShrink: 0, marginTop: 1 }}>•</span>}
        <span>{isBullet ? parts.slice(1) : parts}</span>
      </div>
    );
  });
}

/* ─── Typing indicator ─── */
const TypingDots = () => (
  <div style={{ display: "flex", gap: 4, padding: "4px 2px", alignItems: "center" }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 7, height: 7, borderRadius: "50%", background: T.text3,
        animation: "typingBounce 1.2s ease-in-out infinite",
        animationDelay: `${i * 0.18}s`,
      }} />
    ))}
  </div>
);

/* ─── Main ChatBot ─── */
const ChatBot = () => {
  const [open,    setOpen]    = useState(false);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! I'm **Halchal AI**, your drip irrigation advisor.\n\nTell me your **crop**, **land size**, and **region** — I'll recommend the right pipe and estimate the quantity you need." },
  ]);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setLoading(true);

    const apiKey = GROQ_API_KEY?.trim();
    const hasKey = apiKey && apiKey !== "your_groq_api_key_here";

    if (!hasKey) {
      await new Promise(r => setTimeout(r, 500));
      setMessages(prev => [...prev, { role: "bot", text: keywordFallback(text) }]);
      setLoading(false);
      return;
    }

    try {
      // Build OpenAI-compatible messages array (system + conversation history)
      const chatMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        // skip the initial greeting (index 0), map the rest
        ...newMessages.slice(1).map(m => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.text,
        })),
      ];

      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: chatMessages,
          max_tokens: 400,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content;
      setMessages(prev => [...prev, { role: "bot", text: reply?.trim() || "Sorry, I couldn't generate a response. Please try again." }]);
    } catch (err) {
      console.error("Groq API error:", err.message);
      setMessages(prev => [...prev, {
        role: "bot",
        text: `⚠️ ${err.message}\n\n${keywordFallback(text)}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const hasApiKey = GROQ_API_KEY?.trim() && GROQ_API_KEY !== "your_groq_api_key_here";

  return (
    <>
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes chatSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fabPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,229,160,0.35); }
          50%       { box-shadow: 0 0 0 10px rgba(0,229,160,0); }
        }
        .chat-msg-scroll::-webkit-scrollbar { width: 4px; }
        .chat-msg-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-msg-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
      `}</style>

      {/* FAB */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 999,
          width: 56, height: 56, borderRadius: "50%",
          background: `linear-gradient(135deg, ${T.accent} 0%, #00B4D8 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "#04080F",
          boxShadow: "0 4px 24px rgba(0,229,160,0.35)",
          animation: !open ? "fabPulse 2.5s ease-in-out infinite" : "none",
          transition: "transform 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {open ? <CloseIcon /> : <BotIcon />}
      </div>

      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed", bottom: 96, right: 28, zIndex: 998,
          width: 360, height: 520,
          background: T.bg1, border: `1px solid ${T.borderMd}`,
          borderRadius: 18, display: "flex", flexDirection: "column",
          boxShadow: "0 24px 80px rgba(0,0,0,0.65)",
          overflow: "hidden",
          animation: "chatSlideIn 0.25s ease",
          fontFamily: "'Lora', serif",
        }}>

          {/* Header */}
          <div style={{
            padding: "14px 18px", borderBottom: `1px solid ${T.border}`,
            background: T.bg2, display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: `linear-gradient(135deg, ${T.accent}, #00B4D8)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#04080F", flexShrink: 0,
            }}>
              <BotIcon />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text1 }}>Halchal AI</div>
              <div style={{ fontSize: 11, color: T.accent, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent, display: "inline-block" }} />
                {hasApiKey ? "Powered by Llama 3.1 (Groq)" : "Smart keyword mode"}
              </div>
            </div>
            <div
              onClick={() => setOpen(false)}
              style={{ color: T.text3, cursor: "pointer", padding: 4, borderRadius: 6 }}
              onMouseEnter={e => { e.currentTarget.style.color = T.text1; e.currentTarget.style.background = T.bg3; }}
              onMouseLeave={e => { e.currentTarget.style.color = T.text3; e.currentTarget.style.background = "transparent"; }}
            >
              <CloseIcon />
            </div>
          </div>

          {/* Messages */}
          <div
            className="chat-msg-scroll"
            style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 12 }}
          >
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>
                {msg.role === "bot" && (
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, #00B4D8)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#04080F", flexShrink: 0 }}>
                    <BotIcon />
                  </div>
                )}
                <div style={{
                  maxWidth: "82%",
                  padding: "10px 13px",
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: msg.role === "user"
                    ? `linear-gradient(135deg, ${T.accentDk}, #0066CC)`
                    : T.bg3,
                  border: msg.role === "bot" ? `1px solid ${T.border}` : "none",
                  fontSize: 13, color: T.text1, lineHeight: 1.55,
                }}>
                  {renderText(msg.text)}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", gap: 8, alignItems: "flex-end" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, #00B4D8)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#04080F", flexShrink: 0 }}>
                  <BotIcon />
                </div>
                <div style={{ padding: "10px 14px", borderRadius: "16px 16px 16px 4px", background: T.bg3, border: `1px solid ${T.border}` }}>
                  <TypingDots />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          <div style={{ padding: "6px 14px", display: "flex", gap: 6, overflowX: "auto", borderTop: `1px solid ${T.border}` }}>
            {["Sugarcane pipe", "Onion 1 acre", "Cotton Kharif", "Price list"].map(s => (
              <button
                key={s}
                onClick={() => { setInput(s); inputRef.current?.focus(); }}
                style={{
                  flexShrink: 0, padding: "4px 10px", borderRadius: 20,
                  background: "transparent", border: `1px solid ${T.border}`,
                  color: T.text2, fontSize: 11, cursor: "pointer", fontFamily: "'Lora', serif",
                  transition: "border-color 0.15s, color 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text2; }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "10px 14px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, alignItems: "center", background: T.bg2 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask about crop, pipe, or area…"
              disabled={loading}
              style={{
                flex: 1, background: T.bg3, border: `1px solid ${T.border}`,
                borderRadius: 10, padding: "9px 12px",
                color: T.text1, fontSize: 13, outline: "none",
                fontFamily: "'Lora', serif",
                transition: "border-color 0.2s",
                opacity: loading ? 0.6 : 1,
              }}
              onFocus={e => e.target.style.borderColor = T.accent}
              onBlur={e => e.target.style.borderColor = T.border}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                width: 38, height: 38, borderRadius: 10, border: "none",
                background: (loading || !input.trim()) ? T.bg3 : `linear-gradient(135deg, ${T.accent}, #00B4D8)`,
                color: (loading || !input.trim()) ? T.text3 : "#04080F",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: (loading || !input.trim()) ? "not-allowed" : "pointer",
                flexShrink: 0, transition: "background 0.2s",
              }}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
