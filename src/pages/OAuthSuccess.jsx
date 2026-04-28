import React, { useEffect, useContext, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import "./OAuthSuccess.css";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useContext(AuthContext);

  const [status, setStatus] = useState("Starting OAuth flow...");
  const [error, setError] = useState(null);

  // 🔒 Prevent double execution (React StrictMode)
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const dashboard = params.get("dashboard");
    const oauthError = params.get("error");

    console.log("🔹 OAuth URL params:", location.search);
    console.log("🔹 Token:", token);
    console.log("🔹 Dashboard:", dashboard);
    console.log("🔹 OAuth error:", oauthError);

    // ❌ OAuth provider error
    if (oauthError) {
      const decoded = decodeURIComponent(oauthError);
      setError(decoded);
      setStatus("OAuth failed. Redirecting to login...");
      console.error("❌ OAuth error:", decoded);

      setTimeout(() => navigate("/login", { replace: true }), 4000);
      return;
    }

    // ❌ No token
    if (!token) {
      setError("No authentication token received.");
      setStatus("Redirecting to login...");
      console.warn("❌ Missing OAuth token");

      setTimeout(() => navigate("/login", { replace: true }), 4000);
      return;
    }

    // ✅ Persist token
    localStorage.setItem("token", token);
    console.log("✅ Token saved to localStorage");

    // ✅ Correct API base (Vite)
    const apiBase =
      import.meta.env.VITE_APP_API_BASE_URL ||
      "https://alveoly-e-learning-o2qq.onrender.com";

    const fetchUserProfile = async () => {
      try {
        setStatus("Fetching user profile...");

        const res = await fetch(`${apiBase}/api/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        const data = await res.json().catch(() => ({}));
        console.log("🔹 /api/auth/me:", res.status, data);

        if (!res.ok || !data?.user) {
          throw new Error(
            data?.message || `Profile fetch failed (${res.status})`
          );
        }

        const user = data.user;
        const redirectPath =
          data.dashboardPath || dashboard || "/";

        console.log("✅ Authenticated user:", user);

        loginUser({ ...user, token });

        setStatus("Login successful! Redirecting...");
        setTimeout(
          () => navigate(redirectPath, { replace: true }),
          1500
        );
      } catch (err) {
        console.error("❌ OAuth profile error:", err.message);
        setError(err.message || "Authentication failed");
        setStatus("Redirecting to login...");

        setTimeout(() => navigate("/login", { replace: true }), 4000);
      }
    };

    fetchUserProfile();
  }, [location.search, navigate, loginUser]);

  return (
    <div className="oauth-success-container">
      <div className="oauth-card">
        <h1>OAuth Login</h1>
        <p>{status}</p>

        {error && <p className="error-message">{error}</p>}

        {!error && (
          <div className="spinner">
            <div className="bounce1" />
            <div className="bounce2" />
            <div className="bounce3" />
          </div>
        )}

        <small style={{ marginTop: 12, display: "block", opacity: 0.7 }}>
          Please wait…
        </small>
      </div>
    </div>
  );
};

export default OAuthSuccess;
