console.log("Backend starting...");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const { calculateFinalOrderPrice } = require("./utils/pricingEngine");

// Maps a full product name to its ML base category
function getBaseCategory(name) {
  if (name.includes("20mm") && name.includes("Online")) return "20mm Online";
  if (name.includes("20mm")) return "20mm Inline";
  if (name.includes("Online")) return "16mm Online";
  return "16mm Inline";
}

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   MongoDB Atlas Connection
========================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch(err => console.log("Mongo Error:", err));

/* =========================
   Models
========================= */
const ApprovedPrice = require("./model/ApprovedPrice");
const Stock         = require("./model/Stock");
const Order         = require("./model/Order");
const Cart          = require("./model/Cart");

/* =========================
   Root Route
========================= */
app.get("/", (req, res) => {
  res.send("Halchal Backend Running");
});

/* =========================
   AI Pricing Route
========================= */
// Zone ID → representative state (for ML model)
const ZONE_STATE_MAP = {
  "Z1": "Maharashtra",
  "Z2": "Gujarat",
  "Z3": "Karnataka",
  "Z4": "Rajasthan",
  "Z5": "Bihar",
};

app.post("/api/ai-price", async (req, res) => {
  try {
    const { pipe_type, quantity, state, zone, zone_id, month, year, govt_subsidy } = req.body;
    const orderQuantity = Number(quantity) || 1;

    // Resolve state from zone_id or zone string (admin sends zone: "Z1")
    const zoneKey     = zone_id || zone;
    const resolvedState = state || ZONE_STATE_MAP[zoneKey] || "Maharashtra";

    // Dynamic prev_month_sales from real order history (last 30 days)
    const category      = getBaseCategory(pipe_type);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const minId = new mongoose.Types.ObjectId(
      Math.floor(thirtyDaysAgo.getTime() / 1000).toString(16).padStart(8, "0") +
      "0000000000000000"
    );
    const salesAgg = await Order.aggregate([
      { $match: { _id: { $gte: minId }, pipe_type: { $regex: category, $options: "i" } } },
      { $group: { _id: null, total: { $sum: "$quantity" } } }
    ]);
    const prevMonthSales = salesAgg[0]?.total ?? 450;

    const mlResponse = await axios.post("http://localhost:5001/calculate-price", {
      pipeType:         pipe_type,
      state:            resolvedState,
      zone_id:          zoneKey || "Z1",
      month:            month || new Date().getMonth() + 1,
      year:             year  || new Date().getFullYear(),
      prev_month_sales: prevMonthSales,
      govt_subsidy:     govt_subsidy !== undefined ? govt_subsidy : 1,
    });

    const mlData  = mlResponse.data;
    const aiPrice = mlData.final_price;

    if (!aiPrice) {
      return res.status(400).json({ error: "Invalid AI price response" });
    }

    const pricingResult = calculateFinalOrderPrice({
      approvedPrice: aiPrice,
      quantity: orderQuantity
    });

    res.json({
      ...pricingResult,
      predicted_demand:  mlData.predicted_demand,
      season:            mlData.season,
      base_price:        mlData.base_price,
      ex_factory_price:  mlData.final_price,
      factors:           mlData.factors,
      pipe_type:         mlData.pipe_type,
      state:             resolvedState,
      zone:              mlData.zone_id,
    });

  } catch (error) {
    console.error("AI Pricing Error:", error.message);
    res.status(500).json({ error: "AI pricing failed" });
  }
});

/* =========================
   Cart — Sync (upsert)
========================= */
app.post("/api/cart/sync", async (req, res) => {
  try {
    const { sessionId, items } = req.body;
    if (!sessionId) return res.status(400).json({ error: "sessionId required" });

    const cart = await Cart.findOneAndUpdate(
      { sessionId },
      { items: items || [], updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ ok: true, itemCount: cart.items.length });
  } catch (error) {
    console.error("Cart Sync Error:", error.message);
    res.status(500).json({ error: "Cart sync failed" });
  }
});

/* =========================
   Cart — Load
========================= */
app.get("/api/cart/:sessionId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ sessionId: req.params.sessionId });
    res.json({ items: cart?.items || [], updatedAt: cart?.updatedAt || null });
  } catch (error) {
    console.error("Cart Load Error:", error.message);
    res.status(500).json({ error: "Cart load failed" });
  }
});

/* =========================
   Cart — Clear
========================= */
app.delete("/api/cart/:sessionId", async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { sessionId: req.params.sessionId },
      { items: [] }
    );
    res.json({ ok: true });
  } catch (error) {
    console.error("Cart Clear Error:", error.message);
    res.status(500).json({ error: "Cart clear failed" });
  }
});

