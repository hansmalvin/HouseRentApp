import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { AnimatedBackground } from "animated-backgrounds";
import {
  MagnifyingGlassIcon,
  GlobeAltIcon,
  Bars3Icon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import RentEaseLogo from "../../components/RentEaseLogo";
import HomePropertySections from "../../components/HomePropertySections";
import { parsePropertyAddress } from "../../utils/propertyAddress";
import axios from "axios";

// Reverse-geocode lat/lng  city name 
// Uses the free Nominatim API (no key required).
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=id`,
      { headers: { "User-Agent": "RentrApp/1.0" } }
    );
    const data = await res.json();
    const addr = data.address ?? {};
    // Indonesian address hierarchy: city > town > county > state
    return (
      addr.city ||
      addr.town ||
      addr.county ||
      addr.state_district ||
      addr.state ||
      null
    );
  } catch {
    return null;
  }
}

// ─── Derive top-N cities from property list ───────────────────────────────────
function getTopCities(properties, limit = 4) {
  const counts = new Map();

  for (const p of properties) {
    const { city, district } = parsePropertyAddress(p.propertyAddress ?? "");
    // We prefer `city`, fall back to `district`
    const label = city || district;
    if (!label) continue;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "id"))
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

// ─── City icon (building silhouette, SVG) ────────────────────────────────────
const CityIcon = () => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-full w-full"
  >
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

// ─── Nearby icon ─────────────────────────────────────────────────────────────
const NearbyIcon = () => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-full w-full"
  >
    <rect width="40" height="40" rx="8" fill="#EEF2FF" />
    <path
      d="M20 10 L28 28 L20 24 L12 28 Z"
      fill="#6366F1"
      stroke="#6366F1"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Loading spinner ──────────────────────────────────────────────────────────
const Spinner = () => (
  <svg
    className="h-4 w-4 animate-spin text-indigo-500"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v8H4z"
    />
  </svg>
);

// ─── Where Dropdown ───────────────────────────────────────────────────────────
const WhereDropdown = ({ properties, onSelect }) => {
  const [nearbyState, setNearbyState] = useState("idle"); // idle | loading | done | error
  const topCities = getTopCities(properties, 4);

  const handleNearby = useCallback(async () => {
    if (!navigator.geolocation) {
      setNearbyState("error");
      return;
    }
    setNearbyState("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const city = await reverseGeocode(
          pos.coords.latitude,
          pos.coords.longitude
        );
        setNearbyState("done");
        if (city) {
          onSelect(city);
        } else {
          // Couldn't resolve — still close dropdown gracefully
          onSelect("");
        }
      },
      () => {
        setNearbyState("error");
      },
      { timeout: 8000 }
    );
  }, [onSelect]);

  return (
    <div
      className="absolute left-0 top-[calc(100%+8px)] z-200 w-full min-w-[320px] max-w-[480px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
      onMouseDown={(e) => e.preventDefault()} // prevent input blur before click fires
    >
      <div className="px-5 pt-5 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Suggested destinations
        </p>
      </div>

      {/* Nearby */}
      <button
        type="button"
        onClick={handleNearby}
        disabled={nearbyState === "loading"}
        className="flex w-full items-center gap-4 px-5 py-3 text-left transition hover:bg-gray-50 disabled:cursor-wait"
      >
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
          <NearbyIcon />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Nearby</p>
          <p className="text-xs text-gray-500 truncate">
            {nearbyState === "loading"
              ? "Getting your location…"
              : nearbyState === "error"
              ? "Location access denied — please enable it"
              : "Find what's around you"}
          </p>
        </div>
        {nearbyState === "loading" && <Spinner />}
        {nearbyState === "error" && (
          <span className="text-xs text-red-400">✕</span>
        )}
      </button>

      {/* Divider */}
      {topCities.length > 0 && (
        <div className="mx-5 my-1 border-t border-gray-100" />
      )}

      {/* Top cities */}
      {topCities.map(({ label, count }) => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(label)}
          className="flex w-full items-center gap-4 px-5 py-3 text-left transition hover:bg-gray-50"
        >
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
            <CityIcon />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{label}</p>
            <p className="text-xs text-gray-500 truncate">
              {count} propert{count === 1 ? "y" : "ies"} available
            </p>
          </div>
        </button>
      ))}

      <div className="h-3" />
    </div>
  );
};

// ─── Main Home Component ──────────────────────────────────────────────────────
const Home = () => {
  const [searchWhere, setSearchWhere] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [allProperties, setAllProperties] = useState([]);

  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  // Fetch all properties once (for dropdown city counts)
  useEffect(() => {
    axios
      .get("http://localhost:8001/api/user/getAllProperties", {
        withCredentials: true,
      })
      .then((res) => setAllProperties(res.data.data ?? []))
      .catch(() => setAllProperties([]));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback((city) => {
    setSearchWhere(city);
    setDropdownOpen(false);
    // Scroll to listings
    setTimeout(
      () => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <nav className="mx-auto flex max-w-[1760px] items-center justify-between gap-4 px-6 py-4 md:px-10">
          <RentEaseLogo to="/" variant="light" size="md" />
          <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
            <button
              type="button"
              className="border-b-2 border-gray-900 pb-3 pt-1 text-sm font-semibold text-gray-900"
            >
              Homes
            </button>
            <button
              type="button"
              className="pb-3 pt-1 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              Experiences
              <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gray-700">
                Not Yet
              </span>
            </button>
            <button
              type="button"
              className="pb-3 pt-1 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              Services
              <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gray-700">
                Not Yet
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Link
              to="/register"
              className="hidden rounded-full px-3 py-2 hover:bg-gray-100 sm:inline-block"
            >
              Become a host
            </Link>
            <button
              type="button"
              className="hidden rounded-full p-2 hover:bg-gray-100 sm:inline-flex"
              aria-label="Language"
            >
              <GlobeAltIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 rounded-full border border-gray-300 py-1 pl-3 pr-1 shadow-sm hover:shadow-md">
              <Bars3Icon className="h-4 w-4" />
              <Link to="/login" className="rounded-full p-0.5" aria-label="Account menu">
                <UserCircleIcon className="h-8 w-8 text-gray-500" />
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero + search */}
      <div className="relative border-b border-gray-100">
        <div className="relative h-[320px] overflow-visible md:h-[380px]">
          <AnimatedBackground
            animationName="particleNetwork"
            theme="landing"
            interactive
            adaptivePerformance
            fps={30}
            interactionConfig={{
              effect: "attract",
              strength: 0.6,
              radius: 120,
              continuous: true,
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 0,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/50 to-white z-10 pointer-events-none" />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-end px-4 pb-8 md:pb-10">
            <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900 md:text-3xl">
              Find your next rental
            </h1>

            <div className="w-full max-w-[850px] rounded-full border border-gray-200 bg-white p-2 shadow-[0_6px_20px_rgba(0,0,0,0.12)]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:divide-x sm:divide-gray-200">

                {/* WHERE — with dropdown */}
                <div className="relative flex-1" ref={wrapperRef}>
                  <label className="flex flex-1 flex-col px-4 py-2 cursor-text">
                    <span className="text-xs font-semibold text-gray-900">Where</span>
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search destinations"
                      value={searchWhere}
                      onChange={(e) => setSearchWhere(e.target.value)}
                      onFocus={() => setDropdownOpen(true)}
                      className="border-0 bg-transparent p-0 text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-0"
                    />
                  </label>

                  {dropdownOpen && (
                    <WhereDropdown
                      properties={allProperties}
                      onSelect={handleSelect}
                    />
                  )}
                </div>

                <div className="hidden flex-1 flex-col px-4 py-2 sm:flex">
                  <span className="text-xs font-semibold text-gray-900">When</span>
                  <span className="text-sm text-gray-400">Add dates</span>
                </div>
                <div className="hidden flex-1 flex-col px-4 py-2 sm:flex">
                  <span className="text-xs font-semibold text-gray-900">Who</span>
                  <span className="text-sm text-gray-400">Add guests</span>
                </div>

                <button
                  type="button"
                  className="mx-1 flex items-center justify-center gap-2 rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 sm:py-3.5"
                  onClick={() => {
                    setDropdownOpen(false);
                    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
                  }}
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
                ? `Rentals in ${searchWhere}`
                : "Explore rentals near you"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Looking to post your property?{" "}
              <Link
                to="/register"
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                Register as Owner
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-3">
            {searchWhere && (
              <button
                type="button"
                onClick={() => setSearchWhere("")}
                className="text-sm font-medium text-gray-500 underline-offset-2 hover:underline"
              >
                Clear filter
              </button>
            )}
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 underline-offset-2 hover:underline"
            >
              Log in to book
            </Link>
          </div>
        </div>
        <HomePropertySections searchQuery={searchWhere} />
      </main>
    </div>
  );
};

export default Home;
