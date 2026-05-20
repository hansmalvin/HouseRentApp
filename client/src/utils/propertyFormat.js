/** Indonesian-style grouping, e.g. 100000 → "100.000" */
export function formatPropertyAmount(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num)) return "0";
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(num);
}

export function parsePropertyAmountInput(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits === "") return 0;
  return parseInt(digits, 10);
}
