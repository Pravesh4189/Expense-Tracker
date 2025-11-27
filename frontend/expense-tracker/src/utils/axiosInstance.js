import axios from "axios";

// -------------------------------------------
// Axios Instance
// -------------------------------------------
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Backend URL from .env
  timeout: 15000, // Increased timeout for slow networks
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // If backend uses cookies (optional)
});

// -------------------------------------------
// REQUEST INTERCEPTOR
// -------------------------------------------
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    // No response from server (network error)
    if (!error.response) {
      console.error("Network error. Please check your connection.");
      return Promise.reject(error);
    }

    const { status } = error.response;

    // -------------------------------------------
    // Handle Unauthorized (401)
    // -------------------------------------------
    if (status === 401) {
      console.warn("Unauthorized: Redirecting to login...");
      localStorage.removeItem("token");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // -------------------------------------------
    // Handle Forbidden (403)
    // -------------------------------------------
    if (status === 403) {
      console.error("Access denied.");
    }

    // -------------------------------------------
    // Internal Server Error (500)
    // -------------------------------------------
    if (status === 500) {
      console.error("Server error. Please try again later.");
    }

    // -------------------------------------------
    // Timeout
    // -------------------------------------------
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Please try again.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
