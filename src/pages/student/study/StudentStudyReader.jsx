import React, {
  useEffect,
  useState,
  useContext,
  useRef,
} from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import StudentStudyLayout from "./StudentStudyLayout";
import "./StudyReader.css";

const StudentStudyReader = () => {
  const { slug } = useParams();
  const { user, SERVER_URL } = useContext(AuthContext);

  const [article, setArticle] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [loading, setLoading] = useState(true);

  const sectionRefs = useRef([]);

  const token =
    user?.token ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("token");

  useEffect(() => {
    const loadArticle = async () => {
      const res = await axios.get(
        `${SERVER_URL}/api/study/student/${slug}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setArticle(res.data);
      setLoading(false);
    };
    loadArticle();
  }, [slug, SERVER_URL, token]);

  useEffect(() => {
    const onScroll = () => {
      sectionRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) {
          setActiveSection(idx);
        }
      });
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loading) return <p>Loading article...</p>;
  if (!article) return null;

  return (
    <StudentStudyLayout
      sidebar={
        <div className="sidebar-box">
          <h4>Contents</h4>
          <ul className="toc-list">
            {article.sections.map((s, i) => (
              <li
                key={i}
                className={activeSection === i ? "active" : ""}
                onClick={() =>
                  sectionRefs.current[i]?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
              >
                {s.heading}
              </li>
            ))}
          </ul>
        </div>
      }
    >
      <article className="study-reader">
        <header className="reader-header">
          <h1>{article.title}</h1>
          <p className="reader-category">
            {article.category}
          </p>
          <button onClick={() => window.print()}>
            Print / PDF
          </button>
        </header>

        {article.sections.map((section, i) => (
          <section
            key={i}
            ref={(el) => (sectionRefs.current[i] = el)}
            className="reader-section"
          >
            <h2>{section.heading}</h2>

            <div
              className="reader-content"
              dangerouslySetInnerHTML={{
                __html: section.content,
              }}
            />

            {section.quiz?.question && (
              <div className="reader-quiz">
                <strong>{section.quiz.question}</strong>
                {section.quiz.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      alert(
                        idx === section.quiz.answer
                          ? "Correct"
                          : "Incorrect"
                      )
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </section>
        ))}
      </article>
    </StudentStudyLayout>
  );
};

export default StudentStudyReader;
