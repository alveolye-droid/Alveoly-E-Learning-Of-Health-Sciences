import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import { FaTrash, FaPlus } from "react-icons/fa";
import "./AdminStudyCreate.css";
import {
  FaClipboardList,
  FaBookMedical,
  FaGraduationCap,
  FaBriefcaseMedical,
  FaStethoscope,
  FaHeartbeat,
  FaNotesMedical,
  FaHospital,
  FaUserMd,
} from "react-icons/fa";

export const ICON_OPTIONS = {
  FaClipboardList,
  FaBookMedical,
  FaGraduationCap,
  FaBriefcaseMedical,
  FaStethoscope,
  FaHeartbeat,
  FaNotesMedical,
  FaHospital,
  FaUserMd,
};

/* ================= IMAGE MODEL ================= */
const EMPTY_IMAGE = {
  file: null,
  preview: "",
  url: "",
  publicId: "",
};

/* ================= NAV MODEL ================= */
const EMPTY_NAV_ITEM = {
  title: "",
  icon: "FaClipboardList",
  type: "simple", // or "mega"
  order: 0,
  columns: [],
  cta: {
    title: "",
    desc: "",
    slug: "",
  },
};


/* ================= DEFAULTS ================= */
const EMPTY_LAYOUT = {
  logo: { text: "" },
  hero: { title: "", subtitle: "", searchPlaceholder: "" },
  nav: [],
  featured: [],
  sections: [],
  latestPosts: [],
  editorPicks: [],
  footer: { about: "", links: [], quote: "" },
};

const EMPTY_FEATURED = {
  title: "",
  badge: "",
  meta: "",
  slug: "",
  color: "",
  image: { ...EMPTY_IMAGE },
};

const EMPTY_SECTION = {
  title: "",
  viewAllSlug: "",
  items: [],
};

const EMPTY_SECTION_ITEM = {
  title: "",
  slug: "",
  image: { ...EMPTY_IMAGE },
};

const EMPTY_EXAM_QUESTION = {
  question: "",
  options: ["", ""],
  correctAnswer: "",
  rationale: "",
};

const EMPTY_EXAM = {
  title: "Post Exam",
  shuffle: true,
  questions: [],
};


const EMPTY_POST = {
  title: "",
  slug: "",
  excerpt: "",
  tag: "",
  image: { ...EMPTY_IMAGE },
  exam: null, // 🔥 NEW
};


const EMPTY_EDITOR_PICK = {
  title: "",
  slug: "",
  image: { ...EMPTY_IMAGE },
};

/* ================= COMPONENT ================= */
const AdminStudyCreate = () => {
  const { user, SERVER_URL } = useContext(AuthContext);
  const token =
    user?.token ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("token");

  const [layout, setLayout] = useState(EMPTY_LAYOUT);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!SERVER_URL) return;

    axios.get(`${SERVER_URL}/api/study/layout`).then((res) => {
      const normalizeImage = (img) =>
        img?.url
          ? { ...EMPTY_IMAGE, url: img.url, publicId: img.publicId }
          : { ...EMPTY_IMAGE };

      const d = res.data || {};

      setLayout({
        ...EMPTY_LAYOUT,
        ...d,
        nav: d.nav || [],
        featured:
          d.featured?.map((f) => ({
            ...f,
            image: normalizeImage(f.image),
          })) || [],
        sections:
          d.sections?.map((s) => ({
            ...s,
            items:
              s.items?.map((i) => ({
                ...i,
                image: normalizeImage(i.image),
              })) || [],
          })) || [],
       latestPosts:
  d.latestPosts?.map((p) => ({
    ...p,
    image: normalizeImage(p.image),
    exam: p.exam
      ? {
          ...p.exam,
          questions: p.exam.questions || [],
        }
      : null,
  })) || [],
      });
    });
  }, [SERVER_URL]);

  /* ================= IMAGE HANDLER ================= */
  const handleImage = (cb) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    cb({
      file,
      preview: URL.createObjectURL(file),
      url: "",
      publicId: "",
    });
  };

  /* ================= SAVE ================= */
  const saveLayout = async () => {
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      const data = JSON.parse(JSON.stringify(layout));

      layout.featured.forEach((f, i) => {
        data.featured[i].image = { url: f.image.url || "", publicId: "" };
        if (f.image.file) formData.append(`featured_${i}`, f.image.file);
      });

      layout.sections.forEach((s, si) =>
        s.items.forEach((it, ii) => {
          data.sections[si].items[ii].image = {
            url: it.image.url || "",
            publicId: "",
          };
          if (it.image.file)
            formData.append(`section_${si}_item_${ii}`, it.image.file);
        })
      );

      layout.latestPosts.forEach((p, i) => {
        data.latestPosts[i].image = { url: p.image.url || "", publicId: "" };
        if (p.image.file) formData.append(`latest_${i}`, p.image.file);
      });

      layout.editorPicks.forEach((p, i) => {
        data.editorPicks[i].image = { url: p.image.url || "", publicId: "" };
        if (p.image.file) formData.append(`editor_${i}`, p.image.file);
      });

      formData.append("data", JSON.stringify(data));

      await axios.post(`${SERVER_URL}/api/admin/study/layout`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("✅ Layout saved successfully");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to save layout");
    } finally {
      setLoading(false);
    }
  };

  /* ================= HELPERS ================= */
  const updateLayout = (key, value) =>
    setLayout((prev) => ({ ...prev, [key]: value }));

