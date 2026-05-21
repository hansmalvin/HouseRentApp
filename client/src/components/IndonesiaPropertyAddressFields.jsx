import React from "react";
import { INDONESIA_CITIES } from "../utils/indonesiaCities";

const fieldClass =
  "w-full rounded-xl border border-indigo-200 bg-white px-3 py-2.5 text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200";

const labelClass = "mb-2 block text-sm font-medium text-slate-600";

const IndonesiaPropertyAddressFields = ({
  city,
  district,
  streetAddress,
  postalCode,
  onCityChange,
  onDistrictChange,
  onStreetAddressChange,
  onPostalCodeChange,
  cityId = "property-city",
  districtId = "property-district",
  streetId = "property-street",
  postalId = "property-postal",
  required = true,
  className = "",
}) => {
  const handlePostalChange = (e) => {
    onPostalCodeChange(e.target.value.replace(/\D/g, "").slice(0, 5));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <p className="text-sm font-medium text-slate-600">Property location (Indonesia)</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={cityId} className={labelClass}>
            City / Regency (Kota/Kabupaten)
          </label>
          <select
            id={cityId}
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            required={required}
            className={`${fieldClass} cursor-pointer`}
          >
            <option value="">Select city...</option>
            {INDONESIA_CITIES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={districtId} className={labelClass}>
            District (Kecamatan) <span className="font-normal text-slate-400">optional</span>
          </label>
          <input
            id={districtId}
            type="text"
            value={district}
            onChange={(e) => onDistrictChange(e.target.value)}
            placeholder="e.g. Menteng, Sukajadi"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_minmax(7rem,8rem)]">
        <div>
          <label htmlFor={streetId} className={labelClass}>
            Street address
          </label>
          <input
            id={streetId}
            type="text"
            value={streetAddress}
            onChange={(e) => onStreetAddressChange(e.target.value)}
            placeholder="Jl., building no., RT/RW, kelurahan"
            required={required}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor={postalId} className={labelClass}>
            Postal code <span className="font-normal text-slate-400">optional</span>
          </label>
          <input
            id={postalId}
            type="text"
            inputMode="numeric"
            value={postalCode}
            onChange={handlePostalChange}
            placeholder="10110"
            maxLength={5}
            className={fieldClass}
          />
        </div>
      </div>
    </div>
  );
};

export default IndonesiaPropertyAddressFields;
