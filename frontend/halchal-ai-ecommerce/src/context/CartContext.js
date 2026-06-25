import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import API_BASE from "../config";

const CartContext = createContext(null);

const STORAGE_KEY  = "halchal_cart_v1";
const SESSION_KEY  = "halchal_session_id";
const BACKEND      = API_BASE;

// Mirrors the discount + GST logic in backend/utils/pricingEngine.js
// so the cart can recalculate live when quantity changes without a round-trip.
export function computePricing(approvedPrice, quantity) {
  if (!approvedPrice || approvedPrice <= 0 || !quantity || quantity <= 0) return null;

  let discountFactor = 1.00;
  if      (quantity >= 500) discountFactor = 0.92;
  else if (quantity >= 100) discountFactor = 0.94;
  else if (quantity >=  50) discountFactor = 0.96;
  else if (quantity >=  10) discountFactor = 0.98;
  else if (quantity >=   5) discountFactor = 0.99;

  const finalPrice      = Math.round((approvedPrice * discountFactor) / 10) * 10;
  const totalExGST      = finalPrice * quantity;
  const totalGST        = Math.round(totalExGST * 0.12 * 100) / 100;
  const totalWithGST    = Math.round((totalExGST + totalGST) * 100) / 100;
  const discountPercent = Number(((1 - discountFactor) * 100).toFixed(1));

  return { finalPrice, totalExGST, totalGST, totalWithGST, discountPercent, quantity };
}

// Generates a UUID v4 — used as an anonymous session ID until auth is added.
function newSessionId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) { id = newSessionId(); localStorage.setItem(SESSION_KEY, id); }
  return id;
}

export const CartProvider = ({ children }) => {
  const sessionId    = getSessionId();
  const syncTimer    = useRef(null);
  const initialized  = useRef(false);

  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  });

  // ── Persist to localStorage on every change ──────────────────────────────
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // ── On mount: load cart from Atlas, merge with localStorage ──────────────
  useEffect(() => {
    const loadFromCloud = async () => {
      try {
        const res  = await fetch(`${BACKEND}/api/cart/${sessionId}`);
        const data = await res.json();

        if (res.ok && Array.isArray(data.items) && data.items.length > 0) {
          const cloudUpdatedAt = data.updatedAt ? new Date(data.updatedAt).getTime() : 0;
          const localRaw = localStorage.getItem(STORAGE_KEY);
          const localItems = localRaw ? JSON.parse(localRaw) : [];

          // Pick cloud if it was updated more recently than the oldest local item
          const localLatest = localItems.reduce((m, i) => Math.max(m, i.addedAt || 0), 0);
          if (cloudUpdatedAt > localLatest || localItems.length === 0) {
            setItems(data.items);
          }
        }
      } catch {
        // Backend offline — silently fall back to localStorage
      } finally {
        initialized.current = true;
      }
    };
    loadFromCloud();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Debounced sync to Atlas on every cart change ─────────────────────────
  useEffect(() => {
    if (!initialized.current) return;   // skip the initial population
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      syncToCloud(items);
    }, 800);
    return () => clearTimeout(syncTimer.current);
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

  const syncToCloud = async (currentItems) => {
    try {
      await fetch(`${BACKEND}/api/cart/sync`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ sessionId, items: currentItems }),
      });
    } catch {
      // Backend offline — cart is still safe in localStorage
    }
  };

  const clearCloudCart = async () => {
    try {
      await fetch(`${BACKEND}/api/cart/${sessionId}`, { method: "DELETE" });
    } catch { /* silent */ }
  };

  // ── Cart operations ───────────────────────────────────────────────────────
  const addToCart = useCallback((cartItem) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === cartItem.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...cartItem, addedAt: prev[idx].addedAt };
        return next;
      }
      return [...prev, { ...cartItem, addedAt: Date.now() }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id, newQty) => {
    const qty = Math.max(1, Number(newQty) || 1);
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const pricing = computePricing(item.approvedPrice, qty);
      return pricing ? { ...item, ...pricing } : { ...item, quantity: qty };
    }));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    clearCloudCart();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived totals ────────────────────────────────────────────────────────
  const cartCount         = items.reduce((s, i) => s + (i.quantity || 0), 0);
  const itemCount         = items.length;
  const grandTotalExGST   = items.reduce((s, i) => s + (i.totalExGST   || 0), 0);
  const grandTotalGST     = Math.round(items.reduce((s, i) => s + (i.totalGST     || 0), 0) * 100) / 100;
  const grandTotalWithGST = Math.round(items.reduce((s, i) => s + (i.totalWithGST || 0), 0) * 100) / 100;

  return (
    <CartContext.Provider value={{
      items, sessionId,
      addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount, itemCount,
      grandTotalExGST, grandTotalGST, grandTotalWithGST,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
