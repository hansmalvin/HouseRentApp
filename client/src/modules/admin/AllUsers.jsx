import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Toast from "../common/Toast";
import { Popconfirm } from "antd";
import { useNavigate } from "react-router-dom";
import AdminTableToolbar from "../../components/AdminTableToolbar";
import { applySearchAndSort } from "../../utils/adminTableFilters";
import { Trash2 } from "lucide-react";

axios.defaults.withCredentials = true;

const AllUsers = () => {
  const [allUser, setAllUser] = useState([]);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
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

const handleDelete = async (userid) => {
    try {
      const res = await axios.delete(
        `http://localhost:8001/api/admin/deleteuser/${userid}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        showToast("success", res.data.message);
        setAllUser((prev) => prev.filter((u) => u._id !== userid));
      } else {
        showToast("error", res.data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to delete user");
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

  const displayedUsers = useMemo(
    () =>
      applySearchAndSort(allUser, {
        search,
        sortAsc,
        getSearchableText: (user) =>
          [user.name, user.email, user.type, user.granted, user._id]
            .filter(Boolean)
            .join(" "),
        getSortValue: (user) => user.name,
      }),
    [allUser, search, sortAsc]
  );

  return (
    <div className="min-w-0 w-full">
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <h2 className="mb-1 text-xl font-bold text-indigo-700">All users</h2>
      <p className="mb-4 text-sm text-slate-500">
        Review accounts and grant or revoke owner access.
      </p>

      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <div className="border-b border-indigo-50 px-4 py-4 sm:px-5">
          <AdminTableToolbar
            search={search}
            onSearchChange={setSearch}
            sortAsc={sortAsc}
            onSortToggle={() => setSortAsc((prev) => !prev)}
            placeholder="Search by name, email, type…"
          />
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-indigo-100/90 text-indigo-900">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3 text-center">Email</th>
              <th className="px-4 py-3 text-center">Type</th>
              <th className="px-4 py-3 text-center">Granted (owners only)</th>
              <th className="px-4 py-3 text-center">Actions</th>
              <th className="whitespace-nowrap px-4 py-3 text-center">User ID</th>
            </tr>
          </thead>
          <tbody>
            {displayedUsers.length > 0 ? (
              displayedUsers.map((user) => (
                <tr
                  key={user._id}
                  className="border-t border-indigo-50 transition duration-200 even:bg-indigo-50/30 hover:bg-sky-50/50"
                >
                  <td className="px-4 py-3 font-medium">{user.name}</td>
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
                      <Popconfirm
                        title="Delete this user?"
                        description="This will permanently remove the account and all their bookings."
                        onConfirm={() => handleDelete(user._id)}
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                        cancelText="Cancel"
                        placement="topRight"
                      >
                        <button
                          type="button"
                          className="flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                          title="Delete user"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </Popconfirm>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-xs text-slate-500">
                    {user._id}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  {allUser.length === 0 ? "No users found" : "No matching users"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default AllUsers;
