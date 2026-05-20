import React, { useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import OwnerContactInput from "../../../components/OwnerContactInput";
import { formatPropertyAmount, parsePropertyAmountInput } from "../../../utils/propertyFormat";
import {
  buildOwnerContact,
  DEFAULT_DIAL_CODE,
} from "../../../utils/phoneContact";

axios.defaults.withCredentials = true;

const fieldClass =
  "w-full rounded-xl border border-indigo-200 bg-white px-3 py-2.5 text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200";

const labelClass = "mb-2 block text-sm font-medium text-slate-600";

function AddProperty() {
  const [image, setImage] = useState(null);
  const [propertyDetails, setPropertyDetails] = useState({
    propertyType: "residential",
    propertyAdType: "rent",
    propertyAddress: "",
    ownerContact: "",
    propertyAmt: 0,
    additionalInfo: "",
  });
  const [contactDialCode, setContactDialCode] = useState(DEFAULT_DIAL_CODE);
  const [contactNumber, setContactNumber] = useState("");
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    setImage(e.target.files);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPropertyDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmountChange = (e) => {
    const propertyAmt = parsePropertyAmountInput(e.target.value);
    setPropertyDetails((prev) => ({ ...prev, propertyAmt }));
  };

  useEffect(() => {
    setPropertyDetails((prev) => ({
      ...prev,
      propertyImages: image,
    }));
  }, [image]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("propertyType", propertyDetails.propertyType);
    formData.append("propertyAdType", propertyDetails.propertyAdType);
    formData.append("propertyAddress", propertyDetails.propertyAddress);
    formData.append("ownerContact", buildOwnerContact(contactDialCode, contactNumber));
    formData.append("propertyAmt", propertyDetails.propertyAmt);
    formData.append("additionalInfo", propertyDetails.additionalInfo);

    if (image) {
      for (let i = 0; i < image.length; i++) {
        formData.append("propertyImages", image[i]);
      }
    }

    try {
      const res = await axios.post(
        "http://localhost:8001/api/owner/postproperty",
        formData,
        { withCredentials: true }
      );

      if (res.data.success) {
        message.success(res.data.message);
        setPropertyDetails({
          propertyType: "residential",
          propertyAdType: "rent",
          propertyAddress: "",
          ownerContact: "",
          propertyAmt: 0,
          additionalInfo: "",
        });
        setContactDialCode(DEFAULT_DIAL_CODE);
        setContactNumber("");
        setImage(null);
      } else {
        message.error(res.data.message || "Unauthorized access");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error adding property:", error);
      if (error.response && error.response.status === 401) {
        message.error("Session expired, please login again");
        navigate("/login");
      } else {
        message.error("Failed to add property");
      }
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="mb-2 text-center text-2xl font-bold text-indigo-700 sm:text-3xl">
        Add a new listing
      </h2>
      <p className="mb-8 text-center text-sm text-slate-500">
        Fill in the details below to publish your property.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label className={labelClass}>Property type</label>
            <select
              name="propertyType"
              value={propertyDetails.propertyType}
              onChange={handleChange}
              className={fieldClass}
            >
              <option disabled>Choose...</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="land/plot">Land/Plot</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Listing type</label>
            <select
              name="propertyAdType"
              value={propertyDetails.propertyAdType}
              onChange={handleChange}
              className={fieldClass}
            >
              <option disabled>Choose...</option>
              <option value="rent">Rent</option>
              <option value="sale">Sale</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Full address</label>
            <input
              type="text"
              name="propertyAddress"
              value={propertyDetails.propertyAddress}
              onChange={handleChange}
              placeholder="Street, city, postal code"
              required
              className={fieldClass}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label className={labelClass}>Property images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              required
              onChange={handleImageChange}
              className={`${fieldClass} cursor-pointer file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-indigo-300 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-indigo-900 hover:file:bg-indigo-400`}
            />
          </div>

          <div>
            <label className={labelClass}>Your contact number</label>
            <OwnerContactInput
              dialCode={contactDialCode}
              nationalNumber={contactNumber}
              onDialCodeChange={setContactDialCode}
              onNationalNumberChange={setContactNumber}
              numberPlaceholder="8123456789"
              required
            />
          </div>

          <div>
            <label className={labelClass}>Amount (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              name="propertyAmt"
              value={
                propertyDetails.propertyAmt
                  ? formatPropertyAmount(propertyDetails.propertyAmt)
                  : ""
              }
              onChange={handleAmountChange}
              placeholder="e.g. 100.000"
              required
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Additional details</label>
          <textarea
            name="additionalInfo"
            value={propertyDetails.additionalInfo}
            onChange={handleChange}
            rows={4}
            placeholder="Amenities, move-in date, parking, pets, etc."
            className={fieldClass}
          />
        </div>

        <div className="flex justify-end border-t border-indigo-100 pt-6">
          <button
            type="submit"
            className="rounded-xl bg-indigo-400 px-8 py-2.5 font-semibold text-white shadow-md transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2"
          >
            Publish listing
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProperty;
