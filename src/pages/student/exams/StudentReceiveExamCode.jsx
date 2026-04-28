import React, { useState, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import "./StudentReceiveExamCode.css";

const API = import.meta.env.VITE_APP_API_BASE_URL;

const StudentReceiveExamCode = () => {
  const { examId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token") || user?.token;

  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  const submitCode = async () => {
    setError("");

    if (!isValidObjectId(examId)) {
      setError("Invalid exam ID");
      return;
    }

    if (!code.trim()) {
      setError("Please enter the exam code");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API}/api/exam-codes/verify/${examId}`,
        { code },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ success
      navigate(`/student/exams/${examId}/take`);
    } catch (err) {
      console.error("❌ Verify error:", err);
      setError(err.response?.data?.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="exam-code-container">
      <div className="exam-code-box">
        <h2>Enter Exam Code</h2>
        <p>Please enter the exam code provided by your lecturer</p>

        {error && <p className="error">{error}</p>}

        <input
          type="text"
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
        />

        <button onClick={submitCode} disabled={loading}>
          {loading ? "Verifying..." : "Start Exam"}
        </button>
      </div>
    </div>
  );
};

export default StudentReceiveExamCode;
