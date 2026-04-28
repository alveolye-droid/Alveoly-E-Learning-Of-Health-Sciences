import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { AuthContext } from "../../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import "./AdminStudyEdit.css";

/* =====================================================
   QUILL FORMATS
===================================================== */
const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "blockquote",
  "code-block",
  "link",
  "image",
  "video",
];

const AdminStudyEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, SERVER_URL } = useContext(AuthContext);

  /* =====================================================
     REFS (STORE QUILL INSTANCES BY SECTION ID)
  ===================================================== */
  const quillRefs = useRef({});

  /* =====================================================
     STATE
  ===================================================== */
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const token =
    user?.token ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("token");

  /* =====================================================
     IMAGE UPLOAD HANDLER (SAFE)
  ===================================================== */
  const handleImageUpload = (sectionId) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post(
          `${SERVER_URL}/api/uploads`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const quill = quillRefs.current[sectionId];
        if (!quill) return;

        const range = quill.getSelection(true);
        const index = range ? range.index : quill.getLength();

        quill.insertEmbed(index, "image", res.data.url);
        quill.setSelection(index + 1);
      } catch (err) {
        console.error("IMAGE UPLOAD ERROR:", err);
        alert("❌ Image upload failed");
      }
    };
  };

  /* =====================================================
     QUILL MODULES (NO HOOKS HERE)
  ===================================================== */
  const getQuillModules = (sectionId) => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "code-block"],
        ["link", "image", "video"],
        ["clean"],
      ],
      handlers: {
        image: () => handleImageUpload(sectionId),
      },
    },
  });

  /* =====================================================
     LOAD ARTICLE
  ===================================================== */
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await axios.get(
          `${SERVER_URL}/api/study/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTitle(res.data.title || "");
        setCategory(res.data.category || "");
        setSections(
          (res.data.sections || []).map((s) => ({
            id: crypto.randomUUID(), // ✅ STABLE KEY
            heading: s.heading || "",
            content: s.content || "",
            quiz: s.quiz || {},
          }))
        );
      } catch (err) {
        console.error("LOAD ERROR:", err);
        setMessage("❌ Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, SERVER_URL, token]);

  /* =====================================================
     SECTION HELPERS (ID-BASED)
  ===================================================== */
  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        heading: "",
        content: "",
        quiz: {},
      },
    ]);
  };

  const updateSection = (id, field, value) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      )
    );
  };

  const updateQuiz = (id, field, value) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              quiz: { ...(s.quiz || {}), [field]: value },
            }
          : s
      )
    );
  };

  const removeSection = (id) => {
    if (!window.confirm("Remove this section?")) return;
    setSections((prev) => prev.filter((s) => s.id !== id));
    delete quillRefs.current[id];
  };

  /* =====================================================
     SAVE CHANGES
  ===================================================== */
  const saveChanges = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    if (!title.trim()) {
      setMessage("❌ Title is required");
      setSaving(false);
      return;
    }

    if (
      !sections.length ||
      sections.some((s) => !s.heading || !s.content)
    ) {
      setMessage("❌ Every section must have heading and content");
      setSaving(false);
      return;
    }

    try {
      await axios.put(
        `${SERVER_URL}/api/study/${id}`,
        {
          title,
          category,
          sections: sections.map((s) => ({
            heading: s.heading,
            content: s.content,
            quiz: s.quiz?.question
              ? {
                  question: s.quiz.question,
                  options: s.quiz.options || [],
                  answer: s.quiz.answer,
                }
              : undefined,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/admin/study");
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      setMessage("❌ Failed to update article");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading article...</p>;

  /* =====================================================
     UI
  ===================================================== */
  return (
    <div className="admin-study-container">
      <h2>Edit Study Article</h2>

      {message && <p className="status-msg">{message}</p>}

      <form onSubmit={saveChanges} className="admin-study-form">
        <label>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Category</label>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <h3>Sections</h3>

        {sections.map((s) => (
          <div key={s.id} className="section-box">
            <div className="section-header">
              <input
                placeholder="Section heading"
                value={s.heading}
                onChange={(e) =>
                  updateSection(s.id, "heading", e.target.value)
                }
              />

              <button
                type="button"
                className="danger"
                onClick={() => removeSection(s.id)}
              >
                ✕
              </button>
            </div>

            <ReactQuill
              theme="snow"
              value={s.content}
              onChange={(v) =>
                updateSection(s.id, "content", v)
              }
              modules={getQuillModules(s.id)}
              formats={quillFormats}
              ref={(el) => {
                if (el)
                  quillRefs.current[s.id] =
                    el.getEditor();
              }}
            />

            <h4>Quiz (optional)</h4>

            <input
              placeholder="Question"
              value={s.quiz.question || ""}
              onChange={(e) =>
                updateQuiz(s.id, "question", e.target.value)
              }
            />

            {[0, 1, 2, 3].map((n) => (
              <input
                key={n}
                placeholder={`Option ${n + 1}`}
                value={s.quiz.options?.[n] || ""}
                onChange={(e) => {
                  const opts = [...(s.quiz.options || [])];
                  opts[n] = e.target.value;
                  updateQuiz(s.id, "options", opts);
                }}
              />
            ))}

            <input
              type="number"
              min="0"
              max="3"
              placeholder="Correct option index (0–3)"
              value={s.quiz.answer ?? ""}
              onChange={(e) =>
                updateQuiz(
                  s.id,
                  "answer",
                  Number(e.target.value)
                )
              }
            />
          </div>
        ))}

        <button type="button" onClick={addSection}>
          + Add Section
        </button>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Update Article"}
        </button>
      </form>
    </div>
  );
};

export default AdminStudyEdit;
