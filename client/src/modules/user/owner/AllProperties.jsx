import { message } from "antd";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DeletePropertyModal from "../../../components/DeletePropertyModal";
import IndonesiaPropertyAddressFields from "../../../components/IndonesiaPropertyAddressFields";
import OwnerContactInput from "../../../components/OwnerContactInput";
import {
  formatPropertyAmount,
  parsePropertyAmountInput,
} from "../../../utils/propertyFormat";
import {
  buildPropertyAddress,
  parsePropertyAddress,
} from "../../../utils/propertyAddress";
import {
  buildOwnerContact,
  DEFAULT_DIAL_CODE,
  formatOwnerContactDisplay,
  parseOwnerContact,
} from "../../../utils/phoneContact";

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
  const [editDialCode, setEditDialCode] = useState(DEFAULT_DIAL_CODE);
  const [editContactNumber, setEditContactNumber] = useState("");
  const [editAddressCity, setEditAddressCity] = useState("");
  const [editAddressDistrict, setEditAddressDistrict] = useState("");
  const [editAddressStreet, setEditAddressStreet] = useState("");
  const [editAddressPostalCode, setEditAddressPostalCode] = useState("");
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    setShow(false);
    setImage(null);
    setEditDialCode(DEFAULT_DIAL_CODE);
    setEditContactNumber("");
    setEditAddressCity("");
    setEditAddressDistrict("");
    setEditAddressStreet("");
    setEditAddressPostalCode("");
  }, []);

  const handleShow = (property) => {
    const { dialCode, nationalNumber } = parseOwnerContact(property.ownerContact);
    const address = parsePropertyAddress(property.propertyAddress);
    setEditingPropertyId(property._id);
    setEditingPropertyData(property);
    setEditDialCode(dialCode);
    setEditContactNumber(nationalNumber);
    setEditAddressCity(address.city);
    setEditAddressDistrict(address.district);
    setEditAddressStreet(address.streetAddress);
    setEditAddressPostalCode(address.postalCode);
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

  const openDeleteModal = (property) => {
    setPropertyToDelete(property);
    setDeleteConfirmText("");
  };

  const closeDeleteModal = useCallback(() => {
    if (isDeleting) return;
    setPropertyToDelete(null);
    setDeleteConfirmText("");
  }, [isDeleting]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingPropertyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmountChange = (e) => {
    const propertyAmt = parsePropertyAmountInput(e.target.value);
    setEditingPropertyData((prev) => ({ ...prev, propertyAmt }));
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
      const ownerContact = buildOwnerContact(editDialCode, editContactNumber);
      const builtAddress = buildPropertyAddress({
        city: editAddressCity,
        district: editAddressDistrict,
        streetAddress: editAddressStreet,
        postalCode: editAddressPostalCode,
      });

      editableFields.forEach((field) => {
        const value =
          field === "ownerContact"
            ? ownerContact
            : field === "propertyAddress"
              ? builtAddress
              : field === "propertyAmt"
                ? editingPropertyData.propertyAmt ?? 0
                : editingPropertyData[field] ?? "";
        formData.append(field, value);
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

  const confirmDelete = async () => {
    if (!propertyToDelete) return;

    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `http://localhost:8001/api/owner/deleteproperty/${propertyToDelete._id}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        message.success(response.data.message);
        setPropertyToDelete(null);
        setDeleteConfirmText("");
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
    } finally {
      setIsDeleting(false);
    }
  };


  const editFieldClass =
    "mt-2 w-full rounded-xl border border-indigo-200 bg-white px-3 py-2.5 text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200";

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-indigo-700">Your listings</h2>
      <p className="mb-6 text-sm text-slate-500">
        Edit or remove properties you have published. Availability updates when
        you save changes.
      </p>

      <div
        className={`overflow-x-auto rounded-2xl border border-indigo-100 bg-white shadow-sm transition-[min-height] duration-300 ease-out ${
          show ? "min-h-[min(100dvh,34rem)]" : ""
        }`}
      >
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-indigo-100/90 text-indigo-900">
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
            className="border-t border-indigo-50 transition duration-200 even:bg-indigo-50/30 hover:bg-sky-50/50"
          >
            <td className="px-4 py-3">{property._id}</td>
            <td className="px-4 py-3 text-center">{property.propertyType}</td>
            <td className="px-4 py-3 text-center">{property.propertyAdType}</td>
            <td className="px-4 py-3 text-center">{property.propertyAddress}</td>
            <td className="px-4 py-3 text-center">
              {formatOwnerContactDisplay(property.ownerContact)}
            </td>
            <td className="px-4 py-3 text-center">
              Rp {formatPropertyAmount(property.propertyAmt)}
            </td>
            <td
              className={`px-4 py-3 text-center font-semibold ${
                property.isAvailable === "Available"
                  ? "text-emerald-600"
                  : "text-rose-600"
              }`}
            >
              {property.isAvailable}
            </td>
            <td className="px-4 py-3 flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => handleShow(property)}
                className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => openDeleteModal(property)}
                className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
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
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-indigo-900/20 p-2 backdrop-blur-sm sm:p-4"
      onClick={handleClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-labelledby="edit-property-title"
        aria-describedby="edit-property-desc"
        className="my-4 flex h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] w-full max-w-6xl min-h-0 flex-col overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-2xl sm:my-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0 border-b border-indigo-100 bg-indigo-50/80 px-6 py-4 pr-12 sm:px-8">
          <span className="mb-1.5 inline-flex items-center rounded-full bg-indigo-200/80 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-800">
            Edit listing
          </span>
          <h3
            id="edit-property-title"
            className="text-xl font-bold tracking-tight text-indigo-800 sm:text-2xl"
          >
            Edit property
          </h3>
          <p id="edit-property-desc" className="mt-1 max-w-md text-sm leading-relaxed text-slate-500">
            Update details in each section. Save stays pinned at the bottom.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-200 bg-white text-slate-500 transition hover:bg-indigo-100 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
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
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-white to-indigo-50/40 px-6 py-4 sm:px-8">
            <div className="rounded-xl border border-indigo-100 border-l-4 border-l-indigo-400 bg-indigo-50/50 p-4 shadow-sm">
              <label className="text-sm font-semibold text-slate-700">
                Property type
              </label>
              <select
                name="propertyType"
                value={editingPropertyData.propertyType || "residential"}
                onChange={handleChange}
                className={editFieldClass}
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="land/plot">Land/Plot</option>
              </select>
            </div>

            <div className="rounded-xl border border-indigo-100 border-l-4 border-l-sky-400 bg-sky-50/50 p-4 shadow-sm">
              <label className="text-sm font-semibold text-slate-700">
                Listing type
              </label>
              <select
                name="propertyAdType"
                value={editingPropertyData.propertyAdType || "rent"}
                onChange={handleChange}
                className={editFieldClass}
              >
                <option value="rent">Rent</option>
                <option value="sale">Sale</option>
              </select>
            </div>

            <div className="rounded-xl border border-indigo-100 border-l-4 border-l-rose-300 bg-rose-50/40 p-4 shadow-sm">
              <IndonesiaPropertyAddressFields
                city={editAddressCity}
                district={editAddressDistrict}
                streetAddress={editAddressStreet}
                postalCode={editAddressPostalCode}
                onCityChange={setEditAddressCity}
                onDistrictChange={setEditAddressDistrict}
                onStreetAddressChange={setEditAddressStreet}
                onPostalCodeChange={setEditAddressPostalCode}
                cityId="edit-property-city"
                districtId="edit-property-district"
                streetId="edit-property-street"
                postalId="edit-property-postal"
              />
            </div>

            <div className="rounded-xl border border-indigo-100 border-l-4 border-l-rose-300 bg-rose-50/40 p-4 shadow-sm">
              <label
                htmlFor="edit-ownerContact"
                className="text-sm font-semibold text-slate-700"
              >
                Owner contact
              </label>
              <OwnerContactInput
                dialId="edit-ownerContact-dial"
                numberId="edit-ownerContact"
                dialCode={editDialCode}
                nationalNumber={editContactNumber}
                onDialCodeChange={setEditDialCode}
                onNationalNumberChange={setEditContactNumber}
                numberPlaceholder="81799987778"
                className="mt-2"
              />
            </div>

            <div className="rounded-xl border border-indigo-100 border-l-4 border-l-emerald-300 bg-emerald-50/40 p-4 shadow-sm">
              <label
                htmlFor="edit-propertyAmt"
                className="text-sm font-semibold text-slate-700"
              >
                Amount (Rp)
              </label>
              <input
                id="edit-propertyAmt"
                type="text"
                inputMode="numeric"
                name="propertyAmt"
                value={
                  editingPropertyData.propertyAmt
                    ? formatPropertyAmount(editingPropertyData.propertyAmt)
                    : ""
                }
                onChange={handleAmountChange}
                placeholder="e.g. 100.000"
                className={editFieldClass}
              />
            </div>

            <div className="rounded-xl border border-indigo-100 border-l-4 border-l-blue-400 bg-blue-50/50 p-4 shadow-sm">
              <label
                htmlFor="edit-additionalInfo"
                className="text-sm font-semibold text-slate-700"
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
                className={`${editFieldClass} min-h-[5.5rem] resize-y`}
              />
            </div>

            <div className="rounded-xl border border-indigo-100 border-l-4 border-l-sky-400 bg-sky-50/50 p-4 shadow-sm">
              <label className="text-sm font-semibold text-slate-700">
                Property photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={`${editFieldClass} cursor-pointer border-dashed file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-indigo-300 file:px-3.5 file:py-2 file:text-sm file:font-semibold file:text-indigo-900 hover:file:bg-indigo-400`}
              />
              {getPropertyImagePath(editingPropertyData) && (
                <div className="mt-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Current image
                  </p>
                  <img
                    src={`http://localhost:8001${getPropertyImagePath(editingPropertyData)}`}
                    alt="Current property"
                    className="h-40 w-full rounded-xl border border-indigo-200 object-cover shadow-md sm:h-44"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 rounded-b-2xl border-t border-indigo-100 bg-indigo-50/80 px-6 py-4 sm:px-10">
            <div className="flex flex-row flex-nowrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="min-w-[6.5rem] shrink-0 rounded-xl border border-indigo-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-indigo-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-w-[6.5rem] shrink-0 rounded-xl bg-indigo-400 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2"
              >
                Save changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )}

  {propertyToDelete && (
    <DeletePropertyModal
      property={propertyToDelete}
      confirmText={deleteConfirmText}
      onConfirmTextChange={setDeleteConfirmText}
      onCancel={closeDeleteModal}
      onConfirm={confirmDelete}
      isDeleting={isDeleting}
    />
  )}
    </div>
  );
};

export default OwnerAllProperties;

