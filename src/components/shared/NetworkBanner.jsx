import React, { useState, useEffect } from "react";
import { useNetwork } from "../../context/NetworkContext";
import "../../styles/NetworkBanner.css";

const NetworkBanner = () => {
  const { isOnline } = useNetwork();
  const [shouldShow, setShouldShow] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShouldShow(true);
      setHasBeenOffline(true);
      setShowSuccess(false);
    } else if (isOnline && hasBeenOffline) {
      // Logic for "Back Online" success message
      setShowSuccess(true);
      setShouldShow(true);

      const timer = setTimeout(() => {
        setShouldShow(false);
        setHasBeenOffline(false);
        // Delay resetting success state to allow exit animation
        setTimeout(() => setShowSuccess(false), 500);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setShouldShow(false);
    }
  }, [isOnline, hasBeenOffline]);

  return (
    <div
      className={`network-banner ${shouldShow ? "show" : ""} ${showSuccess ? "online-success" : "offline"
        }`}
    >
      <div className="network-banner-icon">
        {!showSuccess && (
          <div className="offline-dot-wrapper">
            <div className="offline-dot" />
            <div className="offline-pulse" />
          </div>
        )}
        {showSuccess ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
          </svg>
        )}
      </div>
      <div className="network-banner-content">
        {showSuccess
          ? "You're back online. Connection restored."
          : "You're offline. Some actions may be unavailable."}
      </div>
    </div>
  );
};

export default NetworkBanner;
