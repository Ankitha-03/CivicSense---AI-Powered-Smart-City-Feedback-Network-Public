/**
 * issuesApi.js
 *
 * API functions for citizen issue operations. All calls go through the
 * configured Axios instance, which handles Authorization headers and
 * redirects to /login on 401 responses automatically.
 */

import axiosInstance from './axios';

/**
 * GET /api/issues/
 * Returns the current citizen's issues, optionally filtered.
 *
 * @param {Object} filters - Optional query params: { category, status, severity }
 * @returns {Array} List of issue objects
 */
export async function fetchMyIssues(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.status)   params.set('status',   filters.status);
  if (filters.severity) params.set('severity',  filters.severity);

  const qs  = params.toString();
  const res = await axiosInstance.get(`issues/${qs ? `?${qs}` : ''}`);
  return res.data;
}

/**
 * GET /api/issues/{id}/
 * Returns a single issue by its numeric ID.
 *
 * @param {number|string} id - The issue primary key
 * @returns {Object} The issue object including AI analysis fields
 */
export async function fetchIssueById(id) {
  const res = await axiosInstance.get(`issues/${id}/`);
  return res.data;
}

/**
 * POST /api/submit-issue/
 * Submits a new issue with optional photo attachment.
 *
 * @param {FormData} formData - Multipart form data including all issue fields
 * @returns {Object} Created issue summary including AI analysis fields
 */
export async function submitIssue(formData) {
  const res = await axiosInstance.post('submit-issue/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
