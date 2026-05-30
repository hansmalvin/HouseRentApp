import React, { useRef, useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import HomePropertyCard from "./HomePropertyCard";

const HomePropertyScrollRow = ({ title, properties }) => {
  const scrollRef = useRef(null);

  // Track scroll position to show/hide arrows intelligently
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    // Also re-check on resize
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [properties]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  if (!properties?.length) return null;

  return (
    <section className="mb-8 sm:mb-10">
      {/* Section header */}
      <div className="mb-3 flex items-center justify-between gap-4 sm:mb-4">
        <h2 className="text-lg font-semibold text-gray-900 sm:text-[22px]">{title}</h2>

        {/* Scroll arrows — only shown on sm+ and only when scrollable */}
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={!canScrollLeft}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition hover:border-gray-900 hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={!canScrollRight}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition hover:border-gray-900 hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scroll row
          - snap-x mandatory for swipe feel on touch
          - Negative horizontal margin + padding trick so first card aligns with page edge
            but the fade-out gradient on the right hints at more cards
          - [-ms-overflow-style:none] etc. hides the scrollbar on all browsers
      */}
      <div className="relative">
        {/* Right fade gradient — visual "more content" hint on mobile */}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white to-transparent sm:hidden" />
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory
                     [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                     sm:gap-4"
        >
          {properties.map((property) => (
            <HomePropertyCard key={property._id} property={property} />
          ))}
          {/* Trailing spacer so last card doesn't sit flush against the viewport edge on mobile */}
          <div className="w-2 shrink-0 sm:hidden" aria-hidden="true" />
        </div>
      </div>

      {/* Mobile swipe indicator dots (shows count context) */}
      {properties.length > 2 && (
        <p className="mt-2 text-center text-[11px] text-gray-400 sm:hidden">
          Swipe to see more →
        </p>
      )}
    </section>
  );
};

export default HomePropertyScrollRow;
