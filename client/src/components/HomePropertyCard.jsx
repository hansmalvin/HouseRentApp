import React from "react";
import { useNavigate } from "react-router-dom";
import { HeartIcon } from "@heroicons/react/24/outline";
import { formatPropertyAmount } from "../utils/propertyFormat";
import { parsePropertyAddress } from "../utils/propertyAddress";

function getPropertyImagePath(property) {
  if (!property?.propertyImages?.length) return "";
  return property.propertyImages[0].url;
}

function getCardTitle(property) {
  const { propertyType, propertyAdType } = property;
  const { district, city } = parsePropertyAddress(property.propertyAddress);
  const area = district || city;
  if (area && propertyType) {
    return `${propertyType} in ${area}`;
  }
  return property.propertyAddress || "Property";
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
      className="w-[280px] shrink-0 snap-start sm:w-[300px] cursor-pointer"
      onClick={() => navigate(`/rooms/${property._id}`)}
    >
      <div className="relative aspect-[20/19] overflow-hidden rounded-xl bg-gray-100">
        {imagePath ? (
          <img
            src={imagePath}
            alt={getCardTitle(property)}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200 text-sm text-gray-500">
            No image
          </div>
        )}
        {isAvailable && (
          <span className="absolute left-3 top-3 rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm">
            Guest favorite
          </span>
        )}
        <button
          type="button"
          className="absolute right-3 top-3 rounded-full p-1.5 text-white transition hover:scale-105"
          aria-label="Save property"
        >
          <HeartIcon className="h-6 w-6 drop-shadow-md" strokeWidth={1.5} />
        </button>
      </div>
      <div className="mt-3 space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-[15px] font-semibold text-gray-900">
            {getCardTitle(property)}
          </h3>
          <span className="shrink-0 text-sm text-gray-900" aria-hidden>
            ★ 4.9
          </span>
        </div>
        <p className="text-sm text-gray-500 capitalize">
          {property.propertyType} · {property.propertyAdType}
        </p>
        <p className="text-sm text-gray-900">
          <span className="font-semibold">{getPriceLabel(property)}</span>
        </p>
      </div>
    </article>
  );
};

export default HomePropertyCard;
