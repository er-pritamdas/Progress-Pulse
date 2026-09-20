// Imports
import React, {createContext,useContext,useState,useEffect,useRef} from "react";
import axiosInstance from "./AxiosInstance";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Variables
  const [user, setUser] = useState(localStorage.getItem("username") || null);
  const [validToken, setvalidToken] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const validateToken = async () => {
    const storedToken = localStorage.getItem("token");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (!storedToken && !storedRefreshToken) {
      setvalidToken(false);
      setIsCheckingAuth(false);
      return;
    }

    try {
      setIsCheckingAuth(true);
      const res = await axiosInstance.get("/v1/dashboard/auto-login");
      const userData = res.data?.data;
      const username = userData?.username;
      if (username) {
        setUser(username);
        localStorage.setItem("username", username);
      }
      if (userData?.email) {
        localStorage.setItem("email", userData.email);
      }
      if (userData?.fullName) {
        localStorage.setItem("fullName", userData.fullName);
      }
      if (userData?.profilePic) {
        localStorage.setItem("profilePic", userData.profilePic);
      }
      try {
        const existing = JSON.parse(localStorage.getItem("user_profile") || "{}");
        localStorage.setItem(
          "user_profile",
          JSON.stringify({
            ...existing,
            ...userData,
            email: userData?.email || existing.email,
          })
        );
      } catch (e) {}

      setvalidToken(true);
    } catch (err) {
      console.log("JWT validation failed:", err?.response?.data?.message);
      setvalidToken(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    validateToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, validToken, setvalidToken, isCheckingAuth, validateToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
