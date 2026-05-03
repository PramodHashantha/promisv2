/**
 * Standardizes date formatting across the application.
 *
 * @param {string|Date} dateString - The date to format
 * @returns {string} - Formatted date string (e.g., "05 Mar 2026") or "-" if invalid/empty
 */
export const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date);
};

/**
 * Standardizes date and time formatting across the application.
 *
 * @param {string|Date} dateString - The date to format
 * @returns {string} - Formatted date string (e.g., "05 Mar 2026, 14:30") or "-" if invalid/empty
 */
export const formatDateTime = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(date);
};
