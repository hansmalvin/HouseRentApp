import React from "react";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";

const inputClass =
  "min-w-0 rounded-xl border border-indigo-200/90 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200";

const AdminTableToolbar = ({
  search,
  onSearchChange,
  sortAsc,
  onSortToggle,
  placeholder = "Search…",
  sortLabelAsc = "A → Z",
  sortLabelDesc = "Z → A",
}) => {
  return (
    <div className="flex w-full min-w-0 max-w-full gap-2 sm:gap-3">
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} flex-[7] basis-0`}
        aria-label="Search table"
      />
      <button
        type="button"
        onClick={onSortToggle}
        className="flex min-w-0 flex-[3] basis-0 items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-2 py-2.5 text-sm font-semibold text-indigo-800 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:px-3"
        aria-label={sortAsc ? "Sort ascending" : "Sort descending"}
      >
        <ArrowsUpDownIcon className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate">{sortAsc ? sortLabelAsc : sortLabelDesc}</span>
      </button>
    </div>
  );
};

export default AdminTableToolbar;
