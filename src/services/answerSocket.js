import { io } from "socket.io-client";

const WS_URL = import.meta.env.VITE_ANSWERBOT_WS_URL || "http://localhost:5000";

const socket = io(`${WS_URL}/answerbot`, {
  transports: ["websocket"],
  autoConnect: true,
  withCredentials: true,
});

// Identify user (student or admin)
export function identifyUser(userId, userName = "Anonymous", role = "student") {
  socket.emit("identify_user", { userId, userName, role });
}

// Listen for unanswered questions (admin)
export function onUnansweredQuestion(cb) {
  socket.on("unanswered_question", cb);
}

// Listen for QA library updates (admin)
export function onQaUpdated(cb) {
  socket.on("qa_updated", cb);
}

// Admin sends answer to a student
export function sendAdminAnswer({ toSocketId, answer }) {
  socket.emit("admin_answer", { toSocketId, answer });
}

// Refresh cache (admin)
export function refreshAnswerBotCache() {
  socket.emit("refresh_cache");
}

export default socket;
