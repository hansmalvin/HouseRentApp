import { INDONESIA_CITIES } from "./indonesiaCities";

const citiesByLength = [...INDONESIA_CITIES].sort((a, b) => b.length - a.length);

function findCityInPart(part) {
  const normalized = String(part ?? "").trim().toLowerCase();
  if (!normalized) return null;
  return (
    citiesByLength.find((city) => city.toLowerCase() === normalized) ?? null
  );
}

/** Combine Indonesia address fields into a single propertyAddress string. */
export function buildPropertyAddress({
  streetAddress,
  district,
  city,
  postalCode,
}) {
  const parts = [];
  const street = String(streetAddress ?? "").trim();
  const dist = String(district ?? "").trim();
  const kota = String(city ?? "").trim();
  const zip = String(postalCode ?? "").replace(/\D/g, "");

  if (street) parts.push(street);
  if (dist) parts.push(dist);
  if (kota) parts.push(kota);
  if (zip) parts.push(zip);

  return parts.join(", ");
}

/** Split a stored propertyAddress back into form fields (best effort). */
export function parsePropertyAddress(propertyAddress) {
  const empty = {
    city: "",
    streetAddress: "",
    district: "",
    postalCode: "",
  };

  const raw = String(propertyAddress ?? "").trim();
  if (!raw) return empty;

  let parts = raw.split(",").map((s) => s.trim()).filter(Boolean);

  let postalCode = "";
  const last = parts[parts.length - 1];
  if (/^\d{5}$/.test(last)) {
    postalCode = last;
    parts = parts.slice(0, -1);
  }

  if (parts.length === 0) {
    return { ...empty, streetAddress: raw, postalCode };
  }

  const cityFromEnd = findCityInPart(parts[parts.length - 1]);
  if (cityFromEnd) {
    parts.pop();
    let district = "";
    let streetAddress = "";

    if (parts.length >= 2) {
      district = parts[parts.length - 1];
      streetAddress = parts.slice(0, -1).join(", ");
    } else if (parts.length === 1) {
      streetAddress = parts[0];
    }

    return {
      city: cityFromEnd,
      streetAddress,
      district,
      postalCode,
    };
  }

  for (let i = parts.length - 1; i >= 0; i -= 1) {
    const matched = findCityInPart(parts[i]);
    if (matched) {
      const before = parts.slice(0, i);
      let district = "";
      let streetAddress = "";

      if (before.length >= 2) {
        district = before[before.length - 1];
        streetAddress = before.slice(0, -1).join(", ");
      } else if (before.length === 1) {
        streetAddress = before[0];
      }

      return {
        city: matched,
        streetAddress,
        district,
        postalCode,
      };
    }
  }

  return { ...empty, streetAddress: raw, postalCode };
}
