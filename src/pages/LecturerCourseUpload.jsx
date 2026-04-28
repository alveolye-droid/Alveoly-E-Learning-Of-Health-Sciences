import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  FaFileUpload,
  FaVideo,
  FaImage,
  FaFileAudio,
  FaLock,
  FaTimes,
} from "react-icons/fa";
import "./LecturerCourseUpload.css";

const LecturerCourseUpload = ({ existingCourse }) => {
  const { user, SERVER_URL } = useContext(AuthContext);

  /* ================= BASIC STATE ================= */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [contentList, setContentList] = useState([]);

  /* ================= ADMIN COURSE STATE ================= */
  const [adminCourses, setAdminCourses] = useState([]);
  const [selectedAdminCourse, setSelectedAdminCourse] = useState("");

  /* ================= FETCH ADMIN COURSES ================= */
  useEffect(() => {
  if (!user?._id) return;

  const fetchAdminCourses = async () => {
    try {
      const res = await axios.get(
        `${SERVER_URL}/api/admin/courses/public`
      );

      setAdminCourses(Array.isArray(res.data)
        ? res.data
        : res.data.courses || []);
    } catch (err) {
      console.error("❌ Failed to load admin courses:", err);
      toast.error("Failed to load courses");
    }
  };

  fetchAdminCourses();
}, [user, SERVER_URL]);

  /* ================= LOAD EXISTING COURSE ================= */
  useEffect(() => {
    if (!existingCourse) return;

    setTitle(existingCourse.title || "");
    setDescription(existingCourse.description || "");
    setCategory(existingCourse.category || "");
    setPrice(existingCourse.price || 0);
    setIsPaid(existingCourse.isPaid || false);
    setSelectedAdminCourse(existingCourse.adminCourse || "");

    setContentList(
      existingCourse.contents?.map((c) => ({
        ...c,
        id: Date.now() + Math.random(),
        file: null,
      })) || []
    );
  }, [existingCourse]);

  /* ================= CONTENT HANDLERS ================= */
  const handleAddContent = (type) => {
    setContentList((prev) => [
      ...prev,
      { id: Date.now(), type, title: "", data: "", file: null, isPaid },
    ]);
  };

  const handleFileChange = (e, contentId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setContentList((prev) =>
      prev.map((c) => (c.id === contentId ? { ...c, file } : c))
    );
  };

  const handleTextChange = (e, contentId) => {
    const value = e.target.value;
    setContentList((prev) =>
      prev.map((c) => (c.id === contentId ? { ...c, data: value } : c))
    );
  };

  const handleTitleChange = (e, contentId) => {
    const value = e.target.value;
    setContentList((prev) =>
      prev.map((c) => (c.id === contentId ? { ...c, title: value } : c))
    );
  };

  const handleRemoveContent = (contentId) => {
    setContentList((prev) => prev.filter((c) => c.id !== contentId));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!selectedAdminCourse) {
      return toast.error("Please select a course you are uploading for.");
    }

    if (!title || !description || !category) {
      return toast.error("Please fill all required fields.");
    }

    try {
      const token = user?.token || localStorage.getItem("authToken");

      const processedContents = await Promise.all(
        contentList.map(async (c) => {
          if (c.type === "text") {
            return {
              type: "text",
              title: c.title || "",
              data: c.data,
              isPaid,
            };
          }

          if (c.file) {
            const formData = new FormData();
            formData.append("file", c.file);

            const res = await axios.post(
              `${SERVER_URL}/api/uploads`,
              formData,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "multipart/form-data",
                },
              }
            );

            return {
              type: c.type,
              title: c.title || "",
              data: res.data.url,
              isPaid,
            };
          }

          return null;
        })
      );

      const payload = {
        title,
        description,
        category,
        price,
        isPaid,
        adminCourse: selectedAdminCourse,
        contents: processedContents.filter(Boolean),
      };

      if (existingCourse?._id) {
        await axios.put(
          `${SERVER_URL}/api/courses/${existingCourse._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Course updated successfully!");
      } else {
        await axios.post(`${SERVER_URL}/api/courses`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Course uploaded successfully!");

        setTitle("");
        setDescription("");
        setCategory("");
        setPrice(0);
        setIsPaid(false);
        setSelectedAdminCourse("");
        setContentList([]);
      }
    } catch (err) {
      console.error("❌ Course upload error:", err);
      toast.error(err.response?.data?.message || "Course operation failed!");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="fb-post-container">
      <div className="fb-card">
        <div className="fb-header">
          {existingCourse ? "Edit Course Content" : "Create Course Content"}
        </div>

        <select
          className="fb-input"
          value={selectedAdminCourse}
          onChange={(e) => setSelectedAdminCourse(e.target.value)}
        >
          <option value="">Select Course (Program / Class)</option>
          {adminCourses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.programName} - {course.className} ({course.category})
            </option>
          ))}
        </select>

        <input
          className="fb-input"
          type="text"
          placeholder="Lecture / Topic Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="fb-textarea"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          className="fb-input"
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <div className="fb-paid-row">
          <label>
            <input
              type="checkbox"
              checked={isPaid}
              onChange={() => setIsPaid((prev) => !prev)}
            />{" "}
            Paid Content
          </label>

          {isPaid && (
            <input
              className="fb-price"
              type="number"
              min={0}
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          )}
        </div>

        <div className="fb-actions">
          <button
            onClick={() => handleAddContent("text")}
            className="fb-action-btn"
          >
            <FaFileUpload /> Text
          </button>
          <button
            onClick={() => handleAddContent("video")}
            className="fb-action-btn"
          >
            <FaVideo /> Video
          </button>
          <button
            onClick={() => handleAddContent("audio")}
            className="fb-action-btn"
          >
            <FaFileAudio /> Audio
          </button>
          <button
            onClick={() => handleAddContent("image")}
            className="fb-action-btn"
          >
            <FaImage /> Image
          </button>
        </div>

        {contentList.map((c) => (
          <div key={c.id} className="fb-content-block">
            <div className="fb-block-header">
              <input
                className="fb-input"
                type="text"
                placeholder="Optional title"
                value={c.title}
                onChange={(e) => handleTitleChange(e, c.id)}
              />
              <button
                className="fb-remove"
                onClick={() => handleRemoveContent(c.id)}
              >
                <FaTimes />
              </button>
            </div>

            {c.type === "text" ? (
              <textarea
                className="fb-textarea"
                placeholder="Write something..."
                value={c.data}
                onChange={(e) => handleTextChange(e, c.id)}
              />
            ) : (
              <div className="fb-upload-box">
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, c.id)}
                />
                {isPaid && (
                  <span className="fb-paid-overlay">
                    <FaLock /> Paid
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        <button className="fb-submit" onClick={handleSubmit}>
          {existingCourse ? "Update Course" : "Post Course"}
        </button>
      </div>
    </div>
  );
};

export default LecturerCourseUpload;
