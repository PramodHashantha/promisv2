import { apiGet } from "./http.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://localhost:7041";

// ─── Rate Limiter ─────────────────────────────────────────────────────────────
class RateLimiter {
  constructor(maxRequests = 10, timeWindow = 1000) {
    this.maxRequests = maxRequests;
    this.timeWindow  = timeWindow;
    this.requests    = [];
  }

  async waitForSlot() {
    const now     = Date.now();
    this.requests = this.requests.filter((t) => now - t < this.timeWindow);
    if (this.requests.length >= this.maxRequests) {
      const wait = this.timeWindow - (now - this.requests[0]) + 100;
      if (wait > 0) {
        await new Promise((r) => setTimeout(r, wait));
        return this.waitForSlot();
      }
    }
    this.requests.push(now);
  }
}

const apiRateLimiter = new RateLimiter(10, 1000);

const fetchWithRetry = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await apiRateLimiter.waitForSlot();
      return await fn();
    } catch (error) {
      lastError = error;
      if (error.message?.includes("401") || error.message?.includes("403")) throw error;
      if (attempt === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
};

// ─── API ──────────────────────────────────────────────────────────────────────

export const purchasingRequestViewAllAPI = {

  /**
   * GET /api/PurchasingRequestViewAll/GetPRAll/{year}
   * Old: webServicePMS.asmx/GetPRAll  (called by loadPRAll() JS)
   * Old SP: SP_GET_AllPurchaseRequestByYear  (@YEAR)
   * Returns all Purchase Requests for the given year for the list table.
   * @param {number} year - Selected year from the dropdown
   */
  getPRAll: async (year) => {
    try {
      return await fetchWithRetry(
        () => apiGet(`${API_BASE_URL}/api/PurchasingRequestViewAll/GetPRAll/${year}`),
        3,
        1000
      );
    } catch (error) {
      console.error(`Error fetching purchase requests for year ${year}:`, error);
      throw new Error("Failed to load purchase request list. Please try again.");
    }
  },

  /**
   * GET /api/PurchasingRequestViewAll/ViewPR/{sysId}
   * Old: ViewPR(string Sys_ID) server-side method
   * Old SP: SP_GET_PurchaseRequistBySysID_New + all child SPs
   * Returns full PR detail for the Purchase Requisition Application view.
   * Triggered when View button is clicked on a row.
   * @param {number} sysId - SYS_ID of the purchase request
   */
  viewPR: async (sysId) => {
    try {
      return await fetchWithRetry(
        () => apiGet(`${API_BASE_URL}/api/PurchasingRequestViewAll/ViewPR/${sysId}`),
        3,
        1000
      );
    } catch (error) {
      console.error(`Error fetching PR detail for SYS_ID ${sysId}:`, error);
      throw new Error("Failed to load purchase request details. Please try again.");
    }
  },
};

export default purchasingRequestViewAll;