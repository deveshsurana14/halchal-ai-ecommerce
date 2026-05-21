const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  id:               { type: String, required: true },  // composite: name__state
  name:             { type: String, required: true },
  state:            { type: String, required: true },
  quantity:         { type: Number, required: true },
  approvedPrice:    Number,
  finalPrice:       Number,
  discountPercent:  Number,
  totalExGST:       Number,
  totalGST:         Number,
  totalWithGST:     Number,
  gstRate:          { type: Number, default: 12 },
  season:           String,
  zone:             String,
  predicted_demand: Number,
  factors:          mongoose.Schema.Types.Mixed,
  addedAt:          Number,   // epoch ms
}, { _id: false });

const cartSchema = new mongoose.Schema({
  sessionId: {
    type: String, required: true, unique: true, index: true,
  },
  items:     { type: [cartItemSchema], default: [] },
}, { timestamps: true });   // createdAt + updatedAt added automatically

module.exports = mongoose.model("Cart", cartSchema);
