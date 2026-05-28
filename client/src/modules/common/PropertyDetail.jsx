import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeftIcon, HeartIcon, ShareIcon, PhoneIcon, EnvelopeIcon,
  MapPinIcon, HomeIcon, TagIcon, ChevronLeftIcon, ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import {
  Utensils, Wifi, Waves, AirVent, Trees, ParkingSquare, Tv,
  BuildingIcon, Wind, SprayCan, Droplets, Thermometer,
  Archive, Dices, Refrigerator, FlameKindling, BriefcaseMedical,
  LayoutPanelTop, SoapDispenserDroplet, ChevronLeft, ChevronRight,
} from "lucide-react";
import emailjs from "@emailjs/browser";
import { formatPropertyAmount, getMaxGuestsFromProperty } from "../../utils/propertyFormat";
import { parsePropertyAddress } from "../../utils/propertyAddress";
import { UserContext } from "../../App";
import RentEaseLogo from "../../components/RentEaseLogo";
import { message, Popconfirm } from "antd";

// ── Amenity icon map ────────────────────────────────────────────────
const AMENITY_ICONS = {
  "Kitchen": Utensils, "Wifi": Wifi, "Dedicated workspace": BuildingIcon,
  "Free parking on premises": ParkingSquare, "Pool": Waves, "TV": Tv,
  "Air conditioning": AirVent, "Patio or balcony": LayoutPanelTop,
  "Backyard": Trees, "Hair dryer": Wind, "Cleaning products": SprayCan,
  "Body soap": Droplets, "Shampoo": SoapDispenserDroplet, "Hot water": Thermometer,
  "Drying rack for clothing": Wind, "Clothing storage": Archive, "Board games": Dices,
  "Refrigerator": Refrigerator, "Fire extinguisher": FlameKindling, "First aid kit": BriefcaseMedical,
};

