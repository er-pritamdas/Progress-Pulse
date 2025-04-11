import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {


  const jwtValidation = (location) => {
    if (location == "/" || location == "/dashboard")
    {
        const token = localStorage.getItem("token");
        try{
        axios.get('/api/v1/dashbord', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })}
          catch (err) {
            err.response.message = "Token Expired";
          }
          // jwt some changes
    }
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);