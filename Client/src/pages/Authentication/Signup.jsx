import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import ErrorAlert from "../../utils/Alerts/ErrorAlert";
import SuccessAlert from "../../utils/Alerts/SuccessAlert";
import { useLoading } from "../../Context/LoadingContext";
import { TitleChanger } from "../../utils/TitleChanger";
import SignupLeftCard from "../../components/Authentication/SignupLeftCaard";
import { User, Mail, Lock, ShieldCheck, Eye, EyeOff, ArrowRight, ArrowLeft, Sparkles, Check, X } from "lucide-react";

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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertErrorMessage, setAlertErrorMessage] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertSuccessMessage, setalertSuccessMessage] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setFormData((prev) => ({ ...prev, password: val }));
    if (confirmPassword) {
      setError(val !== confirmPassword ? "Passwords do not match!" : "");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const val = e.target.value;
    setConfirmPassword(val);
    setError(password !== val ? "Passwords do not match!" : "");
  };

  // Live validation rules
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  const isNameValid = /^[A-Za-z ]{3,30}$/.test(formData.username.trim());
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const isPasswordValid = hasMinLen && hasUpper && hasLower && hasNumber;
  const isFormValid = isNameValid && isEmailValid && isPasswordValid && passwordsMatch && error === "";

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
      setalertSuccessMessage("OTP Generated to your email");
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
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP VIEW (md and up) - 100% ORIGINAL & UNTOUCHED                    */}
      {/* ========================================================================= */}
      <div className="hidden md:flex relative w-full min-h-[100dvh] bg-base-300 items-center justify-center py-8 px-4 sm:px-6 md:px-8 overflow-y-auto">
        {/* Background Animated Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          {/* Left Side (Desktop Only) */}
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="hidden md:flex w-1/2 flex-col justify-center items-center p-8 relative"
          >
            <SignupLeftCard />
          </motion.div>

          {/* Right Side - Signup Form Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full md:w-1/2 max-w-md"
          >
            <div className="w-full bg-base-100/80 backdrop-blur-2xl border border-base-content/10 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              {showErrorAlert && <ErrorAlert message={alertErrorMessage} />}
              {showSuccessAlert && <SuccessAlert message={alertSuccessMessage} />}

              {/* Segmented Auth Switcher (Sign In / Sign Up) */}
              <div className="grid grid-cols-2 p-1 bg-base-200/80 rounded-2xl border border-base-300/80 mb-6 text-xs font-bold">
                <Link
                  to="/login"
                  className="py-2 rounded-xl text-center text-base-content/60 hover:text-base-content transition-all font-bold flex items-center justify-center"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  className="py-2 rounded-xl bg-primary text-primary-content shadow-xs transition-all font-black text-center"
                >
                  Create Account
                </button>
              </div>

              {/* Header Text */}
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
                  Create Account
                </h1>
                <p className="text-xs sm:text-sm text-base-content/60 font-medium mt-1">
                  Join us to start tracking habits, expenses, and growth
                </p>
              </div>

              <form className="space-y-4" onSubmit={registerUser}>
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5 ml-1">
                    <User size={13} className="text-primary" />
                    <span>Full Name</span>
                  </label>
                  <div className="relative flex items-center rounded-2xl bg-base-200/50 hover:bg-base-200/80 focus-within:bg-base-100 border border-base-300/80 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all h-12 px-3.5">
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      required
                      pattern="[A-Za-z][A-Za-z ]*"
                      minLength="3"
                      maxLength="30"
                      title="Only letters and spaces allowed (3-30 characters)"
                      autoComplete="name"
                      className="w-full bg-transparent text-sm font-semibold text-base-content placeholder:text-base-content/40 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5 ml-1">
                    <Mail size={13} className="text-primary" />
                    <span>Email Address</span>
                  </label>
                  <div className="relative flex items-center rounded-2xl bg-base-200/50 hover:bg-base-200/80 focus-within:bg-base-100 border border-base-300/80 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all h-12 px-3.5">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      required
                      autoComplete="email"
                      className="w-full bg-transparent text-sm font-semibold text-base-content placeholder:text-base-content/40 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="space-y-3">
                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5 ml-1">
                      <Lock size={13} className="text-primary" />
                      <span>Password</span>
                    </label>
                    <div className="relative flex items-center rounded-2xl bg-base-200/50 hover:bg-base-200/80 focus-within:bg-base-100 border border-base-300/80 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all h-12 px-3.5">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        required
                        minLength="8"
                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                        autoComplete="new-password"
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

                  {/* Confirm Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-primary" />
                        <span>Confirm Password</span>
                      </label>
                      {confirmPassword && (
                        <span className={`text-[11px] font-bold flex items-center gap-1 ${passwordsMatch ? "text-emerald-500" : "text-rose-500"}`}>
                          {passwordsMatch ? (
                            <>
                              <Check size={12} />
                              <span>Matched</span>
                            </>
                          ) : (
                            <>
                              <X size={12} />
                              <span>Mismatch</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="relative flex items-center rounded-2xl bg-base-200/50 hover:bg-base-200/80 focus-within:bg-base-100 border border-base-300/80 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all h-12 px-3.5">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        placeholder="••••••••"
                        required
                        minLength="8"
                        autoComplete="new-password"
                        className="w-full bg-transparent text-sm font-semibold text-base-content placeholder:text-base-content/40 focus:outline-none pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 text-base-content/40 hover:text-base-content transition-colors p-1 cursor-pointer"
                        title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Requirement Guidance */}
                {password.length > 0 && (
                  <div className="p-2.5 bg-base-200/60 rounded-xl border border-base-300/60 space-y-1 text-[11px]">
                    <span className="font-bold text-base-content/60 block">Password Requirements:</span>
                    <div className="grid grid-cols-2 gap-1 font-medium">
                      <span className={`flex items-center gap-1 ${hasMinLen ? "text-emerald-500 font-bold" : "text-base-content/50"}`}>
                        {hasMinLen ? "✓" : "○"} Min 8 characters
                      </span>
                      <span className={`flex items-center gap-1 ${hasUpper && hasLower ? "text-emerald-500 font-bold" : "text-base-content/50"}`}>
                        {hasUpper && hasLower ? "✓" : "○"} Upper & Lowercase
                      </span>
                      <span className={`flex items-center gap-1 ${hasNumber ? "text-emerald-500 font-bold" : "text-base-content/50"}`}>
                        {hasNumber ? "✓" : "○"} At least 1 number
                      </span>
                      <span className={`flex items-center gap-1 ${passwordsMatch ? "text-emerald-500 font-bold" : "text-base-content/50"}`}>
                        {passwordsMatch ? "✓" : "○"} Passwords match
                      </span>
                    </div>
                  </div>
                )}

                {error && <p className="text-error text-center text-xs font-semibold">{error}</p>}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    disabled={disableButton || !isFormValid}
                    type="submit"
                    className={`btn btn-primary w-full h-12 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all text-sm font-black flex items-center justify-center gap-2 text-primary-content cursor-pointer ${
                      isFormValid ? "" : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <span>Create Account</span>
                    <ArrowRight size={16} />
                  </button>
                </div>

                {/* Bottom Alternate Sign In Action */}
                <div className="pt-2 text-center">
                  <p className="text-xs text-base-content/60">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-primary hover:underline font-bold"
                    >
                      Sign in here
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
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-secondary/15 rounded-full blur-3xl animate-pulse-slow"></div>
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
            to="/login"
            className="text-xs font-bold text-primary px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 active:scale-95 transition-all"
          >
            Sign In
          </Link>
        </div>

        {/* Center Content Container */}
        <div className="relative z-10 w-full max-w-sm mx-auto my-auto py-2">
          {/* Eyebrow & Titles */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-[11px] font-bold mb-2.5 shadow-2xs">
              <Sparkles size={12} className="text-primary animate-pulse" />
              <span>Start in 30 seconds</span>
            </div>
            <h1 className="text-2xl font-black text-base-content tracking-tight">
              Create your account
            </h1>
            <p className="text-xs text-base-content/60 font-medium mt-1">
              Start tracking habits, cashflow & investments
            </p>
          </div>

          {/* Segmented Switcher */}
          <div className="grid grid-cols-2 p-1 bg-base-200/80 rounded-2xl border border-base-content/10 mb-4 text-xs font-bold shadow-2xs">
            <Link
              to="/login"
              className="py-2 rounded-xl text-center text-base-content/60 hover:text-base-content transition-all font-bold flex items-center justify-center"
            >
              Sign In
            </Link>
            <button
              type="button"
              className="py-2 rounded-xl bg-primary text-primary-content shadow-xs font-black text-center"
            >
              Create Account
            </button>
          </div>

          {/* Mobile Form Card */}
          <div className="w-full bg-base-100/90 backdrop-blur-xl border border-base-content/10 p-5 rounded-2xl shadow-xl relative overflow-hidden">
            <form className="space-y-3" onSubmit={registerUser}>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5 ml-0.5">
                  <User size={13} className="text-primary" />
                  <span>Full Name</span>
                </label>
                <div className="relative flex items-center rounded-xl bg-base-200/60 hover:bg-base-200/90 focus-within:bg-base-100 border border-base-content/15 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all h-11 px-3">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    required
                    pattern="[A-Za-z][A-Za-z ]*"
                    minLength="3"
                    maxLength="30"
                    title="Only letters and spaces allowed (3-30 characters)"
                    autoComplete="name"
                    className="w-full bg-transparent text-sm font-semibold text-base-content placeholder:text-base-content/40 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5 ml-0.5">
                  <Mail size={13} className="text-primary" />
                  <span>Email Address</span>
                </label>
                <div className="relative flex items-center rounded-xl bg-base-200/60 hover:bg-base-200/90 focus-within:bg-base-100 border border-base-content/15 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all h-11 px-3">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                    autoComplete="email"
                    className="w-full bg-transparent text-sm font-semibold text-base-content placeholder:text-base-content/40 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5 ml-0.5">
                  <Lock size={13} className="text-primary" />
                  <span>Password</span>
                </label>
                <div className="relative flex items-center rounded-xl bg-base-200/60 hover:bg-base-200/90 focus-within:bg-base-100 border border-base-content/15 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all h-11 px-3">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    required
                    minLength="8"
                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                    autoComplete="new-password"
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

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between ml-0.5">
                  <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-primary" />
                    <span>Confirm Password</span>
                  </label>
                  {confirmPassword && (
                    <span className={`text-[10px] font-bold flex items-center gap-1 ${passwordsMatch ? "text-emerald-500" : "text-rose-500"}`}>
                      {passwordsMatch ? (
                        <>
                          <Check size={11} />
                          <span>Matched</span>
                        </>
                      ) : (
                        <>
                          <X size={11} />
                          <span>Mismatch</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
                <div className="relative flex items-center rounded-xl bg-base-200/60 hover:bg-base-200/90 focus-within:bg-base-100 border border-base-content/15 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all h-11 px-3">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="••••••••"
                    required
                    minLength="8"
                    autoComplete="new-password"
                    className="w-full bg-transparent text-sm font-semibold text-base-content placeholder:text-base-content/40 focus:outline-none pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 text-base-content/40 hover:text-base-content transition-colors p-1 cursor-pointer"
                    title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Compact Password Requirements */}
              {password.length > 0 && (
                <div className="p-2 bg-base-200/60 rounded-xl border border-base-content/10 grid grid-cols-2 gap-1 text-[10px] font-semibold">
                  <span className={`flex items-center gap-1 ${hasMinLen ? "text-emerald-500 font-bold" : "text-base-content/50"}`}>
                    {hasMinLen ? "✓" : "○"} Min 8 chars
                  </span>
                  <span className={`flex items-center gap-1 ${hasUpper && hasLower ? "text-emerald-500 font-bold" : "text-base-content/50"}`}>
                    {hasUpper && hasLower ? "✓" : "○"} Upper & Lower
                  </span>
                  <span className={`flex items-center gap-1 ${hasNumber ? "text-emerald-500 font-bold" : "text-base-content/50"}`}>
                    {hasNumber ? "✓" : "○"} 1+ Number
                  </span>
                  <span className={`flex items-center gap-1 ${passwordsMatch ? "text-emerald-500 font-bold" : "text-base-content/50"}`}>
                    {passwordsMatch ? "✓" : "○"} Matched
                  </span>
                </div>
              )}

              {error && <p className="text-error text-center text-xs font-semibold">{error}</p>}

              {/* Submit Button */}
              <div className="pt-1.5 space-y-2">
                <button
                  disabled={disableButton || !isFormValid}
                  type="submit"
                  className={`btn btn-primary w-full h-11 rounded-xl shadow-md shadow-primary/25 active:scale-[0.98] transition-all text-sm font-black flex items-center justify-center gap-2 text-primary-content ${
                    isFormValid ? "" : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <span>Create Free Account</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              {/* Bottom Alternate Sign In Action */}
              <div className="pt-1 text-center">
                <p className="text-xs text-base-content/60">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-primary hover:underline font-bold"
                  >
                    Sign in here
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
              <ShieldCheck size={12} className="text-emerald-500" /> 100% Private
            </span>
            <span>•</span>
            <span>⚡ Instant Setup</span>
            <span>•</span>
            <span>✨ Free Starter Tier</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
