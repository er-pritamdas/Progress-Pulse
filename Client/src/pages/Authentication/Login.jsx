import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import ErrorAlert from "../../utils/Alerts/ErrorAlert";
import SuccessAlert from "../../utils/Alerts/SuccessAlert";
import { useLoading } from "../../Context/LoadingContext";
import { useAuth } from "../../Context/JwtAuthContext";
import { TitleChanger } from "../../utils/TitleChanger";
import { motion } from "framer-motion";
import LoginLeftCard from "../../components/Authentication/LoginLeftCard";

function Login() {
  TitleChanger("Progress Pulse | Login");
  const navigate = useNavigate();
  const { validToken, setvalidToken } = useAuth();

  useEffect(() => {
    if (validToken) {
      navigate("/dashboard");
    }
  }, [validToken]);

  const { setLoading } = useLoading();
  const [showPassword, setShowPassword] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertErrorMessage, setAlertErrorMessage] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertSuccessMessage, setalertSuccessMessage] = useState("");

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setDisableButton(true);
      const response = await axios.post("/api/v1/users/loggedin", formData);

      localStorage.setItem("token", response.data.data.accessToken);
      localStorage.setItem("username", formData.username);

      setalertSuccessMessage("User Logged In Successfully");
      setShowSuccessAlert(true);

      setTimeout(() => {
        setShowSuccessAlert(false);
        setvalidToken(true);
        navigate("/dashboard", { state: { formData } });
      }, 4000);
    } catch (err) {
      setLoading(false);
      setDisableButton(false);
      const errorMessage =
        err?.response?.data?.message || "Something went Wrong";
      setAlertErrorMessage(errorMessage);
      setShowErrorAlert(true);
      setTimeout(() => {
        setShowErrorAlert(false)
      }, 2000);

      const isVerifiedError = err?.response?.data?.errors?.[0]?.isVerified === false;

      if (isVerifiedError) {
        try {
          setLoading(true);
          setDisableButton(true);
          const response = await axios.post("/api/v1/users/loggedin/generate-otp", formData);

          setalertSuccessMessage("OTP Generated to your Registered Email ID");
          localStorage.setItem("allowOtp", "true");
          setShowSuccessAlert(true);

          setTimeout(() => {
            setShowSuccessAlert(false);
            setLoading(false);
            navigate("/otp", { state: { formData } });
          }, 4000);
        } catch (err) {
          setLoading(false);
          setDisableButton(false);
          const otpErrorMessage =
            err?.response?.data?.message ||
            "Something went wrong. Please try again.";
          setAlertErrorMessage(otpErrorMessage);
          setShowErrorAlert(true);
          localStorage.setItem("allowOtp", "false");
          setTimeout(() => setShowErrorAlert(false), 4000);
        }
      }
    }
  };


  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/Video/ProgressPulse.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay Content */}
      <div className="relative z-10 w-full h-full flex flex-col md:flex-row backdrop-blur-sm bg-black/30">

        {/* Left Side */}
        <motion.div
          className="w-full md:w-1/2 flex flex-col justify-center items-center text-white p-10 text-center"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* <img
            src="/Dashboard.png"
            alt="Welcome"
            className="w-2/3 max-w-sm mb-8"
          />
          <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-md max-w-md leading-relaxed">
            Track your goals, habits, and progress with
            <span className="font-semibold"> Progress Pulse</span>. Your journey
            to productivity and self-growth begins here.
          </p> */}

          <LoginLeftCard />
        </motion.div>

        {/* Right Side */}
        <motion.div
          className="w-full md:w-1/2 flex justify-center items-center px-4 py-8"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="w-full max-w-lg bg-opacity-80 backdrop-blur-md p-8 rounded-box shadow-lg"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {showErrorAlert && <ErrorAlert message={alertErrorMessage} top={-10} />}
            {showSuccessAlert && <SuccessAlert message={alertSuccessMessage} top={-15} />}

            <form onSubmit={loginUser}>
              <legend className="text-3xl font-bold mb-6 text-center">
                Login
              </legend>

              {/* Username */}
              <label className="block text-lg font-medium mb-1">UserName</label>
              <input
                type="text"
                name="username"
                className="input input-bordered input-lg w-full mb-4"
                placeholder="Full Name"
                required
                pattern="[A-Za-z][A-Za-z ]*"
                minLength="3"
                maxLength="30"
                onChange={handleChange}
              />

              {/* Password */}
              <label className="block text-lg font-medium mb-1">Password</label>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                className="input input-bordered input-lg w-full mb-2"
                required
                placeholder="Password"
                minLength="8"
                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                onChange={handleChange}
              />

              {/* Show Password */}
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="showPassword"
                  className="mr-2"
                  onChange={() => setShowPassword(!showPassword)}
                />
                <label htmlFor="showPassword" className="text-sm">
                  Show Password
                </label>
              </div>

              {/* Forgot Password */}
              <div className="text-right text-sm mb-4">
                <Link to="/forgot_Password_Verify" className="link link-info">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                disabled={disableButton}
                className={`btn btn-success btn-lg w-full ${/^[A-Za-z ]{3,30}$/.test(formData.username) &&
                  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(formData.password)
                  ? ""
                  : "btn-soft"
                  }`}
                type="submit"
              >
                Login
              </button>

              {/* Sign Up Link */}
              <p className="text-center mt-4 text-sm">
                Don’t have an account?{" "}
                <Link to="/signup" className="text-blue-500 hover:underline">
                  Sign up here
                </Link>
              </p>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
