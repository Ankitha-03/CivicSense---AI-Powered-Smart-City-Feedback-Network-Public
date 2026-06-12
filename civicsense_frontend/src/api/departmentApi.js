const BASE = "/api";

function authHeaders() {
  const token = localStorage.getItem("dept_access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: authHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export const deptLoginApi = (username, password) =>
  request("POST", "/auth/department-login/", { username, password });

export const fetchDeptIssues = (params = "") =>
  request("GET", `/department/issues/${params ? `?${params}` : ""}`);

export const fetchDeptIssueById = (id) =>
  request("GET", `/department/issues/${id}/`);

export const updateIssueStatus = (id, status, department_notes = "") =>
  request("PATCH", `/department/issues/${id}/status/`, { status, department_notes });

export const fetchDeptStats = () =>
  request("GET", "/department/stats/");
