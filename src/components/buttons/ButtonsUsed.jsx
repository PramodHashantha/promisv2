import React from "react";
import PropTypes from "prop-types";

const VARIANTS = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500",
  secondary:
    "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-500",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500",
  success:
    "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus:ring-green-500",
  icon: "p-2 rounded-full bg-gray-200 hover:bg-gray-300 active:bg-gray-400 focus:ring-gray-500",
  pill: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500 rounded-full",
  ghost:
    "text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-500"
};

const SIZES = {
  xs: "px-2.5 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
  xl: "px-8 py-4 text-xl"
};

const ButtonsUsed = ({
  variant = "primary",
  size = "md",
  children,
  icon,
  onClick,
  disabled = false,
  loading = false,
  className = "",
  type = "button",
  fullWidth = false,
  "aria-label": ariaLabel,
  ...props
}) => {
  const baseClasses = [
    "inline-flex items-center justify-center",
    "rounded font-medium transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
    fullWidth ? "w-full" : ""
  ].join(" ");

  const iconOnly = variant === "icon" && !children;
  const sizeClass = iconOnly ? SIZES.sm : SIZES[size];

  const handleClick = (event) => {
    if (!disabled && !loading && onClick) {
      onClick(event);
    }
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${VARIANTS[variant]} ${sizeClass} ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={
        ariaLabel || (typeof children === "string" ? children : undefined)
      }
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className={`animate-spin h-5 w-5 ${children ? "mr-2" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {icon && !iconOnly && <span className="mr-2">{icon}</span>}
      {iconOnly ? icon : children}
    </button>
  );
};

ButtonsUsed.propTypes = {
  variant: PropTypes.oneOf(Object.keys(VARIANTS)),
  size: PropTypes.oneOf(Object.keys(SIZES)),
  children: PropTypes.node,
  icon: PropTypes.node,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  fullWidth: PropTypes.bool,
  "aria-label": PropTypes.string
};

export default ButtonsUsed;
