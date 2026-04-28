// Chat.jsx
import React, { useEffect, useState, useRef, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "../context/AuthContext";
import {
  FaPaperPlane,
  FaSmile,
  FaPaperclip,
  FaMicrophone,
  FaFileUpload,
  FaVideo,
  FaImage,
  FaMoon,
  FaSun,
  FaPhoneAlt,
  FaPause,
  FaPlay,
  FaTrash,
  FaCheck,
} from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import "./Chat.css";

const SERVER_URL =
  import.meta?.env?.VITE_SERVER_URL ||
  process.env?.REACT_APP_SERVER_URL ||
  "http://localhost:5000";

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [emojiPos, setEmojiPos] = useState({ top: 0, left: 0 });
  const [attachPos, setAttachPos] = useState({ top: 0, left: 0 });
  const [theme, setTheme] = useState("dark");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeAudioIndex, setActiveAudioIndex] = useState(null);
  const [audioProgress, setAudioProgress] = useState({});

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const emojiBtnRef = useRef(null);
  const attachBtnRef = useRef(null);
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);

  const audioCtxRef = useRef(null);
  const recordingStartRef = useRef(0);
  const pausedAccumRef = useRef(0);
  const recordingIntervalRef = useRef(null);
  const playbackRef = useRef({}); // { [index]: { audioCtx, analyser, source, raf } }
  const lastAudioObjectUrlRef = useRef(null);
  const sendImmediatelyRef = useRef(false);

  // 📞 Call UI States
