import { useLoading } from "./LoadingContext";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { setLoading } = useLoading(true);
  const [user, setUser] = useState(null);
  const [validToken, setvalidToken] = useState(false);

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
      setUser(username);
      setTimeout(() => {
        localStorage.setItem("username", username);
      }, 5000);
      setvalidToken(true);
    } catch (err) {
      console.log("JWT validation failed:", err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    validateToken(window.location.pathname);
  }, []);

  return (
    <AuthContext.Provider value={{ user, validToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
