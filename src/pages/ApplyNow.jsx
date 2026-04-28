import React, { useState, useEffect } from "react";
import "./ApplyNow.css";
import { MdClose } from "react-icons/md";

const ApplyNow = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    program: "",
    selectedCourses: [], // stores course IDs
    transcriptLink: "",
    englishProofLink: "",
    recommendationsLink: "",
    personalStatementLink: "",
    message: "",
  });

  // ✅ Correct usage for Vite production env
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

  useEffect(() => {
    if (isOpen) fetchCourses();
  }, [isOpen]);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/admin/courses/public`, {
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error(`Failed to fetch courses (${res.status})`);

      const data = await res.json();
      setCourses(Array.isArray(data) ? data : data.courses || []);
    } catch (err) {
      console.error("❌ Course fetch error:", err);
      setCourses([]);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCourseSelect = (e) => {
    const selectedCourseId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      program: e.target.options[e.target.selectedIndex].text,
      selectedCourses: selectedCourseId ? [selectedCourseId] : [],
    }));
  };

  const checkIfExists = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/applications/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
        }),
      });

      const data = await res.json();

      if (res.status === 409 || data.exists) {
        alert("⚠️ You have already submitted an application!");
        return true;
      }

      if (!res.ok) {
        alert(data.message || "❌ Failed to verify your application.");
        return true;
      }

      return false;
    } catch (err) {
      console.error("Check error:", err);
      alert("❌ Could not verify application — please try again later.");
      return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (await checkIfExists()) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${SERVER_URL}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "❌ Submission failed.");
        return;
      }

      alert("🎉 Application submitted successfully!");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        program: "",
        selectedCourses: [],
        transcriptLink: "",
        englishProofLink: "",
        recommendationsLink: "",
        personalStatementLink: "",
        message: "",
      });
      onClose();
    } catch (err) {
      console.error("❌ Form submission failed:", err);
      alert("❌ Unable to submit your application. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apply-overlay">
      <div className="apply-modal">
        <div className="apply-modal-content">
          <button className="close-btn" onClick={onClose}>
            <MdClose />
          </button>

          <h2>Apply Alveoly E-Learning Academy Of Health & Sciences</h2>
          <p>Start your academic journey by completing this form.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Program of Interest</label>
              <select
                name="program"
                value={formData.selectedCourses[0] || ""}
                onChange={handleCourseSelect}
                required
              >
                <option value="">Select a program</option>
                {courses.length === 0 && <option disabled>No courses available</option>}
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.programName} ({course.className})
                  </option>
                ))}
              </select>
            </div>

            <div className="requirements-section">
              <h3>Supporting Documents (Optional)</h3>
              <ul>
                <li>✔ High school certificate (if available)</li>
                <li>✔ Proof of English proficiency (if applicable)</li>
                <li>✔ Two recommendation letters(optional)</li>
                <li>✔ Personal statement (optional)</li>
              </ul>
            </div>

           <div className="form-group">
  <label>Transcript (Google Drive link) <span>(optional)</span></label>
  <input
    type="url"
    name="transcriptLink"
    value={formData.transcriptLink}
    onChange={handleChange}
    placeholder="https://drive.google.com/..."
  />
</div>

<div className="form-group">
              <label>Proof of English Proficiency <span>(optional)</span></label>
              <input
                type="url"
                name="englishProofLink"
                value={formData.englishProofLink}
                onChange={handleChange}
                placeholder="https://drive.google.com/..."
              />
            </div>

<div className="form-group">
  <label>Recommendation Letters <span>(optional)</span></label>
  <input
    type="url"
    name="recommendationsLink"
    value={formData.recommendationsLink}
    onChange={handleChange}
    placeholder="https://drive.google.com/..."
  />
</div>

<div className="form-group">
  <label>Personal Statement <span>(optional)</span></label>
  <input
    type="url"
    name="personalStatementLink"
    value={formData.personalStatementLink}
    onChange={handleChange}
    placeholder="https://drive.google.com/..."
  />
</div>


            <div className="form-group">
              <label>How did you hear about us? (optional)</label> 
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                placeholder="Any extra info you'd like to add..."
              ></textarea>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyNow;
