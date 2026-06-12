import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, ChevronRight } from "lucide-react";
import { useIssues } from "../hooks/useIssues";
import PageWrapper from "../components/layout/PageWrapper";
import { StatusBadge, SeverityBadge, CategoryBadge } from "../components/ui/Badge";
import { IssueCardSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import { formatDate, truncate } from "../utils/formatters";
import { CATEGORIES, SEVERITIES, STATUSES } from "../utils/constants";

const SELECT_CLS =
  "text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition-colors duration-150";

export default function MyReports() {
  const navigate = useNavigate();
  const { issues, loading, error } = useIssues();

  const [search,          setSearch]          = useState("");
  const [filterCategory,  setFilterCategory]  = useState("");
  const [filterStatus,    setFilterStatus]    = useState("");
  const [filterSeverity,  setFilterSeverity]  = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return issues.filter((issue) => {
      const matchSearch =
        !q ||
        issue.title?.toLowerCase().includes(q) ||
        issue.description?.toLowerCase().includes(q) ||
        issue.location?.toLowerCase().includes(q);
      const matchCat = !filterCategory || issue.category?.toLowerCase() === filterCategory;
      const matchSt  = !filterStatus   || issue.status?.toLowerCase()   === filterStatus;
      const matchSev = !filterSeverity || issue.severity?.toLowerCase() === filterSeverity;
      return matchSearch && matchCat && matchSt && matchSev;
    });
  }, [issues, search, filterCategory, filterStatus, filterSeverity]);

  const hasFilters = search || filterCategory || filterStatus || filterSeverity;

  const clearFilters = () => {
    setSearch(""); setFilterCategory(""); setFilterStatus(""); setFilterSeverity("");
  };

  return (
    <PageWrapper>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          {loading ? "Loading…" : `${issues.length} issue${issues.length !== 1 ? "s" : ""} submitted`}
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-5 flex flex-wrap gap-3 items-center shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, description, or location"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition-colors duration-150"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />

          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={SELECT_CLS}>
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={SELECT_CLS}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className={SELECT_CLS}>
            <option value="">All Severities</option>
            {SEVERITIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm font-semibold text-[#e02424] hover:text-red-700 transition-colors duration-150"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Result count when filtering */}
      {!loading && hasFilters && (
        <p className="text-xs text-gray-500 mb-4 font-medium">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Issue list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <IssueCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-sm text-[#e02424]">{error}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No matching reports found." : "No reports submitted yet."}
          description={
            hasFilters
              ? "Try adjusting your search or filter criteria."
              : "Use the 'Report Issue' button to submit your first civic report."
          }
          action={
            !hasFilters ? (
              <button
                onClick={() => navigate("/report")}
                className="mt-2 px-4 py-2 border border-[#1a56db] text-[#1a56db] text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-150"
              >
                Report an Issue
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((issue) => (
            <button
              key={issue.id}
              type="button"
              onClick={() => navigate(`/issues/${issue.id}`)}
              className="text-left bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-gray-300 transition-all duration-150 group w-full"
            >
              {/* Title + status */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-[#1a56db] transition-colors duration-150">
                  {truncate(issue.title, 65)}
                </h3>
                <StatusBadge status={issue.status} />
              </div>

              {/* Description snippet */}
              <p className="text-gray-500 text-xs leading-relaxed mb-3">
                {truncate(issue.description, 110)}
              </p>

              {/* Footer: badges + date + arrow */}
              <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-3 mt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <CategoryBadge category={issue.category} />
                  <SeverityBadge severity={issue.severity} />
                </div>
                <div className="flex items-center gap-1 text-gray-400 shrink-0">
                  <span className="text-xs">{formatDate(issue.created_at)}</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:text-[#1a56db] transition-colors duration-150" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
