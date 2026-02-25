console.log("Backend starting...");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   MongoDB Connection
========================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

/* =========================
   Models
========================= */
const ApprovedPrice = require("./model/ApprovedPrice");
const Stock = require("./model/Stock");
const Order = require("./model/Order");

/* =========================
   Root Route
========================= */
app.get("/", (req, res) => {
  res.send("Halchal Backend Running");
});

/* =========================
   AI Pricing Route
========================= */
app.post("/api/ai-price", async (req, res) => {
  try {
    const response = await axios.post(
      "http://localhost:5001/calculate-price",
      req.body
    );
    res.json(response.data);
  } catch (error) {
    console.error("AI Pricing Error:", error.message);
    res.status(500).json({ error: "AI pricing failed" });
  }
});

/* =========================
   Approve Price
========================= */
app.post("/api/approve-price", async (req, res) => {
  try {
    const { pipe_type, region, approved_price } = req.body;

    const updated = await ApprovedPrice.findOneAndUpdate(
      { pipe_type, region },
      {
        price: approved_price,
        approved_at: new Date()
      },
      {
        returnDocument: "after",
        upsert: true
      }
    );

    res.json({
      message: "Price approved successfully",
      data: updated
    });

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
      {
        quantity,
        updated_at: new Date()
      },
      {
        returnDocument: "after",
        upsert: true
      }
    );

    res.json(updatedStock);

  } catch (error) {
    console.error("Stock Update Error:", error);
    res.status(500).json({ error: "Stock update failed" });
  }
});

/* =========================
   Create Order
========================= */
app.post("/api/orders", async (req, res) => {
  try {
    const { pipe_type, quantity, region } = req.body;

    const stockItem = await Stock.findOne({ pipe_type });

    if (!stockItem) {
      return res.status(404).json({ error: "Stock not found" });
    }

    let status = "Shipped";
    let requiresApproval = false;

    // If quantity > 1000 → manual approval required
    if (quantity > 1000) {
      status = "Pending Approval";
      requiresApproval = true;
    } else {
      if (stockItem.quantity < quantity) {
        return res.status(400).json({ error: "Insufficient stock" });
      }

      // Deduct stock immediately
      stockItem.quantity -= quantity;
      await stockItem.save();
    }

    const newOrder = new Order({
      pipe_type,
      quantity,
      region,
      status,
      requires_approval: requiresApproval
    });

    await newOrder.save();

    res.json({
      message: "Order created successfully",
      order: newOrder
    });

  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({ error: "Order creation failed" });
  }
});

/* =========================
   Approve Large Order
========================= */
app.post("/api/orders/approve/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (!order.requires_approval) {
      return res.json({ message: "Order does not require approval" });
    }

    const stockItem = await Stock.findOne({ pipe_type: order.pipe_type });

    if (!stockItem || stockItem.quantity < order.quantity) {
      return res.status(400).json({
        error: "Insufficient stock for approval"
      });
    }

    // Deduct stock now
    stockItem.quantity -= order.quantity;
    await stockItem.save();

    // Auto ship after approval
    order.status = "Shipped";
    order.requires_approval = false;
    await order.save();

    res.json({ message: "Order approved and shipped successfully" });

  } catch (error) {
    console.error("Approval Error:", error);
    res.status(500).json({ error: "Approval failed" });
  }
});

/* =========================
   Get All Orders
========================= */
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ created_at: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/* =========================
   Start Server
========================= */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});