/* =========================
   Approve Price (Admin)
========================= */
app.post("/api/approve-price", async (req, res) => {
  try {
    const { pipe_type, region, approved_price } = req.body;

    const updated = await ApprovedPrice.findOneAndUpdate(
      { pipe_type, region },
      { price: approved_price, approved_at: new Date() },
      { returnDocument: "after", upsert: true }
    );

    res.json({ message: "Price approved successfully", data: updated });
  } catch (error) {
    console.error("Approval Error:", error);
    res.status(500).json({ error: "Approval failed" });
  }
});

/* =========================
   Get Approved Prices
========================= */
app.get("/api/approved-prices", async (req, res) => {
  try {
    const prices = await ApprovedPrice.find().sort({ approved_at: -1 });
    res.json(prices);
  } catch (error) {
    console.error("Fetch Approved Error:", error);
    res.status(500).json({ error: "Failed to fetch approved prices" });
  }
});

/* =========================
   Get All Stock
========================= */
app.get("/api/stock", async (req, res) => {
  try {
    const stock = await Stock.find();
    res.json(stock);
  } catch (error) {
    console.error("Stock Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch stock" });
  }
});

/* =========================
   Update Stock
========================= */
app.post("/api/stock/update", async (req, res) => {
  try {
    const { pipe_type, quantity } = req.body;

    const updatedStock = await Stock.findOneAndUpdate(
      { pipe_type },
      { quantity, updated_at: new Date() },
      { returnDocument: "after", upsert: true }
    );

    res.json(updatedStock);
  } catch (error) {
    console.error("Stock Update Error:", error);
    res.status(500).json({ error: "Stock update failed" });
  }
});

/* =========================
   Seed Stock (run once)
========================= */
app.post("/api/stock/seed", async (req, res) => {
  const PRODUCTS = [
    { pipe_type: "Premium 16mm Inline",  quantity: 500 },
    { pipe_type: "Gold 16mm Inline",     quantity: 500 },
    { pipe_type: "Supreme 16mm Online",  quantity: 300 },
    { pipe_type: "Premium 20mm Inline",  quantity: 500 },
    { pipe_type: "Shakti 20mm Inline",   quantity: 400 },
    { pipe_type: "Supreme 20mm Online",  quantity: 300 },
  ];
  try {
    const results = await Promise.all(
      PRODUCTS.map(p =>
        Stock.findOneAndUpdate(
          { pipe_type: p.pipe_type },
          { quantity: p.quantity, updated_at: new Date() },
          { upsert: true, returnDocument: "after", new: true }
        )
      )
    );
    res.json({ message: "Stock seeded successfully", data: results });
  } catch (error) {
    res.status(500).json({ error: "Seed failed", detail: error.message });
  }
});

/* =========================
   Create Order
   Accepts full pricing snapshot from cart
========================= */
app.post("/api/orders", async (req, res) => {
  try {
    const {
      pipe_type, quantity, region, session_id,
      // Pricing snapshot (sent from cart)
      approved_price, final_price, discount_percent,
      total_ex_gst, total_gst, total_with_gst,
      season, zone, predicted_demand,
    } = req.body;

    let status = "Shipped";
    let requiresApproval = false;

    if (quantity > 100) {
      status = "Pending Approval";
      requiresApproval = true;
    } else {
      const stockItem = await Stock.findOneAndUpdate(
        { pipe_type, quantity: { $gte: quantity } },
        { $inc: { quantity: -quantity }, $set: { updated_at: new Date() } },
        { new: true }
      );

      if (!stockItem) {
        const exists = await Stock.findOne({ pipe_type });
        if (exists) {
          return res.status(400).json({ error: `Insufficient stock. Available: ${exists.quantity} coil(s).` });
        }
        status = "Pending Approval";
        requiresApproval = true;
      }
    }

    const newOrder = new Order({
      pipe_type,
      quantity,
      region,
      status,
      requires_approval: requiresApproval,
      // Persist pricing snapshot to Atlas
      approved_price,
      final_price,
      discount_percent,
      total_ex_gst,
      total_gst,
      total_with_gst,
      gst_rate: 12,
      season,
      zone,
      predicted_demand,
      session_id,
    });

    await newOrder.save();

    res.json({
      message: status === "Pending Approval"
        ? "Order received — pending admin approval."
        : "Order placed successfully!",
      order: newOrder
    });

  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({ error: "Order creation failed" });
  }
});

/* =========================
   Start Server
========================= */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
