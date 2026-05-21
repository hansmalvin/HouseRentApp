import React, { useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { formatPropertyAmount } from "../../utils/propertyFormat";
import { formatOwnerContactDisplay } from "../../utils/phoneContact";

axios.defaults.withCredentials = true;

const AdminAllProperty = () => {
  const [allProperties, setAllProperties] = useState([]);
  const navigate = useNavigate();

  const getAllProperty = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8001/api/admin/getallproperties",
        { withCredentials: true }
      );

      if (response.data.success) {
        setAllProperties(response.data.data);
      } else {
        message.error(response.data.message || "Unauthorized access");
        navigate("/login");
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

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-indigo-700">All properties</h2>
      <p className="mb-6 text-sm text-slate-500">
        Every listing published on the platform, across all owners.
      </p>

      <div className="overflow-x-auto rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-indigo-100/90 text-indigo-900">
            <tr>
              <th className="px-4 py-3">Property ID</th>
              <th className="px-4 py-3 text-center">Owner ID</th>
              <th className="px-4 py-3 text-center">Property type</th>
              <th className="px-4 py-3 text-center">Ad type</th>
              <th className="px-4 py-3 text-center">Address</th>
              <th className="px-4 py-3 text-center">Owner contact</th>
              <th className="px-4 py-3 text-center">Amount</th>
            </tr>
          </thead>
          <tbody>
            {allProperties.length > 0 ? (
              allProperties.map((property) => (
                <tr
                  key={property._id}
                  className="border-t border-indigo-50 transition duration-200 even:bg-indigo-50/30 hover:bg-sky-50/50"
                >
                  <td className="px-4 py-3">{property._id}</td>
                  <td className="px-4 py-3 text-center">{property.ownerId}</td>
                  <td className="px-4 py-3 text-center font-medium text-indigo-700">
                    {property.propertyType}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {property.propertyAdType || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {property.propertyAddress}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {formatOwnerContactDisplay(property.ownerContact)}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-slate-800">
                    Rp {formatPropertyAmount(property.propertyAmt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  No properties found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAllProperty;
