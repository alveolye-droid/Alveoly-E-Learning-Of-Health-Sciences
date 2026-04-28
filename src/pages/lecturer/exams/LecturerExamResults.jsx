import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import "./LecturerExamResults.css";

const API = import.meta.env.VITE_APP_API_BASE_URL;

const LecturerExamResults = () => {
  const { examId } = useParams();
  const { user } = useContext(AuthContext);

  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getAuthToken = () => localStorage.getItem("token") || user?.token;

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(`${API}/api/exams/lecturer/results/${examId}`, {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
        setResults(res.data);
      } catch (err) {
        console.error("❌ Failed to load results:", err);
        setError("Failed to load exam results");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [examId]);

  if (loading) return <p>Loading results...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="lecturer-results-container">
      <h2>Exam Results</h2>

      {results.length === 0 ? (
        <p>No students have submitted this exam yet.</p>
      ) : (
        <table className="results-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Grade</th>
              <th>Submitted At</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {results.map((r) => (
              <tr key={r._id}>
                <td>{r.student?.name || "Unknown"}</td>
                <td>{r.student?.email}</td>
                <td>{r.score} / {r.totalQuestions}</td>
                <td>{r.percentage?.toFixed(1)}%</td>
                <td>{r.grade}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => setSelectedResult(r)} className="view-btn">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedResult && (
        <div className="result-modal-overlay">
          <div className="result-modal">
            <h3>{selectedResult.student?.name}'s Result</h3>
            <p>Score: <strong>{selectedResult.score} / {selectedResult.totalQuestions}</strong></p>
            <p>Percentage: <strong>{selectedResult.percentage?.toFixed(1)}%</strong></p>
            <p>Grade: <strong>{selectedResult.grade}</strong></p>

            <div className="answers-review">
              {selectedResult.answers.map((a, i) => (
                <div key={i} className={`answer-box ${a.isCorrect ? "correct" : "wrong"}`}>
                  <p><strong>Q:</strong> {a.question}</p>
                  <p>Student Answer: <span>{a.selectedAnswer}</span></p>
                  <p>Correct Answer: <span>{a.correctAnswer}</span></p>
                  {!a.isCorrect && <p className="rationale">Explanation: {a.rationale}</p>}
                </div>
              ))}
            </div>

            <button className="close-btn-results" onClick={() => setSelectedResult(null)}>X</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerExamResults;