const [isInCall, setIsInCall] = useState(false);
const [callType, setCallType] = useState(null); // 'audio' | 'video'
const [callStatus, setCallStatus] = useState(null); // 'ringing' | 'connected' | 'ended'
const localVideoRef = useRef(null);
const remoteVideoRef = useRef(null);

  // 🔌 Socket init
  useEffect(() => {
    const newSocket = io(SERVER_URL, { transports: ["websocket"] });
    setSocket(newSocket);
    newSocket.on("connect", () => console.log("✅ Connected to chat server"));
    newSocket.on("receiveMessage", (msg) => setMessages((prev) => [...prev, msg]));
    return () => newSocket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 📜 Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const pad = (n) => n.toString().padStart(2, "0");
  const formatHMS = (sec = 0) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  // play short beep (WebAudio)
  const playBeep = (opts = { freq: 1000, duration: 0.08, gain: 0.02 }) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = opts.freq || 1000;
      g.gain.value = opts.gain || 0.02;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => {
        o.stop();
        try {
          ctx.close();
        } catch (e) {}
      }, (opts.duration || 0.08) * 1000);
    } catch (e) {
      // ignore if audio ctx blocked
    }
  };

  const drawWaveform = (analyser, canvas) => {
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || canvas.width;
    const height = canvas.clientHeight || canvas.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!analyser || !canvas) return;
      analyser.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#25d366";
      ctx.beginPath();
      const sliceWidth = (width * 1.0) / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      animationRef.current = requestAnimationFrame(draw);
    };
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    draw();
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (animationRef.current) cancelAnimationFrame(animationRef.current);

      try {
        if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
          audioCtxRef.current.close();
        }
      } catch (e) {}

      Object.values(playbackRef.current).forEach((res) => {
        try {
          if (res.raf) cancelAnimationFrame(res.raf);
          if (res.analyser) res.analyser.disconnect();
          if (res.source) res.source.disconnect();
          if (res.audioCtx && res.audioCtx.state !== "closed") res.audioCtx.close();
        } catch (e) {}
      });
      playbackRef.current = {};

      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, []);

  // -------- Recording (unchanged logic, preserved) --------
  const toggleRecording = async () => {
    if (isRecording && mediaRecorder) {
      // avoid accidental toggles while recording — use send/delete explicitly
      return;
    }
    try {
      // prepare fresh state
      setRecordedAudio(null);
      setAudioUrl(null);
      setErrorMessage("");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // play start beep
      playBeep({ freq: 950, duration: 0.06, gain: 0.03 });

      // create audio context for analyser
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextClass();
audioCtxRef.current = audioCtx;

// ✅ Ensure context resumes properly
if (audioCtx.state === "suspended") {
  await audioCtx.resume().catch((e) => console.warn("AudioContext resume failed", e));
}

// ⚠️ Some browsers need a slight delay before analyser can read data
await new Promise((r) => setTimeout(r, 150));


      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      // analyser for waveform
      const canvas = canvasRef.current;
      if (canvas) {
        try {
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 2048;
          analyserRef.current = analyser;
          source.connect(analyser);
          drawWaveform(analyser, canvas);
        } catch (err) {
          console.warn("Waveform setup failed:", err);
        }
      }

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        // stop visual
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        // disconnect analyser
        try {
          if (analyserRef.current) {
            analyserRef.current.disconnect();
            analyserRef.current = null;
          }
        } catch (e) {}

        // combine chunks
        try {
          const mimeType = audioChunks.length && audioChunks[0].type ? audioChunks[0].type : "audio/webm";
          const audioBlob = new Blob(audioChunks, { type: mimeType });

          // create base64 DataURL so it's replayable anywhere
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = reader.result;
            setAudioUrl(base64Audio);
            setRecordedAudio(audioBlob);
          };
          reader.readAsDataURL(audioBlob);

          // also keep an object URL for quick local playback (if you need)
          const objUrl = URL.createObjectURL(audioBlob);
          lastAudioObjectUrlRef.current = objUrl;

          // If user clicked ✓ while recording: send immediately
          if (sendImmediatelyRef.current) {
            sendImmediatelyRef.current = false;
            // play stop beep
            playBeep({ freq: 700, duration: 0.06, gain: 0.03 });
            const reader2 = new FileReader();
            reader2.onloadend = () => {
              const msgData = {
                sender: user?.name || "Admin",
                type: "audio",
                content: reader2.result, // base64 DataURL
                timestamp: new Date().toISOString(),
              };
              try {
                socket.emit("sendMessage", msgData);
              } catch (e) {
                console.warn("Socket emit failed:", e);
              }
              setMessages((prev) => [...prev, msgData]);
              // cleanup UI
              deleteRecording();
            };
            reader2.readAsDataURL(audioBlob);
            return;
          }

          // otherwise we keep recordedAudio & audioUrl so user can play/send/delete
          setMediaRecorder(null);
        } catch (e) {
          console.error("Failed to create audio blob:", e);
          setErrorMessage("Recording failed - please try again.");
        }

        // stop tracks and close audio context
        try {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
          }
        } catch (e) {}
        try {
          if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
            audioCtxRef.current.close();
            audioCtxRef.current = null;
          }
        } catch (e) {}

        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }

        // keep isRecording true (WhatsApp keeps the UI until user sends or deletes)
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      setShowEmojiPicker(false);
      setShowAttachmentMenu(false);
      pausedAccumRef.current = 0;
      recordingStartRef.current = Date.now();

      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = setInterval(() => {
        const elapsedMs = Date.now() - recordingStartRef.current;
        const elapsedSec = Math.floor(elapsedMs / 1000) + pausedAccumRef.current;
        setRecordingTime(elapsedSec);
      }, 250);
    } catch (err) {
      console.error("🎙️ Microphone access denied:", err);
      setErrorMessage("Please allow microphone access in your browser settings.");
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      } else {
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
          try {
            audioCtxRef.current.close();
          } catch (e) {}
          audioCtxRef.current = null;
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        setIsRecording(false);
        setMediaRecorder(null);
      }
    } catch (e) {
      console.warn("stopRecording error:", e);
    }
  };

  // DELETE/CANCEL while recording or after recording
  const deleteRecording = () => {
    try {
      // stop recorder if active
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        try {
          sendImmediatelyRef.current = false;
          mediaRecorder.stop();
        } catch (e) {}
      }

      // clear interval
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      // stop tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // cancel animation + disconnect analyser
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (analyserRef.current) {
        try {
          analyserRef.current.disconnect();
        } catch (e) {}
        analyserRef.current = null;
      }
      // clear canvas drawing
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }

      // close audio ctx
      try {
        if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
          audioCtxRef.current.close();
          audioCtxRef.current = null;
        }
      } catch (e) {}

      setRecordedAudio(null);
      setAudioUrl(null);
      setIsRecording(false);
      setRecordingTime(0);
      setMediaRecorder(null);
      pausedAccumRef.current = 0;
      recordingStartRef.current = 0;
    } catch (err) {
      console.error("🗑️ Delete recording error:", err);
    }
  };

  // SEND: if currently recording, set flag and stop (onstop will send).
  // if not recording but we have a blob, send that.
  const sendRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      // play stop beep
      playBeep({ freq: 700, duration: 0.06, gain: 0.03 });
      sendImmediatelyRef.current = true;
      try {
        mediaRecorder.stop();
      } catch (e) {
        console.warn("Failed to stop mediaRecorder for immediate send", e);
      }
      return;
    }

    if (recordedAudio) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const msgData = {
          sender: user?.name || "Admin",
          type: "audio",
          content: reader.result,
          timestamp: new Date().toISOString(),
        };
        try {
          socket.emit("sendMessage", msgData);
        } catch (e) {
          console.warn("Socket emit failed:", e);
        }
        setMessages((prev) => [...prev, msgData]);
        deleteRecording();
      };
      reader.readAsDataURL(recordedAudio);
    }
  };

  // 📨 Send text message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const msgData = {
      sender: user?.name || "Admin",
      content: message,
      type: "text",
      timestamp: new Date().toISOString(),
    };
    socket.emit("sendMessage", msgData);
    setMessages((prev) => [...prev, msgData]);
    setMessage("");
    setShowEmojiPicker(false);
  };

  const addEmoji = (emojiObject) => setMessage((prev) => prev + emojiObject.emoji);

  const handleFileUpload = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const msgData = {
        sender: user?.name || "Admin",
        type: fileType,
        content: reader.result,
        fileName: file.name,
        timestamp: new Date().toISOString(),
      };
      socket.emit("sendMessage", msgData);
      setMessages((prev) => [...prev, msgData]);
    };
    reader.readAsDataURL(file);
  };

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const handleVoiceCall = () => {
  setCallType("audio");
  setIsInCall(true);
  setCallStatus("ringing");
};

