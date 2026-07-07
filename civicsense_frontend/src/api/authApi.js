/**
 * authApi.js
 *
 * Bare fetch wrappers for citizen authentication endpoints.
 * These calls intentionally bypass the Axios instance because they do not
 * require an Authorization header — the user is not yet logged in.
 *
 * All functions return { ok: boolean, status: number, data: object } so
 * callers can inspect the HTTP status and response body uniformly.
 */

const BASE = '/api/auth';

/**
 * POST /api/auth/login/
 * Authenticates a citizen by email and password.
 * Returns JWT access and refresh tokens plus the user object on success.
 */
export async function loginApi(email, password) {
  const res = await fetch(`${BASE}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

/**
 * POST /api/auth/registration/
 * Creates a new citizen account.
 * Returns JWT tokens and the new user object on success.
 */
export async function registerApi(email, username, password) {
  const res = await fetch(`${BASE}/registration/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password1: password, password2: password }),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

/**
 * POST /api/auth/token/refresh/
 * Exchanges a refresh token for a new access token.
 * Called automatically by AuthContext when the current access token expires.
 */
export async function refreshTokenApi(refreshToken) {
  const res = await fetch(`${BASE}/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}
