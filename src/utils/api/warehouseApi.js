// warehouseApi.js - API Service for Warehouse Management

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7041';

/**
 * Get authorization token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem("accessToken");
};

/**
 * Get current user's PFNO from localStorage
 */
const getPFNO = () => {
  return localStorage.getItem("pfno") || "1"; // Default to 1 if not set
};

/**
 * Get current user name from localStorage
 */
const getCurrentUser = () => {
  return localStorage.getItem("userName") || "Admin";
};

/**
 * Helper function to handle API responses
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorData.title || errorMessage;
      } else {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }
    } catch (e) {
      console.error('Could not parse error response:', e);
    }

    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  const text = await response.text();

  if (!text || text.trim() === '') {
    return null;
  }

  if (contentType && contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON response:', text);
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    }
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn('Response is not JSON, returning as text:', text);
    return text;
  }
};

/**
 * Get all warehouses from API
 */
export const getWarehouses = async () => {
  const token = getAuthToken();
  const pfno = getPFNO();

  const response = await fetch(`${API_BASE_URL}/api/StoreWarehouse/GetStoreWarehousesByPFNO?pfno=${pfno}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  return await handleResponse(response);
};

/**
 * Create new warehouse
 * POST /api/StoreWarehouse
 */
export const createWarehouse = async (warehouseData) => {
  const token = getAuthToken();
  const currentUser = getCurrentUser();
  const pfno = getPFNO();

  // Prepare the request body matching API schema
  const requestBody = {
    w_ID: 0, // 0 for new warehouse
    w_CODE: warehouseData.code,
    w_NAME: warehouseData.name,
    w_DESCRIPTION: warehouseData.description || "",
    responsible_PERSON: warehouseData.assigner || "",
    status: 0, // Default status
    create_BY: currentUser,
    created_DATE: new Date().toISOString(),
    modified_BY: "",
    modified_DATE: new Date().toISOString(),
    w_TYPE: warehouseData.type || "Main",
    sKno: warehouseData.skNo || "",
    pfno: parseInt(pfno) // Include pfno
  };

  console.log('Creating warehouse with data:', requestBody);

  const response = await fetch(`${API_BASE_URL}/api/StoreWarehouse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(requestBody)
  });

  return await handleResponse(response);
};

/**
 * Update existing warehouse
 * PUT /api/StoreWarehouse/{W_ID}
 */
export const updateWarehouse = async (warehouseId, warehouseData) => {
  const token = getAuthToken();
  const currentUser = getCurrentUser();
  const pfno = getPFNO();

  // Prepare the request body matching API schema
  const requestBody = {
    w_ID: warehouseId,
    w_CODE: warehouseData.code,
    w_NAME: warehouseData.name,
    w_DESCRIPTION: warehouseData.description || "",
    responsible_PERSON: warehouseData.assigner || "",
    status: warehouseData.status !== undefined ? warehouseData.status : 0,
    create_BY: warehouseData.create_BY || currentUser,
    created_DATE: warehouseData.created_DATE || new Date().toISOString(),
    modified_BY: currentUser,
    modified_DATE: new Date().toISOString(),
    w_TYPE: warehouseData.type || "Main",
    sKno: warehouseData.skNo || "",
    pfno: parseInt(pfno) // Include pfno
  };

  console.log('Updating warehouse with data:', requestBody);

  const response = await fetch(`${API_BASE_URL}/api/StoreWarehouse/${warehouseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(requestBody)
  });

  return await handleResponse(response);
};

/**
 * Delete warehouse
 * DELETE /api/StoreWarehouse/{W_ID}?trnBy={trnBy}
 */
export const deleteWarehouse = async (warehouseId) => {
  const token = getAuthToken();
  const currentUser = getCurrentUser();

  console.log('Deleting warehouse ID:', warehouseId, 'by user:', currentUser);

  const response = await fetch(`${API_BASE_URL}/api/StoreWarehouse/${warehouseId}?trnBy=${encodeURIComponent(currentUser)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  return await handleResponse(response);
};

/**
 * Get all racks by warehouse ID
 */
export const getAllStoreRacksByWID = async (wId) => {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}/api/StoreRack/GetAllStoreRacksByWID/${wId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  return await handleResponse(response);
};

/**
 * Create new store rack
 */
export const createStoreRack = async (rackData) => {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}/api/StoreRack`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(rackData)
  });

  return await handleResponse(response);
};

/**
 * Update rack status
 */
export const updateRack = async (rackData) => {
  const token = getAuthToken();

  const rackId = rackData.r_ID;

  if (!rackId || rackId === 0) {
    throw new Error('Valid Rack ID (r_ID) is required for update');
  }

  const response = await fetch(`${API_BASE_URL}/api/StoreRack/UpdateStoreRackStatus/${rackId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(rackData)
  });

  return await handleResponse(response);
};

/**
 * Delete rack
 */
export const deleteRack = async (rackId, trnBy) => {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}/api/StoreRack/DeleteStoreRack/${rackId}/${trnBy}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  return await handleResponse(response);
};