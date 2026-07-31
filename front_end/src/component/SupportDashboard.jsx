import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./SupportDashboard.css";

const SupportDashboard = () => {

  const navigate = useNavigate();

  const token = localStorage.getItem("access");
  const username = localStorage.getItem("username");

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [resolution, setResolution] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {

      const response = await axios.get(
        "http://127.0.0.1:8000/api/support/tickets/",
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

  const closeTicket = async () => {

    if (!selectedTicket) {
      alert("Select a ticket");
      return;
    }

    const formData = new FormData();

    formData.append("resolution", resolution);

    if (image) {
      formData.append("resolution_image", image);
    }

    try {

      await axios.put(
        `http://127.0.0.1:8000/api/support/close/${selectedTicket.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Ticket Closed Successfully");

      setSelectedTicket(null);
      setResolution("");
      setImage(null);

      fetchTickets();

    } catch (error) {
      console.log(error);
      alert("Unable to Close Ticket");
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="support-dashboard">

      <div className="navbar">

        <h2>Compliance Management System</h2>

        <div className="nav-right">
          <span>Welcome, {username}</span>

          <button onClick={logout}>
            Logout
          </button>
        </div>

      </div>

      <div className="container">

        <div className="left-panel">

          <h2>Assigned Tickets</h2>

          <table>

            <thead>

              <tr>

                <th>Title</th>
                <th>Employee</th>
                <th>Priority</th>
                <th>Action</th>

              </tr>

            </thead>

            <tbody>

              {

                tickets.length === 0 ?

                <tr>

                  <td colSpan="4">
                    No Assigned Tickets
                  </td>

                </tr>

                :

                tickets.map(ticket => (

                  <tr key={ticket.id}>

                    <td>{ticket.title}</td>

                    <td>{ticket.employee}</td>

                    <td>{ticket.priority}</td>

                    <td>

                      <button
                        className="open-btn"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        Open Ticket
                      </button>

                    </td>

                  </tr>

                ))

              }

            </tbody>

          </table>

        </div>

        <div className="right-panel">

          <h2>Resolution</h2>

          {

            selectedTicket ?

            <>

              <div className="ticket-info">

                <p><b>Title :</b> {selectedTicket.title}</p>

                <p><b>Employee :</b> {selectedTicket.employee}</p>

              </div>

              <textarea

                placeholder="Resolution Description"

                value={resolution}

                onChange={(e)=>setResolution(e.target.value)}

              />

              <input

                type="file"

                onChange={(e)=>setImage(e.target.files[0])}

              />

              <button
                className="close-btn"
                onClick={closeTicket}
              >

                Close Ticket

              </button>

            </>

            :

            <div className="empty-box">

              Select a Ticket to Resolve

            </div>

          }

        </div>

      </div>

    </div>
  );

};

export default SupportDashboard;