import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import emailjs from "@emailjs/browser";
import "./ResetPassword.css";

const API = import.meta.env.VITE_SERVER_URL;

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* ==============================
     STEP 1: SEND RESET EMAIL
  ============================== */
  const sendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(`${API}/api/auth/forgot-password`, { email });

      if (res.data.emailData) {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID_RESET,
          res.data.emailData,
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
      }

      setMessage("If the email exists, a reset link has been sent.");
    } catch (err) {
      setError("Unable to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ==============================
     STEP 2: RESET PASSWORD
  ============================== */
  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await axios.post(`${API}/api/auth/reset-password/${token}`, { password });
      setMessage("Password reset successful. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError("Invalid or expired reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h2>{token ? "Set New Password" : "Forgot Password"}</h2>
        <p className="reset-subtitle">
          {token
            ? "Create a new password to access your account."
            : "Enter your email and we’ll send you a reset link."}
        </p>

        {!token ? (
          <form onSubmit={sendEmail} className="reset-form">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="reset-form">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Set New Password"}
            </button>
          </form>
        )}

        {message && <p className="reset-message success">{message}</p>}
        {error && <p className="reset-message error">{error}</p>}
      </div>
    </div>
  );
}
