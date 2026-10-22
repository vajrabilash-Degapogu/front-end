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
      const isCustomerAuthRequest = requestUrl.startsWith("/customer-auth/");
      const isCustomerAccountRequest = requestUrl.startsWith("/customer-auth/me");

      // Invalid credentials on login should show the form error, not redirect to admin.
      if (!isCustomerAuthRequest) {
        const sentAuthorization = error.config?.headers?.Authorization;
        const customerToken = localStorage.getItem("customerToken");
        if (customerToken && sentAuthorization === `Bearer ${customerToken}` || isCustomerAccountRequest) {
          localStorage.removeItem("customerToken");
          localStorage.removeItem("customerUsername");
          localStorage.removeItem("customerEmail");
          window.location.href = "/customer-login";
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          window.location.href = "/control-center";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;