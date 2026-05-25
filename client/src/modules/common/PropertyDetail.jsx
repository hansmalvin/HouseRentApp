import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeftIcon,
  HeartIcon,
  ShareIcon,
//   StarIcon,
  PhoneIcon,
  MapPinIcon,
  HomeIcon,
  TagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import {
  Utensils, Wifi, Waves, AirVent, Trees, ParkingSquare, Tv,
  BuildingIcon, Wind, SprayCan, Droplets, Thermometer,
  Archive, Dices, Refrigerator, FlameKindling, BriefcaseMedical,
  LayoutPanelTop,SoapDispenserDroplet,
} from "lucide-react";
import { formatPropertyAmount } from "../../utils/propertyFormat";
import { parsePropertyAddress } from "../../utils/propertyAddress";
import { UserContext } from "../../App";
import RentEaseLogo from "../../components/RentEaseLogo";

// ── Amenity icon map ────────────────────────────────────────────────
const AMENITY_ICONS = {
  "Kitchen": Utensils,
  "Wifi": Wifi,
  "Dedicated workspace": BuildingIcon,
  "Free parking on premises": ParkingSquare,
  "Pool": Waves,
  "TV": Tv,
  "Air conditioning": AirVent,
  "Patio or balcony": LayoutPanelTop,
  "Backyard": Trees,
  "Hair dryer": Wind,
  "Cleaning products": SprayCan,
  "Body soap": Droplets,
  "Shampoo":SoapDispenserDroplet,
  "Hot water": Thermometer,
  "Drying rack for clothing": Wind,
  "Clothing storage": Archive,
  "Board games": Dices,
  "Refrigerator": Refrigerator,
  "Fire extinguisher": FlameKindling,
  "First aid kit": BriefcaseMedical,
};

// ── Helpers ─────────────────────────────────────────────────────────
function getPageTitle(property) {
  const { district, city } = parsePropertyAddress(property.propertyAddress);
  const area = district || city || "Indonesia";
  const type = property.propertyType
    ? property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)
    : "Property";
  return `${type} in ${area}`;
}

function getPriceLabel(property) {
  const amount = formatPropertyAmount(property.propertyAmt);
  const unit = String(property.propertyAdType).toLowerCase() === "rent" ? "month" : "listing";
  return { amount: `Rp${amount}`, unit };
}

