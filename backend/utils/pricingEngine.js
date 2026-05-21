// Gap 2: Realistic B2B discount tiers for drip pipe coils
// Gap 3: GST @ 12% (HSN 3917 — polyethylene pipes for irrigation)

function calculateFinalOrderPrice({ approvedPrice, quantity }) {
  if (!approvedPrice || approvedPrice <= 0) throw new Error("Invalid approved price");
  if (!quantity    || quantity    <= 0) throw new Error("Invalid quantity");

  // Realistic discount tiers — typical for drip pipe dealers in India
  let discountFactor = 1.00;
  if      (quantity >= 500) discountFactor = 0.92; // 8%
  else if (quantity >= 100) discountFactor = 0.94; // 6%
  else if (quantity >=  50) discountFactor = 0.96; // 4%
  else if (quantity >=  10) discountFactor = 0.98; // 2%
  else if (quantity >=   5) discountFactor = 0.99; // 1%

  // Price per coil after discount, rounded to ₹10
  const pricePerCoil = Math.round((approvedPrice * discountFactor) / 10) * 10;

  // GST @ 12% applied on total bill (HSN 3917 — polyethylene irrigation pipes)
  // Applies on every sale regardless of quantity — mandatory for GST-registered entities
  const totalExGST  = pricePerCoil * quantity;
  const totalGST    = Math.round(totalExGST * 0.12 * 100) / 100;
  const totalWithGST = Math.round((totalExGST + totalGST) * 100) / 100;

  return {
    approvedPrice,
    quantity,
    discountPercent: Number(((1 - discountFactor) * 100).toFixed(1)),
    finalPrice:      pricePerCoil,   // ex-GST price per coil
    gstRate:         12,
    totalExGST,
    totalGST,
    totalWithGST,
  };
}

module.exports = { calculateFinalOrderPrice };
