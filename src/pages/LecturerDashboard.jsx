import React, { useContext, useState, useEffect, useRef } from "react";
import "./LecturerDashboard.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import axios from "axios";

import {
  FaBars,
  FaChalkboardTeacher,
  FaMoon,
  FaSun,
  FaBell,
  FaSignOutAlt,
  FaBookOpen,
  FaUsers,
  FaCog,
  FaLaptop,
  FaFolderOpen,
  FaFileAlt,
  FaClipboardList,          // ✅ make sure this line exists
  FaChartBar,
  FaLock,
  FaGraduationCap,
  FaMoneyBillWave,
  FaKey
} from "react-icons/fa";

const LecturerDashboard = () => {
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
            const storedUser = localStorage.getItem("user");
            const storedAvatar = storedUser ? JSON.parse(storedUser).avatar : null;

            if (fetchedUser.avatar) {
              avatarURL = fetchedUser.avatar.startsWith("http")
                ? fetchedUser.avatar
                : `${SERVER_URL}${fetchedUser.avatar}`;
            } else if (storedAvatar) {
              avatarURL = storedAvatar.startsWith("http")
                ? storedAvatar
                : `${SERVER_URL}${storedAvatar}`;
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

          if (!dashboardPath && role && role !== "lecturer") {
            navigate(`/student/${fetchedUser._id}/dashboard`, { replace: true });
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch lecturer:", err);
      }
    };

    fetchUser();
  }, [user?.token, navigate, SERVER_URL, DEFAULT_AVATAR, location.pathname, setUser]);

  useEffect(() => {
    if (!user) return;

    const role = (user.role || "").toLowerCase();
    const dashboardPath = user.dashboardPath || (user._id ? `/lecturer/${user._id}/dashboard` : null);

    if (role === "lecturer" && dashboardPath && location.pathname.startsWith("/student")) {
      navigate(dashboardPath, { replace: true });
    }
  }, [user, location.pathname, navigate]);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest(".notification-wrapper")) setShowNotifications(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const basePath = user && user._id ? `/lecturer/${user._id}` : "/lecturer";
  const isLecturer = (user?.role || "").toLowerCase() === "lecturer";

  // ===== Lecturer Menu =====
 const lecturerMenu = [
  { label: "Dashboard", icon: <FaChalkboardTeacher />, path: `${basePath}/dashboard` },
  { label: "Upload Course", icon: <FaBookOpen />, path: `${basePath}/upload-course` },
  { label: "My Courses", icon: <FaFolderOpen />, path: `${basePath}/courses` },
  { label: "Student Access", icon: <FaKey />, path: `${basePath}/access-control` },

  // 🔥 EXAMS SECTION
  { label: "Create Exam", icon: <FaFileAlt />, path: `${basePath}/exams/create` },

  // { label: "Students", icon: <FaUsers />, path: `${basePath}/students` },
  { label: "Live Sessions", icon: <FaLaptop />, path: `${basePath}/live` },
  // { label: "Settings", icon: <FaCog />, path: `${basePath}/settings` },
];


  // ===== Student Menu =====
  const studentMenu = [
    { label: "Dashboard", icon: <FaGraduationCap />, path: `${basePath}/dashboard` },
    { label: "Courses", icon: <FaBookOpen />, path: "/courses" },
    { label: "Payments", icon: <FaMoneyBillWave />, path: "/payments" },
    { label: "Join Live", icon: <FaLaptop />, path: "/live" },
    { label: "Settings", icon: <FaCog />, path: "/settings" },
  ];

  const menuItems = isLecturer ? lecturerMenu : studentMenu;

  const courseNames = user?.courses?.map((c) => c.name || `${c.programName} - ${c.className}`) || [];

  const stats = {
    myCourses: courseNames.length,
    activeStudents: user?.courses?.reduce((acc, c) => acc + (c.studentCount || 0), 0) || 0,
    assignmentsToGrade: user?.pendingAssignments || 0,
    messages: user?.unreadMessages || 0,
  };

  useEffect(() => {
  const p = location.pathname;

  if (p.includes("/exams/create")) setActiveTab("Create Exam");
  else if (p.includes("/exams/code-generator")) setActiveTab("Exam Codes");
  else if (p.includes("/exams/results")) setActiveTab("Exam Results");
  else if (p.includes("upload-course")) setActiveTab("Upload Course");
  else if (p.includes("/courses")) setActiveTab("My Courses");
  else if (p.includes("/students")) setActiveTab("Students");
  else if (p.includes("/live")) setActiveTab("Live Sessions");
  else if (p.includes("/settings")) setActiveTab("Settings");
  else setActiveTab("Dashboard");
}, [location.pathname]);


  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const toggleNotifications = () => setShowNotifications((v) => !v);

  const toggleDarkMode = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    localStorage.setItem("darkMode", newVal);
  };

  const handleLogout = () => {
    if (logoutUser) logoutUser();
    navigate("/login");
  };

  const handleAvatarClick = () => avatarInputRef.current?.click();

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setAvatar(preview);

    try {
      const token =
        localStorage.getItem("authToken") ||
        user?.token ||
        localStorage.getItem("token") ||
        "";

      const form = new FormData();
      form.append("avatar", file);

      const res = await axios.post(`${SERVER_URL}/api/auth/upload-avatar`, form, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      let uploaded = res?.data?.avatar || DEFAULT_AVATAR;
      if (!uploaded.startsWith("http")) uploaded = `${SERVER_URL}${uploaded}`;

      setAvatar(uploaded);
      const updatedUser = { ...user, avatar: uploaded };
      if (setUser) setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Avatar upload failed:", err);
      URL.revokeObjectURL(preview);
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
                <FaChalkboardTeacher className="logo-icon" />
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
                      notifications.map((note) => (
                        <div key={note.id} className="notification-item">
                          {note.text}
                        </div>
                      ))
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
                  alt="Lecturer"
                  className="user-avatar"
                  onClick={handleAvatarClick}
                  style={{ cursor: "pointer" }}
                />
                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarUpload}
                />
                <span className="username">{user?.name || "Lecturer"}</span>
              </div>

              <button className="logout-btn" onClick={handleLogout}>
                <FaSignOutAlt />
              </button>
            </div>
          </nav>

          <div className="dashboard-main">
            <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
              <ul>
                {menuItems.map((item) => (
                  <li key={item.label} className={activeTab === item.label ? "active" : ""}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => (isActive ? "navlink active" : "navlink")}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {item.icon}
                      <span className="menu-label">{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </aside>

            <section className="main-content">
              <h2>Welcome Back, {user?.name || "Lecturer"} 👋</h2>

              {courseNames.length > 0 ? (
                <p className="subtitle">
                  You’re teaching <strong>{courseNames.join(", ")}</strong>.
                </p>
              ) : (
                <p className="subtitle">No assigned courses yet.</p>
              )}

              <div className="stats-section">
                <div className="stat-card"><h3>My Courses</h3><p>{stats.myCourses}</p></div>
                <div className="stat-card"><h3>Active Students</h3><p>{stats.activeStudents}</p></div>
                <div className="stat-card"><h3>Assignments to Grade</h3><p>{stats.assignmentsToGrade}</p></div>
                <div className="stat-card"><h3>Messages</h3><p>{stats.messages}</p></div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default LecturerDashboard;
