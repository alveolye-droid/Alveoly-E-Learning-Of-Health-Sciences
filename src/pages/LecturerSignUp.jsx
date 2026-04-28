// src/pages/AdminInviteLecturer.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import emailjs from "@emailjs/browser";
import "./LecturerSignUp.css";

const API_BASE =
  import.meta.env.VITE_APP_API_BASE_URL ||
  import.meta.env.VITE_SERVER_URL ||
  "http://localhost:5000";

const LecturerSignUp = () => {
  const [form, setForm] = useState({ name: "", email: "", course: "" });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  /* ==========================================
     📌 FETCH COURSES FOR ADMIN (ON MOUNT)
  ========================================== */
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("authToken"); // ✅ CORRECT TOKEN KEY

        const res = await axios.get(`${API_BASE}/api/admin/courses`, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        // ❗ Handle response format safely
        if (Array.isArray(res.data?.courses)) {
          setCourses(res.data.courses);
        } else if (Array.isArray(res.data)) {
          setCourses(res.data);
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.error("❌ Error loading courses", err.response?.data || err);
        setStatusMsg({ type: "error", text: "❌ Failed to load courses. Admin access required." });
      }
    };

    fetchCourses();
  }, []);

  /* ==========================================
     ✏️ INPUT HANDLERS
  ========================================== */
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const clearForm = () => setForm({ name: "", email: "", course: "" });

  /* ==========================================
     📩 SEND INVITE
  ========================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!form.name.trim() || !form.email.trim()) {
      return setStatusMsg({ type: "error", text: "⚠ Name and Email are required." });
    }

    const token = localStorage.getItem("authToken"); // ✅ FIXED
    if (!token) return setStatusMsg({ type: "error", text: "⚠ Admin must be logged in." });

    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        course: form.course || null,
      };

      const res = await axios.post(
        `${API_BASE}/api/auth/invite-lecturer`,
        payload,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { message, emailData, activationLink } = res.data;

      if (!emailData) {
        return setStatusMsg({
          type: "error",
          text: `⚠ Invitation saved, but email template missing. Manual link: ${activationLink}`,
        });
      }

      await emailjs.send(
        emailData.serviceId,
        emailData.templateId,
        emailData.templateParams,
        emailData.publicKey
      );

      setStatusMsg({ type: "success", text: `✅ Invitation sent to ${form.email}` });
      clearForm();
    } catch (err) {
      console.error("Invite error:", err);
      const msg =
        err.response?.data?.message || err.response?.data?.error || "❌ Failed to invite lecturer.";
      setStatusMsg({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-invite-container">
      <div className="admin-invite-card">
        <h3>Invite a Lecturer</h3>

        {statusMsg && (
          <div className={`admin-invite-alert ${statusMsg.type}`}>{statusMsg.text}</div>
        )}

        <form className="admin-invite-form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            Email Address
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>

          <label>
            Assign Course (optional)
            <select name="course" value={form.course} onChange={handleChange}>
              <option value="">— No Course Assigned —</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.programName} {c.category && `(${c.category})`}
                </option>
              ))}
            </select>
          </label>

          <button disabled={loading} className="btn-invite">
            {loading ? "Sending..." : "Send Invitation"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LecturerSignUp;
