import { apiGet, apiPost, apiPut, apiPatch, apiDelete, apiGetBlob } from "./http";

//  Sections
export const getAllSections = (signal) => apiGet("/api/Section", signal);
export const deleteSection = (sectionId, signal) =>
  apiDelete(`/api/Section/${sectionId}`, null, signal);

//Appointments

// ==================Store Management =======================

// Material Request All
export const getAllMaterialRequestsByTrnBy = (signal) =>
  apiGet("/api/MaterialRequest/GetStoreMaterialRequestByTrnBy", signal);
export const getAllMaterialRequests = (signal) =>
  apiGet("/api/MaterialRequest/GetAllMaterialRequests", signal);
export const getMaterialRequestMyTRNandMRStatus = (status, signal) =>
  apiGet(
    `/api/MaterialRequest/GetmaterialrequestMyTRNandMRStatus/${encodeURIComponent(status)}`,
    signal
  );
export const getStoreMaterialRequestByTrnByAndStatus = (status, signal) =>
  apiGet(
    `/api/MaterialRequest/GetStoreMaterialRequestByTrnByAndStatus/${status}`,
    signal
  );
export const getMaterialRequestByMrNo = (mrNo, signal) =>
  apiGet(`/api/MaterialRequest/${encodeURIComponent(mrNo)}`, signal);
export const getMaterialRequestItemQtyDetails = (mrNo, itemNumber, signal) =>
  apiGet(
    `/api/MaterialRequest/GetMaterialRequestItemQtyDetails?mrNo=${encodeURIComponent(mrNo)}&itemNumber=${encodeURIComponent(itemNumber)}`,
    signal
  );

// Stores In
export const getAllStoresInByTrnBy = (signal) =>
  apiGet("/api/Store/GetStoreListBySkno", signal);
export const getPaymentItemsByGrnNo = (grnNo, signal) =>
  apiGet(`/api/Store/GetPaymentItemsByGrnNo/${encodeURIComponent(grnNo)}`, signal);

// Stores Out
// Stores Out
export const GetStoreOutDetailsByMrNo = (mrNo, signal) =>
  apiGet(`/api/Store/GetStoreOutDetails/${encodeURIComponent(mrNo)}`, signal);
export const GetOutItemList = (refNo, signal) =>
  apiGet(`/api/Store/GetOutItemList/${encodeURIComponent(refNo)}`, signal);
export const SaveStoreOutItem = (request, signal) =>
  apiPost(`/api/Store/SaveStoreOutItem`, request, signal);
export const getIssueNumbersByRefNo = (mrNo, signal) =>
  apiGet(`/api/Store/GetIssueNumbersByRefNo/${encodeURIComponent(mrNo)}`, signal);
export const reprintStoreOut = (mrNo, issueNo, signal) =>
  apiGet(
    `/api/Store/ReprintStoreOut/${encodeURIComponent(mrNo)}/${encodeURIComponent(issueNo)}`,
    signal
  );

// Navigation
export const getNavigationMenu = (signal) => apiGet("/api/Navigation/Menu", signal);
export const getNavigationManagementItems = (signal) =>
  apiGet("/api/Navigation/manage", signal);
export const getNavigationParents = (signal) =>
  apiGet("/api/Navigation/parents", signal);
export const getNavigationById = (navId, signal) =>
  apiGet(`/api/Navigation/manage/${encodeURIComponent(navId)}`, signal);
export const saveNavigationItem = (request, signal) =>
  apiPost("/api/Navigation/manage", request, signal);

// Home / Dashboard
export const getOnMyDeskData = (signal) => apiGet("/api/Home/GetOnMyDeskData", signal);
export const getMonthlyProgress = (signal) => apiGet("/api/Home/GetMonthlyProgress", signal);
export const getPaymentDetails = (signal) => apiGet("/api/Home/GetPaymentDetails", signal);
export const getRecentMaterialRequests = (signal) =>
  apiGet("/api/Home/GetRecentMaterialRequests", signal);
export const getRecentIssuedItems = (signal) =>
  apiGet("/api/Home/GetRecentIssuedItems", signal);
export const getHomeQuotationSummary = (signal) =>
  apiGet("/api/Home/GetHomeQuotationSummary", signal);
