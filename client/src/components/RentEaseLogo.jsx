import React from "react";
import { Link } from "react-router-dom";

const sizeClasses = {
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
};

const textColorClasses = {
  light: "text-indigo-600",
  dark: "text-indigo-400",
};

const RentEaseLogo = ({
  to,
  showText = true,
  subtitle,
  size = "md",
  variant = "light",
  className = "",
}) => {
  const content = (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <img
        src="/nobgimage.png"
        alt={showText ? "" : "RentEase"}
        className={`${sizeClasses[size]} w-auto shrink-0 object-contain`}
        aria-hidden={showText}
      />
      {showText && (
        <div className="min-w-0">
          <span
            className={`text-xl font-bold tracking-tight sm:text-2xl ${textColorClasses[variant]}`}
          >
            RentEase
          </span>
          {subtitle && (
            <p
              className={`text-xs sm:text-sm ${
                variant === "light" ? "text-slate-500" : "text-gray-400"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="inline-flex rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
      >
        {content}
      </Link>
    );
  }

  return content;
};

export default RentEaseLogo;
