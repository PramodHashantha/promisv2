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

export const verificationAPI = {
  // ✅ UPDATED: Get items by Rack ID and X,Y coordinates (now reuses Store API)
  getItemsByRIDAndXY: async (rId, x, y) => {
    try {
      console.log(`Fetching items for verification: R_ID=${rId}, X=${x}, Y=${y}`);
      
      return await fetchWithRetry(
        async () => {
          const response = await apiGet(
            `${API_BASE_URL}/api/StoresVerification/GetItemsByRIDAndXY/${rId}/${x}/${y}`
          );
          
          // The response should already be filtered by X,Y from the backend
          console.log(`Retrieved ${response?.length || 0} items for position (${x}, ${y})`);
          return response;
        },
        3,
        1000,
        `Get items by RID and XY`
      );
    } catch (error) {
      console.error("Error fetching items for verification:", error);
      throw new Error("Failed to load verification items. Please try again.");
    }
  },

  // Get last verification period ID
  getLastVerificationID: async () => {
    try {
      console.log("Fetching last verification ID");
      
      return await fetchWithRetry(
        async () => {
          return await apiGet(
            `${API_BASE_URL}/api/StoresVerification/GetLastVerificationID`
          );
        },
        3,
        1000,
        `Get last verification ID`
      );
    } catch (error) {
      console.error("Error fetching last verification ID:", error);
      throw new Error("Failed to load verification ID. Please try again.");
    }
  },

  // Save verification details (Update flow - for storekeepers)
  saveVerificationDetails: async (items) => {
    try {
      console.log("Saving verification details (Update):", items);

      return await fetchWithRetry(
        async () => {
          return await apiPost(
            `${API_BASE_URL}/api/StoresVerification/SaveVerificationDetails`,
            { oREF_StoresList: items }
          );
        },
        3,
        1000,
        `Save verification details`
      );
    } catch (error) {
      console.error("Error saving verification details:", error);
      throw new Error("Failed to save verification. Please try again.");
    }
  },

  // Save verification details with status (Verify flow - for board members)
  saveVerificationDetails1: async (items) => {
    try {
      console.log("Saving verification details (Verify):", items);

      return await fetchWithRetry(
        async () => {
          return await apiPost(
            `${API_BASE_URL}/api/StoresVerification/SaveVerificationDetails1`,
            { oREF_StoresList: items }
          );
        },
        3,
        1000,
        `Save verification details with status`
      );
    } catch (error) {
      console.error("Error saving verification details:", error);
      throw new Error("Failed to verify items. Please try again.");
    }
  },

  // Check if current user is a storekeeper
  isStorekeeper: async () => {
    try {
      console.log("Checking if user is storekeeper");
      
      return await fetchWithRetry(
        async () => {
          return await apiGet(
            `${API_BASE_URL}/api/StoresVerification/IsStorekeeper`
          );
        },
        3,
        1000,
        `Check storekeeper status`
      );
    } catch (error) {
      console.error("Error checking storekeeper status:", error);
      throw new Error("Failed to check user role. Please try again.");
    }
  },

  // Get warehouse details by W_ID
  getWarehouseDetailsByWID: async (wId) => {
    try {
      console.log(`Fetching warehouse details: W_ID=${wId}`);
      
      return await fetchWithRetry(
        async () => {
          return await apiGet(
            `${API_BASE_URL}/api/StoresVerification/GetWarehouseDetailsByWID/${wId}`
          );
        },
        3,
        1000,
        `Get warehouse details`
      );
    } catch (error) {
      console.error("Error fetching warehouse details:", error);
      throw new Error("Failed to load warehouse details. Please try again.");
    }
  },

  // Get warehouse item list by W_ID (for verification sheet without balance)
  getWarehouseItemListByWID: async (wId) => {
    try {
      console.log(`Fetching warehouse item list: W_ID=${wId}`);
      
      return await fetchWithRetry(
        async () => {
          return await apiGet(
            `${API_BASE_URL}/api/StoresVerification/GetWarehouseItemListByWID/${wId}`
          );
        },
        3,
        1000,
        `Get warehouse item list`
      );
    } catch (error) {
      console.error("Error fetching warehouse item list:", error);
      throw new Error("Failed to load warehouse items. Please try again.");
    }
  }
};

export default verificationAPI;