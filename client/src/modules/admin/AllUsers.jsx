import React, { useState, useEffect } from "react";
import axios from "axios";
import Toast from "../common/Toast";
import { useNavigate } from "react-router-dom";


axios.defaults.withCredentials = true;

const AllUsers = () => {
  const [allUser, setAllUser] = useState([]);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const navigate = useNavigate();

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  useEffect(() => {
    getAllUser();
  }, []);

  const getAllUser = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8001/api/admin/getallusers"
      );
      if (response.data.success) {
        setAllUser(response.data.data);
      } else {
         message.error(response.data.message || "Unauthorized access");
        navigate("/login"); 
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 401) {
        message.error("Session expired, please login again");
        navigate("/login");
      } else {
        message.error("Failed to fetch Users");
      }
    }
  };

  const handleStatus = async (userid, status) => {
    try {
      const res = await axios.post(
        "http://localhost:8001/api/admin/handlestatus",
        { userid, status }
      );

      if (res.data.success) {
        showToast("success", "Status updated successfully");
        getAllUser();
      } else {
        showToast("error", res.data.message);
      }
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to update status");
    }
  };

  return (
   <div className="overflow-x-auto relative mt-6">
  {toast.show && (
    <Toast
      type={toast.type}
      message={toast.message}
      onClose={() => setToast({ ...toast, show: false })}
    />
  )}

  <table className="min-w-full border border-gray-700 bg-gray-900/80 backdrop-blur-md shadow-2xl rounded-xl overflow-hidden">
    <thead className="bg-indigo-600/80 text-white">
      <tr>
        <th className="py-3 px-4 text-left">User ID</th>
        <th className="py-3 px-4 text-center">Name</th>
        <th className="py-3 px-4 text-center">Email</th>
        <th className="py-3 px-4 text-center">Type</th>
        <th className="py-3 px-4 text-center">Granted (Owners Only)</th>
        <th className="py-3 px-4 text-center">Actions</th>
      </tr>
    </thead>
    <tbody>
      {allUser.length > 0 ? (
        allUser.map((user, index) => (
          <tr
            key={user._id}
            className={`transition duration-200 ${
              index % 2 === 0 ? "bg-gray-800/60" : "bg-gray-900/60"
            } hover:bg-indigo-500/20`}
          >
            <td className="py-2 px-4 border-b border-gray-700 text-gray-200">
              {user._id}
            </td>
            <td className="py-2 px-4 border-b border-gray-700 text-center text-gray-200">
              {user.name}
            </td>
            <td className="py-2 px-4 border-b border-gray-700 text-center text-gray-300">
              {user.email}
            </td>
            <td className="py-2 px-4 border-b border-gray-700 text-center text-indigo-400 font-medium">
              {user.type}
            </td>
            <td
              className={`py-2 px-4 border-b border-gray-700 text-center font-medium ${
                user.granted === "granted" ? "text-green-400" : "text-red-400"
              }`}
            >
              {user.granted}
            </td>
            <td className="py-2 px-4 border-b border-gray-700 text-center">
              {user.type === "Owner" && user.granted === "ungranted" && (
                <button
                  onClick={() => handleStatus(user._id, "granted")}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow"
                >
                  Grant
                </button>
              )}
              {user.type === "Owner" && user.granted === "granted" && (
                <button
                  onClick={() => handleStatus(user._id, "ungranted")}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow"
                >
                  Ungrant
                </button>
              )}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td
            colSpan="6"
            className="text-center py-6 text-gray-400 font-medium italic"
          >
            No users found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
  );
};

export default AllUsers;
