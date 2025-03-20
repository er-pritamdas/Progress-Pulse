import React, { useState } from 'react';

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Handle password matching validation
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (password !== e.target.value) {
      setError("Passwords do not match!");
    } else {
      setError("");
    }
  };

  return (
    <>
      <div className="flex w-full mt-2 justify-center items-center h-screen">
        <div className="card bg-base-300 rounded-box grid h-170 grow place-items-center">
          Content
        </div>
        <div className="divider divider-horizontal"></div>
        <div className="card bg-base-300 rounded-box grid h-170 grow place-items-center">

          <fieldset className="fieldset w-full max-w-lg bg-base-200 border border-base-300 p-6 rounded-box">
            <legend className="fieldset-legend text-2xl font-bold">Sign Up</legend>

            <label className="fieldset-label text-lg">Name</label>
            <input type="text" className="input validator input-lg w-full" placeholder="Full Name" required 
            pattern="[A-Za-z][A-Za-z]*" minlength="3" maxlength="30" title="Only letters" />

            <label className="fieldset-label text-lg mt-2">Email</label>
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
              onChange={(e) => setPassword(e.target.value)}
            />

            <label className="fieldset-label text-lg mt-2">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="input validator input-lg w-full"
              required
              placeholder="Confirm Password"
              minLength="8"
              onChange={handleConfirmPasswordChange}
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
            {/* Password Match Error */}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

            <button className="btn btn-neutral btn-lg mt-4 w-full">Sign Up</button>

            <p className="text-center mt-4 text-sm">
              Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login here</a>
            </p>
          </fieldset>

        </div>
      </div>
    </>
  );
}

export default Signup;
