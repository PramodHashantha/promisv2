import { apiGet } from "./http";

/**
 * Searches for Purchase Requests or POs based on a query string.
 * @param {string} query - The search term (PRNO or Title).
 * @param {AbortSignal} signal - Abort signal for request cancellation.
 * @returns {PromiseArray} List of suggestions { PRNO, TITLE }.
 */
export const searchTimelineItems = (query, signal) => 
    apiGet(`/api/Timeline/search?q=${encodeURIComponent(query)}`, signal);

/**
 * Retrieves full details and activity history for a specific PR.
 * @param {string} prNo - The Purchase Request number.
 * @param {AbortSignal} signal - Abort signal for request cancellation.
 * @returns {PromiseObject} The PR details object including ACTIVITY_HISTORY.
 */
export const getTimelineDetails = (prNo, signal) => 
    apiGet(`/api/Timeline/${encodeURIComponent(prNo)}`, signal);

/**
 * Retrieves supplier and PO details for a given Quotation number.
 * @param {string} qtNo - The Quotation number.
 * @param {AbortSignal} signal - Abort signal for request cancellation.
 * @returns {PromiseArray} List of supplier/PO details.
 */
export const getOpenedSupplierDetails = (qtNo, signal) =>
    apiGet(`/api/Timeline/opened-supplier-details/${encodeURIComponent(qtNo)}`, signal);
