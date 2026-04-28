import React from "react";
import "./Programs.css";
import {
  FaLaptopCode,
  FaMicroscope,
  FaBriefcase,
  FaGlobeAmericas,
  FaUserGraduate,
  FaHeartbeat,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const programs = [
  {
    icon: <FaLaptopCode />,
    title: "Computer Science",
    description:
      "Explore AI, data science, and software engineering with modern labs and expert faculty.",
  },
  {
    icon: <FaMicroscope />,
    title: "Biological Sciences",
    description:
      "Hands-on research experience with world-class equipment and professional mentorship.",
  },
  {
    icon: <FaBriefcase />,
    title: "Business Administration",
    description:
      "Learn leadership, entrepreneurship, and innovation through practical industry projects.",
  },
  {
    icon: <FaGlobeAmericas />,
    title: "International Relations",
    description:
      "Gain insights into global politics, diplomacy, and international development.",
  },
  {
    icon: <FaUserGraduate />,
    title: "Education",
    description:
      "Train to become an inspiring educator with 21st-century teaching methodologies.",
  },
  {
    icon: <FaHeartbeat />,
    title: "Health Sciences",
    description:
      "Study healthcare innovation, nursing, and clinical science with professional guidance.",
  },
];

function Programs() {
  return (
    <div className="programs-page">
      <Navbar />

      <header className="programs-header-section">
        <div className="overlay">
          <h1>Our Academic Programs</h1>
          <p>
            Explore a range of programs designed to empower future leaders and
            innovators.
          </p>
        </div>
      </header>

      <section className="programs-grid-section">
        <div className="programs-grid">
          {programs.map((program, index) => (
            <div className="program-card" key={index}>
              <div className="program-icon">{program.icon}</div>
              <h3>{program.title}</h3>
              <p>{program.description}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Programs;
