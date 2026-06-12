import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDeptAuth } from "../../context/DepartmentAuthContext";

export default function DepartmentPrivateRoute() {
  const { deptIsAuthenticated } = useDeptAuth();
  return deptIsAuthenticated ? <Outlet /> : <Navigate to="/department/login" replace />;
}
