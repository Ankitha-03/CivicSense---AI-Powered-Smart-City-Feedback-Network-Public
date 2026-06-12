import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api/",
  timeout: 15000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    // JWT tokens start with "eyJ"; DRF tokens are plain hex strings
    const prefix = token.startsWith("eyJ") ? "Bearer" : "Token";
    config.headers.Authorization = `${prefix} ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
