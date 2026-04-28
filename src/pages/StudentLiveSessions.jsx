import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./StudentLiveSessions.css";

const StudentLiveSessions = () => {
  const { user } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ✅ Use Vite env variable properly
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSessions = async () => {
      if (!token) {
        setMessage("⚠️ You must be logged in to view live sessions.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${SERVER_URL}/api/live/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ Extract sessions array safely
        const sessionArray = Array.isArray(res.data.sessions) ? res.data.sessions : [];

        // Sort by startTime ascending
        const sorted = sessionArray.sort(
          (a, b) => new Date(a.startTime) - new Date(b.startTime)
        );

        if (sorted.length === 0) {
          setMessage("No live sessions available right now.");
        }

        setSessions(sorted);
      } catch (err) {
        console.error("❌ Failed to fetch sessions:", err);
        setMessage("⚠️ Failed to load live sessions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [SERVER_URL, token]);

  // Determine session status
  const getStatus = (status, start, end) => {
    const now = new Date();
    const s = new Date(start);
    const e = new Date(end);

    if (status === "cancelled") return "Cancelled";
    if (status === "ended" || now > e) return "Completed";
    if (status === "live" || (now >= s && now <= e)) return "Ongoing";
    return "Scheduled";
  };

  // Calculate session duration in minutes
  const getDuration = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.floor((e - s) / 60000);
    return `${diff} min`;
  };

  return (
    <div className="student-live-page">
      <div className="header">
        <h2>Join Live Sessions</h2>
        <p>View upcoming and ongoing live lectures and join them via Jitsi.</p>
      </div>

      {loading ? (
        <p>Loading live sessions...</p>
      ) : message ? (
        <p className="feedback-message">{message}</p>
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
                    <td>
                      {s.courseId?.programName}{" "}
                      {s.courseId?.className && `- ${s.courseId.className}`}
                    </td>
                    <td>{s.title}</td>
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
                      {status === "Scheduled" ? (
                        <button disabled className="not-started-btn">
                          Not Started
                        </button>
                      ) : status === "Cancelled" ? (
                        <button disabled className="cancelled-btn">
                          Cancelled
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

export default StudentLiveSessions;
