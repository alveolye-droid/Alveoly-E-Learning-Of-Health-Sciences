import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "./CreateExam.css";
import QuestionBuilder from "./components/QuestionBuilder";
import QuestionList from "./components/QuestionList";
import { AuthContext } from "../../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_APP_API_BASE_URL;

const CreateExam = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  /* ================= STATE ================= */
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState([]);
  const [examId, setExamId] = useState(null);
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(false);

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  const [viewExams, setViewExams] = useState([]);
  const [showView, setShowView] = useState(false);

  const getAuthToken = () =>
    localStorage.getItem("token") || user?.token || null;

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    if (!getAuthToken()) navigate("/login");
  }, [user]);

  /* ================= FETCH COURSES ================= */
  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      try {
        const res = await axios.get(`${API}/api/admin/courses/public`, {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
        // Backend returns { courses: [...] }
        setCourses(Array.isArray(res.data.courses) ? res.data.courses : []);
      } catch (err) {
        console.error(err);
        setCoursesError(err.response?.data?.message || "Failed to load courses");
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchCourses();
  }, []);

  /* ================= SAVE / UPDATE EXAM ================= */
  const saveExam = async () => {
    if (!title || !course || questions.length === 0) {
      return alert("Title, course, and at least one question are required");
    }

    try {
      const formattedQuestions = questions.map((q, i) => {
        if (
          !q.question ||
          !Array.isArray(q.options) ||
          q.options.length < 2 ||
          typeof q.correctAnswer !== "number" ||
          !q.rationale
        ) {
          throw new Error(`Invalid question at index ${i + 1}`);
        }
        return {
          question: q.question.trim(),
          options: q.options.map((o) => o.trim()),
          correctAnswer: q.correctAnswer,
          rationale: q.rationale.trim(),
        };
      });

      setLoading(true);

      const payload = { title, course, duration, questions: formattedQuestions };

      const res = examId
        ? await axios.put(`${API}/api/exams/${examId}`, payload, {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          })
        : await axios.post(`${API}/api/exams`, payload, {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          });

      setExamId(res.data._id);
      setStatus(res.data.status || "draft");
      alert("✅ Exam saved successfully");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Failed to save exam");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VIEW LECTURER EXAMS ================= */
  const fetchLecturerExams = async () => {
    try {
      const res = await axios.get(`${API}/api/exams`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      setViewExams(Array.isArray(res.data) ? res.data : []);
      setShowView(true);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch exams");
    }
  };

  /* ================= EDIT EXAM ================= */
  const editExam = (exam) => {
    setTitle(exam.title || "");
    // Preselect course if exists, fallback to empty string if deleted
    setCourse(exam.course?.id || "");
    setDuration(exam.duration || 30);
    setQuestions(Array.isArray(exam.questions) ? exam.questions : []);
    setExamId(exam._id);
    setStatus(exam.status || "draft");
    setShowView(false);
  };

  /* ================= DELETE EXAM ================= */
  const deleteExam = async (id) => {
    if (!window.confirm("Delete this exam?")) return;
    try {
      await axios.delete(`${API}/api/exams/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      setViewExams((prev) => prev.filter((e) => e._id !== id));

      if (id === examId) {
        setExamId(null);
        setStatus("draft");
        setTitle("");
        setCourse("");
        setDuration(30);
        setQuestions([]);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete exam");
    }
  };

  /* ================= STATUS ACTIONS ================= */
  const sendForApproval = async () => {
    if (!examId) return;
    try {
      await axios.put(`${API}/api/exams/send/${examId}`, {}, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      setStatus("pending");
    } catch (err) {
      console.error(err);
      alert("Failed to send exam for approval");
    }
  };

  const publishExam = async () => {
    if (!examId) return;
    try {
      await axios.put(`${API}/api/exams/publish/${examId}`, {}, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      setStatus("published");
    } catch (err) {
      console.error(err);
      alert("Failed to publish exam");
    }
  };

  const toggleLock = async () => {
    if (!examId) return;
    try {
      const res = await axios.put(`${API}/api/exams/lock/${examId}`, {}, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      setStatus(res.data.status || status);
    } catch (err) {
      console.error(err);
      alert("Failed to toggle lock");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="create-exam">
      <h1>Create Exam</h1>

      <div className="exam-form">
        <input
          placeholder="Exam Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {coursesLoading ? (
          <p>Loading courses...</p>
        ) : coursesError ? (
          <p className="error">{coursesError}</p>
        ) : (
          <select value={course} onChange={(e) => setCourse(e.target.value)}>
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.programName} — {c.className} ({c.category})
              </option>
            ))}
          </select>
        )}

        <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
          {[15, 30, 45, 60, 90, 120, 180].map((t) => (
            <option key={t} value={t}>{t} minutes</option>
          ))}
        </select>
      </div>

      <QuestionBuilder setQuestions={setQuestions} />
      <QuestionList questions={Array.isArray(questions) ? questions : []} setQuestions={setQuestions} />

      <div className="exam-actions">
        <button onClick={saveExam} disabled={loading}>Save Exam</button>
        <button onClick={sendForApproval} disabled={!examId || status !== "draft"}>
          Send for Approval
        </button>
        <button onClick={publishExam} disabled={status !== "approved"}>
          Publish
        </button>
        <button onClick={toggleLock} disabled={!examId}>
          {status === "locked" ? "Unlock" : "Lock"}
        </button>
        <button onClick={fetchLecturerExams}>View Exams</button>
      </div>

      {showView && (
        <div className="view-exams">
          <h2>Saved Exams</h2>
          {viewExams.length === 0 ? (
            <p>No exams found</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {viewExams.map((e) => (
                  <tr key={e._id}>
                    <td>{e.title}</td>
                    <td>
                      {e.course
                        ? `${e.course.programName} (${e.course.className})`
                        : "Course deleted"}
                    </td>
                    <td>{e.status}</td>
                    <td>
                      <button onClick={() => editExam(e)}>Edit</button>
                      <button onClick={() => deleteExam(e._id)}>Delete</button>
                      <button
  disabled={e.status !== "published"}
  onClick={() =>
    navigate(`/lecturer/${user._id}/exams/${e._id}/code-generator`)
  }
>
  Generate Codes
</button>

<button
  disabled={e.status !== "published"}
  onClick={() =>
    navigate(`/lecturer/exams/${e._id}/results`)
  }
>
  View Results
</button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <p className={`status ${status}`}>Status: {status}</p>
    </div>
  );
};

export default CreateExam;
