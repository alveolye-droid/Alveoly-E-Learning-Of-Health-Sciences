import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AllLiveSessions.css";

const AllLiveSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingSession, setEditingSession] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });

  const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  // Central axios instance
  const axiosInstance = axios.create({
    baseURL: SERVER_URL,
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });

  /* =====================================================
     🔹 FETCH ALL SESSIONS
  ===================================================== */
  useEffect(() => {
    const fetchSessions = async () => {
      if (!token) {
        setMessage("⚠️ You must be logged in as admin to view live sessions.");
        setLoading(false);
        return;
      }

      try {
        const res = await axiosInstance.get("/api/live");
        // Admin route returns { sessions: [...] } or array directly
        const data = res.data.sessions || res.data || [];
        setSessions(data);
      } catch (err) {
        console.error("❌ Failed to fetch sessions:", err);
        setMessage(
          "⚠️ Failed to load live sessions. Make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [axiosInstance, token]);

  /* =====================================================
     🔹 DELETE SESSION
  ===================================================== */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;

    try {
      await axiosInstance.delete(`/api/live/${id}`);
      setSessions((prev) => prev.filter((s) => s._id !== id));
      setMessage("🗑️ Live session deleted successfully.");
    } catch (err) {
      console.error("❌ Failed to delete session:", err);
      setMessage("❌ Failed to delete session. Try again.");
    }
  };

  /* =====================================================
     🔹 ENABLE EDIT MODE
  ===================================================== */
  const startEditing = (session) => {
    setEditingSession(session._id);
    setEditData({
      title: session.title || "",
      description: session.description || "",
      startTime: session.startTime
        ? new Date(session.startTime).toISOString().slice(0, 16)
        : "",
      endTime: session.endTime
        ? new Date(session.endTime).toISOString().slice(0, 16)
        : "",
    });
  };

  /* =====================================================
     🔹 HANDLE EDIT INPUT CHANGE
  ===================================================== */
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  /* =====================================================
     🔹 SAVE UPDATED SESSION
  ===================================================== */
  const handleUpdate = async (id) => {
    try {
      const res = await axiosInstance.put(`/api/live/${id}`, editData);
      const updatedSession = res.data.session || res.data;
      setSessions((prev) =>
        prev.map((s) => (s._id === id ? updatedSession : s))
      );
      setEditingSession(null);
      setMessage("✅ Live session updated successfully.");
    } catch (err) {
      console.error("❌ Failed to update session:", err);
      setMessage("❌ Failed to update session. Check your inputs.");
    }
  };

  /* =====================================================
     🔹 CANCEL EDIT
  ===================================================== */
  const cancelEdit = () => {
    setEditingSession(null);
    setEditData({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
    });
  };

  /* =====================================================
     🔹 RENDER
  ===================================================== */
  return (
    <div className="create-course-page">
      <div className="create-course-header">
        <h2 className="page-title">All Live Sessions</h2>
        <p className="page-subtitle">
          Manage and monitor upcoming & past live lectures
        </p>
      </div>

      {loading ? (
        <p>Loading sessions...</p>
      ) : message ? (
        <p className="feedback-message">{message}</p>
      ) : (
        <div className="create-course-form-wrapper">
          {sessions.length === 0 && <p>No live sessions scheduled yet.</p>}

          <table className="course-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Title</th>
                <th>Description</th>
                <th>Start</th>
                <th>End</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s._id}>
                  <td>
                    {s.courseId?.programName || "N/A"}{" "}
                    {s.courseId?.className && `- ${s.courseId.className}`}
                  </td>

                  {editingSession === s._id ? (
                    <>
                      <td>
                        <input
                          type="text"
                          name="title"
                          value={editData.title}
                          onChange={handleEditChange}
                        />
                      </td>
                      <td>
                        <textarea
                          name="description"
                          value={editData.description}
                          onChange={handleEditChange}
                          rows="2"
                        />
                      </td>
                      <td>
                        <input
                          type="datetime-local"
                          name="startTime"
                          value={editData.startTime}
                          onChange={handleEditChange}
                        />
                      </td>
                      <td>
                        <input
                          type="datetime-local"
                          name="endTime"
                          value={editData.endTime}
                          onChange={handleEditChange}
                        />
                      </td>
                      <td>
                        <button
                          className="save-btn"
                          onClick={() => handleUpdate(s._id)}
                        >
                          Save
                        </button>
                        <button className="cancel-btn" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{s.title}</td>
                      <td>{s.description || "—"}</td>
                      <td>{s.startTime ? new Date(s.startTime).toLocaleString() : "—"}</td>
                      <td>{s.endTime ? new Date(s.endTime).toLocaleString() : "—"}</td>
                      <td className="action-buttons">
                        {s.roomLink && (
                          <a
                            href={s.roomLink}
                            target="_blank"
                            rel="noreferrer"
                            className="join-link"
                          >
                            Join
                          </a>
                        )}
                        <button
                          className="edit-btn"
                          onClick={() => startEditing(s)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(s._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllLiveSessions;
