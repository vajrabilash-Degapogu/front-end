// import axios from "axios";

// const api = axios.create({
//   // baseURL: "https://api.owntag.in/api",
//   baseURL: "http://localhost:8080/api",
//   timeout: 15000,
//   headers: {
//     "Content-Type": "application/json"
//   }
// });

// export default api;


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

export default api;