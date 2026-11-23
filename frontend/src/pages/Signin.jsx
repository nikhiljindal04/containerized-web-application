import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSignin } from "../hooks/apis/mutations/useSignin.js";
import { VscMail, VscLock, VscEye, VscEyeClosed, VscCode } from "react-icons/vsc";
import "./Auth.css";

export default function Signin() {
  const navigate = useNavigate();
  const { signinMutation, isPending } = useSignin();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.identifier.trim()) {
      setErrorMessage("Please enter your email or username.");
      return;
    }
    if (!formData.password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    try {
      await signinMutation({
        identifier: formData.identifier.trim(),
        password: formData.password,
      });
      // Redirect to projects/editor on successful login
      navigate("/project");
    } catch (err) {
      setErrorMessage(err.message || "Sign in failed. Please check your credentials.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <VscCode size={30} /> ProjectIdx
          </div>
          <div className="auth-subtitle">Sign in to your account</div>
        </div>

        {errorMessage && (
          <div className="auth-error-banner" role="alert">
            {errorMessage}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate={false}>
          {/* Email or Username */}
          <div className="form-group">
            <label className="form-label" htmlFor="identifier">
              Email or Username
            </label>
            <div className="input-wrapper">
              <VscMail className="input-icon" />
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                spellCheck="false"
                required
                className="auth-input"
                placeholder="Enter your email or username"
                value={formData.identifier}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="current-password">
              Password
            </label>
            <div className="input-wrapper">
              <VscLock className="input-icon" />
              <input
                id="current-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="auth-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <VscEyeClosed /> : <VscEye />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isPending}
          >
            {isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?
          <Link to="/signup" className="auth-link">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
