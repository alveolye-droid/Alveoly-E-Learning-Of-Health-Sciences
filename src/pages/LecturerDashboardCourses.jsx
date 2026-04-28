import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import "./LecturerDashboardCourses.css";

const LecturerDashboardCourses = () => {
  const { user, SERVER_URL } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const token = user?.token || localStorage.getItem("authToken");

      const res = await axios.get(
        `${SERVER_URL}/api/courses/lecturer/private`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCourses(res.data.courses || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      const token = user?.token || localStorage.getItem("authToken");

      await axios.delete(`${SERVER_URL}/api/courses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCourses((prev) => prev.filter((c) => c._id !== id));
      alert("Course deleted!");
    } catch (err) {
      console.error(err);
      alert("Delete failed.");
    }
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">📚 My Uploaded Courses</h1>

      {courses.length === 0 ? (
        <p className="empty-text">No uploaded courses found.</p>
      ) : (
        <div className="course-feed">
          {courses.map((course) => (
            <div key={course._id} className="fb-post-card">
              <div className="post-header-row">
                <div className="text-group">
                  <h2 className="post-title">{course.title}</h2>
                  <p className="post-desc">{course.description}</p>
                  <small className="post-category">{course.category}</small>
                </div>

                <div className="post-actions">
                  {/* 🚀 Updated lecturer edit route */}
                  <button
                    className="edit-btn"
                    onClick={() =>
                      navigate(`/lecturer-dashboard/edit-course/${course._id}`)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(course._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="post-media-section">
                {course.contents?.map((c, idx) => {
                  const isLocked =
                    c.isPaid && !course.students?.includes(user?._id);

                  return (
                    <div key={idx} className="media-item">
                      <h4 className="media-title">{c.title}</h4>

                      {c.type === "text" && (
                        <div className="media-text">
                          {c.data
                            ?.split(/\n\s*\n/)
                            .map((para, i) => (
                              <p key={i}>{para}</p>
                            ))}
                        </div>
                      )}

                      {c.type === "image" && (
                        <img
                          src={c.data}
                          alt={c.title}
                          className={
                            isLocked ? "blurred" : "media-img"
                          }
                        />
                      )}

                      {c.type === "video" && (
                        <video
                          src={c.data}
                          controls={!isLocked}
                          className={
                            isLocked ? "blurred" : "media-video"
                          }
                          controlsList={
                            isLocked ? "nodownload" : undefined
                          }
                        />
                      )}

                      {c.type === "audio" && (
                        <audio
                          src={c.data}
                          controls={!isLocked}
                          className={
                            isLocked ? "blurred" : "media-audio"
                          }
                        />
                      )}

                      {isLocked && (
                        <div className="locked-overlay">
                          <FaLock className="locked-icon" />
                          <span>Paid Content</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="price-label">
                {course.isPaid
                  ? `Paid • ₵${course.price}`
                  : "Free Course"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LecturerDashboardCourses;
