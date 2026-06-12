import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { updateIssueStatus } from "../../api/departmentApi";

const STATUS_OPTIONS = [
  { value: "pending",     label: "Pending",     color: "text-[#d97706]" },
  { value: "in_progress", label: "In Progress", color: "text-[#1a56db]" },
  { value: "resolved",    label: "Resolved",    color: "text-[#0e9f6e]" },
];

export default function StatusUpdateModal({ issue, onClose, onUpdated }) {
  const [status, setStatus]   = useState(issue.status);
  const [notes, setNotes]     = useState(issue.department_notes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSave = async () => {
    setLoading(true);
    setError("");
    const { ok, data } = await updateIssueStatus(issue.id, status, notes);
    setLoading(false);
    if (!ok) {
      setError(data?.status?.[0] ?? data?.detail ?? "Failed to update. Please try again.");
      return;
    }
    onUpdated(data);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Update Issue Status</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors duration-150">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Issue</p>
            <p className="text-sm text-gray-800 font-medium">{issue.title}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">New Status</p>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setStatus(value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors duration-150 ${
                    status === value
                      ? "bg-[#1a56db] text-white border-[#1a56db]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              Department Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add notes visible to the citizen..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition-colors duration-150 resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#1a56db] rounded-lg hover:bg-[#1e429f] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {loading ? "Saving..." : "Save Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