// ── Date helpers ────────────────────────────────────────────────────
function startOfDay(d) { const c = new Date(d); c.setHours(0, 0, 0, 0); return c; }
function isSameDay(a, b) { return a && b && startOfDay(a).getTime() === startOfDay(b).getTime(); }
function isBetween(d, a, b) {
  if (!a || !b) return false;
  const t = startOfDay(d).getTime();
  return t > startOfDay(a).getTime() && t < startOfDay(b).getTime();
}
function diffDays(a, b) {
  if (!a || !b) return 0;
  return Math.max(1, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}
function formatDateDisplay(date) {
  if (!date) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function formatDateInput(date) {
  if (!date) return "";
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const y = date.getFullYear();
  return `${m}/${d}/${y}`;
}

// ── NEW: Check if a date falls within any booked range ──────────────
// bookedRanges: Array of { checkIn: Date, checkOut: Date }
function isDateBooked(date, bookedRanges) {
  const t = startOfDay(date).getTime();
  return bookedRanges.some(({ checkIn, checkOut }) => {
    const inT  = startOfDay(checkIn).getTime();
    const outT = startOfDay(checkOut).getTime();
    // A date is "booked" if it falls on or between checkIn and checkOut (inclusive)
    return t >= inT && t <= outT;
  });
}

// ── NEW: Check if a proposed range overlaps with any booked range ───
function rangeOverlapsBooked(start, end, bookedRanges) {
  if (!start || !end) return false;
  const s = startOfDay(start).getTime();
  const e = startOfDay(end).getTime();
  return bookedRanges.some(({ checkIn, checkOut }) => {
    const inT  = startOfDay(checkIn).getTime();
    const outT = startOfDay(checkOut).getTime();
    return s < outT && e > inT; // overlap condition
  });
}

const DAYS_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ── Calendar month grid ─────────────────────────────────────────────
// CHANGED: now accepts bookedRanges prop
const CalendarMonth = ({ year, month, checkIn, checkOut, hoveredDate, onDayClick, onDayHover, today, bookedRanges }) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div className="flex-1">
      <p className="mb-2 text-center text-sm font-semibold text-gray-900">{MONTH_NAMES[month]} {year}</p>
      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} />;
          const isPast   = startOfDay(date) < startOfDay(today);
          // NEW: check if this date is within a confirmed booking
          const isBooked = isDateBooked(date, bookedRanges);
          const isStart  = isSameDay(date, checkIn);
          const isEnd    = isSameDay(date, checkOut);
          const inRange  = isBetween(date, checkIn, checkOut || hoveredDate);
          const isHoverEnd = !checkOut && isSameDay(date, hoveredDate);
          const isToday  = isSameDay(date, today);

          // Disabled if past OR booked by another renter
          const isDisabled = isPast || isBooked;

          let cls = "relative flex flex-col items-center justify-center h-8 text-xs select-none transition-colors ";

          if (isBooked && !isStart && !isEnd) {
            // Booked by someone else — visually distinct: red-ish strikethrough style
            cls += "text-red-300 cursor-not-allowed line-through decoration-red-300 bg-red-50 ";
          } else if (isPast) {
            cls += "text-gray-300 cursor-not-allowed ";
          } else if (isStart || isEnd) {
            cls += "bg-gray-900 text-white rounded-full font-semibold z-10 cursor-pointer ";
          } else if (inRange || isHoverEnd) {
            cls += "bg-indigo-100 text-indigo-800 cursor-pointer ";
          } else if (isToday) {
            cls += "text-indigo-600 font-semibold hover:bg-gray-100 rounded-full cursor-pointer ";
          } else {
            cls += "text-gray-800 hover:bg-gray-100 rounded-full cursor-pointer ";
          }

          const rangeBar =
            (isStart && checkOut) ? "after:absolute after:inset-y-0 after:right-0 after:left-1/2 after:bg-indigo-100 after:-z-10 " :
            (isEnd   && checkIn)  ? "after:absolute after:inset-y-0 after:left-0 after:right-1/2 after:bg-indigo-100 after:-z-10 " : "";

          return (
            <div
              key={date.toISOString()}
              className={cls + rangeBar}
              onClick={() => !isDisabled && onDayClick(date)}
              onMouseEnter={() => !isDisabled && onDayHover(date)}
              onMouseLeave={() => onDayHover(null)}
              title={isBooked ? "Already booked" : undefined}
            >
              {date.getDate()}
              {/* NEW: tiny dot indicator under booked dates */}
              {isBooked && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-400" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Inline booking date picker ──────────────────────────────────────
// CHANGED: passes bookedRanges down and validates range selection
const BookingDatePicker = ({ checkIn, checkOut, onChange, bookedRanges }) => {
  const today = startOfDay(new Date());
  const [offset, setOffset] = useState(0);
  const [hoveredDate, setHoveredDate] = useState(null);
  // NEW: warning shown when user tries to select a range that overlaps a booking
  const [overlapWarning, setOverlapWarning] = useState(false);

  const months = [0, 1].map((i) => {
    const d = new Date(today.getFullYear(), today.getMonth() + offset + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const handleDayClick = (date) => {
    setOverlapWarning(false);
    if (!checkIn || (checkIn && checkOut)) {
      onChange(date, null);
    } else {
      if (startOfDay(date) <= startOfDay(checkIn)) {
        onChange(date, null);
      } else {
        // NEW: reject if the proposed range spans over a booked period
        if (rangeOverlapsBooked(checkIn, date, bookedRanges)) {
          setOverlapWarning(true);
          // Reset so user can pick again
          onChange(null, null);
          return;
        }
        onChange(checkIn, date);
      }
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={() => setOffset((o) => o - 1)} disabled={offset === 0}
          className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <ChevronLeft className="h-3.5 w-3.5 text-gray-700" />
        </button>
        <button type="button" onClick={() => setOffset((o) => o + 1)}
          className="p-1 rounded-full hover:bg-gray-200 transition">
          <ChevronRight className="h-3.5 w-3.5 text-gray-700" />
        </button>
      </div>
      <CalendarMonth
        year={months[0].year} month={months[0].month}
        checkIn={checkIn} checkOut={checkOut}
        hoveredDate={hoveredDate} onDayClick={handleDayClick}
        onDayHover={setHoveredDate} today={today}
        bookedRanges={bookedRanges}
      />

      {/* NEW: legend + overlap warning */}
      <div className="mt-3 flex items-center gap-3 text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-300" />
          Already booked
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-900" />
          Your selection
        </span>
      </div>
      {overlapWarning && (
        <p className="mt-2 text-xs text-red-500 text-center">
          Your selected range includes already-booked dates. Please choose different dates.
        </p>
      )}

      {(checkIn || checkOut) && (
        <button type="button" onClick={() => { onChange(null, null); setOverlapWarning(false); }}
          className="mt-2 w-full text-center text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600">
          Clear dates
        </button>
      )}
    </div>
  );
};

// ── Helpers ─────────────────────────────────────────────────────────
function getPageTitle(property) {
  const { district, city } = parsePropertyAddress(property.propertyAddress);
  const area = district || city || "Indonesia";
  const type = property.propertyType
    ? property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)
    : "Property";
  return `${type} in ${area}`;
}

function parseAdditionalInfo(property) {
  const amenities = Array.isArray(property.amenities) ? property.amenities : [];
  const knownLabels = Object.keys(AMENITY_ICONS);
  if (amenities.length > 0) {
    const text = (property.additionalInfo || "")
      .split(",").map((s) => s.trim()).filter((s) => s && !knownLabels.includes(s)).join(", ");
    return { amenities, notes: text };
  }
  const parts = (property.additionalInfo || "").split(",").map((s) => s.trim()).filter(Boolean);
  return {
    amenities: parts.filter((p) => knownLabels.includes(p)),
    notes: parts.filter((p) => !knownLabels.includes(p)).join(", "),
  };
}

// ── Image Gallery ────────────────────────────────────────────────────
const ImageGallery = ({ images, title }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const prev = () => setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setLightboxIndex((i) => (i + 1) % images.length);

  if (!images?.length) return (
    <div className="h-[420px] w-full rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
      No images available
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] rounded-2xl overflow-hidden">
        <div className="col-span-2 row-span-2 cursor-pointer overflow-hidden" onClick={() => setLightboxIndex(0)}>
          <img src={images[0].url} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
        </div>
        {images.slice(1, 5).map((img, i) => (
          <div key={i} className="col-span-1 row-span-1 cursor-pointer overflow-hidden relative" onClick={() => setLightboxIndex(i + 1)}>
            <img src={img.url} alt={`${title} ${i + 2}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            {i === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-sm font-semibold bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">Show all photos</span>
              </div>
            )}
          </div>
        ))}
        {images.length < 5 && Array.from({ length: 4 - Math.min(images.length - 1, 4) }).map((_, i) => (
          <div key={`empty-${i}`} className="col-span-1 row-span-1 bg-gray-100" />
        ))}
      </div>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxIndex(null)}>
          <button className="absolute top-4 right-4 text-white p-2" onClick={() => setLightboxIndex(null)}>✕</button>
          <button className="absolute left-4 text-white p-3 rounded-full bg-white/10 hover:bg-white/20" onClick={(e) => { e.stopPropagation(); prev(); }}>
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <img src={images[lightboxIndex].url} alt={`${title} ${lightboxIndex + 1}`} className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
          <button className="absolute right-4 text-white p-3 rounded-full bg-white/10 hover:bg-white/20" onClick={(e) => { e.stopPropagation(); next(); }}>
            <ChevronRightIcon className="h-6 w-6" />
          </button>
          <span className="absolute bottom-4 text-white/60 text-sm">{lightboxIndex + 1} / {images.length}</span>
        </div>
      )}
    </>
  );
};

// ── Main Component ───────────────────────────────────────────────────
const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useContext(UserContext);

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Existing booking for this property+user (if any)
  const [existingBooking, setExistingBooking] = useState(null);

  // NEW: booked date ranges from confirmed bookings on this property
  const [bookedRanges, setBookedRanges] = useState([]);

  // Email modal
  const [emailModal, setEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({ from_name: "", from_email: "", message: "" });
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  // Booking state
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [bookingStatus, setBookingStatus] = useState("idle"); // idle|loading|success|error
  const [bookingMessage, setBookingMessage] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  const isRenter = userData?.type === "Renter";
  const isOwner  = userData?.type === "Owner";
  const isAdmin  = userData?.type === "Admin";
  const canBook  = isRenter;

  // Derive whether dates have changed from the existing booking
  const existingCheckIn  = existingBooking?.checkIn  ? new Date(existingBooking.checkIn)  : null;
  const existingCheckOut = existingBooking?.checkOut ? new Date(existingBooking.checkOut) : null;
  const datesChanged =
    existingBooking &&
    (
      (checkIn  && !isSameDay(checkIn,  existingCheckIn))  ||
      (checkOut && !isSameDay(checkOut, existingCheckOut)) ||
      (!checkIn && existingCheckIn) ||
      (!checkOut && existingCheckOut)
    );

  // Booking card CTA label
  const ctaLabel = () => {
    if (bookingStatus === "loading") return existingBooking ? (datesChanged ? "Updating…" : "Cancelling…") : "Booking…";
    if (existingBooking) return datesChanged ? "Update your booking" : "Cancel your booking";
    if (isRent && (!checkIn || !checkOut)) return "Check availability";
    return "Reserve";
  };

  const ctaStyle = () => {
    if (existingBooking && !datesChanged) {
      return "bg-red-500 hover:bg-red-600";
    }
    return "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600";
  };

  const handleDateChange = (newIn, newOut) => {
    setCheckIn(newIn);
    setCheckOut(newOut);
    if (newIn && newOut) setShowCalendar(false);
    if (bookingStatus === "success" || bookingStatus === "error") setBookingStatus("idle");
  };

  // Load property
  useEffect(() => {
    const fetchProp = async () => {
      try {
        const res = await axios.get(`http://localhost:8001/api/user/property/${id}`, { withCredentials: true });
        if (res.data.success) setProperty(res.data.data);
        else setError("Property not found.");
      } catch { setError("Failed to load property."); }
      finally { setLoading(false); }
    };
    fetchProp();
  }, [id]);

  // NEW: Load booked date ranges for this property (public endpoint, no auth)
  useEffect(() => {
    const fetchBookedRanges = async () => {
      try {
        const res = await axios.get(`http://localhost:8001/api/user/property/${id}/bookings`);
        if (res.data.success) {
          // Convert ISO strings to Date objects
          const ranges = res.data.data.map((b) => ({
            checkIn:  new Date(b.checkIn),
            checkOut: new Date(b.checkOut),
          }));
          setBookedRanges(ranges);
        }
      } catch { /* silent — calendar still works, just no blocking */ }
    };
    fetchBookedRanges();
  }, [id]);

  // Load existing booking for this renter + property
  useEffect(() => {
    if (!isRenter) return;
    const fetchBooking = async () => {
      try {
        const res = await axios.get("http://localhost:8001/api/user/getallbookings", { withCredentials: true });
        if (res.data.success) {
          const match = res.data.data.find((b) => b.propertyId?.toString() === id);
          if (match) {
            setExistingBooking(match);
            if (match.checkIn)  setCheckIn(new Date(match.checkIn));
            if (match.checkOut) setCheckOut(new Date(match.checkOut));
          }
        }
      } catch { /* silent */ }
    };
    fetchBooking();
  }, [id, isRenter]);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setEmailSending(true);
    setEmailStatus(null);
    const serviceId  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (!serviceId || !templateId || !publicKey) { setEmailStatus("error"); setEmailSending(false); return; }
    try {
      await emailjs.send(serviceId, templateId, {
        from_name: emailForm.from_name, from_email: emailForm.from_email,
        message: emailForm.message, to_email: property.ownerEmail,
        property_title: property ? getPageTitle(property) : "",
      }, { publicKey });
      setEmailStatus("success");
      setEmailForm({ from_name: "", from_email: "", message: "" });
    } catch { setEmailStatus("error"); }
    finally { setEmailSending(false); }
  };

  // ── Reserve / Update / Cancel handler ──────────────────────────────
  const handleCTA = async () => {
    if (!userData) { navigate("/login"); return; }

    setBookingStatus("loading");

    try {
      // ── CANCEL ─────────────────────────────────────────────────
      if (existingBooking && !datesChanged) {
        const res = await axios.delete(
          `http://localhost:8001/api/user/cancelbooking/${existingBooking._id}`,
          { withCredentials: true }
        );
        if (res.data.success) {
          setBookingStatus("success");
          setBookingMessage("Booking cancelled successfully.");
          setExistingBooking(null);
          setCheckIn(null);
          setCheckOut(null);
        } else {
          setBookingStatus("error");
          setBookingMessage(res.data.message || "Failed to cancel booking.");
        }
        return;
      }

      // ── UPDATE ─────────────────────────────────────────────────
      if (existingBooking && datesChanged) {
        if (!checkIn || !checkOut) { setShowCalendar(true); setBookingStatus("idle"); return; }
        const res = await axios.patch(
          `http://localhost:8001/api/user/updatebooking/${existingBooking._id}`,
          { userId: userData._id, checkIn: checkIn.toISOString(), checkOut: checkOut.toISOString() },
          { withCredentials: true }
        );
        if (res.data.success) {
          const { totalDays, totalPrice } = res.data.data ?? {};
          setBookingStatus("success");
          setBookingMessage(
            totalDays && totalPrice
              ? `Booking updated! ${totalDays} night${totalDays > 1 ? "s" : ""} · Rp${Number(totalPrice).toLocaleString("id-ID")}`
              : "Booking updated!"
          );
          setExistingBooking((prev) => ({ ...prev, checkIn: checkIn.toISOString(), checkOut: checkOut.toISOString(), totalDays, totalPrice }));
        } else {
          setBookingStatus("error");
          setBookingMessage(res.data.message || "Failed to update booking.");
        }
        return;
      }

      // ── NEW RESERVE ────────────────────────────────────────────
      if (isRent && (!checkIn || !checkOut)) { setShowCalendar(true); setBookingStatus("idle"); return; }
      const res = await axios.post(
        `http://localhost:8001/api/user/bookinghandle/${id}`,
        {
          userDetails: { fullName: userData.name, phone: userData.phone || "N/A" },
          status: "pending",
          userId: userData._id,
          ownerId: property.ownerId,
          checkIn: checkIn ? checkIn.toISOString() : undefined,
          checkOut: checkOut ? checkOut.toISOString() : undefined,
        },
        { withCredentials: true }
      );
      if (res.data.success) {
        const { totalDays, totalPrice, bookingId } = res.data.data ?? {};
        setBookingStatus("success");
        setBookingMessage(
          totalDays && totalPrice
            ? `Booking confirmed for ${totalDays} night${totalDays > 1 ? "s" : ""}! Total: Rp${Number(totalPrice).toLocaleString("id-ID")}`
            : "Booking confirmed!"
        );
        setExistingBooking({ _id: bookingId, propertyId: id, checkIn: checkIn?.toISOString(), checkOut: checkOut?.toISOString(), totalDays, totalPrice });
      } else {
        setBookingStatus("error");
        setBookingMessage("Booking failed. Please try again.");
      }
    } catch {
      setBookingStatus("error");
      setBookingMessage("Something went wrong. Please try again.");
    }
  };

  // ── Render guards ────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 text-sm">Loading property…</p>
      </div>
    </div>
  );

  if (error || !property) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <p className="text-gray-600">{error || "Property not found."}</p>
      <button onClick={() => navigate("/")} className="text-indigo-600 underline text-sm">Back to home</button>
    </div>
  );

  const title = getPageTitle(property);
  const { amenities, notes } = parseAdditionalInfo(property);
  const { city, district, streetAddress } = parsePropertyAddress(property.propertyAddress);
  const fullAddress = [streetAddress, district, city].filter(Boolean).join(", ");
  const isRent = String(property.propertyAdType).toLowerCase() === "rent";
  const isAvailable = property.isAvailable === "Available";
  const maxGuests = getMaxGuestsFromProperty(property);

  // Price calculation
  const monthlyPrice = property.propertyAmt || 0;
  const nights = checkIn && checkOut ? diffDays(checkIn, checkOut) : null;
  const dailyRate = monthlyPrice / 30;
  const totalPrice = nights ? Math.round(dailyRate * nights) : null;
  const displayPrice = totalPrice
    ? `Rp${Number(totalPrice).toLocaleString("id-ID")}`
    : `Rp${formatPropertyAmount(monthlyPrice)}`;
  const priceUnit = totalPrice
    ? `for ${nights} night${nights > 1 ? "s" : ""}`
    : isRent ? "per month" : "listing";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-4">
          <RentEaseLogo to="/" variant="light" size="md" />
          <div className="flex items-center gap-3">
            <button type="button" className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
              <ShareIcon className="h-4 w-4" />Share
            </button>
            <button type="button" className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
              <HeartIcon className="h-4 w-4" />Save
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-8">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition">
          <ArrowLeftIcon className="h-4 w-4" />Back
        </button>

        <h1 className="mb-2 text-2xl font-semibold text-gray-900 md:text-3xl">{title}</h1>

        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <span className="flex items-center gap-1"><StarSolid className="h-4 w-4 text-yellow-400" />4.9</span>
          {fullAddress && <span className="flex items-center gap-1"><MapPinIcon className="h-4 w-4" />{fullAddress}</span>}
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
            {property.isAvailable || "Available"}
          </span>
        </div>

        <div className="mb-10"><ImageGallery images={property.propertyImages} title={title} /></div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
          {/* ── Left column ── */}
          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-8">
              <span className="text-lg font-semibold text-gray-900 capitalize">{property.propertyType} · {property.propertyAdType}</span>
              {property.ownerName && <p className="text-gray-500 text-sm mt-1">Hosted by {property.ownerName}</p>}
            </div>

            <div className="border-b border-gray-200 pb-8 space-y-4">
              <div className="flex items-start gap-4">
                <HomeIcon className="h-6 w-6 text-gray-600 shrink-0 mt-0.5" />
                <div><p className="font-medium text-gray-900">Entire property</p><p className="text-sm text-gray-500">You'll have the whole place to yourself.</p></div>
              </div>
              <div className="flex items-start gap-4">
                <TagIcon className="h-6 w-6 text-gray-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Great value</p>
                  <p className="text-sm text-gray-500">Rp{formatPropertyAmount(monthlyPrice)} per month — competitively priced for this area.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPinIcon className="h-6 w-6 text-gray-600 shrink-0 mt-0.5" />
                <div><p className="font-medium text-gray-900">Great location</p><p className="text-sm text-gray-500">{fullAddress || "Indonesia"}</p></div>
              </div>
            </div>

            {amenities.length > 0 && (
              <div className="border-b border-gray-200 pb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">What this place offers</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {amenities.map((label) => {
                    const Icon = AMENITY_ICONS[label];
                    return (
                      <div key={label} className="flex items-center gap-3 text-sm text-gray-700">
                        {Icon ? <Icon className="h-5 w-5 text-gray-500 shrink-0" /> : <span className="h-5 w-5" />}
                        {label}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {notes && (
              <div className="border-b border-gray-200 pb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Additional details</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{notes}</p>
              </div>
            )}

            {(property.ownerContact || property.ownerEmail) && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact owner</h2>
                <div className="flex flex-wrap gap-3">
                  {property.ownerContact && (
                    <a href={`tel:${property.ownerContact}`} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-900 hover:shadow-sm transition">
                      <PhoneIcon className="h-4 w-4" />{property.ownerContact}
                    </a>
                  )}
                  {property.ownerEmail && (
                    <button type="button" onClick={() => { setEmailModal(true); setEmailStatus(null); }}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-900 hover:shadow-sm transition">
                      <EnvelopeIcon className="h-4 w-4" />Email owner
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Email modal */}
            {emailModal && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" onClick={() => setEmailModal(false)}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Email owner</h3>
                    <button type="button" onClick={() => setEmailModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                  </div>
                  <p className="text-sm text-gray-500">Sending about: <span className="font-medium text-gray-700">{title}</span></p>
                  {emailStatus === "success" ? (
                    <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 text-center">✓ Message sent successfully!</div>
                  ) : (
                    <form onSubmit={handleSendEmail} className="space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Your name</label>
                        <input type="text" required value={emailForm.from_name} onChange={(e) => setEmailForm((p) => ({ ...p, from_name: e.target.value }))} placeholder="John Doe" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Your email</label>
                        <input type="email" required value={emailForm.from_email} onChange={(e) => setEmailForm((p) => ({ ...p, from_email: e.target.value }))} placeholder="you@example.com" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Message</label>
                        <textarea required rows={4} value={emailForm.message} onChange={(e) => setEmailForm((p) => ({ ...p, message: e.target.value }))} placeholder="Hi, I'm interested in this property..." className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                      </div>
                      {emailStatus === "error" && <p className="text-xs text-red-500">Failed to send. Please try again.</p>}
                      <button type="submit" disabled={emailSending} className="w-full rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 transition disabled:opacity-50">
                        {emailSending ? "Sending…" : "Send message"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Right column — Booking card ── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-gray-200 p-6 shadow-xl space-y-4">

              {/* Price */}
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-2xl font-bold text-gray-900 underline">{displayPrice}</span>
                  <span className="text-gray-500 text-sm ml-1">{priceUnit}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <StarSolid className="h-4 w-4 text-yellow-400" />4.9
                </div>
              </div>

              {/* Existing booking notice */}
              {existingBooking && (
                <div className="rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-2.5 text-sm text-indigo-700 text-center font-medium">
                  ✓ You have an active booking for this property
                </div>
              )}

              {/* Check-in / Check-out — rent listings only */}
              {isRent && (
                <div>
                  <div
                    className="grid grid-cols-2 rounded-xl border border-gray-300 overflow-hidden cursor-pointer"
                    onClick={() => setShowCalendar((v) => !v)}
                  >
                    <div className="px-3 py-2.5 border-r border-gray-300 hover:bg-gray-50 transition">
                      <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Check-in</p>
                      <p className={`text-sm ${checkIn ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                        {checkIn ? formatDateInput(checkIn) : "Add date"}
                      </p>
                    </div>
                    <div className="px-3 py-2.5 hover:bg-gray-50 transition">
                      <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Checkout</p>
                      <p className={`text-sm ${checkOut ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                        {checkOut ? formatDateInput(checkOut) : "Add date"}
                      </p>
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="rounded-xl border border-gray-300 border-t-0 -mt-px px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Guests</p>
                    <p className="text-sm text-gray-900">
                      {maxGuests > 0
                        ? `Up to ${maxGuests} guest${maxGuests > 1 ? "s" : ""}`
                        : "1 guest"}
                    </p>
                  </div>

                  {/* CHANGED: pass bookedRanges into the date picker */}
                  {showCalendar && (
                    <div className="mt-2">
                      <BookingDatePicker
                        checkIn={checkIn}
                        checkOut={checkOut}
                        onChange={handleDateChange}
                        bookedRanges={bookedRanges}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Free cancellation notice */}
              {isRent && !existingBooking && (
                <div className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5 text-xs text-gray-600 text-center">
                  Rp 0 today · Free cancellation before check-in
                </div>
              )}

              {/* Availability */}
              <div className={`rounded-xl px-4 py-2.5 text-sm font-medium text-center ${isAvailable ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                {isAvailable ? "✓ Available now" : "Currently unavailable"}
              </div>

              {/* Type badges */}
              <div className="flex gap-2 flex-wrap">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 capitalize">{property.propertyType}</span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 capitalize">For {property.propertyAdType}</span>
              </div>

              {/* Feedback messages */}
              {bookingStatus === "success" && (
                <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 text-center">
                  ✓ {bookingMessage}
                </div>
              )}
              {bookingStatus === "error" && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 text-center">
                  {bookingMessage}
                </div>
              )}

              {/* CTA button */}
              {isAvailable && (
                userData ? (
                  canBook ? (
                    existingBooking && !datesChanged ? (
                      <Popconfirm
                        title="Cancel your booking?"
                        description="This will permanently cancel your reservation for these dates."
                        onConfirm={handleCTA}
                        okText="Yes, cancel it"
                        okButtonProps={{ danger: true }}
                        cancelText="Keep it"
                        placement="top"
                      >
                        <button
                          type="button"
                          disabled={bookingStatus === "loading"}
                          className="block w-full rounded-xl px-6 py-3.5 text-center text-sm font-semibold text-white shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed bg-red-500 hover:bg-red-600"
                        >
                          {ctaLabel()}
                        </button>
                      </Popconfirm>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCTA}
                        disabled={bookingStatus === "loading"}
                        className={`block w-full rounded-xl px-6 py-3.5 text-center text-sm font-semibold text-white shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed ${ctaStyle()}`}
                      >
                        {ctaLabel()}
                      </button>
                    )
                  ) : (
                    <div className="rounded-xl bg-gray-100 border border-gray-200 px-4 py-3 text-sm text-gray-400 text-center cursor-not-allowed select-none">
                      Booking is for renters only
                    </div>
                  )
                ) : (
                  <Link to="/login" className="block w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-md hover:from-pink-600 hover:to-rose-600 transition">
                    Log in to book
                  </Link>
                )
              )}
              {!isAvailable && (
                <button disabled className="w-full rounded-xl bg-gray-200 px-6 py-3 text-sm font-semibold text-gray-400 cursor-not-allowed">
                  Not available
                </button>
              )}

              <p className="text-center text-xs text-gray-400">You won't be charged yet</p>

              {/* Price breakdown */}
              {isRent && nights && (
                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Rp{formatPropertyAmount(monthlyPrice)} ÷ 30 × {nights} night{nights > 1 ? "s" : ""}</span>
                    <span>{displayPrice}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-100 pt-2">
                    <span>Total</span><span>{displayPrice}</span>
                  </div>
                </div>
              )}
              {isRent && !nights && (
                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Rp{formatPropertyAmount(monthlyPrice)} × 1 month</span>
                    <span>Rp{formatPropertyAmount(monthlyPrice)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-100 pt-2">
                    <span>Total</span><span>Rp{formatPropertyAmount(monthlyPrice)}</span>
                  </div>
                </div>
              )}
            </div>

            <button className="mt-4 w-full text-center text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600">
              Report this listing
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetail;