const handleVideoCall = () => {
  setCallType("video");
  setIsInCall(true);
  setCallStatus("ringing");
};

const endCall = () => {
  setCallStatus("ended");
  setTimeout(() => {
    setIsInCall(false);
    setCallType(null);
  }, 1000);
};


  const toggleEmojiPicker = () => {
    if (!emojiBtnRef.current) return;
    const rect = emojiBtnRef.current.getBoundingClientRect();
    setEmojiPos({ top: rect.top - 370, left: rect.left });
    setShowEmojiPicker((prev) => !prev);
    setShowAttachmentMenu(false);
  };

  const toggleAttachmentMenu = () => {
    if (!attachBtnRef.current) return;
    const rect = attachBtnRef.current.getBoundingClientRect();
    setAttachPos({ top: rect.top - 180, left: rect.left - 40 });
    setShowAttachmentMenu((prev) => !prev);
    setShowEmojiPicker(false);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ---------- Playback helpers ----------
 const createPlaybackResource = (audioEl) => {
  try {
    // ✅ Ensure audioEl is a real <audio> element
    if (!(audioEl instanceof HTMLMediaElement)) {
      console.warn("createPlaybackResource: invalid element", audioEl);
      return null;
    }

    // ✅ Reuse existing context if already connected
    if (audioEl._audioCtx && audioEl._sourceNode && audioEl._analyser) {
      return {
        audioCtx: audioEl._audioCtx,
        source: audioEl._sourceNode,
        analyser: audioEl._analyser,
      };
    }

    // ✅ Create a new AudioContext connection safely
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(audioEl);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;

    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    // Store references for reuse
    audioEl._audioCtx = audioCtx;
    audioEl._sourceNode = source;
    audioEl._analyser = analyser;

    return { audioCtx, source, analyser };
  } catch (err) {
    console.error("createPlaybackResource failed:", err);
    return null;
  }
};



  // const animatePlaybackWave = (index) => {
  //   const resource = playbackRef.current[index];
  //   if (!resource || !resource.analyser) return;

  //   const analyser = resource.analyser;
  //   const bufferLength = analyser.frequencyBinCount;
  //   const dataArray = new Uint8Array(bufferLength);

  //   const draw = () => {
  //     try {
  //       analyser.getByteFrequencyData(dataArray);
  //       const container = document.querySelector(`.play-wave-${index}`);
  //       if (container) {
  //         const bars = container.querySelectorAll(".bar");
  //         if (bars.length) {
  //           const step = Math.max(1, Math.floor(dataArray.length / bars.length));
  //           for (let i = 0; i < bars.length; i++) {
  //             const slice = dataArray.subarray(i * step, (i + 1) * step);
  //             let sum = 0;
  //             for (let j = 0; j < slice.length; j++) sum += slice[j];
  //             const avg = sum / slice.length;
  //             const h = 20 + (avg / 255) * 80;
  //             bars[i].style.height = `${h}%`;
  //           }
  //         }
  //       }
  //       resource.raf = requestAnimationFrame(draw);
  //     } catch (e) {
  //       // ignore
  //     }
  //   };
  //   draw();
  // };

  // 🎵 Draw waveform during playback
const startPlaybackVisual = (index) => {
  const res = playbackRef.current[index];
  if (!res || !res.analyser) return;

  const { analyser } = res;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const canvas = document.getElementById(`waveform-${index}`);
  if (!canvas) return;
  const canvasCtx = canvas.getContext("2d");

  const draw = () => {
    res.animationFrameId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = (canvas.width / bufferLength) * 1.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i] / 3;
      canvasCtx.fillStyle = "#25D366"; // WhatsApp green
      canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  };

  draw();
};

