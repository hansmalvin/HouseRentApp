import React, { useState } from "react";
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

const Home = () => {
  const [searchWhere, setSearchWhere] = useState("");

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
        <div className="relative h-[320px] overflow-hidden md:h-[380px]">
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
                <label className="flex flex-1 flex-col px-4 py-2">
                  <span className="text-xs font-semibold text-gray-900">Where</span>
                  <input
                    type="text"
                    placeholder="Search destinations"
                    value={searchWhere}
                    onChange={(e) => setSearchWhere(e.target.value)}
                    className="border-0 bg-transparent p-0 text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-0"
                  />
                </label>
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
                  onClick={() => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" })}
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
              Explore rentals near you
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
          <Link
            to="/login"
            className="text-sm font-medium text-gray-700 underline-offset-2 hover:underline"
          >
            Log in to book
          </Link>
        </div>
        <HomePropertySections searchQuery={searchWhere} />
      </main>
    </div>
  );
};

export default Home;
