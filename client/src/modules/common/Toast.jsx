import React, { useEffect } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

const Toast = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === "success";

  return (
    <div
  className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl border backdrop-blur-md animate-slideIn
    ${type === "success"
      ? "bg-green-500/20 border-green-500/40 text-green-300"
      : "bg-red-500/20 border-red-500/40 text-red-300"
    }`}
>
      {isSuccess ? (
        <CheckCircleIcon className="h-6 w-6 flex-shrink-0" />
      ) : (
        <XCircleIcon className="h-6 w-6 flex-shrink-0" />
      )}
      <span className="font-medium">{message}</span>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-white transition"
      >
        ✖
      </button>

      <style jsx>{`
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateX(100%);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Toast;
