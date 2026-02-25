const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  pipe_type: {
    type: String,
    required: true,
    unique: true
  },
  quantity: {
    type: Number,
    required: true
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Stock", stockSchema);