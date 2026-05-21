import React, { useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;

const bookingStatusClass = (status) => {
  if (status === "Confirmed") return "text-emerald-600";
  if (status === "Pending") return "text-amber-600";
  return "text-rose-600";
};

const AdminAllBookings = () => {
  const [allBookings, setAllBookings] = useState([]);
  const navigate = useNavigate();

  const getAllBooking = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8001/api/admin/getallbookings",
        { withCredentials: true }
      );

      if (response.data.success) {
        setAllBookings(response.data.data);
      } else {
        message.error(response.data.message || "Unauthorized access");
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        message.error("Session expired, please login again");
        navigate("/login");
      } else {
        message.error("Failed to fetch bookings");
      }
    }
  };

  useEffect(() => {
    getAllBooking();
  }, []);

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-indigo-700">All bookings</h2>
      <p className="mb-6 text-sm text-slate-500">
        Booking requests from renters across every property.
      </p>

      <div className="overflow-x-auto rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-indigo-100/90 text-indigo-900">
            <tr>
              <th className="px-4 py-3">Booking ID</th>
              <th className="px-4 py-3 text-center">Owner ID</th>
              <th className="px-4 py-3 text-center">Property ID</th>
              <th className="px-4 py-3 text-center">Tenant ID</th>
              <th className="px-4 py-3 text-center">Tenant name</th>
              <th className="px-4 py-3 text-center">Tenant contact</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {allBookings.length > 0 ? (
              allBookings.map((booking) => (
                <tr
                  key={booking._id}
                  className="border-t border-indigo-50 transition duration-200 even:bg-indigo-50/30 hover:bg-sky-50/50"
                >
                  <td className="px-4 py-3">{booking._id}</td>
                  <td className="px-4 py-3 text-center">{booking.ownerID}</td>
                  <td className="px-4 py-3 text-center font-medium text-indigo-700">
                    {booking.propertyId}
                  </td>
                  <td className="px-4 py-3 text-center">{booking.userID}</td>
                  <td className="px-4 py-3 text-center">{booking.userName}</td>
                  <td className="px-4 py-3 text-center">{booking.phone}</td>
                  <td
                    className={`px-4 py-3 text-center font-semibold ${bookingStatusClass(
                      booking.bookingStatus
                    )}`}
                  >
                    {booking.bookingStatus}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAllBookings;
