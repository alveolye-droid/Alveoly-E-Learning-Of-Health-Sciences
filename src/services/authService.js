import axios from "axios";

// ✅ Base API
const API_BASE = process.env.VITE_APP_API_BASE_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/auth`;

/* ============================================================
   REGISTER USER
   - Returns { user, token, dashboardPath }
   - Saves user + token to localStorage
============================================================ */
export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  const data = response.data;

  if (data.token && data.user) {
    localStorage.setItem("token", data.token);
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
   - Handles standard login flow
   - Returns { user, token, dashboardPath }
============================================================ */
export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  const data = response.data;

  if (!data || !data.user || !data.token) {
    throw new Error(data?.message || "Invalid login response");
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return {
    user: data.user,
    token: data.token,
    dashboardPath: data.user.dashboardPath || null,
  };
};

/* ============================================================
   GOOGLE OAUTH LOGIN / REGISTER
   - For OAuth callback token handling
   - Saves user + token to localStorage
============================================================ */
export const oauthLogin = async ({ token, user, dashboardPath }) => {
  if (!token || !user) {
    throw new Error("Missing OAuth token or user data");
  }

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify({ ...user, dashboardPath }));

  return { user: { ...user, dashboardPath }, token, dashboardPath };
};

/* ============================================================
   LOGOUT USER
   - Clears token + user from localStorage
============================================================ */
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/* ============================================================
   GET STORED TOKEN
============================================================ */
export const getToken = () => localStorage.getItem("token");

/* ============================================================
   GET CURRENT USER
   - Parses user object from localStorage
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
   - Optional helper for authenticated requests
============================================================ */
export const axiosWithToken = () => {
  const token = getToken();
  return axios.create({
    baseURL: API_BASE,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};
