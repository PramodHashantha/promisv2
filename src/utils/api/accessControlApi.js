import { apiGet, apiPost } from './http.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7041';

export const accessControlAPI = {
  // Get all appointments (roles/positions)
  getAllAppointments: async () => {
    try {
      const response = await apiGet(`${API_BASE_URL}/api/AccessPermission/appointments`);
      return response;
    } catch (error) {
      console.error('Error getting appointments:', error);
      throw error;
    }
  },

  // Get navigation tree with checked status
  getNavigationTree: async (appointmentId = null, defaultName = null) => {
    try {
      let url = `${API_BASE_URL}/api/AccessPermission/navigation-tree`;
      const params = new URLSearchParams();
      
      if (appointmentId) {
        params.append('appointmentId', appointmentId);
      }
      if (defaultName) {
        params.append('defaultName', defaultName);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log('Fetching navigation tree from:', url);
      const response = await apiGet(url);
      console.log('Navigation tree response:', response);
      
      // Ensure we return an array
      if (!response) {
        return [];
      }
      if (Array.isArray(response)) {
        return response;
      }
      // If response is wrapped in a data property
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      console.warn('Unexpected navigation tree response format:', response);
      return [];
    } catch (error) {
      console.error('Error getting navigation tree:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      // Return empty array instead of throwing to prevent app crash
      return [];
    }
  },

  // Get all default permission names (admin only)
  getDefaultPermissions: async () => {
    try {
      const response = await apiGet(`${API_BASE_URL}/api/AccessPermission/default-permissions`);
      return response;
    } catch (error) {
      console.error('Error getting default permissions:', error);
      throw error;
    }
  },

  // Save permissions for an appointment
  savePermissions: async (appointmentId, selectedNavIds) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/AccessPermission/save-permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          APPOINTMENT_ID: appointmentId,
          SelectedNavIds: selectedNavIds
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save permissions: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving permissions:', error);
      throw error;
    }
  },

  // Save default permissions (admin only)
  saveDefaultPermissions: async (defaultName, selectedNavIds) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/AccessPermission/save-default-permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          DEFAULT_NAME: defaultName,
          SelectedNavIds: selectedNavIds
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save default permissions: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving default permissions:', error);
      throw error;
    }
  },

  // Check if current user is admin
  isAdmin: async () => {
    try {
      const response = await apiGet(`${API_BASE_URL}/api/AccessPermission/is-admin`);
      return response;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
};