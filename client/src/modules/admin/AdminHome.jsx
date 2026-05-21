import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../App";
import AllUsers from "./AllUsers";
import AllProperty from "./AllProperty";
import AllBookings from "./AllBookings";
import RentEaseLogo from "../../components/RentEaseLogo";

const tabs = [
  {
    id: "users",
    name: "All Users",
    description: "View accounts, roles, and approve owner registrations.",
  },
  {
    id: "properties",
    name: "All Properties",
    description: "Browse every listing on the platform.",
  },
  {
    id: "bookings",
    name: "All Bookings",
    description: "Monitor booking requests across renters and owners.",
  },
];

const AdminHome = () => {
  const user = useContext(UserContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");

  const handleLogOut = () => {
    document.cookie =
      "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user || !user.userData) return null;

  const activeTabMeta = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-blue-50 text-slate-800">
      <nav className="sticky top-0 z-30 border-b border-indigo-100/80 bg-white/75 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <RentEaseLogo subtitle="Admin dashboard" variant="light" />
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="hidden text-sm font-medium text-slate-600 sm:inline">
              Hi, {user.userData.name}
            </span>
            <button
              type="button"
              onClick={handleLogOut}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-2"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <header className="mb-6 rounded-2xl border border-indigo-100 bg-white/60 px-5 py-4 shadow-sm backdrop-blur-sm">
          <h1 className="text-lg font-semibold text-slate-800 sm:text-xl">
            Platform administration
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage users, listings, and bookings across RentEase.
          </p>
        </header>

        <div
          className="flex flex-wrap gap-2 border-b border-indigo-100 pb-1 sm:gap-3"
          role="tablist"
          aria-label="Admin sections"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-t-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 sm:px-5 ${
                activeTab === tab.id
                  ? "border border-b-0 border-indigo-200 bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:bg-indigo-50/80 hover:text-indigo-600"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div
          className="min-w-0 overflow-hidden rounded-b-2xl rounded-tr-2xl border border-indigo-100 bg-white/90 p-5 shadow-lg backdrop-blur-sm sm:p-8"
          role="tabpanel"
        >
          <p className="mb-6 text-sm text-slate-500">
            {activeTabMeta.description}
          </p>
          {activeTab === "users" && <AllUsers />}
          {activeTab === "properties" && <AllProperty />}
          {activeTab === "bookings" && <AllBookings />}
        </div>
      </main>
    </div>
  );
};

export default AdminHome;
