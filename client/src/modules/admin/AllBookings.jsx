import React, { useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;

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
      if (error.response && error.response.status === 401) {
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
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full border border-gray-700 bg-gray-900/80 backdrop-blur-md shadow-2xl rounded-xl overflow-hidden">
        <thead className="bg-indigo-600/80 text-white">
          <tr>
            <th className="py-3 px-4 text-left">Booking ID</th>
            <th className="py-3 px-4 text-center">Owner ID</th>
            <th className="py-3 px-4 text-center">Property ID</th>
            <th className="py-3 px-4 text-center">Tenant ID</th>
            <th className="py-3 px-4 text-center">Tenant Name</th>
            <th className="py-3 px-4 text-center">Tenant Contact</th>
            <th className="py-3 px-4 text-center">Booking Status</th>
          </tr>
        </thead>
        <tbody>
          {allBookings.length > 0 ? (
            allBookings.map((booking, index) => (
              <tr
                key={booking._id}
                className={`transition duration-200 ${index % 2 === 0 ? "bg-gray-800/60" : "bg-gray-900/60"
                  } hover:bg-indigo-500/20`}
              >
                <td className="py-2 px-4 border-b border-gray-700 text-gray-200">
                  {booking._id}
                </td>
                <td className="py-2 px-4 border-b border-gray-700 text-center text-gray-300">
                  {booking.ownerID}
                </td>
                <td className="py-2 px-4 border-b border-gray-700 text-center text-indigo-400 font-medium">
                  {booking.propertyId}
                </td>
                <td className="py-2 px-4 border-b border-gray-700 text-center text-gray-300">
                  {booking.userID}
                </td>
                <td className="py-2 px-4 border-b border-gray-700 text-center text-gray-300">
                  {booking.userName}
                </td>
                <td className="py-2 px-4 border-b border-gray-700 text-center text-gray-300">
                  {booking.phone}
                </td>
                <td
                  className={`py-2 px-4 border-b border-gray-700 text-center font-semibold ${booking.bookingStatus === "Confirmed"
                      ? "text-green-400"
                      : booking.bookingStatus === "Pending"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                >
                  {booking.bookingStatus}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="7"
                className="text-center py-6 text-gray-400 font-medium italic"
              >
                No bookings found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminAllBookings;
