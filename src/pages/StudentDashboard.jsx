// StudentDashboard.jsx (updated - exams removed)
import React, { useContext, useState, useEffect, useRef } from "react";
import "./StudentDashboard.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import axios from "axios";
import {
  FaBars,
  FaGraduationCap,
  FaMoon,
  FaSun,
  FaBell,
  FaSignOutAlt,
  FaBookOpen,
  FaChalkboardTeacher,
  FaMoneyBillWave,
  FaCog,
  FaLaptop,
  FaFileAlt,
  FaClipboardList,
  FaKey,
} from "react-icons/fa";

const StudentDashboard = () => {
  const { user, setUser, logoutUser, SERVER_URL, DEFAULT_AVATAR } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const avatarInputRef = useRef(null);

  const [avatar, setAvatar] = useState(() => {
    if (!user) return DEFAULT_AVATAR;
    if (user.avatar) return user.avatar.startsWith("http") ? user.avatar : `${SERVER_URL}${user.avatar}`;
    return DEFAULT_AVATAR;
  });

  useEffect(() => {
    if (user?.avatar) {
      setAvatar(user.avatar.startsWith("http") ? user.avatar : `${SERVER_URL}${user.avatar}`);
      return;
    }
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.avatar) {
          setAvatar(parsed.avatar.startsWith("http") ? parsed.avatar : `${SERVER_URL}${parsed.avatar}`);
          return;
        }
      }
    } catch {}
    setAvatar(DEFAULT_AVATAR);
  }, [user, SERVER_URL, DEFAULT_AVATAR]);

  // Fetch user roles & redirect logic
  useEffect(() => {
    const fetchUser = async () => {
      const token = user?.token || localStorage.getItem("authToken") || localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(`${SERVER_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res?.data?.success) {
          const fetchedUser = res.data.user || {};
          const dashboardPath = res.data.dashboardPath;
          const role = fetchedUser.role ? String(fetchedUser.role).toLowerCase() : undefined;

          let avatarURL = DEFAULT_AVATAR;
          try {
            const stored = localStorage.getItem("user");
            const storedAvatar = stored ? JSON.parse(stored).avatar : null;
            if (fetchedUser.avatar) {
              avatarURL = fetchedUser.avatar.startsWith("http") ? fetchedUser.avatar : `${SERVER_URL}${fetchedUser.avatar}`;
            } else if (storedAvatar) {
              avatarURL = storedAvatar.startsWith("http") ? storedAvatar : `${SERVER_URL}${storedAvatar}`;
            }
          } catch {
            avatarURL = DEFAULT_AVATAR;
          }

          const updatedUser = { ...fetchedUser, avatar: avatarURL, token, dashboardPath };
          if (setUser) setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));

          if (dashboardPath && typeof dashboardPath === "string" && !location.pathname.startsWith(dashboardPath)) {
            navigate(dashboardPath, { replace: true });
            return;
          }

          if (!dashboardPath && role && role !== "student") {
            if (role === "lecturer") {
              navigate(`/lecturer/${fetchedUser._id}/dashboard`, { replace: true });
            } else if (role === "admin") {
              navigate(`/admin/dashboard`, { replace: true });
            }
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch student user:", err);
      }
    };

    fetchUser();
  }, [user?.token, navigate, SERVER_URL, DEFAULT_AVATAR, location.pathname, setUser]);

  // Block student from lecturer dashboard
  useEffect(() => {
    if (!user) return;
    const role = (user.role || "").toLowerCase();
    const dashboardPath = user.dashboardPath || (user._id ? `/student/${user._id}/dashboard` : null);
    if (role === "student" && dashboardPath && location.pathname.startsWith("/lecturer")) {
      navigate(dashboardPath, { replace: true });
    }
  }, [user, location.pathname, navigate]);

  // Dark mode
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  // Notifications dropdown auto-close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".notification-wrapper")) setShowNotifications(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const basePath = user && user._id ? `/student/${user._id}` : "/student";
  const isStudent = (user?.role || "").toLowerCase() === "student";

  // ===== Student menu (exams removed) =====
const studentMenu = [
  { label: "Dashboard", icon: <FaGraduationCap />, path: `${basePath}/dashboard` },
  { label: "Courses", icon: <FaBookOpen />, path: "/courses" },
  // Start Exam now points to the dynamic exam route
  { label: "Start Exam", icon: <FaClipboardList />, path: `${basePath}/exams/:examId/start` },
  { label: "Study Library", icon: <FaBookOpen />, path: "/student/study" },


  // { label: "Payments", icon: <FaMoneyBillWave />, path: "/payments" },
  { label: "Join Live", icon: <FaLaptop />, path: "/live" },
  // { label: "Settings", icon: <FaCog />, path: "/settings" },
];


  const fallbackMenu = [
    { label: "Dashboard", icon: <FaGraduationCap />, path: `${basePath}/dashboard` },
    { label: "Courses", icon: <FaBookOpen />, path: "/courses" },
    { label: "Settings", icon: <FaCog />, path: "/settings" },
  ];

  const menuItems = isStudent ? studentMenu : fallbackMenu;

  const courseNames = user?.courses?.map((c) => c.name || `${c.programName} - ${c.className}`) || [];
  const stats = {
    myCourses: courseNames.length,
    messages: user?.unreadMessages || 0,
    paymentsMade: user?.paymentsMade || 0,
  };

  // Sync activeTab (exams removed)
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/courses")) setActiveTab("Courses");
    else if (path.includes("/payments")) setActiveTab("Payments");
    else setActiveTab("Dashboard");
  }, [location.pathname]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleNotifications = () => setShowNotifications((prev) => !prev);
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };
  const handleLogout = () => {
    if (logoutUser) logoutUser();
    navigate("/login");
  };
  const handleAvatarClick = () => avatarInputRef.current?.click();

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setAvatar(previewURL);

    try {
      const token = localStorage.getItem("authToken") || user?.token || localStorage.getItem("token") || "";
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await axios.post(`${SERVER_URL}/api/auth/upload-avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      let uploadedAvatar = res?.data?.avatar || DEFAULT_AVATAR;
      if (!uploadedAvatar.startsWith("http")) uploadedAvatar = `${SERVER_URL}${uploadedAvatar}`;

      setAvatar(uploadedAvatar);
      const updatedUser = { ...user, avatar: uploadedAvatar };
      if (setUser) setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Avatar upload failed:", err);
      URL.revokeObjectURL(previewURL);
    } finally {
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const isLoading = user === undefined;

  return (
    <div className="dashboard-container">
      {isLoading ? (
        <div style={{ padding: 20 }}>Loading dashboard...</div>
      ) : (
        <>
          <nav className="dashboard-navbar">
            <div className="navbar-left">
              <button className="menu-btn" onClick={toggleSidebar}><FaBars /></button>
              <div className="logo-container">
                <FaGraduationCap className="logo-icon" />
                <h2 className="logo-text">ALVEOLY E-LEARNING</h2>
              </div>
            </div>

            <div className="navbar-right">
              <div className="notification-wrapper">
                <button className="notification-btn" onClick={toggleNotifications}>
                  <FaBell />
                  {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
                </button>
                {showNotifications && (
                  <div className="notification-dropdown">
                    {notifications.length > 0 ? (
                      notifications.map(note => <div key={note.id} className="notification-item">{note.text}</div>)
                    ) : (
                      <p className="no-notifications">No new notifications</p>
                    )}
                  </div>
                )}
              </div>

              <button className="theme-toggle" onClick={toggleDarkMode}>
                {darkMode ? <FaMoon /> : <FaSun />}
              </button>

              <div className="user-info">
                <img
                  src={avatar || DEFAULT_AVATAR}
                  alt="Student"
                  className="user-avatar"
                  onClick={handleAvatarClick}
                  style={{ cursor: "pointer" }}
                />
                <input type="file" ref={avatarInputRef} accept="image/*" style={{ display: "none" }} onChange={handleAvatarUpload} />
                <span className="username">{user?.name || "Student"}</span>
              </div>

              <button className="logout-btn" onClick={handleLogout}><FaSignOutAlt /></button>
            </div>
          </nav>

          <div className="dashboard-main">
            <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
              <ul>
                {menuItems.map(item => (
                  <li key={item.label} className={activeTab === item.label ? "active" : ""}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => (isActive ? "navlink active" : "navlink")}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {item.icon}<span className="menu-label">{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </aside>

            <section className="main-content">
              <h2>Welcome Back, {user?.name || "Student"} 👋</h2>

              {courseNames.length > 0 ? (
                <p className="subtitle">You’re enrolled in <strong>{courseNames.join(", ")}</strong>.</p>
              ) : (
                <p className="subtitle">No assigned courses yet.</p>
              )}

              <div className="stats-section">
                <div className="stat-card"><h3>My Courses</h3><p>{stats.myCourses}</p></div>
                <div className="stat-card"><h3>Messages</h3><p>{stats.messages}</p></div>
                <div className="stat-card"><h3>Payments Made</h3><p>{stats.paymentsMade}</p></div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
