import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import "./StudentTakeExam.css";

const API = import.meta.env.VITE_APP_API_BASE_URL;

const StudentTakeExam = () => {
  const { examId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // result states
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [viewDetails, setViewDetails] = useState(false);

  const getAuthToken = () =>
    localStorage.getItem("token") || user?.token;

  /* ================= FETCH EXAM ================= */
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.get(`${API}/api/exams/student/${examId}`, {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
        setExam(res.data);
        setTimeLeft(res.data.duration * 60);
      } catch (err) {
        console.error("❌ Failed to load exam:", err);
        setError("Failed to load exam");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!timeLeft || showResult) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, showResult]);

  /* ================= ANSWER HANDLER ================= */
  const selectAnswer = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (auto = false) => {
    try {
      if (!auto && !window.confirm("Are you sure you want to submit this exam?")) return;

      const res = await axios.post(`${API}/api/exams/student/submit/${examId}`, { answers }, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });

      setResult(res.data);
      setShowResult(true);
    } catch (err) {
      console.error("❌ Submit error:", err);
      alert(err.response?.data?.message || "Failed to submit exam");
    }
  };

  if (loading) return <p>Loading exam...</p>;
  if (error) return <p>{error}</p>;

  const question = exam.questions[current];

  return (
    <div className="student-exam-container">
      <div className="exam-card">
        <header className="exam-header">
          <h2>{exam.title}</h2>
          <div className="timer">
            ⏱ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </div>
        </header>

        <div className="question-card">
          <h3>Question {current + 1} of {exam.questions.length}</h3>
          <p>{question.question}</p>
          {question.options.map((opt, i) => (
            <label key={i} className="option">
              <input
                type="radio"
                name={`q-${question.id}`}
                checked={answers[question.id] === opt}
                onChange={() => selectAnswer(question.id, opt)}
              />
              {opt}
            </label>
          ))}
        </div>

        <div className="exam-navigation">
          <button disabled={current === 0} onClick={() => setCurrent(current - 1)}>⬅ Previous</button>
          {current < exam.questions.length - 1 ? (
            <button onClick={() => setCurrent(current + 1)}>Next ➡</button>
          ) : (
            <button className="submit-btn" onClick={() => handleSubmit(false)}>✅ Submit Exam</button>
          )}
        </div>
      </div>

      {/* ================= RESULT MODAL ================= */}
      {showResult && result && (
        <div className="result-modal-overlay">
          <div className="result-modal">
            <h2>Exam Result</h2>
            <p>Score: <strong>{result.score} / {result.totalQuestions}</strong></p>
            <p>Percentage: <strong>{result.percentage?.toFixed(1)}%</strong></p>
            <p>Grade: <strong>{result.grade}</strong></p>

            <div className="modal-actions">
              <button onClick={() => setViewDetails(true)}>View Details</button>
              <button className="close-btn-exams" onClick={() => navigate("/student/dashboard")}>X</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ANSWER REVIEW MODAL ================= */}
      {viewDetails && result && (
        <div className="result-modal-overlay">
          <div className="result-modal">
            <h3>Answer Review</h3>
            {result.answers.map((a, i) => (
              <div key={i} className={`answer-review ${a.isCorrect ? "correct" : "wrong"}`}>
                <p><strong>Q:</strong> {a.question}</p>
                <p>Your Answer: {a.selectedAnswer}</p>
                <p>Correct Answer: {a.correctAnswer}</p>
                {!a.isCorrect && <p className="rationale">Explanation: {a.rationale}</p>}
              </div>
            ))}
            <button className="close-btn-exams" onClick={() => setViewDetails(false)}>X</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTakeExam;
