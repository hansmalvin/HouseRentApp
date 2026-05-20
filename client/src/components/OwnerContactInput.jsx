import React from "react";
import { COUNTRY_DIAL_CODES_SORTED } from "../utils/phoneContact";

const inputClass =
  "rounded-lg border border-gray-600 bg-slate-950/80 px-3 py-2.5 text-white transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/35";

const OwnerContactInput = ({
  dialCode,
  nationalNumber,
  onDialCodeChange,
  onNationalNumberChange,
  dialId = "owner-contact-dial",
  numberId = "owner-contact-number",
  numberPlaceholder = "8123456789",
  className = "",
  required = false,
}) => {
  const handleNumberChange = (e) => {
    onNationalNumberChange(e.target.value.replace(/\D/g, ""));
  };

  return (
    <div className={`flex flex-col gap-2 sm:flex-row ${className}`}>
      <select
        id={dialId}
        value={dialCode}
        onChange={(e) => onDialCodeChange(e.target.value)}
        className={`${inputClass} w-full shrink-0 cursor-pointer sm:max-w-[11rem]`}
        aria-label="Country code"
      >
        {COUNTRY_DIAL_CODES_SORTED.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
      <input
        id={numberId}
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        value={nationalNumber}
        onChange={handleNumberChange}
        placeholder={numberPlaceholder}
        required={required}
        className={`${inputClass} min-w-0 flex-1`}
        aria-label="Phone number"
      />
    </div>
  );
};

export default OwnerContactInput;
