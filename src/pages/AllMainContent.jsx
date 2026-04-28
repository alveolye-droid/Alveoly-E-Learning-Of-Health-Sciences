import React, { useState, useRef, useEffect } from "react";
import {
  FaStethoscope,
  FaBookMedical,
  FaClipboardList,
  FaGraduationCap,
  FaBriefcaseMedical,
  FaSearch,
  FaBars,
  FaTimes,
} from "react-icons/fa";

import "./student/study/StudyLayout.css";
import "./AllMainContent.css";

const AllMainContent = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const searchBoxRef = useRef(null);
  const searchInputRef = useRef(null);

  /* Close search on outside click */
  useEffect(() => {
    const handleOutside = (e) => {
      if (
        searchOpen &&
        searchBoxRef.current &&
        !searchBoxRef.current.contains(e.target)
      ) {
        setSearchOpen(false);
      }
    };

    if (searchOpen) {
      document.addEventListener("mousedown", handleOutside);
      searchInputRef.current?.focus();
    }

    return () =>
      document.removeEventListener("mousedown", handleOutside);
  }, [searchOpen]);

  /* ESC key */
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && setSearchOpen(false);
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="nl-shell">
      {/* ================= HEADER / FULL NAV ================= */}
      <header className="nl-header">
        <div className="nl-header-inner">
          {/* LOGO */}
          <div className="nl-logo">
            <FaStethoscope className="logo-icon" />
            <span>Alveoly</span>
          </div>

          {/* FULL NAV */}
          <nav className={`nl-nav ${menuOpen ? "open" : ""}`}>
            {/* CARE PLANS */}
            <div className="nl-nav-item">
              <span>
                <FaClipboardList /> Care Plans
              </span>

              <div className="nl-mega">
                <div className="nl-mega-inner">
                  <div className="nl-mega-col">
                    <h4>Nursing Care Plan Guide</h4>
                    <a href="#">General Nursing Care Plans</a>
                    <a href="#">Surgery & Perioperative</a>
                    <a href="#">Cardiovascular</a>
                    <a href="#">Endocrine & Metabolic</a>
                    <a href="#">Gastrointestinal</a>
                    <a href="#">Genitourinary</a>
                    <a href="#">Hematologic</a>
                    <a href="#">Infectious Diseases</a>
                  </div>

                  <div className="nl-mega-col">
                    <h4>Specialty Areas</h4>
                    <a href="#">Integumentary</a>
                    <a href="#">Maternity & Newborn</a>
                    <a href="#">Mental Health</a>
                    <a href="#">Musculoskeletal</a>
                    <a href="#">Neurological</a>
                    <a href="#">Ophthalmic</a>
                    <a href="#">Pediatric Nursing</a>
                    <a href="#">Respiratory</a>
                  </div>

                  <div className="nl-mega-cta">
                    <h3>Make Better Care Plans</h3>
                    <p>
                      Access FREE nursing care plans, diagnosis samples,
                      and structured templates to enhance practice.
                    </p>
                    <a href="#" className="nl-mega-btn">
                      View All Care Plans
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* EXAMS */}
            <div className="nl-nav-item">
              <span>
                <FaBookMedical /> Exams
              </span>
              <div className="nl-mega simple">
                <a href="#">NCLEX Review</a>
                <a href="#">Nursing Quizzes</a>
                <a href="#">Practice Exams</a>
                <a href="#">Mock Tests</a>
              </div>
            </div>

            {/* NOTES */}
            <div className="nl-nav-item">
              <span>
                <FaGraduationCap /> Notes
              </span>
              <div className="nl-mega simple">
                <a href="#">Nursing Fundamentals</a>
                <a href="#">Medical-Surgical Notes</a>
                <a href="#">Pharmacology Notes</a>
                <a href="#">Clinical Skills</a>
              </div>
            </div>

            {/* CAREER */}
            <div className="nl-nav-item">
              <span>
                <FaBriefcaseMedical /> Career
              </span>
              <div className="nl-mega simple">
                <a href="#">Nursing Careers</a>
                <a href="#">Specialty Guides</a>
                <a href="#">Resume & Interview</a>
                <a href="#">Career Paths</a>
              </div>
            </div>

            {/* NURSELIFE */}
            <div className="nl-nav-item">
              <span>
                <FaStethoscope /> NurseLife
              </span>
              <div className="nl-mega simple">
                <a href="#">Lifestyle</a>
                <a href="#">Mental Wellness</a>
                <a href="#">Work-Life Balance</a>
                <a href="#">Inspiration</a>
              </div>
            </div>
          </nav>

          {/* ACTIONS */}
          <div className="nl-actions">
            <button
              className="nl-search-btn"
              onClick={() => setSearchOpen(true)}
            >
              <FaSearch />
            </button>

            <button
              className="nl-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </header>

      {/* ================= SEARCH OVERLAY ================= */}
      {searchOpen && (
        <div className="nl-search-overlay">
          <div className="nl-search-modal" ref={searchBoxRef}>
            <input
              ref={searchInputRef}
              placeholder="Search nursing resources..."
            />
            <button>
              <FaSearch />
            </button>
          </div>
        </div>
      )}

      {/* ================= ARTICLE PAGE ================= */}
      <div className="nl-page">
        <main className="nl-layout">
          {/* LEFT */}
          <aside className="nl-left">
            <div className="nl-card sticky">
              <h4>Contents</h4>
              <ul>
                <li>Transmission-Based Precautions</li>
                <li>Common Pathogens</li>
                <li>Pharmacology Pearls</li>
                <li>Pediatric Infections</li>
                <li>Adult Infections</li>
                <li>Infection Control Principles</li>
              </ul>
            </div>
          </aside>

          {/* MAIN */}
          <article className="nl-main">
            <h1 className="nl-title">
              101+ Infectious Disease Nursing Bullets
            </h1>

            <div className="nl-meta">
              <span>Updated on August 18, 2025</span>
              <span>By Matt Vera BSN, R.N.</span>
            </div>

            <div className="nl-body">
              <h2>Transmission-Based Precautions</h2>
              <p>
                Transmission-based precautions are used in addition to
                standard precautions for patients with known or suspected
                infections.
              </p>

              <h3>Airborne Precautions</h3>
              <ul>
                <li>N95 respirator required</li>
                <li>Negative pressure room</li>
                <li>TB, measles, varicella</li>
              </ul>

              <h3>Droplet Precautions</h3>
              <ul>
                <li>Surgical mask</li>
                <li>Influenza, meningitis</li>
              </ul>

              <h3>Contact Precautions</h3>
              <ul>
                <li>Gown and gloves</li>
                <li>MRSA, VRE</li>
              </ul>
            </div>
          </article>

          {/* RIGHT */}
          <aside className="nl-right">
            <div className="nl-card">
              <h4>Related Topics</h4>
              <a href="#">Infection Control</a>
              <a href="#">Nursing Diagnosis</a>
              <a href="#">Pharmacology</a>
            </div>

            <div className="nl-card">
              <h4>Trending</h4>
              <a href="#">NCLEX Tips</a>
              <a href="#">Drug Calculations</a>
            </div>
          </aside>
        </main>
      </div>

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
    </div>
  );
};

export default AllMainContent;
