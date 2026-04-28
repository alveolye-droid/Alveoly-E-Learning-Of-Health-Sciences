import React, { useState, useEffect, useRef, useContext } from "react";
import {
  FaStethoscope,
  FaSearch,
  FaBars,
  FaTimes,
  FaClipboardList,
  FaBookMedical,
  FaGraduationCap,
  FaBriefcaseMedical,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import "./StudyLayout.css";
import PostExam from "./PostExam";

/* ================= ICON MAP ================= */
const ICONS = {
  FaClipboardList: <FaClipboardList />,
  FaBookMedical: <FaBookMedical />,
  FaGraduationCap: <FaGraduationCap />,
  FaBriefcaseMedical: <FaBriefcaseMedical />,
  FaStethoscope: <FaStethoscope />,
};

const StudentStudyList = () => {
  const { SERVER_URL } = useContext(AuthContext);

  const [layout, setLayout] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  /* 🔍 SEARCH STATES (ADDED) */
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchBoxRef = useRef(null);
  const searchInputRef = useRef(null);

  /* ================= FETCH ADMIN LAYOUT ================= */
  useEffect(() => {
    if (!SERVER_URL) return;

    const fetchLayout = async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/api/study/layout`);
        setLayout(res.data || {});
      } catch (err) {
        console.error("Failed to fetch study layout:", err);
        setLayout({});
      }
    };

    fetchLayout();
  }, [SERVER_URL]);

  /* ================= SEARCH API CALL (ADDED) ================= */
  const handleSearch = async (value) => {
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `${SERVER_URL}/api/study/search?q=${value}`
      );
      setResults(res.data || []);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEARCH HANDLERS ================= */
  useEffect(() => {
    if (!searchOpen) return;

    const handleClickOutside = (e) => {
      if (!searchBoxRef.current?.contains(e.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    searchInputRef.current?.focus();

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && setSearchOpen(false);
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  if (!layout) return null;

  /* ================= HELPERS ================= */
  const resolveImage = (img) => {
    if (!img) return null;

    if (typeof img === "object" && typeof img.url === "string") {
      return img.url.startsWith("http")
        ? img.url
        : `${SERVER_URL}/${img.url}`;
    }

    if (typeof img === "string") {
      return img.startsWith("http")
        ? img
        : `${SERVER_URL}/${img}`;
    }

    return null;
  };

  /* ================= RENDER ================= */
  return (
    <div className="nl-shell">
      {/* ================= HEADER ================= */}
      <header className="nl-header">
        <div className="nl-header-inner">
          <div className="nl-logo">
            <FaStethoscope className="logo-icon" />
            <span>{layout?.logo?.text || "Alveoly"}</span>
          </div>

          {/* ================= NAV ================= */}
          <nav className={`nl-nav ${menuOpen ? "open" : ""}`}>
            {Array.isArray(layout?.nav) &&
              layout.nav.map((item, i) => (
                <Link
                  key={i}
                  to={`/study/${item.slug || ""}`}
                  className="nl-nav-item"
                  onClick={() => setMenuOpen(false)}
                >
                  {ICONS[item.icon] || null}
                  <span>{item.title}</span>
                </Link>
              ))}
          </nav>

          {/* ================= ACTIONS ================= */}
          <div className="nl-actions">
            <button
              className="nl-search-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <FaSearch />
            </button>
            <button
              className="nl-menu-btn"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
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
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={layout?.hero?.searchPlaceholder || "Search..."}
            />

            {/* 🔍 SEARCH RESULTS */}
            {query && (
              <div className="nl-search-results">
                {loading && <p>Searching...</p>}

                {!loading && results.length === 0 && (
                  <p>No results found</p>
                )}

                {results.map((item, i) => (
                  <Link
                    key={i}
                    to={`/study/${item.slug}`}
                    className="nl-search-result"
                    onClick={() => {
                      setSearchOpen(false);
                      setQuery("");
                      setResults([]);
                    }}
                  >
                    {resolveImage(item.image) && (
                      <img
                        src={resolveImage(item.image)}
                        alt={item.title}
                      />
                    )}
                    <div>
                      <span className="type">{item.type}</span>
                      <h4>{item.title}</h4>
                      {item.tag && <small>{item.tag}</small>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= HERO ================= */}
      <section className="nl-hero">
        <div className="nl-hero-content">
          <h1>{layout?.hero?.title || "Welcome to Alveoly"}</h1>
          <p>{layout?.hero?.subtitle || ""}</p>
          <div className="nl-search-box">
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={layout?.hero?.searchPlaceholder || "Search..."}
            />
            <button>
              <FaSearch /> Search
            </button>
          </div>
        </div>
      </section>
      
      {/* ================= FEATURED ================= */}
      {Array.isArray(layout?.featured) && layout.featured.length > 0 && (
        <section className="nl-featured-wrap">
          <div className="nl-featured-container">
            <div
              className="nl-featured-grid"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {layout.featured.map((item, i) => (
                <Link
                  key={i}
                  to={`/study/${item.slug || ""}`}
                  className="nl-feature-item"
                >
                  <div className={`nl-feature-image ${item.color || ""}`}>
                    {item.badge && <span className="badge">{item.badge}</span>}
                    {resolveImage(item.image) ? (
                      <img src={resolveImage(item.image)} alt={item.title} />
                    ) : (
                      <div className="nl-feature-placeholder">No Image</div>
                    )}
                    <h3>{item.title}</h3>
                  </div>
                  <div className="nl-feature-text">
                    <span>{item.meta || ""}</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="nl-dots">
              {layout.featured.map((_, i) => (
                <span
                  key={i}
                  className={i === activeSlide ? "active" : ""}
                  onClick={() => setActiveSlide(i)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= SECTIONS ================= */}
      {Array.isArray(layout?.sections) &&
        layout.sections.map((sec, i) => (
          <section className="nl-careplans-wrap" key={i}>
            <div className="nl-careplans-container">
              <div className="nl-careplans-header">
                <h2>{sec.title}</h2>
                {sec.viewAllSlug && (
                  <Link to={`/study/${sec.viewAllSlug}`}>View all →</Link>
                )}
              </div>

              <div className="nl-careplans-grid">
                {sec.items?.map((item, j) => (
                  <Link
                    key={j}
                    to={`/study/${item.slug || ""}`}
                    className="nl-careplans-card"
                  >
                    {resolveImage(item.image) ? (
                      <img src={resolveImage(item.image)} alt={item.title} />
                    ) : (
                      <div className="nl-item-placeholder">No Image</div>
                    )}
                    <p>{item.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ))}

      {/* ================= LATEST + EDITOR PICKS ================= */}
      <section className="nl-latest-wrap">
        <div className="nl-latest-container">
          <div className="nl-latest-main">
            <h2>Latest Posts</h2>
            {layout?.latestPosts?.map((post, i) => (
               <div key={i}>
              <Link key={i} to={`/study/${post.slug}`} className="nl-latest-post">
                {resolveImage(post.image) ? (
                  <img src={resolveImage(post.image)} alt={post.title} />
                ) : (
                  <div className="nl-post-placeholder">No Image</div>
                )}
                <div className="nl-latest-content">
                  <span>{post.tag}</span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </div>
              </Link>
               {/* 🔥 EXAM */}
    <PostExam exam={post.exam} />
    </div>
            ))}
          </div>

          <aside className="nl-latest-sidebar">
            <h3>Editor’s Picks</h3>
            {layout?.editorPicks?.map((item, i) => (
              <Link key={i} to={`/study/${item.slug}`} className="nl-sidebar-item">
                {resolveImage(item.image) ? (
                  <img src={resolveImage(item.image)} alt={item.title} />
                ) : (
                  <div className="nl-editor-placeholder">No Image</div>
                )}
                <span>{item.title}</span>
              </Link>
            ))}
          </aside>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="nl-footer">
        <div className="nl-footer-top">
          <div className="nl-footer-container">
            <div className="nl-footer-brand">
              <FaStethoscope />
              <p>{layout?.footer?.about}</p>
            </div>
            <div className="nl-footer-links">
              {layout?.footer?.links?.map((l, i) => (
                <Link key={i} to={`/${l.slug}`}>
                  {l.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="nl-footer-bottom">
          <span>© {new Date().getFullYear()} Alveoly</span>
          <span>{layout?.footer?.quote}</span>
        </div>
      </footer>
    </div>
  );
};

export default StudentStudyList;
