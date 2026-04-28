import React from "react";
import { FaStethoscope } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="nl-footer">
      {/* TOP */}
      <div className="nl-footer-top">
        <div className="nl-footer-container">

          {/* BRAND */}
          <div className="nl-footer-brand">
            <div className="nl-footer-logo">
              <FaStethoscope />
              <span>Alveoly</span>
            </div>

            <p>
              Alveoly E-Learning Academy of Health and Sciences is your
              trusted resource and lifestyle platform for student and
              professional nurses. Our mission is to empower nursing
              education, clinical excellence, and lifelong learning.
            </p>
          </div>

          {/* LINKS */}
          <div className="nl-footer-links">
            <a href="/about">About</a>
            <a href="/privacy">Privacy</a>
            <a href="/disclaimer">Disclaimer</a>
            <a href="/contact">Contact</a>
          </div>

        </div>
      </div>

      {/* BOTTOM */}
      <div className="nl-footer-bottom">
        <div className="nl-footer-bottom-inner">
          <span>
            © {new Date().getFullYear()} Alveoly E-Learning Academy of Health and Sciences
          </span>
          <span className="nl-footer-quote">
            Ut in Omnibus Glorificetur Deus!
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
