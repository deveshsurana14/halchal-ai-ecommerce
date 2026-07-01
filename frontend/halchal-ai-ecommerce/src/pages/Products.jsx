import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import productImg from "../assets/product.jpg";
import ChatBot from "../components/ChatBot";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";

const ALL_PRODUCTS = [
  { name: "Premium 16mm Inline",  category: "16mm Inline", coil: "400m", badge: "Best seller", rating: 5 },
  { name: "Gold 16mm Inline",     category: "16mm Inline", coil: "400m", badge: null,          rating: 4 },
  { name: "Supreme 16mm Online",  category: "16mm Online", coil: "400m", badge: "Top pick",    rating: 5 },
  { name: "Premium 20mm Inline",  category: "20mm Inline", coil: "200m", badge: "Popular",     rating: 5 },
  { name: "Shakti 20mm Inline",   category: "20mm Inline", coil: "200m", badge: null,          rating: 4 },
  { name: "Supreme 20mm Online",  category: "20mm Online", coil: "200m", badge: null,          rating: 4 },
];

const CATEGORIES = ["All", "16mm Inline", "16mm Online", "20mm Inline", "20mm Online"];

/* ─── Icons ────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const StarIcon = ({ filled }) => {
  const T = useTheme();
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? T.amber : "none"} stroke={T.amber} strokeWidth="1.8">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
};

/* ─── Product Card ─────────────────────────────────────────── */
const ProductCard = ({ product, onView }) => {
  const T = useTheme();
  return (
    <div className="prod-card" onClick={onView}>
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img src={productImg} alt={product.name} className="prod-img" />
        {product.badge && (
          <span style={{
            position: "absolute", top: 10, left: 10,
            background: "rgba(7,12,23,0.85)", backdropFilter: "blur(8px)",
            border: `1px solid ${T.greenBd}`, borderRadius: 5,
            padding: "3px 9px", fontSize: 10, fontWeight: 700,
            color: T.green, letterSpacing: "0.05em", textTransform: "uppercase",
            fontFamily: T.font,
          }}>
            {product.badge}
          </span>
        )}
      </div>

      <div style={{ padding: "16px 18px 20px" }}>
        {/* Stars */}
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 8 }}>
          {[1,2,3,4,5].map(i => <StarIcon key={i} filled={i <= product.rating} />)}
          <span style={{ fontSize: 11, color: T.text3, marginLeft: 4, fontFamily: T.font }}>({product.rating}.0)</span>
        </div>

        <h4 style={{ fontFamily: T.font, fontSize: 15, fontWeight: 700, color: T.text1, marginBottom: 10, lineHeight: 1.3 }}>
          {product.name}
        </h4>

        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{ background: "rgba(255,255,255,0.05)", color: T.text3, fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: T.font }}>
            {product.category}
          </span>
          <span style={{ background: T.amberBg, color: T.amber, fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: T.font }}>
            {product.coil} / coil
          </span>
        </div>

        <div style={{ background: T.greenBg, border: `1px solid ${T.greenBd}`, borderRadius: 8, padding: "9px 12px", marginBottom: 13, textAlign: "center" }}>
          <span style={{ fontSize: 12, color: T.green, fontWeight: 600, fontFamily: T.font }}>Get AI price for your state</span>
        </div>

        <button
          onClick={e => { e.stopPropagation(); onView(); }}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: T.green, color: "#04080F", fontFamily: T.font, fontSize: 13, fontWeight: 700, padding: "10px", border: "none", borderRadius: 8, cursor: "pointer", transition: "background 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.background = T.greenLt}
          onMouseLeave={e => e.currentTarget.style.background = T.green}>
          Calculate price <ArrowIcon />
        </button>
      </div>
    </div>
  );
};

