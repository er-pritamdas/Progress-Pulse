import React, { useState } from "react";
import axios from "axios";
import ErrorAlert from "../Alerts/ErrorAlert";
import SuccessAlert from "../Alerts/SuccessAlert";
import { useNavigate, Link } from "react-router-dom";


function Signup() {

  // Variables
  // Error Alert Variables
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertErrorMessage, setAlertErrorMessage] = useState("");
  // Success Alert Variables
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertSuccessMessage, setalertSuccessMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setError(password !== e.target.value ? "Passwords do not match!" : "");
  };

  const registerUser = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      // Alert Message
      setAlertErrorMessage("Passwords do not match!");
      setShowErrorAlert(true); 
      setTimeout(() => setShowErrorAlert(false), 4000); 
      return;
    }

    try {
      const response = await axios.post("/api/v1/users/registered", formData);
    
      // Success Alert
      setalertSuccessMessage("OTP Generated");
      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false)
        navigate("/otp", {state:{formData}});
        }, 4000);
    
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Something went wrong. Please try again.";
      
      // Error Alert
      setAlertErrorMessage(errorMessage);
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 4000);
    }
  };

  return (
    <div className="flex w-full mt-2 justify-center items-center h-screen">
      <div className="card bg-base-300 rounded-box grid h-170 grow place-items-center">
        Content
      </div>
      <div className="divider divider-horizontal"></div>
      <div className="card bg-base-300 rounded-box grid h-170 grow place-items-center">
        {showErrorAlert && <ErrorAlert message={alertErrorMessage} />}
        {showSuccessAlert && <SuccessAlert message={alertSuccessMessage} />}
        <form
          className="fieldset w-full max-w-lg bg-base-200 border border-base-300 p-6 rounded-box"
          onSubmit={registerUser}
        >
          <legend className="fieldset-legend text-2xl font-bold">
            Sign Up
          </legend>

          <label className="fieldset-label text-lg">Name</label>
          <input
            type="text"
            name="username"
            className="input validator input-lg w-full"
            placeholder="Full Name"
            required
            pattern="[A-Za-z][A-Za-z ]*"
            minLength="3"
            maxLength="30"
            title="Only letters and spaces allowed"
            onChange={handleChange}
          />

          <label className="fieldset-label text-lg mt-2">Email</label>
          <input
            type="email"
            name="email"
            className="input validator input-lg w-full"
            placeholder="Email"
            required
            onChange={handleChange}
          />

          <label className="fieldset-label text-lg mt-2">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            className="input validator input-lg w-full"
            required
            placeholder="Password"
            minLength="8"
            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
            title="Must be more than 8 characters, including a number, a lowercase letter, and an uppercase letter"
            onChange={(e) => {
              setPassword(e.target.value);
              handleChange(e);
            }}
          />

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

          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

          <button className="btn btn-neutral btn-lg mt-4 w-full" type="submit">
            Sign Up
          </button>

          <p className="text-center mt-4 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
