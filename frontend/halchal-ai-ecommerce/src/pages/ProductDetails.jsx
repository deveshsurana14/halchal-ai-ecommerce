import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import productImg from "../assets/product.jpg";
import ChatBot from "../components/ChatBot";

const ProductDetails = () => {
  const { pipeType } = useParams();
  const decodedName = decodeURIComponent(pipeType);

  const metersPerCoil = 300;

  const [quantity, setQuantity] = useState(1);
  const [region, setRegion] = useState("Pune");
  const [message, setMessage] = useState("");

  const [aiPrice, setAiPrice] = useState(null);
  const [predictedDemand, setPredictedDemand] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  const totalMeters = quantity * metersPerCoil;

  /* =========================
     Fetch AI Dynamic Price
  ========================= */
  useEffect(() => {
    const fetchAiPrice = async () => {
      try {
        setLoadingPrice(true);
        setAiPrice(null);

        const response = await fetch("http://localhost:5000/api/ai-price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pipe_type: decodedName,
            region: region,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
          })
        });

        const data = await response.json();

        if (response.ok && data.recommended_price) {
          setAiPrice(data.recommended_price);
          setPredictedDemand(data.predicted_demand);
        } else {
          setAiPrice(null);
        }

      } catch (error) {
        setAiPrice(null);
      } finally {
        setLoadingPrice(false);
      }
    };

    fetchAiPrice();

  }, [decodedName, region]);

  /* =========================
     Place Order
  ========================= */
  const handleOrder = async () => {
    if (!aiPrice) {
      setMessage("AI price not available. Try again.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pipe_type: decodedName.trim(),
          quantity: Number(quantity),
          region
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error);
      } else {
        setMessage("Order placed successfully!");
      }

    } catch (error) {
      setMessage("Order failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-10 py-12">

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">

        {/* LEFT SIDE */}
        <div>

          <img
            src={productImg}
            alt="Product"
            className="w-full h-96 object-cover rounded-2xl shadow-xl mb-8"
          />

          <h1 className="text-4xl font-bold mb-2 text-gray-800">
            {decodedName}
          </h1>

          <p className="text-indigo-600 font-medium mb-4">
            1 Coil = {metersPerCoil} meters
          </p>

          <p className="text-gray-600 mb-6 leading-relaxed">
            Designed for precision irrigation systems, this high-quality inline
            drip pipe ensures efficient water distribution and long-term
            durability. Built for Indian agricultural conditions.
          </p>

          <div className="space-y-3 text-gray-700">
            <div>✔ UV Resistant Material</div>
            <div>✔ Uniform Water Flow</div>
            <div>✔ Suitable for Sugarcane, Cotton & Vegetable Farming</div>
            <div>✔ Long Operational Life</div>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="bg-white p-8 rounded-2xl shadow-xl h-fit sticky top-10">

          <div className="mb-4">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              AI Dynamic Pricing Enabled
            </span>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Place Your Order
          </h2>

          <label className="block font-medium mb-2">
            Quantity (Coils)
          </label>

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="border p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Pricing Box */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm text-gray-700">

            <p>
              Total Length: <strong>{totalMeters} meters</strong>
            </p>

            {loadingPrice ? (
              <p>Calculating AI Price...</p>
            ) : aiPrice ? (
              <>
                <p>
                  Predicted Demand: <strong>{predictedDemand}</strong>
                </p>
                <p>
                  AI Price per Coil: <strong>₹ {aiPrice}</strong>
                </p>
                <p>
                  Total Price: <strong>₹ {aiPrice * quantity}</strong>
                </p>
              </>
            ) : (
              <p className="text-red-500">AI price unavailable</p>
            )}

            {quantity > 1000 && (
              <p className="text-red-600 mt-2 font-medium">
                Large order – Requires Admin Approval
              </p>
            )}

          </div>

          <label className="block font-medium mb-2">
            Select Region
          </label>

          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="border p-3 w-full mb-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option>Pune</option>
            <option>Nashik</option>
            <option>Nagpur</option>
            <option>Amravati</option>
          </select>

          <button
            onClick={handleOrder}
            disabled={!aiPrice}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 rounded-xl text-lg font-semibold transition"
          >
            Place Order
          </button>

          {message && (
            <p className="mt-6 text-center font-medium text-sm">
              {message}
            </p>
          )}

        </div>

      </div>

      <ChatBot />

    </div>
  );
};

export default ProductDetails;