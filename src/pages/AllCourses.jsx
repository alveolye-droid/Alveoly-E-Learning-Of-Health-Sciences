import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance"; // ✅ Use centralized axios
import "./AllCourses.css";
import { FaEdit, FaTrash } from "react-icons/fa";

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    programName: "",
    className: "",
    lectureHours: "",
    category: "",
    description: "",
  });

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axiosInstance.get("/api/admin/courses");
      setCourses(res.data.courses || []);
    } catch (error) {
      console.error("❌ Error fetching courses:", error);
      setMessage(
        "⚠️ Failed to load courses. Make sure you are logged in as an admin."
      );
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await axiosInstance.delete(`/api/admin/courses/${id}`);
      setCourses((prev) => prev.filter((c) => c._id !== id));
      setMessage("✅ Course deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting course:", error);
      setMessage("❌ Failed to delete course. Try again.");
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      programName: course.programName,
      className: course.className,
      lectureHours: course.lectureHours,
      category: course.category,
      description: course.description,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;

    try {
      const res = await axiosInstance.put(
        `/api/admin/courses/${editingCourse._id}`,
        formData
      );
      setCourses((prev) =>
        prev.map((c) =>
          c._id === editingCourse._id ? { ...c, ...res.data.course } : c
        )
      );
      setEditingCourse(null);
      setMessage("✅ Course updated successfully!");
    } catch (error) {
      console.error("❌ Error updating course:", error);
      setMessage("❌ Failed to update course. Try again.");
    }
  };

  return (
    <div className="all-courses-container">
      {/* Header */}
      <div className="all-courses-header">
        <h2 className="page-title">All Created Courses</h2>
        <p className="page-subtitle">
          Manage all courses created by the admin. You can view, edit, or delete
          them below.
        </p>
      </div>

      {message && <div className="feedback-message">{message}</div>}

      <div className="table-scroll-wrapper">
        {loading ? (
          <p className="loading-text">Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="no-data">No courses found.</p>
        ) : (
          <table className="courses-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Program Name</th>
                <th>Class Name</th>
                <th>Lecture Hours</th>
                <th>Category / Subject</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, index) => (
                <tr key={course._id}>
                  <td>{index + 1}</td>
                  <td>{course.programName}</td>
                  <td>{course.className}</td>
                  <td>{course.lectureHours}</td>
                  <td>{course.category}</td>
                  <td>{course.description || "—"}</td>
                  <td className="actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(course)}
                      title="Edit Course"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(course._id)}
                      title="Delete Course"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editingCourse && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Course</h3>
            <form onSubmit={handleUpdate} className="edit-form">
              <input
                type="text"
                name="programName"
                value={formData.programName}
                onChange={handleChange}
                placeholder="Program Name"
                required
              />
              <input
                type="text"
                name="className"
                value={formData.className}
                onChange={handleChange}
                placeholder="Class Name"
                required
              />
              <input
                type="number"
                name="lectureHours"
                value={formData.lectureHours}
                onChange={handleChange}
                placeholder="Lecture Hours"
                required
              />
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Category"
                required
              />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Description"
              />
              <div className="modal-buttons">
                <button type="submit" className="save-btn">
                  Save
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditingCourse(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCourses;
