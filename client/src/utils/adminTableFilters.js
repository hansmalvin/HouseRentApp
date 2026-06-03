export function filterBySearch(items, query, getSearchableText) {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) =>
    getSearchableText(item).toLowerCase().includes(q)
  );
}

export function sortByString(items, getValue, ascending = true) {
  return [...items].sort((a, b) => {
    const aVal = (getValue(a) ?? "").toString().toLowerCase();
    const bVal = (getValue(b) ?? "").toString().toLowerCase();
    const cmp = aVal.localeCompare(bVal, undefined, { sensitivity: "base" });
    return ascending ? cmp : -cmp;
  });
}

export function applySearchAndSort(items, { search, sortAsc, getSearchableText, getSortValue }) {
  const filtered = filterBySearch(items, search, getSearchableText);
  return sortByString(filtered, getSortValue, sortAsc);
}
