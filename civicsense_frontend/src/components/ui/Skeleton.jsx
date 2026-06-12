import React from "react";

function Block({ className = "" }) {
  return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3" style={{ borderLeft: "4px solid #e5e7eb" }}>
      <Block className="h-9 w-16" />
      <Block className="h-3.5 w-28" />
      <Block className="h-3 w-20" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-3.5">
          <Block className="h-3.5 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function IssueCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
      <div className="flex justify-between gap-3">
        <Block className="h-4 w-1/2" />
        <Block className="h-5 w-20 rounded-full" />
      </div>
      <Block className="h-3 w-full" />
      <Block className="h-3 w-4/5" />
      <div className="flex gap-2 pt-1">
        <Block className="h-4 w-16 rounded-md" />
        <Block className="h-4 w-12" />
      </div>
    </div>
  );
}
