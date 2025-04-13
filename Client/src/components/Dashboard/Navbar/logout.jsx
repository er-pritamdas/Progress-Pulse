import { useNavigate } from 'react-router-dom';

const useLogout = () => {
    const navigate = useNavigate();

    const logout = () => {
        // Clear localStorage or any other storage
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate('/');
    };

    return logout;
};

export default useLogout;