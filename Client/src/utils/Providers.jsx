// Providers.jsx
import { LoadingProvider } from "../Context/LoadingContext";
import { AuthProvider } from "../Context/JwtAuthContext";


const Providers = ({ children }) => {
  return (
    <LoadingProvider>
      <AuthProvider>
      {children}
      </AuthProvider>
    </LoadingProvider>
  );
};

export default Providers;
