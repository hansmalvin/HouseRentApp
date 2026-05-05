import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../App";
import AllUsers from "./AllUsers";
import AllProperty from "./AllProperty";
import AllBookings from "./AllBookings";

const AdminHome = () => {
  const user = useContext(UserContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");

  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

if (!user || !user.userData) return null;

  return (
<div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex flex-col">
  {/* Navbar */}
  <nav className="fixed top-0 left-0 w-full z-50 bg-black/30 backdrop-blur-lg shadow-md py-4 px-8 flex justify-between items-center">
    <h2 className="text-3xl font-extrabold text-indigo-400 tracking-wide">RentEase</h2>
    <div className="flex items-center space-x-6">
      <span className="text-gray-200">Hi, {user.userData.name}</span>
      <button
        onClick={handleLogOut}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md"
      >
        Log Out
      </button>
    </div>
  </nav>

  {/* Admin Tabs */}
  <div className="max-w-6xl mx-auto w-full py-24 px-4"> 
    {/* Tabs */}
    <div className="flex space-x-4 mb-6 border-b border-gray-700">
      <button
        onClick={() => setActiveTab("users")}
        className={`pb-2 px-4 text-lg font-medium transition ${
          activeTab === "users"
            ? "border-b-2 border-indigo-400 text-indigo-400"
            : "text-gray-400 hover:text-indigo-300"
        }`}
      >
        All Users
      </button>
      <button
        onClick={() => setActiveTab("properties")}
        className={`pb-2 px-4 text-lg font-medium transition ${
          activeTab === "properties"
            ? "border-b-2 border-indigo-400 text-indigo-400"
            : "text-gray-400 hover:text-indigo-300"
        }`}
      >
        All Properties
      </button>
      <button
        onClick={() => setActiveTab("bookings")}
        className={`pb-2 px-4 text-lg font-medium transition ${
          activeTab === "bookings"
            ? "border-b-2 border-indigo-400 text-indigo-400"
            : "text-gray-400 hover:text-indigo-300"
        }`}
      >
        All Bookings
      </button>
    </div>

    {/* Tab Panels */}
    <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700 rounded-xl p-6 shadow-2xl text-gray-200">
      {activeTab === "users" && <AllUsers />}
      {activeTab === "properties" && <AllProperty />}
      {activeTab === "bookings" && <AllBookings />}
    </div>
  </div>
</div>

  );
};

export default AdminHome;
