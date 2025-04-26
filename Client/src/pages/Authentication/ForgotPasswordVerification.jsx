import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import ErrorAlert from "../../utils/Alerts/ErrorAlert";
import SuccessAlert from "../../utils/Alerts/SuccessAlert";
import { useLoading } from "../../Context/LoadingContext";
import { useAuth } from "../../Context/JwtAuthContext";

function ForgotPasswordVerification() {

    const { setLoading } = useLoading();

    // Variables
    const navigate = useNavigate();
    const [disableButton, setDisableButton] = useState(false);



    // -------------------------HandleChange Function for input Fileds-------------------------
    const [formData, setFormData] = useState({
        email: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // -------------------------On Submit Function-------------------------
    // Error Alert Variables
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [alertErrorMessage, setAlertErrorMessage] = useState("");
    // Success Alert Variables
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [alertSuccessMessage, setalertSuccessMessage] = useState("");

    const checkUser = async (e) => {
        e.preventDefault();

        try {

            setLoading(true)
            setDisableButton(true);
            const response = await axios.post("/api/v1/users/forgot-password-verification", formData);
            // Success Alert Popup
            setalertSuccessMessage("OTP Generated");
            setShowSuccessAlert(true);
            localStorage.setItem('allowOtp', true);
            setTimeout(() => {
                setLoading(false)
                setShowSuccessAlert(false)
                navigate("/forgot_Password-otp", { state: { formData } });
            }, 4000);

        } catch (err) {
            setLoading(false)
            setDisableButton(false);
            const errorMessage = err.response?.data?.message || "Something went wrong. Please try again.";
            // Error Alert Popup
            setAlertErrorMessage(errorMessage);
            setShowErrorAlert(true);
            localStorage.setItem('allowOtp', false);
            setTimeout(() => setShowErrorAlert(false), 4000);
        }
    };


    // -------------------------Return HTML Code-------------------------
    return (
        <>
            <div className="flex w-full mt-2 justify-center items-center h-screen">
                {/* Left Card */}
                <div className="card bg-base-300 rounded-box grid h-170 grow place-items-center">
                    Content
                </div>

                {/* Divider */}
                <div className="divider divider-horizontal"></div>

                {/* Right Card: Forgot Password Form */}
                <div className="card bg-base-300 rounded-box grid h-170 grow place-items-center">

                    {/* // Alerts Messages */}
                    {showErrorAlert && <ErrorAlert message={alertErrorMessage} />}
                    {showSuccessAlert && <SuccessAlert message={alertSuccessMessage} />}

                    {/* Forgot Password Form */}
                    <form
                        className="fieldset w-full max-w-lg bg-base-200 border border-base-300 p-6 rounded-box"
                        onSubmit={checkUser}
                    >
                        <legend className="fieldset-legend text-2xl font-bold text-center mb-4">
                            Verify It's You
                        </legend>

                        {/* Instructions */}
                        {/* <p className="text-sm mb-4 text-center text-gray-500">
                            Enter your registered email. We'll send you a one-time password (OTP) to verify your identity.
                        </p> */}

                        {/* Email / Username Input */}
                        <label className="fieldset-label text-lg">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="input validator input-lg w-full"
                            placeholder="Enter your email"
                            required
                            onChange={handleChange}
                        />

                        {/* Send OTP Button */}
                        <button
                            disabled={disableButton}
                            className="btn btn-primary btn-lg mt-4 w-full"
                            type="submit"
                        >
                            Send OTP
                        </button>

                        {/* Link Back to Login */}
                        <p className="text-center mt-4 text-sm">
                            Remembered your password?{" "}
                            <Link to="/login" className="text-blue-500 hover:underline">
                                Login here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>

        </>
    );
}

export default ForgotPasswordVerification;
