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
    const now    = Date.now();
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

export const purchasingRequestFromInventoryAPI = {

  /**
   * GET /api/PurchasingRequestFromInventory/GetAll
   * Old: BL_PurchaseRequest.SelectPurchaseRequestFromInventory(null)
   * Old SP: usp_GetPurchuseRequestsFromInventory (no params)
   * Old page: loadTable() → renders _REQ_LIST table
   * Returns all purchase requests from inventory sorted by CREATE_DATE desc.
   */
  getAll: async () => {
    try {
      return await fetchWithRetry(
        () => apiGet(`${API_BASE_URL}/api/PurchasingRequestFromInventory/GetAll`),
        3, 1000
      );
    } catch (error) {
      console.error("Error fetching purchase requests from inventory:", error);
      throw new Error("Failed to load purchase request list. Please try again.");
    }
  },

  /**
   * GET /api/PurchasingRequestFromInventory/GetDetailsById/{id}
   * Old: BL_PurchaseRequest.SelectPurchaseRequestFromInventoryDetails(oREF_PurchaseRequest, null)
   * Old SP: usp_GetPurchaseRequestDetailsFromInventory (@PurchaseRequestFromInventoryID)
   * Old page: loadTableDetails(id) → renders _REQ_LISTDETAILS table
   * Triggered when View (eye icon) button is clicked.
   * @param {number} id - PURCHASE_REQUEST_FROM_INVENTORY_ID
   */
  getDetailsById: async (id) => {
    try {
      return await fetchWithRetry(
        () => apiGet(`${API_BASE_URL}/api/PurchasingRequestFromInventory/GetDetailsById/${id}`),
        3, 1000
      );
    } catch (error) {
      console.error(`Error fetching details for ID ${id}:`, error);
      throw new Error("Failed to load request details. Please try again.");
    }
  },

  /**
   * GET /api/PurchasingRequestFromInventory/GetFilterStatusList
   * Old: BL_PurchaseRequest.SelectPurchaseRequestByPFNoTableStatus(rEF_User, null)
   * Old SP: SP_GET_PurchaseRequestByPFNoTableStatus (@PFNO)
   * Old page: loadTableStatus() → populates rdFilter radio button list
   * PFNO is read from JWT claims server-side — no param needed from frontend.
   */
  getFilterStatusList: async () => {
    try {
      return await fetchWithRetry(
        () => apiGet(`${API_BASE_URL}/api/PurchasingRequestFromInventory/GetFilterStatusList`),
        3, 1000
      );
    } catch (error) {
      console.error("Error fetching filter status list:", error);
      throw new Error("Failed to load filter options. Please try again.");
    }
  },
};

export default purchasingRequestFromInventoryAPI;