import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import emailjs from "@emailjs/browser"; // ✅ Install: npm i @emailjs/browser
import "./ExamCodeGenerator.css";

const API = import.meta.env.VITE_APP_API_BASE_URL;

const ExamCodeGenerator = () => {
  const { examId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getAuthToken = () => localStorage.getItem("token");

  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  // ----------------- FETCH STUDENTS -----------------
  const fetchStudents = async () => {
    if (!examId || !isValidObjectId(examId)) {
      setError("Invalid exam ID");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API}/api/exam-codes/students/${examId}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      setStudents(res.data);
      setError("");
    } catch (err) {
      console.error("Fetch students error:", err);
      setError(err.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  // ----------------- GENERATE CODE -----------------
  const generateCode = async (studentId) => {
    if (!examId || !isValidObjectId(examId)) {
      alert("Invalid exam ID");
      return;
    }

    try {
      const res = await axios.post(
        `${API}/api/exam-codes/generate/${examId}/${studentId}`,
        {},
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      );
      alert(`✅ Code generated: ${res.data.code}`);
      fetchStudents();
    } catch (err) {
      console.error("Generate code error:", err);
      alert(err.response?.data?.message || "Failed to generate code");
    }
  };

  // ----------------- SEND CODE VIA EMAILJS -----------------
  const sendCode = async (student) => {
    if (!student.code) {
      alert("Please generate a code first");
      return;
    }

    try {
      const templateParams = {
        to_name: student.name,
        to_email: student.email,
        exam_code: student.code,
        exam_title: student.title || "Your Exam",
      };

      // ✅ Replace with your EmailJS service ID, template ID, and public key
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CODE,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      alert(`✅ Exam code sent to ${student.email}`);
    } catch (err) {
      console.error("EmailJS send error:", err);
      alert("Failed to send email. Check your EmailJS configuration.");
    }
  };

  // ----------------- INITIAL FETCH -----------------
  useEffect(() => {
    fetchStudents();
  }, [examId]);

  if (loading) return <p>Loading students...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (students.length === 0) return <p>No students assigned to this exam.</p>;

  return (
    <div className="exam-code-generator">
      <h1>Exam Code Generator</h1>
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Email</th>
            <th>Code</th>
            <th>Used</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{s.code || "-"}</td>
              <td>{s.used ? "Yes" : "No"}</td>
              <td>
                <button onClick={() => generateCode(s._id)}>Generate</button>
                {s.code && (
                  <button onClick={() => sendCode({ ...s, title: s.examTitle })}>
                    Send Email
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExamCodeGenerator;
