import React, { useEffect, useState, useCallback } from "react";
import { fetchDeptIssues } from "../../api/departmentApi";
import DepartmentNavbar from "../../components/department/DepartmentNavbar";
import StatusUpdateModal from "../../components/department/StatusUpdateModal";
import { formatDateTime } from "../../utils/formatters";
import { Search, SlidersHorizontal } from "lucide-react";

const SEVERITY_COLORS = {
  minor:    "bg-gray-100 text-gray-700",
  medium:   "bg-yellow-50 text-yellow-700",
  high:     "bg-orange-50 text-orange-700",
  critical: "bg-red-50 text-red-700",
};

const STATUS_STYLES = {
  pending:     "bg-yellow-50 text-yellow-700 border border-yellow-200",
  in_progress: "bg-blue-50 text-[#1a56db] border border-blue-200",
  resolved:    "bg-green-50 text-[#0e9f6e] border border-green-200",
};

const STATUS_LABELS = { pending: "Pending", in_progress: "In Progress", resolved: "Resolved" };

export default function DepartmentIssues() {
  const [issues, setIssues]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("");
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = filter ? `status=${filter}` : "";
    const { ok, data } = await fetchDeptIssues(params);
    if (ok) setIssues(data.results ?? data ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleUpdated = (updatedIssue) => {
    setIssues((prev) => prev.map((i) => (i.id === updatedIssue.id ? updatedIssue : i)));
  };

  const filtered = search.trim()
    ? issues.filter(
        (i) =>
          i.title.toLowerCase().includes(search.toLowerCase()) ||
          i.location.toLowerCase().includes(search.toLowerCase())
      )
    : issues;

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <DepartmentNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header + filters */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Assigned Issues</h1>
            <p className="text-sm text-gray-500 mt-0.5">{filtered.length} issue{filtered.length !== 1 ? "s" : ""}</p>
          </div>

          <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition-colors duration-150 w-44"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1">
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              {["", "pending", "in_progress", "resolved"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-150 ${
                    filter === s
                      ? "bg-[#1a56db] text-white border-[#1a56db]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {s === "" ? "All" : STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-500">No issues found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Issue</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Severity</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Submitted</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((issue, i) => (
                    <tr key={issue.id} className={i % 2 === 1 ? "bg-gray-50/50" : ""}>
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <p className="font-medium text-gray-900 truncate">{issue.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">#{issue.id}</p>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 hidden sm:table-cell max-w-[140px] truncate">
                        {issue.location}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${SEVERITY_COLORS[issue.severity] ?? "bg-gray-100 text-gray-700"}`}>
                          {issue.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[issue.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {STATUS_LABELS[issue.status] ?? issue.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-400 hidden md:table-cell whitespace-nowrap">
                        {formatDateTime(issue.created_at)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelected(issue)}
                          className="px-3 py-1.5 text-xs font-semibold text-[#1a56db] border border-[#1a56db] rounded-lg hover:bg-blue-50 transition-colors duration-150"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <StatusUpdateModal
          issue={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
