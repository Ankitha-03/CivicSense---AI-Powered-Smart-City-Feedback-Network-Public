import { useState, useEffect, useCallback } from "react";
import { fetchMyIssues } from "../api/issuesApi";

export function useIssues(filters = {}) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyIssues(filters);
      setIssues(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      setError(err.response?.data?.error ?? "Failed to load issues.");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { load(); }, [load]);

  return { issues, loading, error, refetch: load };
}
