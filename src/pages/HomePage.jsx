import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import kalveoBg from "../images/kalveo-bg.jpg";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ApplyNow from "../pages/ApplyNow";

import {
  FaLightbulb,
  FaBriefcase,
  FaFlask,
  FaGlobeAfrica,
  FaUsers,
  FaGraduationCap,
  FaQuoteLeft,
  FaServicestack,
} from "react-icons/fa";
import AnswerBot from "../components/AnswerBot";

const HomePage = () => {
  const navigate = useNavigate();
  const [showApplyModal, setShowApplyModal] = useState(false);

  return (
    <div className="home-page">
      {/* Navbar stays sticky and outside hero flex */}
      <Navbar />

      <header
        className="hero-section"
        style={{ backgroundImage: `url(${kalveoBg})` }}
      >
        <div className="overlay">
          <h1>ALVEOLY E-LEARNING ACADEMY OF HEALTH AND SCIENCES</h1>
          <p>
            Discover a world-class education designed to prepare you for global
            success. Join thousands of students shaping the future at Alveoly E-Learning Academy Of Health & Sciences.
          </p>
          <div className="hero-buttons">
            <button className="learn-btn" onClick={() => navigate("/programs")}>
              Explore Programs
            </button>
            <button
              className="apply-btn"
              onClick={() => setShowApplyModal(true)}
            >
              Apply Now
            </button>
          </div>
        </div>
      </header>

      <section className="features-section">
        <h2>Why Choose Alveoly?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FaLightbulb className="feature-icon" />
            <h3>Innovation Driven</h3>
            <p>
              We inspire creativity and innovation through cutting-edge labs,
              technology-driven programs, and a forward-thinking curriculum.
            </p>
          </div>
          <div className="feature-card">
            <FaBriefcase className="feature-icon" />
            <h3>Career Focused</h3>
            <p>
              Our focus is on simplifying complex topics, building critical thinking skills, 
              and enhancing retention through step-by-step guidance, practical examples, and exam-oriented approaches.
            </p>
          </div>
          <div className="feature-card">
            <FaFlask className="feature-icon" />
            <h3>Global Research Impact</h3>
            <p>
              Join groundbreaking research projects that address challenges in
              sustainability, health, and emerging technologies.
            </p>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stat">
          <FaGlobeAfrica className="stat-icon" />
          <h3>25+</h3>
          <p>International Partnerships</p>
        </div>
        <div className="stat">
          <FaUsers className="stat-icon" />
          <h3>15K+</h3>
          <p>Active Students</p>
        </div>
        <div className="stat">
          <FaBriefcase className="stat-icon" />
          <h3>98%</h3>
          <p>Graduate Employment Rate</p>
        </div>
        <div className="stat">
          <FaGraduationCap className="stat-icon" />
          <h3>100+</h3>
          <p>Programs Offered</p>
        </div>
      </section>

      <section className="testimonials-section">
        <h2>Services Offered</h2>
        <div className="testimonial-grid">
          <div className="testimonial-card">
            <FaServicestack className="quote-icon" />
            <p>
             <strong>Health Science Tutorials – Nursing, Midwifery,Public Health and Allied Health.</strong>
            </p>
            <h4>Foundational Science Tutorials – Mathematics, Physics, Chemistry. Biology</h4>
          </div>
          <div className="testimonial-card">
            <FaServicestack  className="quote-icon" />
            <p>
             <strong>Step-by-Step Topic Guides – Breaking down complex subjects into manageable lessons.</strong>
            </p>
            <h4>Practical Examples & Case Studies – Linking theory to real-life applications.</h4>
          </div>
          <div className="testimonial-card">
            <FaServicestack  className="quote-icon" />
            <p>
             <strong>Exam-Focused Prep – Bsc Nursing Exams, Diploma in Nursing,Midwifery,Public Health(Semester Exams-Level 100-400), Licensure(NMC), NCLEX-RN, and other academic exams.</strong>
            </p>
            <h4>Mentorship & Q&A Support – Personalized guidance to reinforce understanding</h4>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Begin Your Journey?</h2>
        <p>
          Start your path toward academic excellence and personal growth at
          Alveoly E-learning.
        </p>
        <button className="apply-btn" onClick={() => setShowApplyModal(true)}>
          Apply Now
        </button>
      </section>

      <Footer />

      <ApplyNow isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} />
         {/* 🔹 Floating chatbot lives here */}
      <AnswerBot />
    </div>
  );
};

export default HomePage;
