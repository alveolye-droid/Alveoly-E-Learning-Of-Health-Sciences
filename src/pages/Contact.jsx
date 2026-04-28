// Contact.jsx
import React, { useRef, useState, useEffect } from "react";
import { init, send } from "@emailjs/browser";
import "./Contact.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaPaperPlane } from "react-icons/fa";

const Contact = () => {
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [emailjsReady, setEmailjsReady] = useState(false);

  const API_BASE = import.meta.env.VITE_APP_API_BASE_URL;
  const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const EMAILJS_USER_ID = import.meta.env.VITE_EMAILJS_USER_ID;
  const CONTACT_TO_EMAIL = import.meta.env.VITE_CONTACT_TO_EMAIL || "alveolyelearning@gmail.com";

  // Initialize EmailJS
  useEffect(() => {
    if (EMAILJS_USER_ID) {
      try {
        init(EMAILJS_USER_ID);
        console.log("✅ EmailJS initialized with user ID:", EMAILJS_USER_ID);
        if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID) setEmailjsReady(true);
        else console.warn("⚠️ EmailJS service/template ID missing in env");
      } catch (err) {
        console.error("❌ EmailJS init error:", err);
      }
    } else {
      console.warn("⚠️ VITE_EMAILJS_USER_ID not set in env");
    }
  }, [EMAILJS_USER_ID, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(formRef.current);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    // Client-side validation
    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      alert("Please fill all fields.");
      setLoading(false);
      return;
    }

    let emailjsSent = false;

    // 1️⃣ Send via EmailJS if ready
    if (emailjsReady) {
      const templateParams = {
        to_name: "Admissions Team",
        to_email: CONTACT_TO_EMAIL,
        from_name: payload.name,
        from_email: payload.email,
        subject: payload.subject,
        html_message: payload.message,
      };

      try {
        console.log("📤 Sending contact message via EmailJS...", templateParams);
        await send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        emailjsSent = true;
        console.log("📧 EmailJS send successful");
      } catch (err) {
        console.error("❌ EmailJS send failed:", err);
      }
    } else {
      console.warn("⚠️ EmailJS not ready / configured; skipping EmailJS send.");
    }

    // 2️⃣ Always log message to backend
    try {
      const res = await fetch(`${API_BASE}/api/contact/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let result = {};
      try {
        result = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error("❌ Non-JSON response from server:", text);
        throw new Error("Server returned invalid response");
      }

      if (res.ok) {
        if (emailjsSent) {
          alert("✅ Message sent successfully! We will reply shortly.");
        } else {
          alert(
            "✅ Message recorded successfully. (Email delivery via EmailJS failed or is not configured.)"
          );
        }
        formRef.current.reset();
      } else {
        console.error("Backend contact error:", result);
        alert("❌ " + (result.msg || "Failed to send message. Please try again later."));
      }
    } catch (err) {
      console.error("Contact form POST error:", err);
      if (emailjsSent) {
        alert("✅ Message sent (EmailJS) but saving to server failed. Check console.");
        formRef.current.reset();
      } else {
        alert("❌ Failed to send message. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <Navbar />

      <header className="contact-hero">
        <h1>Contact Us</h1>
        <p>
          We'd love to hear from you! Whether you have a question about admissions,
          programs, or anything else — our team is ready to help.
        </p>
      </header>

      <section className="contact-section">
        {/* ===== Contact Info Cards ===== */}
        <div className="contact-info">
          <div className="info-card">
            <FaEnvelope className="info-icon" />
            <h3>Email</h3>
            <p>{CONTACT_TO_EMAIL}</p>
          </div>

          <div className="info-card">
            <FaPhoneAlt className="info-icon" />
            <h3>Phone</h3>
            <p>+233 555 123 456</p>
          </div>

          <div className="info-card">
            <FaMapMarkerAlt className="info-icon" />
            <h3>Address</h3>
            <p>Alveoly E-Learning Academy Of Health & Sciences, Accra, Ghana</p>
          </div>
        </div>

        {/* ===== Contact Form ===== */}
        <form ref={formRef} onSubmit={handleSubmit} className="contact-form">
          <h2>Send Us a Message</h2>

          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" placeholder="Your Name" required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="Your Email" required />
          </div>

          <div className="form-group">
            <label>Subject</label>
            <input type="text" name="subject" placeholder="Subject" required />
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea name="message" rows="5" placeholder="Type your message..." required />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Sending..." : (
              <>
                <FaPaperPlane style={{ marginRight: 8 }} /> Send Message
              </>
            )}
          </button>
        </form>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
