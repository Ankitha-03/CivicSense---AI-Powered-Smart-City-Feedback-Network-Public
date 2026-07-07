/**
 * DepartmentDashboard.jsx
 *
 * Overview dashboard for department officers. Displays four stat cards
 * (total, pending, in-progress, resolved) fetched from
 * GET /api/department/stats/, and a table of the five most recent pending
 * issues fetched from GET /api/department/issues/?status=pending.
 *
 * Both requests run in parallel via Promise.all on mount. A "View all"
 * link navigates to the full DepartmentIssues page.
 *
 * Auth: requires a valid department officer JWT (IsDepartmentOfficer).
 */

import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { useDeptAuth } from "../../context/DepartmentAuthContext";
import { fetchDeptStats, fetchDeptIssues } from "../../api/departmentApi";
import DepartmentNavbar from "../../components/department/DepartmentNavbar";
import { ClipboardList, Clock, Wrench, CheckCircle2, ArrowRight } from "lucide-react";
import { formatDateTime } from "../../utils/formatters";

const SEVERITY_COLORS = {
  minor:    "bg-gray-100 text-gray-700",
  medium:   "bg-yellow-50 text-yellow-700",
  high:     "bg-orange-50 text-orange-700",
  critical: "bg-red-50 text-red-700",
};

const STATUS_COLORS = {
  pending:     "bg-yellow-50 text-yellow-700 border border-yellow-200",
  in_progress: "bg-blue-50 text-[#1a56db] border border-blue-200",
  resolved:    "bg-green-50 text-[#0e9f6e] border border-green-200",
};

const STATUS_LABELS = { pending: "Pending", in_progress: "In Progress", resolved: "Resolved" };

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

export default function DepartmentDashboard() {
  const { deptUser } = useDeptAuth();
  const [stats, setStats]   = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchDeptStats(), fetchDeptIssues("status=pending")])
      .then(([statsRes, issuesRes]) => {
        if (statsRes.ok)  setStats(statsRes.data);
        if (issuesRes.ok) setIssues(issuesRes.data.results ?? issuesRes.data ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const recent = issues.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <DepartmentNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            {deptUser?.department_name ?? "Department Dashboard"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of issues assigned to your department.</p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 h-20 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={ClipboardList} label="Total Issues"   value={stats?.total}       color="bg-gray-100 text-gray-600" />
            <StatCard icon={Clock}         label="Pending"        value={stats?.pending}     color="bg-yellow-50 text-yellow-600" />
            <StatCard icon={Wrench}        label="In Progress"    value={stats?.in_progress} color="bg-blue-50 text-[#1a56db]" />
            <StatCard icon={CheckCircle2}  label="Resolved"       value={stats?.resolved}    color="bg-green-50 text-[#0e9f6e]" />
          </div>
        )}

        {/* Recent pending issues */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Pending Issues</h2>
            <Link
              to="/department/issues"
              className="flex items-center gap-1 text-xs font-semibold text-[#1a56db] hover:text-[#1e429f] transition-colors duration-150"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="w-8 h-8 text-[#0e9f6e] mx-auto mb-2" />
              <p className="text-sm text-gray-500">No pending issues. All caught up.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recent.map((issue) => (
                <div key={issue.id} className="px-5 py-3.5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{issue.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{issue.location} · {formatDateTime(issue.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${SEVERITY_COLORS[issue.severity] ?? "bg-gray-100 text-gray-700"}`}>
                      {issue.severity}
                    </span>
                    <Link
                      to="/department/issues"
                      className="text-xs font-semibold text-[#1a56db] hover:text-[#1e429f] transition-colors duration-150"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
