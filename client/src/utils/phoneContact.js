/** Longest codes first so +1 does not match before +12, etc. */
export const COUNTRY_DIAL_CODES = [
  { code: "+971", label: "UAE (+971)" },
  { code: "+972", label: "Israel (+972)" },
  { code: "+973", label: "Bahrain (+973)" },
  { code: "+886", label: "Taiwan (+886)" },
  { code: "+852", label: "Hong Kong (+852)" },
  { code: "+853", label: "Macau (+853)" },
  { code: "+855", label: "Cambodia (+855)" },
  { code: "+856", label: "Laos (+856)" },
  { code: "+880", label: "Bangladesh (+880)" },
  { code: "+91", label: "India (+91)" },
  { code: "+92", label: "Pakistan (+92)" },
  { code: "+93", label: "Afghanistan (+93)" },
  { code: "+94", label: "Sri Lanka (+94)" },
  { code: "+95", label: "Myanmar (+95)" },
  { code: "+98", label: "Iran (+98)" },
  { code: "+81", label: "Japan (+81)" },
  { code: "+82", label: "South Korea (+82)" },
  { code: "+84", label: "Vietnam (+84)" },
  { code: "+86", label: "China (+86)" },
  { code: "+60", label: "Malaysia (+60)" },
  { code: "+61", label: "Australia (+61)" },
  { code: "+62", label: "Indonesia (+62)" },
  { code: "+63", label: "Philippines (+63)" },
  { code: "+64", label: "New Zealand (+64)" },
  { code: "+65", label: "Singapore (+65)" },
  { code: "+66", label: "Thailand (+66)" },
  { code: "+44", label: "United Kingdom (+44)" },
  { code: "+49", label: "Germany (+49)" },
  { code: "+33", label: "France (+33)" },
  { code: "+39", label: "Italy (+39)" },
  { code: "+34", label: "Spain (+34)" },
  { code: "+31", label: "Netherlands (+31)" },
  { code: "+32", label: "Belgium (+32)" },
  { code: "+41", label: "Switzerland (+41)" },
  { code: "+43", label: "Austria (+43)" },
  { code: "+45", label: "Denmark (+45)" },
  { code: "+46", label: "Sweden (+46)" },
  { code: "+47", label: "Norway (+47)" },
  { code: "+48", label: "Poland (+48)" },
  { code: "+51", label: "Peru (+51)" },
  { code: "+52", label: "Mexico (+52)" },
  { code: "+54", label: "Argentina (+54)" },
  { code: "+55", label: "Brazil (+55)" },
  { code: "+56", label: "Chile (+56)" },
  { code: "+57", label: "Colombia (+57)" },
  { code: "+27", label: "South Africa (+27)" },
  { code: "+20", label: "Egypt (+20)" },
  { code: "+7", label: "Russia (+7)" },
  { code: "+1", label: "USA / Canada (+1)" },
];

/** Country part of label, e.g. "Germany (+49)" → "Germany" */
function dialCodeCountryName(entry) {
  const m = String(entry.label).match(/^(.+?)\s*\(/);
  return (m ? m[1] : entry.label).trim();
}

/** A → Z by country name (for dropdown only; matching still uses all codes). */
export const COUNTRY_DIAL_CODES_SORTED = [...COUNTRY_DIAL_CODES].sort((a, b) =>
  dialCodeCountryName(a).localeCompare(dialCodeCountryName(b), "en", {
    sensitivity: "base",
  })
);

const DIAL_CODES_BY_LENGTH = [...new Map(
  COUNTRY_DIAL_CODES.map((c) => [c.code, c])
).values()].sort((a, b) => b.code.length - a.code.length);

export const DEFAULT_DIAL_CODE = "+62";

export function parseOwnerContact(stored) {
  const raw = String(stored ?? "").trim();
  if (!raw) {
    return { dialCode: DEFAULT_DIAL_CODE, nationalNumber: "" };
  }

  const digitsOnly = raw.replace(/\D/g, "");

  if (raw.startsWith("+")) {
    for (const { code } of DIAL_CODES_BY_LENGTH) {
      if (raw.startsWith(code)) {
        const nationalDigits = raw.slice(code.length).replace(/\D/g, "");
        return { dialCode: code, nationalNumber: nationalDigits };
      }
    }
    return { dialCode: DEFAULT_DIAL_CODE, nationalNumber: digitsOnly };
  }

  if (raw.startsWith("0") && digitsOnly.length > 1) {
    return {
      dialCode: DEFAULT_DIAL_CODE,
      nationalNumber: digitsOnly.slice(1),
    };
  }

  if (digitsOnly.startsWith("62") && digitsOnly.length > 2) {
    return {
      dialCode: DEFAULT_DIAL_CODE,
      nationalNumber: digitsOnly.slice(2),
    };
  }

  return { dialCode: DEFAULT_DIAL_CODE, nationalNumber: digitsOnly };
}

export function buildOwnerContact(dialCode, nationalNumber) {
  const digits = String(nationalNumber ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return `${dialCode}${digits}`;
}

export function formatOwnerContactDisplay(stored) {
  const { dialCode, nationalNumber } = parseOwnerContact(stored);
  if (!nationalNumber) return stored || "—";
  return `${dialCode} ${nationalNumber}`;
}
