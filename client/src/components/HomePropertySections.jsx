import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import HomePropertyScrollRow from "./HomePropertyScrollRow";
import { groupPropertiesForHomeSections } from "../utils/propertyAddress";

const HomePropertySections = ({ searchQuery = "", dateFilter = null }) => {
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

    // Apply location search query
    if (query) {
      filtered = filtered.filter((p) =>
        String(p.propertyAddress ?? "").toLowerCase().includes(query)
      );
    }

    return groupPropertiesForHomeSections(filtered);
  }, [properties, searchQuery, dateFilter]);

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading properties…</div>;
  }

  if (sections.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        {dateFilter
          ? "No rent listings found for the selected dates and location."
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
