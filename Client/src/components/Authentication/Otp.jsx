import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import ErrorAlert from "../Alerts/ErrorAlert";
import SuccessAlert from "../Alerts/SuccessAlert";

function Otp() {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    
    // Error & Success Alert States
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [alertErrorMessage, setAlertErrorMessage] = useState("");
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [alertSuccessMessage, setAlertSuccessMessage] = useState("");

    const navigate = useNavigate();
    const location = useLocation();
    
    // Retrieve formData from previous page
    const formData = location.state?.formData || {};  

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // Only allow numbers
        if (value.length > 1) return; // Prevent more than 1 digit

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next box automatically if a digit is entered
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const enteredOTP = otp.join("");

        if (enteredOTP.length !== 6) {
            setAlertErrorMessage("Please enter a valid 6-digit OTP.");
            setShowErrorAlert(true);
            setTimeout(() => setShowErrorAlert(false), 4000);
            return;
        }

        try {
            // Send OTP verification request
            const response = await axios.post("/api/v1/users/registered/verify-otp", {
                ...formData,
                otp: enteredOTP,
            });

            setAlertSuccessMessage("OTP Verified Successfully!");
            setShowSuccessAlert(true);
            setTimeout(() => {
                setShowSuccessAlert(false);
                navigate("/dashboard"); // Redirect on success
            }, 4000);

        } catch (err) {
            const errorMessage = err.response?.data?.message || "OTP Verification Failed.";
            setAlertErrorMessage(errorMessage);
            setShowErrorAlert(true);
            setTimeout(() => setShowErrorAlert(false), 4000);
        }
    };

    return (
        <div className="flex w-full mt-2 justify-center items-center h-screen">
            <div className="card bg-base-300 rounded-box grid h-170 grow place-items-center">Content</div>
            <div className="divider divider-horizontal"></div>
            <div className="card bg-base-300 rounded-box grid h-170 grow place-items-center">
                {showErrorAlert && <ErrorAlert message={alertErrorMessage} />}
                {showSuccessAlert && <SuccessAlert message={alertSuccessMessage} />}

                <fieldset className="fieldset w-full max-w-lg bg-base-200 border border-base-300 p-6 rounded-box">
                    <legend className="fieldset-legend text-2xl font-bold">OTP Verification</legend>
                    <p className="text-center text-lg mb-4">Enter the OTP sent to your email</p>

                    <div className="flex justify-center gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                className="input validator input-lg w-12 text-center text-xl"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                            />
                        ))}
                    </div>

                    <button className="btn btn-neutral btn-lg mt-4 w-full" onClick={handleSubmit}>
                        Verify OTP
                    </button>
                </fieldset>
            </div>
        </div>
    );
}

export default Otp;