const addSection = () => {
  setLayout((prev) => ({
    ...prev,
    sections: [...prev.sections, { ...EMPTY_SECTION }],
  }));
};

const removeSection = (index) => {
  setLayout((prev) => ({
    ...prev,
    sections: prev.sections.filter((_, i) => i !== index),
  }));
};

const updateSection = (index, key, value) => {
  setLayout((prev) => {
    const sections = [...prev.sections];
    sections[index] = { ...sections[index], [key]: value };
    return { ...prev, sections };
  });
};

const addSectionItem = (sectionIndex) => {
  setLayout((prev) => {
    const sections = prev.sections.map((s, i) =>
      i === sectionIndex
        ? { ...s, items: [...s.items, { ...EMPTY_SECTION_ITEM }] }
        : s
    );
    return { ...prev, sections };
  });
};


const updateSectionItem = (sectionIndex, itemIndex, key, value) => {
  setLayout((prev) => {
    const sections = [...prev.sections];
    const items = [...sections[sectionIndex].items];
    items[itemIndex] = { ...items[itemIndex], [key]: value };
    sections[sectionIndex].items = items;
    return { ...prev, sections };
  });
};

const removeSectionItem = (sectionIndex, itemIndex) => {
  setLayout((prev) => {
    const sections = [...prev.sections];
    sections[sectionIndex].items = sections[sectionIndex].items.filter(
      (_, i) => i !== itemIndex
    );
    return { ...prev, sections };
  });
};

const addLatestPost = () => {
  setLayout((prev) => ({
    ...prev,
    latestPosts: [...prev.latestPosts, { ...EMPTY_POST }],
  }));
};

const updateLatestPost = (index, key, value) => {
  setLayout((prev) => {
    const posts = [...prev.latestPosts];
    posts[index] = { ...posts[index], [key]: value };
    return { ...prev, latestPosts: posts };
  });
};

const removeLatestPost = (index) => {
  setLayout((prev) => ({
    ...prev,
    latestPosts: prev.latestPosts.filter((_, i) => i !== index),
  }));
};


const addEditorPick = () => {
  setLayout((prev) => ({
    ...prev,
    editorPicks: [...prev.editorPicks, { ...EMPTY_EDITOR_PICK }],
  }));
};

const updateEditorPick = (index, key, value) => {
  setLayout((prev) => {
    const picks = [...prev.editorPicks];
    picks[index] = { ...picks[index], [key]: value };
    return { ...prev, editorPicks: picks };
  });
};

const removeEditorPick = (index) => {
  setLayout((prev) => ({
    ...prev,
    editorPicks: prev.editorPicks.filter((_, i) => i !== index),
  }));
};