/* ─── Empty state ──────────────────────────────────────────── */
const EmptyState = ({ query, onClear }) => {
  const T = useTheme();
  return (
    <div style={{ textAlign: "center", padding: "72px 24px", color: T.text3 }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.bg1, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <SearchIcon />
      </div>
      <div style={{ fontFamily: T.font, fontSize: 18, fontWeight: 700, color: T.text2, marginBottom: 8 }}>No products found</div>
      <div style={{ fontSize: 14, fontFamily: T.font, marginBottom: 20 }}>
        {query ? `No results for "${query}"` : "Try a different category."}
      </div>
      {query && (
        <button onClick={onClear} style={{ background: T.green, color: "#04080F", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 700, fontFamily: T.font, cursor: "pointer" }}>
          Clear search
        </button>
      )}
    </div>
  );
};

/* ─── Products page ────────────────────────────────────────── */
const Products = () => {
  const T        = useTheme();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [query,        setQuery]        = useState("");
  const [animKey,      setAnimKey]      = useState(0);

  const css = `
    .prod-card {
      background: ${T.bg1};
      border: 1px solid ${T.border};
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
    }
    .prod-card:hover {
      border-color: rgba(34,197,94,0.28);
      transform: translateY(-4px);
      box-shadow: 0 20px 48px rgba(0,0,0,0.4);
    }
    .prod-card:hover .prod-img { transform: scale(1.04); }
    .prod-img {
      width: 100%; height: 200px; object-fit: cover;
      transition: transform 0.4s ease; display: block;
    }

    .filter-chip {
      background: transparent;
      border: 1px solid ${T.border};
      color: ${T.text2};
      padding: 7px 16px;
      border-radius: 100px;
      font-size: 13px;
      font-family: ${T.font};
      font-weight: 500;
      cursor: pointer;
      transition: border-color 0.2s, color 0.2s, background 0.2s;
      display: inline-flex; align-items: center; gap: 7px;
      white-space: nowrap;
    }
    .filter-chip:hover {
      border-color: ${T.borderH};
      color: ${T.text1};
      background: rgba(255,255,255,0.03);
    }
    .filter-chip.active {
      background: ${T.greenBg};
      border-color: ${T.greenBd};
      color: ${T.green};
      font-weight: 600;
    }

    .search-wrap {
      display: flex; align-items: center; gap: 10px;
      background: ${T.bg1}; border: 1px solid ${T.border};
      border-radius: 10px; padding: 10px 14px;
      transition: border-color 0.2s;
      max-width: 380px;
    }
    .search-wrap:focus-within { border-color: rgba(34,197,94,0.35); }
    .search-wrap input {
      background: transparent; border: none; outline: none;
      color: ${T.text1}; font-family: ${T.font}; font-size: 14px; width: 100%;
    }
    .search-wrap input::placeholder { color: ${T.text3}; }

    @keyframes prodFadeIn {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .prod-enter { animation: prodFadeIn 0.3s ease both; }
  `;

  const filtered = ALL_PRODUCTS.filter(p => {
    const matchesCat = activeFilter === "All" || p.category === activeFilter;
    const matchesQ   = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQ;
  });

  useEffect(() => { setAnimKey(k => k + 1); }, [activeFilter, query]);

  const countFor = cat => cat === "All" ? ALL_PRODUCTS.length : ALL_PRODUCTS.filter(p => p.category === cat).length;

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: T.bg0, color: T.text1 }}>
        <Navbar />

        {/* Page header */}
        <div className="m-page-pad" style={{ padding: "56px 40px 0", maxWidth: 1200, margin: "0 auto" }}>
          <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 14, fontFamily: T.font }}>
            All products
          </span>
          <h1 style={{ fontFamily: T.font, fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, color: T.text1, marginBottom: 10, letterSpacing: "-0.025em", lineHeight: 1.1 }}>
            Complete product catalogue
          </h1>
          <p style={{ color: T.text2, fontSize: 15, fontFamily: T.font, marginBottom: 36 }}>
            {ALL_PRODUCTS.length} products · HDPE UV-stabilised · prices calculated live by AI based on your state, season and quantity.
          </p>

          {/* Search + filters row */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
            <div className="search-wrap">
              <span style={{ color: T.text3, flexShrink: 0, display: "flex" }}><SearchIcon /></span>
              <input
                placeholder="Search products…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Search products"
              />
              {query && (
                <button onClick={() => setQuery("")} style={{ color: T.text3, background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }} aria-label="Clear search">
                  <CloseIcon />
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`filter-chip${activeFilter === cat ? " active" : ""}`}
                  onClick={() => setActiveFilter(cat)}>
                  {cat}
                  <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(255,255,255,0.08)", borderRadius: 4, padding: "1px 6px" }}>
                    {countFor(cat)}
                  </span>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 13, color: T.text3, fontFamily: T.font }}>
              {filtered.length === 0
                ? "No products match your search"
                : `Showing ${filtered.length} product${filtered.length !== 1 ? "s" : ""}`}
            </div>
          </div>
        </div>

        {/* Product grid */}
        <div className="m-prod-pad" style={{ padding: "0 40px 88px", maxWidth: 1200, margin: "0 auto" }}>
          {filtered.length === 0 ? (
            <EmptyState query={query} onClear={() => setQuery("")} />
          ) : (
            <div key={animKey} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(256px, 1fr))", gap: 20 }}>
              {filtered.map((product, i) => (
                <div key={product.name} className="prod-enter" style={{ animationDelay: `${i * 0.05}s` }}>
                  <ProductCard
                    product={product}
                    onView={() => navigate(`/product/${encodeURIComponent(product.name)}`)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <ChatBot />
      </div>
    </>
  );
};

export default Products;
