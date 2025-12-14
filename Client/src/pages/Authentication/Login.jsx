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
        setLoading(false);
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
    <div className="relative w-full h-screen bg-base-300 flex items-center justify-center overflow-hidden">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none fixed">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px] animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row p-4 md:p-0">

        {/* Left Side */}
        <motion.div
          className="hidden md:flex w-full md:w-1/2 flex-col justify-center items-center p-10 relative"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <LoginLeftCard />
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          className="w-full md:w-1/2 flex justify-center items-center py-10 md:py-0"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="w-full max-w-lg bg-base-100/50 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Form Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

            {showErrorAlert && <ErrorAlert message={alertErrorMessage} top={-10} />}
            {showSuccessAlert && <SuccessAlert message={alertSuccessMessage} top={-15} />}

            <form onSubmit={loginUser} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-base-content/60">
                  Welcome Back
                </h2>
                <p className="text-base-content/60 text-sm mt-2">Enter your credentials to access your account</p>
              </div>

              {/* Username */}
              <div>
                <label className="label text-sm font-medium text-base-content/80 ml-1 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  className="input input-bordered input-lg w-full bg-base-200/50 focus:bg-base-200 focus:border-primary transition-all rounded-xl"
                  placeholder="Enter your username"
                  required
                  pattern="[A-Za-z][A-Za-z ]*"
                  minLength="3"
                  maxLength="30"
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div>
                <label className="label text-sm font-medium text-base-content/80 ml-1 mb-1">Password</label>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered input-lg w-full bg-base-200/50 focus:bg-base-200 focus:border-primary transition-all rounded-xl"
                  required
                  placeholder="••••••••"
                  minLength="8"
                  pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                  onChange={handleChange}
                />
              </div>

              {/* Options Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center pl-1">
                  <input
                    type="checkbox"
                    id="showPassword"
                    className="checkbox checkbox-primary checkbox-sm rounded-md"
                    onChange={() => setShowPassword(!showPassword)}
                  />
                  <label htmlFor="showPassword" className="ml-3 text-sm cursor-pointer select-none text-base-content/70">
                    Show Password
                  </label>
                </div>

                <Link to="/forgot_Password_Verify" className="text-sm text-primary hover:text-primary-focus font-medium transition-colors">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                disabled={disableButton}
                className={`btn btn-primary btn-lg w-full rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-lg font-bold ${/^[A-Za-z ]{3,30}$/.test(formData.username) &&
                  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(formData.password)
                  ? ""
                  : "btn-disabled opacity-50 cursor-not-allowed"
                  }`}
                type="submit"
              >
                Login to Dashboard
              </button>

              {/* Sign Up Link */}
              <p className="text-center mt-6 text-sm text-base-content/60">
                Don’t have an account?{" "}
                <Link to="/signup" className="text-primary hover:text-primary-focus font-semibold hover:underline">
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
