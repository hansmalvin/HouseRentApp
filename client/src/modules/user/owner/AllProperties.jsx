import { message } from "antd";
import React, { useState, useEffect, useCallback } from "react";
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

  const handleClose = useCallback(() => {
    setShow(false);
    setImage(null);
  }, []);

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

  useEffect(() => {
    if (!show) return;
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, handleClose]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingPropertyData((prev) => ({ ...prev, [name]: value }));
  };

  const getPropertyImagePath = (property) => {
    if (!property?.propertyImage) return "";
    if (Array.isArray(property.propertyImage)) {
      return property.propertyImage[0]?.path || "";
    }
    return property.propertyImage.path || "";
  };

  const saveChanges = async (propertyId, status) => {
    try {
      const formData = new FormData();
      const editableFields = [
        "propertyType",
        "propertyAdType",
        "propertyAddress",
        "ownerContact",
        "propertyAmt",
        "additionalInfo",
      ];
      editableFields.forEach((field) => {
        formData.append(field, editingPropertyData[field] ?? "");
      });
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
        message.error(error.response?.data?.message || "Failed to save changes");
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
  <div
    className={`overflow-x-auto rounded-lg border border-gray-700 bg-gray-900/80 shadow-2xl backdrop-blur-md transition-[min-height] duration-300 ease-out ${
      show ? "min-h-[min(100dvh,28rem)]" : ""
    }`}
  >
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

  {/* Edit modal — elevated card, sticky actions, scroll only on body */}
  {show && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/75 p-1 backdrop-blur-md sm:p-2"
      onClick={handleClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-labelledby="edit-property-title"
        aria-describedby="edit-property-desc"
        className="my-4 flex h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] w-full max-w-6xl min-h-0 flex-col overflow-hidden rounded-2xl ... sm:my-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0 border-b border-gray-700/90 bg-gray-900/60 px-6 py-3 pr-12 sm:px-8">
          <span className="mb-1.5 inline-flex items-center rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
            Owner · Edit listing
          </span>
          <h3
            id="edit-property-title"
            className="text-xl font-bold tracking-tight text-white sm:text-2xl"
          >
            Edit property
          </h3>
          <p id="edit-property-desc" className="mt-1 max-w-md text-sm leading-relaxed text-gray-400">
            Update details in each section. Your save actions stay pinned at the bottom so you always see them.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg border border-gray-600/80 bg-gray-800/80 text-gray-300 transition hover:border-gray-500 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
            aria-label="Close"
          >
            <span className="text-lg leading-none" aria-hidden>
              ×
            </span>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveChanges(editingPropertyId, editingPropertyData.isAvailable);
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div
            className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-6 py-3 sm:px-8 [scrollbar-color:rgba(71,85,105,0.9)_rgba(15,23,42,0.9)] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-950/80 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 hover:[&::-webkit-scrollbar-thumb]:bg-slate-500"
          >
            <div className="rounded-xl border border-gray-600/70 border-l-4 border-l-indigo-500 bg-slate-800/35 p-4 shadow-sm ring-1 ring-white/[0.04]">
              <label className="text-sm font-semibold text-gray-100">
                Property type
              </label>
              <select
                name="propertyType"
                value={editingPropertyData.propertyType || "residential"}
                onChange={handleChange}
                className="mt-2 w-full cursor-pointer rounded-lg border border-gray-600 bg-slate-950/80 px-3 py-2.5 text-white shadow-inner transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/35"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="land/plot">Land/Plot</option>
              </select>
            </div>

            <div className="rounded-xl border border-gray-600/70 border-l-4 border-l-indigo-500 bg-slate-800/35 p-4 shadow-sm ring-1 ring-white/[0.04]">
              <label className="text-sm font-semibold text-gray-100">
                Listing type
              </label>
              <select
                name="propertyAdType"
                value={editingPropertyData.propertyAdType || "rent"}
                onChange={handleChange}
                className="mt-2 w-full cursor-pointer rounded-lg border border-gray-600 bg-slate-950/80 px-3 py-2.5 text-white shadow-inner transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/35"
              >
                <option value="rent">Rent</option>
                <option value="sale">Sale</option>
              </select>
            </div>

            <div className="rounded-xl border border-gray-600/70 border-l-4 border-l-violet-500 bg-slate-800/35 p-4 shadow-sm ring-1 ring-white/[0.04]">
              <label
                htmlFor="edit-propertyAddress"
                className="text-sm font-semibold text-gray-100"
              >
                Property address
              </label>
              <input
                id="edit-propertyAddress"
                type="text"
                name="propertyAddress"
                value={editingPropertyData.propertyAddress}
                onChange={handleChange}
                placeholder="e.g. 12 Main Street, City"
                className="mt-2 w-full rounded-lg border border-gray-600 bg-slate-950/80 px-3 py-2.5 text-white placeholder-gray-500 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/35"
              />
            </div>

            <div className="rounded-xl border border-gray-600/70 border-l-4 border-l-violet-500 bg-slate-800/35 p-4 shadow-sm ring-1 ring-white/[0.04]">
              <label
                htmlFor="edit-ownerContact"
                className="text-sm font-semibold text-gray-100"
              >
                Owner contact
              </label>
              <input
                id="edit-ownerContact"
                type="text"
                name="ownerContact"
                value={editingPropertyData.ownerContact}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
                className="mt-2 w-full rounded-lg border border-gray-600 bg-slate-950/80 px-3 py-2.5 text-white placeholder-gray-500 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/35"
              />
            </div>

            <div className="rounded-xl border border-gray-600/70 border-l-4 border-l-violet-500 bg-slate-800/35 p-4 shadow-sm ring-1 ring-white/[0.04]">
              <label
                htmlFor="edit-propertyAmt"
                className="text-sm font-semibold text-gray-100"
              >
                Amount (₹)
              </label>
              <input
                id="edit-propertyAmt"
                type="number"
                name="propertyAmt"
                min={0}
                value={editingPropertyData.propertyAmt}
                onChange={handleChange}
                placeholder="Enter amount in rupees"
                className="mt-2 w-full rounded-lg border border-gray-600 bg-slate-950/80 px-3 py-2.5 text-white placeholder-gray-500 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/35"
              />
            </div>

            <div className="rounded-xl border border-gray-600/70 border-l-4 border-l-fuchsia-500 bg-slate-800/35 p-4 shadow-sm ring-1 ring-white/[0.04]">
              <label
                htmlFor="edit-additionalInfo"
                className="text-sm font-semibold text-gray-100"
              >
                Additional details
              </label>
              <textarea
                id="edit-additionalInfo"
                name="additionalInfo"
                value={editingPropertyData.additionalInfo}
                onChange={handleChange}
                rows={4}
                placeholder="Write extra details for this listing…"
                className="mt-2 min-h-[5.5rem] w-full resize-y rounded-lg border border-gray-600 bg-slate-950/80 px-3 py-2.5 text-white placeholder-gray-500 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/35"
              />
            </div>

            <div className="rounded-xl border border-gray-600/70 border-l-4 border-l-sky-500 bg-slate-800/35 p-4 shadow-sm ring-1 ring-white/[0.04]">
              <label className="text-sm font-semibold text-gray-100">
                Property photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-2 w-full cursor-pointer rounded-lg border border-dashed border-gray-500/80 bg-slate-950/60 px-3 py-3.5 text-sm text-gray-300 transition file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-indigo-600 file:px-3.5 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-indigo-500/50 hover:file:bg-indigo-500"
              />
              {getPropertyImagePath(editingPropertyData) && (
                <div className="mt-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Current image
                  </p>
                  <img
                    src={`http://localhost:8001${getPropertyImagePath(editingPropertyData)}`}
                    alt="Current property"
                    className="h-40 w-full rounded-lg border border-gray-600 object-cover shadow-md sm:h-44"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 rounded-b-2xl border-t border-gray-700/90 bg-gradient-to-t from-slate-950 via-gray-950/98 to-gray-900/95 px-6 py-3.5 backdrop-blur sm:px-10">
            <div className="flex flex-row flex-nowrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="min-w-[6.5rem] shrink-0 rounded-lg border border-gray-500/80 bg-transparent px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:border-gray-400 hover:bg-gray-800/90"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-w-[6.5rem] shrink-0 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Save changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )}
</div>

  );
};

export default OwnerAllProperties;

