import { useEffect, useState, useCallback } from "react";

const pipeTypes = [
  "16mm Inline",
  "16mm Online",
  "20mm Inline",
  "20mm Online"
];

const regions = [
  "Pune",
  "Nashik",
  "Aurangabad",
  "Nagpur",
  "Kolhapur",
  "Amravati",
  "Jalgaon",
  "Solapur"
];

const PricingApprovals = () => {
  const [selectedRegion, setSelectedRegion] = useState("Pune");
  const [aiPrices, setAiPrices] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchAIPrices = useCallback(async () => {
    setLoading(true);

    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    const results = {};

    for (let pipe of pipeTypes) {
      try {
        const response = await fetch("http://localhost:5000/api/ai-price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pipe_type: pipe,
            region: selectedRegion,
            month,
            year
          })
        });

        const data = await response.json();
        results[pipe] = data.recommended_price;
      } catch (error) {
        console.error("AI Fetch Error:", error);
        results[pipe] = null;
      }
    }

    setAiPrices(results);
    setLoading(false);

  }, [selectedRegion]);

  useEffect(() => {
    fetchAIPrices();
  }, [fetchAIPrices]);

  const approvePrice = async (pipe, price) => {
    try {
      await fetch("http://localhost:5000/api/approve-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pipe_type: pipe,
          region: selectedRegion,
          price
        })
      });

      alert(`${pipe} approved for ${selectedRegion}`);
    } catch (error) {
      console.error("Approval Error:", error);
    }
  };

  return (
    <div>

      <h2 className="text-2xl font-semibold mb-6">
        Pricing Approvals
      </h2>

      <div className="mb-6">
        <label className="mr-3 font-medium">Select Region:</label>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          {regions.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {pipeTypes.map((pipe) => (
          <div key={pipe} className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-3">{pipe}</h3>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                <p className="text-blue-600 font-bold mb-4">
                  ₹{aiPrices[pipe] ?? "-"}
                </p>

                <button
                  onClick={() => approvePrice(pipe, aiPrices[pipe])}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Approve
                </button>
              </>
            )}
          </div>
        ))}

      </div>

    </div>
  );
};

export default PricingApprovals;