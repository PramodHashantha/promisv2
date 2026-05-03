import { useState, useCallback } from "react";

/**
 * CopyCell - A reusable component for table cells that supports copying text.
 *
 * @param {string}  value       - The text value to display and copy.
 * @param {string}  [display]   - Optional different text to display (defaults to `value`).
 * @param {string}  [className] - Extra classes for the wrapper span.
 *
 * Usage in a column definition:
 *   cell: ({ row }) => <CopyCell value={row.original.mR_NO} />
 */
const CopyCell = ({ value, display, className = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (e) => {
      e.stopPropagation();
      if (!value) return;
      try {
        await navigator.clipboard.writeText(String(value));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback for older browsers / insecure contexts
        const ta = document.createElement("textarea");
        ta.value = String(value);
        ta.style.cssText = "position:fixed;opacity:0;";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
    [value]
  );

  return (
    <span className={`copy-cell-wrapper ${className}`}>
      {/* Display text */}
      <span className="copy-cell-text">{display ?? value}</span>

      {/* Copy button */}
      <button
        type="button"
        onClick={handleCopy}
        title={copied ? "Copied!" : "Copy to clipboard"}
        className={`copy-cell-btn ${copied ? "copy-cell-btn--copied" : ""}`}
        aria-label="Copy to clipboard"
      >
        {copied ? (
          /* Check icon */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="copy-cell-icon"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          /* Copy icon */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="copy-cell-icon"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>

      {/* "Copied!" tooltip bubble */}
      {copied && (
        <span className="copy-cell-tooltip" role="status">
          Copied!
        </span>
      )}
    </span>
  );
};

export default CopyCell;
