import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  FaCheckCircle,
  FaChevronDown,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaFileAlt,
  FaLock,
  FaPhoneAlt,
  FaShieldAlt,
  FaTimes,
  FaUser,
  FaUserPlus,
  FaUserTag,
} from "react-icons/fa";

import "./Register.css";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const Register = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    role: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "phone") {
      setFormData((previousData) => ({
        ...previousData,
        phone: value.replace(/\D/g, ""),
      }));
    } else {
      setFormData((previousData) => ({
        ...previousData,
        [name]: value,
      }));
    }

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/register/`,
        formData
      );

      console.log(response.data);

      setFormData({
        username: "",
        email: "",
        phone: "",
        role: "",
        password: "",
      });

      navigate("/", {
        replace: true,
        state: { registered: true },
      });
    } catch (error) {
      console.error("Registration error:", error);

      const responseData = error.response?.data;

      if (responseData) {
        const firstFieldError =
          typeof responseData === "object"
            ? Object.values(responseData)?.[0]
            : null;

        setErrorMessage(
          responseData.message ||
            responseData.detail ||
            responseData.error ||
            (Array.isArray(firstFieldError)
              ? firstFieldError[0]
              : firstFieldError) ||
            "We couldn't create your account. Check your details and try again."
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
    <main className="royal-register-page">
      <section className="register-presentation">
        <div className="reg-presentation-glow reg-presentation-glow-one" />
        <div className="reg-presentation-glow reg-presentation-glow-two" />

        <div className="register-brand">
          <div className="register-brand-icon">
            <FaShieldAlt />
          </div>

          <div>
            <h2>ComplyFlow</h2>
            <span>Compliance Management System</span>
          </div>
        </div>

        <div className="reg-presentation-content">
          <span className="reg-presentation-kicker">
            Create your workspace account
          </span>

          <h1>Join the platform built for clarity, control and confidence.</h1>

          <p>
            Set up your account to submit, track and resolve compliance
            matters from one secure enterprise workspace.
          </p>

          <div className="reg-presentation-features">
            <div className="reg-presentation-feature">
              <span>
                <FaUserTag />
              </span>

              <div>
                <strong>Choose your role</strong>
                <p>
                  Sign up as an employee, administrator or support agent to
                  get the right access from day one.
                </p>
              </div>
            </div>

            <div className="reg-presentation-feature">
              <span>
                <FaFileAlt />
              </span>

              <div>
                <strong>Full ticket lifecycle</strong>
                <p>
                  Submit and follow complaints from first report through
                  final resolution.
                </p>
              </div>
            </div>

            <div className="reg-presentation-feature">
              <span>
                <FaShieldAlt />
              </span>

              <div>
                <strong>Secure by default</strong>
                <p>
                  Your credentials are protected and every session is
                  JWT-authenticated.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="reg-presentation-footer">
          <span>Enterprise compliance portal</span>
          <span>Secure • Controlled • Reliable</span>
        </div>
      </section>

      <section className="register-form-section">
        <div className="register-form-container">
          <div className="mobile-register-brand">
            <div className="register-brand-icon">
              <FaShieldAlt />
            </div>

            <div>
              <h2>ComplyFlow</h2>
              <span>Compliance Portal</span>
            </div>
          </div>

          <div className="register-heading">
            <span>New account</span>

            <h1>Create your account</h1>

            <p>Fill in your details to get access to the compliance workspace.</p>
          </div>

          {errorMessage && (
            <div className="register-error" role="alert">
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

          <form className="royal-register-form" onSubmit={handleSubmit}>
            <div className="register-field">
              <label htmlFor="register-username">Username</label>

              <div className="register-input-control">
                <FaUser />

                <input
                  id="register-username"
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  pattern="[A-Za-z][A-Za-z0-9_]{2,14}"
                  minLength={3}
                  maxLength={15}
                  title="Username must start with a letter and contain only letters, numbers, and underscore (3-15 characters)."
                  autoComplete="username"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="register-two-col">
              <div className="register-field">
                <label htmlFor="register-email">Email</label>

                <div className="register-input-control">
                  <FaEnvelope />

                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    title="Enter a valid email address."
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="register-phone">Phone number</label>

                <div className="register-input-control">
                  <FaPhoneAlt />

                  <input
                    id="register-phone"
                    type="tel"
                    name="phone"
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={handleChange}
                    pattern="[6-9][0-9]{9}"
                    minLength={10}
                    maxLength={10}
                    title="Enter a valid 10-digit phone number starting with 6-9."
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="register-role">Role</label>

              <div className="register-input-control">
                <FaUserTag />

                <select
                  id="register-role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select your role
                  </option>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPPORT">Support</option>
                </select>

                <FaChevronDown className="select-chevron" />
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="register-password">Password</label>

              <div className="register-input-control">
                <FaLock />

                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                  minLength={8}
                  title="Password must be at least 8 characters and include one uppercase letter, one lowercase letter, one number, and one special character."
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((previousValue) => !previousValue)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <p className="register-hint">
                8+ characters, with uppercase, lowercase, a number and a symbol.
              </p>
            </div>

            <button type="submit" className="royal-register-button" disabled={submitting}>
              <FaUserPlus />

              <span>{submitting ? "Creating account..." : "Create account"}</span>
            </button>

            <div className="register-login-message">
              <span>Already have an account?</span>
              <Link to="/">Sign in</Link>
            </div>
          </form>

          <div className="register-security-note">
            <FaCheckCircle />

            <span>
              Your details are encrypted in transit and never shared outside
              your organization.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Register;