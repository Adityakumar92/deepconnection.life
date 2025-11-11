import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL ||  'http://localhost:8080',
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Automatically attach token
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem("authData");
    const token = authData ? JSON.parse(authData).token : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
