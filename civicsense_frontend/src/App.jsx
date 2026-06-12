import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ToastProvider } from "./hooks/useToast";
import { DepartmentAuthProvider } from "./context/DepartmentAuthContext";

import LoginSignup from "./pages/LoginSignup";
import Dashboard from "./pages/Dashboard";
import MyReports from "./pages/MyReports";
import IssueDetail from "./pages/IssueDetail";
import ReportIssue from "./pages/ReportIssue";
import LandingPage from "./pages/LandingPage";
import CityHealthReport from "./pages/CityHealthReport";
import PrivateRoute from "./components/PrivateRoute";
import ChatWidget from "./components/ChatWidget";

import DepartmentLogin from "./pages/department/DepartmentLogin";
import DepartmentDashboard from "./pages/department/DepartmentDashboard";
import DepartmentIssues from "./pages/department/DepartmentIssues";
import DepartmentPrivateRoute from "./components/department/DepartmentPrivateRoute";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <DepartmentAuthProvider>
      <ToastProvider>
        <ChatWidget />
        <Routes>
          {/* Citizen routes */}
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginSignup />} />

          <Route element={<PrivateRoute />}>
            <Route path="/"                   element={<Dashboard />} />
            <Route path="/my-reports"         element={<MyReports />} />
            <Route path="/issues/:id"         element={<IssueDetail />} />
            <Route path="/report"             element={<ReportIssue />} />
            <Route path="/city-health-report" element={<CityHealthReport />} />
            <Route path="/home"               element={<LandingPage />} />
          </Route>

          {/* Department officer routes */}
          <Route path="/department/login" element={<DepartmentLogin />} />

          <Route element={<DepartmentPrivateRoute />}>
            <Route path="/department/dashboard" element={<DepartmentDashboard />} />
            <Route path="/department/issues"    element={<DepartmentIssues />} />
          </Route>

          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
        </Routes>
      </ToastProvider>
    </DepartmentAuthProvider>
  );
}

export default App;
