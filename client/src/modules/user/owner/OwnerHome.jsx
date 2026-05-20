import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../App";
import RentEaseLogo from "../../../components/RentEaseLogo";
import OwnerProfileSidebar, {
  COLLAPSED_WIDTH,
  EXPANDED_WIDTH,
} from "../../../components/OwnerProfileSidebar";
import AddProperty from "./AddProperty";
import AllProperties from "./AllProperties";
import AllBookings from "./AllBookings";

const tabs = [
  {
    name: "Add My Property",
    description: "List a new property for rent or sale",
    component: <AddProperty />,
  },
  {
    name: "My Properties",
    description: "View and manage your listings",
    component: <AllProperties />,
  },
  {
    name: "All Related Bookings",
    description: "Booking requests for your properties",
    component: <AllBookings />,
  },
];

const OwnerHome = () => {
  const user = useContext(UserContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  if (!user || !user.userData) return null;

  const handleLogOut = () => {
    document.cookie =
      "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("user");
    navigate("/login");
  };

  const sidebarMargin = sidebarExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-blue-50 text-slate-800">
      <OwnerProfileSidebar
        onLogOut={handleLogOut}
        onExpandChange={setSidebarExpanded}
      />

      <div
        className="flex min-h-screen flex-col transition-[margin] duration-300 ease-in-out"
        style={{ marginLeft: sidebarMargin }}
      >
        <nav className="sticky top-0 z-30 border-b border-indigo-100/80 bg-white/75 shadow-sm backdrop-blur-md">
          <div className="flex items-center px-4 py-4 sm:px-6">
            <RentEaseLogo subtitle="Owner dashboard" variant="light" />
          </div>
        </nav>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <header className="mb-6 rounded-2xl border border-indigo-100 bg-white/60 px-5 py-4 shadow-sm backdrop-blur-sm">
            <h1 className="text-lg font-semibold text-slate-800 sm:text-xl">
              Manage your rentals
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Add listings, update your properties, and respond to tenant
              bookings — all in one place.
            </p>
          </header>

          <div
            className="flex flex-wrap gap-2 border-b border-indigo-100 pb-1 sm:gap-3"
            role="tablist"
            aria-label="Owner sections"
          >
            {tabs.map((tab, index) => (
              <button
                key={tab.name}
                type="button"
                role="tab"
                aria-selected={activeTab === index}
                onClick={() => setActiveTab(index)}
                className={`rounded-t-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 sm:px-5 ${
                  activeTab === index
                    ? "border border-b-0 border-indigo-200 bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:bg-indigo-50/80 hover:text-indigo-600"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          <div
            className="rounded-b-2xl rounded-tr-2xl border border-indigo-100 bg-white/90 p-5 shadow-lg backdrop-blur-sm sm:p-8"
            role="tabpanel"
          >
            <p className="mb-6 text-sm text-slate-500">
              {tabs[activeTab].description}
            </p>
            {tabs[activeTab].component}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OwnerHome;
