import React from "react";
import { getCategoryLabel } from "../../utils/formatters";

const STATUS_STYLES = {
  pending:     { label: "Pending",     cls: "bg-amber-100 text-amber-800" },
  in_progress: { label: "In Progress", cls: "bg-blue-100  text-blue-800"  },
  resolved:    { label: "Resolved",    cls: "bg-green-100 text-green-800"  },
};

const SEVERITY_DOTS = {
  critical: { dot: "bg-[#e02424]", label: "Critical" },
  high:     { dot: "bg-orange-500", label: "High"     },
  medium:   { dot: "bg-[#d97706]", label: "Medium"   },
  minor:    { dot: "bg-[#0e9f6e]", label: "Minor"    },
};

export function StatusBadge({ status }) {
  const key = status?.toLowerCase();
  const { label, cls } = STATUS_STYLES[key] ?? { label: status ?? "Pending", cls: "bg-gray-100 text-gray-700" };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${cls}`}
    >
      {label}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const key  = severity?.toLowerCase();
  const meta = SEVERITY_DOTS[key] ?? { dot: "bg-gray-400", label: severity ?? "—" };
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700">
      <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export function CategoryBadge({ category }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 uppercase tracking-wide">
      {getCategoryLabel(category)}
    </span>
  );
}