// Split additionalInfo into amenity tags vs free-text notes
function parseAdditionalInfo(property) {
  const amenities = Array.isArray(property.amenities) ? property.amenities : [];
  const knownLabels = Object.keys(AMENITY_ICONS);

  if (amenities.length > 0) {
    // Use structured amenities array
    const text = (property.additionalInfo || "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !knownLabels.includes(s))
      .join(", ");
    return { amenities, notes: text };
  }

  // Fallback: parse from additionalInfo string
  const parts = (property.additionalInfo || "").split(",").map((s) => s.trim()).filter(Boolean);
  const foundAmenities = parts.filter((p) => knownLabels.includes(p));
  const notes = parts.filter((p) => !knownLabels.includes(p)).join(", ");
  return { amenities: foundAmenities, notes };
}

// ── Image Gallery ────────────────────────────────────────────────────
const ImageGallery = ({ images, title }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prev = () => setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setLightboxIndex((i) => (i + 1) % images.length);

  if (!images?.length) {
    return (
      <div className="h-[420px] w-full rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
        No images available
      </div>
    );
  }

  return (
    <>
      {/* Grid layout: 1 big + up to 4 small */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] rounded-2xl overflow-hidden">
        {/* Main large image */}
        <div
          className="col-span-2 row-span-2 cursor-pointer overflow-hidden"
          onClick={() => openLightbox(0)}
        >
          <img
            src={images[0].url}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        {/* Side images */}
        {images.slice(1, 5).map((img, i) => (
          <div
            key={i}
            className="col-span-1 row-span-1 cursor-pointer overflow-hidden relative"
            onClick={() => openLightbox(i + 1)}
          >
            <img
              src={img.url}
              alt={`${title} ${i + 2}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            {/* "Show all" overlay on last visible slot */}
            {i === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-sm font-semibold bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                  <span className="grid grid-cols-3 gap-0.5 w-4">
                    {[...Array(9)].map((_, k) => (
                      <span key={k} className="w-1 h-1 bg-white rounded-[1px]" />
                    ))}
                  </span>
                  Show all photos
                </span>
              </div>
            )}
          </div>
        ))}
        {/* Fill empty slots if fewer than 5 images */}
        {images.length < 5 &&
          Array.from({ length: 4 - Math.min(images.length - 1, 4) }).map((_, i) => (
            <div key={`empty-${i}`} className="col-span-1 row-span-1 bg-gray-100" />
          ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
            onClick={closeLightbox}
          >
            ✕
          </button>
          <button
            className="absolute left-4 text-white hover:text-gray-300 p-3 rounded-full bg-white/10 hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); prev(); }}
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <img
            src={images[lightboxIndex].url}
            alt={`${title} ${lightboxIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-4 text-white hover:text-gray-300 p-3 rounded-full bg-white/10 hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); next(); }}
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
          <span className="absolute bottom-4 text-white/60 text-sm">
            {lightboxIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
};

// ── Main Component ───────────────────────────────────────────────────
const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useContext(UserContext);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8001/api/user/property/${id}`,
          { withCredentials: true }
        );
        if (res.data.success) {
          setProperty(res.data.data);
        } else {
          setError("Property not found.");
        }
      } catch {
        setError("Failed to load property.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Loading property…</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">{error || "Property not found."}</p>
        <button
          onClick={() => navigate("/")}
          className="text-indigo-600 underline text-sm"
        >
          Back to home
        </button>
      </div>
    );
  }

  const title = getPageTitle(property);
  const { amount, unit } = getPriceLabel(property);
  const { amenities, notes } = parseAdditionalInfo(property);
  const { city, district, streetAddress } = parsePropertyAddress(property.propertyAddress);
  const fullAddress = [streetAddress, district, city].filter(Boolean).join(", ");
  const isRent = String(property.propertyAdType).toLowerCase() === "rent";

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-4">
          <RentEaseLogo to="/" variant="light" size="md" />
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              <ShareIcon className="h-4 w-4" />
              Share
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              <HeartIcon className="h-4 w-4" />
              Save
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-8">
        {/* ── Back button + Title ── */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </button>

        <h1 className="mb-2 text-2xl font-semibold text-gray-900 md:text-3xl">{title}</h1>

        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <StarSolid className="h-4 w-4 text-yellow-400" />
            4.9
          </span>
          {fullAddress && (
            <span className="flex items-center gap-1">
              <MapPinIcon className="h-4 w-4" />
              {fullAddress}
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
              property.isAvailable === "Available"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {property.isAvailable || "Available"}
          </span>
        </div>

        {/* ── Image Gallery ── */}
        <div className="mb-10">
          <ImageGallery images={property.propertyImages} title={title} />
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
          {/* ── Left column ── */}
          <div className="space-y-8">
            {/* Property summary */}
            <div className="border-b border-gray-200 pb-8">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-lg font-semibold text-gray-900 capitalize">
                  {property.propertyType} · {property.propertyAdType}
                </span>
              </div>
              {property.ownerName && (
                <p className="text-gray-500 text-sm">Hosted by {property.ownerName}</p>
              )}
            </div>

            {/* Highlights */}
            <div className="border-b border-gray-200 pb-8 space-y-4">
              <div className="flex items-start gap-4">
                <HomeIcon className="h-6 w-6 text-gray-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Entire property</p>
                  <p className="text-sm text-gray-500">You'll have the whole place to yourself.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <TagIcon className="h-6 w-6 text-gray-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Great value</p>
                  <p className="text-sm text-gray-500">
                    {amount} per {unit} — competitively priced for this area.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPinIcon className="h-6 w-6 text-gray-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Great location</p>
                  <p className="text-sm text-gray-500">{fullAddress || "Indonesia"}</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="border-b border-gray-200 pb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  What this place offers
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {amenities.map((label) => {
                    const Icon = AMENITY_ICONS[label];
                    return (
                      <div key={label} className="flex items-center gap-3 text-sm text-gray-700">
                        {Icon ? (
                          <Icon className="h-5 w-5 text-gray-500 shrink-0" />
                        ) : (
                          <span className="h-5 w-5" />
                        )}
                        {label}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes / free-text additional info */}
            {notes && (
              <div className="border-b border-gray-200 pb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Additional details
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {notes}
                </p>
              </div>
            )}

            {/* Contact */}
            {property.ownerContact && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact owner</h2>
                <a
                  href={`tel:${property.ownerContact}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-900 hover:shadow-sm transition"
                >
                  <PhoneIcon className="h-4 w-4" />
                  {property.ownerContact}
                </a>
              </div>
            )}
          </div>

          {/* ── Right column — Booking card ── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-gray-200 p-6 shadow-xl space-y-5">
              {/* Price */}
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-2xl font-bold text-gray-900">{amount}</span>
                  <span className="text-gray-500 text-sm ml-1">per {unit}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <StarSolid className="h-4 w-4 text-yellow-400" />
                  4.9
                </div>
              </div>

              {/* Availability badge */}
              <div
                className={`rounded-xl px-4 py-2.5 text-sm font-medium text-center ${
                  property.isAvailable === "Available"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-600 border border-red-200"
                }`}
              >
                {property.isAvailable === "Available"
                  ? "✓ Available now"
                  : "Currently unavailable"}
              </div>

              {/* Type badges */}
              <div className="flex gap-2 flex-wrap">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 capitalize">
                  {property.propertyType}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 capitalize">
                  For {property.propertyAdType}
                </span>
              </div>

              {/* CTA */}
              {userData ? (
                property.isAvailable === "Available" ? (
                  <Link
                    to={`/renterhome`}
                    className="block w-full rounded-xl bg-indigo-500 px-6 py-3 text-center text-sm font-semibold text-white shadow-md hover:bg-indigo-600 transition"
                  >
                    Reserve
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full rounded-xl bg-gray-200 px-6 py-3 text-sm font-semibold text-gray-400 cursor-not-allowed"
                  >
                    Not available
                  </button>
                )
              ) : (
                <Link
                  to="/login"
                  className="block w-full rounded-xl bg-indigo-500 px-6 py-3 text-center text-sm font-semibold text-white shadow-md hover:bg-indigo-600 transition"
                >
                  Log in to book
                </Link>
              )}

              <p className="text-center text-xs text-gray-400">You won't be charged yet</p>

              {/* Price breakdown */}
              {isRent && (
                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>{amount} × 1 month</span>
                    <span>{amount}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-100 pt-2">
                    <span>Total</span>
                    <span>{amount}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Report */}
            <button className="mt-4 w-full text-center text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600">
              Report this listing
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetail;
