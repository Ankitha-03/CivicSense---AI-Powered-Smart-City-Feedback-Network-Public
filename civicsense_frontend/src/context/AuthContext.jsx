import React, { createContext, useContext, useState } from "react";
import { loginApi, refreshTokenApi } from "../api/authApi";

function decodeJWT(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return {};
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });
  const [authToken, setAuthToken] = useState(() => {
    const access  = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");
    return access && refresh ? { access, refresh } : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!authToken);

  const setAuthFromTokens = (access, refresh, usr) => {
    const safeRefresh = refresh ?? access;
    localStorage.setItem("access_token",  access);
    localStorage.setItem("refresh_token", safeRefresh);
    localStorage.setItem("user", JSON.stringify(usr ?? null));
    setAuthToken({ access, refresh: safeRefresh });
    setUser(usr ?? null);
    setIsAuthenticated(true);
  };

  const loginUser = async ({ email, password }) => {
    const { ok, data } = await loginApi(email, password);
    if (!ok) return false;

    const access  = data.tokens?.access  ?? data.access  ?? data.key;
    const refresh = data.tokens?.refresh ?? data.refresh ?? data.key;

    if (!access) return false;
    setAuthFromTokens(access, refresh, data.user ?? null);
    return true;
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) { logoutUser(); return false; }
    const { ok, data } = await refreshTokenApi(refreshToken);
    if (ok && data.access) {
      localStorage.setItem("access_token", data.access);
      setAuthToken((prev) => ({ ...prev, access: data.access }));
      return true;
    }
    logoutUser();
    return false;
  };

  const logoutUser = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Derive username and displayName — JWT payload is the fallback for existing sessions
  const jwtPayload = authToken?.access ? decodeJWT(authToken.access) : {};
  const username = user?.username || jwtPayload.username || null;
  const displayName =
    user?.first_name?.trim() ||
    user?.username ||
    jwtPayload.first_name?.trim() ||
    jwtPayload.username ||
    null;

  return (
    <AuthContext.Provider value={{ user, authToken, isAuthenticated, loginUser, logoutUser, refreshAccessToken, setAuthFromTokens, username, displayName }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
