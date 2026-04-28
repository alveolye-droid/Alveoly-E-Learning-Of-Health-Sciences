// src/pages/LecturerActivate.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./LecturerActivate.css";

const LecturerActivate = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // "info" | "success" | "error"

  const API_BASE = (import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");


  // Try multiple possible backend activation endpoints (most-likely first).
  const activationEndpoints = [
  `${API_BASE}/api/auth/activate-lecturer/${token}`,   // main
  `${API_BASE}/api/auth/lecturer-activate/${token}`,  // fallback
  `${API_BASE}/api/auth/complete-lecturer/${token}`,  // fallback
];


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("info");

    if (password !== confirm) {
      setMessageType("error");
      setMessage("Passwords do not match.");
      return;
    }

    if (!password || password.trim().length < 6) {
      setMessageType("error");
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    // Try endpoints sequentially until one returns success
    let lastError = null;
    for (const url of activationEndpoints) {
      try {
        const res = await axios.post(url, { password });
        const successMsg = res.data?.message || "Account activated successfully!";
        setMessageType("success");
        setMessage(successMsg);

        // small delay to let user read the message
        setTimeout(() => navigate("/lecturer-login"), 1500);
        setLoading(false);
        return;
      } catch (err) {
        // capture and continue to next URL
        lastError = err;
        // If server responded with a clear error message, keep it for final display
        const serverMsg = err.response?.data?.message || err.response?.data?.msg;
        console.warn(`Activation attempt failed for ${url}:`, serverMsg || err.message);
      }
    }

    // If we get here all endpoints failed
    const fallbackMsg =
      lastError?.response?.data?.message ||
      lastError?.message ||
      "Activation failed. Please contact admin or try the activation link again.";
    setMessageType("error");
    setMessage(fallbackMsg);
    setLoading(false);
  };

  return (
    <div className="lecturer-activate-container">
      <form className="lecturer-activate-form" onSubmit={handleSubmit}>
        <h2>Activate Your Lecturer Account</h2>
        <p>Set a password to complete your registration.</p>

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Activating..." : "Activate Account"}
        </button>

        {message && (
          <p
            className={`activate-message ${
              messageType === "success" ? "success" : messageType === "error" ? "error" : "info"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default LecturerActivate;
