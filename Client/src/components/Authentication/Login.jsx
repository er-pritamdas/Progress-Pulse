import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";


function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <div className="flex w-full mt-2 justify-center items-center h-screen">
        <div className="card bg-base-300 rounded-box grid h-170 grow place-items-center">
          Content
        </div>
        <div className="divider divider-horizontal"></div>
        <div className="card bg-base-300 rounded-box grid h-170 grow place-items-center">

          <fieldset className="fieldset w-full max-w-lg bg-base-200 border border-base-300 p-6 rounded-box">
            <legend className="fieldset-legend text-2xl font-bold">Login</legend>

            <label className="fieldset-label text-lg">Email</label>
            <input type="email" className="input validator input-lg w-full" placeholder="Email" required />

            <label className="fieldset-label text-lg mt-2">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="input validator input-lg w-full"
              required
              placeholder="Password"
              minLength="8"
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
              title="Must be more than 8 characters, including a number, a lowercase letter, and an uppercase letter"
            />

            {/* Show Password Checkbox */}
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="showPassword"
                className="mr-2"
                onChange={() => setShowPassword(!showPassword)}
              />
              <label htmlFor="showPassword" className="text-sm fieldset-label">Show Password</label>
            </div>

            <p className="text-right text-sm mt-1">
              <a href="#" className="link link-info">Forgot Password?</a>
            </p>

            <button className="btn btn-neutral btn-lg mt-4 w-full">Login</button>

            <p className="text-center mt-4 text-sm">
              Don't have an account? <Link to="/signup" className="link link-hover">Sign up here</Link>
            </p>
          </fieldset>

        </div>
      </div>
    </>
  );
}

export default Login;
