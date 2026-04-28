import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admissions.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ApplyNow from "../pages/ApplyNow";

import {
  FaClipboardList,
  FaBookOpen,
  FaUserCheck,
  FaGraduationCap,
} from "react-icons/fa";
import admissionBg from "../images/admissions-bg.jpg";

const Admissions = () => {
  const navigate = useNavigate();
  const [showApplyModal, setShowApplyModal] = useState(false);

  return (
    <div className="admissions-page">
      <Navbar />

      {/* Hero Section */}
      <header
        className="admissions-hero"
        style={{ backgroundImage: `url(${admissionBg})` }}
      >
        <div className="overlay">
          <h1>Admissions Alveoly E-Learning Academy Of Health & Sciences</h1>
          <p>Your gateway to excellence, innovation, and global leadership.</p>
          <button className="apply-btn" onClick={() => setShowApplyModal(true)}>
            Apply Now
          </button>
        </div>
      </header>

      {/* Admission Requirements */}
      <section className="admission-requirements">
        <h2>Admission Requirements</h2>
        <p className="intro-text">
          Alveoly E-Learning Academy Of Health & Sciences welcomes ambitious, curious, and creative minds ready to make an impact.
        </p>
        <ul className="requirements-list">
          <li>✔ Completed application form (online or paper-based)</li>
          <li>✔ Official high school transcripts or equivalent certificates</li>
          <li>✔ Proof of English proficiency (if applicable)</li>
          <li>✔ Two academic or professional recommendation letters</li>
          <li>✔ A personal statement (max 500 words)</li>
        </ul>
      </section>

      {/* Steps to Apply */}
      <section className="application-steps">
        <h2>How to Apply</h2>
        <div className="steps-grid">
          <div className="step-card">
            <FaClipboardList className="step-icon" />
            <h3>1. Fill Application</h3>
            <p>Complete your application form online or download the offline form.</p>
          </div>

          <div className="step-card">
            <FaBookOpen className="step-icon" />
            <h3>2. Submit Documents</h3>
            <p>Upload or mail your academic transcripts and supporting materials.</p>
          </div>

          <div className="step-card">
            <FaUserCheck className="step-icon" />
            <h3>3. Review Process</h3>
            <p>Our admissions team carefully reviews every application submitted.</p>
          </div>

          <div className="step-card">
            <FaGraduationCap className="step-icon" />
            <h3>4. Get Admission Offer</h3>
            <p>Successful applicants will receive their admission letter via email.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="admission-cta">
        <h2>Start Your Journey Today</h2>
        <p>
          Join a world-class university shaping future innovators, thinkers, and leaders across Africa and beyond.
        </p>
        <button className="cta-btn" onClick={() => setShowApplyModal(true)}>
          Apply Now
        </button>
      </section>

      <Footer />
      <ApplyNow isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} />
    </div>
  );
};

export default Admissions;
