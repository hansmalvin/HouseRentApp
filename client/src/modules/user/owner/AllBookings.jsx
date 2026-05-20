import { message } from "antd";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;

const OwnerAllBookings = () => {
  const [allBookings, setAllBookings] = useState([]);
  const navigate = useNavigate();

  const getAllProperty = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8001/api/owner/getallbookings",
        { withCredentials: true }
      );

      if (response.data.success) {
        setAllBookings(response.data.data);
      } else {
        message.error(response.data.message || "Unauthorized access");
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 401) {
        message.error("Session expired, please login again");
        navigate("/login");
      } else {
        message.error("Failed to fetch bookings");
      }
    }
  };

  useEffect(() => {
    getAllProperty();
  }, []);

  const handleStatus = async (bookingId, propertyId, status) => {
    try {
      const res = await axios.post(
        "http://localhost:8001/api/owner/handlebookingstatus",
        { bookingId, propertyId, status },
        { withCredentials: true }
      );

      if (res.data.success) {
        message.success(res.data.message);
        getAllProperty();
      } else {
        message.error("Something went wrong");
      }
    } catch (error) {
      console.log(error);
      message.error("Failed to update booking status");
    }
  };

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-indigo-700">Booking requests</h2>
      <p className="mb-6 text-sm text-slate-500">
        Tenants who applied to your properties appear here. Approve or change
        status as needed.
      </p>

      <div className="overflow-x-auto rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="bg-indigo-100/90 text-indigo-900">
            <tr>
              <th className="px-4 py-3 font-semibold">Booking ID</th>
              <th className="px-4 py-3 text-center font-semibold">Property ID</th>
              <th className="px-4 py-3 text-center font-semibold">Tenant name</th>
              <th className="px-4 py-3 text-center font-semibold">Tenant phone</th>
              <th className="px-4 py-3 text-center font-semibold">Status</th>
              <th className="px-4 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allBookings.length > 0 ? (
              allBookings.map((booking, idx) => (
                <tr
                  key={booking._id}
                  className={`border-t border-indigo-50 transition hover:bg-sky-50/60 ${
                    idx % 2 === 0 ? "bg-white" : "bg-indigo-50/30"
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs sm:text-sm">
                    {booking._id}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-xs">
                    {booking.propertyId}
                  </td>
                  <td className="px-4 py-3 text-center">{booking.userName}</td>
                  <td className="px-4 py-3 text-center">{booking.phone}</td>
                  <td
                    className={`px-4 py-3 text-center font-semibold capitalize ${
                      booking.bookingStatus === "booked"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {booking.bookingStatus}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {booking.bookingStatus === "pending" ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleStatus(booking._id, booking.propertyId, "booked")
                        }
                        className="rounded-lg bg-emerald-200 px-4 py-1.5 text-sm font-medium text-emerald-800 shadow-sm transition hover:bg-emerald-300"
                      >
                        Mark booked
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          handleStatus(
                            booking._id,
                            booking.propertyId,
                            "pending"
                          )
                        }
                        className="rounded-lg bg-amber-200 px-4 py-1.5 text-sm font-medium text-amber-800 shadow-sm transition hover:bg-amber-300"
                      >
                        Mark pending
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  No booking requests yet. When tenants apply to your
                  listings, they will show up here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OwnerAllBookings;
