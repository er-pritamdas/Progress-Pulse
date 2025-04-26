import React, { useState } from "react";
import axios from "axios";
import ErrorAlert from "../../utils/Alerts/ErrorAlert";
import SuccessAlert from "../../utils/Alerts/SuccessAlert";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useLoading } from "../../Context/LoadingContext";



function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setLoading } = useLoading();

  // Variables
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [disableButton, setDisableButton] = useState(false);
  const formData = location.state?.formData || {};


  // -------------------------Checks if passwords == ConfirmPassword-------------------------
  const [error, setError] = useState("");

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setError(password !== e.target.value ? "Passwords do not match!" : "");
  };


  // -------------------------On Submit Function-------------------------
  // Error Alert Variables
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertErrorMessage, setAlertErrorMessage] = useState("");
  // Success Alert Variables
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertSuccessMessage, setalertSuccessMessage] = useState("");

  const registerUser = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      // Error Alert Popup
      setAlertErrorMessage("Passwords do not match!");
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 4000);
      return;
    }

    try {

      setLoading(true)
      setDisableButton(true);
      const response = await axios.post("/api/v1/users/forgot-password-verification/reset-password", { ...formData, password });
      // Success Alert Popup
      setalertSuccessMessage("Password updated successfully!");
      setShowSuccessAlert(true);
      setTimeout(() => {
        setLoading(false)
        setShowSuccessAlert(false)
        navigate("/login");
      }, 4000);

    } catch (err) {
      setLoading(false)
      setDisableButton(false);
      const errorMessage = err.response?.data?.message || "Something went wrong. Please try again.";
      // Error Alert Popup
      setAlertErrorMessage(errorMessage);
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 4000);
    }
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

      {/* // Right Card : The SignUP Page */}
      <div className="card bg-base-300 rounded-box grid h-170 grow place-items-center">

        {/* // Alerts Messages */}
        {showErrorAlert && <ErrorAlert message={alertErrorMessage} />}
        {showSuccessAlert && <SuccessAlert message={alertSuccessMessage} />}

        {/* // Signup Form */}
        <form
          className="fieldset w-full max-w-lg bg-base-200 border border-base-300 p-6 rounded-box"
          onSubmit={registerUser}
        >
          <legend className="fieldset-legend text-2xl font-bold">
            Reset Password
          </legend>


          {/* // Password  */}
          <label className="fieldset-label text-lg mt-2">Enter New Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            className="input validator input-lg w-full"
            required
            placeholder="Password"
            minLength="8"
            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
            title="Must be minimum of 8 characters, including a number, a lowercase letter, and an uppercase letter"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />

          {/* // Confirm Password  */}
          <label className="fieldset-label text-lg mt-2">
            Confirm Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            className="input validator input-lg w-full"
            required
            placeholder="Confirm Password"
            minLength="8"
            onChange={handleConfirmPasswordChange}
          />

          {/* // Show Password  */}
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="showPassword"
              className="mr-2"
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="showPassword" className="text-sm fieldset-label">
              Show Password
            </label>
          </div>

          {/* // error Message  */}
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

          {/* // SignUp Button  */}
          <button disabled={disableButton} className="btn btn-accent btn-lg mt-4 w-full" type="submit">
            {/* <span className={`${disableButton ? 'loading loading-spinner text-primary' : ''}`}></span> */}
            <span>Reset Password</span>
          </button>

          {/* // Already have an account?  */}
          <p className="text-center mt-4 text-sm">
            Remember your Password?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
