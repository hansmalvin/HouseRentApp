import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../App";
import { AnimatedBackground } from "animated-backgrounds";
import {
  MagnifyingGlassIcon,
  GlobeAltIcon,
  Bars3Icon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { ChevronLeft, ChevronRight } from "lucide-react";
import RentEaseLogo from "../../components/RentEaseLogo";
import HomePropertySections from "../../components/HomePropertySections";
import { parsePropertyAddress } from "../../utils/propertyAddress";
import axios from "axios";

// ─── Reverse-geocode lat/lng → city name (via backend proxy) ─────────────────
async function reverseGeocode(lat, lng) {
  try {
    const res = await axios.get("http://localhost:8001/api/user/reversegeocode", {
      params: { lat, lng },
      withCredentials: true,
    });
    return res.data?.success ? res.data.city || null : null;
  } catch {
    return null;
  }
}

function getTopCities(properties, limit = 4) {
  const counts = new Map();
  for (const p of properties) {
    const { city, district } = parsePropertyAddress(p.propertyAddress ?? "");
    const label = city || district;
    if (!label) continue;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "id"))
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
function startOfDay(d) {
  const c = new Date(d); c.setHours(0, 0, 0, 0); return c;
}
function isSameDay(a, b) {
  return a && b && startOfDay(a).getTime() === startOfDay(b).getTime();
}
function isBetween(d, a, b) {
  if (!a || !b) return false;
  const t = startOfDay(d).getTime();
  return t > startOfDay(a).getTime() && t < startOfDay(b).getTime();
}
function diffDays(a, b) {
  if (!a || !b) return 0;
  return Math.max(1, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}
function formatDateShort(date) {
  if (!date) return null;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function formatDateLabel(checkIn, checkOut) {
  if (!checkIn && !checkOut) return null;
  if (checkIn && !checkOut) return formatDateShort(checkIn);
  return `${formatDateShort(checkIn)} – ${formatDateShort(checkOut)}`;
}

// ─── Calendar constants ───────────────────────────────────────────────────────
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ─── Month Grid ───────────────────────────────────────────────────────────────
const MonthGrid = ({ year, month, checkIn, checkOut, hoveredDate, onDayClick, onDayHover, today }) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div className="flex-1 min-w-[260px]">
      <p className="mb-3 text-center text-sm font-semibold text-gray-900">
        {MONTHS[month]} {year}
      </p>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const isPast = startOfDay(date) < startOfDay(today);
          const isStart = isSameDay(date, checkIn);
          const isEnd = isSameDay(date, checkOut);
          const inRange = isBetween(date, checkIn, checkOut || hoveredDate);
          const isHoverEnd = !checkOut && isSameDay(date, hoveredDate);
          const isToday = isSameDay(date, today);

          let cls = "relative flex items-center justify-center h-8 text-sm select-none transition-colors ";
          if (isPast) {
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
            (isEnd && checkIn)    ? "after:absolute after:inset-y-0 after:left-0 after:right-1/2 after:bg-indigo-100 after:-z-10 " : "";

          return (
            <div
              key={date.toISOString()}
              className={cls + rangeBar}
              onClick={() => !isPast && onDayClick(date)}
              onMouseEnter={() => !isPast && onDayHover(date)}
              onMouseLeave={() => onDayHover(null)}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Date Picker Dropdown ─────────────────────────────────────────────────────
const DatePickerDropdown = ({ checkIn, checkOut, onChange }) => {
  const today = startOfDay(new Date());
  const [offset, setOffset] = useState(0);
  const [hoveredDate, setHoveredDate] = useState(null);

  const months = [0, 1].map((i) => {
    const d = new Date(today.getFullYear(), today.getMonth() + offset + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const handleDayClick = (date) => {
    if (!checkIn || (checkIn && checkOut)) {
      onChange(date, null);
    } else {
      if (startOfDay(date) <= startOfDay(checkIn)) {
        onChange(date, null);
      } else {
        onChange(checkIn, date);
      }
    }
  };

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)] z-[200] w-[600px] max-w-[95vw] rounded-2xl border border-gray-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.14)] p-5"
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Dates / Flexible toggle */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-0.5">
          <button type="button" className="rounded-full px-5 py-1.5 text-sm font-semibold bg-white shadow-sm text-gray-900">
            Dates
          </button>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setOffset((o) => o - 1)}
          disabled={offset === 0}
          className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="h-4 w-4 text-gray-700" />
        </button>
        <button
          type="button"
          onClick={() => setOffset((o) => o + 1)}
          className="p-1.5 rounded-full hover:bg-gray-100 transition"
        >
          <ChevronRight className="h-4 w-4 text-gray-700" />
        </button>
      </div>

      {/* Two month grids */}
      <div className="flex gap-6">
        {months.map(({ year, month }) => (
          <MonthGrid
            key={`${year}-${month}`}
            year={year}
            month={month}
            checkIn={checkIn}
            checkOut={checkOut}
            hoveredDate={hoveredDate}
            onDayClick={handleDayClick}
            onDayHover={setHoveredDate}
            today={today}
          />
        ))}
      </div>

      {(checkIn || checkOut) && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => onChange(null, null)}
            className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600"
          >
            Clear dates
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Icon helpers ─────────────────────────────────────────────────────────────
const NearbyIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
    <rect width="40" height="40" rx="8" fill="#EEF2FF" />
    <path d="M20 10 L28 28 L20 24 L12 28 Z" fill="#6366F1" stroke="#6366F1" strokeWidth="1" strokeLinejoin="round" />
  </svg>
);

const CityIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
    <rect width="40" height="40" rx="8" fill="#F3F4F6" />
    <rect x="8" y="22" width="6" height="11" rx="1" fill="#9CA3AF" />
    <rect x="17" y="16" width="6" height="17" rx="1" fill="#6B7280" />
    <rect x="26" y="19" width="6" height="14" rx="1" fill="#9CA3AF" />
    <rect x="10" y="25" width="2" height="2" rx="0.5" fill="white" />
    <rect x="19" y="19" width="2" height="2" rx="0.5" fill="white" />
    <rect x="19" y="24" width="2" height="2" rx="0.5" fill="white" />
    <rect x="28" y="22" width="2" height="2" rx="0.5" fill="white" />
  </svg>
);

const Spinner = () => (
  <svg className="h-4 w-4 animate-spin text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

// ─── Where Dropdown ───────────────────────────────────────────────────────────
const WhereDropdown = ({ properties, onSelect }) => {
  const [nearbyState, setNearbyState] = useState("idle");
  const topCities = getTopCities(properties, 4);

  const handleNearby = useCallback(async () => {
    if (!navigator.geolocation) { setNearbyState("error"); return; }
    setNearbyState("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const city = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setNearbyState("done");
        onSelect(city || "");
      },
      () => setNearbyState("error"),
      { timeout: 8000 }
    );
  }, [onSelect]);

  return (
    <div
      className="absolute left-0 top-[calc(100%+8px)] z-[200] w-full min-w-[320px] max-w-[480px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="px-5 pt-5 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Suggested destinations</p>
      </div>
      <button
        type="button"
        onClick={handleNearby}
        disabled={nearbyState === "loading"}
        className="flex w-full items-center gap-4 px-5 py-3 text-left transition hover:bg-gray-50 disabled:cursor-wait"
      >
        <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden"><NearbyIcon /></div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Nearby</p>
          <p className="text-xs text-gray-500 truncate">
            {nearbyState === "loading" ? "Getting your location…"
              : nearbyState === "error" ? "Location access denied — please enable it"
              : "Find what's around you"}
          </p>
        </div>
        {nearbyState === "loading" && <Spinner />}
        {nearbyState === "error" && <span className="text-xs text-red-400">✕</span>}
      </button>

      {topCities.length > 0 && <div className="mx-5 my-1 border-t border-gray-100" />}

      {topCities.map(({ label, count }) => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(label)}
          className="flex w-full items-center gap-4 px-5 py-3 text-left transition hover:bg-gray-50"
        >
          <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden"><CityIcon /></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{label}</p>
            <p className="text-xs text-gray-500">{count} propert{count === 1 ? "y" : "ies"} available</p>
          </div>
        </button>
      ))}
      <div className="h-3" />
    </div>
  );
};