const addFooterLink = () => {
  setLayout((prev) => ({
    ...prev,
    footer: {
      ...prev.footer,
      links: [...prev.footer.links, { title: "", slug: "" }],
    },
  }));
};

const updateFooterLink = (index, key, value) => {
  setLayout((prev) => {
    const links = [...prev.footer.links];
    links[index] = { ...links[index], [key]: value };
    return {
      ...prev,
      footer: { ...prev.footer, links },
    };
  });
};


  /* ================= RENDER ================= */
  return (
    <div className="admin-study-container">
      <h2>Study Layout Editor</h2>
      {message && <p>{message}</p>}

      {/* LOGO */}
      <input
        placeholder="Logo text"
        value={layout.logo.text}
        onChange={(e) =>
          updateLayout("logo", { ...layout.logo, text: e.target.value })
        }
      />

      {/* HERO */}
      <input
        placeholder="Hero title"
        value={layout.hero.title}
        onChange={(e) =>
          updateLayout("hero", { ...layout.hero, title: e.target.value })
        }
      />
      <input
        placeholder="Hero subtitle"
        value={layout.hero.subtitle}
        onChange={(e) =>
          updateLayout("hero", { ...layout.hero, subtitle: e.target.value })
        }
      />
      <input
        placeholder="Search placeholder"
        value={layout.hero.searchPlaceholder}
        onChange={(e) =>
          updateLayout("hero", {
            ...layout.hero,
            searchPlaceholder: e.target.value,
          })
        }
      />

      {/* ================= NAV ================= */}
      {/* ================= NAV ================= */}
<h3>Navigation</h3>

{layout.nav.map((n, i) => (
  <div key={i} className="nav-editor">

    <input
      placeholder="Nav title"
      value={n.title}
      onChange={(e) =>
        updateLayout(
          "nav",
          layout.nav.map((x, idx) =>
            idx === i ? { ...x, title: e.target.value } : x
          )
        )
      }
    />

    {/* ICON */}
    <select
      value={n.icon}
      onChange={(e) =>
        updateLayout(
          "nav",
          layout.nav.map((x, idx) =>
            idx === i ? { ...x, icon: e.target.value } : x
          )
        )
      }
    >
      {Object.keys(ICON_OPTIONS).map((key) => (
        <option key={key} value={key}>
          {key.replace("Fa", "")}
        </option>
      ))}
    </select>

    {/* TYPE */}
    <select
      value={n.type}
      onChange={(e) =>
        updateLayout(
          "nav",
          layout.nav.map((x, idx) =>
            idx === i ? { ...x, type: e.target.value } : x
          )
        )
      }
    >
      <option value="simple">Simple</option>
      <option value="mega">Mega Menu</option>
    </select>

    {/* ORDER */}
    <input
      type="number"
      placeholder="Order"
      value={n.order}
      onChange={(e) =>
        updateLayout(
          "nav",
          layout.nav.map((x, idx) =>
            idx === i ? { ...x, order: Number(e.target.value) } : x
          )
        )
      }
    />

    {/* CTA */}
    <h4>CTA</h4>
    <input
      placeholder="CTA title"
      value={n.cta?.title || ""}
      onChange={(e) =>
        updateLayout(
          "nav",
          layout.nav.map((x, idx) =>
            idx === i
              ? { ...x, cta: { ...x.cta, title: e.target.value } }
              : x
          )
        )
      }
    />
    <input
      placeholder="CTA desc"
      value={n.cta?.desc || ""}
      onChange={(e) =>
        updateLayout(
          "nav",
          layout.nav.map((x, idx) =>
            idx === i
              ? { ...x, cta: { ...x.cta, desc: e.target.value } }
              : x
          )
        )
      }
    />
    <input
      placeholder="CTA slug"
      value={n.cta?.slug || ""}
      onChange={(e) =>
        updateLayout(
          "nav",
          layout.nav.map((x, idx) =>
            idx === i
              ? { ...x, cta: { ...x.cta, slug: e.target.value } }
              : x
          )
        )
      }
    />

    {/* COLUMNS (MEGA MENU ONLY) */}
    {n.type === "mega" && (
      <>
        <h4>Mega Columns</h4>

        {n.columns.map((col, ci) => (
          <div key={ci} className="nav-column">
            <input
              placeholder="Column heading"
              value={col.heading}
              onChange={(e) =>
                updateLayout(
                  "nav",
                  layout.nav.map((x, idx) =>
                    idx === i
                      ? {
                          ...x,
                          columns: x.columns.map((c, cidx) =>
                            cidx === ci
                              ? { ...c, heading: e.target.value }
                              : c
                          ),
                        }
                      : x
                  )
                )
              }
            />

            {col.links.map((l, li) => (
              <div key={li}>
                <input
                  placeholder="Link title"
                  value={l.title}
                  onChange={(e) =>
                    updateLayout(
                      "nav",
                      layout.nav.map((x, idx) =>
                        idx === i
                          ? {
                              ...x,
                              columns: x.columns.map((c, cidx) =>
                                cidx === ci
                                  ? {
                                      ...c,
                                      links: c.links.map((lnk, lidx) =>
                                        lidx === li
                                          ? { ...lnk, title: e.target.value }
                                          : lnk
                                      ),
                                    }
                                  : c
                              ),
                            }
                          : x
                      )
                    )
                  }
                />
                <input
                  placeholder="Link slug"
                  value={l.slug}
                  onChange={(e) =>
                    updateLayout(
                      "nav",
                      layout.nav.map((x, idx) =>
                        idx === i
                          ? {
                              ...x,
                              columns: x.columns.map((c, cidx) =>
                                cidx === ci
                                  ? {
                                      ...c,
                                      links: c.links.map((lnk, lidx) =>
                                        lidx === li
                                          ? { ...lnk, slug: e.target.value }
                                          : lnk
                                      ),
                                    }
                                  : c
                              ),
                            }
                          : x
                      )
                    )
                  }
                />
              </div>
            ))}

            <button
              onClick={() =>
                updateLayout(
                  "nav",
                  layout.nav.map((x, idx) =>
                    idx === i
                      ? {
                          ...x,
                          columns: x.columns.map((c, cidx) =>
                            cidx === ci
                              ? {
                                  ...c,
                                  links: [...c.links, { title: "", slug: "" }],
                                }
                              : c
                          ),
                        }
                      : x
                  )
                )
              }
            >
              + Add Link
            </button>
          </div>
        ))}

        <button
          onClick={() =>
            updateLayout(
              "nav",
              layout.nav.map((x, idx) =>
                idx === i
                  ? {
                      ...x,
                      columns: [
                        ...x.columns,
                        { heading: "", links: [] },
                      ],
                    }
                  : x
              )
            )
          }
        >
          + Add Column
        </button>
      </>
    )}

    <button
      onClick={() =>
        updateLayout("nav", layout.nav.filter((_, idx) => idx !== i))
      }
    >
      <FaTrash />
    </button>
  </div>
))}

<button
  onClick={() =>
    updateLayout("nav", [...layout.nav, { ...EMPTY_NAV_ITEM }])
  }
>
  <FaPlus /> Add Nav Item
</button>

      {/* FEATURED */}
      <h3>Featured</h3>
      {layout.featured.map((f, i) => (
        <div key={i}>
          <input value={f.title} placeholder="Title" onChange={(e)=>updateLayout("featured", layout.featured.map((x,idx)=>idx===i?{...x,title:e.target.value}:x))} />
          <input type="file" onChange={handleImage((img)=>updateLayout("featured", layout.featured.map((x,idx)=>idx===i?{...x,image:img}:x)))} />
          {(f.image.preview || f.image.url) && (
            <img src={f.image.preview || f.image.url} alt="" width="120" />
          )}
        </div>
      ))}
      <button onClick={() => updateLayout("featured", [...layout.featured, { ...EMPTY_FEATURED }])}>
        <FaPlus /> Add Featured
      </button>
            {/* SECTIONS */}
      <h3>Sections</h3>
      {layout.sections.map((s, i) => (
        <div key={i} className="section-editor">
          <input
            placeholder="Section title"
            value={s.title}
            onChange={(e) =>
              updateSection(i, "title", e.target.value)
            }
          />
          <input
            placeholder="View All slug"
            value={s.viewAllSlug}
            onChange={(e) =>
              updateSection(i, "viewAllSlug", e.target.value)
            }
          />
          {s.items.map((it, j) => (
            <div key={j}>
              <input
                placeholder="Item title"
                value={it.title}
                onChange={(e) =>
                  updateSectionItem(i, j, "title", e.target.value)
                }
              />
              <input
                placeholder="Item slug"
                value={it.slug}
                onChange={(e) =>
                  updateSectionItem(i, j, "slug", e.target.value)
                }
              />
              {/* IMAGE UPLOAD */}
              <input
                type="file"
                onChange={handleImage((img) =>
                  updateSectionItem(i, j, "image", img)
                )}
              />
              {(it.image.preview || it.image.url) && (
                <img
                  src={it.image.preview || it.image.url}
                  alt=""
                  width="120"
                />
              )}
              <button onClick={() => removeSectionItem(i, j)}>
                <FaTrash />
              </button>
            </div>
          ))}
          <button onClick={() => addSectionItem(i)}>+ Add Section Item</button>
          <button onClick={() => removeSection(i)}>
            <FaTrash /> Remove Section
          </button>
        </div>
      ))}
      <button onClick={addSection}>
        <FaPlus /> Add Section
      </button>

      {/* LATEST POSTS */}
     <h3>Latest Posts</h3>

{layout.latestPosts.map((p, i) => (
  <div key={i} className="latest-post-editor">

    {/* POST INFO */}
    <input
      placeholder="Title"
      value={p.title}
      onChange={(e) => updateLatestPost(i, "title", e.target.value)}
    />
    <input
      placeholder="Slug"
      value={p.slug}
      onChange={(e) => updateLatestPost(i, "slug", e.target.value)}
    />
    <input
      placeholder="Excerpt"
      value={p.excerpt}
      onChange={(e) => updateLatestPost(i, "excerpt", e.target.value)}
    />
    <input
      placeholder="Tag"
      value={p.tag}
      onChange={(e) => updateLatestPost(i, "tag", e.target.value)}
    />

    {/* IMAGE */}
    <input
      type="file"
      onChange={handleImage((img) => updateLatestPost(i, "image", img))}
    />
    {(p.image.preview || p.image.url) && (
      <img src={p.image.preview || p.image.url} width="120" />
    )}

    {/* ================= EXAM ================= */}
    <div className="exam-editor">
      <h4>Post Exam</h4>

      {!p.exam && (
        <button
          onClick={() =>
            updateLatestPost(i, "exam", { ...EMPTY_EXAM })
          }
        >
          <FaPlus /> Add Exam
        </button>
      )}

      {p.exam && (
        <>
          <input
            placeholder="Exam title"
            value={p.exam.title}
            onChange={(e) =>
              updateLatestPost(i, "exam", {
                ...p.exam,
                title: e.target.value,
              })
            }
          />

          <label>
            <input
              type="checkbox"
              checked={p.exam.shuffle}
              onChange={(e) =>
                updateLatestPost(i, "exam", {
                  ...p.exam,
                  shuffle: e.target.checked,
                })
              }
            />
            Shuffle Questions
          </label>

          {/* QUESTIONS */}
          {p.exam.questions.map((q, qi) => (
            <div key={qi} className="exam-question">
              <input
                placeholder={`Question ${qi + 1}`}
                value={q.question}
                onChange={(e) => {
                  const questions = [...p.exam.questions];
                  questions[qi].question = e.target.value;
                  updateLatestPost(i, "exam", {
                    ...p.exam,
                    questions,
                  });
                }}
              />

              {/* OPTIONS */}
              {q.options.map((opt, oi) => (
                <input
                  key={oi}
                  placeholder={`Option ${oi + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const questions = [...p.exam.questions];
                    questions[qi].options[oi] = e.target.value;
                    updateLatestPost(i, "exam", {
                      ...p.exam,
                      questions,
                    });
                  }}
                />
              ))}

              <button
                onClick={() => {
                  const questions = [...p.exam.questions];
                  questions[qi].options.push("");
                  updateLatestPost(i, "exam", {
                    ...p.exam,
                    questions,
                  });
                }}
              >
                + Add Option
              </button>

              <input
                placeholder="Correct Answer (exact text)"
                value={q.correctAnswer}
                onChange={(e) => {
                  const questions = [...p.exam.questions];
                  questions[qi].correctAnswer = e.target.value;
                  updateLatestPost(i, "exam", {
                    ...p.exam,
                    questions,
                  });
                }}
              />

              <textarea
                placeholder="Rationale / Explanation"
                value={q.rationale}
                onChange={(e) => {
                  const questions = [...p.exam.questions];
                  questions[qi].rationale = e.target.value;
                  updateLatestPost(i, "exam", {
                    ...p.exam,
                    questions,
                  });
                }}
              />

              <button
                onClick={() => {
                  const questions = p.exam.questions.filter(
                    (_, idx) => idx !== qi
                  );
                  updateLatestPost(i, "exam", {
                    ...p.exam,
                    questions,
                  });
                }}
              >
                <FaTrash /> Remove Question
              </button>
            </div>
          ))}

          {p.exam.questions.length < 50 && (
            <button
              onClick={() =>
                updateLatestPost(i, "exam", {
                  ...p.exam,
                  questions: [
                    ...p.exam.questions,
                    { ...EMPTY_EXAM_QUESTION },
                  ],
                })
              }
            >
              <FaPlus /> Add Question
            </button>
          )}

          <button
            onClick={() => updateLatestPost(i, "exam", null)}
          >
            ❌ Remove Exam
          </button>
        </>
      )}
    </div>

    <button onClick={() => removeLatestPost(i)}>
      <FaTrash /> Remove Post
    </button>
  </div>
))}

<button onClick={addLatestPost}>
  <FaPlus /> Add Latest Post
</button>


      {/* EDITOR PICKS */}
      <h3>Editor Picks</h3>
      {layout.editorPicks.map((p, i) => (
        <div key={i}>
          <input
            placeholder="Title"
            value={p.title}
            onChange={(e) => updateEditorPick(i, "title", e.target.value)}
          />
          <input
            placeholder="Slug"
            value={p.slug}
            onChange={(e) => updateEditorPick(i, "slug", e.target.value)}
          />
          {/* IMAGE UPLOAD */}
          <input
            type="file"
            onChange={handleImage((img) =>
              updateEditorPick(i, "image", img)
            )}
          />
          {(p.image.preview || p.image.url) && (
            <img
              src={p.image.preview || p.image.url}
              alt=""
              width="120"
            />
          )}
          <button onClick={() => removeEditorPick(i)}>
            <FaTrash />
          </button>
        </div>
      ))}
      <button onClick={addEditorPick}>
        <FaPlus /> Add Editor Pick
      </button>

      {/* FOOTER */}
      <h3>Footer</h3>
      <textarea
        placeholder="About"
        value={layout.footer.about}
        onChange={(e) =>
          updateLayout("footer", { ...layout.footer, about: e.target.value })
        }
      />
      <input
        placeholder="Quote"
        value={layout.footer.quote}
        onChange={(e) =>
          updateLayout("footer", { ...layout.footer, quote: e.target.value })
        }
      />
      {layout.footer.links.map((l, i) => (
        <div key={i}>
          <input
            placeholder="Title"
            value={l.title}
            onChange={(e) => updateFooterLink(i, "title", e.target.value)}
          />
          <input
            placeholder="Slug"
            value={l.slug}
            onChange={(e) => updateFooterLink(i, "slug", e.target.value)}
          />
        </div>
      ))}
      <button onClick={addFooterLink}>+ Add Footer Link</button>
      <br />
      <button onClick={saveLayout} disabled={loading}>
        {loading ? "Saving..." : "Save Layout"}
      </button>
    </div>
  );
};

export default AdminStudyCreate;
