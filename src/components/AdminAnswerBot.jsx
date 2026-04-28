import React, { useEffect, useState } from "react";
import axios from "axios";
import socket, {
  onUnansweredQuestion,
  onQaUpdated,
  sendAdminAnswer,
  refreshAnswerBotCache,
} from "../services/answerSocket";
import "./AdminAnswerBot.css";

const API = import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:5000";

export default function AdminAnswerBot() {
  const [open, setOpen] = useState(false);
  const [qaList, setQaList] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [qText, setQText] = useState("");
  const [aText, setAText] = useState("");
  const [tab, setTab] = useState("incoming");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    // Identify admin
    socket.emit("identify_user", { role: "admin" });

    fetchList();
    onUnansweredQuestion((q) => setIncoming((prev) => [q, ...prev]));
    onQaUpdated(fetchList);

    return () => {
      socket.off("unanswered_question");
      socket.off("qa_updated");
    };
  }, []);

  async function fetchList() {
    try {
      const res = await axios.get(`${API}/api/admin/qa/list`);
      if (res.data?.ok) setQaList(res.data.list);
    } catch (err) {
      console.error(err);
    }
  }

  async function saveQa() {
    if (!qText.trim() || !aText.trim()) return alert("Fill both fields");
    try {
      if (editId) {
        await axios.put(`${API}/api/admin/qa/update/${editId}`, { question: qText, answer: aText });
        setEditId(null);
      } else {
        await axios.post(`${API}/api/admin/qa/add`, { question: qText, answer: aText });
      }
      setQText("");
      setAText("");
      fetchList();
      refreshAnswerBotCache();
      alert(`Q&A ${editId ? "updated" : "added"} successfully`);
    } catch (err) {
      console.error(err);
      alert("Failed to save Q&A");
    }
  }

  async function deleteQa(id) {
    if (!window.confirm("Are you sure you want to delete this Q&A?")) return;
    try {
      await axios.delete(`${API}/api/admin/qa/delete/${id}`);
      fetchList();
      refreshAnswerBotCache();
    } catch (err) {
      console.error(err);
      alert("Failed to delete Q&A");
    }
  }

  function replyTo(socketId, text) {
    if (!text || !socketId) return;
    sendAdminAnswer({ toSocketId: socketId, answer: text });
    setIncoming((prev) => prev.filter((x) => x.socketId !== socketId));
  }

  function editQa(qa) {
    setQText(qa.question);
    setAText(qa.answer);
    setEditId(qa._id);
    setTab("add");
  }

  return (
    <>
      <div className="adminbot-icon" onClick={() => setOpen(true)}>⚙️</div>
      {open && (
        <div className="adminbot-window">
          <div className="adminbot-header">
            <span>Admin Answer Control</span>
            <button className="close-btn-bot" onClick={() => setOpen(false)}>✖</button>
          </div>

          <div className="adminbot-tabs">
            <button className={tab === "incoming" ? "active" : ""} onClick={() => setTab("incoming")}>Incoming</button>
            <button className={tab === "add" ? "active" : ""} onClick={() => setTab("add")}>Add Q&A</button>
            <button className={tab === "library" ? "active" : ""} onClick={() => setTab("library")}>Library</button>
          </div>

          {tab === "incoming" && (
            <div className="adminbot-body">
              {incoming.length === 0 && <div className="empty">No new questions</div>}
              {incoming.map((inc, i) => (
                <div key={i} className="incoming-card">
                  <div className="meta">
                    <strong>{inc.userName || "Anonymous"}</strong>
                    <small>{new Date(inc.createdAt).toLocaleString()}</small>
                  </div>
                  <div className="text">{inc.text}</div>
                  <button
                    className="reply-btn"
                    onClick={() => {
                      const answer = window.prompt("Write answer:", "");
                      if (answer) replyTo(inc.socketId, answer);
                    }}
                  >Reply</button>
                </div>
              ))}
            </div>
          )}

          {tab === "add" && (
            <div className="adminbot-body">
              <input className="input" placeholder="Question" value={qText} onChange={(e) => setQText(e.target.value)} />
              <textarea className="textarea" placeholder="Answer" value={aText} onChange={(e) => setAText(e.target.value)} />
              <button className="save-btn" onClick={saveQa}>{editId ? "Update Q&A" : "Add Q&A"}</button>
              {editId && <button className="cancel-btn" onClick={() => { setEditId(null); setQText(""); setAText(""); }}>Cancel</button>}
            </div>
          )}

          {tab === "library" && (
            <div className="adminbot-body">
              {qaList.map((q, i) => (
                <div key={i} className="library-item">
                  <p><strong>Q:</strong> {q.question}</p>
                  <p><strong>A:</strong> {q.answer}</p>
                  <div className="actions">
                    <button className="edit-btn" onClick={() => editQa(q)}>Edit</button>
                    <button className="delete-btn" onClick={() => deleteQa(q._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
