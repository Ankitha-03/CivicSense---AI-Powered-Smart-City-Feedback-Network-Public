/**
 * axios.js
 *
 * Configured Axios instance used for all authenticated API calls to the
 * Django backend. All requests go through the Vite proxy (/api -> Django)
 * so no CORS preflight is needed in development.
 *
 * Request interceptor: reads the stored access token and sets the
 * Authorization header. JWT tokens (base64url, start with "eyJ") are sent
 * as Bearer; legacy DRF tokens are sent as Token.
 *
 * Response interceptor: on a 401, clears stored credentials and redirects
 * to /login so the user is never left in a broken authenticated state.
 */

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api/',
  timeout: 15000,
});

// ---------- Request interceptor ----------

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    // JWT tokens are base64url-encoded and always begin with "eyJ".
    // DRF tokens are plain hex strings and use the "Token" scheme.
    const prefix = token.startsWith('eyJ') ? 'Bearer' : 'Token';
    config.headers.Authorization = `${prefix} ${token}`;
  }
  return config;
});

// ---------- Response interceptor ----------

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Token expired or invalid — clear storage and force re-login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export default axiosInstance;
