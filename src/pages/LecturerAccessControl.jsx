import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./LecturerAccessControl.css"

const LecturerAccessControl = () => {
  const { user, SERVER_URL } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [duration, setDuration] = useState(7);
  const [unit, setUnit] = useState("days");

  useEffect(() => {
    axios
      .get(`${SERVER_URL}/api/courses/lecturer/private`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then(res => setCourses(res.data.courses));
  }, []);

  const loadStudents = async id => {
    const res = await axios.get(
      `${SERVER_URL}/api/access/lecturer/students/${id}`,
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    setStudents(res.data.students);
  };

  const grant = async () => {
    await axios.post(
      `${SERVER_URL}/api/access/grant`,
      { courseId, studentId, duration, unit },
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    alert("Access granted");
  };

  return (
    <div className="lecturer-access-control">
    <div>
      <h2>🔑 Student Access Control</h2>

      <select onChange={e => {
        setCourseId(e.target.value);
        loadStudents(e.target.value);
      }}>
        <option>Select course</option>
        {courses.map(c => (
          <option key={c._id} value={c._id}>{c.title}</option>
        ))}
      </select>

      <select onChange={e => setStudentId(e.target.value)}>
        <option>Select student</option>
        {students.map(s => (
          <option key={s._id} value={s._id}>{s.name}</option>
        ))}
      </select>

      <input
        type="number"
        value={duration}
        onChange={e => setDuration(e.target.value)}
      />

      <select value={unit} onChange={e => setUnit(e.target.value)}>
        <option value="minutes">Minutes</option>
        <option value="hours">Hours</option>
        <option value="days">Days</option>
        <option value="weeks">Weeks</option>
        <option value="months">Months</option>
        <option value="years">Years</option>
      </select>

      <button onClick={grant}>Grant Access</button>
    </div>
    </div>
  );
};

export default LecturerAccessControl;
