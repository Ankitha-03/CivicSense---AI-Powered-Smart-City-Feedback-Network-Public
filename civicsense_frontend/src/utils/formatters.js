/**
 * formatters.js
 *
 * Pure utility functions for formatting dates, labels, and strings
 * throughout the CivicSense frontend. All functions are stateless and
 * import their option lists from constants.js.
 */

import { CATEGORIES, SEVERITIES, STATUSES } from './constants';

/**
 * Format an ISO date string as a short human-readable date.
 * Example: "2026-07-07T10:30:00Z" -> "07 Jul 2026"
 *
 * @param {string} dateStr - ISO 8601 date string
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/**
 * Format an ISO date string as a date + time string.
 * Example: "2026-07-07T10:30:00Z" -> "07 Jul 2026, 10:30"
 *
 * @param {string} dateStr - ISO 8601 date string
 * @returns {string}
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/**
 * Return the human-readable label for a category value key.
 * Example: "sanitation" -> "Sanitation"
 *
 * @param {string} value - Category key (e.g. "infrastructure")
 * @returns {string}
 */
export function getCategoryLabel(value) {
  return (
    CATEGORIES.find((c) => c.value.toLowerCase() === value?.toLowerCase())?.label
    ?? value
    ?? '—'
  );
}

/**
 * Return the display metadata (label + Tailwind color classes) for a severity value.
 *
 * @param {string} value - Severity key (e.g. "high")
 * @returns {{ label: string, color: string }}
 */
export function getSeverityMeta(value) {
  return (
    SEVERITIES.find((s) => s.value.toLowerCase() === value?.toLowerCase())
    ?? { label: value ?? '—', color: 'bg-gray-100 text-gray-700' }
  );
}

/**
 * Return the display metadata (label + Tailwind color classes) for a status value.
 *
 * @param {string} value - Status key (e.g. "in_progress")
 * @returns {{ label: string, color: string }}
 */
export function getStatusMeta(value) {
  const map = {
    pending:     { label: 'Pending',     color: 'bg-amber-100 text-amber-700'   },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700'     },
    resolved:    { label: 'Resolved',    color: 'bg-emerald-100 text-emerald-700' },
  };
  return map[value?.toLowerCase()] ?? { label: value ?? 'Pending', color: 'bg-gray-100 text-gray-600' };
}

/**
 * Truncate a string to n characters, appending an ellipsis if needed.
 *
 * @param {string} str
 * @param {number} n - Maximum character count (default 80)
 * @returns {string}
 */
export function truncate(str, n = 80) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '…' : str;
}
