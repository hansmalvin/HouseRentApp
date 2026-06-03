import React, { useState, useEffect } from "react";
import axios from "axios";
import { message, Popconfirm } from "antd";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, Phone, Mail, Clock,
  CheckCircle2, XCircle, ExternalLink, Trash2,
} from "lucide-react";

// Status badge
const StatusBadge = ({ status }) => {
  const s = String(status).toLowerCase();
  if (s === "booked" || s === "approved") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
      <CheckCircle2 className="h-3 w-3" />{status}
    </span>
  );
  if (s === "rejected" || s === "cancelled") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600">
      <XCircle className="h-3 w-3" />{status}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">
      <Clock className="h-3 w-3" />{status}
    </span>
  );
};

function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function fmtRp(amt) {
  if (!amt) return null;
  return `Rp${Number(amt).toLocaleString("id-ID")}`;
}

//  Booking card 
const BookingCard = ({ booking, onCancel }) => {
  const navigate = useNavigate();
  const hasDate = booking.checkIn && booking.checkOut;
  const stripColor =
    ["booked","approved"].includes(String(booking.bookingStatus).toLowerCase()) ? "bg-green-400" :
    ["rejected","cancelled"].includes(String(booking.bookingStatus).toLowerCase()) ? "bg-red-400" :
    "bg-yellow-400";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className={`h-1.5 w-full ${stripColor}`} />
      <div className="p-5 space-y-4">

        {/* Status row */}
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={booking.bookingStatus} />
          {/* Cancel button only for pending/booked */}
          {!["rejected","cancelled"].includes(String(booking.bookingStatus).toLowerCase()) && (
            <Popconfirm
              title="Cancel this booking?"
              description="Your reservation will be removed and the dates freed up."
              onConfirm={() => onCancel(booking._id)}
              okText="Yes, cancel"
              okButtonProps={{ danger: true }}
              cancelText="Keep booking"
              placement="top"
            >
              <button
                type="button"
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50 transition"
                title="Cancel booking"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Cancel
              </button>
            </Popconfirm>
          )}
        </div>

        <div className="border-t border-gray-100" />

        {/* Owner contact info */}
        <div className="space-y-2">
          {booking.ownerEmail && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="truncate">{booking.ownerEmail}</span>
            </div>
          )}
          {booking.ownerContact && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-gray-400 shrink-0" />
              <span>{booking.ownerContact}</span>
            </div>
          )}
          {!booking.ownerEmail && !booking.ownerContact && (
            <p className="text-xs text-gray-400 italic">Owner contact not available</p>
          )}
        </div>

        {/* Dates price */}
        {hasDate && (
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Check-in</p>
                <p className="text-sm font-medium text-gray-900">{fmtDate(booking.checkIn)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Checkout</p>
                <p className="text-sm font-medium text-gray-900">{fmtDate(booking.checkOut)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                <Clock className="h-3.5 w-3.5 inline mr-1 text-gray-400" />
                {booking.totalDays} night{booking.totalDays > 1 ? "s" : ""}
              </span>
              {booking.totalPrice && (
                <span className="font-semibold text-gray-900">{fmtRp(booking.totalPrice)}</span>
              )}
            </div>
          </div>
        )}

        {/* View property */}
        {booking.propertyId && (
          <button
            type="button"
            onClick={() => navigate(`/rooms/${booking.propertyId}`)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition"
          >
            <ExternalLink className="h-4 w-4" />
            View property
          </button>
        )}
      </div>
    </div>
  );
};

// Empty state 
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
      <CalendarDays className="h-7 w-7 text-indigo-400" />
    </div>
    <h3 className="text-base font-semibold text-gray-900">No bookings yet</h3>
    <p className="mt-1 text-sm text-gray-500 max-w-xs">
      Once you book a property it will appear here. Browse listings to get started.
    </p>
  </div>
);

//  Main component 
const RenterAllProperty = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:8001/api/user/getallbookings", { withCredentials: true });
      if (res.data.success) {
        setBookings(res.data.data);
      } else {
        message.error(res.data.message);
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        message.error("Session expired, please login again");
        navigate("/login");
      } else {
        message.error("Failed to fetch bookings");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      const res = await axios.delete(
        `http://localhost:8001/api/user/cancelbooking/${bookingId}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        message.success("Booking cancelled");
        setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      } else {
        message.error(res.data.message || "Failed to cancel booking");
      }
    } catch {
      message.error("Failed to cancel booking");
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Booking history</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {bookings.length > 0
              ? `${bookings.length} booking${bookings.length > 1 ? "s" : ""} found`
              : "No bookings yet"}
          </p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RenterAllProperty;
