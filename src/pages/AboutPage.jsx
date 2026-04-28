import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AboutPage.css";
import aboutBg from "../images/about-bg.jpg";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ApplyNow from "../pages/ApplyNow";

import {
  FaBullseye,
  FaLightbulb,
  FaUsers,
  FaHandshake,
  FaAward,
  FaQuoteLeft,
  FaBookReader,
} from "react-icons/fa";

const AboutPage = () => {
  const navigate = useNavigate();
  const [showApplyModal, setShowApplyModal] = useState(false);

  return (
    <div className="about-wrapper">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <header
        className="hero-banner"
        style={{ backgroundImage: `url(${aboutBg})` }}
      >
        <div className="overlay">
          <h1>About Alveoly E-Learning Academy Of Health & Sciences</h1>
          <p>Shaping minds. Building leaders. Inspiring innovation.</p>
        </div>
      </header>

      {/* Mission & Vision */}
      <section className="mission-vision">
        <div className="info-card">
          <FaBullseye className="info-icon" />
          <h2>Our Mission</h2>
          <p>
To provide high-quality, accessible academic support that equips students with the
 knowledge, skills, and confidence to excel in their Nursing,Midwifery,Public Health  
 and health science exams.
          </p>
        </div>
        <div className="info-card">
          <FaLightbulb className="info-icon" />
          <h2>Our Vision</h2>
          <p>
To become the leading online academic support platform for healthcare students globally,
 known for producing confident, knowledgeable, and high-performing graduates.
          </p>
        </div>
      </section>

      {/* History */}
      <section className="about-history">
        <h2>Institutional Profile</h2>
        <div className="history-text">
          <p>
<strong>Alveoly E-learning Institute of Health and Sciences</strong> is a dynamic online platform dedicated to helping students excel in health sciences, nursing, midwifery, and foundational sciences such as Mathematics, Physics, and Chemistry. The Institute focuses on simplifying complex topics, providing practical
 examples, and offering exam-focused tutorials to ensure students perform confidently in national and international licensure and professional exams, including Licensure, NCLEX-RN and other professional exams.
          </p>
          <p>
            The Institute’s approach ensures that learners understand core scientific principles that underpin healthcare practice, 
            strengthening both academic knowledge and clinical reasoning skills
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="core-values">
        <h2>Our Core Values</h2>
        <div className="values-container">
          <div className="value-item">
            <FaUsers className="value-icon" />
            <h3>Empowerment</h3>
            <p>Helping students gain confidence and mastery in their studies.</p>
          </div>
          <div className="value-item">
            <FaBookReader className="value-icon" />
            <h3>Lifelong Learning</h3>
            <p>Encouraging continuous academic and professional growth.</p>
          </div>
          <div className="value-item">
            <FaHandshake className="value-icon" />
            <h3>Integrity</h3>
            <p>Providing accurate, reliable, and evidence-based guidance.</p>
          </div>
          <div className="value-item">
            <FaLightbulb className="value-icon" />
            <h3>Innovation</h3>
            <p>Using modern e-learning methods to simplify learning.</p>
          </div>
          <div className="value-item">
            <FaAward className="value-icon" />
            <h3>Excellence</h3>
            <p>Delivering focused, high-quality tutorials for student success.</p>
          </div>
        </div>
      </section>

      {/* Leadership Quote */}
      <section className="leadership-quote">
        <FaQuoteLeft className="quote-icon" />
        <p className="quote-text">
          “At ALVEOLY E-LEARNING ACADEMY OF HEALTH AND SCIENCES, we don’t just educate students — we empower
          them to change the world.”
        </p>
        <h4>— Prof. Emmanuel Adusei, Vice Chancellor</h4>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Be Part of Our Legacy</h2>
        <p>
          Join ALVEOLY E-LEARNING ACADEMY OF HEALTH AND SCIENCES and become part of a vibrant community shaping
          the future of Africa and beyond.
        </p>
        <button className="apply-btn" onClick={() => setShowApplyModal(true)}>
          Apply Now
        </button>
      </section>

      <Footer />

      <ApplyNow isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} />
    </div>
  );
};

export default AboutPage;
