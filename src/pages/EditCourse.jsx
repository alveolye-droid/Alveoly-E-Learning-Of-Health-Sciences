import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./EditCourse.css";

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { SERVER_URL, user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);

  // Fetch existing course
  const fetchCourse = async () => {
    try {
      const token = user?.token || localStorage.getItem("authToken");
      const res = await axios.get(
        `${SERVER_URL}/api/admin/courses/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourse(res.data.course);
    } catch (err) {
      console.error(err);
      alert("Failed to load course.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  const updateField = (field, value) => {
    setCourse(prev => ({ ...prev, [field]: value }));
  };

  const updateContent = (idx, field, value) => {
    const updated = [...course.contents];
    updated[idx][field] = value;
    setCourse(prev => ({ ...prev, contents: updated }));
  };

  const addContent = () => {
    const newContent = { title: "", type: "text", data: "" };
    setCourse(prev => ({ ...prev, contents: [...prev.contents, newContent] }));
  };

  const removeContent = (idx) => {
    const updated = course.contents.filter((_, i) => i !== idx);
    setCourse(prev => ({ ...prev, contents: updated }));
  };

  const handleFileUpload = async (idx, file) => {
    try {
      const token = user?.token || localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        `${SERVER_URL}/api/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      updateContent(idx, "data", res.data.filePath);
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = user?.token || localStorage.getItem("authToken");

      await axios.put(
        `${SERVER_URL}/api/courses/${courseId}`,
        course,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Course updated successfully!");
      navigate("/lecturer-dashboard/courses");

    } catch (err) {
      console.error(err);
      alert("Update failed.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <div className="edit-course-container">
      <h1>Edit Course</h1>

      <form onSubmit={handleSubmit} className="edit-course-form">

        {/* Title */}
        <label>Course Title</label>
        <input
          type="text"
          value={course.title}
          onChange={e => updateField("title", e.target.value)}
          required
        />

        {/* Description */}
        <label>Description</label>
        <textarea
          value={course.description}
          onChange={e => updateField("description", e.target.value)}
          required
        />

        {/* Category */}
        <label>Category</label>
        <input
          type="text"
          value={course.category}
          onChange={e => updateField("category", e.target.value)}
        />

        {/* Paid / Free */}
        <label>
          <input
            type="checkbox"
            checked={course.isPaid}
            onChange={e => updateField("isPaid", e.target.checked)}
          />
          Paid Course
        </label>

        {course.isPaid && (
          <>
            <label>Price ($)</label>
            <input
              type="number"
              value={course.price}
              onChange={e => updateField("price", e.target.value)}
              min="1"
            />
          </>
        )}

        {/* Course Contents */}
        <h3>Course Contents</h3>

        {course.contents.map((content, idx) => (
          <div key={idx} className="content-block">
            <label>Content Title</label>
            <input
              type="text"
              value={content.title}
              onChange={e => updateContent(idx, "title", e.target.value)}
            />

            {/* Content Type */}
            <label>Type</label>
            <select
              value={content.type}
              onChange={e => updateContent(idx, "type", e.target.value)}
            >
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
            </select>

            {/* Content Data */}
            {content.type === "text" ? (
              <textarea
                value={content.data}
                onChange={e => updateContent(idx, "data", e.target.value)}
              />
            ) : (
              <>
                <input
                  type="file"
                  accept={
                    content.type === "image"
                      ? "image/*"
                      : content.type === "video"
                      ? "video/*"
                      : "audio/*"
                  }
                  onChange={e => handleFileUpload(idx, e.target.files[0])}
                />
                {content.data && (
                  <p>Uploaded: {content.data}</p>
                )}
              </>
            )}

            <button
              type="button"
              className="remove-btn"
              onClick={() => removeContent(idx)}
            >
              Remove Content
            </button>
          </div>
        ))}

        <button type="button" onClick={addContent}>
          + Add More Content
        </button>

        <br /><br />

        <button type="submit" className="save-btn">
          Save Changes
        </button>

      </form>
    </div>
  );
};

export default EditCourse;
