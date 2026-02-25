const mongoose = require("mongoose");

const approvedPriceSchema = new mongoose.Schema({
  pipe_type: { type: String, required: true },
  region: { type: String, required: true },
  price: { type: Number, required: true },
  approved_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ApprovedPrice", approvedPriceSchema);