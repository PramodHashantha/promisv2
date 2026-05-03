import { apiGet, apiPost, apiPut } from './http.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7041';

export const verificationAPI = {
  // Get all verification dates
  getAllVerificationDates: async () => {
    try {
      console.log('Fetching all verification dates');
      const response = await apiGet(`${API_BASE_URL}/api/StoreVerification`);  // ← Fixed: was backtick instead of (
      console.log('Verification dates response:', response);
      return response || [];
    } catch (error) {
      console.error('Error fetching verification dates:', error);
      throw new Error('Failed to load verification dates. Please try again.');
    }
  },

  // Get active verification
  getActiveVerification: async () => {
    try {
      console.log('Fetching active verification');
      const response = await apiGet(`${API_BASE_URL}/api/StoreVerification/active`);  // ← Fixed
      console.log('Active verification response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching active verification:', error);
      if (error.message.includes('404')) {
        return null;
      }
      throw new Error('Failed to load active verification.');
    }
  },

  // Declare new verification period
  declareVerificationPeriod: async (verificationData) => {
    try {
      console.log('Declaring verification period:', verificationData);
      
      const payload = {
        YEAR: parseInt(verificationData.YEAR),
        END_DATE: verificationData.END_DATE,
        TRN_BY: verificationData.TRN_BY || 'SYSTEM'
      };

      console.log('Formatted payload:', payload);

      const response = await apiPost(
        `${API_BASE_URL}/api/StoreVerification/declare`,
        payload
      );
      
      console.log('Declare verification response:', response);
      return response;
    } catch (error) {
      console.error('Error declaring verification period:', error);
      console.error('Error.message:', error.message);
      
      // Your http.js puts the backend error message directly in error.message
      // We just need to use it directly (it already contains the backend message)
      let errorMessage = error.message || 'Failed to declare verification period. Please try again.';
      
      // Only use fallback if message is too generic
      if (errorMessage.includes('POST') && 
          errorMessage.includes('failed') && 
          errorMessage.length < 100) {
        errorMessage = 'Failed to declare verification period. Please try again.';
      }
      
      console.error('Final error message:', errorMessage);
      
      throw new Error(errorMessage);
    }
  },

  // End verification period
  endVerificationPeriod: async (verificationId, trnBy) => {
    try {
      console.log('Ending verification period:', { ID: verificationId, TRN_BY: trnBy });
      
      const payload = {
        ID: parseInt(verificationId),
        TRN_BY: trnBy || 'SYSTEM'
      };

      const response = await apiPut(
        `${API_BASE_URL}/api/StoreVerification/end`,
        payload
      );
      
      console.log('End verification response:', response);
      return response;
    } catch (error) {
      console.error('Error ending verification period:', error);
      
      // Your http.js puts the backend error message directly in error.message
      let errorMessage = error.message || 'Failed to end verification period. Please try again.';
      
      // Only use fallback if message is too generic
      if (errorMessage.includes('PUT') && 
          errorMessage.includes('failed') && 
          errorMessage.length < 100) {
        errorMessage = 'Failed to end verification period. Please try again.';
      }
      
      console.error('Final error message:', errorMessage);
      
      throw new Error(errorMessage);
    }
  }
};