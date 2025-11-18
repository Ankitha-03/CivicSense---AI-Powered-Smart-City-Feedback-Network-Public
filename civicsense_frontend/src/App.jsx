import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginSignup from "./pages/LoginSignup";
import PrivateRoute from "./components/PrivateRoute";
import LandingPage from "./pages/LandingPage";
import ReportIssue from "./pages/ReportIssue";
import CityHealthReport from "./pages/CityHealthReport";

function App() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.log("🔐 Authenticated:", isAuthenticated);
  }, [isAuthenticated]);

  return (
    <Routes>
      <Route path="/login" element={<LoginSignup />} />
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />
        }
      />
      <Route element={<PrivateRoute />}>
        <Route path="/home" element={<LandingPage />} />
        <Route path="/report" element={<ReportIssue />} />
      </Route>
      <Route path="/city-health-report" element={<CityHealthReport />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
