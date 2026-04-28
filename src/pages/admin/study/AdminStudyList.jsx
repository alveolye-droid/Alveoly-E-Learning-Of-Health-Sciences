import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./AdminStudyList.css";

const AdminStudyList = () => {
  const { user, SERVER_URL } = useContext(AuthContext);
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token =
    user?.token ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("token");

  /* =====================================================
     LOAD ADMIN ARTICLES
  ===================================================== */
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get(
          `${SERVER_URL}/api/study/admin`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setArticles(res.data || []);
      } catch (err) {
        console.error("FETCH ERROR:", err);
        setError("Failed to load study articles");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [SERVER_URL, token]);

  /* =====================================================
     PUBLISH ARTICLE
  ===================================================== */
  const publishArticle = async (id) => {
    try {
      await axios.put(
        `${SERVER_URL}/api/study/publish/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setArticles((prev) =>
        prev.map((a) =>
          a._id === id ? { ...a, status: "published" } : a
        )
      );
    } catch (err) {
      console.error("PUBLISH ERROR:", err);
      alert("Failed to publish article");
    }
  };

  /* =====================================================
     DELETE ARTICLE
  ===================================================== */
  const deleteArticle = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?"))
      return;

    try {
      await axios.delete(
        `${SERVER_URL}/api/study/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setArticles((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error("DELETE ERROR:", err);
      alert("Failed to delete article");
    }
  };

  if (loading) return <p>Loading study articles...</p>;
  if (error) return <p className="error-msg">{error}</p>;

  /* =====================================================
     UI
  ===================================================== */
  return (
    <div className="admin-study-container">
      <div className="admin-study-header">
        <h2>Study Articles</h2>
        <button
          className="primary"
          onClick={() => navigate("/admin/study/create")}
        >
          + New Article
        </button>
      </div>

      {articles.length === 0 ? (
        <p>No study articles created yet.</p>
      ) : (
        articles.map((a) => (
          <div key={a._id} className="admin-article-row">
            <div className="article-info">
              <strong>{a.title}</strong>
              <p className="meta">
                {a.category} •{" "}
                {new Date(a.createdAt).toLocaleDateString()}
              </p>
            </div>

            <span className={`status-badge ${a.status}`}>
              {a.status.toUpperCase()}
            </span>

            <div className="actions">
              <button
                onClick={() =>
                  navigate(`/admin/study/edit/${a._id}`)
                }
              >
                Edit
              </button>

              {a.status === "draft" && (
                <button
                  className="success"
                  onClick={() => publishArticle(a._id)}
                >
                  Publish
                </button>
              )}

              <button
                className="danger"
                onClick={() => deleteArticle(a._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminStudyList;