export const getHomeTenderSummary = (signal) =>
  apiGet("/api/Home/GetHomeTenderSummary", signal);

// Auth
export const firstTimePasswordReset = (pfno, body, signal) =>
  apiPost(`/api/Auth/first-time-reset/${pfno}`, body, signal);

// Store Warehouse
export const getStoreWarehousesByPFNO = (signal) =>
  apiGet("/api/StoreWarehouse/GetStoreWarehousesByPFNO", signal);

// Store Rack
export const getStoreRackByWidAndItemNumber = (wId, itemNumber, signal) =>
  apiGet(
    `/api/StoreRack/GetStoreRackByWidAndItemNumber?wId=${encodeURIComponent(wId)}&itemNumber=${encodeURIComponent(itemNumber)}`,
    signal
  );
export const getStoreRackByRidAndItemNumber = (rId, itemNumber, signal) =>
  apiGet(
    `/api/StoreRack/GetStoreRackByRidAndItemNumber?rId=${encodeURIComponent(rId)}&itemNumber=${encodeURIComponent(itemNumber)}`,
    signal
  );

// Store Transactions
export const addToCart = (transactionDto, signal) =>
  apiPost("/api/Store/AddToCart", transactionDto, signal);
export const deleteFromCart = (deleteDto, signal) =>
  apiDelete("/api/Store/DeleteFromCart", deleteDto, signal);
export const processStoreOut = (requestDto, signal) =>
  apiPost("/api/Store/ProcessStoreOut", requestDto, signal);

export const GetStoreListBySknoAndStatus = (status, signal) =>
  apiGet(
    `/api/Store/GetStoreListBySknoAndStatus/${encodeURIComponent(status)}`,
    signal
  );
export const GetMaterialRequestData = (mr_id, signal) =>
  apiGet(`/api/Store/GetMaterialRequestData/${encodeURIComponent(mr_id)}`, signal);

export const UpdateVerificationSheetDownloadingStartTime = (W_ID, signal) =>
  apiPost(
    `/api/Store/UpdateVerificationSheetDownloadingStartTime/${encodeURIComponent(W_ID)}`,
    null,
    signal
  );
export const UpdateVerificationSheetDownloadingEndTime = (W_ID, SDD_ID, signal) =>
  apiPost(
    `/api/Store/UpdateVerificationSheetDownloadingEndTime/${encodeURIComponent(W_ID)}/${encodeURIComponent(SDD_ID)}`,
    null,
    signal
  );

export const UpdateRackCountStartingStatus = (r_Id, signal) =>
  apiPost(
    `/api/Store/UpdateRackCountStartingStatus/${encodeURIComponent(r_Id)}`,
    null,
    signal
  );
export const UpdateRackCountEndingStatus = (r_Id, SVRC_ID, signal) =>
  apiPost(
    `/api/Store/UpdateRackCountEndingStatus/${encodeURIComponent(r_Id)}/${encodeURIComponent(SVRC_ID)}`,
    null,
    signal
  );

export const GETStoreVerificationSheetDownloadDetails = (signal) =>
  apiGet(`/api/Store/GetStoreVerificationSheetDownloadDetails`, signal);
export const GETStoreVerificationRackData = (signal) =>
  apiGet(`/api/Store/GETStoreVerificationRackData`, signal);

//user
export const GetAllUsers = (signal) => apiGet(`/api/User`, signal);

//storeWarehouse
export const GetStoreWarehouseDetails = (signal) =>
  apiGet(`/api/StoreWarehouse/details`, signal);
export const GetStoreWarehouseByWID = (wId, signal) =>
  apiGet(
    `/api/StoreWarehouse/GetStoreWarehouseByWID/${encodeURIComponent(wId)}`,
    signal
  );
export const CreateStoreWarehouse = (request, signal) =>
  apiPost(`/api/StoreWarehouse`, request, signal);
export const DeleteStoreWarehouse = (wId, signal) =>
  apiDelete(`/api/StoreWarehouse/${encodeURIComponent(wId)}`, null, signal);
export const GetStoreWarehouseByResponsiblePerson = (signal) =>
  apiGet(`/api/StoreWarehouse/GetStoreWarehouseByResponsiblePerson`, signal);
