import React, { useEffect, useState, useContext } from "react";
import { FaUserGraduate } from "react-icons/fa";
import axios from "axios";
import { init, send } from "@emailjs/browser";
import "./AppliedStudents.css";
import { AuthContext } from "../context/AuthContext.jsx";

// ✅ Dynamic API base URL (dev vs prod)
const API_BASE = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const AppliedStudents = () => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // Initialize EmailJS
  // -----------------------------
  useEffect(() => {
    const userId = import.meta.env.VITE_EMAILJS_USER_ID;
    if (userId) {
      try {
        init(userId);
        console.log("✅ EmailJS initialized with user ID:", userId);
      } catch (err) {
        console.error("❌ EmailJS initialization failed:", err);
      }
    } else {
      console.warn("⚠️ EmailJS user ID not set in .env");
    }
  }, []);

  // -----------------------------
  // Fetch student applications
  // -----------------------------
  const fetchApplications = async () => {
    if (!user?.token) return;

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      const res = await axios.get(`${API_BASE}/api/applications`, { headers });

      // Backend may return array or { ok: true, data }
      const apps = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setStudents(apps);
    } catch (err) {
      console.error("❌ Error fetching applications:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") fetchApplications();
    else setLoading(false);
  }, [user]);

  // -----------------------------
  // Mark as read
  // -----------------------------
  const handleMarkAsRead = async (id) => {
    if (!user?.token) return;
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      await axios.patch(`${API_BASE}/api/applications/${id}/read`, {}, { headers });
      setStudents((prev) =>
        prev.map((s) => (s._id === id ? { ...s, readByAdmin: true } : s))
      );
    } catch (err) {
      console.error("❌ Error marking as read:", err);
      alert("Failed to mark as read.");
    }
  };

  // -----------------------------
  // Build EmailJS content
  // -----------------------------
  const buildEmailForStatus = (status, fullName, program) => {
    switch (status) {
      case "approved":
        return {
          subject: "🎓 Application Approved - Welcome!",
          htmlMessage: `Dear ${fullName},<br/><br/>
            🎉 <strong>Congratulations!</strong> Your application for <strong>${program}</strong> has been approved.<br/>
            You can now log in to your student dashboard.<br/><br/>
            Best regards,<br/>University Admissions Team`,
        };
      case "rejected":
        return {
          subject: "❌ Application Rejected",
          htmlMessage: `Dear ${fullName},<br/><br/>
            We regret to inform you that your application for <strong>${program}</strong> was not approved.<br/>
            You can reapply next year.<br/><br/>
            Best regards,<br/>University Admissions Team`,
        };
      default:
        return {
          subject: "Application Update",
          htmlMessage: `Dear ${fullName},<br/><br/>
            Your application for <strong>${program}</strong> is still under review.<br/><br/>
            Best regards,<br/>University Admissions Team`,
        };
    }
  };

  // -----------------------------
  // Update application status
  // -----------------------------
  const handleStatusUpdate = async (id, status, email, fullName, program) => {
    if (!user?.token) return;
    const headers = { Authorization: `Bearer ${user.token}` };

    // Optimistic UI update
    setStudents((prev) =>
      prev.map((s) => (s._id === id ? { ...s, status } : s))
    );

    try {
      const patchRes = await axios.patch(
        `${API_BASE}/api/applications/${id}`,
        { status },
        { headers }
      );
      if (patchRes.status !== 200) {
        console.error("❌ PATCH failed:", patchRes.status, patchRes.data);
        await fetchApplications();
        alert("Failed to update status on server.");
        return;
      }

      // Send EmailJS notification
      const { subject, htmlMessage } = buildEmailForStatus(status, fullName, program);
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

      if (!serviceId || !templateId) {
        console.warn("⚠️ EmailJS service/template ID missing.");
        alert(`✅ Application ${status} updated. EmailJS not configured.`);
        return;
      }

      try {
        await send(serviceId, templateId, {
          to_name: fullName,
          to_email: email,
          subject,
          html_message: htmlMessage,
        });
        console.log("📧 EmailJS sent successfully.");
        alert(`✅ Application ${status} for ${fullName} updated and email sent.`);
      } catch (err) {
        console.error("❌ EmailJS send failed:", err);
        alert(`✅ Application ${status} updated, but email notification failed.`);
      }
    } catch (err) {
      console.error("❌ Error updating status:", err);
      await fetchApplications();
      alert("Failed to update status. Check console.");
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  if (loading) return <p className="loading-text">Loading applications...</p>;
  if (!user || user.role !== "admin")
    return <p className="no-access">❌ You do not have access to view this page.</p>;

  return (
    <div className="applied-students-container">
      <div className="applied-header">
        <h2 className="page-title">
          <FaUserGraduate className="applied-icon" /> Student Applications
        </h2>
        <span className="notification-badge">{students.length}</span>
      </div>

      {students.length === 0 ? (
        <p className="no-data-text">No student applications found.</p>
      ) : (
        <div className="table-scroll-wrapper">
          <table className="applied-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Program</th>
                <th>Transcript</th>
                <th>English Proof</th>
                <th>Recommendations</th>
                <th>Personal Statement</th>
                <th>Message</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s._id} className={s.readByAdmin ? "read-row" : "unread-row"}>
                  <td>{i + 1}</td>
                  <td>{s.fullName}</td>
                  <td>{s.email}</td>
                  <td>{s.phone}</td>
                  <td>{s.program}</td>
                  <td>
                    {s.transcriptLink ? (
                      <a href={s.transcriptLink} target="_blank" rel="noreferrer">View</a>
                    ) : "—"}
                  </td>
                  <td>
                    {s.englishProofLink ? (
                      <a href={s.englishProofLink} target="_blank" rel="noreferrer">View</a>
                    ) : "—"}
                  </td>
                  <td>
                    {s.recommendationsLink ? (
                      <a href={s.recommendationsLink} target="_blank" rel="noreferrer">View</a>
                    ) : "—"}
                  </td>
                  <td>
                    {s.personalStatementLink ? (
                      <a href={s.personalStatementLink} target="_blank" rel="noreferrer">View</a>
                    ) : "—"}
                  </td>
                  <td>{s.message || "—"}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        s.status === "approved"
                          ? "approved"
                          : s.status === "rejected"
                          ? "rejected"
                          : "pending"
                      }`}
                    >
                      {s.status || "pending"}
                    </span>
                  </td>
                  <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="action-buttons">
                    <button
                      className="btn-approve"
                      onClick={() =>
                        handleStatusUpdate(s._id, "approved", s.email, s.fullName, s.program)
                      }
                      disabled={s.status === "approved"}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() =>
                        handleStatusUpdate(s._id, "rejected", s.email, s.fullName, s.program)
                      }
                      disabled={s.status === "rejected"}
                    >
                      Reject
                    </button>
                    <button
                      className="btn-mark-read"
                      onClick={() => handleMarkAsRead(s._id)}
                      disabled={s.readByAdmin}
                    >
                      {s.readByAdmin ? "Read" : "Mark as Read"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AppliedStudents;
