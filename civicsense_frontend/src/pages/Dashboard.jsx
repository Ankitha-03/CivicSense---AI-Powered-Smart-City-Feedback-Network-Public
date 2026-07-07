/**
 * Dashboard.jsx
 *
 * The main citizen-facing page, composed of two sections:
 *
 *   1. Landing — hero banner, "How It Works" explainer, reportable categories
 *      grid, and platform-wide stats bar. Visible to all authenticated citizens.
 *
 *   2. Personal dashboard — stat cards (total / pending / in-progress / resolved)
 *      with count-up animation, a recent reports table (last 5 issues), and a
 *      "This Week at a Glance" insights panel computed client-side from the
 *      issue list.
 *
 * Data is fetched via the useIssues hook which calls GET /api/issues/.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, ChevronDown,
  FileText, Bell, CheckCircle,
  Construction, Trash2, Lightbulb, Droplets, AlertTriangle, MoreHorizontal,
  Wrench, Shield, Zap, Car, Leaf,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useIssues } from "../hooks/useIssues";
import Navbar from "../components/layout/Navbar";
import { StatusBadge, SeverityBadge, CategoryBadge } from "../components/ui/Badge";
import { CardSkeleton, TableRowSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import { formatDate, truncate, getCategoryLabel } from "../utils/formatters";

// ─── Count-up animation hook ────────────────────────────────────────────────
function useCountUp(target) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) { setCount(0); return; }
    let current = 0;
    const increment = Math.max(1, Math.ceil(target / 30));
    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      setCount(current);
      if (current >= target) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, [target]);
  return count;
}

// ─── Feature 1: Landing data ─────────────────────────────────────────────────
const HOW_IT_WORKS = [
  { id: 1, icon: FileText,    title: "Submit a Report",       description: "Describe the issue, pin the location, and upload a photo in under 2 minutes." },
  { id: 2, icon: Bell,        title: "We Notify Authorities", description: "Your report is routed to the relevant civic department automatically." },
  { id: 3, icon: CheckCircle, title: "Track Resolution",      description: "Get real-time status updates as your issue moves from Pending to Resolved." },
];

const LANDING_CATEGORIES = [
  { icon: Construction,  label: "Road Damage",   description: "Potholes, cracks, and damaged road surfaces" },
  { icon: Trash2,        label: "Garbage",        description: "Overflowing bins and uncollected waste" },
  { icon: Lightbulb,     label: "Streetlight",    description: "Broken or flickering public lighting" },
  { icon: Droplets,      label: "Water Leak",     description: "Burst pipes and standing water on streets" },
  { icon: AlertTriangle, label: "Encroachment",   description: "Illegal construction or public space misuse" },
  { icon: MoreHorizontal,label: "Other",          description: "Any other civic issue in your area" },
];

const PLATFORM_STATS = [
  { value: "10,000+", label: "Issues Reported" },
  { value: "85%",     label: "Resolution Rate" },
  { value: "50+",     label: "Cities Covered"  },
];

// ─── Feature 1: Hero ─────────────────────────────────────────────────────────
function HeroSection({ onReport, onMyReports }) {
  return (
    <section
      className="relative flex flex-col items-center justify-center text-white overflow-hidden"
      style={{
        minHeight: "calc(100vh - 59px)",
        backgroundColor: "#0f172a",
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)," +
          "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "50px 50px",
      }}
    >
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-6">
          Report. Track.{" "}
          <span style={{ color: "#1a56db" }}>Resolve.</span>
        </h1>
        <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-10">
          CivicSense empowers citizens to report public infrastructure issues directly to the
          authorities — transparently and efficiently.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={onReport}
            className="px-7 py-3 bg-[#1a56db] text-white rounded-lg font-semibold text-sm hover:bg-[#1e429f] transition-colors duration-150 shadow-sm"
          >
            Report an Issue
          </button>
          <button
            onClick={onMyReports}
            className="px-7 py-3 border border-white text-white rounded-lg font-semibold text-sm hover:bg-white/10 transition-colors duration-150"
          >
            View My Reports
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 animate-bounce">
        <ChevronDown className="w-6 h-6" />
      </div>
    </section>
  );
}

// ─── Feature 1: How It Works ─────────────────────────────────────────────────
function HowItWorksSection() {
  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-14">
          How CivicSense Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="relative flex flex-col items-center text-center px-8 py-4"
              >
                {/* Horizontal connector (desktop only) */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div
                    className="hidden md:block absolute h-px bg-gray-200"
                    style={{ top: "48px", left: "calc(50% + 24px)", right: "-50%" }}
                  />
                )}
                <div className="relative z-10 w-12 h-12 rounded-full bg-[#1a56db] text-white font-bold flex items-center justify-center text-sm mb-5">
                  {step.id}
                </div>
                <Icon className="w-6 h-6 text-[#1a56db] mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Feature 1: Issue Categories ─────────────────────────────────────────────
