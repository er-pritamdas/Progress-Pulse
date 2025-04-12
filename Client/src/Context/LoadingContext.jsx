import { createContext, useState, useContext } from "react";
import Loader from "../utils/Alerts/Loader";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {loading && <Loader />} {/* Global overlay */}
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
