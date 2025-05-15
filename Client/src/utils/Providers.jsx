// Providers.jsx
import { LoadingProvider } from "../Context/LoadingContext";
import { AuthProvider } from "../Context/JwtAuthContext";
import { Provider } from 'react-redux'
import store from "../services/redux/store/store";


const Providers = ({ children }) => {
  return (
    <Provider store={store}>
      <LoadingProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </LoadingProvider>
    </Provider>
  );
};

export default Providers;
