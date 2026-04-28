import React, { useEffect, useState } from "react";
import axios from "axios";
import "./LecturerStudents.css";

const LecturerStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const SERVER_URL = process.env.VITE_SERVER_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${SERVER_URL}/api/auth/lecturer/students`, { headers });
        setStudents(data.students);
      } catch (err) {
        console.error("❌ Failed to fetch students:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="lecturer-students-container">
      <h2>My Students</h2>
      {loading ? (
        <p>Loading students...</p>
      ) : students.length === 0 ? (
        <p>No students found for your courses.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Courses</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>
                  {student.courses?.map((c) => c.name || "—").join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LecturerStudents;
