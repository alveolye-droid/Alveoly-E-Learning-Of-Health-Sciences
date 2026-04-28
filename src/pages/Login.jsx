// Login.jsx (Updated for Alveoly)
import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import { AuthContext } from "../context/AuthContext.jsx";
import axios from "axios";

const API_BASE = import.meta.env.VITE_SERVER_URL || process.env.VITE_APP_API_BASE_URL || "http://localhost:5000";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [googleReady, setGoogleReady] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useContext(AuthContext);

  useEffect(() => {
    setGoogleReady(true);
  }, []);

  // Handle OAuth callback from redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const dashboard = params.get("dashboard");
    const oauthError = params.get("error");

    if (oauthError) {
      setError(decodeURIComponent(oauthError));
      return;
    }

    if (!token) return;

    const loginWithToken = async () => {
      try {
        localStorage.setItem("authToken", token);
        const res = await axios.get(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        loginUser({ ...res.data.user, token });
        navigate(res.data.dashboardPath || dashboard || "/", { replace: true });
      } catch (err) {
        setError(err.response?.data?.message || err.message || "OAuth login failed");
      }
    };
    loginWithToken();
    window.history.replaceState({}, document.title, window.location.pathname);
  }, [location.search, navigate, loginUser]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ================= EMAIL LOGIN =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, form);
      localStorage.setItem("authToken", res.data.token);
      loginUser({ ...res.data.user, token: res.data.token, courses: res.data.user.courses });
      
      // Navigate based on role
      if (res.data.user?.role === "admin") {
        navigate("/admin/dashboard");
      } else if (res.data.user?.role === "lecturer") {
        navigate(`/lecturer/${res.data.user._id}/dashboard`);
      } else {
        navigate(res.data.dashboardPath || `/student/${res.data.user._id}/dashboard`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  // ================= GOOGLE LOGIN =================
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setGoogleLoading(true);
      setError("");
      
      const idToken = credentialResponse?.credential;
      if (!idToken) throw new Error("No Google credential received");

      // Send to backend Google OAuth endpoint
      window.location.href = `${API_BASE}/api/auth/google`;
      
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.message || "Google login failed");
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
    setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Simple Navbar */}
      <nav className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Alveoly</h1>
          <Link to="/register" className="text-gray-600 hover:text-blue-600">
            Register
          </Link>
        </div>
      </nav>

      <section className="flex-1 flex items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-xl rounded-2xl max-w-5xl w-full md:flex overflow-hidden"
        >
          {/* LEFT - Illustration */}
          <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-800">Welcome Back!</h3>
              <p className="text-gray-600 mt-2">
                Continue your learning journey with Alveoly
              </p>
            </div>
          </div>

          {/* RIGHT - Login Form */}
          <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-2">Welcome Back 👋</h2>
            <p className="text-gray-500 mb-6">
              Login to continue your learning journey
            </p>

            {/* GOOGLE LOGIN */}
            <div className="mb-4 text-center">
              {googleReady && !googleLoading && (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="continue_with"
                  shape="rectangular"
                  width="100%"
                />
              )}

              {googleLoading && (
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <p className="text-sm">Signing in with Google...</p>
                </div>
              )}
            </div>

            <div className="text-center text-gray-400 mb-6 text-sm">OR</div>

            {/* EMAIL LOGIN FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <FaLock className="absolute left-3 top-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-4 cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 text-white rounded-lg transition-colors ${
                  loading 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                Sign Up
              </Link>
            </p>

            <p className="text-center text-sm mt-2">
              <Link to="/forgot-password" className="text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </p>
          </div>
        </motion.div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
        <p>&copy; 2024 Alveoly E-Learning. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login;