/**
 * DepartmentLogin.jsx
 *
 * Login form for department officers. Submits credentials to
 * POST /api/auth/department-login/ via deptLoginApi and, on success,
 * stores the returned JWT in DepartmentAuthContext.
 *
 * If the officer is already authenticated (deptIsAuthenticated), the
 * component redirects immediately to /department/dashboard via useEffect
 * to avoid calling navigate() during the render phase.
 *
 * Citizen accounts that attempt to log in here receive a 403 error
 * from the backend, displayed as an inline error message.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useDeptAuth } from "../../context/DepartmentAuthContext";
import { deptLoginApi } from "../../api/departmentApi";
import { Building2, Eye, EyeOff, Loader2 } from "lucide-react";

export default function DepartmentLogin() {
  const [fields, setFields]       = useState({ username: "", password: "" });
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const { deptLogin, deptIsAuthenticated } = useDeptAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (deptIsAuthenticated) {
      navigate("/department/dashboard", { replace: true });
    }
  }, [deptIsAuthenticated, navigate]);

  const handle = (e) => setFields((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!fields.username || !fields.password) {
      setError("Username and password are required.");
      return;
    }
    setLoading(true);
    const { ok, data } = await deptLoginApi(fields.username, fields.password);
    setLoading(false);
    if (!ok) {
      setError(data?.error ?? data?.detail ?? "Login failed. Please check your credentials.");
      return;
    }
    deptLogin(data.access, data.refresh, data.user);
    navigate("/department/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-[#1a56db] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 leading-none">CivicSense</p>
            <p className="text-sm font-bold text-gray-900 leading-tight">Department Portal</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-1">Officer Sign In</h2>
        <p className="text-sm text-gray-500 mb-6">Access your department dashboard.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
            <input
              type="text"
              name="username"
              value={fields.username}
              onChange={handle}
              placeholder="officer_infrastructure"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition-colors duration-150"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                name="password"
                value={fields.password}
                onChange={handle}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition-colors duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#1a56db] text-white rounded-lg font-semibold text-sm hover:bg-[#1e429f] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-6 text-center">
          For citizens, visit the{" "}
          <a href="/login" className="text-[#1a56db] hover:underline">main portal</a>.
        </p>
      </div>
    </div>
  );
}
