import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSignup } from "../hooks/apis/mutations/useSignup.js";
import { VscPerson, VscMail, VscLock, VscEye, VscEyeClosed, VscCode } from "react-icons/vsc";
import "./Auth.css";

export default function Signup() {
  const navigate = useNavigate();
  const { signupMutation, isPending } = useSignup();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
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

    if (!formData.username.trim() || formData.username.trim().length < 3) {
      setErrorMessage("Username must be at least 3 characters.");
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    try {
      await signupMutation({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      // Redirect to projects/editor on successful registration
      navigate("/project");
    } catch (err) {
      setErrorMessage(err.message || "Sign up failed. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <VscCode size={30} /> ProjectIdx
          </div>
          <div className="auth-subtitle">Create an account to start coding</div>
        </div>

        {errorMessage && (
          <div className="auth-error-banner" role="alert">
            {errorMessage}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate={false}>
          {/* Username */}
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <div className="input-wrapper">
              <VscPerson className="input-icon" />
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                spellCheck="false"
                required
                className="auth-input"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div className="input-wrapper">
              <VscMail className="input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                spellCheck="false"
                required
                className="auth-input"
                placeholder="developer@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="new-password">
              Password (min. 6 characters)
            </label>
            <div className="input-wrapper">
              <VscLock className="input-icon" />
              <input
                id="new-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                className="auth-input"
                placeholder="Create a strong password"
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
            {isPending ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?
          <Link to="/signin" className="auth-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
