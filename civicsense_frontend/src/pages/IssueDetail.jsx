import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, User, Phone, Mail, Tag, AlertTriangle, X, Building2, CheckCircle } from "lucide-react";
import { fetchIssueById } from "../api/issuesApi";
import PageWrapper from "../components/layout/PageWrapper";
import { StatusBadge, SeverityBadge, CategoryBadge } from "../components/ui/Badge";
import { PageSpinner } from "../components/ui/Spinner";
import { formatDateTime, getCategoryLabel } from "../utils/formatters";

function Detail({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        {React.cloneElement(icon, { className: "w-4 h-4 text-gray-500" })}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-gray-800 text-sm">{value}</p>
      </div>
    </div>
  );
}

const STATUS_STEPS = ["pending", "in_progress", "resolved"];

function StatusTimeline({ status }) {
  const current = STATUS_STEPS.indexOf(status ?? "pending");
  const labels = ["Submitted", "In Progress", "Resolved"];
  return (
    <div className="flex items-center gap-0">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors
                  ${done ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-300 text-gray-400"}`}
              >
                {i + 1}
              </div>
              <span className={`text-xs mt-1 font-medium ${done ? "text-blue-600" : "text-gray-400"}`}>
                {labels[i]}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < current ? "bg-blue-600" : "bg-gray-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Feature 6: Photo lightbox ───────────────────────────────────────────────
function PhotoLightbox({ src, category, severity }) {
  const [open, setOpen] = useState(false);
  const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
  const label = `${cap(severity)} ${getCategoryLabel(category)} — uploaded by citizen`;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Photo Evidence
          </h2>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-[#1a56db] text-xs font-semibold rounded-full border border-blue-200">
            Photo Evidence Attached
          </span>
        </div>
        <img
          src={src}
          alt="Submitted photo"
          className="w-full max-h-80 object-cover rounded-lg border border-gray-100 cursor-zoom-in"
          onClick={() => setOpen(true)}
        />
        <p className="text-xs text-gray-500 mt-2">{label}</p>
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-150"
            onClick={() => setOpen(false)}
            aria-label="Close image"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={src}
            alt="Full size photo"
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

// ─── Feature 4: Status updates timeline ──────────────────────────────────────
const UPDATE_STEPS = ["pending", "in_progress", "resolved"];

const UPDATE_LABELS = {
  pending:     "Submitted",
  in_progress: "In Progress",
  resolved:    "Resolved",
};

const UPDATE_MESSAGES = {
  pending:
    "Your report has been received and is queued for review. Our team will assess it shortly.",
  in_progress:
    "A civic team has been assigned to this issue. Work is currently underway at the reported location.",
  resolved:
    "This issue has been successfully resolved. Thank you for helping improve your community.",
};

const UPDATE_DOT_COLORS = {
  pending:     "#d97706",
  in_progress: "#1a56db",
  resolved:    "#0e9f6e",
};

function getUpdateTimestamp(step, createdAt) {
  const d = new Date(createdAt);
  if (step === "in_progress") d.setDate(d.getDate() + 1);
  else if (step === "resolved") d.setDate(d.getDate() + 3);
  return formatDateTime(d.toISOString());
}

function StatusUpdates({ status, createdAt, departmentNotes, assignedDepartment }) {
  const currentIdx = UPDATE_STEPS.indexOf(status ?? "pending");
  const visible = UPDATE_STEPS.slice(0, currentIdx + 1);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-5">
        Status Updates
      </h2>
      <div>
        {visible.map((step, i) => (
          <div key={step} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className="w-3 h-3 rounded-full shrink-0 mt-0.5"
                style={{ backgroundColor: UPDATE_DOT_COLORS[step] }}
              />
              {i < visible.length - 1 && (
                <div className="w-px flex-1 bg-gray-200 my-1.5" style={{ minHeight: "28px" }} />
              )}
            </div>
            <div className="pb-5 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{UPDATE_LABELS[step]}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {getUpdateTimestamp(step, createdAt)}
              </p>
              <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                {UPDATE_MESSAGES[step]}
              </p>
              {step === status && departmentNotes && (
                <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-semibold text-[#1a56db] mb-0.5">
                    {assignedDepartment ?? "Department"} note
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{departmentNotes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIssueById(id)
      .then(setIssue)
      .catch((err) => setError(err.response?.data?.error ?? "Issue not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageWrapper><PageSpinner /></PageWrapper>;

  if (error) return (
    <PageWrapper>
      <div className="text-center py-16">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Report not found</h2>
        <p className="text-gray-500 text-sm mb-6">{error}</p>
        <button
          onClick={() => navigate("/my-reports")}
          className="px-4 py-2 border border-[#1a56db] text-[#1a56db] text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-150"
        >
          Back to My Reports
        </button>
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper>
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#1a56db] mb-6 transition-colors duration-150"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title + description */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <StatusBadge status={issue.status} />
              <SeverityBadge severity={issue.severity} />
              <CategoryBadge category={issue.category} />
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-2 leading-snug">{issue.title}</h1>
            <p className="text-sm text-gray-600 leading-relaxed">{issue.description}</p>
          </div>

          {/* Status timeline */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-5">Report Progress</h2>
            <StatusTimeline status={issue.status} />
          </div>

          {/* Photo — Feature 6 */}
          {issue.photos_url ? (
            <PhotoLightbox
              src={issue.photos_url}
              category={issue.category}
              severity={issue.severity}
            />
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Photo Evidence</h2>
              <p className="text-sm text-gray-400">No photo submitted with this report.</p>
            </div>
          )}

          {/* AI Analysis */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">AI Analysis</h2>

            {!issue.ai_detected_category ? (
              <p className="text-sm text-gray-400">AI analysis not available for this report.</p>
            ) : (
              <div className="space-y-3">

                {/* Detected category */}
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-gray-500">Detected category:</span>
                  <span className="font-semibold text-gray-900">{issue.ai_detected_category}</span>
                </div>

                {/* Confidence bar */}
                {issue.ai_confidence != null && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Confidence</span>
                      <span className="font-semibold text-gray-700">{Math.round(issue.ai_confidence)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          issue.ai_confidence >= 80
                            ? "bg-green-500"
                            : issue.ai_confidence >= 50
                            ? "bg-[#1a56db]"
                            : "bg-amber-400"
                        }`}
                        style={{ width: `${Math.min(Math.round(issue.ai_confidence), 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* What the AI sees */}
                {issue.ai_description && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-gray-400 shrink-0 mt-0.5">What the AI sees:</span>
                    <span className="text-gray-600 leading-relaxed">{issue.ai_description}</span>
                  </div>
                )}

                {/* Match indicator */}
                {issue.ai_matches_report != null && (
                  <div className="flex items-start gap-2">
                    {issue.ai_matches_report ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-green-700">Image matches the reported category</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-amber-700">
                          Image may not match the reported category — flagged for review
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Severity assessment */}
                {issue.ai_severity && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-500">AI severity assessment:</span>
                    <span className={`font-semibold ${
                      issue.ai_severity === "Critical" ? "text-red-600" :
                      issue.ai_severity === "Severe"   ? "text-amber-600" :
                      issue.ai_severity === "Moderate" ? "text-[#1a56db]" :
                      "text-gray-500"
                    }`}>
                      {issue.ai_severity}
                    </span>
                  </div>
                )}

                <p className="text-xs text-gray-400 pt-1 border-t border-gray-100">
                  Automated analysis — for assistance only
                </p>
              </div>
            )}
          </div>

          {/* Status Updates — Feature 4 */}
          <StatusUpdates
            status={issue.status}
            createdAt={issue.created_at}
            departmentNotes={issue.department_notes}
            assignedDepartment={issue.assigned_department_name}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm divide-y divide-gray-100">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3">Report Details</h2>
            <div className="space-y-4 pt-3">
              <Detail icon={<Tag />}           label="Category"    value={getCategoryLabel(issue.category)} />
              <Detail icon={<AlertTriangle />} label="Severity"    value={issue.severity} />
              <Detail icon={<MapPin />}        label="Location"    value={issue.location} />
              <Detail icon={<Calendar />}      label="Submitted"   value={formatDateTime(issue.created_at)} />
              <Detail icon={<Building2 />}     label="Assigned To" value={issue.assigned_department_name} />
              <Detail icon={<User />}          label="Contact"     value={issue.contact} />
              <Detail icon={<Mail />}          label="Email"       value={issue.email} />
              <Detail icon={<Phone />}         label="Phone"       value={issue.phone} />
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-3 bg-white text-center">
            <p className="text-xs text-gray-400">
              Report ID: <span className="font-semibold text-gray-600">#{issue.id}</span>
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
