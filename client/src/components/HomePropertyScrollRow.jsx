import React, { useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import HomePropertyCard from "./HomePropertyCard";

const HomePropertyScrollRow = ({ title, properties }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  if (!properties?.length) return null;

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-[22px] font-semibold text-gray-900">{title}</h2>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scroll(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition hover:border-gray-900 hover:shadow-md"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition hover:border-gray-900 hover:shadow-md"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {properties.map((property) => (
          <HomePropertyCard key={property._id} property={property} />
        ))}
      </div>
    </section>
  );
};

export default HomePropertyScrollRow;
