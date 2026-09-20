import axios from "axios";
import apiCache from "../utils/apiCache";

const axiosInstance = axios.create({
  baseURL: "/api", // because Vite proxy handles /api -> http://localhost:3000
});

// Attach access token & check cache before each request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    const method = (config.method || "get").toLowerCase();
    const shouldBypassCache =
      config.cache === false ||
      config.forceRefresh === true ||
      config.params?.forceRefresh === true;

    if (method === "get" && !shouldBypassCache) {
      const cached = apiCache.get(config.url, config.params);
      if (cached) {
        config.__fromCache = true;
        // Instantly resolve with cached response without hitting the network
        config.adapter = () =>
          Promise.resolve({
            data: cached.data,
            status: cached.status || 200,
            statusText: "OK",
            headers: cached.headers || {},
            config,
            request: {},
          });
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle cache storage on GET and smart invalidation on mutations (POST/PUT/DELETE)
axiosInstance.interceptors.response.use(
  (response) => {
    const method = (response.config?.method || "get").toLowerCase();
    const url = response.config?.url || "";

    // Cache successful GET responses if not already from cache
    if (method === "get" && !response.config?.__fromCache && response.status === 200) {
      const shouldBypassCache =
        response.config?.cache === false ||
        response.config?.forceRefresh === true ||
        response.config?.params?.forceRefresh === true;

      if (!shouldBypassCache) {
        apiCache.set(url, response.config?.params, response);
      }
    }

    // Invalidate caches when user modifies data
    if (["post", "put", "delete", "patch"].includes(method)) {
      if (url.includes("/habit")) {
        apiCache.invalidate("/habit");
        apiCache.invalidate("/dashboard");
      }
      if (url.includes("/expense")) {
        apiCache.invalidate("/expense");
        apiCache.invalidate("/dashboard");
      }
      if (url.includes("/investment")) {
        apiCache.invalidate("/investment");
        apiCache.invalidate("/dashboard");
      }
      if (url.includes("/logout") || url.includes("/loggedin")) {
        apiCache.clear();
      }
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is due to expired access token and not already retried
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/api/v1/users/loggedin/refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        const storedRefreshToken = localStorage.getItem("refreshToken");
        // Call refresh-token API to get a new access token
        const res = await axios.post(
          "/api/v1/users/loggedin/refresh-token",
          { refreshToken: storedRefreshToken },
          { withCredentials: true } // send cookie with refresh token
        );

        const data = res.data?.data;
        const newAccessToken = typeof data === "string" ? data : data?.accessToken;
        const newRefreshToken = typeof data === "object" ? data?.refreshToken : null;

        if (!newAccessToken) {
          throw new Error("No access token received from refresh API");
        }

        // Store new access token
        localStorage.setItem("token", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        // Update headers for retry
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        // Retry original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token expired or invalid", refreshError);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        apiCache.clear();
        if (window.location.pathname.startsWith("/dashboard")) {
          window.location.href = "/login"; // force logout only if on protected route
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
