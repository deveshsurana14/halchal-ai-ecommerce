import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "dashboard" },
    { name: "Stock Management", path: "stock" },
    { name: "Orders", path: "orders" },
    { name: "Pricing Approvals", path: "pricing-approvals" },
    { name: "Reports", path: "reports" },
    { name: "Settings", path: "settings" },
  ];

  const getPageTitle = () => {
    const current = menuItems.find(item =>
      location.pathname.includes(item.path)
    );
    return current ? current.name : "Dashboard";
  };

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans">

      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-indigo-700 to-purple-700 text-white flex flex-col p-6 shadow-lg">

        <h2 className="text-2xl font-bold mb-10 tracking-wide">
          Halchal Admin
        </h2>

        <nav className="space-y-4 text-sm font-medium">
          {menuItems.map((item) => {
            const isActive = location.pathname === `/admin-dashboard/${item.path}`;

            return (
              <Link
                key={item.name}
                to={`/admin-dashboard/${item.path}`}
                className={`block px-4 py-2 rounded-lg transition ${
                  isActive
                    ? "bg-white text-indigo-700 font-semibold"
                    : "hover:bg-indigo-600"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Section */}
      <div className="flex-1 p-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {getPageTitle()}
            </h1>
            <p className="text-gray-500 mt-1">
              AI-Driven Inventory & Pricing Intelligence
            </p>
          </div>

          <button
            onClick={() => navigate("/admin")}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-sm font-medium shadow transition"
          >
            Logout
          </button>

        </div>

        {/* Nested Page Content Appears Here */}
        <Outlet />

      </div>
    </div>
  );
};

export default AdminDashboard;