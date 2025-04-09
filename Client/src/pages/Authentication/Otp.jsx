import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import ErrorAlert from "../../utils/Alerts/ErrorAlert";
import SuccessAlert from "../../utils/Alerts/SuccessAlert";

function Otp() {
    
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [alertErrorMessage, setAlertErrorMessage] = useState("");
    
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [alertSuccessMessage, setAlertSuccessMessage] = useState("");
    
    
    const navigate = useNavigate();
    const location = useLocation();
    const formData = location.state?.formData || {};
    
    
    const [timer, setTimer] = useState(300);
    const [resendDisabled, setResendDisabled] = useState(true);
    useEffect(() => {
        let countdown;
        if (resendDisabled && timer > 0) {
            countdown = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setResendDisabled(false);
        }
        return () => clearInterval(countdown);
    }, [resendDisabled, timer]);
    
    
    // -------------------------HandleChange Function for OTP Entry Fileds-------------------------
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    
    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value) || value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };
    
    // -------------------------HandleBackspace in OTP Entry Fields-------------------------
    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };
    
    // ------------------------- Submit OTP Verification -------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        const enteredOTP = otp.join("");
        
        if (enteredOTP.length !== 6) {
            // Error Alert Popup
            setAlertErrorMessage("Please enter a valid 6-digit OTP.");
            setShowErrorAlert(true);
            setTimeout(() => setShowErrorAlert(false), 4000);
            return;
        }
        
        try {
            const response = await axios.post("/api/v1/users/registered/verify-otp", {
                ...formData,
                otp: enteredOTP,
            });
            // Success Alert Popup
            setAlertSuccessMessage("OTP Verified Successfully!");
            setShowSuccessAlert(true);
            setTimeout(() => {
                setShowSuccessAlert(false);
                navigate("/dashboard");
            }, 4000);
            
        } catch (err) {
            const errorMessage = err.response?.data?.message || "OTP Verification Failed.";
            // Error Alert Popup
            setAlertErrorMessage(errorMessage);
            setShowErrorAlert(true);
            setTimeout(() => setShowErrorAlert(false), 4000);
        }
    };
    
    // ------------------------- Resend OTP Funnction -------------------------

    const handleResendOtp = async () => {
        try {
            await axios.post("/api/v1/users/registered/resend-otp", formData);
            // Success Alert Popup
            setAlertSuccessMessage("OTP resent successfully!");
            setShowSuccessAlert(true);
            setTimeout(() => setShowSuccessAlert(false), 4000);
            
            setResendDisabled(true);
            setTimer(300); // 5 minutes
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to resend OTP.";
            // Error Alert Popup
            setAlertErrorMessage(errorMessage);
            setShowErrorAlert(true);
            setTimeout(() => setShowErrorAlert(false), 4000);
        }
    };


    // ------------------------- Resend OTP Timer -------------------------
    const formatTime = (seconds) => {
        const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        return `${mins}:${secs}`;
    };



    // -------------------------Return HTML Code-------------------------

    return (
        <div className="flex w-full mt-2 justify-center items-center h-screen">

            {/* // Left Card */}
            <div className="card bg-base-300 rounded-box grid h-170 grow place-items-center">
                Content
            </div>

            {/* // Divider */}
            <div className="divider divider-horizontal"></div>

            {/* // Right Card */}
            <div className="card bg-base-300 rounded-box grid h-170 grow place-items-center">

                {/* // Alerts Messages */}
                {showErrorAlert && <ErrorAlert message={alertErrorMessage} />}
                {showSuccessAlert && <SuccessAlert message={alertSuccessMessage} />}

                {/* // OTP Verification Form */}
                <fieldset className="fieldset w-full max-w-lg bg-base-200 border border-base-300 p-6 rounded-box">
                    <legend className="fieldset-legend text-2xl font-bold">OTP Verification</legend>
                    <p className="text-center text-lg mb-4">Enter the OTP sent to your email</p>

                    {/* // OTP Entry Field */}
                    <div className="flex justify-center gap-2 mb-2">
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

                    {/* // Verify OTP Button*/}
                    <button className="btn btn-neutral btn-lg w-full" onClick={handleSubmit}>
                        Verify OTP
                    </button>

                    {/* // Resend OTP Button*/}
                    <button
                        className="btn btn-accent btn-lg mt-4 w-full"
                        onClick={handleResendOtp}
                        disabled={resendDisabled}
                    >
                         {resendDisabled ? `Resend OTP In (${formatTime(timer)})` : "Resend OTP"}
                    </button>
                </fieldset>
            </div>
        </div>
    );
}

export default Otp;
