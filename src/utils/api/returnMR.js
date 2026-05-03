import { apiGet, apiPost } from "./http.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://localhost:7041";

// Rate Limiter Class
class RateLimiter {
  constructor(maxRequests = 10, timeWindow = 1000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  async waitForSlot() {
    const now = Date.now();
    this.requests = this.requests.filter(
      (time) => now - time < this.timeWindow
    );

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest) + 100;

      if (waitTime > 0) {
        console.log(`Rate limit reached. Waiting ${waitTime}ms`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return this.waitForSlot();
      }
    }

    this.requests.push(now);
  }
}

const apiRateLimiter = new RateLimiter(10, 1000);

// Retry with exponential backoff
const fetchWithRetry = async (
  fetchFunction,
  maxRetries = 3,
  baseDelay = 1000,
  context = "API call"
) => {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`${context}: Attempt ${attempt + 1}/${maxRetries}`);
      await apiRateLimiter.waitForSlot();
      const result = await fetchFunction();
      console.log(`${context}: Success on attempt ${attempt + 1}`);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`${context}: Failed on attempt ${attempt + 1}`, error);

      if (
        error.message &&
        (error.message.includes("401") ||
          error.message.includes("403") ||
          error.message.includes("Unauthorized"))
      ) {
        console.error(`${context}: Authentication error, not retrying`);
        throw error;
      }

      if (attempt === maxRetries - 1) {
        console.error(`${context}: All ${maxRetries} attempts failed`);
        throw error;
      }

      const jitter = Math.random() * 500;
      const delay = baseDelay * Math.pow(2, attempt) + jitter;

      console.log(`${context}: Retrying after ${Math.round(delay)}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

export const returnMRAPI = {
  // ─── Get MR Request List ──────────────────────────────────────────────

  /**
   * GET /api/ReturnMR/GetMRRequests/{approvalStatus}
   * Returns list of MR requests for logged-in user
   * approvalStatus: "Issued With Approval" or "Issued With Not Approval"
   */
  getMRRequests: async (approvalStatus) => {
    try {
      console.log(`Fetching MR requests with status: ${approvalStatus}`);

      return await fetchWithRetry(
        async () => {
          const response = await apiGet(
            `${API_BASE_URL}/api/ReturnMR/GetMRRequests/${encodeURIComponent(approvalStatus)}`
          );

          console.log(`Retrieved ${response?.length || 0} MR requests`);
          return response;
        },
        3,
        1000,
        `Get MR requests`
      );
    } catch (error) {
      console.error("Error fetching MR requests:", error);
      throw new Error("Failed to load MR requests. Please try again.");
    }
  },

  // ─── Load items by MR Number ──────────────────────────────────────────

  /**
   * GET /api/ReturnMR/GetStoreItemsByMRNo/{mrNo}
   * Returns all items issued under a given MR number.
   * adjustedQty = outQty - totalReturnQty
   */
  getStoreItemsByMRNo: async (mrNo) => {
    try {
      console.log(`Fetching items for MR Number: ${mrNo}`);

      return await fetchWithRetry(
        async () => {
          const response = await apiGet(
            `${API_BASE_URL}/api/ReturnMR/GetStoreItemsByMRNo/${encodeURIComponent(mrNo)}`
          );

          console.log(`Retrieved ${response?.length || 0} items for MR ${mrNo}`);
          return response;
        },
        3,
        1000,
        `Get items by MR No`
      );
    } catch (error) {
      console.error("Error fetching MR items:", error);
      throw new Error("Failed to load MR items. Please try again.");
    }
  },

  // ─── Save Return MR ───────────────────────────────────────────────────

  /**
   * POST /api/ReturnMR/SaveReturnMR
   * Saves a complete Return MR in a single transaction.
   * Returns { success, message, returnRefId }
   */
  saveReturnMR: async (saveRequest) => {
    try {
      console.log("Saving Return MR:", saveRequest);

      return await fetchWithRetry(
        async () => {
          return await apiPost(
            `${API_BASE_URL}/api/ReturnMR/SaveReturnMR`,
            saveRequest
          );
        },
        3,
        1000,
        `Save Return MR`
      );
    } catch (error) {
      console.error("Error saving Return MR:", error);
      throw new Error("Failed to save Return MR. Please try again.");
    }
  },

  // ─── Get report data for Excel generation ────────────────────────────

  /**
   * GET /api/ReturnMR/GetReturnMRReport/{returnRefId}/{mrNo}
   * Returns aggregated report data:
   *  - items (main return records)
   *  - section (section & cost code info)
   *  - unitPrices (unit price per item)
   */
  getReturnMRReport: async (returnRefId, mrNo) => {
    try {
      console.log(`Fetching Return MR report: RefID=${returnRefId}, MR=${mrNo}`);

      return await fetchWithRetry(
        async () => {
          return await apiGet(
            `${API_BASE_URL}/api/ReturnMR/GetReturnMRReport/${encodeURIComponent(returnRefId)}/${encodeURIComponent(mrNo)}`
          );
        },
        3,
        1000,
        `Get Return MR report`
      );
    } catch (error) {
      console.error("Error fetching Return MR report:", error);
      throw new Error("Failed to load report data. Please try again.");
    }
  },

  // ─── Get SK List ──────────────────────────────────────────────────────

  /**
   * GET /api/ReturnMR/GetSKList
   * Returns list of store keepers (SKNO, FULLNAME, RESPONSIBLE_PERSON)
   * Used to populate the SK dropdown — mirrors old webServicePMS.asmx/loadSK
   */
  getSKList: async () => {
    try {
      console.log("Fetching SK list");

      return await fetchWithRetry(
        async () => {
          const response = await apiGet(
            `${API_BASE_URL}/api/ReturnMR/GetSKList`
          );

          console.log(`Retrieved ${response?.length || 0} store keepers`);
          return response;
        },
        3,
        1000,
        "Get SK List"
      );
    } catch (error) {
      console.error("Error fetching SK list:", error);
      throw new Error("Failed to load store keeper list. Please try again.");
    }
  },
};

export default returnMRAPI;