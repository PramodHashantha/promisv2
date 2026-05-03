import { apiGet, apiPost, apiDelete } from './http.js';

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

// Enhanced apiGet wrapper
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

// Enhanced apiPost wrapper
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

// Enhanced apiDelete wrapper
const apiDeleteWithRetry = async (url, options = {}) => {
  return await fetchWithRetry(
    async () => {
      const response = await apiDelete(url, options.signal);
      return response;
    },
    3,
    1000,
    `DELETE ${url}`
  );
};

// ============================================
// LEVEL API FUNCTIONS
// ============================================

export const levelAPI = {
  // Get all levels
  getAllLevels: async () => {
    try {
      return await apiGetWithRetry(`${API_BASE_URL}/api/Level`);
    } catch (error) {
      console.error('Error fetching all levels:', error);
      throw new Error('Failed to load levels. Please try again.');
    }
  },

  // Get level by ID
  getLevelById: async (levelId) => {
    try {
      if (!levelId) {
        throw new Error('Level ID is required');
      }
      return await apiGetWithRetry(
        `${API_BASE_URL}/api/Level/${levelId}`
      );
    } catch (error) {
      console.error('Error fetching level:', error);
      throw new Error('Failed to load level details. Please try again.');
    }
  },

  // Check if level exists
  checkLevelExists: async (levelId) => {
    try {
      if (!levelId) {
        throw new Error('Level ID is required');
      }
      return await apiGetWithRetry(
        `${API_BASE_URL}/api/Level/CheckExists/${levelId}`
      );
    } catch (error) {
      console.error('Error checking level existence:', error);
      throw new Error('Failed to check level. Please try again.');
    }
  },

  // Save level (insert/update)
  saveLevel: async (data) => {
    try {
      console.log('Processing save level:', data);
      
      const result = await apiPostWithRetry(
        `${API_BASE_URL}/api/Level/Save`,
        data
      );
      
      console.log('Save successful');
      apiCache.delete(`GET:${API_BASE_URL}/api/Level`);
      
      return result;
    } catch (error) {
      console.error('Error saving level:', error);
      throw new Error('Failed to save level. Please try again.');
    }
  },

  // Delete level
  deleteLevel: async (levelId) => {
    try {
      console.log('Processing delete level:', levelId);
      
      const result = await apiDeleteWithRetry(
        `${API_BASE_URL}/api/Level/${levelId}`
      );
      
      console.log('Delete successful');
      apiCache.delete(`GET:${API_BASE_URL}/api/Level`);
      
      return result;
    } catch (error) {
      console.error('Error deleting level:', error);
      throw new Error('Failed to delete level. Please try again.');
    }
  },

  // Clear cache
  clearCache: () => {
    apiCache.delete(`GET:${API_BASE_URL}/api/Level`);
    console.log('Level cache cleared');
  }
};

// Export cache control functions
export const levelCacheControl = {
  clearAll: () => {
    apiCache.clear();
    console.log('All level cache cleared');
  },
  
  clearLevels: () => {
    apiCache.delete(`GET:${API_BASE_URL}/api/Level`);
    console.log('Levels cache cleared');
  }
};