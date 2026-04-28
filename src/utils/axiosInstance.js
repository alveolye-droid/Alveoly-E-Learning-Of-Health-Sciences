import axios from "axios";

const API_BASE =
  import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },

  // ✅ Allow cookies (important for backend auth middleware)
  withCredentials: true,
});

/* =========================================================
   ✅ REQUEST INTERCEPTOR — Attach Token Automatically
========================================================= */
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;

        console.log(
          "🔐 [axios] Sending request with token:",
          token.substring(0, 10) + "..."
        );
      } else {
        console.warn("⚠️ [axios] No token found in localStorage");
      }

      console.log(
        `➡️ [axios] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
      );

      return config;
    } catch (err) {
      console.error("❌ [axios] Request interceptor crash:", err);
      return config;
    }
  },
  (error) => {
    console.error("❌ [axios] Request error:", error);
    return Promise.reject(error);
  }
);

/* =========================================================
   ✅ RESPONSE INTERCEPTOR — Global Error Handling + AUTO LOGOUT
========================================================= */
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(
      "✅ [axios] Response received:",
      response.status,
      response.config.url
    );
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || "Unknown error";

    console.error("❌ [axios] Response error:", status, message);

    /* ===============================
       🔒 401 — AUTO LOGOUT
    =============================== */
    if (status === 401) {
      console.warn("🔒 Unauthorized → Logging out user");

      localStorage.removeItem("token");

      // Prevent redirect loop
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    /* ===============================
       ⛔ 403 — Forbidden
    =============================== */
    if (status === 403) {
      console.warn("⛔ Forbidden → Insufficient permissions");
    }

    /* ===============================
       🔥 500 — Server Error
    =============================== */
    if (status === 500) {
      console.error("🔥 Server error → Check backend logs");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