// 🎵 Stop waveform animation when audio stops
const stopPlaybackVisual = (index) => {
  const res = playbackRef.current[index];
  if (res?.animationFrameId) {
    cancelAnimationFrame(res.animationFrameId);
    res.animationFrameId = null;
  }

  const canvas = document.getElementById(`waveform-${index}`);
  if (canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
};


  // 🎧 Play/Pause for audio messages (replay-friendly)
  const handlePlayPause = async (index, url) => {
  const audioEl = document.getElementById(`audio-${index}`);
  if (!audioEl) return;

  // pause current playing audio
  if (activeAudioIndex === index) {
    audioEl.pause();
    setActiveAudioIndex(null);
    stopPlaybackVisual(index);
    return;
  }

  // stop previous one
  if (activeAudioIndex !== null && activeAudioIndex !== index) {
    const prevAudio = document.getElementById(`audio-${activeAudioIndex}`);
    if (prevAudio) prevAudio.pause();
    stopPlaybackVisual(activeAudioIndex);
  }

  // ensure previous visual cleanup
  if (playbackRef.current[index]) stopPlaybackVisual(index);

  // create and store playback resource
  const res = createPlaybackResource(audioEl);
  if (!res) return;
  playbackRef.current[index] = res;

  try {
    // resume audio context if suspended
    if (res.audioCtx.state === "suspended") await res.audioCtx.resume();
    audioEl.currentTime = 0;
  } catch (e) {
    console.warn("Resume/playback error:", e);
  }

  audioEl.play().catch((err) => console.warn("play() failed:", err));
  startPlaybackVisual(index);
  setActiveAudioIndex(index);

  // progress updates
  audioEl.ontimeupdate = () => {
    const dur = audioEl.duration || 0;
    const elapsed = audioEl.currentTime || 0;
    const percent = dur > 0 ? (elapsed / dur) * 100 : 0;
    setAudioProgress((prev) => ({
      ...prev,
      [index]: { percent, elapsed, duration: dur || prev?.[index]?.duration || 0 },
    }));
  };

  // when playback ends
  audioEl.onended = () => {
    stopPlaybackVisual(index);
    setActiveAudioIndex(null);
    setAudioProgress((prev) => ({
      ...prev,
      [index]: {
        percent: 100,
        elapsed: prev?.[index]?.duration || 0,
        duration: prev?.[index]?.duration || 0,
      },
    }));
    try {
      audioEl.currentTime = 0;
    } catch (e) {}
  };
};


  const onAudioMetadata = (index, e) => {
    const dur = e.target.duration || 0;
    setAudioProgress((prev) => ({ ...prev, [index]: { ...(prev[index] || {}), duration: dur } }));
  };

  // ---------- Render ----------
  return (
    <div className={`chat-page ${theme}`}>
      {/* Header */}
      <div className="chat-header">
        {/* 📞 Call Overlay */}
{isInCall && (
  <div className={`call-overlay ${callType} ${theme}`}>
    {callType === "video" ? (
      <>
        <video ref={remoteVideoRef} className="remote-video" autoPlay playsInline />
        <video ref={localVideoRef} className="local-video" autoPlay muted playsInline />
      </>
    ) : (
      <div className="voice-call-display">
        <img
          src="https://cdn-icons-png.flaticon.com/512/1053/1053244.png"
          alt="Caller Avatar"
          className="caller-avatar"
        />
        <h3>{user?.name || "You"} – Voice Call</h3>
        <p className="call-status">{callStatus === "ringing" ? "Calling..." : "Connected"}</p>
      </div>
    )}

    {/* Call Controls */}
    <div className="call-controls">
      {callStatus === "ringing" ? (
        <button className="answer-btn" onClick={() => setCallStatus("connected")}>Accept</button>
      ) : (
        <>
          {callType === "video" && (
            <button className="switch-camera-btn">🔄</button>
          )}
          <button className="end-call-btn" onClick={endCall}>End</button>
        </>
      )}
    </div>
  </div>
)}

        <div className="chat-header-left">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1053/1053244.png"
            alt="Admin"
            className="chat-avatar"
          />
          <div>
            <h3>Admin Chat</h3>
            <p>Online</p>
          </div>
        </div>
        <div className="chat-header-right">
          <button className="header-btn" onClick={handleVoiceCall}>
            <FaPhoneAlt />
          </button>
          <button className="header-btn" onClick={handleVideoCall}>
            <FaVideo />
          </button>
          <button className="header-btn theme-toggle" onClick={toggleTheme}>
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>
        </div>
      </div>

      {errorMessage && <div className="mic-error-message">{errorMessage}</div>}

      {/* Messages */}
      <div className="chat-body">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-message ${msg.sender === (user?.name || "Admin") ? "sent" : "received"}`}
          >
            {msg.type === "text" && <p>{msg.content}</p>}
            {msg.type === "image" && <img src={msg.content} alt="upload" className="chat-media" />}
            {msg.type === "video" && <video src={msg.content} controls className="chat-media" />}
            {msg.type === "document" && (
              <a href={msg.content} download={msg.fileName} className="chat-document">
                📄 {msg.fileName}
              </a>
            )}
            {msg.type === "audio" && (
              <div className="audio-message">
                <button onClick={() => handlePlayPause(i, msg.content)} className="icon-btn play-toggle">
                  {activeAudioIndex === i ? <FaPause /> : <FaPlay />}
                </button>

               {/* WhatsApp-style playback wave */}
<canvas
  id={`waveform-${i}`}
  className="audio-waveform"
  width="150"
  height="40"
/>


                <div className="audio-timers">
                  <span className="elapsed">{formatHMS(Math.floor(audioProgress[i]?.elapsed || 0))}</span>
                  <span className="divider"> / </span>
                  <span className="duration">{formatHMS(Math.floor(audioProgress[i]?.duration || 0))}</span>
                </div>

                <audio id={`audio-${i}`} src={msg.content} onLoadedMetadata={(e) => onAudioMetadata(i, e)} preload="metadata" />
              </div>
            )}
            <span className="chat-timestamp">
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className={`emoji-picker-wrapper ${theme}`} style={{ position: "fixed", top: emojiPos.top, left: emojiPos.left }}>
          <EmojiPicker onEmojiClick={addEmoji} theme={theme} />
        </div>
      )}

      {/* Attachment Menu */}
      {showAttachmentMenu && (
        <div className="attachment-menu" style={{ position: "fixed", top: attachPos.top, left: attachPos.left }}>
          <button
            onClick={() => {
              fileInputRef.current.accept = "image/*";
              fileInputRef.current.onchange = (e) => handleFileUpload(e, "image");
              fileInputRef.current.click();
              setShowAttachmentMenu(false);
            }}
          >
            <FaImage /> Image
          </button>
          <button
            onClick={() => {
              fileInputRef.current.accept = "video/*";
              fileInputRef.current.onchange = (e) => handleFileUpload(e, "video");
              fileInputRef.current.click();
              setShowAttachmentMenu(false);
            }}
          >
            <FaVideo /> Video
          </button>
          <button
            onClick={() => {
              fileInputRef.current.accept =
                "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
              fileInputRef.current.onchange = (e) => handleFileUpload(e, "document");
              fileInputRef.current.click();
              setShowAttachmentMenu(false);
            }}
          >
            <FaFileUpload /> Document
          </button>
        </div>
      )}

      {/* Input Area */}
      <form className="chat-input" onSubmit={sendMessage}>
        <div className="input-wrapper">
          {!isRecording && (
            <>
              <button type="button" className="emoji-btn" ref={emojiBtnRef} onClick={toggleEmojiPicker}>
                <FaSmile />
              </button>
              <button type="button" className="icon-btn" ref={attachBtnRef} onClick={toggleAttachmentMenu}>
                <FaPaperclip />
              </button>
            </>
          )}

          {/* 🎙️ Recording container (inline) */}
          {isRecording && (
            <div className="recording-ui">
              <div className="recording-wave">
                <canvas ref={canvasRef} width="140" height="40" />
              </div>
              <div className="recording-controls">
                <span className="recording-time">{formatHMS(recordingTime)}</span>

                {/* Send while still recording */}
                <button type="button" className="icon-btn send-btn" onClick={sendRecording} title="Send voice message">
                  <FaCheck />
                </button>

                {/* Delete/cancel while recording */}
                <button type="button" className="icon-btn delete-btn" onClick={deleteRecording} title="Cancel">
                  <FaTrash />
                </button>
              </div>
            </div>
          )}

          {!isRecording && (
            <input type="text" placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)} />
          )}

          {!isRecording &&
            (message.trim() ? (
              <button type="submit" className="send-btn">
                <FaPaperPlane />
              </button>
            ) : (
              <button type="button" className={`mic-btn ${isRecording ? "recording" : ""}`} onClick={toggleRecording} title="Record voice message">
                <FaMicrophone />
              </button>
            ))}
        </div>
        <input ref={fileInputRef} type="file" hidden />
      </form>
    </div>
  );
};

export default Chat;
