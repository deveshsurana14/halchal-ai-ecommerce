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

const Dashboard = () => {
  const [selectedRegion, setSelectedRegion] = useState("Pune");
  const [aiData, setAiData] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchAllPipeData = useCallback(async () => {
    setLoading(true);

    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const results = {};

    for (let pipe of pipeTypes) {
      try {
        const response = await fetch("http://localhost:5000/api/ai-price", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pipe_type: pipe,
            region: selectedRegion,
            month,
            year
          }),
        });

        const data = await response.json();
        results[pipe] = data;

      } catch (error) {
        console.error("AI Fetch Error:", error);
        results[pipe] = null;
      }
    }

    setAiData(results);
    setLoading(false);

  }, [selectedRegion]);

  useEffect(() => {
    fetchAllPipeData();
  }, [fetchAllPipeData]);

  return (
    <div>

      {/* Region Selector */}
      <div className="mb-8">
        <label className="block text-gray-700 font-medium mb-2">
          Select Region
        </label>

        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="px-4 py-2 border rounded-lg shadow-sm"
        >
          {regions.map((region) => (
            <option key={region}>{region}</option>
          ))}
        </select>
      </div>

      {/* Pipe Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {pipeTypes.map((pipe) => (
          <div
            key={pipe}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold mb-3">{pipe}</h3>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  Predicted Monthly Demand
                </p>
                <h2 className="text-2xl font-bold text-green-600">
                  {aiData[pipe]?.predicted_demand ?? "-"}
                </h2>

                <p className="text-sm text-gray-500 mt-4">
                  Recommended Price
                </p>
                <h2 className="text-2xl font-bold text-blue-600">
                  ₹{aiData[pipe]?.recommended_price ?? "-"}
                </h2>
              </>
            )}
          </div>
        ))}

      </div>

    </div>
  );
};

export default Dashboard;