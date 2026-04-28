import React, { useContext, useState, useEffect, useRef } from "react";
import "./AdminDashboard.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";

import {
  FaBars,
  FaUsers,
  FaUserShield,
  FaVideo,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaMoon,
  FaSun,
  FaChartBar,
  FaClipboardList,
  FaBookOpen,
  FaBook,
  FaChalkboardTeacher,
  FaUserPlus,
  FaEnvelope,
  FaFileAlt,
} from "react-icons/fa";

import AdminAnswerBot from "../components/AdminAnswerBot";

const AdminDashboard = () => {
  const { user, setUser, logoutUser, SERVER_URL, DEFAULT_AVATAR } =
    useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  // ===== UI STATE =====
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("adminNotifications");
    return saved ? JSON.parse(saved) : [];
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [socket, setSocket] = useState(null);

  // ===== AVATAR =====
  const avatarInputRef = useRef(null);

  const [avatar, setAvatar] = useState(() => {
    if (!user) return DEFAULT_AVATAR;
    if (user.avatar)
      return user.avatar.startsWith("http")
        ? user.avatar
        : `${SERVER_URL}${user.avatar}`;
    return DEFAULT_AVATAR;
  });

  // Keep avatar synced when user updates
  useEffect(() => {
    if (user?.avatar) {
      setAvatar(
        user.avatar.startsWith("http")
          ? user.avatar
          : `${SERVER_URL}${user.avatar}`
      );
    } else {
      setAvatar(DEFAULT_AVATAR);
    }
  }, [user, SERVER_URL, DEFAULT_AVATAR]);

  const handleAvatarClick = () => avatarInputRef.current.click();

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setAvatar(previewURL);

    try {
      const token =
        user?.token ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("token");

      const formData = new FormData();
      formData.append("avatar", file);

      const res = await axios.post(
        `${SERVER_URL}/api/auth/upload-avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let uploaded = res?.data?.avatar || DEFAULT_AVATAR;
      if (!uploaded.startsWith("http")) uploaded = `${SERVER_URL}${uploaded}`;

      setAvatar(uploaded);
      const updatedUser = { ...user, avatar: uploaded };
      setUser(updatedUser);

      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Avatar upload failed:", err);
      URL.revokeObjectURL(previewURL);
    } finally {
      avatarInputRef.current.value = "";
    }
  };

  // ===== SERVER AUTHORITATIVE USER FETCH =====
  useEffect(() => {
    const fetchUser = async () => {
      const token =
        user?.token ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("token");

      if (!token) return;

      try {
        const res = await axios.get(`${SERVER_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res?.data?.success) return;

        const fetched = res.data.user || {};
        const dashboardPath = res.data.dashboardPath;
        const role = (fetched.role || "").toLowerCase();

        // Determine avatar (backend OR stored replacement)
        let avatarURL = DEFAULT_AVATAR;
        const stored = localStorage.getItem("user");
        const storedAvatar = stored ? JSON.parse(stored).avatar : null;

        if (fetched.avatar) {
          avatarURL = fetched.avatar.startsWith("http")
            ? fetched.avatar
            : `${SERVER_URL}${fetched.avatar}`;
        } else if (storedAvatar) {
          avatarURL = storedAvatar.startsWith("http")
            ? storedAvatar
            : `${SERVER_URL}${storedAvatar}`;
        }

        const updated = { ...fetched, avatar: avatarURL, token, dashboardPath };
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));

        // Role validation
        if (role !== "admin") {
          if (role === "lecturer")
            return navigate(`/lecturer/${fetched._id}/dashboard`, {
              replace: true,
            });

          if (role === "student")
            return navigate(`/student/${fetched._id}/dashboard`, {
              replace: true,
            });
        }

        // Server authoritative redirect
        if (
          dashboardPath &&
          typeof dashboardPath === "string" &&
          !location.pathname.startsWith(dashboardPath)
        ) {
          navigate(dashboardPath, { replace: true });
          return;
        }
      } catch (err) {
        console.error("Admin fetch /auth/me failed:", err);
      }
    };

    fetchUser();
  }, [user?.token, SERVER_URL, navigate, location.pathname, setUser]);

  // Auto-correct URL if admin accidentally enters student/lecturer URL
  useEffect(() => {
    if (!user) return;
    const role = (user.role || "").toLowerCase();

    if (role === "admin" && location.pathname.startsWith("/student"))
      navigate("/admin/dashboard", { replace: true });

    if (role === "admin" && location.pathname.startsWith("/lecturer"))
      navigate("/admin/dashboard", { replace: true });
  }, [user, location.pathname, navigate]);

  // === Dark mode toggle ===
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    const m = !darkMode;
    setDarkMode(m);
    localStorage.setItem("darkMode", m);
  };

  // === Notifications ===
  useEffect(() => {
    localStorage.setItem("adminNotifications", JSON.stringify(notifications));
  }, [notifications]);

  const handleClearAll = () => {
    setNotifications([]);
    localStorage.removeItem("adminNotifications");
  };

  const handleNotificationClick = (id, path) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    navigate(path);
    setShowNotifications(false);
  };

  // === Socket ===
  useEffect(() => {
    const newSocket = io(SERVER_URL, { transports: ["websocket"] });
    setSocket(newSocket);

    newSocket.on("connect", () =>
      console.log("Admin socket connected:", newSocket.id)
    );

    return () => newSocket.disconnect();
  }, [SERVER_URL]);

  // ===== Admin Menu =====
  const menuItems = [
    { label: "Dashboard", icon: <FaChartBar />, path: "/admin/dashboard" },
    { label: "Applied Students", icon: <FaClipboardList />, path: "/admin/applied-students" },
    { label: "Lecturer Sign Up", icon: <FaUserPlus />, path: "/admin/lecturer-signup" },
    { label: "All Lecturers", icon: <FaChalkboardTeacher />, path: "/admin/all-lecturers" },
    { label: "Create Course", icon: <FaBookOpen />, path: "/admin/create-course" },
    { label: "View All Courses", icon: <FaBook />, path: "/admin/all-courses" },

    // Exams
    { label: "Approve Exams", icon: <FaFileAlt />, path: "/admin/approve-exams" },

    // Live sessions
    { label: "Create Live Session", icon: <FaVideo />, path: "/admin/create-live" },
    { label: "All Live Sessions", icon: <FaVideo />, path: "/admin/live-sessions" },

    { label: "Messages", icon: <FaEnvelope />, path: "/admin/messages" },
    { label: "Manage Users", icon: <FaUsers />, path: "/admin/users" },
    { label: "Study Articles", icon: <FaBook />, path: "/admin/study" },
{ label: "Create Study", icon: <FaFileAlt />, path: "/admin/study/create" },
    // { label: "Settings", icon: <FaCog />, path: "/admin/settings" },
  ];

  return (
    <div className="dashboard-container">
      {/* NAVBAR */}
      <nav className="dashboard-navbar">
        <div className="navbar-left">
          <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaBars />
          </button>

          <div className="logo-container">
            <FaUserShield className="logo-icon" />
            <h2 className="logo-text">Admin Panel</h2>
          </div>
        </div>

        <div className="navbar-right">
          {/* Notifications */}
          <div className="notification-wrapper">
            <button className="notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
              <FaBell />
              {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                {notifications.length === 0 ? (
                  <div className="notification-empty">No notifications yet</div>
                ) : (
                  <>
                    <button className="clear-btn" onClick={handleClearAll}>Clear All</button>
                    {notifications.map((note) => (
                      <div
                        key={note.id}
                        className="notification-item"
                        onClick={() => handleNotificationClick(note.id, note.path)}
                      >
                        {note.text}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? <FaMoon /> : <FaSun />}
          </button>

          <div className="user-info">
            <img
              src={avatar}
              alt="Admin"
              className="user-avatar"
              onClick={handleAvatarClick}
            />
            <input
              type="file"
              ref={avatarInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarUpload}
            />
            <span className="username">{user?.name || "Admin"}</span>
          </div>

          <button className="logout-btn" onClick={logoutUser}>
            <FaSignOutAlt />
          </button>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <div className="dashboard-main">
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <ul>
            {menuItems.map((item) => (
              <li
                key={item.label}
                className={activeTab === item.label ? "active" : ""}
                onClick={() => {
                  setActiveTab(item.label);
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
              >
                {item.icon}
                <span className="menu-label">{item.label}</span>
              </li>
            ))}
          </ul>
        </aside>

        <section className="main-content">
          <h2>Welcome, {user?.name || "Administrator"} 👋</h2>
          <p className="subtitle">System Overview & Management Tools</p>

          <div className="stats-section">
            <div className="stat-card"><h3>Total Users</h3><p>124</p></div>
            <div className="stat-card"><h3>Blocked Videos</h3><p>6</p></div>
            <div className="stat-card"><h3>Reports</h3><p>14</p></div>
            <div className="stat-card"><h3>System Alerts</h3><p>3</p></div>
          </div>
        </section>
      </div>

      <AdminAnswerBot />
    </div>
  );
};

export default AdminDashboard;
