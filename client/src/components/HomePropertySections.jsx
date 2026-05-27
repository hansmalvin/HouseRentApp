import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import HomePropertyScrollRow from "./HomePropertyScrollRow";
import { groupPropertiesForHomeSections, parsePropertyAddress } from "../utils/propertyAddress";
import { getMaxGuestsFromProperty } from "../utils/propertyFormat";

const HomePropertySections = ({ searchQuery = "", dateFilter = null, guestFilter = null }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchProperties = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8001/api/user/getAllProperties",
          { withCredentials: true }
        );
        if (!cancelled) setProperties(res.data.data ?? []);
      } catch (error) {
        console.error(error);
        if (!cancelled) setProperties([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProperties();
    return () => { cancelled = true; };
  }, []);

  const sections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let filtered = properties;

    // When dates are selected, show rent listings only
    if (dateFilter) {
      filtered = filtered.filter(
        (p) => String(p.propertyAdType).toLowerCase() === "rent"
      );
    }

    // Apply location search query (match on full address, city, or district)
    if (query) {
      filtered = filtered.filter((p) => {
        const rawAddress = String(p.propertyAddress ?? "");
        const { city, district } = parsePropertyAddress(rawAddress);
        const haystack = [
          rawAddress,
          city,
          district,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    // Filter by minimum guest capacity (only keep properties with explicit capacity)
    if (guestFilter) {
      filtered = filtered.filter((p) => {
        const max = getMaxGuestsFromProperty(p);
        return max > 0 && max >= guestFilter;
      });
    }

    return groupPropertiesForHomeSections(filtered);
  }, [properties, searchQuery, dateFilter, guestFilter]);

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading properties…</div>;
  }

  if (sections.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        {dateFilter
          ? "No rent listings found for the selected dates and location."
          : guestFilter
          ? `No properties found that accommodate ${guestFilter} guest${guestFilter > 1 ? "s" : ""}.`
          : "No properties available at the moment."}
      </div>
    );
  }

  return (
    <div>
      {sections.map((section) => (
        <HomePropertyScrollRow
          key={section.id}
          title={section.title}
          properties={section.properties}
        />
      ))}
    </div>
  );
};

export default HomePropertySections;
