import React, { useEffect, useState, useRef } from "react";
import socket, { identifyUser } from "../services/answerSocket";
import "./AnswerBot.css";

export default function AnswerBot({ userId, userName = "Student" }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const listRef = useRef(null);

  // Socket setup
  useEffect(() => {
    if (userId) identifyUser(userId, userName, "student");

    socket.on("bot_reply", (payload) => {
      setMessages((prev) => [...prev, { sender: "bot", ...payload }]);
    });

    socket.on("connect_error", (err) => {
      console.error("AnswerBot socket connect_error:", err);
    });

    return () => {
      socket.off("bot_reply");
      socket.off("connect_error");
    };
  }, [userId]);

  // Auto scroll
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const send = () => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text }]);
    socket.emit("user_question", { text, userName });
    setText("");
  };

  return (
    <>
      <div className="answerbot-icon" onClick={() => setOpen(true)}>💬</div>
      {open && (
        <div className="answerbot-window">
          <div className="answerbot-header">
            <span>Alveoly Virtual Assistant</span>
            <button className="close-btn-chat" onClick={() => setOpen(false)}>✖</button>
          </div>

          <div className="answerbot-messages" ref={listRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`msg-row ${msg.sender}`}>
                <div className="msg-bubble">{msg.text}</div>
              </div>
            ))}
          </div>

          <div className="answerbot-input">
            <input
              type="text"
              placeholder="Type your question..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button onClick={send}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
