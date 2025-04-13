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

    console.log(originalRequest)

    // Check if error is due to expired access token and not already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/api/v1/users/loggedin/refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        console.log("Firing to get Refresh Token")
        // Call refresh-token API to get a new access token
        const res = await axios.post(
          "/api/v1/users/loggedin/refresh-token",
          {},
          { withCredentials: true } // send cookie with refresh token
        );

        const newAccessToken = res.data.data;
        console.log(newAccessToken)

        // Store new access token
        console.log("New Token")
        localStorage.setItem("token", newAccessToken);

        // Update headers for retry
        console.log("Setting Headers")
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        console.log("settings")
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Retry original request
        console.log("Refreshed")
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token expired or invalid");
        // localStorage.removeItem("token");
        // window.location.href = "/login"; // force logout
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;



// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: "/api", // because Vite proxy handles /api -> http://localhost:3000
// });

// // Avoid multiple refresh calls
// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });

//   failedQueue = [];
// };

// // 🔐 Attach access token before each request
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // 🔁 Handle token expiration & retry logic
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       !originalRequest.url.includes("/refresh-token")
//     ) {
//       if (isRefreshing) {
//         // If a refresh is already happening, wait
//         return new Promise((resolve, reject) => {
//           failedQueue.push({
//             resolve: (token) => {
//               originalRequest.headers["Authorization"] = "Bearer " + token;
//               resolve(axiosInstance(originalRequest));
//             },
//             reject: (err) => reject(err),
//           });
//         });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         console.log("🔁 Refreshing token...");
//         const res = await axios.post(
//           "/api/v1/users/loggedin/refresh-token",
//           {},
//           { withCredentials: true }
//         );

//         const newToken = res.data.data;
//         localStorage.setItem("token", newToken);

//         axiosInstance.defaults.headers.common["Authorization"] = "Bearer " + newToken;
//         originalRequest.headers["Authorization"] = "Bearer " + newToken;

//         processQueue(null, newToken); // resolve queued requests
//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         console.error("❌ Refresh token expired or invalid");
//         processQueue(refreshError, null);
//         localStorage.removeItem("token");
//         window.location.href = "/login";
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;

