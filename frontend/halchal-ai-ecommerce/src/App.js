import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";

import UserLogin from "./pages/UserLogin";
import AdminLogin from "./pages/AdminLogin";
import Home from "./pages/Home";

import AdminDashboard from "./pages/AdminDashboard";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";

// Admin Sub Pages
import Dashboard from "./pages/admin/Dashboard";
import StockManagement from "./pages/admin/StockManagement";
import Orders from "./pages/admin/Orders";
import PricingApprovals from "./pages/admin/PricingApprovals";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import ContactMessages from "./pages/admin/ContactMessages";
import ProductDetails from "./pages/ProductDetails";

import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
    <CartProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/home" element={<Home />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:pipeType" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile />} />

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
            <Route path="messages" element={<ContactMessages />} />
            <Route path="settings" element={<Settings />} />

          </Route>

        </Routes>
      </Router>
    </CartProvider>
    </ThemeProvider>
  );
}

export default App;