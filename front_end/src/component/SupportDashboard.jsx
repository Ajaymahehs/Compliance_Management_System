import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaBars,
  FaCheckCircle,
  FaClipboardList,
  FaClock,
  FaExclamationTriangle,
  FaFileImage,
  FaHome,
  FaImage,
  FaSearch,
  FaSignOutAlt,
  FaTimes,
  FaUserCircle,
  FaUserCog,
  FaWrench,
} from "react-icons/fa";

import "./SupportDashboard.css";

const API_BASE_URL = "https://compliance-management-system-lyeu.onrender.com/api";

const SupportDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("access");
  const username =
    localStorage.getItem("username") || "Support";

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] =
    useState(null);

  const [resolution, setResolution] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] =
    useState(null);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] =
    useState("ALL");

  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetchTickets();
  }, [token, navigate]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const fetchTickets = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/support/tickets/`,
        {
          headers: authHeaders,
        }
      );

      const ticketData = Array.isArray(response.data)
        ? response.data
        : [];

      setTickets(ticketData);

      if (selectedTicket) {
        const updatedSelectedTicket = ticketData.find(
          (ticket) =>
            ticket.id === selectedTicket.id
        );

        if (updatedSelectedTicket) {
          setSelectedTicket(updatedSelectedTicket);
        } else {
          clearResolutionForm();
        }
      }
    } catch (error) {
      handleRequestError(
        error,
        "Unable to load assigned tickets."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRequestError = (
    error,
    fallbackMessage
  ) => {
    console.error(error);

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
      const firstError =
        Object.values(responseData)[0];

      setErrorMessage(
        Array.isArray(firstError)
          ? firstError[0]
          : responseData.message ||
              responseData.detail ||
              fallbackMessage
      );
    } else {
      setErrorMessage(fallbackMessage);
    }
  };

  const getUsername = (userValue) => {
    if (!userValue) {
      return "Unknown employee";
    }

    if (typeof userValue === "object") {
      return (
        userValue.username || "Unknown employee"
      );
    }

    return userValue;
  };

  const formatStatus = (statusValue) => {
    if (!statusValue) {
      return "Unknown";
    }

    return statusValue.replaceAll("_", " ");
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

  const selectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setResolution("");
    setImage(null);
    setErrorMessage("");
    setSuccessMessage("");

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setTimeout(() => {
      document
        .getElementById("support-resolution")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  const handleImageChange = (event) => {
    const selectedFile =
      event.target.files?.[0] || null;

    if (!selectedFile) {
      setImage(null);

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }

      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setErrorMessage(
        "Please select a valid image file."
      );

      event.target.value = "";
      return;
    }

    const maximumSize = 5 * 1024 * 1024;

    if (selectedFile.size > maximumSize) {
      setErrorMessage(
        "The image must be smaller than 5 MB."
      );

      event.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(selectedFile);
    setImagePreview(
      URL.createObjectURL(selectedFile)
    );
    setErrorMessage("");
  };

  const removeSelectedImage = () => {
    setImage(null);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearResolutionForm = () => {
    setSelectedTicket(null);
    setResolution("");
    setImage(null);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeTicket = async (event) => {
    event.preventDefault();

    if (!selectedTicket) {
      setErrorMessage(
        "Select a ticket before submitting a resolution."
      );
      return;
    }

    if (!resolution.trim()) {
      setErrorMessage(
        "Enter a resolution description."
      );
      return;
    }

    const formData = new FormData();

    formData.append(
      "resolution",
      resolution.trim()
    );

    if (image) {
      formData.append(
        "resolution_image",
        image
      );
    }

    setClosing(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await axios.put(
        `${API_BASE_URL}/support/close/${selectedTicket.id}/`,
        formData,
        {
          headers: authHeaders,
        }
      );

      setSuccessMessage(
        `Ticket #${selectedTicket.id} closed successfully.`
      );

      clearResolutionForm();
      await fetchTickets();
    } catch (error) {
      handleRequestError(
        error,
        "Unable to close the ticket."
      );
    } finally {
      setClosing(false);
    }
  };

  const logout = async () => {
    const refreshToken =
      localStorage.getItem("refresh");

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

  const statistics = useMemo(() => {
    return {
      total: tickets.length,

      open: tickets.filter(
        (ticket) => ticket.status === "OPEN"
      ).length,

      inProgress: tickets.filter(
        (ticket) =>
          ticket.status === "IN_PROGRESS"
      ).length,

      highPriority: tickets.filter(
        (ticket) => ticket.priority === "HIGH"
      ).length,
    };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return tickets.filter((ticket) => {
      const employeeName = getUsername(
        ticket.employee
      ).toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        ticket.title
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        ticket.description
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        employeeName.includes(normalizedSearch) ||
        String(ticket.id).includes(
          normalizedSearch
        );

      const matchesPriority =
        priorityFilter === "ALL" ||
        ticket.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [tickets, search, priorityFilter]);

  return (
    <div className="support-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="support-sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`support-sidebar ${
          sidebarOpen ? "sidebar-visible" : ""
        }`}
      >
        <div>
          <div className="support-brand">
            <div className="support-brand-icon">
              <FaWrench />
            </div>

            <div>
              <h2>ComplyFlow</h2>
              <p>Support Portal</p>
            </div>
          </div>

          <nav className="support-menu">
            <button
              type="button"
              className="support-menu-link active"
              onClick={() =>
                setSidebarOpen(false)
              }
            >
              <FaHome />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className="support-menu-link"
              onClick={() => {
                document
                  .getElementById(
                    "assigned-tickets"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });

                setSidebarOpen(false);
              }}
            >
              <FaClipboardList />
              <span>Assigned Tickets</span>
            </button>

            <button
              type="button"
              className="support-menu-link"
              onClick={() => {
                document
                  .getElementById(
                    "support-resolution"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });

                setSidebarOpen(false);
              }}
            >
              <FaCheckCircle />
              <span>Resolve Ticket</span>
            </button>
          </nav>
        </div>

        <div className="support-sidebar-bottom">
          <div className="support-sidebar-profile">
            <FaUserCircle />

            <div>
              <strong>{username}</strong>
              <span>Support Specialist</span>
            </div>
          </div>

          <button
            type="button"
            className="support-sidebar-logout"
            onClick={logout}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="support-main">
        <header className="support-topbar">
          <div className="support-topbar-left">
            <button
              type="button"
              className="support-mobile-menu"
              aria-label="Open navigation"
              onClick={() =>
                setSidebarOpen(
                  (previous) => !previous
                )
              }
            >
              <FaBars />
            </button>

            <div className="support-page-heading">
              <span>Resolution workspace</span>

              <h1>Support Dashboard</h1>

              <p>
                Review assigned complaints and provide
                resolutions.
              </p>
            </div>
          </div>

          <div className="support-profile">
            <div className="support-profile-avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <div className="support-profile-copy">
              <span>Support specialist</span>
              <strong>{username}</strong>
            </div>

            <button
              type="button"
              className="support-topbar-logout"
              onClick={logout}
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {errorMessage && (
          <div
            className="support-alert support-alert-error"
            role="alert"
          >
            <FaExclamationTriangle />

            <span>{errorMessage}</span>

            <button
              type="button"
              aria-label="Dismiss error"
              onClick={() =>
                setErrorMessage("")
              }
            >
              <FaTimes />
            </button>
          </div>
        )}

        {successMessage && (
          <div
            className="support-alert support-alert-success"
            role="status"
          >
            <FaCheckCircle />

            <span>{successMessage}</span>

            <button
              type="button"
              aria-label="Dismiss message"
              onClick={() =>
                setSuccessMessage("")
              }
            >
              <FaTimes />
            </button>
          </div>
        )}

        <section className="support-hero">
          <div className="support-hero-copy">
            <span>Support operations centre</span>

            <h2>
              Resolve assigned complaints with speed
              and precision.
            </h2>

            <p>
              Examine employee concerns, document the
              solution and provide supporting evidence
              through one secure workspace.
            </p>

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById(
                    "assigned-tickets"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              <FaClipboardList />
              Review assigned tickets
            </button>
          </div>

          <div className="support-hero-summary">
            <div>
              <span>Current workload</span>
              <strong>{statistics.total}</strong>
            </div>

            <div className="support-workload-track">
              <span
                style={{
                  width: `${Math.min(
                    statistics.total * 10,
                    100
                  )}%`,
                }}
              />
            </div>

            <p>
              {statistics.highPriority} high-priority
              ticket
              {statistics.highPriority === 1
                ? ""
                : "s"}{" "}
              require attention.
            </p>
          </div>
        </section>

        <section className="support-statistics">
          <article className="support-stat-card stat-total">
            <div className="support-stat-icon">
              <FaClipboardList />
            </div>

            <div>
              <span>Assigned Tickets</span>
              <strong>{statistics.total}</strong>
              <small>Your current workload</small>
            </div>
          </article>

          <article className="support-stat-card stat-open">
            <div className="support-stat-icon">
              <FaExclamationTriangle />
            </div>

            <div>
              <span>Open</span>
              <strong>{statistics.open}</strong>
              <small>Waiting to be handled</small>
            </div>
          </article>

          <article className="support-stat-card stat-progress">
            <div className="support-stat-icon">
              <FaClock />
            </div>

            <div>
              <span>In Progress</span>
              <strong>
                {statistics.inProgress}
              </strong>
              <small>Currently being resolved</small>
            </div>
          </article>

          <article className="support-stat-card stat-priority">
            <div className="support-stat-icon">
              <FaExclamationTriangle />
            </div>

            <div>
              <span>High Priority</span>
              <strong>
                {statistics.highPriority}
              </strong>
              <small>Urgent assigned issues</small>
            </div>
          </article>
        </section>

        <section
          className="support-workspace"
          id="assigned-tickets"
        >
          <div className="support-tickets-card">
            <div className="support-section-header">
              <div>
                <span>Support queue</span>
                <h2>Assigned Tickets</h2>
                <p>
                  Select a complaint to review and
                  resolve.
                </p>
              </div>

              <button
                type="button"
                className="support-refresh-button"
                onClick={fetchTickets}
                disabled={loading}
              >
                {loading
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            </div>

            <div className="support-ticket-toolbar">
              <label className="support-ticket-search">
                <FaSearch />

                <input
                  type="search"
                  placeholder="Search ticket, title or employee"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </label>

              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(
                    event.target.value
                  )
                }
              >
                <option value="ALL">
                  All priorities
                </option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">
                  Medium
                </option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="support-table-wrapper">
              <table className="support-tickets-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Employee</th>
                    <th>Complaint</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="support-table-state"
                      >
                        <div className="support-spinner" />
                        <span>
                          Loading assigned tickets...
                        </span>
                      </td>
                    </tr>
                  ) : filteredTickets.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="support-table-state"
                      >
                        <FaClipboardList />
                        <strong>
                          No assigned tickets
                        </strong>
                        <span>
                          Your current support queue is
                          empty.
                        </span>
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className={
                          selectedTicket?.id ===
                          ticket.id
                            ? "support-selected-row"
                            : ""
                        }
                      >
                        <td>
                          <span className="support-ticket-number">
                            #{ticket.id}
                          </span>
                        </td>

                        <td>
                          <div className="support-person">
                            <FaUserCircle />

                            <span>
                              {getUsername(
                                ticket.employee
                              )}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="support-ticket-subject">
                            <strong>
                              {ticket.title}
                            </strong>

                            <span>
                              {ticket.description ||
                                "No description provided"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`support-priority support-priority-${ticket.priority?.toLowerCase()}`}
                          >
                            {ticket.priority ||
                              "UNKNOWN"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`support-status support-status-${ticket.status?.toLowerCase()}`}
                          >
                            {formatStatus(
                              ticket.status
                            )}
                          </span>
                        </td>

                        <td>
                          <span className="support-ticket-date">
                            {formatDate(
                              ticket.created_at
                            )}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="support-open-button"
                            onClick={() =>
                              selectTicket(ticket)
                            }
                          >
                            <FaWrench />

                            {selectedTicket?.id ===
                            ticket.id
                              ? "Selected"
                              : "Resolve"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="support-table-footer">
              Showing {filteredTickets.length} of{" "}
              {tickets.length} assigned tickets
            </div>
          </div>

          <section
            className="support-resolution-card"
            id="support-resolution"
          >
            <div className="support-section-header">
              <div>
                <span>Resolution centre</span>
                <h2>Resolve Complaint</h2>
                <p>
                  Document the solution and close the
                  selected ticket.
                </p>
              </div>

              <div className="support-section-icon">
                <FaCheckCircle />
              </div>
            </div>

            {selectedTicket ? (
              <form
                className="support-resolution-form"
                onSubmit={closeTicket}
              >
                <div className="support-selected-ticket">
                  <div className="support-selected-ticket-header">
                    <span>
                      Ticket #{selectedTicket.id}
                    </span>

                    <button
                      type="button"
                      onClick={clearResolutionForm}
                      aria-label="Clear selected ticket"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  <h3>{selectedTicket.title}</h3>

                  <p>
                    {selectedTicket.description ||
                      "No description provided."}
                  </p>

                  <div className="support-ticket-meta">
                    <div>
                      <span>Employee</span>
                      <strong>
                        {getUsername(
                          selectedTicket.employee
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Priority</span>
                      <strong>
                        {selectedTicket.priority ||
                          "Unknown"}
                      </strong>
                    </div>

                    <div>
                      <span>Status</span>
                      <strong>
                        {formatStatus(
                          selectedTicket.status
                        )}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="support-form-field">
                  <label htmlFor="resolution">
                    Resolution description
                  </label>

                  <textarea
                    id="resolution"
                    placeholder="Explain the issue, action taken and final solution..."
                    value={resolution}
                    onChange={(event) =>
                      setResolution(
                        event.target.value
                      )
                    }
                    required
                  />

                  <div className="support-field-meta">
                    <small>
                      Provide a clear and complete
                      solution.
                    </small>

                    <small>
                      {resolution.length} characters
                    </small>
                  </div>
                </div>

                <div className="support-form-field">
                  <label htmlFor="resolution-image">
                    Resolution proof
                  </label>

                  <label
                    htmlFor="resolution-image"
                    className="support-file-upload"
                  >
                    <FaFileImage />

                    <div>
                      <strong>
                        Upload supporting image
                      </strong>

                      <span>
                        PNG, JPG or WEBP — maximum
                        5 MB
                      </span>
                    </div>
                  </label>

                  <input
                    ref={fileInputRef}
                    id="resolution-image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    hidden
                  />
                </div>

                {imagePreview && (
                  <div className="support-image-preview">
                    <img
                      src={imagePreview}
                      alt="Selected resolution proof"
                    />

                    <div>
                      <FaImage />

                      <span>
                        {image?.name ||
                          "Selected image"}
                      </span>

                      <button
                        type="button"
                        onClick={removeSelectedImage}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                <div className="support-resolution-guidance">
                  <FaExclamationTriangle />

                  <div>
                    <strong>
                      Confirm before closing
                    </strong>

                    <span>
                      Closing the ticket marks the
                      complaint as resolved.
                    </span>
                  </div>
                </div>

                <div className="support-form-actions">
                  <button
                    type="button"
                    className="support-clear-button"
                    onClick={clearResolutionForm}
                    disabled={closing}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="support-close-button"
                    disabled={closing}
                  >
                    <FaCheckCircle />

                    {closing
                      ? "Closing Ticket..."
                      : "Close Ticket"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="support-empty-resolution">
                <div>
                  <FaWrench />
                </div>

                <h3>Select a ticket to resolve</h3>

                <p>
                  Choose an assigned complaint from the
                  table to view its information and
                  submit a resolution.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById(
                        "assigned-tickets"
                      )
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                >
                  View assigned tickets
                </button>
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
};

export default SupportDashboard;