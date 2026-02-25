import bg from "../bg.jpg";
import { Link, useNavigate } from "react-router-dom";

function UserLogin() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundPosition: "center 39cd%",
      }}
    >
      <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-80 border border-white/30">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          User Login
        </h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 px-4 py-2 rounded-lg bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 rounded-lg bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={() => navigate("/home")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
        >
          Login
        </button>

        <p className="text-sm text-white mt-4 text-center">
          Admin?{" "}
          <Link to="/admin">
            <span className="underline">Login here</span>
          </Link>
        </p>
      </div>
    </div>
  );
}

export default UserLogin;
