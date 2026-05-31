import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Popconfirm } from "antd";
import { useNavigate } from "react-router-dom";
import Toast from "../common/Toast";
import { Trash2 } from "lucide-react";
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
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const navigate = useNavigate();

  const showToast = (type, message) => setToast({ show: true, type, message });

  const getAllBooking = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8001/api/admin/getallbookings",
        { withCredentials: true }
      );

      if (response.data.success) {
        setAllBookings(response.data.data);
      } else {
        showToast("error", response.data.message || "Unauthorized access");
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        showToast("error", "Session expired, please login again");
        navigate("/login");
      } else {
        showToast("error", "Failed to fetch bookings");
      }
    }
  };

const handleDelete = async (bookingid) => {
    try {
      const res = await axios.delete(
        `http://localhost:8001/api/admin/deletebooking/${bookingid}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        showToast("success", res.data.message);
        setAllBookings((prev) => prev.filter((b) => b._id !== bookingid));
      } else {
        showToast("error", res.data.message || "Failed to delete booking");
      }
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to delete booking");
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
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      <h2 className="mb-1 text-lg font-bold text-indigo-700 sm:text-xl">All bookings</h2>
      <p className="mb-4 text-xs text-slate-500 sm:text-sm">
        Booking requests from renters across every property.
      </p>

      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <div className="border-b border-indigo-50 px-3 py-3 sm:px-5 sm:py-4">
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
              <th className="px-3 py-2.5 sm:px-4 sm:py-3">Tenant name</th>
              <th className="px-3 py-2.5 text-center sm:px-4 sm:py-3">Tenant contact</th>
              <th className="px-3 py-2.5 text-center sm:px-4 sm:py-3">Status</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-center sm:px-4 sm:py-3">Booking ID</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-center sm:px-4 sm:py-3">Owner ID</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-center sm:px-4 sm:py-3">Property ID</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-center sm:px-4 sm:py-3">Tenant ID</th>
              <th className="px-3 py-2.5 text-center sm:px-4 sm:py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedBookings.length > 0 ? (
              displayedBookings.map((booking) => (
                <tr
                  key={booking._id}
                  className="border-t border-indigo-50 transition duration-200 even:bg-indigo-50/30 hover:bg-sky-50/50"
                >
                  <td className="px-3 py-2.5 font-medium sm:px-4 sm:py-3">{booking.userName}</td>
                  <td className="px-3 py-2.5 text-center sm:px-4 sm:py-3">{booking.phone}</td>
                  <td
                    className={`px-3 py-2.5 text-center font-semibold sm:px-4 sm:py-3 ${bookingStatusClass(
                      booking.bookingStatus
                    )}`}
                  >
                    {booking.bookingStatus}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-xs text-slate-500 sm:px-4 sm:py-3">
                    {booking._id}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-xs text-slate-500 sm:px-4 sm:py-3">
                    {booking.ownerID}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-xs text-slate-500 sm:px-4 sm:py-3">
                    {booking.propertyId}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-xs text-slate-500 sm:px-4 sm:py-3">
                    {booking.userID}
                  </td>
                  <td className="px-3 py-2.5 text-center sm:px-4 sm:py-3">
                    <Popconfirm
                      title="Delete this booking?"
                      description="This booking record will be permanently removed."
                      onConfirm={() => handleDelete(booking._id)}
                      okText="Delete"
                      okButtonProps={{ danger: true }}
                      cancelText="Cancel"
                      placement="top"
                    >
                      <button
                        type="button"
                        className="flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-2 py-1 text-sm font-medium text-rose-700 transition hover:bg-rose-100 sm:px-3"
                        title="Delete booking"
                      >
                        <Trash2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </Popconfirm>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-6 text-center text-sm text-slate-400"
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
