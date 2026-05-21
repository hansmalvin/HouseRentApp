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
        showToast("error", response.data.message || "Unauthorized access");
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        showToast("error", "Session expired, please login again");
        navigate("/login");
      } else {
        showToast("error", "Failed to fetch users");
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
    <div>
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <h2 className="mb-1 text-xl font-bold text-indigo-700">All users</h2>
      <p className="mb-6 text-sm text-slate-500">
        Review accounts and grant or revoke owner access.
      </p>

      <div className="overflow-x-auto rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-indigo-100/90 text-indigo-900">
            <tr>
              <th className="px-4 py-3">User ID</th>
              <th className="px-4 py-3 text-center">Name</th>
              <th className="px-4 py-3 text-center">Email</th>
              <th className="px-4 py-3 text-center">Type</th>
              <th className="px-4 py-3 text-center">Granted (owners only)</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allUser.length > 0 ? (
              allUser.map((user) => (
                <tr
                  key={user._id}
                  className="border-t border-indigo-50 transition duration-200 even:bg-indigo-50/30 hover:bg-sky-50/50"
                >
                  <td className="px-4 py-3">{user._id}</td>
                  <td className="px-4 py-3 text-center">{user.name}</td>
                  <td className="px-4 py-3 text-center">{user.email}</td>
                  <td className="px-4 py-3 text-center font-medium text-indigo-700">
                    {user.type}
                  </td>
                  <td
                    className={`px-4 py-3 text-center font-semibold ${
                      user.granted === "granted"
                        ? "text-emerald-600"
                        : user.granted
                          ? "text-rose-600"
                          : "text-slate-400"
                    }`}
                  >
                    {user.granted || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      {user.type === "Owner" &&
                        user.granted === "ungranted" && (
                          <button
                            type="button"
                            onClick={() => handleStatus(user._id, "granted")}
                            className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                          >
                            Grant
                          </button>
                        )}
                      {user.type === "Owner" && user.granted === "granted" && (
                        <button
                          type="button"
                          onClick={() => handleStatus(user._id, "ungranted")}
                          className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                        >
                          Ungrant
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllUsers;
