import axios from "axios";

// -------------------------------------------
// Axios Instance
// -------------------------------------------
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000", 
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false, // keep false unless backend uses cookies
});

// -------------------------------------------
// REQUEST INTERCEPTOR
// -------------------------------------------
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Error reading token", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -------------------------------------------
// RESPONSE INTERCEPTOR
// -------------------------------------------
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    if (!error.response) {
      console.error("Network error. Server might be offline.");
      return Promise.reject(error);
    }

    const { status } = error.response;

    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (status === 403) {
      console.error("Access forbidden (403).");
    }

    if (status >= 500) {
      console.error("Server error. Please try again later.");
    }

    if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Try again.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
