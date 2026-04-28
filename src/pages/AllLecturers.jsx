import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axiosInstance";
import "./AllLecturers.css";

const AllLecturers = () => {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newCourse, setNewCourse] = useState("");
  const [adminCourses, setAdminCourses] = useState([]);

  useEffect(() => {
    fetchLecturersAndCourses();
  }, []);

  const fetchLecturersAndCourses = async () => {
    setLoading(true);
    console.log("🔎 [fetchLecturersAndCourses] Fetching lecturers...");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("⚠️ No token found in localStorage");
      } else {
        console.log("🔐 Token found, sending request with Authorization header");
      }

      // Ensure admin token is used (dev-mode helper)
      const { data } = await axiosInstance.get("/api/auth/lecturers?as=admin");
      console.log("🟢 Data fetched:", data);

      setLecturers(data.lecturers || []);
      setAdminCourses(data.adminCourses || []);
    } catch (err) {
      console.error("🔴 Error fetching lecturers & courses:", err);
      const status = err.response?.status;
      let message = "Failed to fetch lecturers.";
      if (status === 403) message = "Access denied. Admins only.";
      if (status === 401) message = "Unauthorized. Please login.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (id) => {
    if (!newCourse.trim()) return toast.warning("Please select a course");

    try {
      await axiosInstance.put(`/api/auth/lecturers/${id}`, { courseId: newCourse });
      toast.success("Course updated successfully");
      setEditingId(null);
      setNewCourse("");
      fetchLecturersAndCourses();
    } catch (err) {
      console.error("🔴 Failed to update lecturer:", err);
      const status = err.response?.status;
      let message = err.response?.data?.message || "Failed to update lecturer";
      if (status === 403) message = "Access denied. Admins only.";
      toast.error(message);
    }
  };

  const handleDeleteLecturer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lecturer?")) return;

    try {
      await axiosInstance.delete(`/api/auth/lecturers/${id}`);
      setLecturers((prev) => prev.filter((l) => l._id !== id));
      toast.success("Lecturer deleted successfully");
    } catch (err) {
      console.error("🔴 Failed to delete lecturer:", err);
      const status = err.response?.status;
      let message = err.response?.data?.message || "Failed to delete lecturer";
      if (status === 403) message = "Access denied. Admins only.";
      toast.error(message);
    }
  };

  if (loading) return <p className="loading-text">Loading lecturers...</p>;

  return (
    <div className="all-lecturers-container">
      <h2 className="page-title">All Lecturers</h2>
      <p className="page-subtitle">
        Manage all lecturers and their assigned courses here.
      </p>

      {lecturers.length === 0 ? (
        <p className="no-data-text">No lecturers found.</p>
      ) : (
        <div className="table-scroll-wrapper">
          <table className="all-lecturers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Date Joined</th>
                <th className="center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lecturers.map((lecturer) => (
                <tr key={lecturer._id}>
                  <td data-label="Name">{lecturer.name}</td>
                  <td data-label="Email">{lecturer.email}</td>
                  <td data-label="Course">
                    {editingId === lecturer._id ? (
                      <select
                        className="edit-input"
                        value={newCourse}
                        onChange={(e) => setNewCourse(e.target.value)}
                      >
                        <option value="">— Select a course —</option>
                        {adminCourses.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.programName} - {c.className} ({c.category})
                          </option>
                        ))}
                      </select>
                    ) : lecturer.courseText ? (
                      lecturer.courseText
                    ) : (
                      "—"
                    )}
                  </td>
                  <td data-label="Date Joined">
                    {new Date(lecturer.createdAt).toLocaleDateString()}
                  </td>
                  <td data-label="Actions" className="center action-buttons">
                    {editingId === lecturer._id ? (
                      <button
                        onClick={() => handleUpdateCourse(lecturer._id)}
                        className="save-btn"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(lecturer._id);
                          setNewCourse(lecturer.courses?.[0]?._id || "");
                        }}
                        className="action-btn edit"
                        title="Edit course"
                      >
                        <FaEdit />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteLecturer(lecturer._id)}
                      className="action-btn delete"
                      title="Delete lecturer"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllLecturers;
