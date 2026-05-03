import { apiGet } from "./http.js";
import { getStoreWarehouses } from "./http";
import { getWarehouses } from "./warehouseApi.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://localhost:7041";

// ============================================
// RETRY LOGIC AND RATE LIMITING
// ============================================

// Rate Limiter Class
class RateLimiter {
  constructor(maxRequests = 10, timeWindow = 1000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  async waitForSlot() {
    const now = Date.now();

    // Remove old requests outside the time window
    this.requests = this.requests.filter(
      (time) => now - time < this.timeWindow
    );

    // If we've hit the limit, wait
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest) + 100; // Add 100ms buffer

      if (waitTime > 0) {
        console.log(`Rate limit reached. Waiting ${waitTime}ms`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return this.waitForSlot(); // Recursive check
      }
    }

    // Add current request
    this.requests.push(now);
  }
}

// Create a global rate limiter (10 requests per second)
const apiRateLimiter = new RateLimiter(10, 1000);

// Simple in-memory cache
class APICache {
  constructor(ttl = 2 * 60 * 1000) {
    // 2 minutes default
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    console.log(`Cache hit for: ${key}`);
    return item.data;
  }

  set(key, data, customTTL) {
    const ttl = customTTL || this.ttl;
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }
}

const apiCache = new APICache();

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

      // Wait for rate limiter slot
      await apiRateLimiter.waitForSlot();

      const result = await fetchFunction();

      console.log(`${context}: Success on attempt ${attempt + 1}`);
      return result;
    } catch (error) {
      lastError = error;

      console.error(`${context}: Failed on attempt ${attempt + 1}`, error);

      // Don't retry on authentication errors
      if (
        error.message &&
        (error.message.includes("401") ||
          error.message.includes("403") ||
          error.message.includes("Unauthorized"))
      ) {
        console.error(`${context}: Authentication error, not retrying`);
        throw error;
      }

      // If this is the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        console.error(`${context}: All ${maxRetries} attempts failed`);
        throw error;
      }

      // Calculate delay with exponential backoff + jitter
      const jitter = Math.random() * 500; // Add random 0-500ms
      const delay = baseDelay * Math.pow(2, attempt) + jitter;

      console.log(`${context}: Retrying after ${Math.round(delay)}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Enhanced apiGet wrapper with retry logic
const apiGetWithRetry = async (url, options = {}) => {
  const cacheKey = `GET:${url}`;

  // Check cache first (only for GET requests)
  const cached = apiCache.get(cacheKey);
  if (cached && !options.skipCache) {
    return cached;
  }

  const result = await fetchWithRetry(
    async () => {
      const response = await apiGet(url, options.signal);
      return response;
    },
    3, // maxRetries
    1000, // baseDelay (1 second)
    `GET ${url}`
  );

  // Cache successful results
  if (result) {
    apiCache.set(cacheKey, result);
  }

  return result;
};

// ============================================
// API FUNCTIONS
// ============================================

export const warehouseAPI = {
  getAllWarehouses: async () => {
    try {
      return await apiGetWithRetry(`${API_BASE_URL}/api/StoreWarehouse`);
    } catch (error) {
      console.error("Error fetching all warehouses:", error);
      throw new Error("Failed to load warehouses. Please try again.");
    }
  },

  getWarehousesByCurrentPFNO: async () => {
    try {
      return await apiGetWithRetry(
        `${API_BASE_URL}/api/StoreWarehouse/GetStoreWarehousesByPFNO`
      );
    } catch (error) {
      console.error("Error fetching all warehouses:", error);
      throw new Error("Failed to load warehouses. Please try again.");
    }
  },

  GetStoreWarehouseDetailsByLoggedInUser: async () => {
    try {
      return await apiGetWithRetry(
        `${API_BASE_URL}/api/StoreWarehouse/GetStoreWarehouseDetailsByLoggedInUser`
      );
    } catch (error) {
      console.error("Error fetching all warehouses:", error);
      throw new Error("Failed to load warehouses. Please try again.");
    }
  },

  getAllWarehousesBySKNo: async (SKNo) => {
    try {
      console.log("---------------------test here-----------------------");
      return await apiGetWithRetry(
        `${API_BASE_URL}/api/StoreWarehouse/GetStoreWarehouseByResponsiblePerson`
      );
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      throw new Error("Failed to load warehouses. Please try again.");
    }
  },

  getWarehouseById: async (warehouseId) => {
    try {
      if (!warehouseId) {
        throw new Error("Warehouse ID is required");
      }
      return await apiGetWithRetry(
        `${API_BASE_URL}/api/StoreWarehouse/GetStoreWarehouseByWID/${warehouseId}`
      );
    } catch (error) {
      console.error(`Error fetching warehouse ${warehouseId}:`, error);
      throw new Error("Failed to load warehouse details. Please try again.");
    }
  }
};

export const getAllWarehousesNEW = () =>
  getStoreWarehouses("/api/StoreWarehouse");

export const rackAPI = {
  getAllRacksByWarehouseId: async (warehouseId) => {
    try {
      if (!warehouseId) {
        throw new Error("Warehouse ID is required");
      }

      console.log(`Fetching racks for warehouse: ${warehouseId}`);

      const result = await apiGetWithRetry(
        `${API_BASE_URL}/api/StoreRack/GetAllStoreRacksByWID/${warehouseId}`
      );

      console.log(
        `Successfully fetched ${
          Array.isArray(result) ? result.length : 0
        } racks`
      );
      return result;
    } catch (error) {
      console.error(
        `Error fetching racks for warehouse ${warehouseId}:`,
        error
      );

      // Provide more specific error messages
      if (error.message.includes("429")) {
        throw new Error(
          "Too many requests. Please wait a moment and try again."
        );
      } else if (
        error.message.includes("401") ||
        error.message.includes("403")
      ) {
        throw new Error("Session expired. Please log in again.");
      } else if (error.message.includes("404")) {
        throw new Error("Warehouse not found.");
      } else {
        throw new Error("Failed to load racks. Please try again.");
      }
    }
  },

  getRackById: async (rackId) => {
    try {
      if (!rackId) {
        throw new Error("Rack ID is required");
      }

      console.log(`Fetching rack details for: ${rackId}`);

      return await apiGetWithRetry(
        `${API_BASE_URL}/api/StoreRack/GetStoreRackByRID/${rackId}`
      );
    } catch (error) {
      console.error(`Error fetching rack ${rackId}:`, error);

      if (error.message.includes("429")) {
        throw new Error(
          "Too many requests. Please wait a moment and try again."
        );
      } else if (error.message.includes("404")) {
        throw new Error("Rack not found.");
      } else {
        throw new Error("Failed to load rack details. Please try again.");
      }
    }
  }
};

export const getWarehousDetailsByRIDItemNumberXY = async (
  rackId,
  itemNumber,
  x,
  y
) => {
  try {
    if (!rackId || !itemNumber) {
      throw new Error("Rack ID and Item Number are required");
    }

    console.log(
      `Fetching warehouse details for rack: ${rackId}, item: ${itemNumber}, x: ${x}, y: ${y}`
    );

    return await apiGetWithRetry(
      `${API_BASE_URL}/api/Store/GetStoresByRIDAndXYForRackMove/${itemNumber}/${rackId}/${x}/${y}`
    );
  } catch (error) {
    console.error(
      `Error fetching warehouse details for rack ${rackId}:`,
      error
    );

    if (error.message?.includes("429")) {
      throw new Error("Too many requests. Please wait a moment and try again.");
    } else if (error.message?.includes("404")) {
      throw new Error("Warehouse not found.");
    } else {
      throw new Error("Failed to load warehouse details. Please try again.");
    }
  }
};

export const storeAPI = {
  getStoresByRackId: async (rackId) => {
    try {
      if (!rackId) {
        throw new Error("Rack ID is required");
      }

      console.log(`Fetching items for rack: ${rackId}`);

      const result = await apiGetWithRetry(
        `${API_BASE_URL}/api/Store/GetStoresByRID/${rackId}`
      );

      console.log(
        `Successfully fetched ${
          Array.isArray(result) ? result.length : 0
        } items`
      );
      return result;
    } catch (error) {
      console.error(`Error fetching items for rack ${rackId}:`, error);

      if (error.message.includes("429")) {
        throw new Error(
          "Too many requests. Please wait a moment and try again."
        );
      } else if (error.message.includes("404")) {
        throw new Error("Rack not found.");
      } else {
        throw new Error("Failed to load items. Please try again.");
      }
    }
  },

  // Clear store cache when needed
  clearCache: (rackId) => {
    if (rackId) {
      apiCache.delete(`GET:${API_BASE_URL}/api/Store/GetStoresByRID/${rackId}`);
    }
  }
};

// AV4 method
export const av4API = {
  updateAV4Out: async (storeId, updatedQty) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token)
        throw new Error("No authentication token found. Please log in.");

      console.log(
        `Updating AV4 Out for store ID: ${storeId}, Qty: ${updatedQty}`
      );

      const response = await fetch(`${API_BASE_URL}/api/Store/UpdateAV4Out`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ID: storeId,
          UPDATED_QTY: updatedQty
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Update failed: ${response.status}`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Update failed");
      }

      console.log(`Successfully updated AV4 Out for store ID: ${storeId}`);
      return result;
    } catch (error) {
      console.error("Error updating AV4 Out:", error);
      throw error;
    }
  }
};

