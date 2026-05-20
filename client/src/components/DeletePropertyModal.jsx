import React, { useEffect } from "react";
import { getPropertyVerificationName } from "../utils/propertyFormat";

const DeletePropertyModal = ({
  property,
  confirmText,
  onConfirmTextChange,
  onCancel,
  onConfirm,
  isDeleting = false,
}) => {
  const verificationName = getPropertyVerificationName(property);
  const isMatch =
    verificationName.length > 0 &&
    confirmText.trim() === verificationName;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  if (!property) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
      onClick={onCancel}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-labelledby="delete-property-title"
        aria-describedby="delete-property-desc"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-b from-slate-900 via-gray-900 to-slate-950 text-white shadow-[0_0_0_1px_rgba(239,68,68,0.2),0_24px_48px_-12px_rgba(0,0,0,0.85)] ring-1 ring-red-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-700/90 bg-red-950/25 px-6 py-5">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15 text-red-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
          <h3 id="delete-property-title" className="text-lg font-bold text-white">
            Delete property?
          </h3>
          <p id="delete-property-desc" className="mt-2 text-sm leading-relaxed text-gray-400">
            This action cannot be undone. The listing and its data will be removed
            permanently.
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="rounded-lg border border-gray-600/70 bg-slate-800/50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Property name
            </p>
            <p className="mt-1 break-words font-medium text-white">
              {verificationName || "—"}
            </p>
          </div>

          <div>
            <label
              htmlFor="delete-confirm-input"
              className="block text-sm font-medium text-gray-200"
            >
              Type the property name above to confirm
            </label>
            <input
              id="delete-confirm-input"
              type="text"
              value={confirmText}
              onChange={(e) => onConfirmTextChange(e.target.value)}
              placeholder="Enter property name exactly"
              autoComplete="off"
              autoFocus
              className="mt-2 w-full rounded-lg border border-gray-600 bg-slate-950/80 px-3 py-2.5 text-white placeholder-gray-500 transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/35"
            />
            {confirmText.length > 0 && !isMatch && (
              <p className="mt-2 text-xs text-red-400">
                Name does not match. Check spelling and spacing.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-row flex-wrap justify-end gap-3 border-t border-gray-700/90 bg-gray-950/80 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="min-w-[5.5rem] rounded-lg border border-gray-500/80 bg-transparent px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:border-gray-400 hover:bg-gray-800/90 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isMatch || isDeleting}
            className="min-w-[5.5rem] rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-900/40 transition hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isDeleting ? "Deleting…" : "Delete property"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePropertyModal;
