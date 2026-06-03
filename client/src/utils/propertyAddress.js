import { INDONESIA_CITIES } from "./indonesiaCities";

const citiesByLength = [...INDONESIA_CITIES].sort((a, b) => b.length - a.length);

function findCityInPart(part) {
  const normalized = String(part ?? "").trim().toLowerCase();
  if (!normalized) return null;
  return (
    citiesByLength.find((city) => city.toLowerCase() === normalized) ?? null
  );
}

// Combine Indonesia address fields into a single propertyAddress string for efficiency.
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

// Split a stored propertyAddress back into form fields. 
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

// First comma-separated segment of propertyAddress (trimmed).
export function getFirstPartBeforeComma(propertyAddress) {
  const raw = String(propertyAddress ?? "").trim();
  if (!raw.includes(",")) return null;
  return raw.split(",")[0].trim() || null;
}

const cityLookup = new Set(INDONESIA_CITIES.map((c) => c.toLowerCase()));

function isKnownCity(name) {
  return cityLookup.has(String(name ?? "").trim().toLowerCase());
}

// Labels for home-page rows from propertyAddress (city, district, first segment).
export function getHomePropertyGroupLabels(property) {
  const address = String(property?.propertyAddress ?? "").trim();
  if (!address.includes(",")) {
    return { popular: null, stay: null, other: true };
  }

  const firstPart = getFirstPartBeforeComma(address);
  const { city, district } = parsePropertyAddress(address);

  let popularLabel = city || null;
  let stayLabel = district || null;

  if (!popularLabel && firstPart && isKnownCity(firstPart)) {
    popularLabel = firstPart;
  }
  if (!stayLabel && firstPart && firstPart !== popularLabel) {
    stayLabel = firstPart;
  }
  if (!popularLabel && !stayLabel && firstPart) {
    stayLabel = firstPart;
  }

  return { popular: popularLabel, stay: stayLabel, other: false };
}

// Pick one location highest property count, then A–Z on ties. 
function pickWinningLocation(groupMap) {
  if (groupMap.size === 0) return null;

  const maxCount = Math.max(
    ...[...groupMap.values()].map((items) => items.length)
  );

  const tiedLabels = [...groupMap.entries()]
    .filter(([, items]) => items.length === maxCount)
    .map(([label]) => label)
    .sort((a, b) => a.localeCompare(b, "id"));

  return tiedLabels[0] ?? null;
}

export function groupPropertiesForHomeSections(properties) {
  const popular = new Map();
  const stay = new Map();
  const other = [];

  for (const property of properties) {
    const { popular: popularLabel, stay: stayLabel, other: isOther } =
      getHomePropertyGroupLabels(property);

    if (isOther) {
      other.push(property);
      continue;
    }

    if (popularLabel) {
      if (!popular.has(popularLabel)) popular.set(popularLabel, []);
      popular.get(popularLabel).push(property);
    }
    if (stayLabel) {
      if (!stay.has(stayLabel)) stay.set(stayLabel, []);
      stay.get(stayLabel).push(property);
    }
  }

  const sections = [];

  const winningPopular = pickWinningLocation(popular);
  if (winningPopular) {
    sections.push({
      id: `popular-${winningPopular}`,
      title: `Popular homes in ${winningPopular}`,
      properties: popular.get(winningPopular),
    });
  }

  const winningStay = pickWinningLocation(stay);
  if (winningStay) {
    sections.push({
      id: `stay-${winningStay}`,
      title: `Stay in ${winningStay}`,
      properties: stay.get(winningStay),
    });
  }

  if (other.length > 0) {
    sections.push({
      id: "other-places",
      title: "Other places",
      properties: other,
    });
  }

  return sections;
}
