import React from "react";
import PropTypes from "prop-types";
import "./LoadingSpinner.css";

const LoadingSpinner = ({
  size = "medium",
  text = "Loading...",
  variant = "primary",
  showText = true,
  className = ""
}) => {
  const sizeClasses = {
    small: "spinner-sm",
    medium: "spinner-md",
    large: "spinner-lg"
  };

  const variantClasses = {
    primary: ["text-primary", "text-info", "text-primary"],
    secondary: ["text-secondary", "text-dark", "text-secondary"],
    success: ["text-success", "text-info", "text-success"],
    danger: ["text-danger", "text-warning", "text-danger"]
  };

  return (
    <div
      className={`loading-wrapper ${className}`}
      aria-busy="true"
      role="alert"
      aria-live="polite"
    >
      <div className={`loading-container ${sizeClasses[size]}`}>
        <div className="loading-spinner">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`spinner-grow ${variantClasses[variant][index]}`}
              style={{ animationDelay: `${index * 0.15}s` }}
              role="status"
            >
              <span className="visually-hidden">{text}</span>
            </div>
          ))}
        </div>
        {showText && <p className="loading-text">{text}</p>}
      </div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large"]),
  text: PropTypes.string,
  variant: PropTypes.oneOf(["primary", "secondary", "success", "danger"]),
  showText: PropTypes.bool,
  className: PropTypes.string
};

export default LoadingSpinner;
