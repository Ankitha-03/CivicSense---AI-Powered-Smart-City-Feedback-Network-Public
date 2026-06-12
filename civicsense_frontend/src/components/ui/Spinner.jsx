import React from "react";

export default function Spinner({ size = "md", className = "" }) {
  const sz = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" }[size] ?? "w-8 h-8";
  return (
    <div
      className={`${sz} rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Spinner size="lg" />
    </div>
  );
}
