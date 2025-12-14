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
    <div className="relative w-full h-screen bg-base-300 flex items-center justify-center overflow-hidden">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none fixed">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px] animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row p-4 md:p-0">
        {/* Left Content with Motion */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="hidden md:flex w-full md:w-1/2 flex-col justify-center items-center p-10 relative"
        >
          <SignupLeftCard />
        </motion.div>

        {/* Signup Form with Motion */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full md:w-1/2 flex justify-center items-center py-10 md:py-0"
        >
          <div className="w-full max-w-lg bg-base-100/50 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Form Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

            {showErrorAlert && <ErrorAlert message={alertErrorMessage} />}
            {showSuccessAlert && <SuccessAlert message={alertSuccessMessage} />}

            <form
              className="w-full space-y-5"
              onSubmit={registerUser}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-base-content/60">
                  Create Account
                </h2>
                <p className="text-base-content/60 text-sm mt-2">Join us to start your journey</p>
              </div>

              <div>
                <label className="label text-sm font-medium text-base-content/80 ml-1 mb-1">Full Name</label>
                <input
                  type="text"
                  name="username"
                  className="input input-bordered input-lg w-full bg-base-200/50 focus:bg-base-200 focus:border-primary transition-all rounded-xl"
                  placeholder="Enter your name"
                  required
                  pattern="[A-Za-z][A-Za-z ]*"
                  minLength="3"
                  maxLength="30"
                  title="Only letters and spaces allowed"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label text-sm font-medium text-base-content/80 ml-1 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="input input-bordered input-lg w-full bg-base-200/50 focus:bg-base-200 focus:border-primary transition-all rounded-xl"
                  placeholder="name@example.com"
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label text-sm font-medium text-base-content/80 ml-1 mb-1">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="input input-bordered input-lg w-full bg-base-200/50 focus:bg-base-200 focus:border-primary transition-all rounded-xl"
                    required
                    placeholder="••••••••"
                    minLength="8"
                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                    title="Must be minimum of 8 characters, including a number, a lowercase letter, and an uppercase letter"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      handleChange(e);
                    }}
                  />
                </div>
                <div>
                  <label className="label text-sm font-medium text-base-content/80 ml-1 mb-1">Confirm</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input input-bordered input-lg w-full bg-base-200/50 focus:bg-base-200 focus:border-primary transition-all rounded-xl"
                    required
                    placeholder="••••••••"
                    minLength="8"
                    onChange={handleConfirmPasswordChange}
                  />
                </div>
              </div>

              <div className="flex items-center mt-2 pl-1">
                <input
                  type="checkbox"
                  id="showPassword"
                  className="checkbox checkbox-primary checkbox-sm rounded-md"
                  onChange={() => setShowPassword(!showPassword)}
                />
                <label
                  htmlFor="showPassword"
                  className="ml-3 text-sm cursor-pointer select-none text-base-content/70"
                >
                  Show Password
                </label>
              </div>

              {error && <p className="text-error text-center text-sm">{error}</p>}

              <button
                disabled={disableButton}
                className={`btn btn-primary btn-lg w-full rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-lg font-bold ${/^[A-Za-z ]{3,30}$/.test(formData.username) &&
                  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(formData.password) &&
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
                  error === "" && /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(confirmPassword)
                  ? ""
                  : "btn-disabled opacity-50 cursor-not-allowed"
                  }`}
                type="submit"
              >
                Create Account
              </button>

              <p className="text-center mt-6 text-sm text-base-content/60">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:text-primary-focus font-semibold hover:underline">
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
