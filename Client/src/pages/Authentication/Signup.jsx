import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import ErrorAlert from "../../utils/Alerts/ErrorAlert";
import SuccessAlert from "../../utils/Alerts/SuccessAlert";
import { useLoading } from "../../Context/LoadingContext";
import { TitleChanger } from "../../utils/TitleChanger";
import SignupLeftCard from "../../components/Authentication/SignupLeftCaard";

function Signup() {
  TitleChanger("Progress Pulse | Sign Up");

  const { setLoading } = useLoading();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [disableButton, setDisableButton] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertErrorMessage, setAlertErrorMessage] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertSuccessMessage, setalertSuccessMessage] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setError(password !== e.target.value ? "Passwords do not match!" : "");
  };

  const registerUser = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setAlertErrorMessage("Passwords do not match!");
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 4000);
      return;
    }

    try {
      setLoading(true);
      setDisableButton(true);
      const response = await axios.post("/api/v1/users/registered", formData);
      setalertSuccessMessage("OTP Generated");
      setShowSuccessAlert(true);
      localStorage.setItem("allowOtp", true);
      setTimeout(() => {
        setLoading(false);
        setShowSuccessAlert(false);
        navigate("/otp", { state: { formData } });
      }, 4000);
    } catch (err) {
      setLoading(false);
      setDisableButton(false);
      const errorMessage =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      setAlertErrorMessage(errorMessage);
      setShowErrorAlert(true);
      localStorage.setItem("allowOtp", false);
      setTimeout(() => setShowErrorAlert(false), 4000);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/Video/ProgressPulse.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 w-full h-full flex flex-col md:flex-row backdrop-blur-sm bg-black/30">
        {/* Left Content with Motion */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full md:w-1/2 flex flex-col justify-center items-center text-white p-10 text-center"
        >
          {/* <h1 className="text-4xl font-bold">Welcome to Progress Pulse</h1>
          <p className="mt-4 text-lg">
            Track your progress, stay motivated, and grow every day.
          </p> */}
          <SignupLeftCard />
        </motion.div>

        {/* Signup Form with Motion */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full md:w-1/2 flex justify-center items-center px-4 py-8"
        >
          <div className="w-full max-w-lg bg-opacity-80 backdrop-blur-md p-8 rounded-box shadow-lg">
            {showErrorAlert && <ErrorAlert message={alertErrorMessage} />}
            {showSuccessAlert && <SuccessAlert message={alertSuccessMessage} />}

            <form
              className="fieldset w-full max-w-lg border border-base-300 p-6 rounded-box"
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
                title="Must be minimum of 8 characters, including a number, a lowercase letter, and an uppercase letter"
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
                <label
                  htmlFor="showPassword"
                  className="text-sm fieldset-label"
                >
                  Show Password
                </label>
              </div>

              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

              <button
                disabled={disableButton}
                className={`btn btn-primary btn-lg w-full ${/^[A-Za-z ]{3,30}$/.test(formData.username) &&
                    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(formData.password)
                    ? ""
                    : "btn-soft"
                  }`}
                type="submit"
              >
                <span>Sign Up</span>
              </button>

              <p className="text-center mt-4 text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-500 hover:underline">
                  Login here
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Signup;
