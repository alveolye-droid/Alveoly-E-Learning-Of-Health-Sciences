import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { FaLock, FaClock } from "react-icons/fa";
import "./StudentCourses.css";

const StudentCourses = () => {
  const { user, SERVER_URL } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, forceTick] = useState(0);

  // ---------------------------------
  // FORCE COUNTDOWN UPDATE (EVERY MIN)
  // ---------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      forceTick((t) => t + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // ---------------------------
  // FETCH STUDENT COURSES
  // ---------------------------
  const fetchCourses = async () => {
    try {
      const token = user?.token || localStorage.getItem("authToken");

      const res = await axios.get(
        `${SERVER_URL}/api/courses/student/my-courses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch your courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchCourses();
  }, [user]);

  // ---------------------------
  // PAYSTACK PAYMENT
  // ---------------------------
  const handlePayment = async (course) => {
    const loadPaystack = () =>
      new Promise((resolve) => {
        if (window.PaystackPop) return resolve(true);

        const script = document.createElement("script");
        script.src = "https://js.paystack.co/v1/inline.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

    const loaded = await loadPaystack();
    if (!loaded) return toast.error("Paystack failed to load");

    const amountInKobo = Math.round(Number(course.price) * 100);
    if (!amountInKobo) return toast.error("Invalid course price");

    const verifyPayment = async (reference) => {
      try {
        const token = user?.token || localStorage.getItem("authToken");

        await axios.post(
          `${SERVER_URL}/api/course-posts/verify-payment`,
          { reference, courseId: course._id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success("Payment successful!");
        fetchCourses();
      } catch {
        toast.error("Payment verification failed");
      }
    };

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: amountInKobo,
      currency: "GHS",
      ref: `${course._id}_${Date.now()}`,
      callback: (res) => verifyPayment(res.reference),
      onClose: () => toast.info("Payment cancelled"),
    });

    handler.openIframe();
  };

  // ---------------------------
  // COUNTDOWN FORMATTER
  // ---------------------------
  const getRemainingTime = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return "Expired";

    const mins = Math.floor(diff / 1000 / 60);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (days > 0) return `${days}d ${hrs % 24}h`;
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m`;
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="student-course-container">
      {courses.map((course) => {
        const unlocked =
          !course.isPaid || course.unlocked === true;

        return (
          <div key={course._id} className="course-card">
            {/* HEADER */}
            <div className="course-header">
              <h2 className="course-title">{course.title}</h2>
              <span className="course-category">
                {course.adminCourse?.programName} •{" "}
                {course.adminCourse?.className}
              </span>
            </div>

            {/* TIMER */}
            {course.unlocked && course.accessExpiresAt && (
              <div className="access-timer">
                <FaClock />
                <span>
                  Access expires in{" "}
                  {getRemainingTime(course.accessExpiresAt)}
                </span>
              </div>
            )}

            {/* CONTENT */}
            <div className="course-content">
              {course.contents?.map((c, idx) => {
                const locked = c.isPaid && !unlocked;

                return (
                  <div key={idx} className="content-wrapper">
                    <div
                      className={`content-item ${
                        locked ? "blurred" : ""
                      }`}
                    >
                      {c.type === "text" && <p>{c.data}</p>}

                      {c.type === "image" && (
                        <img
                          src={c.data}
                          alt={c.title}
                          loading="lazy"
                        />
                      )}

                      {c.type === "video" && (
                        <video src={c.data} controls={!locked} />
                      )}

                      {c.type === "audio" && (
                        <audio src={c.data} controls={!locked} />
                      )}
                    </div>

                    {/* LOCKED STATE */}
                    {locked && (
                      <div className="unlock-box">
                        <FaLock />
                        <span>This content is locked</span>

                        {course.isPaid && (
                          <button
                            onClick={() => handlePayment(course)}
                          >
                            Unlock for GHS {course.price}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* FOOTER */}
            <div className="course-footer">
              {course.isPaid ? `Paid • GHS ${course.price}` : "Free"}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StudentCourses;
