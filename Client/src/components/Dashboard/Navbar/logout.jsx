// import { useNavigate } from 'react-router-dom';
// import React, { useState, useEffect } from "react";
// import { useAuth } from '../../../Context/JwtAuthContext';
// import { useLoading } from '../../../Context/LoadingContext';
// import axios from 'axios';
// import ErrorAlert from '../../../utils/Alerts/ErrorAlert';
// import SuccessAlert from '../../../utils/Alerts/SuccessAlert';

// const useLogout = () => {
//     const navigate = useNavigate();
//     const { setLoading} = useLoading();
//     const [disableButton, setDisableButton] = useState(false);

//     const [showErrorAlert, setShowErrorAlert] = useState(false);
//     const [alertErrorMessage, setAlertErrorMessage] = useState("");

//     const [showSuccessAlert, setShowSuccessAlert] = useState(false);
//     const [alertSuccessMessage, setalertSuccessMessage] = useState("");

//     const logout = async () => {
//         const username = localStorage.getItem("username");
//         const formData = { username };

//         try {
//             setLoading(true);
//             setDisableButton(true);
//             const response = await axios.post("/api/v1/users/logout", formData);

//             setalertSuccessMessage("User Logged Out Successfully");
//             setShowSuccessAlert(true);

//             setTimeout(() => {
//                 setLoading(false);
//                 setShowSuccessAlert(false);
//                 navigate("/");
//             }, 4000);

//             localStorage.removeItem("token");
//             localStorage.removeItem("username"); 
//         } catch (err) {
//             setLoading(false);
//             setDisableButton(false);
//             const errorMessage = err.response?.data?.message || "Something went wrong";
//             setAlertErrorMessage(errorMessage);
//             setShowErrorAlert(true);

//             setTimeout(() => setShowErrorAlert(false), 4000);
//         }
//     };

//     return logout;
// };

// export default useLogout;

import axios from "axios";

const useLogout = () => {
  const logout = async (username) => {
    const formData = { username };
    await axios.post("/api/v1/users/logout", formData);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  };

  return logout;
};

export default useLogout;
