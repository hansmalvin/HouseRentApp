import { message } from "antd";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom"

const OwnerAllProperties = () => {
  const [image, setImage] = useState(null);
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [editingPropertyData, setEditingPropertyData] = useState({
    propertyType: "",
    propertyAdType: "",
    propertyAddress: "",
    ownerContact: "",
    propertyAmt: 0,
    additionalInfo: "",
  });
  const [allProperties, setAllProperties] = useState([]);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => setShow(false);

  const handleShow = (property) => {
    setEditingPropertyId(property._id);
    setEditingPropertyData(property);
    setShow(true);
  };

  const getAllProperty = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8001/api/owner/getallproperties",
        { withCredentials: true }
      );
      if (response.data.success) {
        setAllProperties(response.data.data);
      } else {
        message.error("Unauthorized access");
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 401) {
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingPropertyData((prev) => ({ ...prev, [name]: value }));
  };

  const saveChanges = async (propertyId, status) => {
    try {
      const formData = new FormData();
      Object.entries(editingPropertyData).forEach(([key, value]) =>
        formData.append(key, value)
      );
      if (image) formData.append("propertyImage", image);
      formData.append("isAvailable", status);

      const res = await axios.patch(
        `http://localhost:8001/api/owner/updateproperty/${propertyId}`,
        formData,
        { withCredentials: true }
      );

      if (res.data.success) {
        message.success(res.data.message);
        handleClose();
        getAllProperty();
      } else {
        message.error(res.data.message || "Unauthorized access");
        navigate("/login");
      }
    } catch (error) {
      console.log(error);

      if (error.response && error.response.status === 401) {
        message.error("Session expired, please login again");
        navigate("/login");
      } else {
        message.error("Failed to save changes");
      }
    }
  };

  const handleDelete = async (propertyId) => {
    if (window.confirm("Are you sure to delete?")) {
      try {
        const response = await axios.delete(
          `http://localhost:8001/api/owner/deleteproperty/${propertyId}`,
          { withCredentials: true }
        );

        if (response.data.success) {
          message.success(response.data.message);
          getAllProperty();
        } else {
          message.error(response.data.message || "Unauthorized access");
          navigate("/login");
        }
      } catch (error) {
        console.log(error);

        if (error.response && error.response.status === 401) {
          message.error("Session expired, please login again");
          navigate("/login");
        } else {
          message.error("Failed to delete property");
        }
      }
    }
  };


  return (
   <div className="p-6">
  <div className="overflow-x-auto rounded-lg shadow-2xl border border-gray-700 bg-gray-900/80 backdrop-blur-md">
    <table className="w-full text-sm text-left text-gray-300">
      <thead className="bg-indigo-600/80 text-white">
        <tr>
          <th className="px-4 py-3">Property ID</th>
          <th className="px-4 py-3 text-center">Property Type</th>
          <th className="px-4 py-3 text-center">Ad Type</th>
          <th className="px-4 py-3 text-center">Address</th>
          <th className="px-4 py-3 text-center">Owner Contact</th>
          <th className="px-4 py-3 text-center">Amount</th>
          <th className="px-4 py-3 text-center">Availability</th>
          <th className="px-4 py-3 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {allProperties.map((property) => (
          <tr
            key={property._id}
            className="border-b border-gray-700 hover:bg-gray-800/60 transition duration-200"
          >
            <td className="px-4 py-3">{property._id}</td>
            <td className="px-4 py-3 text-center">{property.propertyType}</td>
            <td className="px-4 py-3 text-center">{property.propertyAdType}</td>
            <td className="px-4 py-3 text-center">{property.propertyAddress}</td>
            <td className="px-4 py-3 text-center">{property.ownerContact}</td>
            <td className="px-4 py-3 text-center">₹{property.propertyAmt}</td>
            <td
              className={`px-4 py-3 text-center font-semibold ${
                property.isAvailable === "Available"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {property.isAvailable}
            </td>
            <td className="px-4 py-3 flex gap-2 justify-center">
              <button
                onClick={() => handleShow(property)}
                className="px-3 py-1 text-sm border border-indigo-500 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(property._id)}
                className="px-3 py-1 text-sm border border-red-500 text-red-400 rounded-lg hover:bg-red-500/20 transition"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Edit Modal */}
  {show && (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
      <div className="bg-gray-900/90 border border-gray-700 text-white w-full max-w-xl p-6 rounded-xl shadow-2xl">
        <h3 className="text-2xl font-bold mb-6 text-indigo-400">Edit Property</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveChanges(editingPropertyId, editingPropertyData.isAvailable);
          }}
          className="space-y-4"
        >
          <input
            type="text"
            name="propertyType"
            value={editingPropertyData.propertyType}
            onChange={handleChange}
            placeholder="Property Type"
            className="border border-gray-700 bg-gray-800/70 text-white px-3 py-2 w-full rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
          />
          <input
            type="text"
            name="propertyAdType"
            value={editingPropertyData.propertyAdType}
            onChange={handleChange}
            placeholder="Ad Type"
            className="border border-gray-700 bg-gray-800/70 text-white px-3 py-2 w-full rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
          />
          <input
            type="text"
            name="propertyAddress"
            value={editingPropertyData.propertyAddress}
            onChange={handleChange}
            placeholder="Property Address"
            className="border border-gray-700 bg-gray-800/70 text-white px-3 py-2 w-full rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
          />
          <input
            type="text"
            name="ownerContact"
            value={editingPropertyData.ownerContact}
            onChange={handleChange}
            placeholder="Owner Contact"
            className="border border-gray-700 bg-gray-800/70 text-white px-3 py-2 w-full rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
          />
          <input
            type="number"
            name="propertyAmt"
            value={editingPropertyData.propertyAmt}
            onChange={handleChange}
            placeholder="Property Amount"
            className="border border-gray-700 bg-gray-800/70 text-white px-3 py-2 w-full rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
          />
          <textarea
            name="additionalInfo"
            value={editingPropertyData.additionalInfo}
            onChange={handleChange}
            placeholder="Additional Info"
            className="border border-gray-700 bg-gray-800/70 text-white px-3 py-2 w-full rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="border border-gray-700 bg-gray-800/70 text-white px-3 py-2 w-full rounded-lg cursor-pointer file:mr-3 file:px-3 file:py-1 file:rounded-md file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
          />

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
</div>

  );
};

export default OwnerAllProperties;

