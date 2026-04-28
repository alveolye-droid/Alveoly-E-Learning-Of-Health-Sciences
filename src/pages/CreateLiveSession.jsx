import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./CreateCourse.css";

// ✅ Utility axios instance for easier token handling
const getAxiosInstance = () => {
  const token = localStorage.getItem("token");
  const instance = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:5000",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });
  return instance;
};

const CreateLiveSession = () => {
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [session, setSession] = useState(null);
  const jitsiContainerRef = useRef(null);
  const [jitsiApi, setJitsiApi] = useState(null);

  const axiosInstance = getAxiosInstance();

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axiosInstance.get("/api/admin/courses");
        setCourses(res.data.courses || []);
      } catch (err) {
        console.error("❌ Error fetching courses:", err);
        setMessage("⚠️ Unable to fetch courses. Are you logged in as admin?");
      }
    };

    fetchCourses();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle live session creation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axiosInstance.post("/api/live", formData);
      const newSession = res.data.session || null;
      setSession(newSession);

      setMessage(
        `${res.data.message || "✅ Live session scheduled successfully!"}${
          newSession?.assignedLecturer?.name
            ? ` Assigned Lecturer: ${newSession.assignedLecturer.name}`
            : ""
        }`
      );

      setFormData({
        courseId: "",
        title: "",
        description: "",
        startTime: "",
        endTime: "",
      });
    } catch (err) {
      console.error("❌ Error creating live session:", err);
      setMessage(
        err.response?.data?.message || "❌ Failed to create live session."
      );
    } finally {
      setLoading(false);
    }
  };

  // Initialize Jitsi
  useEffect(() => {
    if (!session || !jitsiContainerRef.current) return;

    if (!window.JitsiMeetExternalAPI) {
      console.error("❌ JitsiMeetExternalAPI not loaded");
      setMessage(
        "⚠️ JitsiMeetExternalAPI not loaded. Make sure you included the script in index.html."
      );
      return;
    }

    const domain = "meet.jit.si";
    const options = {
      roomName: session.roomId,
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: session.assignedLecturer?.name || "Lecturer",
      },
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: ["microphone", "camera", "hangup", "chat", "settings"],
      },
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);

    if (session.lecturerToken) {
      api.executeCommand("password", session.lecturerToken);
    }

    setJitsiApi(api);

    return () => {
      api.dispose();
      setJitsiApi(null);
    };
  }, [session]);

  return (
    <div className="create-course-page">
      <div className="create-course-header">
        <h2 className="page-title">Schedule a Live Session</h2>
        <p className="page-subtitle">
          Create a Jitsi-powered live lecture for students.
        </p>
      </div>

      <div className="create-course-form-wrapper">
        <form onSubmit={handleSubmit} className="create-course-form">
          <div className="form-group">
            <label>Course *</label>
            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              required
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.programName} {course.className && `- ${course.className}`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Session Title *</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. OOP Live Session"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Session details..."
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Start Time *</label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>End Time *</label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Scheduling..." : "Schedule Live"}
          </button>

          {message && <p className="feedback-message">{message}</p>}
        </form>
      </div>

      {session && (
        <div
          id="jitsi-container"
          ref={jitsiContainerRef}
          style={{ height: "600px", width: "100%", marginTop: "20px" }}
        />
      )}
    </div>
  );
};

export default CreateLiveSession;
