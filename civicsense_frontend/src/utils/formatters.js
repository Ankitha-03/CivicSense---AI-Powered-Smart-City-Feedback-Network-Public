import { CATEGORIES, SEVERITIES, STATUSES } from "./constants";

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function getCategoryLabel(value) {
  return CATEGORIES.find((c) => c.value.toLowerCase() === value?.toLowerCase())?.label ?? value ?? "—";
}

export function getSeverityMeta(value) {
  return SEVERITIES.find((s) => s.value.toLowerCase() === value?.toLowerCase()) ?? { label: value ?? "—", color: "bg-gray-100 text-gray-700" };
}

export function getStatusMeta(value) {
  const map = {
    pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
    in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
    resolved: { label: "Resolved", color: "bg-emerald-100 text-emerald-700" },
  };
  return map[value?.toLowerCase()] ?? { label: value ?? "Pending", color: "bg-gray-100 text-gray-600" };
}

export function truncate(str, n = 80) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n) + "…" : str;
}
