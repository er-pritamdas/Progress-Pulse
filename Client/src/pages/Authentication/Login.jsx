import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import ErrorAlert from "../../utils/Alerts/ErrorAlert";
import SuccessAlert from "../../utils/Alerts/SuccessAlert";
import { useLoading } from "../../Context/LoadingContext";
import { useAuth } from "../../Context/JwtAuthContext";

function Login() {

  const {validToken } = useAuth();
  useEffect(() => {
    if (validToken) {
      navigate("/dashboard");
    }
  }, [validToken]);

  const { setLoading } = useLoading();

  //Variables
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [disableButton, setDisableButton] = useState(false);

  // -------------------------HandleChange Function for input Fileds-------------------------
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // -------------------------On Submit Function-------------------------
  //Error Alert Variables
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertErrorMessage, setAlertErrorMessage] = useState("");
  // Success Alert Variables
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertSuccessMessage, setalertSuccessMessage] = useState("");
  const loginUser = async (e) => {
    e.preventDefault();

    try {
      setLoading(true)
      setDisableButton(true);
      const response = await axios.post("/api/v1/users/loggedin", formData)
      setalertSuccessMessage("User Logged In Successfully");
      setShowSuccessAlert(true);
      setTimeout(() => {
        setLoading(false)
        setShowSuccessAlert(false)
        navigate("/dashboard", { state: { formData } });
      }, 4000);
      // console.log(response.data.data.accessToken)
      localStorage.setItem("token", response.data.data.accessToken);
      localStorage.setItem("username", formData.username);
    } catch (err) {
      setLoading(false)
      setDisableButton(false);
      const errorMessage = err.response?.data?.message || "Something went Wrong";
      setAlertErrorMessage(errorMessage);
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 4000);
    }
  };

  // -------------------------Return HTML Code-------------------------
  return (
    <>
      <div className="flex w-full mt-2 justify-center items-center h-screen">
        {/* // Left Card */}
        <div className="card bg-base-300 rounded-box grid h-170 grow place-items-center">
          Content
        </div>

        {/* // Divider */}
        <div className="divider divider-horizontal"></div>

        {/* // Right Card : The Login Page */}
        <div className="card bg-base-300 rounded-box grid h-170 grow place-items-center">

          {/* // Alerts Messages */}
          {showErrorAlert && <ErrorAlert message={alertErrorMessage} />}
          {showSuccessAlert && <SuccessAlert message={alertSuccessMessage} />}


          {/* Login Form*/}
          <form
            className="fieldset w-full max-w-lg bg-base-200 border border-base-300 p-6 rounded-box"
            onSubmit={loginUser}
          >
            <legend className="fieldset-legend text-2xl font-bold">
              Login
            </legend>

            {/* //User Name  */}
            <label className="fieldset-label text-lg">UserName</label>
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
            {/* //Password  */}
            <label className="fieldset-label text-lg mt-2">Password</label>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              className="input validator input-lg w-full"
              required
              placeholder="Password"
              minLength="8"
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
              title="Must be more than 8 characters, including a number, a lowercase letter, and an uppercase letter"
              onChange={handleChange}
            />

            {/* Show Password Checkbox */}
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

            {/*Forgot password*/}
            <p className="text-right text-sm mt-1">
              <a href="#" className="link link-info">
                Forgot Password?
              </a>
            </p>

            {/*Login Button*/}
            <button
              disabled={disableButton}
              className="btn btn-accent btn-lg mt-4 w-full"
              type="submit"
            >
              {/* <span className={`${disableButton ? 'loading loading-spinner text-primary' : ''}`}></span> */}
              <span>Login</span>
            </button>

            {/* // Sign Up Link */}
            <p className="text-center mt-4 text-sm">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-500 hover:underline">
                Sign up here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
