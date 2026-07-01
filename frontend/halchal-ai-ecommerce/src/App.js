import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

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
import Settings from "./pages/admin/Settings";
import ContactMessages from "./pages/admin/ContactMessages";
import ProductDetails from "./pages/ProductDetails";

import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Requires login — redirects to /login?redirect=<current path> if not authenticated
function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  if (!isLoggedIn) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  return children;
}

// Login/register page — redirects logged-in users away
function PublicOnlyRoute({ children }) {
  const { isLoggedIn } = useAuth();
  if (isLoggedIn) return <Navigate to="/home" replace />;
  return children;
}

function App() {
  return (
    <ThemeProvider>
    <CartProvider>
    <AuthProvider>
      <Router>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Public-only: redirect to /home if already logged in */}
          <Route path="/login" element={<PublicOnlyRoute><UserLogin /></PublicOnlyRoute>} />

          {/* Fully public */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/home" element={<Home />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:pipeType" element={<ProductDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Protected: must be logged in */}
          <Route path="/cart"    element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* Admin Layout Route */}
          <Route path="/admin-dashboard" element={<AdminDashboard />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard"        element={<Dashboard />} />
            <Route path="stock"            element={<StockManagement />} />
            <Route path="orders"           element={<Orders />} />
            <Route path="pricing-approvals" element={<PricingApprovals />} />
            <Route path="messages"         element={<ContactMessages />} />
            <Route path="settings"         element={<Settings />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
    </CartProvider>
    </ThemeProvider>
  );
}

export default App;
