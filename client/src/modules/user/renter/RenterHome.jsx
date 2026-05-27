import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../../App";
import { LogOut, ArrowLeft } from "lucide-react";
import RentEaseLogo from "../../../components/RentEaseLogo";
import RenterAllProperty from "./AllProperties";

const RenterHome = () => {
  const user = useContext(UserContext);
  const navigate = useNavigate();

  if (!user || !user.userData) return null;

  const firstName = user.userData.name?.split(" ")[0] ?? "there";

  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-4">
          <RentEaseLogo to="/" variant="light" size="md" />
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Browse listings
            </Link>
            <div className="h-5 w-px bg-gray-200" />
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">
              {user.userData.name}
            </span>
            <button
              type="button"
              onClick={handleLogOut}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="mx-auto max-w-[1200px] px-6 py-10">
        {/* Welcome banner */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's a summary of all your booking history.
          </p>
        </div>

        {/* Booking history */}
        <RenterAllProperty />
      </main>
    </div>
  );
};

export default RenterHome;
