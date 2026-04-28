import React, { createContext, useState, useEffect, useCallback } from "react";
import jwtDecode from "jwt-decode";
import axios from "axios";
import { getToken, logout as authLogout } from "../services/authService.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const SERVER_URL =
    import.meta?.env?.VITE_SERVER_URL ||
    process.env?.VITE_APP_API_BASE_URL ||
    "http://localhost:5000";

  const DEFAULT_AVATAR =
    "https://cdn-icons-png.flaticon.com/512/1053/1053244.png";

  const normalizeUser = (raw) => {
    if (!raw) return null;
    const id = raw._id || raw.userId || raw.id || raw.id?.toString?.();
    const role = raw.role ? String(raw.role).toLowerCase() : "";
    const avatar = raw.avatar
      ? raw.avatar.startsWith("http")
        ? raw.avatar
        : `${SERVER_URL}${raw.avatar}`
      : DEFAULT_AVATAR;

    const dashboardPath =
      raw.dashboardPath ||
      (role === "admin"
        ? "/admin/dashboard"
        : role === "lecturer"
        ? `/lecturer/${id}/dashboard`
        : `/student/${id}/dashboard`);

    return {
      _id: id,
      name: raw.name || raw.fullName || "",
      email: raw.email || "",
      role,
      avatar,
      token: raw.token || raw.authToken || raw.tokenString || null,
      courses: raw.courses || [],
      dashboardPath,
    };
  };

  // Initialize user from localStorage or token
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    const authToken = localStorage.getItem("authToken") || getToken();

    if (storedUser) {
      try {
        return normalizeUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }

    if (authToken) {
      try {
        const decoded = jwtDecode(authToken);
        const minimal = {
          userId: decoded.userId || decoded.id || "",
          name: decoded.name || "",
          email: decoded.email || "",
          role: decoded.role || "",
          avatar: decoded.avatar || null,
          token: authToken,
          courses: decoded.courses || [],
        };
        return normalizeUser(minimal);
      } catch {
        localStorage.removeItem("authToken");
      }
    }

    return null;
  });

  // Keep localStorage in sync
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // Refresh user from server
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("authToken") || user?.token;
    if (!token) {
      console.warn("refreshUser: No auth token found");
      return null;
    }

    try {
      const res = await axios.get(`${SERVER_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res?.data?.success) {
        const serverUser = res.data.user || {};
        if (res.data.dashboardPath) serverUser.dashboardPath = res.data.dashboardPath;
        serverUser.token = token;

        const normalized = normalizeUser(serverUser);
        setUser(normalized);
        localStorage.setItem("user", JSON.stringify(normalized));
        return normalized;
      }
    } catch (err) {
      // Detailed logging
      if (axios.isAxiosError(err)) {
        console.error("refreshUser Axios error:", err.response?.data || err.message);
      } else {
        console.error("refreshUser error:", err);
      }

      // Logout if unauthorized
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.warn("refreshUser: Unauthorized, logging out...");
        logoutUser();
      }
    }

    return null;
  }, [SERVER_URL, user?.token]);

  // Attempt refresh on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken") || user?.token;
    if (token) {
      refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login user function (manual or OAuth)
  const loginUser = (userData) => {
    const token =
      userData?.token || userData?.user?.token || localStorage.getItem("authToken");

    if (token) localStorage.setItem("authToken", token);

    const merged = {
      _id: userData._id || userData.user?._id || userData.userId || userData.id,
      name: userData.name || userData.user?.name,
      email: userData.email || userData.user?.email,
      role: (userData.role || userData.user?.role || "").toLowerCase(),
      token,
      courses: userData.courses || userData.user?.courses || [],
      avatar: userData.avatar || userData.user?.avatar || DEFAULT_AVATAR,
      dashboardPath: userData.dashboardPath || userData.user?.dashboardPath,
    };

    const normalized = normalizeUser(merged);
    setUser(normalized);
    localStorage.setItem("user", JSON.stringify(normalized));
  };

  const logoutUser = () => {
    authLogout();
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loginUser,
        logoutUser,
        refreshUser,
        SERVER_URL,
        DEFAULT_AVATAR,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
