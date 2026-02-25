import { useEffect, useState } from "react";

const pipeTypes = [
  "16mm Inline",
  "16mm Online",
  "20mm Inline",
  "20mm Online"
];

const StockManagement = () => {
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/stock");
      const data = await res.json();

      const formatted = {};
      data.forEach(item => {
        formatted[item.pipe_type] = item.quantity;
      });

      setStockData(formatted);
      setLoading(false);

    } catch (err) {
      console.error("Stock fetch error:", err);
    }
  };

  const handleChange = (pipe, value) => {
    setStockData(prev => ({
      ...prev,
      [pipe]: value
    }));
  };

  const updateStock = async (pipe) => {
    try {
      await fetch("http://localhost:5000/api/stock/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pipe_type: pipe,
          quantity: Number(stockData[pipe])
        })
      });

      alert(`${pipe} stock updated`);

    } catch (err) {
      console.error("Stock update error:", err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Stock Management</h2>

      {loading ? (
        <p>Loading stock...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pipeTypes.map(pipe => (
            <div
              key={pipe}
              className="bg-white p-6 rounded-2xl shadow"
            >
              <h3 className="font-semibold mb-3">{pipe}</h3>

              <input
                type="number"
                value={stockData[pipe] || ""}
                onChange={(e) => handleChange(pipe, e.target.value)}
                className="border px-4 py-2 rounded w-full mb-4"
              />

              <button
                onClick={() => updateStock(pipe)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
              >
                Update Stock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockManagement;