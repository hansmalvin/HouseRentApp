import { message } from "antd";
import React, { useState, useEffect, useCallback, useRef } from "react";
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
import {
  Utensils, Wifi, Waves, AirVent, Trees, ParkingSquare, Tv,
  BuildingIcon, Wind, ChevronDown, ChevronUp, SoapDispenserDroplet,
  LayoutPanelTop, SprayCan, Droplets, Thermometer, Archive, Dices,
  Refrigerator, FlameKindling, BriefcaseMedical, Users, X,
} from "lucide-react";

// ─── Amenities config (mirrors AddProperty.jsx) ───────────────────────────────
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

const GUEST_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

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

const OwnerAllProperties = ({ isAdmin = false }) => {
  const fileInputRef = useRef(null);
  const [search, setSearch] = useState("");
  const [filterAvailable, setFilterAvailable] = useState("Available");
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [editingPropertyData, setEditingPropertyData] = useState({
    propertyType: "",
    propertyAdType: "",
    propertyAddress: "",
    ownerContact: "",
    propertyAmt: 0,
    additionalInfo: "",
    amenities: [],
  });
  // new images chosen by owner (File objects)
  const [newImages, setNewImages] = useState([]);
  // preview URLs for newly chosen images
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  // selected amenities array
  const [editAmenities, setEditAmenities] = useState([]);
  // amenities dropdown open
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  // max guests
  const [editMaxGuests, setEditMaxGuests] = useState(2);

  const [allProperties, setAllProperties] = useState([]);
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
    setNewImages([]);
    setNewImagePreviews([]);
    setEditDialCode(DEFAULT_DIAL_CODE);
    setEditContactNumber("");
    setEditAddressCity("");
    setEditAddressDistrict("");
    setEditAddressStreet("");
    setEditAddressPostalCode("");
    setEditAmenities([]);
    setAmenitiesOpen(false);
    setEditMaxGuests(2);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // Parse maxGuests out of additionalInfo (same pattern as AddProperty stores it)
  function parseMaxGuests(additionalInfo) {
    if (!additionalInfo) return 2;
    const match = String(additionalInfo).match(/Max guests:\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : 2;
  }

  // Strip the "Max guests: N" line from additionalInfo for the textarea
  function stripMaxGuests(additionalInfo) {
    if (!additionalInfo) return "";
    return String(additionalInfo)
      .replace(/\n?Max guests:\s*\d+/gi, "")
      .trim();
  }

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
    // Populate amenities from the stored array field
    setEditAmenities(Array.isArray(property.amenities) ? property.amenities : []);
    // Parse maxGuests from additionalInfo
    setEditMaxGuests(parseMaxGuests(property.additionalInfo));
    // Strip maxGuests line from the textarea value
    setEditingPropertyData((prev) => ({
      ...prev,
      ...property,
      additionalInfo: stripMaxGuests(property.additionalInfo),
    }));
    setNewImages([]);
    setNewImagePreviews([]);
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

  useEffect(() => { getAllProperty(); }, []);

  useEffect(() => {
    if (!show) return;
    const onKey = (e) => { if (e.key === "Escape") handleClose(); };
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
    const files = Array.from(e.target.files);
    setNewImages(files);
    setNewImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingPropertyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmountChange = (e) => {
    const propertyAmt = parsePropertyAmountInput(e.target.value);
    setEditingPropertyData((prev) => ({ ...prev, propertyAmt }));
  };

  const handleAmenityToggle = (label) => {
    setEditAmenities((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    );
    // Also keep additionalInfo text in sync (for legacy parsing)
    setEditingPropertyData((prev) => ({
      ...prev,
      additionalInfo: toggleAmenityInText(prev.additionalInfo, label),
    }));
  };

  const getPropertyImagePath = (property) => {
    if (!property?.propertyImages?.length) return "";
    return property.propertyImages[0].url;
  };

  const saveChanges = async (propertyId, status) => {
    setSubmitting(true);
    try {
      // Rebuild additionalInfo: strip amenity labels + old maxGuests, then re-append
      const knownLabels = AMENITIES.map((a) => a.label);
      const baseNotes = (editingPropertyData.additionalInfo || "")
        .split(",").map((s) => s.trim())
        .filter((s) => s && !knownLabels.includes(s))
        .join(", ")
        .trim();

      const capacityLine = `Max guests: ${editMaxGuests}`;
      const combinedAdditionalInfo = baseNotes
        ? `${baseNotes}\n${capacityLine}`
        : capacityLine;

      const formData = new FormData();
      formData.append("propertyType", editingPropertyData.propertyType);
      formData.append("propertyAdType", editingPropertyData.propertyAdType);
      formData.append("propertyAddress", buildPropertyAddress({
        city: editAddressCity,
        district: editAddressDistrict,
        streetAddress: editAddressStreet,
        postalCode: editAddressPostalCode,
      }));
      formData.append("ownerContact", buildOwnerContact(editDialCode, editContactNumber));
      formData.append("propertyAmt", editingPropertyData.propertyAmt ?? 0);
      formData.append("additionalInfo", combinedAdditionalInfo);
      formData.append("amenities", JSON.stringify(editAmenities));
      formData.append("maxGuests", editMaxGuests);
      formData.append("isAvailable", status);

      // Only append images if owner chose new ones — server deletes old Cloudinary images and replaces
      if (newImages.length > 0) {
        for (let i = 0; i < newImages.length; i++) {
          formData.append("propertyImages", newImages[i]);
        }
      }

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
    } finally {
      setSubmitting(false);
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

  const displayedProperties = allProperties.filter((p) => {
    const matchesSearch =
      !search ||
      [p.propertyType, p.propertyAdType, p.propertyAddress, p._id, p.ownerContact, String(p.propertyAmt ?? "")]
        .filter(Boolean).join(" ").toLowerCase()
        .includes(search.toLowerCase());
    const matchesAvail = !filterAvailable || p.isAvailable === filterAvailable;
    return matchesSearch && matchesAvail;
  });

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-indigo-700 sm:text-xl">Your listings</h2>
      <p className="mb-4 text-xs text-slate-500 sm:mb-6 sm:text-sm">
        Edit or remove properties you have published. Availability updates when you save changes.
      </p>

      <div className="mb-4 flex gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by type, address, ID…"
          className="min-w-0 flex-[85] rounded-xl border border-indigo-200/90 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:px-4 sm:py-2.5"
        />
        <button
          type="button"
          onClick={() => setFilterAvailable((prev) => prev === "Available" ? "Unavailable" : "Available")}
          className={`flex-[15] rounded-xl border px-2 py-2 text-xs font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:px-3 sm:py-2.5 sm:text-sm ${
            filterAvailable === "Available"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              : "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100"
          }`}
        >
          {filterAvailable === "Available" ? "Available" : "Unavail."}
        </button>
      </div>

      <div className={`overflow-x-auto rounded-2xl border border-indigo-100 bg-white shadow-sm transition-[min-height] duration-300 ease-out ${show ? "min-h-[min(100dvh,34rem)]" : ""}`}>
        <table className="w-max min-w-full text-left text-sm text-slate-700">
          <thead className="bg-indigo-100/90 text-indigo-900">
            <tr>
              <th className="px-3 py-2.5 text-center sm:px-4 sm:py-3">Property Type</th>
              <th className="px-3 py-2.5 text-center sm:px-4 sm:py-3">Ad Type</th>
              <th className="px-3 py-2.5 text-center sm:px-4 sm:py-3">Address</th>
              <th className="px-3 py-2.5 text-center sm:px-4 sm:py-3">Owner Contact</th>
              <th className="px-3 py-2.5 text-center sm:px-4 sm:py-3">Amount</th>
              <th className="px-3 py-2.5 text-center sm:px-4 sm:py-3">Availability</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-center sm:px-4 sm:py-3">Property ID</th>
              <th className="px-3 py-2.5 text-center sm:px-4 sm:py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedProperties.map((property) => (
              <tr key={property._id} className="border-t border-indigo-50 transition duration-200 even:bg-indigo-50/30 hover:bg-sky-50/50">
                <td className="px-3 py-2.5 text-center sm:px-4 sm:py-3">{property.propertyType}</td>
                <td className="px-3 py-2.5 text-center sm:px-4 sm:py-3">{property.propertyAdType}</td>
                <td className="max-w-[10rem] px-3 py-2.5 text-center sm:max-w-xs sm:px-4 sm:py-3">{property.propertyAddress}</td>
                <td className="px-3 py-2.5 text-center sm:px-4 sm:py-3">{formatOwnerContactDisplay(property.ownerContact)}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-center sm:px-4 sm:py-3">Rp {formatPropertyAmount(property.propertyAmt)}</td>
                <td className={`px-3 py-2.5 text-center font-semibold sm:px-4 sm:py-3 ${property.isAvailable === "Available" ? "text-emerald-600" : "text-rose-600"}`}>
                  {property.isAvailable}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-slate-500 sm:px-4 sm:py-3">{property._id}</td>
                <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                  <div className="flex gap-1.5 justify-center sm:gap-2">
                    <button type="button" onClick={() => handleShow(property)} disabled={isAdmin}
                      title={isAdmin ? "Admins cannot edit listings" : undefined}
                      className="rounded-lg border border-indigo-300 bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-sm">
                      Edit
                    </button>
                    <button type="button" onClick={() => openDeleteModal(property)} disabled={isAdmin}
                      title={isAdmin ? "Admins cannot delete listings" : undefined}
                      className="rounded-lg border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-sm">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Edit modal ── */}
      {show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-indigo-900/20 p-2 backdrop-blur-sm sm:p-4"
          onClick={handleClose}
          role="presentation"
        >
          <div
            role="dialog"
            aria-labelledby="edit-property-title"
            className="my-4 flex h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] w-full max-w-6xl min-h-0 flex-col overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-2xl sm:my-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative shrink-0 border-b border-indigo-100 bg-indigo-50/80 px-6 py-4 pr-12 sm:px-8">
              <span className="mb-1.5 inline-flex items-center rounded-full bg-indigo-200/80 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-800">
                Edit listing
              </span>
              <h3 id="edit-property-title" className="text-xl font-bold tracking-tight text-indigo-800 sm:text-2xl">
                Edit property
              </h3>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-500">
                Update details below. Images, amenities and guest capacity are fully editable.
              </p>
              <button type="button" onClick={handleClose}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-200 bg-white text-slate-500 transition hover:bg-indigo-100 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                aria-label="Close">
                <span className="text-lg leading-none" aria-hidden>×</span>
              </button>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); saveChanges(editingPropertyId, editingPropertyData.isAvailable); }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-white to-indigo-50/40 px-6 py-4 sm:px-8">

                {/* Property type */}
                <div className="rounded-xl border border-indigo-100 border-l-4 border-l-indigo-400 bg-indigo-50/50 p-4 shadow-sm">
                  <label className="text-sm font-semibold text-slate-700">Property type</label>
                  <select name="propertyType" value={editingPropertyData.propertyType || "residential"} onChange={handleChange} className={editFieldClass}>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="land/plot">Land/Plot</option>
                  </select>
                </div>

                {/* Listing type */}
                <div className="rounded-xl border border-indigo-100 border-l-4 border-l-sky-400 bg-sky-50/50 p-4 shadow-sm">
                  <label className="text-sm font-semibold text-slate-700">Listing type</label>
                  <select name="propertyAdType" value={editingPropertyData.propertyAdType || "rent"} onChange={handleChange} className={editFieldClass}>
                    <option value="rent">Rent</option>
                    <option value="sale">Sale</option>
                  </select>
                </div>

                {/* Address */}
                <div className="rounded-xl border border-indigo-100 border-l-4 border-l-rose-300 bg-rose-50/40 p-4 shadow-sm">
                  <IndonesiaPropertyAddressFields
                    city={editAddressCity} district={editAddressDistrict}
                    streetAddress={editAddressStreet} postalCode={editAddressPostalCode}
                    onCityChange={setEditAddressCity} onDistrictChange={setEditAddressDistrict}
                    onStreetAddressChange={setEditAddressStreet} onPostalCodeChange={setEditAddressPostalCode}
                    cityId="edit-property-city" districtId="edit-property-district"
                    streetId="edit-property-street" postalId="edit-property-postal"
                  />
                </div>

                {/* Contact */}
                <div className="rounded-xl border border-indigo-100 border-l-4 border-l-rose-300 bg-rose-50/40 p-4 shadow-sm">
                  <label className="text-sm font-semibold text-slate-700">Owner contact</label>
                  <OwnerContactInput
                    dialId="edit-ownerContact-dial" numberId="edit-ownerContact"
                    dialCode={editDialCode} nationalNumber={editContactNumber}
                    onDialCodeChange={setEditDialCode} onNationalNumberChange={setEditContactNumber}
                    numberPlaceholder="81799987778" className="mt-2"
                  />
                </div>

                {/* Amount */}
                <div className="rounded-xl border border-indigo-100 border-l-4 border-l-emerald-300 bg-emerald-50/40 p-4 shadow-sm">
                  <label htmlFor="edit-propertyAmt" className="text-sm font-semibold text-slate-700">Amount (Rp)</label>
                  <input id="edit-propertyAmt" type="text" inputMode="numeric" name="propertyAmt"
                    value={editingPropertyData.propertyAmt ? formatPropertyAmount(editingPropertyData.propertyAmt) : ""}
                    onChange={handleAmountChange} placeholder="e.g. 100.000" className={editFieldClass} />
                </div>

                {/* ── Amenities + Max guests ── */}
                <div className="rounded-xl border border-indigo-100 border-l-4 border-l-violet-400 bg-violet-50/40 p-4 shadow-sm space-y-3">
                  <p className="text-sm font-semibold text-slate-700">Amenities &amp; capacity</p>

                  <div className="flex flex-row items-end gap-3">
                    {/* Amenities dropdown trigger */}
                    <div className="min-w-0 flex-1">
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">Amenities</label>
                      <button
                        type="button"
                        onClick={() => setAmenitiesOpen((v) => !v)}
                        className="flex w-full items-center justify-between rounded-xl border border-indigo-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm transition hover:border-indigo-400 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      >
                        <span className="truncate font-medium">
                          {editAmenities.length > 0
                            ? `${editAmenities.length} amenit${editAmenities.length === 1 ? "y" : "ies"} selected`
                            : "Select amenities"}
                        </span>
                        {amenitiesOpen
                          ? <ChevronUp className="ml-2 h-4 w-4 shrink-0 text-indigo-400" />
                          : <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-indigo-400" />}
                      </button>
                    </div>

                    {/* Max guests */}
                    <div className="w-32 shrink-0 sm:w-36">
                      <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-slate-500">
                        <Users className="h-3.5 w-3.5" />Max guests
                      </label>
                      <select value={editMaxGuests} onChange={(e) => setEditMaxGuests(Number(e.target.value))} className={editFieldClass}>
                        {GUEST_OPTIONS.map((n) => (
                          <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Amenities panel */}
                  {amenitiesOpen && (
                    <div className="rounded-xl border border-indigo-200 bg-white p-3 shadow-md">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                        {AMENITIES.map(({ label, Icon }) => {
                          const active = editAmenities.includes(label);
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
                </div>

                {/* Additional notes (free text only, no amenity labels) */}
                <div className="rounded-xl border border-indigo-100 border-l-4 border-l-blue-400 bg-blue-50/50 p-4 shadow-sm">
                  <label htmlFor="edit-additionalInfo" className="text-sm font-semibold text-slate-700">Additional notes</label>
                  <p className="mt-0.5 text-xs text-slate-400">Free-text notes only — amenities are managed above.</p>
                  <textarea id="edit-additionalInfo" name="additionalInfo"
                    value={editingPropertyData.additionalInfo} onChange={handleChange}
                    rows={3} placeholder="Move-in date, parking rules, pet policy, nearby landmarks…"
                    className={`${editFieldClass} min-h-[5rem] resize-y`} />
                </div>

                {/* ── Property images ── */}
                <div className="rounded-xl border border-indigo-100 border-l-4 border-l-sky-400 bg-sky-50/50 p-4 shadow-sm">
                  <label className="text-sm font-semibold text-slate-700">Property images</label>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Choose new images to <span className="font-semibold text-rose-500">replace all existing ones</span>. Leave empty to keep current images.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className={`${editFieldClass} cursor-pointer border-dashed file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-indigo-300 file:px-3.5 file:py-2 file:text-sm file:font-semibold file:text-indigo-900 hover:file:bg-indigo-400`}
                  />

                  {/* New image previews */}
                  {newImagePreviews.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
                        New images ({newImagePreviews.length}) — will replace existing
                      </p>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                        {newImagePreviews.map((src, i) => (
                          <div key={i} className="relative group">
                            <img src={src} alt={`New ${i + 1}`}
                              className="h-20 w-full rounded-lg border border-indigo-200 object-cover shadow-sm" />
                            <button type="button"
                              onClick={() => {
                                const updated = newImages.filter((_, j) => j !== i);
                                setNewImages(updated);
                                setNewImagePreviews(updated.map((f) => URL.createObjectURL(f)));
                                // Also update file input by resetting (can't set FileList directly)
                                if (updated.length === 0 && fileInputRef.current) fileInputRef.current.value = "";
                              }}
                              className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition shadow-md">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Current images (shown only when no new ones chosen) */}
                  {newImagePreviews.length === 0 && editingPropertyData?.propertyImages?.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Current images ({editingPropertyData.propertyImages.length})
                      </p>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                        {editingPropertyData.propertyImages.map((img, i) => (
                          <img key={i} src={img.url} alt={`Current ${i + 1}`}
                            className="h-20 w-full rounded-lg border border-indigo-200 object-cover shadow-sm" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Sticky footer */}
              <div className="shrink-0 rounded-b-2xl border-t border-indigo-100 bg-indigo-50/80 px-6 py-4 sm:px-10">
                <div className="flex flex-row flex-nowrap items-center justify-end gap-3">
                  <button type="button" onClick={handleClose}
                    className="min-w-[6.5rem] shrink-0 rounded-xl border border-indigo-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-indigo-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="min-w-[6.5rem] shrink-0 rounded-xl bg-indigo-400 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    {submitting ? "Saving…" : "Save changes"}
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
