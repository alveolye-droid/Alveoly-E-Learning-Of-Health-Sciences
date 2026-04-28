import React, { useState, useEffect, useContext } from "react";
import "./UnlockExam.css";
import { AuthContext } from "../context/AuthContext";

const UnlockExam = () => {
  const { user } = useContext(AuthContext);

  // ✅ Vite-safe API base (already includes /api)
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const token =
    user?.token ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("token");

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [unlockTime, setUnlockTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [schedules, setSchedules] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  // =============================
  // 🔹 FETCH LECTURER EXAMS
  // =============================
  useEffect(() => {
    if (!user?._id || !token) return;

    const fetchExams = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/exams/lecturer/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        if (data?.success) setExams(data.exams || []);
      } catch (err) {
        console.error("❌ Failed to fetch exams:", err);
      }
    };

    fetchExams();
  }, [API_BASE_URL, user?._id, token]);

  // =============================
  // 🔹 FETCH UNLOCK SCHEDULES
  // =============================
  useEffect(() => {
    if (!token) return;

    const fetchSchedules = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/exams/unlock-schedules`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        if (data?.success) setSchedules(data.schedules || []);
      } catch (err) {
        console.error("❌ Failed to fetch schedules:", err);
      }
    };

    fetchSchedules();
  }, [API_BASE_URL, token, status]);

  // =============================
  // 🔹 SET UNLOCK SCHEDULE
  // =============================
  const handleUnlock = async (e) => {
    e.preventDefault();

    if (!selectedExam || !unlockDate || !unlockTime || !endTime) {
      setStatus({ type: "error", message: "All fields are required" });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch(`${API_BASE_URL}/exams/unlock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          examId: selectedExam,
          unlockDate,
          unlockTime,
          endTime,
        }),
      });

      const data = await res.json();

      if (!data?.success) {
        setStatus({
          type: "error",
          message: data?.message || "Failed to schedule unlock",
        });
        return;
      }

      setStatus({ type: "success", message: "✅ Exam unlock scheduled!" });
      setSelectedExam("");
      setUnlockDate("");
      setUnlockTime("");
      setEndTime("");
    } catch (err) {
      console.error("❌ Unlock error:", err);
      setStatus({ type: "error", message: "Failed to schedule unlock" });
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // 🔹 DELETE SCHEDULE
  // =============================
  const deleteSchedule = async (id) => {
    if (!window.confirm("Delete this schedule?")) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/exams/unlock/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (data?.success) {
        setSchedules((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Failed to delete schedule");
    }
  };

  // =============================
  // 🔹 RENDER
  // =============================
  return (
    <div className="unlock-exam-container">
      <h2>Unlock Exam Scheduler</h2>

      <form className="unlock-form" onSubmit={handleUnlock}>
        <div className="form-group">
          <label>Select Exam</label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            required
          >
            <option value="">-- Choose exam --</option>
            {exams.map((exam) => (
              <option key={exam._id} value={exam._id}>
                {exam.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Unlock Date</label>
          <input
            type="date"
            value={unlockDate}
            onChange={(e) => setUnlockDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Unlock Time</label>
          <input
            type="time"
            value={unlockTime}
            onChange={(e) => setUnlockTime(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        {status.message && (
          <p className={`status-msg ${status.type}`}>{status.message}</p>
        )}

        <button type="submit" className="schedule-btn" disabled={loading}>
          {loading ? "Scheduling..." : "Schedule Unlock"}
        </button>
      </form>

      {/* ============================= */}
      {/* 🔹 EXISTING SCHEDULES */}
      {/* ============================= */}
      <h3>Scheduled Unlocks</h3>

      {schedules.length === 0 ? (
        <p>No scheduled unlocks.</p>
      ) : (
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Exam</th>
              <th>Unlock Date</th>
              <th>Unlock Time</th>
              <th>End Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s._id}>
                <td>{s.examTitle}</td>
                <td>{s.unlockDate}</td>
                <td>{s.unlockTime}</td>
                <td>{s.endTime}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deleteSchedule(s._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UnlockExam;
