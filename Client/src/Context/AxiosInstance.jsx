import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api", // because Vite proxy handles /api -> http://localhost:3000
});

// 🔐 Attach access token before each request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔁 Handle token expiration & retry original request
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is due to expired access token and not already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/api/v1/users/loggedin/refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        // Call refresh-token API to get a new access token
        const res = await axios.post(
          "/api/v1/users/loggedin/refresh-token",
          {},
          { withCredentials: true } // send cookie with refresh token
        );

        const newAccessToken = res.data.accessToken;

        // Store new access token
        localStorage.setItem("token", newAccessToken);

        // Update headers for retry
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Retry original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token expired or invalid");
        localStorage.removeItem("token");
        window.location.href = "/login"; // force logout
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
