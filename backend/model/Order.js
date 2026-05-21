const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  pipe_type:        { type: String, required: true },
  quantity:         { type: Number, required: true },
  region:           { type: String, required: true },
  status:           { type: String, default: "Pending" },
  requires_approval:{ type: Boolean, default: false },

  // AI pricing snapshot — captured at time of order
  approved_price:   Number,   // per-coil AI price before discount
  final_price:      Number,   // per-coil after bulk discount
  discount_percent: Number,
  total_ex_gst:     Number,
  total_gst:        Number,
  total_with_gst:   Number,
  gst_rate:         { type: Number, default: 12 },

  // ML context snapshot
  season:           String,
  zone:             String,
  predicted_demand: Number,

  session_id:       String,   // links to the Cart session that generated this order
  created_at:       { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
