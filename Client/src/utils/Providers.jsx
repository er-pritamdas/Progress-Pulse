// Providers.jsx

import { LoadingProvider } from "../Context/LoadingContext";


const Providers = ({ children }) => {
  return (
      <LoadingProvider>
        {children}
      </LoadingProvider>
  );
};

export default Providers;
