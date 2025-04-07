import React, { useState } from "react";
import axios from "axios";
import ErrorAlert from "../Alerts/ErrorAlert";
import SuccessAlert from "../Alerts/SuccessAlert";
import { useNavigate, Link } from "react-router-dom";


function Signup() {

  // Variables
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  
  // -------------------------HandleChange Function for input Fileds-------------------------
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  
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
      const response = await axios.post("/api/v1/users/registered", formData);
      // Success Alert Popup
      setalertSuccessMessage("OTP Generated");
      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false)
        navigate("/otp", { state: { formData } });
      }, 4000);

    } catch (err) {
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
            Sign Up
          </legend>

          {/* // Name  */}
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

          {/* // Email  */}
          <label className="fieldset-label text-lg mt-2">Email</label>
          <input
            type="email"
            name="email"
            className="input validator input-lg w-full"
            placeholder="Email"
            required
            onChange={handleChange}
          />

          {/* // Password  */}
          <label className="fieldset-label text-lg mt-2">Password</label>
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
              handleChange(e);
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
          <button className="btn btn-neutral btn-lg mt-4 w-full" type="submit">
            Sign Up
          </button>
        
          {/* // Already have an account?  */}
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
