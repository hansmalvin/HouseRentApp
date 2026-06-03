import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import OwnerContactInput from "../../../components/OwnerContactInput";
import IndonesiaPropertyAddressFields from "../../../components/IndonesiaPropertyAddressFields";
import { formatPropertyAmount, parsePropertyAmountInput } from "../../../utils/propertyFormat";
import { buildPropertyAddress } from "../../../utils/propertyAddress";
import { buildOwnerContact, DEFAULT_DIAL_CODE } from "../../../utils/phoneContact";
import {
  Utensils, Wifi, Waves, AirVent, Trees, ParkingSquare, Tv,
  BuildingIcon, Wind, ChevronDown, ChevronUp, SoapDispenserDroplet,
  LayoutPanelTop, SprayCan, Droplets, Thermometer, Archive, Dices,
  Refrigerator, FlameKindling, BriefcaseMedical, Info, Users,
} from "lucide-react";

axios.defaults.withCredentials = true;

const fieldClass =
  "w-full rounded-xl border border-indigo-200 bg-white px-3 py-2.5 text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200";

//  Tooltip content 
const FIELD_INFO = {
  propertyType: "Select the category that best describes your property. Residential covers homes, apartments, and rooms. Commercial is for offices, shops, or warehouses. Land/Plot is for undeveloped land.",
  listingType: "Choose how you want to list your property. Rent means tenants pay monthly. Sale means you are selling the property outright.",
  images: "Upload up to 10 clear photos of your property. Good lighting and wide-angle shots improve your chances of getting booked. Accepted formats: JPG, PNG, WEBP.",
  contact: "Your phone number will be shown to interested renters so they can call or WhatsApp you directly. Select your country dial code first.",
  amount: "Set the price in Indonesian Rupiah (Rp). For rent listings this is the monthly rate. For sale listings this is the asking price. Use numbers only — dots are added automatically.",
  amenities: "Select all facilities available at your property. These are displayed as icons on the listing detail page and help renters filter by what they need.",
  maxGuests: "Set the maximum number of guests your property can accommodate. This is shown on the listing and used as a filter when renters search by group size.",
  additionalInfo: "Select amenities your property offers — these appear as icons on the detail page. Then add any free-text notes renters should know: move-in date, parking rules, pet policy, nearby landmarks, house rules, etc.",
};

//  InfoTooltip 
const InfoTooltip = ({ infoKey }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex items-center">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="ml-1.5 inline-flex items-center justify-center rounded-full text-indigo-300 transition hover:text-indigo-500 focus:outline-none"
        aria-label="More information">
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-xl border border-indigo-100 bg-white p-3 text-xs leading-relaxed text-slate-600 shadow-[0_4px_20px_rgba(99,102,241,0.15)]" role="tooltip">
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-white drop-shadow-sm" />
          <span className="absolute left-1/2 top-full -translate-x-1/2 mt-px border-4 border-transparent border-t-indigo-100" />
          {FIELD_INFO[infoKey]}
        </div>
      )}
    </span>
  );
};

const labelClass = "mb-2 flex items-center text-sm font-medium text-slate-600";
const FieldLabel = ({ children, infoKey, optional = false }) => (
  <label className={labelClass}>
    {children}
    {optional && <span className="ml-1 text-xs font-normal text-slate-400">optional</span>}
    <InfoTooltip infoKey={infoKey} />
  </label>
);

//  Amenities 
const AMENITIES = [
  { label: "Kitchen",                  Icon: Utensils             },
  { label: "Wifi",                     Icon: Wifi                 },
  { label: "Dedicated workspace",      Icon: BuildingIcon         },
  { label: "Free parking on premises", Icon: ParkingSquare        },
  { label: "Pool",                     Icon: Waves                },
  { label: "TV",                       Icon: Tv                   },
  { label: "Air conditioning",         Icon: AirVent              },
  { label: "Patio or balcony",         Icon: LayoutPanelTop       },
  { label: "Backyard",                 Icon: Trees                },
  { label: "Hair dryer",               Icon: Wind                 },
  { label: "Cleaning products",        Icon: SprayCan             },
  { label: "Body soap",                Icon: Droplets             },
  { label: "Shampoo",                  Icon: SoapDispenserDroplet },
  { label: "Hot water",                Icon: Thermometer          },
  { label: "Drying rack for clothing", Icon: Wind                 },
  { label: "Clothing storage",         Icon: Archive              },
  { label: "Board games",              Icon: Dices                },
  { label: "Refrigerator",             Icon: Refrigerator         },
  { label: "Fire extinguisher",        Icon: FlameKindling        },
  { label: "First aid kit",            Icon: BriefcaseMedical     },
];

