import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  const token = localStorage.getItem("access_token");

  // ✅ If token exists, allow access
  if (token) return <Outlet />;

  // ❌ Otherwise redirect to login
  return <Navigate to="/login" replace />;
}
