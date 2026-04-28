import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance"; // ✅ Use centralized axios with token
import "./CreateCourse.css";

const CreateCourse = () => {
  const [formData, setFormData] = useState({
    programName: "",
    className: "",
    lectureHours: "",
    category: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit course creation form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("❌ You must be logged in as an admin to create a course.");
        setLoading(false);
        return;
      }

      // POST request using axiosInstance (token auto-attached)
      const res = await axiosInstance.post("/api/admin/courses", formData);

      setMessage(res.data.message || "✅ Course created successfully!");

      // Reset form
      setFormData({
        programName: "",
        className: "",
        lectureHours: "",
        category: "",
        description: "",
      });
    } catch (error) {
      console.error("❌ Error creating course:", error);
      const errMsg =
        error.response?.data?.message ||
        "Failed to create course. Please try again.";
      setMessage(`❌ ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-course-page">
      {/* Header */}
      <div className="create-course-header">
        <h2 className="page-title">Create a New Course</h2>
        <p className="page-subtitle">
          Add new courses to the university catalog. Lecturers and students can
          select from these courses.
        </p>
      </div>

      {/* Form */}
      <div className="create-course-form-wrapper">
        <form onSubmit={handleSubmit} className="create-course-form">
          <div className="form-group">
            <label>Program Name *</label>
            <input
              type="text"
              name="programName"
              value={formData.programName}
              onChange={handleChange}
              required
              placeholder="e.g. Computer Science"
            />
          </div>

          <div className="form-group">
            <label>Class Name *</label>
            <input
              type="text"
              name="className"
              value={formData.className}
              onChange={handleChange}
              required
              placeholder="e.g. Level 200"
            />
          </div>

          <div className="form-group">
            <label>Lecture Hours *</label>
            <input
              type="number"
              name="lectureHours"
              value={formData.lectureHours}
              onChange={handleChange}
              required
              min="1"
              placeholder="e.g. 3"
            />
          </div>

          <div className="form-group">
            <label>Course Category / Subject *</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              placeholder="e.g. Data Structures, Business Law"
            />
          </div>

          <div className="form-group">
            <label>Course Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Provide a short course overview..."
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Course"}
          </button>

          {message && <p className="feedback-message">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
