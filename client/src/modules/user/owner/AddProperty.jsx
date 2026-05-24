import React, { useState, useRef } from "react";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import OwnerContactInput from "../../../components/OwnerContactInput";
import IndonesiaPropertyAddressFields from "../../../components/IndonesiaPropertyAddressFields";
import { formatPropertyAmount, parsePropertyAmountInput } from "../../../utils/propertyFormat";
import { buildPropertyAddress } from "../../../utils/propertyAddress";
import {
  buildOwnerContact,
  DEFAULT_DIAL_CODE,
} from "../../../utils/phoneContact";
import {
  Utensils,
  Wifi,
  Waves,
  AirVent,
  Trees,
  ParkingSquare,
  Tv,
  BuildingIcon,
  Wind,
  ChevronDown,
  ChevronUp,
  SoapDispenserDroplet,
} from "lucide-react";

axios.defaults.withCredentials = true;

const fieldClass =
  "w-full rounded-xl border border-indigo-200 bg-white px-3 py-2.5 text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200";

const labelClass = "mb-2 block text-sm font-medium text-slate-600";

// Amenity options matching the image provided
const AMENITIES = [
  { label: "Kitchen",                 Icon: Utensils         },
  { label: "Wifi",                    Icon: Wifi             },
  { label: "Dedicated workspace",     Icon: BuildingIcon     },
  { label: "Free parking on premises",Icon: ParkingSquare    },
  { label: "Pool",                    Icon: Waves            },
  { label: "TV",                      Icon: Tv               },
  { label: "Air conditioning",        Icon: AirVent          },
  { label: "Patio or balcony",        Icon: Wind             },
  { label: "Backyard",                Icon: Trees            },
  { label: "Hair dryer",              Icon: Wind             },
  { label: "Shampoo",                 Icon: SoapDispenserDroplet},
];

// Parse which amenity labels are currently embedded in additionalInfo text
function parseSelectedAmenities(text) {
  return AMENITIES
    .filter(({ label }) => text.includes(label))
    .map(({ label }) => label);
}

// Add or remove an amenity label from the additionalInfo string
function toggleAmenityInText(currentText, label) {
  if (currentText.includes(label)) {
    // Remove: strip the label (and any surrounding comma+space or leading comma+space)
    let updated = currentText
      .replace(new RegExp(`,?\\s*${escapeRegex(label)}\\s*,?`, "g"), (match) => {
        // keep a comma if it was between two items
        if (match.startsWith(",") && match.endsWith(",")) return ",";
        return "";
      })
      .trim()
      .replace(/^,\s*/, "")
      .replace(/,\s*$/, "")
      .trim();
    return updated;
  } else {
    // Append
    const base = currentText.trim();
    return base ? `${base}, ${label}` : label;
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function AddProperty({ isAdmin = false }) {
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  const [propertyDetails, setPropertyDetails] = useState({
    propertyType: "residential",
    propertyAdType: "rent",
    ownerContact: "",
    propertyAmt: 0,
    additionalInfo: "",
  });
  const [addressCity, setAddressCity] = useState("");
  const [addressDistrict, setAddressDistrict] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressPostalCode, setAddressPostalCode] = useState("");
  const [contactDialCode, setContactDialCode] = useState(DEFAULT_DIAL_CODE);
  const [contactNumber, setContactNumber] = useState("");
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const navigate = useNavigate();

  const selectedAmenities = parseSelectedAmenities(propertyDetails.additionalInfo);

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

  const handleAmenityToggle = (label) => {
    setPropertyDetails((prev) => ({
      ...prev,
      additionalInfo: toggleAmenityInText(prev.additionalInfo, label),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("propertyType", propertyDetails.propertyType);
    formData.append("propertyAdType", propertyDetails.propertyAdType);
    formData.append(
      "propertyAddress",
      buildPropertyAddress({
        city: addressCity,
        district: addressDistrict,
        streetAddress: addressStreet,
        postalCode: addressPostalCode,
      })
    );
    formData.append("ownerContact", buildOwnerContact(contactDialCode, contactNumber));
    formData.append("propertyAmt", propertyDetails.propertyAmt);
    formData.append("additionalInfo", propertyDetails.additionalInfo);
    formData.append("amenities", JSON.stringify(selectedAmenities));

    const files = fileInputRef.current?.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        formData.append("propertyImages", files[i]);
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
          ownerContact: "",
          propertyAmt: 0,
          additionalInfo: "",
        });
        setAddressCity("");
        setAddressDistrict("");
        setAddressStreet("");
        setAddressPostalCode("");
        setContactDialCode(DEFAULT_DIAL_CODE);
        setContactNumber("");
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
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
        <div className="grid gap-6 md:grid-cols-2">
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
        </div>

        <IndonesiaPropertyAddressFields
          city={addressCity}
          district={addressDistrict}
          streetAddress={addressStreet}
          postalCode={addressPostalCode}
          onCityChange={setAddressCity}
          onDistrictChange={setAddressDistrict}
          onStreetAddressChange={setAddressStreet}
          onPostalCodeChange={setAddressPostalCode}
        />

        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label className={labelClass}>Property images</label>
            <input
              ref={fileInputRef}
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

        {/* ── Additional Details ── */}
        <div>
          <label className={labelClass}>Additional details</label>

          {/* Amenities dropdown */}
          <div className="mb-2">
            <button
              type="button"
              onClick={() => setAmenitiesOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl border border-indigo-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm transition hover:border-indigo-400 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <span className="font-medium">
                {selectedAmenities.length > 0
                  ? `${selectedAmenities.length} amenit${selectedAmenities.length === 1 ? "y" : "ies"} selected`
                  : "Select amenities (optional)"}
              </span>
              {amenitiesOpen ? (
                <ChevronUp className="h-4 w-4 text-indigo-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-indigo-400" />
              )}
            </button>

            {amenitiesOpen && (
              <div className="mt-1 rounded-xl border border-indigo-200 bg-white p-3 shadow-md">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {AMENITIES.map(({ label, Icon }) => {
                    const active = selectedAmenities.includes(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => handleAmenityToggle(label)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition
                          ${
                            active
                              ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                          }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${active ? "text-indigo-500" : "text-slate-400"}`} />
                        <span className="truncate leading-tight">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Free-text input */}
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
            disabled={isAdmin}
            title={isAdmin ? "Admins cannot publish listings" : undefined}
            className="rounded-xl bg-indigo-400 px-8 py-2.5 font-semibold text-white shadow-md transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Publish listing
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProperty;
