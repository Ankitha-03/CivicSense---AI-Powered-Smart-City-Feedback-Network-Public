import React, { createContext, useContext, useState } from "react";

const DepartmentAuthContext = createContext(null);

export function DepartmentAuthProvider({ children }) {
  const [deptUser, setDeptUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("dept_user")); } catch { return null; }
  });
  const [deptToken, setDeptToken] = useState(() => localStorage.getItem("dept_access_token") || null);
  const [deptIsAuthenticated, setDeptIsAuthenticated] = useState(!!localStorage.getItem("dept_access_token"));

  const deptLogin = (access, refresh, user) => {
    localStorage.setItem("dept_access_token", access);
    localStorage.setItem("dept_refresh_token", refresh ?? access);
    localStorage.setItem("dept_user", JSON.stringify(user ?? null));
    setDeptToken(access);
    setDeptUser(user ?? null);
    setDeptIsAuthenticated(true);
  };

  const deptLogout = () => {
    localStorage.removeItem("dept_access_token");
    localStorage.removeItem("dept_refresh_token");
    localStorage.removeItem("dept_user");
    setDeptToken(null);
    setDeptUser(null);
    setDeptIsAuthenticated(false);
  };

  return (
    <DepartmentAuthContext.Provider value={{ deptUser, deptToken, deptIsAuthenticated, deptLogin, deptLogout }}>
      {children}
    </DepartmentAuthContext.Provider>
  );
}

export const useDeptAuth = () => useContext(DepartmentAuthContext);
