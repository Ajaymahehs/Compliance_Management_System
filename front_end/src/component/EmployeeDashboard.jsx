import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaBars,
  FaCheckCircle,
  FaClipboardList,
  FaClock,
  FaExclamationTriangle,
  FaHome,
  FaImage,
  FaPlusCircle,
  FaSearch,
  FaSignOutAlt,
  FaTimes,
  FaUserCircle,
} from "react-icons/fa";

import "./EmployeeDashboard.css";

const API_BASE_URL = "https://compliance-management-system-lyeu.onrender.com/api";

const EmployeeDashboard = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("access");
  const username = localStorage.getItem("username") || "Employee";

  const [tickets, setTickets] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "LOW",
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetchTickets();
  }, [token, navigate]);

  // Get employee tickets
  const fetchTickets = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/my-tickets/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTickets(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error("Fetch tickets error:", error);

      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/");
        return;
      }

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to load your complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle form input
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Raise a new complaint
  const raiseTicket = async (event) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      setErrorMessage(
        "Please enter a complaint title and description."
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      await axios.post(
        `${API_BASE_URL}/tickets/`,
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFormData({
        title: "",
        description: "",
        priority: "LOW",
      });

      await fetchTickets();

      alert("Complaint raised successfully.");
    } catch (error) {
      console.error("Raise complaint error:", error);

      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/");
        return;
      }

      const responseData = error.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const firstError = Object.values(responseData)[0];

        setErrorMessage(
          Array.isArray(firstError)
            ? firstError[0]
            : responseData.message ||
                "Unable to raise the complaint."
        );
      } else {
        setErrorMessage("Unable to raise the complaint.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Logout from backend and frontend
  const logout = async () => {
    const refreshToken = localStorage.getItem("refresh");

    try {
      if (refreshToken && token) {
        await axios.post(
          `${API_BASE_URL}/logout/`,
          {
            refresh: refreshToken,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.clear();
      navigate("/");
    }
  };

  // Render employee/support name safely
  const getUsername = (userValue) => {
    if (!userValue) {
      return "Not assigned";
    }

    if (typeof userValue === "object") {
      return userValue.username || "Not assigned";
    }

    return userValue;
  };

  // Format backend status for UI
  const formatStatus = (statusValue) => {
    if (!statusValue) {
      return "Unknown";
    }

    return statusValue.replaceAll("_", " ");
  };

  // Format date safely
  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "--";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "--";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Dashboard statistics
  const statistics = useMemo(() => {
    return {
      total: tickets.length,

      open: tickets.filter(
        (ticket) => ticket.status === "OPEN"
      ).length,

      inProgress: tickets.filter(
        (ticket) => ticket.status === "IN_PROGRESS"
      ).length,

      closed: tickets.filter(
        (ticket) => ticket.status === "CLOSED"
      ).length,
    };
  }, [tickets]);

  // Search and status filtering
  const filteredTickets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesSearch =
        !normalizedSearch ||
        ticket.title
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        ticket.description
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        String(ticket.id).includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        ticket.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

    return (
    <div className="employee-shell">

      {/* Mobile overlay */}

      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}

      <aside
        className={`employee-sidebar ${
          sidebarOpen ? "sidebar-visible" : ""
        }`}
      >
        <div className="sidebar-top">

          <div className="brand-block">
            <div className="brand-icon">
              <FaClipboardList />
            </div>

            <div>
              <h2>ComplyFlow</h2>
              <p>Employee Portal</p>
            </div>
          </div>

          <nav className="sidebar-menu">

            <button
              type="button"
              className="sidebar-link active"
              onClick={closeSidebar}
            >
              <FaHome />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className="sidebar-link"
              onClick={() => {
                document
                  .getElementById("raise-complaint")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });

                closeSidebar();
              }}
            >
              <FaPlusCircle />
              <span>Raise Complaint</span>
            </button>

            <button
              type="button"
              className="sidebar-link"
              onClick={() => {
                document
                  .getElementById("my-tickets")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });

                closeSidebar();
              }}
            >
              <FaClipboardList />
              <span>My Tickets</span>
            </button>

          </nav>

        </div>

        <div className="sidebar-bottom">

          <div className="sidebar-profile">
            <FaUserCircle />

            <div>
              <strong>{username}</strong>
              <span>Employee</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={logout}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>

        </div>
      </aside>

      {/* Main area */}

      <main className="employee-main">

        {/* Topbar */}

        <header className="employee-topbar">

          <div className="topbar-title-row">

            <button
              type="button"
              className="mobile-menu-button"
              onClick={() =>
                setSidebarOpen((previousValue) => !previousValue)
              }
              aria-label="Open navigation"
            >
              <FaBars />
            </button>

            <div className="page-heading">
              <span className="page-kicker">
                Compliance workspace
              </span>

              <h1>Employee Dashboard</h1>

              <p>
                Raise, track and review all your compliance
                complaints.
              </p>
            </div>

          </div>

          <div className="topbar-profile">

            <div className="profile-avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <div className="profile-copy">
              <span>Welcome back</span>
              <strong>{username}</strong>
            </div>

            <button
              type="button"
              className="topbar-logout"
              onClick={logout}
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>

          </div>

        </header>

        {/* Error message */}

        {errorMessage && (
          <div className="dashboard-alert" role="alert">
            <FaExclamationTriangle />

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

        {/* Hero section */}

        <section className="dashboard-hero">

          <div className="hero-copy">

            <span className="hero-label">
              Employee compliance centre
            </span>

            <h2>
              Manage your complaints with clarity and confidence.
            </h2>

            <p>
              Submit new issues, monitor their progress and review
              the final resolution from one secure workspace.
            </p>

            <button
              type="button"
              className="hero-action"
              onClick={() =>
                document
                  .getElementById("raise-complaint")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              <FaPlusCircle />
              Raise a complaint
            </button>

          </div>

          <div className="hero-summary">

            <div>
              <span>Resolution rate</span>

              <strong>
                {statistics.total === 0
                  ? "0%"
                  : `${Math.round(
                      (statistics.closed /
                        statistics.total) *
                        100
                    )}%`}
              </strong>
            </div>

            <div className="hero-progress-track">
              <span
                style={{
                  width:
                    statistics.total === 0
                      ? "0%"
                      : `${Math.round(
                          (statistics.closed /
                            statistics.total) *
                            100
                        )}%`,
                }}
              />
            </div>

            <p>
              {statistics.closed} of {statistics.total} complaints
              successfully closed.
            </p>

          </div>

        </section>

        {/* Statistics */}

        <section className="statistics-grid">

          <article className="stat-card stat-total">
            <div className="stat-icon">
              <FaClipboardList />
            </div>

            <div className="stat-content">
              <span>Total Tickets</span>
              <strong>{statistics.total}</strong>
              <small>All complaints submitted</small>
            </div>
          </article>

          <article className="stat-card stat-open">
            <div className="stat-icon">
              <FaExclamationTriangle />
            </div>

            <div className="stat-content">
              <span>Open</span>
              <strong>{statistics.open}</strong>
              <small>Awaiting assignment</small>
            </div>
          </article>

          <article className="stat-card stat-progress">
            <div className="stat-icon">
              <FaClock />
            </div>

            <div className="stat-content">
              <span>In Progress</span>
              <strong>{statistics.inProgress}</strong>
              <small>Currently being handled</small>
            </div>
          </article>

          <article className="stat-card stat-closed">
            <div className="stat-icon">
              <FaCheckCircle />
            </div>

            <div className="stat-content">
              <span>Closed</span>
              <strong>{statistics.closed}</strong>
              <small>Resolved complaints</small>
            </div>
          </article>

        </section>

        {/* Form */}

        <section
          className="complaint-card"
          id="raise-complaint"
        >

          <div className="section-heading">

            <div>
              <span className="section-kicker">
                New request
              </span>

              <h2>Raise a Complaint</h2>

              <p>
                Provide complete information so the support team
                can resolve the issue faster.
              </p>
            </div>

            <div className="section-icon">
              <FaPlusCircle />
            </div>

          </div>

          <form
            className="complaint-form"
            onSubmit={raiseTicket}
          >

            <div className="form-field form-field-wide">
              <label htmlFor="complaint-title">
                Complaint title
              </label>

              <input
                id="complaint-title"
                type="text"
                name="title"
                placeholder="Example: Unable to access compliance report"
                value={formData.title}
                onChange={handleChange}
                maxLength={200}
                required
              />

              <small>
                Use a short and specific title.
              </small>
            </div>

            <div className="form-field form-field-wide">
              <label htmlFor="complaint-description">
                Description
              </label>

              <textarea
                id="complaint-description"
                name="description"
                placeholder="Explain the issue, when it started and any steps already attempted..."
                value={formData.description}
                onChange={handleChange}
                required
              />

              <div className="field-meta">
                <small>
                  Add enough detail for the support team.
                </small>

                <small>
                  {formData.description.length} characters
                </small>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="complaint-priority">
                Priority
              </label>

              <select
                id="complaint-priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="LOW">
                  Low — Minor inconvenience
                </option>

                <option value="MEDIUM">
                  Medium — Work partially affected
                </option>

                <option value="HIGH">
                  High — Work completely blocked
                </option>
              </select>
            </div>

            <div className="form-guidance">
              <FaExclamationTriangle />

              <div>
                <strong>Before submitting</strong>

                <span>
                  Confirm that the title, description and priority
                  are accurate.
                </span>
              </div>
            </div>

            <div className="form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setFormData({
                    title: "",
                    description: "",
                    priority: "LOW",
                  })
                }
                disabled={submitting}
              >
                Clear Form
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={submitting}
              >
                <FaPlusCircle />

                {submitting
                  ? "Submitting..."
                  : "Submit Complaint"}
              </button>

            </div>

          </form>

        </section>

        {/* Tickets */}

        <section
          className="tickets-card"
          id="my-tickets"
        >

          <div className="tickets-header">

            <div>
              <span className="section-kicker">
                Complaint history
              </span>

              <h2>My Tickets</h2>

              <p>
                Review current progress and completed resolutions.
              </p>
            </div>

            <button
              type="button"
              className="refresh-button"
              onClick={fetchTickets}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>

          </div>

          <div className="ticket-toolbar">

            <label className="ticket-search">

              <FaSearch />

              <input
                type="search"
                placeholder="Search by title, description or ticket ID"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

            </label>

            <select
              className="status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="ALL">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">
                In Progress
              </option>
              <option value="CLOSED">Closed</option>
            </select>

          </div>

          <div className="tickets-table-wrapper">

            <table className="tickets-table">

              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Complaint</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Created</th>
                  <th>Resolution</th>
                  <th>Proof</th>
                </tr>
              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="table-state"
                    >
                      <div className="loading-spinner" />
                      <span>Loading your tickets...</span>
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="table-state"
                    >
                      <FaClipboardList />
                      <strong>No tickets found</strong>
                      <span>
                        Try changing the search or status filter.
                      </span>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (

                    <tr key={ticket.id}>

                      <td>
                        <span className="ticket-number">
                          #{ticket.id}
                        </span>
                      </td>

                      <td>
                        <div className="ticket-subject">
                          <strong>{ticket.title}</strong>

                          <span>
                            {ticket.description || "No description"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`priority-badge priority-${ticket.priority?.toLowerCase()}`}
                        >
                          {ticket.priority || "UNKNOWN"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge status-${ticket.status?.toLowerCase()}`}
                        >
                          {formatStatus(ticket.status)}
                        </span>
                      </td>

                      <td>
                        <div className="assigned-person">
                          <FaUserCircle />

                          <span>
                            {getUsername(ticket.assigned_to)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="ticket-date">
                          {formatDate(ticket.created_at)}
                        </span>
                      </td>

                      <td>
                        {ticket.status === "CLOSED" ? (
                          <span className="resolution-text">
                            {ticket.resolution ||
                              "No resolution provided"}
                          </span>
                        ) : (
                          <span className="pending-text">
                            Pending
                          </span>
                        )}
                      </td>

                      <td>
                        {ticket.status === "CLOSED" &&
                        ticket.resolution_image ? (
                          <button
                            type="button"
                            className="image-preview-button"
                            onClick={() =>
                              setSelectedImage(
                                ticket.resolution_image
                              )
                            }
                            aria-label={`View proof for ${ticket.title}`}
                          >
                            <FaImage />
                            <span>View</span>
                          </button>
                        ) : (
                          <span className="no-proof">
                            No image
                          </span>
                        )}
                      </td>

                    </tr>

                  ))
                )}

              </tbody>

            </table>

          </div>

          <div className="tickets-footer">
            <span>
              Showing {filteredTickets.length} of{" "}
              {tickets.length} tickets
            </span>
          </div>

        </section>

      </main>

      {/* Image modal */}

      {selectedImage && (
        <div
          className="image-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Resolution image preview"
        >

          <button
            type="button"
            className="modal-backdrop"
            aria-label="Close image preview"
            onClick={() => setSelectedImage(null)}
          />

          <div className="image-modal-content">

            <div className="image-modal-header">
              <div>
                <span>Resolution proof</span>
                <h3>Uploaded Image</h3>
              </div>

              <button
                type="button"
                className="modal-close"
                aria-label="Close"
                onClick={() => setSelectedImage(null)}
              >
                <FaTimes />
              </button>
            </div>

            <img
              src={selectedImage}
              alt="Resolution proof"
            />

          </div>

        </div>
      )}

    </div>
  );
};

export default EmployeeDashboard;