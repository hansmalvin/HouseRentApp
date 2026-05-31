import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Popconfirm } from "antd";
import { useNavigate } from "react-router-dom";
import Toast from "../common/Toast";
import { Trash2 } from "lucide-react";
import { formatPropertyAmount } from "../../utils/propertyFormat";
import { formatOwnerContactDisplay } from "../../utils/phoneContact";
import AdminTableToolbar from "../../components/AdminTableToolbar";
import { applySearchAndSort } from "../../utils/adminTableFilters";

axios.defaults.withCredentials = true;

const resolveOwnerName = (property, ownerNameById) => {
  if (property.ownerName?.trim()) return property.ownerName.trim();
  const id = property.ownerId?.toString?.() ?? property.ownerId;
  if (id && ownerNameById[id]) return ownerNameById[id];
  return "—";
};

const AdminAllProperty = () => {
  const [allProperties, setAllProperties] = useState([]);
  const [ownerNameById, setOwnerNameById] = useState({});
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const navigate = useNavigate();

  const showToast = (type, message) => setToast({ show: true, type, message });

  const getAllProperty = async () => {
    try {
      const [propertiesRes, usersRes] = await Promise.all([
        axios.get("http://localhost:8001/api/admin/getallproperties", {
          withCredentials: true,
        }),
        axios.get("http://localhost:8001/api/admin/getallusers", {
          withCredentials: true,
        }),
      ]);

    if (propertiesRes.data.success) {
        setAllProperties(propertiesRes.data.data);
      } else {
        showToast("error", propertiesRes.data.message || "Unauthorized access");
        navigate("/login");
        return;
      }

      if (usersRes.data.success) {
        const map = {};
        for (const user of usersRes.data.data) {
          if (user.type === "Owner" && user._id) {
            map[user._id.toString()] = user.name ?? "";
          }
        }
        setOwnerNameById(map);
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        showToast("error", "Session expired, please login again");
        navigate("/login");
      } else {
        showToast("error", "Failed to fetch properties");
      }
    }
  };

const handleDelete = async (propertyid) => {
    try {
      const res = await axios.delete(
        `http://localhost:8001/api/admin/deleteproperty/${propertyid}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        showToast("success", res.data.message);
        setAllProperties((prev) => prev.filter((p) => p._id !== propertyid));
      } else {
        showToast("error", res.data.message || "Failed to delete property");
      }
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to delete property");
    }
  };

  useEffect(() => {
    getAllProperty();
  }, []);

  const displayedProperties = useMemo(() => {
    const enriched = allProperties.map((property) => ({
      ...property,
      displayOwnerName: resolveOwnerName(property, ownerNameById),
    }));

    return applySearchAndSort(enriched, {
      search,
      sortAsc,
      getSearchableText: (property) =>
        [
          property.propertyType,
          property.propertyAdType,
          property.propertyAddress,
          property.displayOwnerName,
          formatOwnerContactDisplay(property.ownerContact),
          property.propertyAmt,
          property._id,
          property.ownerId,
        ]
          .filter(Boolean)
          .join(" "),
      getSortValue: (property) => property.displayOwnerName,
    });
  }, [allProperties, ownerNameById, search, sortAsc]);

  return (
    <div className="min-w-0 w-full">
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      <h2 className="mb-1 text-lg font-bold text-indigo-700 sm:text-xl">All properties</h2>
      <p className="mb-4 text-xs text-slate-500 sm:text-sm">
        Every listing published on the platform, across all owners.
      </p>

      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <div className="border-b border-indigo-50 px-3 py-3 sm:px-5 sm:py-4">
          <AdminTableToolbar
            search={search}
            onSearchChange={setSearch}
            sortAsc={sortAsc}
            onSortToggle={() => setSortAsc((prev) => !prev)}
            placeholder="Search properties, owner, address…"
            sortLabelAsc="Owner A → Z"
            sortLabelDesc="Owner Z → A"
          />
        </div>
        <div className="overflow-x-auto">
        <table className="w-max min-w-full text-left text-sm text-slate-700">
          <thead className="bg-indigo-100/90 text-indigo-900">
            <tr>
              <th className="px-3 py-2.5 text-center sm:px-4 sm:py-3">Property type</th>
              <th className="px-3 py-2.5 text-center sm:px-4 sm:py-3">Ad type</th>
              <th className="px-3 py-2.5 text-center sm:px-4 sm:py-3">Address</th>
              <th className="px-3 py-2.5 text-center sm:px-4 sm:py-3">Owner name</th>
              <th className="px-3 py-2.5 text-center sm:px-4 sm:py-3">Owner contact</th>
              <th className="min-w-[8rem] px-3 py-2.5 text-center sm:px-4 sm:py-3">Amount</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-center sm:px-4 sm:py-3">Property ID</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-center sm:px-4 sm:py-3">Owner ID</th>
              <th className="px-3 py-2.5 text-center sm:px-4 sm:py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedProperties.length > 0 ? (
              displayedProperties.map((property) => (
                <tr
                  key={property._id}
                  className="border-t border-indigo-50 transition duration-200 even:bg-indigo-50/30 hover:bg-sky-50/50"
                >
                  <td className="px-3 py-2.5 text-center font-medium text-indigo-700 sm:px-4 sm:py-3">
                    {property.propertyType}
                  </td>
                  <td className="px-3 py-2.5 text-center sm:px-4 sm:py-3">
                    {property.propertyAdType || "N/A"}
                  </td>
                  <td className="max-w-[10rem] px-3 py-2.5 text-center sm:max-w-xs sm:px-4 sm:py-3">
                    {property.propertyAddress}
                  </td>
                  <td className="px-3 py-2.5 text-center font-medium sm:px-4 sm:py-3">
                    {property.displayOwnerName}
                  </td>
                  <td className="px-3 py-2.5 text-center sm:px-4 sm:py-3">
                    {formatOwnerContactDisplay(property.ownerContact)}
                  </td>
                  <td className="min-w-[8rem] whitespace-nowrap px-3 py-2.5 text-center font-semibold text-slate-800 sm:px-4 sm:py-3">
                    Rp {formatPropertyAmount(property.propertyAmt)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-xs text-slate-500 sm:px-4 sm:py-3">
                    {property._id}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-xs text-slate-500 sm:px-4 sm:py-3">
                    {property.ownerId}
                  </td>
                  <td className="px-3 py-2.5 text-center sm:px-4 sm:py-3">
                    <Popconfirm
                      title="Delete this property?"
                      description="This permanently removes the listing, its images, and all related bookings."
                      onConfirm={() => handleDelete(property._id)}
                      okText="Delete"
                      okButtonProps={{ danger: true }}
                      cancelText="Cancel"
                      placement="top"
                    >
                      <button
                        type="button"
                        className="flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-2 py-1 text-sm font-medium text-rose-700 transition hover:bg-rose-100 sm:px-3"
                        title="Delete property"
                      >
                        <Trash2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </Popconfirm>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-6 text-center text-sm text-slate-400"
                >
                  {allProperties.length === 0
                    ? "No properties found"
                    : "No matching properties"}
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

export default AdminAllProperty;