function CategoriesSection({ onNavigate }) {
  return (
    <section className="bg-[#f3f4f6] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
          What Can You Report?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {LANDING_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={onNavigate}
                className="text-left bg-white border border-gray-200 border-l-4 border-l-transparent rounded-lg p-5 hover:border-l-[#1a56db] hover:shadow-md transition-all duration-150 w-full"
              >
                <Icon className="w-5 h-5 text-[#1a56db] mb-3" />
                <p className="font-semibold text-gray-900 text-sm mb-1">{cat.label}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{cat.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Feature 1: Stats Bar ────────────────────────────────────────────────────
function StatsBar() {
  return (
    <section className="bg-[#1a56db] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-white text-center divide-y sm:divide-y-0 sm:divide-x divide-blue-500">
          {PLATFORM_STATS.map((stat) => (
            <div key={stat.label} className="py-4 sm:py-0">
              <p className="text-3xl font-extrabold">{stat.value}</p>
              <p className="text-blue-200 text-sm mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Dashboard anchor divider ─────────────────────────────────────────────────
function DashboardDivider() {
  return (
    <div className="py-8 px-4 bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap">
          Your Dashboard
        </span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>
    </div>
  );
}

// ─── Feature 2: Stat card with count-up + sparkline + tooltip ────────────────
const STAT_CARDS = [
  {
    key: "total",      label: "Total Reports",  borderColor: "#1a56db", note: "all time",
    tooltip: "All issues you have submitted",
    sparkHeights: [40, 60, 50, 80, 65],
  },
  {
    key: "pending",    label: "Pending",         borderColor: "#d97706", note: "awaiting action",
    tooltip: "Awaiting review by authorities",
    sparkHeights: [60, 40, 55, 35, 50],
  },
  {
    key: "inProgress", label: "In Progress",     borderColor: "#6366f1", note: "being addressed",
    tooltip: "Currently being addressed",
    sparkHeights: [40, 60, 45, 65, 55],
  },
  {
    key: "resolved",   label: "Resolved",        borderColor: "#0e9f6e", note: "successfully closed",
    tooltip: "Successfully closed issues",
    sparkHeights: [20, 40, 60, 50, 70],
  },
];

function StatCard({ label, value, borderColor, note, tooltip, sparkHeights, loading }) {
  const count = useCountUp(loading ? 0 : value);
  return (
    <div className="relative group">
      {/* Tooltip */}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <div className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap shadow-lg">
          {tooltip}
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </div>
      {/* Card */}
      <div
        className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-150 cursor-default"
        style={{ borderLeft: `4px solid ${borderColor}` }}
      >
        <p className="text-4xl font-bold text-gray-900 leading-none">{loading ? "—" : count}</p>
        <p className="text-sm font-medium text-gray-700 mt-2">{label}</p>
        <p className="text-xs text-gray-400 mt-1">{note}</p>
        {!loading && (
          <div className="flex items-end gap-0.5 h-5 mt-3">
            {sparkHeights.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{ height: `${h}%`, backgroundColor: borderColor, opacity: 0.4 }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Feature 2: Category icons for table ────────────────────────────────────
const CATEGORY_ICONS = {
  infrastructure: Wrench,
  sanitation:     Trash2,
  public_safety:  Shield,
  utilities:      Zap,
  transportation: Car,
  environment:    Leaf,
};

const TABLE_HEADERS = ["Issue Title", "Category", "Severity", "Date Submitted", "Status"];

// ─── Feature 5: Weekly insights ──────────────────────────────────────────────
function WeeklyInsights({ issues }) {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const thisWeek = issues.filter((i) => new Date(i.created_at) >= weekStart);
  const resolved = thisWeek.filter((i) => i.status === "resolved").length;

  const catCounts = {};
  thisWeek.forEach((i) => {
    if (i.category) catCounts[i.category] = (catCounts[i.category] || 0) + 1;
  });
  const topEntry = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
  const topCategory = topEntry ? getCategoryLabel(topEntry[0]) : null;

  const insight =
    thisWeek.length === 0
      ? "No issues were reported this week. Stay engaged with your community."
      : topCategory
      ? `This week, ${topCategory} issues were most frequently reported.`
      : `${thisWeek.length} issue${thisWeek.length !== 1 ? "s" : ""} submitted this week.`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mt-4">
      <div className="px-5 py-3.5 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">This Week at a Glance</h2>
      </div>
      {thisWeek.length === 0 ? (
        <div className="px-5 py-6 text-sm text-gray-500">No activity this week yet.</div>
      ) : (
        <div className="px-5 py-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">{thisWeek.length}</p>
              <p className="text-xs text-gray-500 mt-1">Issues Submitted</p>
            </div>
            <div className="border-l border-gray-100 pl-4">
              <p className="text-sm font-semibold text-gray-900 truncate">{topCategory ?? "—"}</p>
              <p className="text-xs text-gray-500 mt-1">Top Category</p>
            </div>
            <div className="border-l border-gray-100 pl-4">
              <p className="text-2xl font-bold text-gray-900">{resolved}</p>
              <p className="text-xs text-gray-500 mt-1">Resolved</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 border-t border-gray-100 pt-3">{insight}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard component ────────────────────────────────────────────────
export default function Dashboard() {
  const { user, displayName } = useAuth();
  const navigate = useNavigate();
  const { issues, loading, error } = useIssues();

  const total      = issues.length;
  const pending    = issues.filter((i) => i.status === "pending").length;
  const inProgress = issues.filter((i) => i.status === "in_progress").length;
  const resolved   = issues.filter((i) => i.status === "resolved").length;
  const recent     = issues.slice(0, 5);
  const statValues = { total, pending, inProgress, resolved };

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      <Navbar />

      {/* ── Feature 1: Landing hero + sections ── */}
      <HeroSection
        onReport={() => navigate("/report")}
        onMyReports={() => navigate("/my-reports")}
      />
      <HowItWorksSection />
      <CategoriesSection onNavigate={() => navigate("/report")} />
      <StatsBar />
      <DashboardDivider />

      {/* ── Features 2 + 5: Dashboard content ── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">

        {/* Welcome row */}
        <div className="flex items-start sm:items-center justify-between pb-4 mb-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Welcome back,{" "}
              {displayName ?? user?.email?.split("@")[0] ?? "there"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Here is an overview of your submitted civic reports.
            </p>
          </div>
          <p className="hidden sm:block text-sm text-gray-500 font-medium shrink-0 ml-4">{today}</p>
        </div>

        {/* Stats row */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
            {STAT_CARDS.map((c) => <CardSkeleton key={c.key} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
            {STAT_CARDS.map((card) => (
              <StatCard
                key={card.key}
                label={card.label}
                value={statValues[card.key]}
                borderColor={card.borderColor}
                note={card.note}
                tooltip={card.tooltip}
                sparkHeights={card.sparkHeights}
                loading={loading}
              />
            ))}
          </div>
        )}

        {/* Recent Reports table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Recent Reports</h2>
            <button
              onClick={() => navigate("/my-reports")}
              className="flex items-center gap-0.5 text-xs font-semibold text-[#1a56db] hover:text-[#1e429f] transition-colors duration-150"
            >
              View all
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <table className="w-full">
              <tbody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={5} />
                ))}
              </tbody>
            </table>
          ) : error ? (
            <div className="px-5 py-8 text-center text-sm text-[#e02424]">{error}</div>
          ) : recent.length === 0 ? (
            <EmptyState
              title="No reports submitted yet."
              description="Use the 'Report Issue' button in the navigation bar to get started."
              action={
                <button
                  onClick={() => navigate("/report")}
                  className="mt-2 px-4 py-2 border border-[#1a56db] text-[#1a56db] text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-150"
                >
                  Report an Issue
                </button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    {TABLE_HEADERS.map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recent.map((issue, idx) => {
                    const CatIcon = CATEGORY_ICONS[issue.category];
                    return (
                      <tr
                        key={issue.id}
                        onClick={() => navigate(`/issues/${issue.id}`)}
                        className="cursor-pointer transition-colors duration-150 hover:bg-blue-50"
                        style={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9fafb" }}
                      >
                        <td className="px-5 py-3.5 font-medium text-gray-900 max-w-[260px] truncate">
                          {truncate(issue.title, 55)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {CatIcon && (
                              <CatIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            )}
                            <CategoryBadge category={issue.category} />
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <SeverityBadge severity={issue.severity} />
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                          {formatDate(issue.created_at)}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={issue.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Feature 5: Weekly insights */}
        {!loading && !error && <WeeklyInsights issues={issues} />}
      </div>
    </div>
  );
}
