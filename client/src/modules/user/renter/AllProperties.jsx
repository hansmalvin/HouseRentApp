import React, { useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Phone, Hash, Building2, Clock, CheckCircle2, XCircle, ExternalLink } from "lucide-react";

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = String(status).toLowerCase();
  if (s === "booked" || s === "approved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
        <CheckCircle2 className="h-3 w-3" /> {status}
      </span>
    );
  }
  if (s === "rejected" || s === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600">
        <XCircle className="h-3 w-3" /> {status}
      </span>
    );
  }
  // pending / default
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">
      <Clock className="h-3 w-3" /> {status}
    </span>
  );
};

// ── Format date ───────────────────────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── Format Rupiah ─────────────────────────────────────────────────────────────
function fmtRp(amount) {
  if (!amount) return null;
  return `Rp${Number(amount).toLocaleString("id-ID")}`;
}

// ── Single booking card ───────────────────────────────────────────────────────
const BookingCard = ({ booking }) => {
  const navigate = useNavigate();
  const hasDate = booking.checkIn && booking.checkOut;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Card top strip — status colour */}
      <div className={`h-1.5 w-full ${
        String(booking.bookingStatus).toLowerCase() === "booked" || String(booking.bookingStatus).toLowerCase() === "approved"
          ? "bg-green-400"
          : String(booking.bookingStatus).toLowerCase() === "rejected" || String(booking.bookingStatus).toLowerCase() === "cancelled"
          ? "bg-red-400"
          : "bg-yellow-400"
      }`} />

      <div className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
              <Building2 className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Property</p>
              <p className="text-sm font-semibold text-gray-900 truncate font-mono">
                {booking.propertyId ?? "—"}
              </p>
            </div>
          </div>
          <StatusBadge status={booking.bookingStatus} />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Details grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Hash className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="truncate font-mono text-xs text-gray-500">{booking._id}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4 text-gray-400 shrink-0" />
            <span>{booking.phone ?? "—"}</span>
          </div>

          {hasDate && (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarDays className="h-4 w-4 text-gray-400 shrink-0" />
                <span>
                  <span className="font-medium text-gray-900">Check-in:</span>{" "}
                  {fmtDate(booking.checkIn)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarDays className="h-4 w-4 text-gray-400 shrink-0" />
                <span>
                  <span className="font-medium text-gray-900">Checkout:</span>{" "}
                  {fmtDate(booking.checkOut)}
                </span>
              </div>
            </>
          )}

          {booking.totalDays && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-gray-400 shrink-0" />
              <span>{booking.totalDays} night{booking.totalDays > 1 ? "s" : ""}</span>
            </div>
          )}

          {booking.totalPrice && (
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <span className="text-gray-400 text-xs">Total:</span>
              {fmtRp(booking.totalPrice)}
            </div>
          )}
        </div>

        {/* View property link */}
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

// ── Empty state ───────────────────────────────────────────────────────────────
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

// ── Main component ────────────────────────────────────────────────────────────
const RenterAllProperty = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8001/api/user/getallbookings",
          { withCredentials: true }
        );
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
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
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

      {/* Content */}
      {bookings.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RenterAllProperty;
