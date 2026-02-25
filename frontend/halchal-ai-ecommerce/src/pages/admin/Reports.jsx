import { useEffect, useState } from "react";

const Reports = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/orders")
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error(err));
  }, []);

  const totalOrders = orders.length;
  const shippedOrders = orders.filter(
    order => order.status === "Shipped"
  ).length;

  const pendingApprovals = orders.filter(
    order => order.status === "Pending Approval"
  ).length;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-700">
        Reports Overview
      </h2>

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Total Orders</h3>
          <p className="text-3xl font-bold text-indigo-700">
            {totalOrders}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Orders Shipped</h3>
          <p className="text-3xl font-bold text-green-600">
            {shippedOrders}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Pending Approval</h3>
          <p className="text-3xl font-bold text-red-600">
            {pendingApprovals}
          </p>
        </div>

      </div>
    </div>
  );
};

export default Reports;