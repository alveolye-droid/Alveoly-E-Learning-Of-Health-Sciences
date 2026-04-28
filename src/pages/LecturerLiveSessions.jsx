import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./LecturerLiveSessions.css";

const LecturerLiveSessions = () => {
  const { user } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ✅ Backend URL from env or fallback
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
  const token = user?.token || localStorage.getItem("token");

  useEffect(() => {
    const fetchLecturerSessions = async () => {
      if (!token) {
        setMessage("⚠️ You must be logged in to view live sessions.");
        setLoading(false);
        return;
      }

      const apiUrl = `${SERVER_URL}/api/live/lecturer`;
      console.log("Fetching lecturer sessions from:", apiUrl);

      try {
        const res = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ API response:", res.data);

        // ✅ Handle both { sessions: [...] } or array directly
        const data = Array.isArray(res.data.sessions)
          ? res.data.sessions
          : Array.isArray(res.data)
          ? res.data
          : [];

        if (!data.length) {
          setMessage("No live sessions assigned to you yet.");
        }

        // Sort by start time
        const sorted = data.sort(
          (a, b) => new Date(a.startTime) - new Date(b.startTime)
        );

        setSessions(sorted);
      } catch (err) {
        console.error("❌ Failed to fetch sessions:", err);

        if (err.code === "ERR_NETWORK") {
          setMessage(
            "⚠️ Cannot connect to server. Check backend URL and server status."
          );
        } else {
          setMessage(
            err.response?.data?.message || "⚠️ Failed to load live sessions."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLecturerSessions();
  }, [SERVER_URL, token]);

  const getStatus = (status, start, end) => {
    const now = new Date();
    const s = new Date(start);
    const e = new Date(end);

    if (status === "cancelled") return "Cancelled";
    if (status === "ended" || now > e) return "Completed";
    if (status === "live" || (now >= s && now <= e)) return "Ongoing";
    return "Scheduled";
  };

  const getDuration = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.floor((e - s) / 60000); // in minutes
    return `${diff} min`;
  };

  return (
    <div className="lecturer-live-page">
      <div className="header">
        <h2>My Live Sessions</h2>
        <p>View and join your assigned live classes via Jitsi.</p>
      </div>

      {loading ? (
        <p>Loading sessions...</p>
      ) : message ? (
        <p className="feedback-message">{message}</p>
      ) : sessions.length === 0 ? (
        <p>No live sessions assigned to you.</p>
      ) : (
        <div className="table-wrapper">
          <table className="live-sessions-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Title</th>
                <th>Start</th>
                <th>End</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Join</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const status = getStatus(s.status, s.startTime, s.endTime);
                return (
                  <tr key={s._id}>
                    <td>{s.courseId?.programName || "—"}</td>
                    <td>{s.title || "Untitled Session"}</td>
                    <td>{new Date(s.startTime).toLocaleString()}</td>
                    <td>{new Date(s.endTime).toLocaleString()}</td>
                    <td>{getDuration(s.startTime, s.endTime)}</td>
                    <td>
                      <span
                        className={`status-badge ${status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td>
                      {status === "Cancelled" ? (
                        <button disabled className="cancelled-btn">
                          Cancelled
                        </button>
                      ) : status === "Scheduled" ? (
                        <button disabled className="not-started-btn">
                          Not Started
                        </button>
                      ) : (
                        <a
                          href={s.roomLink}
                          target="_blank"
                          rel="noreferrer"
                          className="join-btn"
                        >
                          Join Live
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LecturerLiveSessions;
