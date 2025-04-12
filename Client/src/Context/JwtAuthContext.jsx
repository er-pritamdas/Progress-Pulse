import { useLoading } from "./LoadingContext";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // const navigate = useNavigate();
  // const location = useLocation();
  const { setLoading } = useLoading(true); 
  const [user, setUser] = useState(null);  
  const [token, setToken] = useState(null);  

  // ✅ Token validation on app load
  const validateToken = async (location) => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setLoading(false);
      return;
    }

    axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

    try {
      const res = await axios.get("/api/v1/dashboard"); 
      const username = res.data.data;
      console.log(username);
      setTimeout(() => {
        setUser(username); 
      }, 4000);
      localStorage.setItem("username",username);             // Adjust based on your backend
      // setToken(storedToken);
      // console.log(location.pathname);
      // if (location.pathname === "/") {
      //   navigate("/dashboard");
      // } // Redirect to dashboard or desired route
    } catch (err) {
      console.log("JWT validation failed:", err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    validateToken(window.location.pathname); // Run on page load
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
