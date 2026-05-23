import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import AdminTableToolbar from "../../components/AdminTableToolbar";
import { applySearchAndSort } from "../../utils/adminTableFilters";

axios.defaults.withCredentials = true;

const bookingStatusClass = (status) => {
  if (status === "Confirmed") return "text-emerald-600";
  if (status === "Pending") return "text-amber-600";
  return "text-rose-600";
};

const AdminAllBookings = () => {
  const [allBookings, setAllBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
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

  const displayedBookings = useMemo(
    () =>
      applySearchAndSort(allBookings, {
        search,
        sortAsc,
        getSearchableText: (booking) =>
          [
            booking.userName,
            booking.phone,
            booking.bookingStatus,
            booking._id,
            booking.ownerID,
            booking.propertyId,
            booking.userID,
          ]
            .filter(Boolean)
            .join(" "),
        getSortValue: (booking) => booking.userName,
      }),
    [allBookings, search, sortAsc]
  );

  return (
    <div className="min-w-0 w-full">
      <h2 className="mb-1 text-xl font-bold text-indigo-700">All bookings</h2>
      <p className="mb-4 text-sm text-slate-500">
        Booking requests from renters across every property.
      </p>

      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <div className="border-b border-indigo-50 px-4 py-4 sm:px-5">
          <AdminTableToolbar
            search={search}
            onSearchChange={setSearch}
            sortAsc={sortAsc}
            onSortToggle={() => setSortAsc((prev) => !prev)}
            placeholder="Search by tenant name, contact, status…"
          />
        </div>
        <div className="overflow-x-auto">
        <table className="w-max min-w-full text-left text-sm text-slate-700">
          <thead className="bg-indigo-100/90 text-indigo-900">
            <tr>
              <th className="px-4 py-3">Tenant name</th>
              <th className="px-4 py-3 text-center">Tenant contact</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="whitespace-nowrap px-4 py-3 text-center">Booking ID</th>
              <th className="whitespace-nowrap px-4 py-3 text-center">Owner ID</th>
              <th className="whitespace-nowrap px-4 py-3 text-center">Property ID</th>
              <th className="whitespace-nowrap px-4 py-3 text-center">Tenant ID</th>
            </tr>
          </thead>
          <tbody>
            {displayedBookings.length > 0 ? (
              displayedBookings.map((booking) => (
                <tr
                  key={booking._id}
                  className="border-t border-indigo-50 transition duration-200 even:bg-indigo-50/30 hover:bg-sky-50/50"
                >
                  <td className="px-4 py-3 font-medium">{booking.userName}</td>
                  <td className="px-4 py-3 text-center">{booking.phone}</td>
                  <td
                    className={`px-4 py-3 text-center font-semibold ${bookingStatusClass(
                      booking.bookingStatus
                    )}`}
                  >
                    {booking.bookingStatus}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-xs text-slate-500">
                    {booking._id}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-xs text-slate-500">
                    {booking.ownerID}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-xs text-slate-500">
                    {booking.propertyId}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-xs text-slate-500">
                    {booking.userID}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  {allBookings.length === 0
                    ? "No bookings found"
                    : "No matching bookings"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAllBookings;
