import React, { useEffect, useMemo } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

const VARIANTS = {
  success: {
    icon: CheckCircleIcon,
    container:
      "border-emerald-200/90 bg-emerald-50/95 text-emerald-900 shadow-emerald-200/40",
    iconClass: "text-emerald-600",
    closeClass: "text-emerald-600/70 hover:bg-emerald-100 hover:text-emerald-800",
  },
  error: {
    icon: XCircleIcon,
    container:
      "border-rose-200/90 bg-rose-50/95 text-rose-900 shadow-rose-200/40",
    iconClass: "text-rose-600",
    closeClass: "text-rose-600/70 hover:bg-rose-100 hover:text-rose-800",
  },
  warning: {
    icon: ExclamationTriangleIcon,
    container:
      "border-amber-200/90 bg-amber-50/95 text-amber-900 shadow-amber-200/40",
    iconClass: "text-amber-600",
    closeClass: "text-amber-600/70 hover:bg-amber-100 hover:text-amber-800",
  },
  info: {
    icon: InformationCircleIcon,
    container:
      "border-indigo-200/90 bg-indigo-50/95 text-indigo-900 shadow-indigo-200/40",
    iconClass: "text-indigo-600",
    closeClass: "text-indigo-600/70 hover:bg-indigo-100 hover:text-indigo-800",
  },
};

function resolveToast(type, message) {
  const known = Object.keys(VARIANTS);
  if (known.includes(type)) {
    return { variant: type, text: message ?? "" };
  }
  return { variant: "error", text: message ?? type ?? "" };
}

const Toast = ({ type = "info", message, onClose }) => {
  const { variant, text } = useMemo(
    () => resolveToast(type, message),
    [type, message]
  );
  const styles = VARIANTS[variant] ?? VARIANTS.info;
  const Icon = styles.icon;

  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`toast-slide-in fixed top-5 right-5 z-[9999] flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-md sm:max-w-md sm:px-5 sm:py-3.5 ${styles.container}`}
    >
      <Icon
        className={`mt-0.5 h-6 w-6 shrink-0 ${styles.iconClass}`}
        aria-hidden
      />
      <p className="flex-1 text-sm font-medium leading-snug">{text}</p>
      <button
        type="button"
        onClick={onClose}
        className={`shrink-0 rounded-lg p-1 transition ${styles.closeClass}`}
        aria-label="Dismiss notification"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Toast;
