import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminApproveExams.css";

const API = import.meta.env.VITE_APP_API_BASE_URL;

const AdminApproveExams = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  /* ================= FETCH PENDING EXAMS ================= */
  const fetchPendingExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/api/exams/admin/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExams(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch pending exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingExams();
  }, []);

  /* ================= VIEW EXAM ================= */
  const viewExam = async (id) => {
    try {
      const res = await axios.get(`${API}/api/exams/admin/view/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedExam(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load exam details");
    }
  };

  /* ================= APPROVE / REJECT ================= */
  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this exam?`)) return;

    try {
      await axios.put(
        `${API}/api/exams/admin/approve/${id}`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`✅ Exam ${action} successfully`);
      setSelectedExam(null);
      fetchPendingExams();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className="admin-exams-page">
      <h2>Pending Exams</h2>

      {loading && <p>Loading pending exams...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && exams.length === 0 && <p>No pending exams.</p>}

      {exams.length > 0 && (
        <table className="exams-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Lecturer</th>
              <th>Course</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam._id}>
                <td>{exam.title}</td>
                <td>{exam.createdBy?.name}</td>
                <td>{exam.course?.programName}</td>
                <td>
                  <span className={`status ${exam.status}`}>
                    {exam.status}
                  </span>
                </td>
                <td>
                  <button onClick={() => viewExam(exam._id)}>
                    View
                  </button>
                  <button
                    className="approve-btn"
                    onClick={() => handleAction(exam._id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleAction(exam._id, "rejected")}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ================= VIEW EXAM MODAL ================= */}
      {selectedExam && (
        <div className="result-modal-overlay">
          <div className="result-modal admin-view-modal">
            <h3>{selectedExam.title}</h3>
            <p>
              <strong>Lecturer:</strong> {selectedExam.createdBy?.name}
            </p>
            <p>
              <strong>Duration:</strong> {selectedExam.duration} minutes
            </p>

            <hr />

            {selectedExam.questions.map((q, i) => (
              <div key={i} className="admin-question-box">
                <p><strong>Q{i + 1}:</strong> {q.question}</p>
                <ul>
                  {q.options.map((opt, idx) => (
                    <li
                      key={idx}
                      className={idx === q.correctAnswer ? "correct-option" : ""}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
                <p className="rationale">
                  <strong>Rationale:</strong> {q.rationale}
                </p>
              </div>
            ))}

            <div className="modal-actions">
              <button
                className="approve-btn"
                onClick={() => handleAction(selectedExam._id, "approved")}
              >
                Approve
              </button>
              <button
                className="reject-btn"
                onClick={() => handleAction(selectedExam._id, "rejected")}
              >
                Reject
              </button>
              <button className="close-btn-view" onClick={() => setSelectedExam(null)}>
                X
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApproveExams;