export const GetStoreWarehouseDetailsByLoggedInUser = (signal) =>
  apiGet(`/api/StoreWarehouse/GetStoreWarehouseDetailsByLoggedInUser`, signal);
export const GetWarehouseItemShortagesWithDescription = (warehouseId, signal) =>
  apiGet(
    `/api/StoreWarehouse/GetWarehouseItemShortagesWithDescription/${warehouseId}`,
    signal
  );
export const GetAllWarehouses = (signal) => apiGet(`/api/StoreWarehouse`, signal);

//storeRack
export const GetAllStoreRacksByWID = (wId, signal) =>
  apiGet(`/api/StoreRack/GetAllStoreRacksByWID/${encodeURIComponent(wId)}`, signal);
export const GetStoreRacksByWIDAndItemNumber = (wId, itemNumber, signal) =>
  apiGet(
    `/api/StoreRack/GetStoreRacksByWIDAndItemNumber/${encodeURIComponent(wId)}/${encodeURIComponent(itemNumber)}`,
    signal
  );
export const GetStoreRackByRID = (rId, signal) =>
  apiGet(`/api/StoreRack/GetStoreRackByRID/${encodeURIComponent(rId)}`, signal);
export const UpsertStoreRack = (request, signal) => apiPost(`/api/StoreRack`, request, signal);
export const DeleteStoreRack = (rId, trnBy, signal) =>
  apiDelete(`/api/StoreRack/DeleteStoreRack/${encodeURIComponent(rId)}/${encodeURIComponent(trnBy)}`, null, signal);
export const GETItemINVirtualRack = (signal) =>
  apiGet(`/api/StoreRack/GETItemINVirtualRack`, signal);

//SearchItemCode
export const SearchItemCode = (text, signal) =>
  apiGet(`/api/Store/SearchItemCode/${encodeURIComponent(text)}`, signal);

//GetGoodByItemNumber
export const GetGoodByItemNumber = (itemNo, signal) =>
  apiGet(`/api/Store/GetGoodByItemNumber/${encodeURIComponent(itemNo)}`, signal);

//InsertValueStores - Save manual stock entry items (with optional GRN details)
export const insertValueStores = (request, signal) =>
  apiPost(`/api/Store/insertValueStores`, request, signal);
export const saveManualGRNHeader = (request, signal) =>
  apiPost(`/api/Store/saveManualGRNHeader`, request, signal);

//GetStoresByRackId
export const GetStoresByRackId = (rackId, signal) =>
  apiGet(`/api/Store/GetStoresByRackId/${encodeURIComponent(rackId)}`, signal);
export const GetStoresByRID = (rId, signal) =>
  apiGet(`/api/Store/GetStoresByRID/${encodeURIComponent(rId)}`, signal);

//GetStoresByItemNumber
export const GetStoresByItemNumber = (itemNumber, signal) =>
  apiGet(`/api/Store/GetStoresByItemNumber/${encodeURIComponent(itemNumber)}`, signal);


//Issue and Print Material Request from Inventory
export const IssueAndPrintFromInventory = (request, signal) =>
  apiPost(`/api/MaterialRequest/IssueAndPrint`, request, signal);

//Generate Way Bill PDF
export const GenerateWayBillPdf = (mrNo, signal) =>
  apiGetBlob(`/api/MaterialRequest/GenerateWayBillPdf/${encodeURIComponent(mrNo)}`, signal);

//Generate Way Bill Reprint PDF
export const GenerateWayBillReprintPdf = (mrNo, issueNo, signal) =>
  apiGetBlob(
    `/api/MaterialRequest/GenerateWayBillReprintPdf/${encodeURIComponent(mrNo)}/${encodeURIComponent(issueNo)}`,
    signal
  );

//Get Issue Numbers for a Material Request
export const GetIssueNumbers = (mrNo, signal) =>
  apiGet(`/api/MaterialRequest/GetIssueNumbers/${encodeURIComponent(mrNo)}`, signal);

//Insert Item Move details
export const insertMoveItemDetails = (request, signal) =>
  apiPost(`/api/Store/insertItemMoveDetails`, request, signal);

