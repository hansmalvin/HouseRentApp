import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../../App";
import AddProperty from "./AddProperty";
import AllProperties from "./AllProperties";
import AllBookings from "./AllBookings";

const tabs = [
  { name: "Add Property", component: <AddProperty /> },
  { name: "All Properties", component: <AllProperties /> },
  { name: "All Bookings", component: <AllBookings /> },
];

const OwnerHome = () => {
  const user = useContext(UserContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  if (!user || !user.userData) return null;

  const handleLogOut = () => {
    document.cookie =
      "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-black/30 backdrop-blur-lg shadow-md border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <h2 className="text-3xl font-extrabold text-indigo-400 tracking-wide">RentEase</h2>
          <div className="flex items-center gap-6">
            <h5 className="font-medium text-gray-300">
              Hi {user.userData.name}
            </h5>
            <button
              onClick={handleLogOut}
              className="px-4 py-2 text-sm bg-red-500/80 text-white rounded-lg shadow hover:bg-red-600 transition duration-200"
            >
              Log Out
            </button>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex space-x-4 border-b border-gray-700">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 font-medium text-sm transition-all duration-200 rounded-t-lg
            ${activeTab === index
                  ? "text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/10 shadow-inner"
                  : "text-gray-400 hover:text-indigo-300 hover:bg-gray-800/40"
                }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-900/80 border border-gray-700 backdrop-blur-md mt-6 p-6 shadow-2xl rounded-xl transition-all">
          {tabs[activeTab].component}
        </div>
      </div>
    </div>

  );
};

export default OwnerHome;
