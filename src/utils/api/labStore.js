import { apiGet, apiPost } from './http.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7041';

// Rate Limiter Class
class RateLimiter {
  constructor(maxRequests = 30, timeWindow = 1000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  async waitForSlot() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest) + 100;
      
      if (waitTime > 0) {
        console.log(`Rate limit reached. Waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.waitForSlot();
      }
    }

    this.requests.push(now);
  }
}

const apiRateLimiter = new RateLimiter(30, 1000);

// Simple in-memory cache
class APICache {
  constructor(ttl = 2 * 60 * 1000) {
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
  context = 'API call'
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
      
      if (error.message && (
        error.message.includes('401') || 
        error.message.includes('403') ||
        error.message.includes('Unauthorized')
      )) {
        console.error(`${context}: Authentication error, not retrying`);
        throw error;
      }

      if (attempt === maxRetries - 1) {
        console.error(`${context}: All ${maxRetries} attempts failed`);
        throw error;
      }

      const jitter = Math.random() * 500;
      const delay = (baseDelay * Math.pow(2, attempt)) + jitter;
      
      console.log(`${context}: Retrying after ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Enhanced apiGet wrapper with retry logic
const apiGetWithRetry = async (url, options = {}) => {
  const cacheKey = `GET:${url}`;
  
  const cached = apiCache.get(cacheKey);
  if (cached && !options.skipCache) {
    return cached;
  }

  const result = await fetchWithRetry(
    async () => {
      const response = await apiGet(url, options.signal);
      return response;
    },
    3,
    1000,
    `GET ${url}`
  );

  if (result) {
    apiCache.set(cacheKey, result);
  }

  return result;
};

// Enhanced apiPost wrapper with retry logic
const apiPostWithRetry = async (url, data, options = {}) => {
  return await fetchWithRetry(
    async () => {
      const response = await apiPost(url, data, options.signal);
      return response;
    },
    3,
    1000,
    `POST ${url}`
  );
};

// ============================================
// LAB STORE API FUNCTIONS
// ============================================

export const labStoreAPI = {
  // Get all lab stores
  getAllLabStores: async () => {
    try {
      return await apiGetWithRetry(`${API_BASE_URL}/api/LabStore`);
    } catch (error) {
      console.error('Error fetching all lab stores:', error);
      throw new Error('Failed to load lab stores. Please try again.');
    }
  },

  // Get lab store by item and REF
  getLabStoreByItemAndRef: async (itemNumber, refId) => {
    try {
      if (!itemNumber || !refId) {
        throw new Error('Item number and REF ID are required');
      }
      return await apiGetWithRetry(
        `${API_BASE_URL}/api/LabStore/GetByItemAndRef?itemNumber=${encodeURIComponent(itemNumber)}&refId=${encodeURIComponent(refId)}`
      );
    } catch (error) {
      console.error('Error fetching lab store:', error);
      throw new Error('Failed to load lab store details. Please try again.');
    }
  },

  // Get all REFs by item number
  getRefsByItem: async (itemNumber) => {
    try {
      if (!itemNumber) {
        throw new Error('Item number is required');
      }
      console.log(`Fetching REFs for item: ${itemNumber}`);
      
      const result = await apiGetWithRetry(
        `${API_BASE_URL}/api/LabStore/GetRefsByItem/${encodeURIComponent(itemNumber)}`
      );
      
      console.log(`Successfully fetched ${Array.isArray(result) ? result.length : 0} REFs`);
      return result;
    } catch (error) {
      console.error(`Error fetching REFs for item ${itemNumber}:`, error);
      throw new Error('Failed to load REFs. Please try again.');
    }
  },

  // Get item details
  getItemDetails: async (itemNumber) => {
    try {
      if (!itemNumber) {
        throw new Error('Item number is required');
      }
      return await apiGetWithRetry(
        `${API_BASE_URL}/api/LabStore/GetItemDetails/${encodeURIComponent(itemNumber)}`
      );
    } catch (error) {
      console.error('Error fetching item details:', error);
      throw new Error('Failed to load item details. Please try again.');
    }
  },

  // Get UOM details
  getUom: async (uomId) => {
    try {
      if (!uomId) {
        throw new Error('UOM ID is required');
      }
      return await apiGetWithRetry(
        `${API_BASE_URL}/api/LabStore/GetUom/${uomId}`
      );
    } catch (error) {
      console.error('Error fetching UOM:', error);
      throw new Error('Failed to load UOM. Please try again.');
    }
  },

  // Check REF availability
  checkRefAvailability: async (refId) => {
    try {
      if (!refId) {
        throw new Error('REF ID is required');
      }
      return await apiGetWithRetry(
        `${API_BASE_URL}/api/LabStore/CheckRefAvailability/${encodeURIComponent(refId)}`
      );
    } catch (error) {
      console.error('Error checking REF availability:', error);
      throw new Error('Failed to check REF availability. Please try again.');
    }
  },

  // Check UOM for item
  checkUom: async (itemId) => {
    try {
      if (!itemId) {
        throw new Error('Item ID is required');
      }
      return await apiGetWithRetry(
        `${API_BASE_URL}/api/LabStore/CheckUom/${encodeURIComponent(itemId)}`
      );
    } catch (error) {
      console.error('Error checking UOM:', error);
      return null;
    }
  },

  // Stock In
  stockIn: async (data) => {
    try {
      console.log('Processing stock in:', data);
      
      const result = await apiPostWithRetry(
        `${API_BASE_URL}/api/LabStore/StockIn`,
        data
      );
      
      console.log('Stock in successful');
      apiCache.delete(`GET:${API_BASE_URL}/api/LabStore`);
      
      return result;
    } catch (error) {
      console.error('Error processing stock in:', error);
      throw new Error('Failed to process stock in. Please try again.');
    }
  },

  // Stock Out
  stockOut: async (data) => {
    try {
      console.log('Processing stock out:', data);
      
      const result = await apiPostWithRetry(
        `${API_BASE_URL}/api/LabStore/StockOut`,
        data
      );
      
      console.log('Stock out successful');
      apiCache.delete(`GET:${API_BASE_URL}/api/LabStore`);
      
      return result;
    } catch (error) {
      console.error('Error processing stock out:', error);
      throw new Error('Failed to process stock out. Please try again.');
    }
  },

  // Search items (autocomplete)
  searchItems: async (searchText) => {
    try {
      if (!searchText || searchText.length < 1) {
        return [];
      }
      return await apiGetWithRetry(
        `${API_BASE_URL}/api/LabStore/SearchItems/${encodeURIComponent(searchText)}`
      );
    } catch (error) {
      console.error('Error searching items:', error);
      return [];
    }
  },

  // Search users (autocomplete)
  searchUsers: async (searchText) => {
    try {
      if (!searchText || searchText.length < 1) {
        return [];
      }
      return await apiGetWithRetry(
        `${API_BASE_URL}/api/LabStore/SearchUsers/${encodeURIComponent(searchText)}`
      );
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  },

  // Clear cache
  clearCache: () => {
    apiCache.delete(`GET:${API_BASE_URL}/api/LabStore`);
    console.log('Lab store cache cleared');
  }
};

// Export cache control functions
export const labStoreCacheControl = {
  clearAll: () => {
    apiCache.clear();
    console.log('All lab store cache cleared');
  },
  
  clearLabStores: () => {
    apiCache.delete(`GET:${API_BASE_URL}/api/LabStore`);
    console.log('Lab stores cache cleared');
  }
};