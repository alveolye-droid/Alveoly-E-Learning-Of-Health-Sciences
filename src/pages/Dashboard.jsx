// ✅ Dashboard.jsx
import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext.jsx";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // ✅ get user from context

  const title = "Welcome to Kalveo University Portal";
  const letters = title.split("");

  useEffect(() => {
    // ✅ Check login status immediately
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // ✅ If logged in, redirect to student dashboard
    const timer = setTimeout(() => {
      navigate("/student-dashboard", { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04 },
    },
  };

  const child = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 150 } },
  };

  return (
    <div className="dashboard">
      {/* Animated Welcome Title */}
      <motion.h1
        className="animated-title"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {letters.map((char, index) => (
          <motion.span key={index} variants={child}>
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.h1>

      {/* University Logo */}
      <motion.img
        src="/images/kalveo-logo.jpg"
        alt="Kalveo University Logo"
        className="school-logo"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
      />

      {/* Subtitle */}
      <motion.p
        className="fade-text"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 1 }}
      >
        Explore courses, exams, and live classes.
      </motion.p>

      {/* Redirect Message */}
      {user && (
        <motion.p
          className="redirect-note"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 3.5, duration: 1 }}
        >
          Redirecting to your student dashboard...
        </motion.p>
      )}
    </div>
  );
};

export default Dashboard;
