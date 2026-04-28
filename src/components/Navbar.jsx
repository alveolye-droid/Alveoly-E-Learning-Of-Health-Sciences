import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo" onClick={() => handleNavigate("/")}>
          <span className="logo-highlight">Alveoly</span>E-learning
        </div>

        <div
          className={`menu-toggle ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>

        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          <li onClick={() => handleNavigate("/")}>Home</li>
          <li onClick={() => handleNavigate("/about")}>About</li>
          <li onClick={() => handleNavigate("/programs")}>Programs</li>
          <li onClick={() => handleNavigate("/admissions")}>Admissions</li>
          <li onClick={() => handleNavigate("/contact")}>Contact</li>
          <li>
            <button className="login-btn" onClick={() => handleNavigate("/login")}>
              Login
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
