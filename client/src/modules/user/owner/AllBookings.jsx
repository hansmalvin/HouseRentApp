import { message, Popconfirm } from "antd";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";

axios.defaults.withCredentials = true;

function fmtDate(dateStr) {
  if (!dateStr) return <span className="text-slate-400">—</span>;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const OwnerAllBookings = ({ isAdmin = false }) => {
  const [allBookings, setAllBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const navigate = useNavigate();

  const handleTerminate = async (bookingId) => {
  try {
    const res = await axios.delete(
      `http://localhost:8001/api/owner/terminatebooking/${bookingId}`,
      { withCredentials: true }
    );
    if (res.data.success) {
      message.success(res.data.message);
      getAllProperty();
    } else {
      message.error(res.data.message || "Failed to terminate booking");
    }
  } catch (error) {
      console.log(error);
      message.error("Failed to terminate booking");
    }
  };

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

  useEffect(() => { getAllProperty(); }, []);

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
      // 409 = date collision — show the server's specific message as a warning
      if (error.response?.status === 409 && error.response.data?.collision) {
        message.warning({
          content: error.response.data.message,
          duration: 6,
        });
      } else {
        message.error("Failed to update booking status");
      }
    }
  };

  const displayedBookings = allBookings
    .filter((b) =>
      !search ||
      [b.userName, b.phone, b._id, b.propertyId, b.bookingStatus]
        .filter(Boolean).join(" ").toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortAsc
        ? (a.userName ?? "").localeCompare(b.userName ?? "")
        : (b.userName ?? "").localeCompare(a.userName ?? "")
    );

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-indigo-700">Booking requests</h2>
      <p className="mb-6 text-sm text-slate-500">
        Tenants who applied to your properties appear here. Approve or change status as needed.
      </p>

      <div className="mb-4 flex gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by tenant, booking ID, status…"
          className="min-w-0 flex-[85] rounded-xl border border-indigo-200/90 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <button
          type="button"
          onClick={() => setSortAsc((prev) => !prev)}
          className="flex flex-[15] items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-800 shadow-sm transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <ArrowsUpDownIcon className="h-4 w-4 shrink-0" aria-hidden />
          {sortAsc ? "A → Z" : "Z → A"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="bg-indigo-100/90 text-indigo-900">
            <tr>
              <th className="px-4 py-3 text-center font-semibold">Tenant name</th>
              <th className="px-4 py-3 text-center font-semibold">Tenant email</th>
              <th className="px-4 py-3 text-center font-semibold">Check-in</th>
              <th className="px-4 py-3 text-center font-semibold">Checkout</th>
              <th className="px-4 py-3 text-center font-semibold">Nights</th>
              <th className="px-4 py-3 text-center font-semibold">Total price</th>
              <th className="px-4 py-3 text-center font-semibold">Booking ID</th>
              <th className="px-4 py-3 text-center font-semibold">Property ID</th>
              <th className="px-4 py-3 text-center font-semibold">Status</th>
              <th className="px-4 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedBookings.length > 0 ? (
              displayedBookings.map((booking, idx) => (
                <tr
                  key={booking._id}
                  className={`border-t border-indigo-50 transition hover:bg-sky-50/60 ${
                    idx % 2 === 0 ? "bg-white" : "bg-indigo-50/30"
                  }`}
                >
                  <td className="px-4 py-3 text-center">{booking.userName}</td>
                  <td className="px-4 py-3 text-center">{booking.userEmail ?? "—"}</td>

                  {/* ── Check-in ── */}
                  <td className="px-4 py-3 text-center text-slate-700">
                    {booking.checkIn
                      ? fmtDate(booking.checkIn)
                      : <span className="text-xs text-slate-400 italic">Sale listing</span>}
                  </td>

                  {/* ── Checkout ── */}
                  <td className="px-4 py-3 text-center text-slate-700">
                    {booking.checkOut
                      ? fmtDate(booking.checkOut)
                      : <span className="text-xs text-slate-400 italic">Sale listing</span>}
                  </td>

                  {/* ── Nights ── */}
                  <td className="px-4 py-3 text-center text-slate-600">
                    {booking.totalDays
                      ? `${booking.totalDays}n`
                      : <span className="text-xs text-slate-400 italic">—</span>}
                  </td>

                  {/* ── Total price ── */}
                  <td className="px-4 py-3 text-center text-slate-700">
                    {booking.totalPrice
                      ? `Rp${Number(booking.totalPrice).toLocaleString("id-ID")}`
                      : <span className="text-slate-400">—</span>}
                  </td>

                  <td className="px-4 py-3 text-center font-mono text-xs sm:text-sm">
                    {booking._id}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-xs">
                    {booking.propertyId}
                  </td>
                  <td
                    className={`px-4 py-3 text-center font-semibold capitalize ${
                      booking.bookingStatus === "booked"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {booking.bookingStatus}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      {booking.bookingStatus === "pending" ? (
                        <button
                          type="button"
                          onClick={() => handleStatus(booking._id, booking.propertyId, "booked")}
                          disabled={isAdmin}
                          title={isAdmin ? "Admins cannot change booking status" : undefined}
                          className="rounded-lg bg-emerald-200 px-4 py-1.5 text-sm font-medium text-emerald-800 shadow-sm transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Mark booked
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStatus(booking._id, booking.propertyId, "pending")}
                          disabled={isAdmin}
                          title={isAdmin ? "Admins cannot change booking status" : undefined}
                          className="rounded-lg bg-amber-200 px-4 py-1.5 text-sm font-medium text-amber-800 shadow-sm transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Mark pending
                        </button>
                      )}
                      {/* Terminate — only enabled on pending bookings */}
                      <Popconfirm
                        title="Terminate this booking?"
                        description="The pending booking request will be permanently removed."
                        onConfirm={() => handleTerminate(booking._id)}
                        okText="Terminate"
                        okButtonProps={{ danger: true }}
                        cancelText="Keep it"
                        placement="topRight"
                        disabled={isAdmin || booking.bookingStatus === "booked"}
                      >
                        <button
                          type="button"
                          disabled={isAdmin || booking.bookingStatus === "booked"}
                          title={
                            isAdmin
                              ? "Admins cannot terminate bookings"
                              : booking.bookingStatus === "booked"
                              ? "Cannot terminate a confirmed booking"
                              : "Terminate this booking request"
                          }
                          className="rounded-lg bg-rose-200 px-4 py-1.5 text-sm font-medium text-rose-800 shadow-sm transition hover:bg-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Terminate
                        </button>
                      </Popconfirm>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-slate-500">
                  No booking requests yet. When tenants apply to your listings, they will show up here.
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
