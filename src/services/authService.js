import axios from "axios";

// ✅ Base API
const API_BASE = process.env.VITE_APP_API_BASE_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/auth`;

/* ============================================================
   REGISTER USER
============================================================ */
export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  const data = response.data;

  if (data.token && data.user) {
    localStorage.setItem("authToken", data.token);  // ✅ Changed from "token" to "authToken"
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return {
    user: data.user,
    token: data.token,
    dashboardPath: data.user.dashboardPath || null,
  };
};

/* ============================================================
   LOGIN USER
============================================================ */
export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  const data = response.data;

  if (!data || !data.user || !data.token) {
    throw new Error(data?.message || "Invalid login response");
  }

  localStorage.setItem("authToken", data.token);  // ✅ Changed from "token" to "authToken"
  localStorage.setItem("user", JSON.stringify(data.user));

  return {
    user: data.user,
    token: data.token,
    dashboardPath: data.user.dashboardPath || null,
  };
};

/* ============================================================
   GOOGLE OAUTH LOGIN / REGISTER
============================================================ */
export const oauthLogin = async ({ token, user, dashboardPath }) => {
  if (!token || !user) {
    throw new Error("Missing OAuth token or user data");
  }

  localStorage.setItem("authToken", token);  // ✅ Changed from "token" to "authToken"
  localStorage.setItem("user", JSON.stringify({ ...user, dashboardPath }));

  return { user: { ...user, dashboardPath }, token, dashboardPath };
};

/* ============================================================
   LOGOUT USER
============================================================ */
export const logout = () => {
  localStorage.removeItem("authToken");  // ✅ Changed from "token" to "authToken"
  localStorage.removeItem("user");
};

/* ============================================================
   GET STORED TOKEN
============================================================ */
export const getToken = () => localStorage.getItem("authToken");  // ✅ Changed from "token" to "authToken"

/* ============================================================
   GET CURRENT USER
============================================================ */
export const getCurrentUser = () => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch (err) {
    console.error("Error parsing stored user:", err);
    localStorage.removeItem("user");
    return null;
  }
};

/* ============================================================
   AXIOS INSTANCE WITH TOKEN
============================================================ */
export const axiosWithToken = () => {
  const token = getToken();
  return axios.create({
    baseURL: API_BASE,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};
