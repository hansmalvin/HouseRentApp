import React from "react";
import { useNavigate } from "react-router-dom";
import { HeartIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { formatPropertyAmount } from "../utils/propertyFormat";
import { parsePropertyAddress } from "../utils/propertyAddress";

function getPropertyImagePath(property) {
  if (!property?.propertyImages?.length) return "";
  return property.propertyImages[0].url;
}

function getCardTitle(property) {
  const { district, city } = parsePropertyAddress(property.propertyAddress);
  const area = district || city;
  const raw = area && property.propertyType
    ? `${property.propertyType} in ${area}`
    : property.propertyAddress || "Property";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function getPriceLabel(property) {
  const amount = formatPropertyAmount(property.propertyAmt);
  const unit =
    String(property.propertyAdType).toLowerCase() === "rent"
      ? "month"
      : "listing";
  return `Rp${amount} per ${unit}`;
}

const HomePropertyCard = ({ property }) => {
  const imagePath = getPropertyImagePath(property);
  const isAvailable = property.isAvailable === "Available";
  const navigate = useNavigate();

  return (
    <article
      // On mobile: slightly narrower cards so users can peek the next one (scroll hint).
      // On sm+: standard 300px fixed width.
      className="w-[240px] shrink-0 snap-start xs:w-[260px] sm:w-[300px] cursor-pointer"
      onClick={() => navigate(`/rooms/${property._id}`)}
    >
      {/* Image */}
      <div className="relative aspect-[20/19] overflow-hidden rounded-xl bg-gray-100">
        {imagePath ? (
          <img
            src={imagePath}
            alt={getCardTitle(property)}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200 text-sm text-gray-500">
            No image
          </div>
        )}

        {/* Badge */}
        {isAvailable && String(property.propertyAdType).toLowerCase() === "rent" && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm sm:left-3 sm:top-3">
            Guest favorite
          </span>
        )}
        {isAvailable && String(property.propertyAdType).toLowerCase() === "sale" && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm sm:left-3 sm:top-3">
            Top listing
          </span>
        )}

        {/* Wishlist */}
        <button
          type="button"
          className="absolute right-2.5 top-2.5 rounded-full p-1.5 text-white transition hover:scale-110 sm:right-3 sm:top-3"
          aria-label="Save property"
          onClick={(e) => e.stopPropagation()}
        >
          <HeartIcon className="h-5 w-5 drop-shadow-md sm:h-6 sm:w-6" strokeWidth={1.5} />
        </button>
      </div>

      {/* Info */}
      <div className="mt-2.5 space-y-0.5 sm:mt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-[14px] font-semibold text-gray-900 sm:text-[15px]">
            {getCardTitle(property)}
          </h3>
          <StarIcon className="h-4 w-4 shrink-0 text-yellow-400 mt-0.5" aria-hidden />
        </div>
        <p className="text-xs text-gray-500 capitalize sm:text-sm">
          {property.propertyType} · {property.propertyAdType}
        </p>
        <p className="text-xs text-gray-900 sm:text-sm">
          <span className="font-semibold">{getPriceLabel(property)}</span>
        </p>
      </div>
    </article>
  );
};

export default HomePropertyCard;
