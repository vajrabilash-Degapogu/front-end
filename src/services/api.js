import axios from "axios";

// export const BASE_URL = "http://localhost:8080";
export const BASE_URL = "https://vehicle.owntag.in";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";

      // Customer login failures should stay on the customer login form.
      if (requestUrl.startsWith("/customer-auth/")) {
        if (requestUrl.startsWith("/customer-auth/me")) {
          localStorage.removeItem("customerToken");
          localStorage.removeItem("customerUsername");
          localStorage.removeItem("customerEmail");
          window.location.href = "/customer-login";
        }
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.href = "/control-center";
      }
    }
    return Promise.reject(error);
  }
);

export default api;