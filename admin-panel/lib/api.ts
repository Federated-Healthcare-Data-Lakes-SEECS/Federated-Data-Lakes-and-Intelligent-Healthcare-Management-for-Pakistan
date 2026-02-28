import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

const api = axios.create({
  baseURL: BASE_URL,
});

// Request interceptor → add token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor → auto logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("[API] Unauthorized, logging out...");
      Cookies.remove("access_token");
      // Optionally force reload or redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
