const BASE = "/api/auth";

export async function loginApi(email, password) {
  const res = await fetch(`${BASE}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export async function registerApi(email, username, password) {
  const res = await fetch(`${BASE}/registration/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password1: password, password2: password }),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export async function refreshTokenApi(refreshToken) {
  const res = await fetch(`${BASE}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}
