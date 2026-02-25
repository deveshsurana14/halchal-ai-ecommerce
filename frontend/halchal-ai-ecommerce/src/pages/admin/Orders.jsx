import { useEffect, useState } from "react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders");
      const data = await res.json();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch Orders Error:", err);
    }
  };

  const approveOrder = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/orders/approve/${id}`, {
        method: "POST"
      });

      alert("Order approved successfully");
      fetchOrders();
    } catch (err) {
      console.error("Approval Error:", err);
    }
  };

  const getStatusColor = (status) => {
    if (status === "Approved") return "text-green-600";
    if (status === "Pending Approval") return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Orders Management</h2>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-3">Pipe Type</th>
                <th className="py-3">Quantity</th>
                <th className="py-3">Region</th>
                <th className="py-3">Status</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map(order => (
                <tr key={order._id} className="border-b">
                  <td className="py-3">{order.pipe_type}</td>
                  <td className="py-3">{order.quantity}</td>
                  <td className="py-3">{order.region}</td>

                  <td className={`py-3 font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </td>

                  <td className="py-3">
                    {order.requires_approval ? (
                      <button
                        onClick={() => approveOrder(order._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-lg text-sm"
                      >
                        Approve
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;