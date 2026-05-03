import { apiGet, apiPut } from './http.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7041';

// ============================================
// APPOINTMENT UPDATE API FUNCTIONS
// ============================================

export const appointmentUpdateAPI = {
  /**
   * Get current user's appointment information
   * GET /api/AppointmentUpdate/current-user-info
   */
  getCurrentUserInfo: async () => {
    try {
      console.log('=== Calling getCurrentUserInfo API ===');
      console.log('URL:', `${API_BASE_URL}/api/AppointmentUpdate/current-user-info`);
      
      const result = await apiGet(`${API_BASE_URL}/api/AppointmentUpdate/current-user-info`);
      
      console.log('API Response:', result);
      console.log('Response Type:', typeof result);
      console.log('Response Keys:', result ? Object.keys(result) : 'NULL');
      
      if (!result) {
        throw new Error('No data returned from server');
      }
      
      return result;
    } catch (error) {
      console.error('=== getCurrentUserInfo Error ===');
      console.error('Error:', error);
      console.error('Error Message:', error.message);
      throw new Error(error.message || 'Failed to load user information. Please try again.');
    }
  },

  /**
   * Get parent appointments for dropdown (filtered list)
   * GET /api/AppointmentUpdate/parent-appointments
   */
  getParentAppointments: async () => {
    try {
      console.log('=== Calling getParentAppointments API ===');
      console.log('URL:', `${API_BASE_URL}/api/AppointmentUpdate/parent-appointments`);
      
      const result = await apiGet(`${API_BASE_URL}/api/AppointmentUpdate/parent-appointments`);
      
      console.log('API Response:', result);
      console.log('Is Array:', Array.isArray(result));
      console.log('Array Length:', result?.length);
      
      if (result && result.length > 0) {
        console.log('First Item:', result[0]);
        console.log('First Item Keys:', Object.keys(result[0]));
      }
      
      if (!result || !Array.isArray(result)) {
        console.warn('Invalid response format, returning empty array');
        return [];
      }
      
      return result;
    } catch (error) {
      console.error('=== getParentAppointments Error ===');
      console.error('Error:', error);
      console.error('Error Message:', error.message);
      throw new Error(error.message || 'Failed to load parent appointments. Please try again.');
    }
  },

  /**
   * Update parent appointment
   * PUT /api/AppointmentUpdate/update
   * @param {Object} data - { appointment_id: number, partent_appointment_id: number }
   */
  updateParentAppointment: async (data) => {
    try {
      console.log('=== Calling updateParentAppointment API ===');
      console.log('URL:', `${API_BASE_URL}/api/AppointmentUpdate/update`);
      console.log('Request Data:', data);
      
      const result = await apiPut(`${API_BASE_URL}/api/AppointmentUpdate/update`, data);
      
      console.log('API Response:', result);
      console.log('Update successful');
      
      return result;
    } catch (error) {
      console.error('=== updateParentAppointment Error ===');
      console.error('Error:', error);
      console.error('Error Message:', error.message);
      throw new Error(error.message || 'Failed to update parent appointment. Please try again.');
    }
  }
};