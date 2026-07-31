import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./EmployeeDashboard.css";

const EmployeeDashboard = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("access");
  const username = localStorage.getItem("username") || "Employee";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "LOW",
  });

  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTickets();
  }, []);

  // Fetch Employee Tickets
  const fetchTickets = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/my-tickets/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTickets(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Raise Ticket
  const raiseTicket = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/tickets/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Complaint Raised Successfully");

      setFormData({
        title: "",
        description: "",
        priority: "LOW",
      });

      fetchTickets();
    } catch (error) {
      console.log(error);
      alert("Unable to Raise Complaint");
    }
  };

  // Logout
  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Ticket Counts
  const openCount = tickets.filter(
    (ticket) => ticket.status === "OPEN"
  ).length;

  const progressCount = tickets.filter(
    (ticket) => ticket.status === "IN_PROGRESS"
  ).length;

  const closedCount = tickets.filter(
    (ticket) => ticket.status === "CLOSED"
  ).length;

  // Search
  const filteredTickets = tickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard">

      {/* Navbar */}

      <div className="navbar">

        <h2>Compliance Management System</h2>

        <div className="nav-right">
          <span className="welcome">
            Welcome, {username}
          </span>

          <button onClick={logout}>
            Logout
          </button>
        </div>

      </div>

      {/* Dashboard Cards */}

      <div className="cards">

        <div className="card open">
          <h4>Open</h4>
          <h2>{openCount}</h2>
        </div>

        <div className="card progress">
          <h4>In Progress</h4>
          <h2>{progressCount}</h2>
        </div>

        <div className="card closed">
          <h4>Closed</h4>
          <h2>{closedCount}</h2>
        </div>

      </div>

      {/* Main Section */}

      <div className="container">

        {/* Left Side */}

        <div className="left">

          <h2>Raise Complaint</h2>

          <form onSubmit={raiseTicket}>

            <input
              type="text"
              name="title"
              placeholder="Complaint Title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <textarea
              name="description"
              placeholder="Describe your complaint..."
              value={formData.description}
              onChange={handleChange}
              required
            />

            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>

            <button type="submit">
              Raise Complaint
            </button>

          </form>

        </div>

        {/* Right Side */}

        <div className="right">

          <h2>My Tickets</h2>

          <input
            type="text"
            className="search"
            placeholder="Search Ticket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <table>

            <thead>

              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
              </tr>

            </thead>

            <tbody>

              {filteredTickets.length === 0 ? (

                <tr>

                  <td colSpan="5">
                    No Tickets Found
                  </td>

                </tr>

              ) : (

                filteredTickets.map((ticket) => (

                  <tr key={ticket.id}>

                    <td>{ticket.id}</td>

                    <td>{ticket.title}</td>

                    <td>{ticket.priority}</td>

                    <td>

                      <span
                        className={`status ${ticket.status.toLowerCase()}`}
                      >
                        {ticket.status.replace("_", " ")}
                      </span>

                    </td>

                    <td>
                      {ticket.assigned_to || "--"}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default EmployeeDashboard;