import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import "./StudentExamStart.css";

const API = import.meta.env.VITE_APP_API_BASE_URL;

const StudentExamStart = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCourse, setSelectedCourse] = useState(""); // for filtering
  const [courses, setCourses] = useState([]); // unique course list

  const getAuthToken = () =>
    localStorage.getItem("token") || user?.token || null;

  // 🔐 Auth guard
  useEffect(() => {
    if (!getAuthToken()) navigate("/login");
  }, [user]);

  // 📥 Fetch all published exams
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get(`${API}/api/exams/student`, {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
        const examsData = res.data || [];
        setExams(examsData);

        // Extract unique courses for filter dropdown
        const uniqueCourses = [
          ...new Map(examsData.map((e) => [e.course?.id, e.course])).values(),
        ].filter(Boolean);
        setCourses(uniqueCourses);
      } catch (err) {
        console.error("❌ Failed to fetch exams:", err);
        setError("Unable to load exams. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  // 🔑 Redirect student to code input page first
  const startExam = (examId) => {
    navigate(`/student/exams/${examId}/code`); // redirect to code input page
  };

  // Filter exams by selected course
  const filteredExams = selectedCourse
    ? exams.filter((e) => e.course?.id === selectedCourse)
    : exams;

  return (
    <div className="student-exams">
      <h1>Available Exams</h1>
      <p>Select an exam to begin</p>

      {loading && <p>Loading exams...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && exams.length === 0 && <p>No exams available at the moment.</p>}

      {/* Course filter */}
      {courses.length > 0 && (
        <div className="course-filter">
          <label>Filter by course: </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.programName} — {c.className} ({c.category})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="exam-list">
        {filteredExams.map((exam) => (
          <div className="exam-card" key={exam._id}>
            <h3>{exam.title}</h3>
            <p><strong>Program:</strong> {exam.course?.programName || "N/A"}</p>
            <p><strong>Class:</strong> {exam.course?.className || "N/A"}</p>
            <p><strong>Category:</strong> {exam.course?.category || "N/A"}</p>
            <p><strong>Duration:</strong> {exam.duration} minutes</p>
            <button onClick={() => startExam(exam._id)}>Start Exam</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentExamStart;
