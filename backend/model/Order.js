const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  pipe_type: { type: String, required: true },
  quantity: { type: Number, required: true },   // Order quantity
  region: { type: String, required: true },
  status: { type: String, default: "Pending" },
  requires_approval: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);