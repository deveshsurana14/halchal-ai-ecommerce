import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import bg from "../bg.jpg";
import productImg from "../assets/product.jpg";
import ChatBot from "../components/ChatBot";

const Home = () => {
  const navigate = useNavigate();

  const products = [
    { name: "Premium 16mm Inline", price: 1250 },
    { name: "Premium 20mm Inline", price: 1450 },
    { name: "Gold 16mm Inline", price: 1350 },
    { name: "Supreme 20mm Inline", price: 1600 }
  ];

  const handleViewProduct = (productName) => {
    navigate(`/product/${encodeURIComponent(productName)}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* Navbar */}
      <div className="bg-white shadow-md px-10 py-4 flex justify-between items-center">

        <img
          src={logo}
          alt="Halchal Industries"
          className="h-14 object-contain"
        />

        <div className="flex items-center space-x-8 font-medium text-gray-700">

          <span className="cursor-pointer hover:text-blue-600 transition">
            Home
          </span>

          <span className="cursor-pointer hover:text-blue-600 transition">
            Products
          </span>

          <span className="cursor-pointer hover:text-blue-600 transition">
            Cart
          </span>

          <button
            onClick={() => navigate("/")}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg transition"
          >
            Logout
          </button>

        </div>
      </div>

      {/* Hero Section */}
      <div
        className="h-[400px] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundPosition: "center 45%",
        }}
      >
        <div className="bg-black/60 p-10 rounded-xl text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Quality Pipes for a Brighter Future
          </h2>
          <p className="text-gray-200">
            AI-Driven Smart Irrigation Solutions
          </p>
        </div>
      </div>

      {/* Featured Products */}
      <div className="px-10 py-16 flex-1">

        <h3 className="text-3xl font-bold mb-10 text-center text-gray-800">
          Featured Products
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {products.map((product, index) => (
            <div
              key={index}
              onClick={() => handleViewProduct(product.name)}
              className="bg-white cursor-pointer rounded-2xl shadow-md hover:shadow-xl transition p-6 text-center border border-gray-100"
            >
              <img
                src={productImg}
                alt="Product"
                className="h-40 w-full object-cover rounded-lg mb-6"
              />

              <h4 className="font-semibold text-gray-800 mb-2">
                {product.name}
              </h4>

              <p className="text-green-600 font-bold text-lg mb-4">
                ₹ {product.price}
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewProduct(product.name);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
              >
                View Product
              </button>
            </div>
          ))}

        </div>

      </div>

      <ChatBot />

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-6 mt-16">
        <div className="max-w-6xl mx-auto flex justify-between px-10 text-sm">

          <span>© 2026 Halchal Industries</span>

          <div className="space-x-6">
            <Link
              to="/privacy-policy"
              className="hover:text-white transition"
            >
              Privacy Policy
            </Link>

            <Link
              to="/terms"
              className="hover:text-white transition"
            >
              Terms & Conditions
            </Link>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Home;