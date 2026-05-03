import { apiPost } from './http.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7041';

export const storeVerificationManualInAPI = {
  // Save verification items (no GRN validation needed)
  saveVerificationItems: async (requestPayload) => {
    try {
      console.log('Saving verification items:', requestPayload);
      
      const response = await apiPost(
        `${API_BASE_URL}/api/StoreVerificationManualIn/SaveVerificationItems`,
        requestPayload
      );
      
      console.log('Save verification items response:', response);
      return response;
    } catch (error) {
      console.error('Error saving verification items:', error);
      
      let errorMessage = error.message || 'Failed to save verification items. Please try again.';
      
      // Only use fallback if message is too generic
      if (errorMessage.includes('POST') && 
          errorMessage.includes('failed') && 
          errorMessage.length < 100) {
        errorMessage = 'Failed to save verification items. Please try again.';
      }
      
      console.error('Final error message:', errorMessage);
      
      throw new Error(errorMessage);
    }
  }
};