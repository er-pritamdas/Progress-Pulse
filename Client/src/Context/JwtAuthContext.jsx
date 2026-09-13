// Imports
import { useLoading } from "./LoadingContext";
import React, {createContext,useContext,useState,useEffect,useRef} from "react";
import axiosInstance from "./AxiosInstance";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // Variables
  const { setLoading } = useLoading(true);
  const [user, setUser] = useState(null);
  const [validToken, setvalidToken] = useState(false);
  // const isFirstRun = useRef(true); //Prevent double execution in StrictMode

  const validateToken = async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await axiosInstance.get("/v1/dashboard/auto-login");
      const userData = res.data?.data;
      const username = userData?.username;
      setUser(username);
      if (username) {
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
      setLoading(true);
    } catch (err) {
      console.log("JWT validation failed:", err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // if (isFirstRun.current) {
    //   isFirstRun.current = false;
    validateToken();
    // }
  }, []);

  return (
    <AuthContext.Provider value={{ user, validToken, setvalidToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
