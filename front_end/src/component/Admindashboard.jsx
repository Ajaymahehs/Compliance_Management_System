import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {

  const navigate = useNavigate();

  const token = localStorage.getItem("access");
  const username = localStorage.getItem("username");

  const [tickets, setTickets] = useState([]);
  const [supports, setSupports] = useState({});
  const [selectedSupport, setSelectedSupport] = useState({});

  useEffect(() => {
    fetchTickets();
    fetchSupports();
  }, []);

  // Get all tickets
  const fetchTickets = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/admin/tickets/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTickets(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  // Get support users
  const fetchSupports = async () => {
    try {

      const res = await axios.get(
        "http://127.0.0.1:8000/api/admin/support-users/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSupports(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  // Assign Support

  const assignSupport = async (ticketId) => {

    if (!selectedSupport[ticketId]) {
      alert("Select Support");
      return;
    }

    try {

      await axios.put(
        `http://127.0.0.1:8000/api/admin/assign/${ticketId}/`,
        {
          support_id: selectedSupport[ticketId],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Support Assigned");

      fetchTickets();

    } catch (err) {

      console.log(err);

    }
  };

  // Logout

  const logout = () => {

    localStorage.clear();

    navigate("/");

  };

  return (

    <div className="admin-dashboard">

      <div className="navbar">

        <h2>Compliance Management System</h2>

        <div>

          Welcome {username}

          <button onClick={logout}>
            Logout
          </button>

        </div>

      </div>

      {/* Cards */}

      <div className="cards">

        <div className="card">

          <h4>Open Tickets</h4>

          <h2>
            {
              tickets.filter(t => t.status === "OPEN").length
            }
          </h2>

        </div>

        <div className="card">

          <h4>Closed Tickets</h4>

          <h2>
            {
              tickets.filter(t => t.status === "CLOSED").length
            }
          </h2>

        </div>

        <div className="card">

          <h4>Support Staff</h4>

          <h2>{supports.length}</h2>

        </div>

      </div>

      <div className="table-box">

        <h2>All Tickets</h2>

        <table>

          <thead>

            <tr>

              <th>Employee</th>

              <th>Title</th>

              <th>Priority</th>

              <th>Status</th>

              <th>Assigned</th>

              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {

              tickets.map(ticket => (

                <tr key={ticket.id}>

                  <td>{ticket.employee}</td>

                  <td>{ticket.title}</td>

                  <td>{ticket.priority}</td>

                  <td>{ticket.status}</td>

                  <td>

                    {

                      ticket.assigned_to ?

                        ticket.assigned_to

                        :

                        <select

                          onChange={(e) =>
                            setSelectedSupport({
                              ...selectedSupport,
                              [ticket.id]: e.target.value,
                            })
                          }

                        >

                          <option>

                            Select

                          </option>

                          {

                            supports.map(user => (

                              <option
                                key={user.id}
                                value={user.id}
                              >

                                {user.username}

                              </option>

                            ))

                          }

                        </select>

                    }

                  </td>

                  <td>

                    {

                      !ticket.assigned_to &&

                      <button
                        onClick={() => assignSupport(ticket.id)}
                      >

                        Assign Support

                      </button>

                    }

                  </td>

                </tr>

              ))

            }

          </tbody>

        </table>

      </div>

    </div>

  );

};

export default AdminDashboard;