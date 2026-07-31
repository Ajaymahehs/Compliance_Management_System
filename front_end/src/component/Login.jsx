import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaFileAlt,
  FaLock,
  FaShieldAlt,
  FaSignInAlt,
  FaTimes,
  FaUser,
} from "react-icons/fa";

import "./Login.css";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
    remember: false,
  });

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setLoginData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const username = loginData.username.trim();
    const password = loginData.password;

    if (!username || !password) {
      setErrorMessage(
        "Enter your username and password to continue."
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/login/`,
        {
          username,
          password,
        }
      );

      const {
        access,
        refresh,
        username: responseUsername,
        role,
      } = response.data;

      if (!access || !refresh || !role) {
        throw new Error(
          "The login response is missing required user information."
        );
      }

      /*
       * Your dashboards currently read from localStorage.
       * Therefore, tokens must remain in localStorage.
       */
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem(
        "username",
        responseUsername || username
      );
      localStorage.setItem("role", role);
      localStorage.setItem(
        "remember",
        String(loginData.remember)
      );

      const normalizedRole = role.toUpperCase();

      if (normalizedRole === "EMPLOYEE") {
        navigate("/dashboard", { replace: true });
      } else if (normalizedRole === "ADMIN") {
        navigate("/AdminDashboard", {
          replace: true,
        });
      } else if (normalizedRole === "SUPPORT") {
        navigate("/Supportdashboard", {
          replace: true,
        });
      } else {
        localStorage.clear();
        setErrorMessage(
          "Your account has an unsupported role."
        );
      }
    } catch (error) {
      console.error("Login error:", error);

      const responseData = error.response?.data;

      if (responseData) {
        setErrorMessage(
          responseData.message ||
            responseData.detail ||
            responseData.error ||
            "Invalid username or password."
        );
      } else {
        setErrorMessage(
          "Unable to connect to the server. Check that the backend is running."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="royal-login-page">
      <section className="login-presentation">
        <div className="presentation-glow presentation-glow-one" />
        <div className="presentation-glow presentation-glow-two" />

        <div className="login-brand">
          <div className="login-brand-icon">
            <FaShieldAlt />
          </div>

          <div>
            <h2>ComplyFlow</h2>
            <span>Compliance Management System</span>
          </div>
        </div>

        <div className="presentation-content">
          <span className="presentation-kicker">
            Secure compliance workspace
          </span>

          <h1>
            Governance built for clarity, control and
            confidence.
          </h1>

          <p>
            Manage complaints, assignments, evidence and
            resolutions through one secure enterprise
            platform.
          </p>

          <div className="presentation-features">
            <div className="presentation-feature">
              <span>
                <FaCheckCircle />
              </span>

              <div>
                <strong>Role-based access</strong>
                <p>
                  Dedicated portals for employees,
                  administrators and support teams.
                </p>
              </div>
            </div>

            <div className="presentation-feature">
              <span>
                <FaFileAlt />
              </span>

              <div>
                <strong>Complete ticket lifecycle</strong>
                <p>
                  Track complaints from initial submission
                  through final resolution.
                </p>
              </div>
            </div>

            <div className="presentation-feature">
              <span>
                <FaShieldAlt />
              </span>

              <div>
                <strong>Secure operations</strong>
                <p>
                  JWT-protected access with controlled
                  permissions for every role.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="presentation-footer">
          <span>Enterprise compliance portal</span>
          <span>Secure • Controlled • Reliable</span>
        </div>
      </section>

      <section className="login-form-section">
        <div className="login-form-container">
          <div className="mobile-login-brand">
            <div className="login-brand-icon">
              <FaShieldAlt />
            </div>

            <div>
              <h2>ComplyFlow</h2>
              <span>Compliance Portal</span>
            </div>
          </div>

          <div className="login-heading">
            <span>Secure account access</span>

            <h1>Welcome back</h1>

            <p>
              Sign in to access your compliance workspace.
            </p>
          </div>

          {errorMessage && (
            <div className="login-error" role="alert">
              <FaShieldAlt />

              <span>{errorMessage}</span>

              <button
                type="button"
                aria-label="Dismiss error"
                onClick={() => setErrorMessage("")}
              >
                <FaTimes />
              </button>
            </div>
          )}

          <form
            className="royal-login-form"
            onSubmit={handleSubmit}
          >
            <div className="login-field">
              <label htmlFor="login-username">
                Username
              </label>

              <div className="login-input-control">
                <FaUser />

                <input
                  id="login-username"
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={loginData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <div className="login-label-row">
                <label htmlFor="login-password">
                  Password
                </label>

                <Link to="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <div className="login-input-control">
                <FaLock />

                <input
                  id="login-password"
                  type={
                    showPassword ? "text" : "password"
                  }
                  name="password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() =>
                    setShowPassword(
                      (previousValue) =>
                        !previousValue
                    )
                  }
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>
              </div>
            </div>

            <label className="remember-control">
              <input
                type="checkbox"
                name="remember"
                checked={loginData.remember}
                onChange={handleChange}
              />

              <span className="custom-checkbox">
                <FaCheckCircle />
              </span>

              <span>Keep me signed in</span>
            </label>

            <button
              type="submit"
              className="royal-login-button"
              disabled={submitting}
            >
              <FaSignInAlt />

              <span>
                {submitting
                  ? "Signing in..."
                  : "Sign in securely"}
              </span>
            </button>

            <div className="login-divider">
              <span>New to the portal?</span>
            </div>

            <div className="register-message">
              <span>Don't have an account?</span>

              <Link to="/register">
                Create an account
              </Link>
            </div>
          </form>

          <div className="login-security-note">
            <FaLock />

            <span>
              Your session is protected using secure JWT
              authentication.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;