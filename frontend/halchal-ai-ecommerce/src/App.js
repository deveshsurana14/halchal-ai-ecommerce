import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";

import UserLogin from "./pages/UserLogin";
import AdminLogin from "./pages/AdminLogin";
import Home from "./pages/Home";

import AdminDashboard from "./pages/AdminDashboard";

// Admin Sub Pages
import Dashboard from "./pages/admin/Dashboard";
import StockManagement from "./pages/admin/StockManagement";
import Orders from "./pages/admin/Orders";
import PricingApprovals from "./pages/admin/PricingApprovals";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import ProductDetails from "./pages/ProductDetails";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<UserLogin />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/home" element={<Home />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/product/:pipeType" element={<ProductDetails />} />

        {/* Admin Layout Route */}
        <Route path="/admin-dashboard" element={<AdminDashboard />}>

          {/* Default redirect */}
          <Route index element={<Navigate to="dashboard" />} />

          {/* Nested Admin Pages */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="stock" element={<StockManagement />} />
          <Route path="orders" element={<Orders />} />
          <Route path="pricing-approvals" element={<PricingApprovals />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />

        </Route>

      </Routes>
    </Router>
  );
}

export default App;