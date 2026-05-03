import { apiGet, apiPut, apiPost, apiDelete } from './http.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7041';

// ============================================
// APPOINTMENT API FUNCTIONS
// ============================================

export const appointmentAPI = {
  createAppointment: async (data) => {
    try {
      const result = await apiPost(`${API_BASE_URL}/api/Appointment`, data);
      console.log('API Response:', result);
      return result;
    } catch (error) {
      throw new Error(error.message || 'Failed to create appointment. Please try again.');
    }
  },

  deleteAppointment: async (appointmentId) => {
    try {
      const result = await apiDelete(`${API_BASE_URL}/api/Appointment/${appointmentId}`);
      console.log('API Response:', result);
      return result;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete appointment. Please try again.');
    }
  },

  getAppointments: async () => {
    try {
 
      const result = await apiGet(`${API_BASE_URL}/api/Appointment`);
      
      console.log('API Response:', result);
      
      if (!result || !Array.isArray(result)) {
        console.warn('Invalid response format, returning empty array');
        return [];
      }
      
      return result;
    } catch (error) {
      throw new Error(error.message || 'Failed to load parent appointments. Please try again.');
    }
  },

  GetUserByAppointmentID: async (appointmentId) => {
    try {
 
      const result = await apiGet(`${API_BASE_URL}/api/Appointment/GetUserByAppointmentID/${appointmentId}`);
      
      console.log('GetUserByAppointmentID API Response:', result);
      
      if (!result) {
        console.warn('Empty response received');
        return null;
      }
      
      return result;
    } catch (error) {
      throw new Error(error.message || 'Failed to load appointment details. Please try again.');
    }
  },

};