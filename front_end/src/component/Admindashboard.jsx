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
  FaSearch,
  FaSignOutAlt,
  FaTimes,
  FaUserCircle,
  FaUserCog,
  FaUsers,
} from "react-icons/fa";

import "./AdminDashboard.css";

const API_BASE_URL = "https://compliance-management-system-lyeu.onrender.com/api";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("access");
  const username = localStorage.getItem("username") || "Admin";

  const [tickets, setTickets] = useState([]);
  const [supports, setSupports] = useState([]);
  const [selectedSupport, setSelectedSupport] = useState({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [assigningTicketId, setAssigningTicketId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    loadDashboard();
  }, [token, navigate]);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const loadDashboard = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      await Promise.all([fetchTickets(), fetchSupports()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/tickets/`,
        {
          headers: authHeaders,
        }
      );

      setTickets(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      handleRequestError(error, "Unable to load tickets.");
    }
  };

  const fetchSupports = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/support-users/`,
        {
          headers: authHeaders,
        }
      );

      setSupports(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      handleRequestError(
        error,
        "Unable to load support users."
      );
    }
  };

  const handleRequestError = (error, fallbackMessage) => {
    console.error(error);

    if (error.response?.status === 401) {
      localStorage.clear();
      navigate("/");
      return;
    }

    setErrorMessage(
      error.response?.data?.message || fallbackMessage
    );
  };

  const assignSupport = async (ticketId) => {
    const supportId = selectedSupport[ticketId];

    if (!supportId) {
      setErrorMessage("Select a support user first.");
      return;
    }

    setAssigningTicketId(ticketId);
    setErrorMessage("");

    try {
      await axios.put(
        `${API_BASE_URL}/admin/assign/${ticketId}/`,
        {
          support_id: supportId,
        },
        {
          headers: authHeaders,
        }
      );

      setSelectedSupport((previous) => {
        const updated = { ...previous };
        delete updated[ticketId];
        return updated;
      });

      await fetchTickets();
    } catch (error) {
      handleRequestError(error, "Support assignment failed.");
    } finally {
      setAssigningTicketId(null);
    }
  };

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
            headers: authHeaders,
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

  const getUsername = (value) => {
    if (!value) {
      return "Not assigned";
    }

    if (typeof value === "object") {
      return value.username || "Not assigned";
    }

    return value;
  };

  const formatStatus = (status) => {
    return status ? status.replaceAll("_", " ") : "Unknown";
  };

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
      supportCount: supports.length,
    };
  }, [tickets, supports]);

  const filteredTickets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const employee = getUsername(ticket.employee);
      const assignedSupport = getUsername(ticket.assigned_to);

      const matchesSearch =
        !normalizedSearch ||
        ticket.title
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        ticket.description
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        employee.toLowerCase().includes(normalizedSearch) ||
        assignedSupport
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(ticket.id).includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        ticket.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    tickets,
    search,
    statusFilter,
    priorityFilter,
  ]);

  const resolutionRate =
    statistics.total === 0
      ? 0
      : Math.round(
          (statistics.closed / statistics.total) * 100
        );

  return (
    <div className="admin-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "sidebar-visible" : ""
        }`}
      >
        <div>
          <div className="admin-brand">
            <div className="admin-brand-icon">
              <FaUserCog />
            </div>

            <div>
              <h2>ComplyFlow</h2>
              <p>Administration</p>
            </div>
          </div>

          <nav className="admin-menu">
            <button
              type="button"
              className="admin-menu-link active"
              onClick={() => setSidebarOpen(false)}
            >
              <FaHome />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className="admin-menu-link"
              onClick={() => {
                document
                  .getElementById("admin-tickets")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });

                setSidebarOpen(false);
              }}
            >
              <FaClipboardList />
              <span>All Complaints</span>
            </button>

            <button
              type="button"
              className="admin-menu-link"
              onClick={() => {
                document
                  .getElementById("support-overview")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });

                setSidebarOpen(false);
              }}
            >
              <FaUsers />
              <span>Support Team</span>
            </button>
          </nav>
        </div>

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-profile">
            <FaUserCircle />

            <div>
              <strong>{username}</strong>
              <span>System Administrator</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-sidebar-logout"
            onClick={logout}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-mobile-menu"
              aria-label="Open sidebar"
              onClick={() =>
                setSidebarOpen((previous) => !previous)
              }
            >
              <FaBars />
            </button>

            <div className="admin-page-heading">
              <span>Compliance control centre</span>
              <h1>Admin Dashboard</h1>
              <p>
                Monitor complaints, assignments and resolutions.
              </p>
            </div>
          </div>

          <div className="admin-profile">
            <div className="admin-profile-avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <div className="admin-profile-copy">
              <span>Administrator</span>
              <strong>{username}</strong>
            </div>

            <button
              type="button"
              className="admin-topbar-logout"
              onClick={logout}
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {errorMessage && (
          <div className="admin-alert" role="alert">
            <FaExclamationTriangle />
            <span>{errorMessage}</span>

            <button
              type="button"
              onClick={() => setErrorMessage("")}
              aria-label="Dismiss error"
            >
              <FaTimes />
            </button>
          </div>
        )}

        <section className="admin-hero">
          <div className="admin-hero-copy">
            <span>Administrative command centre</span>

            <h2>
              Control every complaint from assignment to
              resolution.
            </h2>

            <p>
              Review employee complaints, allocate support
              staff and monitor the complete resolution
              lifecycle.
            </p>

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("admin-tickets")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              <FaClipboardList />
              Review complaints
            </button>
          </div>

          <div className="admin-hero-summary">
            <div>
              <span>Overall resolution rate</span>
              <strong>{resolutionRate}%</strong>
            </div>

            <div className="admin-progress-track">
              <span
                style={{
                  width: `${resolutionRate}%`,
                }}
              />
            </div>

            <p>
              {statistics.closed} of {statistics.total} tickets
              successfully closed.
            </p>
          </div>
        </section>

        <section
          className="admin-statistics"
          id="support-overview"
        >
          <article className="admin-stat-card stat-total">
            <div className="admin-stat-icon">
              <FaClipboardList />
            </div>

            <div>
              <span>Total Tickets</span>
              <strong>{statistics.total}</strong>
              <small>All submitted complaints</small>
            </div>
          </article>

          <article className="admin-stat-card stat-open">
            <div className="admin-stat-icon">
              <FaExclamationTriangle />
            </div>

            <div>
              <span>Open</span>
              <strong>{statistics.open}</strong>
              <small>Waiting for assignment</small>
            </div>
          </article>

          <article className="admin-stat-card stat-progress">
            <div className="admin-stat-icon">
              <FaClock />
            </div>

            <div>
              <span>In Progress</span>
              <strong>{statistics.inProgress}</strong>
              <small>Support is working</small>
            </div>
          </article>

          <article className="admin-stat-card stat-closed">
            <div className="admin-stat-icon">
              <FaCheckCircle />
            </div>

            <div>
              <span>Closed</span>
              <strong>{statistics.closed}</strong>
              <small>Successfully resolved</small>
            </div>
          </article>

          <article className="admin-stat-card stat-support">
            <div className="admin-stat-icon">
              <FaUsers />
            </div>

            <div>
              <span>Support Staff</span>
              <strong>{statistics.supportCount}</strong>
              <small>Available support users</small>
            </div>
          </article>
        </section>

        <section
          className="admin-tickets-card"
          id="admin-tickets"
        >
          <div className="admin-tickets-header">
            <div>
              <span>Ticket administration</span>
              <h2>All Complaints</h2>
              <p>
                Assign support staff and monitor every ticket.
              </p>
            </div>

            <button
              type="button"
              className="admin-refresh-button"
              onClick={loadDashboard}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="admin-ticket-toolbar">
            <label className="admin-ticket-search">
              <FaSearch />

              <input
                type="search"
                placeholder="Search ticket, employee or support staff"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </label>

            <select
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

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value)
              }
            >
              <option value="ALL">All priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-tickets-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Employee</th>
                  <th>Complaint</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Created</th>
                  <th>Resolution</th>
                  <th>Proof</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="admin-table-state"
                    >
                      <div className="admin-spinner" />
                      <span>Loading complaints...</span>
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="admin-table-state"
                    >
                      <FaClipboardList />
                      <strong>No complaints found</strong>
                      <span>
                        Change the search or filter options.
                      </span>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <span className="admin-ticket-number">
                          #{ticket.id}
                        </span>
                      </td>

                      <td>
                        <div className="admin-person">
                          <FaUserCircle />
                          <span>
                            {getUsername(ticket.employee)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="admin-ticket-subject">
                          <strong>{ticket.title}</strong>

                          <span>
                            {ticket.description ||
                              "No description provided"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`admin-priority admin-priority-${ticket.priority?.toLowerCase()}`}
                        >
                          {ticket.priority || "UNKNOWN"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`admin-status admin-status-${ticket.status?.toLowerCase()}`}
                        >
                          {formatStatus(ticket.status)}
                        </span>
                      </td>

                      <td>
                        {ticket.assigned_to ? (
                          <div className="admin-assigned-user">
                            <FaUserCog />
                            <span>
                              {getUsername(
                                ticket.assigned_to
                              )}
                            </span>
                          </div>
                        ) : (
                          <select
                            className="admin-support-select"
                            value={
                              selectedSupport[ticket.id] || ""
                            }
                            onChange={(event) =>
                              setSelectedSupport(
                                (previous) => ({
                                  ...previous,
                                  [ticket.id]:
                                    event.target.value,
                                })
                              )
                            }
                          >
                            <option value="">
                              Select support
                            </option>

                            {supports.map((support) => (
                              <option
                                key={support.id}
                                value={support.id}
                              >
                                {support.username}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      <td>
                        <span className="admin-ticket-date">
                          {formatDate(ticket.created_at)}
                        </span>
                      </td>

                      <td>
                        {ticket.status === "CLOSED" ? (
                          <span className="admin-resolution">
                            {ticket.resolution ||
                              "No resolution provided"}
                          </span>
                        ) : (
                          <span className="admin-pending">
                            Pending
                          </span>
                        )}
                      </td>

                      <td>
                        {ticket.status === "CLOSED" &&
                        ticket.resolution_image ? (
                          <button
                            type="button"
                            className="admin-image-button"
                            onClick={() =>
                              setSelectedImage(
                                ticket.resolution_image
                              )
                            }
                          >
                            <FaImage />
                            <span>View</span>
                          </button>
                        ) : (
                          <span className="admin-no-proof">
                            No image
                          </span>
                        )}
                      </td>

                      <td>
                        {!ticket.assigned_to ? (
                          <button
                            type="button"
                            className="admin-assign-button"
                            onClick={() =>
                              assignSupport(ticket.id)
                            }
                            disabled={
                              assigningTicketId === ticket.id
                            }
                          >
                            {assigningTicketId === ticket.id
                              ? "Assigning..."
                              : "Assign"}
                          </button>
                        ) : ticket.status === "CLOSED" ? (
                          <span className="admin-action-closed">
                            Completed
                          </span>
                        ) : (
                          <span className="admin-action-assigned">
                            Assigned
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-table-footer">
            Showing {filteredTickets.length} of{" "}
            {tickets.length} complaints
          </div>
        </section>
      </main>

      {selectedImage && (
        <div
          className="admin-image-modal"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="admin-modal-backdrop"
            aria-label="Close image"
            onClick={() => setSelectedImage(null)}
          />

          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <div>
                <span>Resolution proof</span>
                <h3>Uploaded Image</h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                aria-label="Close modal"
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

export default AdminDashboard;