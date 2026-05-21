import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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
        message.error(propertiesRes.data.message || "Unauthorized access");
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
        message.error("Session expired, please login again");
        navigate("/login");
      } else {
        message.error("Failed to fetch properties");
      }
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
      <h2 className="mb-1 text-xl font-bold text-indigo-700">All properties</h2>
      <p className="mb-4 text-sm text-slate-500">
        Every listing published on the platform, across all owners.
      </p>

      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <div className="border-b border-indigo-50 px-4 py-4 sm:px-5">
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
              <th className="px-4 py-3 text-center">Property type</th>
              <th className="px-4 py-3 text-center">Ad type</th>
              <th className="px-4 py-3 text-center">Address</th>
              <th className="px-4 py-3 text-center">Owner name</th>
              <th className="px-4 py-3 text-center">Owner contact</th>
              <th className="min-w-[9rem] px-4 py-3 text-center">Amount</th>
              <th className="whitespace-nowrap px-4 py-3 text-right">Property ID</th>
              <th className="whitespace-nowrap px-4 py-3 text-right">Owner ID</th>
            </tr>
          </thead>
          <tbody>
            {displayedProperties.length > 0 ? (
              displayedProperties.map((property) => (
                <tr
                  key={property._id}
                  className="border-t border-indigo-50 transition duration-200 even:bg-indigo-50/30 hover:bg-sky-50/50"
                >
                  <td className="px-4 py-3 text-center font-medium text-indigo-700">
                    {property.propertyType}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {property.propertyAdType || "N/A"}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-center">
                    {property.propertyAddress}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    {property.displayOwnerName}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {formatOwnerContactDisplay(property.ownerContact)}
                  </td>
                  <td className="min-w-[9rem] whitespace-nowrap px-4 py-3 text-center font-semibold text-slate-800">
                    Rp {formatPropertyAmount(property.propertyAmt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-xs text-slate-500">
                    {property._id}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-xs text-slate-500">
                    {property.ownerId}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-slate-400"
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
