import { apiGet, apiPost } from "./http.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://localhost:7041";

export const purchaseRequestUploadItemsApi = {
  getDraftPurchaseRequests: async () =>
    apiGet(`${API_BASE_URL}/api/PurchaseRequestUploadItems/GetDraftPurchaseRequests`),

  getSavedItemsBySysId: async (sysId) =>
    apiGet(`${API_BASE_URL}/api/PurchaseRequestUploadItems/GetSavedItemsBySysId/${sysId}`),

  getBudgetNosBySysId: async (sysId) =>
    apiGet(`${API_BASE_URL}/api/PurchaseRequestUploadItems/GetBudgetNosBySysId/${sysId}`),

  uploadItems: async (payload) =>
    apiPost(`${API_BASE_URL}/api/PurchaseRequestUploadItems/UploadItems`, payload),
};

export default purchaseRequestUploadItemsApi;
