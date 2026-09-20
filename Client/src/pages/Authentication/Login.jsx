import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import ErrorAlert from "../../utils/Alerts/ErrorAlert";
import SuccessAlert from "../../utils/Alerts/SuccessAlert";
import { useLoading } from "../../Context/LoadingContext";
import { useAuth } from "../../Context/JwtAuthContext";
import { TitleChanger } from "../../utils/TitleChanger";
import { motion } from "framer-motion";
import LoginLeftCard from "../../components/Authentication/LoginLeftCard";
import { User, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Sparkles, ShieldCheck, Zap } from "lucide-react";

function Login() {
  TitleChanger("Progress Pulse | Login");
  const navigate = useNavigate();
  const { validToken, setvalidToken, isCheckingAuth } = useAuth();
  const { setLoading } = useLoading();
  const loginTimersRef = useRef([]);

  const clearLoginTimers = () => {
    loginTimersRef.current.forEach(clearTimeout);
    loginTimersRef.current = [];
  };

  // Ensure loading popup is ALWAYS dismissed if Login unmounts
  useEffect(() => {
    // Ping Render server in the background to wake it up early
    axios.get("/api/v1/health").catch(() => {});

    return () => {
      clearLoginTimers();
      setLoading(false);
    };
  }, []);

  useEffect(() => {
    if (validToken) {
      clearLoginTimers();
      setLoading(false);
      navigate("/dashboard", { replace: true });
    }
  }, [validToken, navigate]);

  const [showPassword, setShowPassword] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("remember_me_choice") !== "false";
  });
  const [formData, setFormData] = useState({
    username: localStorage.getItem("remembered_username") || localStorage.getItem("username") || "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertErrorMessage, setAlertErrorMessage] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertSuccessMessage, setalertSuccessMessage] = useState("");

  const isUsernameValid = /^[A-Za-z ]{3,30}$/.test(formData.username);
  const isPasswordValid = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(formData.password);
  const isFormValid = isUsernameValid && isPasswordValid;

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true, "Logging in... Please wait");
      setDisableButton(true);

      const response = await axios.post("/api/v1/users/loggedin", formData, {
        withCredentials: true,
      });

      const responseData = response.data?.data;
      const accessToken = responseData?.accessToken;
      const refreshToken = responseData?.refreshToken;
      const loggedInUser = responseData?.user;

      if (accessToken) {
        localStorage.setItem("token", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      localStorage.setItem("username", formData.username);

      if (rememberMe) {
        localStorage.setItem("remembered_username", formData.username);
        localStorage.setItem("remember_me_choice", "true");
      } else {
        localStorage.removeItem("remembered_username");
        localStorage.setItem("remember_me_choice", "false");
      }

      if (loggedInUser?.email) {
        localStorage.setItem("email", loggedInUser.email);
      }
      if (loggedInUser?.fullName) {
        localStorage.setItem("fullName", loggedInUser.fullName);
      }
      if (loggedInUser?.profilePic) {
        localStorage.setItem("profilePic", loggedInUser.profilePic);
      }
      if (loggedInUser) {
        try {
          localStorage.setItem("user_profile", JSON.stringify(loggedInUser));
        } catch (e) {}
      }

      setalertSuccessMessage("User Logged In Successfully");
      setShowSuccessAlert(true);

      clearLoginTimers();

      // Sequential smooth transition steps
      loginTimersRef.current.push(
        setTimeout(() => {
          setLoading(true, "Logged in!");
        }, 500)
      );

      loginTimersRef.current.push(
        setTimeout(() => {
          setLoading(true, "Gathering your data...");
        }, 1300)
      );

      loginTimersRef.current.push(
        setTimeout(() => {
          setLoading(true, "Building your dashboard...");
        }, 2100)
      );

      loginTimersRef.current.push(
        setTimeout(() => {
          setShowSuccessAlert(false);
          setLoading(false); // Dismiss loader before setting valid token and navigating
          setvalidToken(true);
          navigate("/dashboard", { replace: true, state: { formData } });
        }, 2900)
      );
    } catch (err) {
      clearLoginTimers();
      setLoading(false);
      setDisableButton(false);
      const errorMessage =
        err?.response?.data?.message || "Something went Wrong";
      setAlertErrorMessage(errorMessage);
      setShowErrorAlert(true);
      setTimeout(() => {
        setShowErrorAlert(false);
      }, 3000);

      const isVerifiedError = err?.response?.data?.errors?.[0]?.isVerified === false;

      if (isVerifiedError) {
        try {
          setLoading(true, "Generating OTP...");
          setDisableButton(true);
          await axios.post("/api/v1/users/loggedin/generate-otp", formData);

          setalertSuccessMessage("OTP Generated to your Registered Email ID");
          localStorage.setItem("allowOtp", "true");
          setShowSuccessAlert(true);

          setTimeout(() => {
            setShowSuccessAlert(false);
            setLoading(false);
            navigate("/otp", { state: { formData } });
          }, 3000);
        } catch (otpErr) {
          setLoading(false);
          setDisableButton(false);
          const otpErrorMessage =
            otpErr?.response?.data?.message ||
            "Something went wrong. Please try again.";
          setAlertErrorMessage(otpErrorMessage);
          setShowErrorAlert(true);
          localStorage.setItem("allowOtp", "false");
          setTimeout(() => setShowErrorAlert(false), 4000);
        }
      }
    }
  };

  const handleQuickDemo = async () => {
    setFormData({ username: "Demo", password: "Demo@321" });
    try {
      setLoading(true, "Launching Demo Account...");
      setDisableButton(true);
      const response = await axios.post(
        "/api/v1/users/loggedin",
        { username: "Demo", password: "Demo@321" },
        { withCredentials: true }
      );
      const responseData = response.data?.data;
      if (responseData?.accessToken) localStorage.setItem("token", responseData.accessToken);
      if (responseData?.refreshToken) localStorage.setItem("refreshToken", responseData.refreshToken);
      localStorage.setItem("username", "Demo");
      if (responseData?.user?.email) localStorage.setItem("email", responseData.user.email);
      if (responseData?.user?.fullName) localStorage.setItem("fullName", responseData.user.fullName);
      if (responseData?.user?.profilePic) localStorage.setItem("profilePic", responseData.user.profilePic);
      if (responseData?.user) {
        try { localStorage.setItem("user_profile", JSON.stringify(responseData.user)); } catch (e) {}
      }
      setLoading(false);
      setvalidToken(true);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setLoading(false);
      setDisableButton(false);
      setAlertErrorMessage(err?.response?.data?.message || "Demo login failed");
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP VIEW (md and up) - 100% ORIGINAL & UNTOUCHED                    */}
      {/* ========================================================================= */}
      <div className="hidden md:flex relative w-full min-h-[100dvh] bg-base-300 items-center justify-center py-8 px-4 sm:px-6 md:px-8 overflow-y-auto">
        {/* Background Animated Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          {/* Left Side (Desktop Only) */}
          <motion.div
            className="hidden md:flex w-1/2 flex-col justify-center items-center p-8 relative"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <LoginLeftCard />
          </motion.div>

          {/* Right Side - Form Card (Desktop) */}
          <motion.div
            className="w-full md:w-1/2 max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="w-full bg-base-100/80 backdrop-blur-2xl border border-base-content/10 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              {showErrorAlert && <ErrorAlert message={alertErrorMessage} top={-10} />}
              {showSuccessAlert && <SuccessAlert message={alertSuccessMessage} top={-15} />}

              {/* Segmented Auth Switcher (Sign In / Sign Up) */}
              <div className="grid grid-cols-2 p-1 bg-base-200/80 rounded-2xl border border-base-300/80 mb-6 text-xs font-bold">
                <button
                  type="button"
                  className="py-2 rounded-xl bg-primary text-primary-content shadow-xs transition-all font-black text-center"
                >
                  Sign In
                </button>
                <Link
                  to="/signup"
                  className="py-2 rounded-xl text-center text-base-content/60 hover:text-base-content transition-all font-bold flex items-center justify-center"
                >
                  Create Account
                </Link>
              </div>

              {/* Header Text */}
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
                  Welcome Back
                </h1>
                <p className="text-xs sm:text-sm text-base-content/60 font-medium mt-1">
                  Enter your credentials to access your dashboard
                </p>
              </div>

              {isCheckingAuth && (localStorage.getItem("token") || localStorage.getItem("refreshToken")) && (
                <div className="flex items-center justify-center gap-2 p-2.5 mb-5 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs font-semibold animate-pulse">
                  <span className="loading loading-spinner loading-xs"></span>
                  <span>Restoring session... Connecting to server</span>
                </div>
              )}

              <form onSubmit={loginUser} className="space-y-4">
                {/* Username Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5 ml-1">
                    <User size={13} className="text-primary" />
                    <span>Username</span>
                  </label>
                  <div className="relative flex items-center rounded-2xl bg-base-200/50 hover:bg-base-200/80 focus-within:bg-base-100 border border-base-300/80 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all h-12 px-3.5">
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      required
                      pattern="[A-Za-z][A-Za-z ]*"
                      minLength="3"
                      maxLength="30"
                      autoComplete="username"
                      className="w-full bg-transparent text-sm font-semibold text-base-content placeholder:text-base-content/40 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
                      <Lock size={13} className="text-primary" />
                      <span>Password</span>
                    </label>
                    <Link
                      to="/forgot_Password_Verify"
                      className="text-xs text-primary hover:underline font-bold"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative flex items-center rounded-2xl bg-base-200/50 hover:bg-base-200/80 focus-within:bg-base-100 border border-base-300/80 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all h-12 px-3.5">
                    <input
                      name="password"
                      value={formData.password}
                      type={showPassword ? "text" : "password"}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      minLength="8"
                      pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                      autoComplete="current-password"
                      className="w-full bg-transparent text-sm font-semibold text-base-content placeholder:text-base-content/40 focus:outline-none pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-base-content/40 hover:text-base-content transition-colors p-1 cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Option */}
                <div className="flex items-center justify-between pt-1 px-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="checkbox checkbox-primary checkbox-xs rounded-md"
                    />
                    <span className="text-xs text-base-content/70 font-semibold">
                      Remember my username
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    disabled={disableButton || !isFormValid}
                    type="submit"
                    className={`btn btn-primary w-full h-12 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all text-sm font-black flex items-center justify-center gap-2 text-primary-content cursor-pointer ${
                      isFormValid ? "" : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={16} />
                  </button>
                </div>

                {/* Bottom Alternate Sign Up Action */}
                <div className="pt-2 text-center">
                  <p className="text-xs text-base-content/60">
                    Don’t have an account yet?{" "}
                    <Link
                      to="/signup"
                      className="text-primary hover:underline font-bold"
                    >
                      Create one here
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PHONE VIEW (< md) - ULTRA-PROFESSIONAL MOBILE THEME                   */}
      {/* ========================================================================= */}
      <div className="md:hidden relative w-full min-h-[100dvh] bg-base-100 flex flex-col justify-between py-4 px-4 overflow-y-auto">
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-secondary/15 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        {/* Alerts for Mobile */}
        <div className="relative z-30">
          {showErrorAlert && <ErrorAlert message={alertErrorMessage} top={10} />}
          {showSuccessAlert && <SuccessAlert message={alertSuccessMessage} top={10} />}
        </div>

        {/* Mobile Header / Top Bar */}
        <div className="relative z-10 flex items-center justify-between pt-1 pb-3">
          <Link
            to="/"
            className="w-8 h-8 rounded-xl bg-base-200/80 border border-base-content/10 flex items-center justify-center text-base-content/70 hover:text-base-content active:scale-95 transition-all shadow-xs"
            aria-label="Back to home"
          >
            <ArrowLeft size={16} />
          </Link>

          <Link to="/" className="flex items-center gap-2 font-black select-none">
            <div className="w-7 h-7 rounded-lg bg-base-200 border border-base-content/10 flex items-center justify-center overflow-hidden p-0.5 shadow-2xs">
              <img src="/favicon/favicon.svg" alt="Progress Pulse Logo" className="w-full h-full object-contain" />
            </div>
            <span className="tracking-tight text-base-content font-extrabold text-sm flex items-center gap-1.5">
              Progress Pulse
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </span>
          </Link>

          <Link
            to="/signup"
            className="text-xs font-bold text-primary px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 active:scale-95 transition-all"
          >
            Sign Up
          </Link>
        </div>

        {/* Center Content Container */}
        <div className="relative z-10 w-full max-w-sm mx-auto my-auto py-2">
          {/* Eyebrow & Titles */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-[11px] font-bold mb-2.5 shadow-2xs">
              <Sparkles size={12} className="text-primary animate-pulse" />
              <span>Welcome back</span>
            </div>
            <h1 className="text-2xl font-black text-base-content tracking-tight">
              Sign in to your account
            </h1>
            <p className="text-xs text-base-content/60 font-medium mt-1">
              Resume your habits, cashflow & wealth progress
            </p>
          </div>

          {/* Segmented Switcher */}
          <div className="grid grid-cols-2 p-1 bg-base-200/80 rounded-2xl border border-base-content/10 mb-4 text-xs font-bold shadow-2xs">
            <button
              type="button"
              className="py-2 rounded-xl bg-primary text-primary-content shadow-xs font-black text-center"
            >
              Sign In
            </button>
            <Link
              to="/signup"
              className="py-2 rounded-xl text-center text-base-content/60 hover:text-base-content transition-all font-bold flex items-center justify-center"
            >
              Create Account
            </Link>
          </div>

          {/* Mobile Form Card */}
          <div className="w-full bg-base-100/90 backdrop-blur-xl border border-base-content/10 p-5 rounded-2xl shadow-xl relative overflow-hidden">
            {isCheckingAuth && (localStorage.getItem("token") || localStorage.getItem("refreshToken")) && (
              <div className="flex items-center justify-center gap-2 p-2 mb-4 bg-primary/10 border border-primary/20 rounded-xl text-primary text-[11px] font-semibold animate-pulse">
                <span className="loading loading-spinner loading-xs"></span>
                <span>Restoring session...</span>
              </div>
            )}

            <form onSubmit={loginUser} className="space-y-3.5">
              {/* Username Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5 ml-0.5">
                  <User size={13} className="text-primary" />
                  <span>Username</span>
                </label>
                <div className="relative flex items-center rounded-xl bg-base-200/60 hover:bg-base-200/90 focus-within:bg-base-100 border border-base-content/15 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all h-11 px-3">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    required
                    pattern="[A-Za-z][A-Za-z ]*"
                    minLength="3"
                    maxLength="30"
                    autoComplete="username"
                    className="w-full bg-transparent text-sm font-semibold text-base-content placeholder:text-base-content/40 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between ml-0.5">
                  <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
                    <Lock size={13} className="text-primary" />
                    <span>Password</span>
                  </label>
                  <Link
                    to="/forgot_Password_Verify"
                    className="text-xs text-primary hover:underline font-bold"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative flex items-center rounded-xl bg-base-200/60 hover:bg-base-200/90 focus-within:bg-base-100 border border-base-content/15 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all h-11 px-3">
                  <input
                    name="password"
                    value={formData.password}
                    type={showPassword ? "text" : "password"}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength="8"
                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                    autoComplete="current-password"
                    className="w-full bg-transparent text-sm font-semibold text-base-content placeholder:text-base-content/40 focus:outline-none pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 text-base-content/40 hover:text-base-content transition-colors p-1 cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-0.5 px-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="checkbox checkbox-primary checkbox-xs rounded-md"
                  />
                  <span className="text-xs text-base-content/70 font-semibold">
                    Remember my username
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-1.5 space-y-2">
                <button
                  disabled={disableButton || !isFormValid}
                  type="submit"
                  className={`btn btn-primary w-full h-11 rounded-xl shadow-md shadow-primary/25 active:scale-[0.98] transition-all text-sm font-black flex items-center justify-center gap-2 text-primary-content ${
                    isFormValid ? "" : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={15} />
                </button>

                {/* Instant Demo Login Button */}
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  disabled={disableButton}
                  className="btn btn-outline border-base-content/20 hover:border-primary/40 bg-base-200/40 w-full h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-base-content/85"
                >
                  <Zap size={13} className="text-amber-500 fill-amber-500" />
                  <span>One-Tap Demo Login</span>
                </button>
              </div>

              {/* Bottom Switch Link */}
              <div className="pt-1 text-center">
                <p className="text-xs text-base-content/60">
                  Don’t have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-primary hover:underline font-bold"
                  >
                    Create one here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Mobile Trust & Security Footer */}
        <div className="relative z-10 pt-4 pb-2 text-center">
          <div className="flex items-center justify-center gap-3 text-[11px] text-base-content/50 font-semibold">
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-500" /> 256-Bit Encrypted
            </span>
            <span>•</span>
            <span>🔒 JWT Secure</span>
            <span>•</span>
            <span>⚡ Instant Load</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
