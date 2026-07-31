    import React, { useState } from "react";
import "./Register.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";



function Register() {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    role: "",
    password: "",
  });



  const handleChange = (e) => {
    const { name, value } = e.target;

    // Allow only digits for phone number
    if (name === "phone") {
      const phone = value.replace(/\D/g, "");
      setFormData({
        ...formData,
        phone: phone,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/register/",
      formData
    );

    alert("Registration Successful");
    navigate("/");
    console.log(response.data);

    setFormData({
      username: "",
      email: "",
      phone: "",
      role: "",
      password: "",
    });



  } catch (error) {
  console.log(error);

  if (error.response) {
    console.log("Status:", error.response.status);
    console.log("Data:", error.response.data);

    alert(JSON.stringify(error.response.data));
  } else {
    alert(error.message);
    
  }
}
};

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Compliance Management System</h2>
        <p>Create Your Account</p>

        <form onSubmit={handleSubmit}>

          {/* Username */}
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter Username"
              value={formData.username}
              onChange={handleChange}
              pattern="[A-Za-z][A-Za-z0-9_]{2,14}"
              minLength={3}
              maxLength={15}
              title="Username must start with a letter and contain only letters, numbers, and underscore (3-15 characters)."
              required
            />
          </div>

          {/* Email */}
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleChange}
              title="Enter a valid email address."
              required
            />
          </div>

          {/* Phone */}
          <div className="input-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter Phone Number"
              value={formData.phone}
              onChange={handleChange}
              pattern="[6-9][0-9]{9}"
              minLength={10}
              maxLength={10}
              title="Enter a valid 10-digit phone number starting with 6-9."
              required
            />
          </div>

          {/* Role */}
          <div className="input-group">
            <label>Role</label>

            <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                >
                <option value="">Select Role</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPPORT">support</option>
                <option value="EMPLOYEE">Employee</option>
            </select>
          </div>

          {/* Password */}
          <div className="input-group">
            <label>Password</label>
            <input
                type="password"
                name="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                minLength={8}
                title="Password must be at least 8 characters and include one uppercase letter, one lowercase letter, one number, and one special character."
                required
            />
          </div>

          <button type="submit">
            Register
          </button>

        </form>
      </div>
    </div>
  );
}

export default Register;