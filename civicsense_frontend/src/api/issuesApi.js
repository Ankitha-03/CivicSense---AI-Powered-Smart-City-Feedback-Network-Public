import axiosInstance from "./axios";

export async function fetchMyIssues(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  if (filters.severity) params.set("severity", filters.severity);
  const qs = params.toString();
  const res = await axiosInstance.get(`issues/${qs ? `?${qs}` : ""}`);
  return res.data;
}

export async function fetchIssueById(id) {
  const res = await axiosInstance.get(`issues/${id}/`);
  return res.data;
}

export async function submitIssue(formData) {
  const res = await axiosInstance.post("submit-issue/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
