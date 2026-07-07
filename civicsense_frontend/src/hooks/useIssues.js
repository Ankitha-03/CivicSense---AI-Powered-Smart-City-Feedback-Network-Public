/**
 * useIssues.js
 *
 * Custom hook that fetches the current citizen's issues from the API and
 * exposes loading, error, and refetch state. Used by Dashboard, MyReports,
 * and any component that needs the issue list.
 *
 * Filters are memoised via JSON.stringify so referential equality is not
 * required — callers can pass an inline object literal safely.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchMyIssues } from '../api/issuesApi';

/**
 * Fetches and returns the authenticated citizen's issues.
 *
 * @param {Object} filters - Optional server-side filters: { category, status, severity }
 * @returns {{ issues: Array, loading: boolean, error: string|null, refetch: Function }}
 */
export function useIssues(filters = {}) {
  const [issues,  setIssues]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyIssues(filters);
      // The API may return a plain array or a DRF paginated { results: [] } object
      setIssues(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to load issues.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  useEffect(() => { load(); }, [load]);

  return { issues, loading, error, refetch: load };
}
