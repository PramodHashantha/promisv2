import { apiGet, apiPost, apiPostMultipart } from '../client/httpClient';

const BASE = '/api/PurchasingRequestCreate';

export const getFormData = (signal) =>
  apiGet(`${BASE}/FormData`, signal);

export const getAccountExpenseCodes = (typeOfPurchase, prFor, prForUnit, prForLevel, signal) =>
  apiGet(`${BASE}/AccountExpenseCodes?typeOfPurchase=${typeOfPurchase}&prFor=${prFor}&prForUnit=${encodeURIComponent(prForUnit ?? '')}&prForLevel=${encodeURIComponent(prForLevel ?? '')}`, signal);

export const getBudgetItems = (year, signal) =>
  apiGet(`${BASE}/BudgetItems?year=${year}`, signal);

export const getBudgetDetail = (rowId, signal) =>
  apiGet(`${BASE}/BudgetDetail/${rowId}`, signal);

export const getApprovalHierarchy = (signal) =>
  apiGet(`${BASE}/ApprovalHierarchy`, signal);

export const getItemByNumber = (itemNumber, signal) =>
  apiGet(`${BASE}/Item/${encodeURIComponent(itemNumber)}`, signal);

export const searchItems = (query, signal) =>
  apiGet(`${BASE}/Items/Search?q=${encodeURIComponent(query)}`, signal);

export const getTenderLimit = (typeOfPurchase, signal) =>
  apiGet(`${BASE}/TenderLimit/${typeOfPurchase}`, signal);

export const getAppointmentHierarchy = (signal) =>
  apiGet(`${BASE}/AppointmentHierarchy`, signal);

export const getAuthorizationChain = (estimatedCost, typeOfPurchase, proceedAsTender, signal) =>
  apiGet(`${BASE}/AuthorizationChain?estimatedCost=${estimatedCost}&typeOfPurchase=${typeOfPurchase}&proceedAsTender=${proceedAsTender ?? false}`, signal);

export const submitPurchaseRequest = (body, signal) =>
  apiPost(`${BASE}/Submit`, body, signal);

export const saveDraftPurchaseRequest = (body, signal) =>
  apiPost(`${BASE}/SaveDraft`, body, signal);

export const getPRFiles = (sysId, signal) =>
  apiGet(`${BASE}/Files/${sysId}`, signal);

export const uploadPRFiles = (sysId, newFiles, keepUrls, status, signal) => {
  const formData = new FormData();
  newFiles.forEach((f) => formData.append('files', f));
  keepUrls.forEach((u) => formData.append('keepUrls', u));
  return apiPostMultipart(`${BASE}/Files/${sysId}?status=${status}`, formData, signal);
};