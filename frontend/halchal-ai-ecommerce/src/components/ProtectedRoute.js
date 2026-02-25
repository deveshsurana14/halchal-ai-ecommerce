// ─────────────────────────────────────────────
// Halchal Industries — Central API Service
// All backend calls go through here
// ─────────────────────────────────────────────

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// ─── Token helpers ────────────────────────────
const getToken = () => localStorage.getItem("halchal_token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ─── Generic request handler ──────────────────
const request = async (endpoint, options = {}) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
};

// ═══════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════
export const authAPI = {
  // User login
  userLogin: (email, password) =>
    request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),

  // Admin login (same endpoint, role checked client-side)
  adminLogin: (email, password) =>
    request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),

  // Register new user
  register: (name, email, password, region) =>
    request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, region }),
    }),
};

// ═══════════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════════
export const productAPI = {
  // Get all products (public)
  getAll: () => request("/products"),

  // Get price for a specific pipe+region+quantity
  checkPrice: (pipe_type, region, quantity) =>
    request(
      `/products/price-check?pipe_type=${encodeURIComponent(pipe_type)}&region=${region}&quantity=${quantity}`,
      { headers: authHeaders() }
    ),
};

// ═══════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════
export const orderAPI = {
  // Place an order
  placeOrder: (pipe_type, region, quantity) =>
    request("/orders", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ pipe_type, region, quantity }),
    }),

  // Get my orders (customer)
  getMyOrders: () =>
    request("/orders/my-orders", { headers: authHeaders() }),

  // Get all orders (admin)
  getAllOrders: () =>
    request("/orders", { headers: authHeaders() }),

  // Update order status (admin)
  updateStatus: (orderId, status) =>
    request(`/orders/${orderId}/status`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    }),
};

// ═══════════════════════════════════════════════
// ADMIN — WEEKLY PRICING
// ═══════════════════════════════════════════════
export const pricingAPI = {
  // List all batches
  getBatches: () =>
    request("/admin/pricing/batches", { headers: authHeaders() }),

  // Get full price table for one batch
  getBatchDetail: (batchId) =>
    request(`/admin/pricing/batches/${batchId}`, { headers: authHeaders() }),

  // Approve entire batch (with optional overrides)
  approveAll: (batchId, overrides = []) =>
    request(`/admin/pricing/batches/${batchId}/approve-all`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ overrides }),
    }),

  // Approve / modify a single entry
  approveEntry: (batchId, pipe_type, region, approved_price, admin_notes) =>
    request(`/admin/pricing/batches/${batchId}/approve-entry`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ pipe_type, region, approved_price, admin_notes }),
    }),

  // Reject entire batch
  rejectBatch: (batchId) =>
    request(`/admin/pricing/batches/${batchId}/reject`, {
      method: "PUT",
      headers: authHeaders(),
    }),

  // Manually trigger ML engine
  generatePrices: (month, year, govt_subsidy) =>
    request("/admin/pricing/generate", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ month, year, govt_subsidy }),
    }),
};