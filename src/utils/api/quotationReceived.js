import { apiGet, apiPost } from './http.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7041';

const normalizeKey = (key) =>
  String(key).toLowerCase().replace(/_/g, '');

// Tries to read a value from `obj` even if the backend JSON uses different casing.
const getByLooseKey = (obj, ...keys) => {
  if (!obj) return undefined;
  const objKeys = Object.keys(obj);

  for (const key of keys) {
    const target = normalizeKey(key);
    const hit = objKeys.find((p) => normalizeKey(p) === target);
    if (hit !== undefined) return obj[hit];
  }
  return undefined;
};

const toLocalDate = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const isSameLocalDate = (a, b) =>
  a && b ? a.toDateString() === b.toDateString() : false;

export const quotationReceivedAPI = {
  getList: async (filter, requestForQuotationStatus = 115) => {
    try {
      // Backend exposes QTDetailsAndPR; the old WebForms logic filters by status + (optionally) expiry date.
      const result = await apiGet(
        `${API_BASE_URL}/api/QuotationReceived/QTDetailsAndPR`
      );
      const list = result || [];

      const today = new Date();

      return (list || []).filter((item) => {
        const status = Number(
          getByLooseKey(item, 'STATUS', 'sTATUS', 'status')
        );
        if (status !== Number(requestForQuotationStatus)) return false;

        // filter: 1 => Today, 2 => Show All
        if (Number(filter) === 1) {
          const qtExp = toLocalDate(
            getByLooseKey(item, 'QT_EXPIR_DATE', 'qT_EXPIR_DATE')
          );
          return isSameLocalDate(qtExp, today);
        }

        return true;
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to load quotation list.');
    }
  },

  getDetails: async (quotaNo) => {
    try {
      const encodedQuotaNo = encodeURIComponent(quotaNo);
      const result = await apiGet(
        `${API_BASE_URL}/api/QuotationReceived/GetQuotationDetails?quotaNo=${encodedQuotaNo}`
      );
      return result;
    } catch (error) {
      throw new Error(error.message || 'Failed to load quotation details.');
    }
  },

  getSupplierIssueList: async (quotaNo) => {
    try {
      const encodedQuotaNo = encodeURIComponent(quotaNo);
      const result = await apiGet(
        `${API_BASE_URL}/api/QuotationReceived/SupplierIssueList?quotaNo=${encodedQuotaNo}`
      );
      return result || [];
    } catch (error) {
      throw new Error(error.message || 'Failed to load supplier issue list.');
    }
  },

  getSupplierReceivedList: async (quotaNo) => {
    try {
      const encodedQuotaNo = encodeURIComponent(quotaNo);
      const result = await apiGet(
        `${API_BASE_URL}/api/QuotationReceived/SupplierReceivedList?quotaNo=${encodedQuotaNo}`
      );
      return result || [];
    } catch (error) {
      throw new Error(error.message || 'Failed to load supplier received list.');
    }
  },

  updateSupplierReceived: async ({ quotaNo, supplierId }) => {
    try {
      return await apiPost(
        `${API_BASE_URL}/api/QuotationReceived/UpdateQuotationSupplierDetailsStatus`,
        { QT_NUM: quotaNo, SUPPLIER_ID: supplierId }
      );
    } catch (error) {
      throw new Error(error.message || 'Failed to mark supplier received.');
    }
  },

  undoSupplierReceived: async ({ quotaNo, supplierId }) => {
    try {
      return await apiPost(
        `${API_BASE_URL}/api/QuotationReceived/UpdateRecivedSupplierDetailsStatus`,
        { QT_NUM: quotaNo, SUPPLIER_ID: supplierId }
      );
    } catch (error) {
      throw new Error(error.message || 'Failed to undo supplier received.');
    }
  },

  forwardToOpen: async (quotaNo) => {
    try {
      const encodedQuotaNo = encodeURIComponent(quotaNo);
      return await apiPost(
        `${API_BASE_URL}/api/QuotationReceived/UpdateQTStatus?quotaNo=${encodedQuotaNo}`,
        {}
      );
    } catch (error) {
      throw new Error(error.message || 'Failed to forward quotation.');
    }
  }
};