export const verificationAPI = {
  downloadVerificationSheet: async (warehouseId, rackId, rackCode) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token)
        throw new Error("No authentication token found. Please log in.");

      console.log(`Downloading verification sheet for rack: ${rackCode}`);

      // Use retry logic for downloads too
      await fetchWithRetry(
        async () => {
          const response = await fetch(
            `${API_BASE_URL}/api/Store/DownloadVerificationSheet?W_ID=${warehouseId}&R_ID=${rackId}&R_CODE=${encodeURIComponent(
              rackCode
            )}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (!response.ok) {
            throw new Error(
              `Download failed: ${response.status} ${response.statusText}`
            );
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `VerificationSheet_${rackCode}_${new Date().getTime()}.xls`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);

          return true;
        },
        3,
        1000,
        `Download verification sheet for ${rackCode}`
      );

      console.log(
        `Successfully downloaded verification sheet for rack: ${rackCode}`
      );
    } catch (error) {
      console.error("Error downloading verification sheet:", error);
      throw new Error(
        `Failed to download verification sheet: ${error.message}`
      );
    }
  },

  downloadVerificationSheetWithoutBalance: async (
    warehouseId,
    rackId,
    rackCode
  ) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token)
        throw new Error("No authentication token found. Please log in.");

      console.log(
        `Downloading verification sheet (no balance) for rack: ${rackCode}`
      );

      await fetchWithRetry(
        async () => {
          const response = await fetch(
            `${API_BASE_URL}/api/Store/DownloadVerificationSheetWithoutBalance?W_ID=${warehouseId}&R_ID=${rackId}&R_CODE=${encodeURIComponent(
              rackCode
            )}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (!response.ok) {
            throw new Error(
              `Download failed: ${response.status} ${response.statusText}`
            );
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `VerificationSheet_NoBalance_${rackCode}_${new Date().getTime()}.xls`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);

          return true;
        },
        3,
        1000,
        `Download verification sheet (no balance) for ${rackCode}`
      );

      console.log(
        `Successfully downloaded verification sheet (no balance) for rack: ${rackCode}`
      );
    } catch (error) {
      console.error("Error downloading verification sheet:", error);
      throw new Error(
        `Failed to download verification sheet: ${error.message}`
      );
    }
  },

  downloadVerificationReport: async (warehouseId, rackId, rackCode) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token)
        throw new Error("No authentication token found. Please log in.");

      console.log(`Downloading verification report for rack: ${rackCode}`);

      await fetchWithRetry(
        async () => {
          const response = await fetch(
            `${API_BASE_URL}/api/Store/DownloadVerificationReport?W_ID=${warehouseId}&R_ID=${rackId}&R_CODE=${encodeURIComponent(
              rackCode
            )}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (!response.ok) {
            throw new Error(
              `Download failed: ${response.status} ${response.statusText}`
            );
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `VerificationReport_${rackCode}_${new Date().getTime()}.xls`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);

          return true;
        },
        3,
        1000,
        `Download verification report for ${rackCode}`
      );

      console.log(
        `Successfully downloaded verification report for rack: ${rackCode}`
      );
    } catch (error) {
      console.error("Error downloading verification report:", error);
      throw new Error(
        `Failed to download verification report: ${error.message}`
      );
    }
  },

  // Download all verification reports for all racks in a warehouse
  downloadAllVerificationReports: async (
    warehouseId,
    racks,
    generateExcelFunction,
    onProgress
  ) => {
    try {
      const results = [];

      console.log(`Starting batch download for ${racks.length} racks`);

      for (let i = 0; i < racks.length; i++) {
        const rack = racks[i];
        const rackId = rack.r_ID || rack.R_ID;
        const rackCode = rack.r_CODE || rack.R_CODE;

        // Report progress
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: racks.length,
            rackCode: rackCode,
            status: "downloading"
          });
        }

        try {
          // Wait for rate limiter before each download
          await apiRateLimiter.waitForSlot();

          // Generate Excel client-side using the provided function with retry
          await fetchWithRetry(
            async () => {
              await generateExcelFunction(rackId, rackCode);
              return true;
            },
            3,
            2000,
            `Generate Excel for rack ${rackCode}`
          );

          results.push({ rackCode, success: true });

          // Report success
          if (onProgress) {
            onProgress({
              current: i + 1,
              total: racks.length,
              rackCode: rackCode,
              status: "success"
            });
          }

          console.log(
            `Successfully generated Excel for rack ${rackCode} (${i + 1}/${
              racks.length
            })`
          );

          // Add delay between downloads (2 seconds) to ensure each download completes
          // and to avoid overwhelming the browser
          if (i < racks.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        } catch (error) {
          console.error(
            `Error downloading report for rack ${rackCode}:`,
            error
          );
          results.push({ rackCode, success: false, error: error.message });

          // Report error
          if (onProgress) {
            onProgress({
              current: i + 1,
              total: racks.length,
              rackCode: rackCode,
              status: "error",
              error: error.message
            });
          }
        }
      }

      console.log(
        `Batch download complete. Success: ${
          results.filter((r) => r.success).length
        }, Failed: ${results.filter((r) => !r.success).length}`
      );
      return results;
    } catch (error) {
      console.error("Error downloading all verification reports:", error);
      throw error;
    }
  }
};

// Export cache control functions
export const cacheControl = {
  clearAll: () => {
    apiCache.clear();
    console.log("All API cache cleared");
  },

  clearWarehouses: () => {
    apiCache.delete(`GET:${API_BASE_URL}/api/StoreWarehouse`);
    console.log("Warehouse cache cleared");
  },

  clearRacks: (warehouseId) => {
    if (warehouseId) {
      apiCache.delete(
        `GET:${API_BASE_URL}/api/StoreRack/GetAllStoreRacksByWID/${warehouseId}`
      );
      console.log(`Rack cache cleared for warehouse ${warehouseId}`);
    }
  },

  clearStores: (rackId) => {
    if (rackId) {
      apiCache.delete(`GET:${API_BASE_URL}/api/Store/GetStoresByRID/${rackId}`);
      console.log(`Store cache cleared for rack ${rackId}`);
    }
  }
};