function parseSelectedAmenities(text) {
  return AMENITIES.filter(({ label }) => text.includes(label)).map(({ label }) => label);
}
function escapeRegex(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function toggleAmenityInText(currentText, label) {
  if (currentText.includes(label)) {
    let updated = currentText
      .replace(new RegExp(`,?\\s*${escapeRegex(label)}\\s*,?`, "g"), (match) => {
        if (match.startsWith(",") && match.endsWith(",")) return ",";
        return "";
      }).trim().replace(/^,\s*/, "").replace(/,\s*$/, "").trim();
    return updated;
  }
  const base = currentText.trim();
  return base ? `${base}, ${label}` : label;
}

//  Max guests options 
const GUEST_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

//  Main component
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
  const [maxGuests, setMaxGuests] = useState(2);
  const [addressCity, setAddressCity] = useState("");
  const [addressDistrict, setAddressDistrict] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressPostalCode, setAddressPostalCode] = useState("");
  const [contactDialCode, setContactDialCode] = useState(DEFAULT_DIAL_CODE);
  const [contactNumber, setContactNumber] = useState("");
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const selectedAmenities = parseSelectedAmenities(propertyDetails.additionalInfo);

  const handleImageChange = (e) => setImage(e.target.files);
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

    // Store max guest capacity inside the additionalInfo text, instead of
    // creating a dedicated schema field. This keeps the DB unchanged while
    // still giving us a structured, parseable pattern.
    const baseAdditional = String(propertyDetails.additionalInfo ?? "").trim();
    const capacityLine =
      maxGuests && Number.isFinite(maxGuests)
        ? `Max guests: ${maxGuests}`
        : "";
    const combinedAdditionalInfo =
      capacityLine && baseAdditional
        ? `${baseAdditional}\n${capacityLine}`
        : capacityLine || baseAdditional;

    const formData = new FormData();
    formData.append("propertyType", propertyDetails.propertyType);
    formData.append("propertyAdType", propertyDetails.propertyAdType);
    formData.append("propertyAddress", buildPropertyAddress({
      city: addressCity, district: addressDistrict,
      streetAddress: addressStreet, postalCode: addressPostalCode,
    }));
    formData.append("ownerContact", buildOwnerContact(contactDialCode, contactNumber));
    formData.append("propertyAmt", propertyDetails.propertyAmt);
    formData.append("additionalInfo", combinedAdditionalInfo);
    formData.append("amenities", JSON.stringify(selectedAmenities));

    const files = fileInputRef.current?.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) formData.append("propertyImages", files[i]);
    }

    setSubmitting(true);
    try {
      const res = await axios.post("http://localhost:8001/api/owner/postproperty", formData, { withCredentials: true });
      if (res.data.success) {
        message.success(res.data.message);
        setPropertyDetails({ propertyType: "residential", propertyAdType: "rent", ownerContact: "", propertyAmt: 0, additionalInfo: "" });
        setMaxGuests(2);
        setAddressCity(""); setAddressDistrict(""); setAddressStreet(""); setAddressPostalCode("");
        setContactDialCode(DEFAULT_DIAL_CODE); setContactNumber("");
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        message.error(res.data.message || "Unauthorized access");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error adding property:", error);
      if (error.response?.status === 401) { message.error("Session expired, please login again"); navigate("/login"); }
      else message.error("Failed to add property");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="mb-2 text-center text-xl font-bold text-indigo-700 sm:text-2xl md:text-3xl">Add a new listing</h2>
      <p className="mb-6 text-center text-xs text-slate-500 sm:mb-8 sm:text-sm">Fill in the details below to publish your property.</p>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">

        {/*  Property type + Listing type  */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <div>
            <FieldLabel infoKey="propertyType">Property type</FieldLabel>
            <select name="propertyType" value={propertyDetails.propertyType} onChange={handleChange} className={fieldClass}>
              <option disabled>Choose...</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="land/plot">Land/Plot</option>
            </select>
          </div>
          <div>
            <FieldLabel infoKey="listingType">Listing type</FieldLabel>
            <select name="propertyAdType" value={propertyDetails.propertyAdType} onChange={handleChange} className={fieldClass}>
              <option disabled>Choose...</option>
              <option value="rent">Rent</option>
              <option value="sale">Sale</option>
            </select>
          </div>
        </div>

        {/*  Location  */}
        <div>
          <IndonesiaPropertyAddressFields
            city={addressCity} district={addressDistrict}
            streetAddress={addressStreet} postalCode={addressPostalCode}
            onCityChange={setAddressCity} onDistrictChange={setAddressDistrict}
            onStreetAddressChange={setAddressStreet} onPostalCodeChange={setAddressPostalCode}
          />
        </div>

        {/*  Images  Contact  Amount  */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          <div>
            <FieldLabel infoKey="images">Property images</FieldLabel>
            <input ref={fileInputRef} type="file" accept="image/*" multiple required onChange={handleImageChange}
              className={`${fieldClass} cursor-pointer file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-indigo-300 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-indigo-900 hover:file:bg-indigo-400`} />
          </div>
          <div>
            <FieldLabel infoKey="contact">Your contact number</FieldLabel>
            <OwnerContactInput
              dialCode={contactDialCode} nationalNumber={contactNumber}
              onDialCodeChange={setContactDialCode} onNationalNumberChange={setContactNumber}
              numberPlaceholder="8123456789" required />
          </div>
          <div>
            <FieldLabel infoKey="amount">Amount (Rp)</FieldLabel>
            <input type="text" inputMode="numeric" name="propertyAmt"
              value={propertyDetails.propertyAmt ? formatPropertyAmount(propertyDetails.propertyAmt) : ""}
              onChange={handleAmountChange} placeholder="e.g. 100.000" required className={fieldClass} />
          </div>
        </div>

        {/*  Additional details  */}
        <div>
          <FieldLabel infoKey="additionalInfo" optional>Additional details</FieldLabel>

          {/* Amenities  max guests  same row, aligned controls */}
          <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <FieldLabel >
                Amenities
              </FieldLabel>
              <button
                type="button"
                onClick={() => setAmenitiesOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-xl border border-indigo-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm transition hover:border-indigo-400 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <span className="truncate font-medium">
                  {selectedAmenities.length > 0
                    ? `${selectedAmenities.length} amenit${selectedAmenities.length === 1 ? "y" : "ies"} selected`
                    : "Select amenities"}
                </span>
                {amenitiesOpen ? (
                  <ChevronUp className="ml-2 h-4 w-4 shrink-0 text-indigo-400" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-indigo-400" />
                )}
              </button>
            </div>

            <div className="w-full shrink-0 sm:w-36">
              <FieldLabel infoKey="maxGuests">
                <Users className="h-3.5 w-3.5 text-slate-500" />
                Max guests
              </FieldLabel>
              <select
                value={maxGuests}
                onChange={(e) => setMaxGuests(Number(e.target.value))}
                className={fieldClass}
                title="Maximum guests"
              >
                {GUEST_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} guest{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amenities panel */}
          {amenitiesOpen && (
            <div className="mb-2 rounded-xl border border-indigo-200 bg-white p-3 shadow-md">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {AMENITIES.map(({ label, Icon }) => {
                  const active = selectedAmenities.includes(label);
                  return (
                    <button key={label} type="button" onClick={() => handleAmenityToggle(label)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition
                        ${active ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"}`}>
                      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-indigo-500" : "text-slate-400"}`} />
                      <span className="truncate leading-tight">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Free-text notes */}
          <textarea name="additionalInfo" value={propertyDetails.additionalInfo} onChange={handleChange}
            rows={4} placeholder="Amenities, move-in date, parking, pets, etc." className={fieldClass} />
        </div>

        <div className="flex justify-end border-t border-indigo-100 pt-4 sm:pt-6">
          <button type="submit" disabled={isAdmin || submitting}
            title={isAdmin ? "Admins cannot publish listings" : submitting ? "Uploading…" : undefined}
            className="w-full rounded-xl bg-indigo-400 px-8 py-3 font-semibold text-white shadow-md transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:py-2.5">
            {submitting ? "Publishing…" : "Publish listing"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProperty;
