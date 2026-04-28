// AdminMessages.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { init, send } from "@emailjs/browser";
import "./AdminMessages.css";

// VITE env variables
const API = import.meta.env.VITE_APP_API_BASE_URL;
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_CONTACT_REPLY_ID;
const EMAILJS_USER_ID = import.meta.env.VITE_EMAILJS_USER_ID;

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reply, setReply] = useState({});
  const [sending, setSending] = useState({});

  // Initialize EmailJS
  useEffect(() => {
    if (EMAILJS_USER_ID) {
      try {
        init(EMAILJS_USER_ID);
        console.log("✅ EmailJS initialized", EMAILJS_USER_ID);
      } catch (err) {
        console.error("❌ EmailJS init error", err);
      }
    } else {
      console.warn("⚠️ VITE_EMAILJS_USER_ID missing in env");
    }
  }, []);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("You must be logged in as admin.");

        const res = await axios.get(`${API}/api/admin/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const msgs = res.data?.messages || res.data || [];
        if (!Array.isArray(msgs)) {
          console.warn("⚠️ Unexpected messages response:", res.data);
          setMessages([]);
        } else {
          setMessages(msgs);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
        setError(err.response?.data?.msg || err.message || "Failed to load messages.");
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleReplyChange = (id, value) => {
    setReply((prev) => ({ ...prev, [id]: value }));
  };

  const sendReply = async (msg) => {
    const replyText = (reply[msg._id] || "").trim();
    if (!replyText) {
      alert("Please type a reply before sending.");
      return;
    }

    setSending((prev) => ({ ...prev, [msg._id]: true }));

    try {
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
        throw new Error("EmailJS not configured. Check VITE env variables.");
      }

      const templateParams = {
        to_name: msg.name,
        to_email: msg.email,
        subject: `Re: ${msg.subject}`,
        html_message: replyText,
        status: "reply",
      };

      await send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      console.log(`📧 Reply sent to ${msg.email}`);

      // Log reply to backend
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${API}/api/admin/reply/log`,
          {
            messageId: msg._id,
            toEmail: msg.email,
            subject: `Re: ${msg.subject}`,
            message: replyText,
            repliedBy: "admin",
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (logErr) {
        console.warn("⚠️ Failed to log reply to backend:", logErr);
      }

      alert(`✅ Reply sent to ${msg.email}`);
      setReply((prev) => ({ ...prev, [msg._id]: "" }));
    } catch (err) {
      console.error("❌ sendReply error:", err);
      alert(err.message || "Failed to send reply. See console.");
    } finally {
      setSending((prev) => ({ ...prev, [msg._id]: false }));
    }
  };

  if (loading) return <p>Loading messages...</p>;

  return (
    <div className="admin-messages-page">
      <h2>Contact Messages</h2>
      {error && <p className="error">{error}</p>}

      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <div className="messages-list">
          {messages.map((msg) => (
            <div key={msg._id} className="message-card">
              <h3>{msg.subject}</h3>
              <p><strong>Name:</strong> {msg.name}</p>
              <p><strong>Email:</strong> {msg.email}</p>
              <p><strong>Message:</strong> {msg.message}</p>
              <p className="date">{new Date(msg.createdAt).toLocaleString()}</p>

              <textarea
                placeholder="Type your reply..."
                value={reply[msg._id] || ""}
                onChange={(e) => handleReplyChange(msg._id, e.target.value)}
                rows="4"
                style={{ width: "100%", marginTop: "0.5rem", padding: "0.5rem" }}
              />

              <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => sendReply(msg)}
                  disabled={sending[msg._id] || !reply[msg._id]}
                >
                  {sending[msg._id] ? "Sending..." : "Send Reply (EmailJS)"}
                </button>

                <button onClick={() => setReply((prev) => ({ ...prev, [msg._id]: "" }))}>
                  Clear
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
