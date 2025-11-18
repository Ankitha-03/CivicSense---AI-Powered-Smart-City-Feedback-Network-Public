// src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [authToken, setAuthToken] = useState(() => {
    const access = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");
    return access && refresh ? { access, refresh } : null;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(!!authToken);

  // Login function
  const loginUser = async ({ email, password }) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("🔑 Login response:", data);

      if (response.ok && data.access && data.refresh) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        setAuthToken({ access: data.access, refresh: data.refresh });
        setUser(data.user);
        setIsAuthenticated(true);
        
        console.log("✅ Login successful!");
        return true;
      } else {
        console.error("❌ Login failed:", data);
        alert("Invalid credentials or error logging in.");
        return false;
      }
    } catch (error) {
      console.error("❌ Login Error:", error);
      alert("Network error. Check your backend connection.");
      return false;
    }
  };

  // Refresh token function
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    
    if (!refreshToken) {
      console.error("No refresh token available");
      return false;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/token/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.access) {
        localStorage.setItem("access_token", data.access);
        setAuthToken((prev) => ({ ...prev, access: data.access }));
        console.log("✅ Token refreshed");
        return true;
      } else {
        console.error("❌ Token refresh failed");
        logoutUser();
        return false;
      }
    } catch (error) {
      console.error("❌ Refresh error:", error);
      logoutUser();
      return false;
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authToken,
        isAuthenticated,
        loginUser,
        logoutUser,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);