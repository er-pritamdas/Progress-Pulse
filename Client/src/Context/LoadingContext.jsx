import { createContext, useState, useContext } from "react";
import Loader from "../utils/Alerts/Loader";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoadingState] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const setLoading = (val, msg = "") => {
    if (typeof val === "boolean") {
      setLoadingState(val);
      if (msg) setLoadingMessage(msg);
      else if (!val) setLoadingMessage("");
    } else if (typeof val === "string") {
      setLoadingState(true);
      setLoadingMessage(val);
    }
  };

  const showLoader = (msg = "Please wait...") => {
    setLoadingMessage(msg);
    setLoadingState(true);
  };

  const hideLoader = () => {
    setLoadingState(false);
    setLoadingMessage("");
  };

  return (
    <LoadingContext.Provider value={{ loading, setLoading, showLoader, hideLoader, loadingMessage }}>
      {loading && <Loader message={loadingMessage || "Please wait..."} />}
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