// ─── Main Home Component ──────────────────────────────────────────────────────
const Home = () => {
  const { userData } = useContext(UserContext);
  const navigate = useNavigate();

  const isRenter = userData?.type === "Renter";
  const renterName = userData?.name?.split(" ")[0] ?? "";

  const [searchWhere, setSearchWhere] = useState("");
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [whereOpen, setWhereOpen] = useState(false);
  const [whenOpen, setWhenOpen] = useState(false);
  const [allProperties, setAllProperties] = useState([]);

  const whereRef = useRef(null);
  const whenRef = useRef(null);
  const whoRef = useRef(null);
  const [whoOpen, setWhoOpen] = useState(false);
  const [guestCount, setGuestCount] = useState(0); // 0 = any

  useEffect(() => {
    axios
      .get("http://localhost:8001/api/user/getAllProperties", { withCredentials: true })
      .then((res) => setAllProperties(res.data.data ?? []))
      .catch(() => setAllProperties([]));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (whereRef.current && !whereRef.current.contains(e.target)) setWhereOpen(false);
      if (whenRef.current && !whenRef.current.contains(e.target)) setWhenOpen(false);
      if (whoRef.current && !whoRef.current.contains(e.target)) setWhoOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleWhereSelect = useCallback((city) => {
    setSearchWhere(city);
    setWhereOpen(false);
    setWhenOpen(true);
  }, []);

  const handleDateChange = useCallback((newCheckIn, newCheckOut) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
    if (newCheckIn && newCheckOut) setTimeout(() => setWhenOpen(false), 200);
  }, []);

  const handleSearch = () => {
    setWhereOpen(false);
    setWhenOpen(false);
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
  };

  const clearAll = () => { setSearchWhere(""); setCheckIn(null); setCheckOut(null); setGuestCount(0); };

  const dateFilter = checkIn && checkOut ? { checkIn, checkOut } : null;
  const guestFilter = guestCount > 0 ? guestCount : null;
  const whenLabel = formatDateLabel(checkIn, checkOut);
  const nights = checkIn && checkOut ? diffDays(checkIn, checkOut) : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <nav className="mx-auto flex max-w-[1760px] items-center justify-between gap-4 px-6 py-4 md:px-10">
          <RentEaseLogo to="/" variant="light" size="md" />
          <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
            <button type="button" className="border-b-2 border-gray-900 pb-3 pt-1 text-sm font-semibold text-gray-900">Homes</button>
            <button type="button" className="pb-3 pt-1 text-sm font-medium text-gray-500 hover:text-gray-800">
              Experiences
              <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gray-700">Not Yet</span>
            </button>
            <button type="button" className="pb-3 pt-1 text-sm font-medium text-gray-500 hover:text-gray-800">
              Services
              <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gray-700">Not Yet</span>
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Link to="/register" className="hidden rounded-full px-3 py-2 hover:bg-gray-100 sm:inline-block">Become a host</Link>
            <div
              className="flex items-center gap-2 rounded-full border border-gray-300 py-1 pl-3 pr-1 shadow-sm hover:shadow-md cursor-pointer"
              onClick={() => navigate(isRenter ? "/renterhome" : "/login")}
              title={isRenter ? `${userData.name} — Go to dashboard` : "Log in"}
            >
              <Bars3Icon className="h-4 w-4" />
              <div className="rounded-full p-0.5 relative" aria-label="Account menu">
                <UserCircleIcon className={`h-8 w-8 ${isRenter ? "text-indigo-500" : "text-gray-500"}`} />
                {isRenter && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-white" />
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero + search */}
      <div className="relative border-b border-gray-100">
        <div className="relative h-[320px] overflow-visible md:h-[380px]">
          <AnimatedBackground
            animationName="particleNetwork" theme="landing" interactive adaptivePerformance fps={30}
            interactionConfig={{ effect: "attract", strength: 0.6, radius: 120, continuous: true }}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/50 to-white z-10 pointer-events-none" />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-end px-4 pb-8 md:pb-10">
            <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900 md:text-3xl">Find your next rental</h1>

            <div className="w-full max-w-[850px] rounded-full border border-gray-200 bg-white p-2 shadow-[0_6px_20px_rgba(0,0,0,0.12)]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:divide-x sm:divide-gray-200">

                {/* WHERE */}
                <div className="relative flex-1" ref={whereRef}>
                  <label className="flex flex-col px-4 py-2 cursor-text">
                    <span className="text-xs font-semibold text-gray-900">Where</span>
                    <input
                      type="text"
                      placeholder="Search destinations"
                      value={searchWhere}
                      onChange={(e) => setSearchWhere(e.target.value)}
                      onFocus={() => { setWhereOpen(true); setWhenOpen(false); }}
                      className="border-0 bg-transparent p-0 text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-0"
                    />
                  </label>
                  {whereOpen && <WhereDropdown properties={allProperties} onSelect={handleWhereSelect} />}
                </div>

                {/* WHEN */}
                <div className="relative flex-1" ref={whenRef}>
                  <button
                    type="button"
                    onClick={() => { setWhenOpen((o) => !o); setWhereOpen(false); }}
                    className="flex w-full flex-col px-4 py-2 text-left"
                  >
                    <span className="text-xs font-semibold text-gray-900">When</span>
                    <span className={`text-sm ${whenLabel ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                      {whenLabel || "Add dates"}
                    </span>
                  </button>
                  {whenOpen && (
                    <DatePickerDropdown checkIn={checkIn} checkOut={checkOut} onChange={handleDateChange} />
                  )}
                </div>

                {/* WHO */}
                <div className="relative hidden flex-1 sm:block" ref={whoRef}>
                  <button
                    type="button"
                    onClick={() => { setWhoOpen((o) => !o); setWhereOpen(false); setWhenOpen(false); }}
                    className="flex w-full flex-col px-4 py-2 text-left"
                  >
                    <span className="text-xs font-semibold text-gray-900">Who</span>
                    <span className={`text-sm ${guestCount > 0 ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                      {guestCount > 0 ? `${guestCount} guest${guestCount > 1 ? "s" : ""}` : "Add guests"}
                    </span>
                  </button>
                  {whoOpen && (
                    <div
                      className="absolute right-0 top-[calc(100%+8px)] z-[200] w-56 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Guests</p>
                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setGuestCount((n) => Math.max(0, n - 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:border-gray-900 transition text-lg font-light"
                        >−</button>
                        <span className="min-w-[3ch] text-center text-sm font-semibold text-gray-900">
                          {guestCount === 0 ? "Any" : guestCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setGuestCount((n) => Math.min(20, n + 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:border-gray-900 transition text-lg font-light"
                        >+</button>
                      </div>
                      {guestCount > 0 && (
                        <button
                          type="button"
                          onClick={() => { setGuestCount(0); setWhoOpen(false); }}
                          className="mt-3 w-full text-center text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600"
                        >Clear</button>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSearch}
                  className="mx-1 flex items-center justify-center gap-2 rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 sm:py-3.5"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 sm:hidden" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <main id="listings" className="mx-auto max-w-[1760px] px-6 py-10 md:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {searchWhere
                ? nights ? `Rent listings in ${searchWhere} · ${nights} night${nights > 1 ? "s" : ""}` : `Rentals in ${searchWhere}`
                : nights ? `Rent listings · ${nights} night${nights > 1 ? "s" : ""}` : "Explore rentals near you"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {dateFilter
                ? "Showing rent listings only — sale properties are hidden when dates are selected."
                : <>Looking to post your property?{" "}
                    <Link to="/register" className="font-medium text-indigo-600 underline-offset-2 hover:underline">Register as Owner</Link>
                  </>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {(searchWhere || checkIn || guestCount > 0) && (
              <button type="button" onClick={clearAll} className="text-sm font-medium text-gray-500 underline-offset-2 hover:underline">
                Clear filters
              </button>
            )}
            {isRenter ? (
              <button
                type="button"
                onClick={() => navigate("/renterhome")}
                className="text-sm font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                {renterName}, see your booked places →
              </button>
            ) : (
              <Link to="/login" className="text-sm font-medium text-gray-700 underline-offset-2 hover:underline">
                Log in to book
              </Link>
            )}
          </div>
        </div>
        <HomePropertySections
          searchQuery={searchWhere}
          dateFilter={dateFilter}
          guestFilter={guestFilter}
        />
      </main>
    </div>
  );
};

export default Home;
