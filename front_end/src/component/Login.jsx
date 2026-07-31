import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShieldAlt, FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import "./Login.css";
import axios from "axios";


const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setLoginData({
      ...loginData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!loginData.username || !loginData.password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/login/",
      {
        username: loginData.username,
        password: loginData.password,
      }
    );

    console.log(response.data);

    // Save JWT Tokens
    localStorage.setItem("access", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);

    // Save User Details
    localStorage.setItem("username", response.data.username);
    localStorage.setItem("role", response.data.role);

    // Navigate based on role
    if (response.data.role === "EMPLOYEE") {
      navigate("/dashboard");
    } else if (response.data.role === "ADMIN") {
      navigate("/AdminDashboard");
    } else if (response.data.role === "SUPPORT") {
      navigate("/Supportdashboard");
    } else {
      alert("Invalid User Role");
    }

  } catch (error) {
    console.error(error);

    if (error.response) {
      alert(error.response.data.message || "Invalid Username or Password");
    } else {
      alert("Server Error");
    }
  }
};
  return (
    <div className="login-page">

      <div className="login-left">

        <FaShieldAlt className="shield" />

        <h1>Compliance Management System</h1>

        <p>
          Securely manage audits, findings, corrective actions,
          documents, reports and compliance.
        </p>

      </div>

      <div className="login-right" >

        <div className="login-card">

          <h1 > WELCOME </h1>

          <p>Login to continue</p>

          <form onSubmit={handleSubmit}>

            <div className="input-box">

              <FaEnvelope className="icon"/>

              <input
                type="username"
                name="username"
                placeholder="username"
                value={loginData.username}
                onChange={handleChange}
              />

            </div>

            <div className="input-box">

              <FaLock className="icon"/>

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={handleChange}
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="eye"
              >
                {showPassword ? <FaEyeSlash/> : <FaEye/>}
              </span>

            </div>

            <div className="options">

              <label>

                <input
                  type="checkbox"
                  name="remember"
                  checked={loginData.remember}
                  onChange={handleChange}
                />

                Remember Me

              </label>

              <a href="/">Forgot Password?</a>

            </div>

            <button className="login-btn">
              Login
            </button>

            <div className="register">

              Don't have an account?

              <Link to="/register"> Register</Link>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
};

export default Login;