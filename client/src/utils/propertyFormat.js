export function formatPropertyAmount(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num)) return "0";
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(num);
}

export function getPropertyVerificationName(property) {
  return String(property?.propertyAddress ?? "").trim();
}

export function parsePropertyAmountInput(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits === "") return 0;
  return parseInt(digits, 10);
}

/**
 * Derive maximum guest capacity from a property object.
 * Preference order:
 * 1) Numeric `property.maxGuests` field if present
 * 2) Pattern "Max guests: <number>" inside `additionalInfo`
 * 3) Fallback: 0 (unknown)
 */
export function getMaxGuestsFromProperty(property) {
  if (!property) return 0;

  const direct = Number(property.maxGuests);
  if (Number.isFinite(direct) && direct > 0) return direct;

  const text = String(property.additionalInfo ?? "");
  const match = text.match(/max\s*guests?\s*[:\-]?\s*(\d+)/i);
  if (match) {
    const parsed = Number(match[1]);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  return 0;
}
