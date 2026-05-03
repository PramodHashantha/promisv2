import { useEffect, useState, useMemo, useCallback } from "react";
import Table from "@/components/shared/table/Table";
import Swal from "sweetalert2";
import { GetStoreListBySknoAndStatus, GetMaterialRequestData, GetAllUsers, GETItemINVirtualRack, IssueAndPrintFromInventory, GenerateWayBillPdf, GenerateWayBillReprintPdf, GetIssueNumbers, GetOutItemList, SaveStoreOutItem, GetStoresByItemNumber, GetStoreWarehouseDetailsByLoggedInUser,GetAllWarehouses, GetStoreRacksByWIDAndItemNumber, GetStoreRackByRID, GetStoresByRID } from "@/utils/api/api";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import SearchableDropdown from "@/components/dropdown/SearchableDropdown";

const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return dateString;
  }
};

// Filter options matching the image
const filterOptions = [
  "Material Request",
  "Request Approved",
  "Issued With Not Approval",
  "Issued With Approval"
];

// Map filter text to status code (backend expects integer)
const getStatusCode = (filterText) => {
  const statusMap = {
    "Material Request": 1,
    "Request Approved": 5,
    "Issued With Not Approval": 9,
    "Issued With Approval": 10
  };
  return statusMap[filterText] ?? 1; // Default to 1 if not found
};

const StoresOutFromInventoryTable = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [requestItems, setRequestItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [outItems, setOutItems] = useState([]);
  const [selectedCarrier, setSelectedCarrier] = useState("");
  const [selectedIssueNo, setSelectedIssueNo] = useState("");
  const [statusFilter, setStatusFilter] = useState("Material Request");
  const [carriers, setCarriers] = useState([]);
  const [loadingCarriers, setLoadingCarriers] = useState(false);
  const [issueNumbers, setIssueNumbers] = useState([]);
  const [loadingIssueNumbers, setLoadingIssueNumbers] = useState(false);
  
  // Modal state for item selection
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [racks, setRacks] = useState([]);
  const [selectedRackId, setSelectedRackId] = useState("");
  const [selectedRack, setSelectedRack] = useState(null); // Store rack details (X, Y dimensions)
  const [binTable, setBinTable] = useState([]); // Grid of bins (X, Y coordinates)
  const [storesInRack, setStoresInRack] = useState([]); // Items in each bin
  const [selectedBin, setSelectedBin] = useState({ x: null, y: null }); // Selected bin coordinates
  const [issueQuantity, setIssueQuantity] = useState("");
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingRacks, setLoadingRacks] = useState(false);
  const [loadingBins, setLoadingBins] = useState(false);
  
  // Cache warehouses to avoid reloading on every modal open
  const [warehousesCache, setWarehousesCache] = useState(null);

  // Handle Issue And Print
  const handleIssueAndPrint = async () => {
    if (outItems.length === 0) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Please add items to issue" });
      return;
    }
    if (!selectedCarrier) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Please select a carrier" });
      return;
    }
    if (!selectedRowData) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Please select a request first" });
      return;
    }

    try {
      // Get MR_NO from selectedRowData
      const mrNo = selectedRowData.mR_NO ?? selectedRowData.inventorY_REQUEST_ID ?? selectedRowData.grN_NO ?? "";
      
      if (!mrNo) {
        Swal.fire({ 
          icon: "error", 
          title: "Error", 
          text: "Material Request Number not found" 
        });
        return;
      }

      // Get selected carrier details
      const carrier = carriers.find(c => (c.PFNO ?? c.pfno) === selectedCarrier);
      const carrierName = carrier?.displayName || carrier?.TITLE || carrier?.FULLNAME || selectedCarrier;

      // Show loading
      Swal.fire({
        title: "Processing...",
        text: "Issuing material request...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Call API to issue items
      const request = {
        MR_NO: mrNo,
        CarrierPFNO: selectedCarrier
      };

      const response = await IssueAndPrintFromInventory(request);

      if (response && response.success) {
        // Function to refresh page data
        const refreshPageData = () => {
          // Clear selections
          setOutItems([]);
          setSelectedCarrier("");
          setSelectedIssueNo("");
          setSelectedRowData(null);
          setRequestItems([]);
          
          // Reload the store list to reflect updated status
          // This will trigger the useEffect that reloads data
          setStatusFilter(statusFilter);
        };

        // Only generate PDF if warehouse type is not "Sub"
        if (response.warehouseType !== "Sub") {
          try {
            // Generate PDF and trigger print dialog using hidden iframe
            const pdfBlob = await GenerateWayBillPdf(mrNo);
            const url = window.URL.createObjectURL(pdfBlob);
            
            // Create hidden iframe
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = 'none';
            iframe.style.display = 'none';
            iframe.src = url;
            
            // Append to body
            document.body.appendChild(iframe);
            
            // Trigger print dialog when PDF loads
            iframe.onload = () => {
              setTimeout(() => {
                iframe.contentWindow?.print();
                
                // Clean up after print dialog closes (use afterprint event or long delay)
                const cleanup = () => {
                  setTimeout(() => {
                    if (document.body.contains(iframe)) {
                      document.body.removeChild(iframe);
                      window.URL.revokeObjectURL(url);
                    }
                    // Refresh page data after printing is complete
                    refreshPageData();
                  }, 1000);
                };
                
                // Try to use afterprint event if available
                if (iframe.contentWindow) {
                  iframe.contentWindow.addEventListener('afterprint', cleanup);
                  // Fallback: cleanup after 30 seconds if event doesn't fire
                  setTimeout(cleanup, 30000);
                } else {
                  // Fallback: cleanup after 10 seconds
                  setTimeout(cleanup, 10000);
                }
              }, 500);
            };
          } catch (pdfError) {
            console.error("Error generating PDF:", pdfError);
            await Swal.fire({
              icon: "error",
              title: "Error",
              text: "Failed to generate PDF. Please try again.",
              confirmButtonColor: "#ef4444"
            });
            // Refresh data even if PDF generation fails
            refreshPageData();
          }
        } else {
          // If warehouse type is "Sub", refresh immediately (no PDF generation)
          refreshPageData();
        }

        await Swal.fire({
        icon: "success",
        title: "Success",
          text: response.message || `Material Request issued successfully. Carrier: ${carrierName}`,
          confirmButtonColor: "#10b981",
          timer: 3000,
          timerProgressBar: true
      });
      } else {
        throw new Error(response?.message || "Failed to issue material request");
      }
    } catch (error) {
      console.error("Error issuing material request:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "Failed to issue material request. Please try again.",
        confirmButtonColor: "#ef4444"
      });
    }
  };

  // Fetch carriers (users) on component mount
  useEffect(() => {
    const loadCarriers = async () => {
      setLoadingCarriers(true);
      try {
        const users = await GetAllUsers();
        // console.log("All users response:", users);
        
        // Normalize user data - handle different field name variations
        const normalizedUsers = Array.isArray(users) 
          ? users.map(user => ({
              PFNO: user.PFNO ?? user.pfno ?? user.Pfno,
              TITLE: user.TITLE ?? user.title ?? user.Title,
              FULLNAME: user.FULLNAME ?? user.fullname ?? user.FullName,
              INITIAL: user.INITIAL ?? user.initial ?? user.Initial,
              SURNAME: user.SURNAME ?? user.surname ?? user.Surname,
              // Use TITLE if available, otherwise construct from INITIAL + SURNAME + PFNO
              displayName: user.TITLE ?? user.title ?? user.Title ?? 
                          `${user.INITIAL ?? user.initial ?? ''} ${user.SURNAME ?? user.surname ?? ''} (${user.PFNO ?? user.pfno ?? ''})`.trim()
            }))
          : [];
        
        // console.log("Normalized carriers:", normalizedUsers);
        setCarriers(normalizedUsers);
      } catch (error) {
        console.error("Error loading carriers:", error);
        Swal.fire({
          icon: "warning",
          title: "Warning",
          text: "Could not load carriers. Please try again."
        });
        setCarriers([]);
      } finally {
        setLoadingCarriers(false);
      }
    };

    loadCarriers();
  }, []);

  // Load warehouses for logged-in user with caching (matching old system's LoadWarehous)
  const loadWarehouses = useCallback(async (useCache = true) => {
    // Return cached data if available
    if (useCache && warehousesCache) {
      setWarehouses(warehousesCache);
      return;
    }

    try {
      setLoadingWarehouses(true);
      const warehousesData = await GetAllWarehouses();
      const warehousesList = warehousesData || [];
      setWarehouses(warehousesList);
      // Cache the warehouses
      setWarehousesCache(warehousesList);
    } catch (error) {
      console.error("Error loading warehouses:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load warehouses" });
    } finally {
      setLoadingWarehouses(false);
    }
  }, [warehousesCache]);

  // Load racks filtered by warehouse and item number (matching old system's LoadRackByItemNo)
  const loadRacks = useCallback(async (warehouseId, itemNumber) => {
    if (!warehouseId || !itemNumber) {
      setRacks([]);
      return;
    }

    try {
      setLoadingRacks(true);
      const racksData = await GetStoreRacksByWIDAndItemNumber(warehouseId, itemNumber);
      setRacks(racksData || []);
    } catch (error) {
      console.error("Error loading racks:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load racks" });
      setRacks([]);
    } finally {
      setLoadingRacks(false);
    }
  }, []);

  // Load bin table when rack is selected (optimized with parallel API calls)
  const loadBinTable = useCallback(async (rackId) => {
    if (!rackId) {
      setSelectedRack(null);
      setBinTable([]);
      setStoresInRack([]);
      return;
    }

    try {
      setLoadingBins(true);
      
      // Parallelize API calls: fetch rack details and stores simultaneously
      const [rackDetails, stores] = await Promise.all([
        GetStoreRackByRID(rackId),
        GetStoresByRID(rackId)
      ]);

      if (!rackDetails) {
        Swal.fire({ icon: "error", title: "Error", text: "Rack details not found" });
        return;
      }

      setSelectedRack(rackDetails);
      
      const x = parseInt(rackDetails.X ?? rackDetails.x ?? 0);
      const y = parseInt(rackDetails.Y ?? rackDetails.y ?? 0);

      if (x <= 0 || y <= 0) {
        setBinTable([]);
        setStoresInRack([]);
        return;
      }

      // Optimized bin table creation (pre-allocate array)
      const table = new Array(y);
      for (let row = 0; row < y; row++) {
        const rowData = new Array(x);
        for (let col = 0; col < x; col++) {
          rowData[col] = { x: col, y: row, display: `(${row + 1},${col + 1})` };
        }
        table[row] = rowData;
      }
      setBinTable(table);

      // Set stores (already fetched in parallel)
      setStoresInRack(stores || []);
    } catch (error) {
      console.error("Error loading bin table:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load bin table" });
    } finally {
      setLoadingBins(false);
    }
  }, []);

  // Handle opening the item selection modal
  const handleOpenItemModal = useCallback((item) => {
    const itemNumber = item.ITEM_NUMBER ?? item.item_number ?? item.itemNumber ?? item.ITEM_NO ?? item.item_no ?? item.itemNo ?? "";
    const requestedQty = item.QTY ?? item.qty ?? item.Qty ?? item.quantity ?? 0;
    
    setSelectedItemForModal({
      ...item,
      itemNumber,
      requestedQty
    });
    setIssueQuantity(requestedQty.toString());
    
    // Reset state
    setSelectedWarehouseId("");
    setSelectedRackId("");
    setSelectedRack(null);
    setBinTable([]);
    setStoresInRack([]);
    setSelectedBin({ x: null, y: null });
    setRacks([]);
    
    // Show modal immediately (don't wait for warehouses)
    setShowItemModal(true);
    
    // Load warehouses in background (non-blocking)
    loadWarehouses(true); // Use cache if available
  }, [loadWarehouses]);

  // Handle closing the modal
  const handleCloseItemModal = () => {
    setShowItemModal(false);
    setSelectedItemForModal(null);
    setSelectedWarehouseId("");
    setSelectedRackId("");
    setSelectedRack(null);
    setBinTable([]);
    setStoresInRack([]);
    setSelectedBin({ x: null, y: null });
    setRacks([]);
    setIssueQuantity("");
  };

  // Handle warehouse selection change
  const handleWarehouseChange = useCallback(async (warehouseId) => {
    setSelectedWarehouseId(warehouseId);
    setSelectedRackId("");
    setSelectedRack(null);
    setBinTable([]);
    setStoresInRack([]);
    setSelectedBin({ x: null, y: null });
    
    if (warehouseId && selectedItemForModal?.itemNumber) {
      await loadRacks(warehouseId, selectedItemForModal.itemNumber);
    }
  }, [selectedItemForModal?.itemNumber, loadRacks]);

  // Handle rack selection change
  const handleRackChange = useCallback(async (rackId) => {
    setSelectedRackId(rackId);
    setSelectedBin({ x: null, y: null });
    await loadBinTable(rackId);
  }, [loadBinTable]);

  // Handle bin selection from dropdown
  const handleBinSelect = (binValue) => {
    if (!binValue) {
      setSelectedBin({ x: null, y: null });
      return;
    }
    // Parse the bin value - these are DB values (exact as from database)
    // Store them directly without any conversion
    const [x, y] = binValue.split('_').map(Number);
    // Store DB values directly (no conversion)
    setSelectedBin({ x, y });
  };

  // Get available bins (bins that have the selected item) - memoized for performance
  const getAvailableBins = useMemo(() => {
    if (!selectedItemForModal?.itemNumber || !storesInRack.length) {
      return [];
    }

    const itemNumber = selectedItemForModal.itemNumber.toUpperCase();
    const availableBinsMap = new Map(); // Use Map for O(1) lookup instead of O(n) find

    // Process stores efficiently
    for (const store of storesInRack) {
      const storeX = parseInt(store.X ?? store.x ?? 0);
      const storeY = parseInt(store.Y ?? store.y ?? 0);
      const storeItemNumber = (store.ITEM_NUMBER ?? store.iteM_NUMBER ?? store.item_number ?? store.ITEM_NO ?? store.item_no ?? "").toUpperCase();
      
      if (storeItemNumber === itemNumber) {
        const binValue = `${storeX}_${storeY}`;
        
        // Only add if not already in map (faster than array.find)
        if (!availableBinsMap.has(binValue)) {
          const displayName = `(${storeY},${storeX})`;
          const qty = store.AVAILABLE_QTY ?? store.availablE_QTY ?? store.Available_Qty ?? 0;
          
          availableBinsMap.set(binValue, {
            x: storeX,
            y: storeY,
            value: binValue,
            display: displayName,
            qty: qty
          });
        }
      }
    }

    // Convert map to array and sort
    const availableBins = Array.from(availableBinsMap.values());
    return availableBins.sort((a, b) => {
      // Sort by Y first, then X
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });
  }, [selectedItemForModal?.itemNumber, storesInRack]);

  // Get selected bin value for dropdown (using DB values exactly as they are)
  const getSelectedBinValue = () => {
    if (selectedBin.x === null || selectedBin.y === null) {
      return "";
    }
    // Use DB values directly (no conversion)
    return `${selectedBin.x}_${selectedBin.y}`;
  };

  // Handle adding item to out items list (save to database like old system)
  const handleAddItemToOutList = async () => {
    if (!selectedItemForModal) {
      Swal.fire({ icon: "warning", title: "Warning", text: "No item selected" });
      return;
    }

    if (!selectedRowData) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Please select a request first" });
      return;
    }

    if (!selectedWarehouseId) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Please select a warehouse" });
      return;
    }

    if (!selectedRackId) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Please select a rack" });
      return;
    }

    if (selectedBin.x === null || selectedBin.y === null) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Please select a bin from the table" });
      return;
    }

    const qty = parseFloat(issueQuantity);
    if (isNaN(qty) || qty <= 0) {
      Swal.fire({ icon: "warning", title: "Warning", text: "Please enter a valid issue quantity" });
      return;
    }

    const requestedQty = selectedItemForModal.requestedQty ?? 0;
    if (qty > requestedQty) {
      Swal.fire({ icon: "warning", title: "Warning", text: `Issue quantity cannot exceed requested quantity (${requestedQty})` });
      return;
    }

    // Get item details from selected bin
    const itemNumber = selectedItemForModal.itemNumber;
    if (!itemNumber) {
      Swal.fire({ icon: "error", title: "Error", text: "Item number not found" });
      return;
    }

    // Find store in the selected bin
    // selectedBin.x and selectedBin.y are DB values (exact as from database)
    // Use them directly without any conversion
    const dbX = parseInt(selectedBin.x);
    const dbY = parseInt(selectedBin.y);
    
    // console.log("Finding store in bin:", {
    //   selectedBin,
    //   dbX,
    //   dbY,
    //   itemNumber,
    //   storesInRackSample: storesInRack.slice(0, 10).map(s => ({
    //     X: s.X ?? s.x,
    //     Y: s.Y ?? s.y,
    //     ITEM_NUMBER: s.ITEM_NUMBER ?? s.itemNumber ?? s.iteM_NUMBER,
    //     REF_NO: s.REF_NO ?? s.reF_NO
    //   }))
    // });
    
    const storeInBin = storesInRack.find(store => {
      const storeX = parseInt(store.X ?? store.x ?? 0);
      const storeY = parseInt(store.Y ?? store.y ?? 0);
      const storeItemNumber = (store.ITEM_NUMBER ?? store.itemNumber ?? store.iteM_NUMBER ?? "").toUpperCase();
      const matches = storeX === dbX && storeY === dbY && storeItemNumber === itemNumber.toUpperCase();
      
      // if (matches) {
      //   console.log("Found matching store:", {
      //     storeX,
      //     storeY,
      //     storeItemNumber,
      //     dbX,
      //     dbY,
      //     itemNumber: itemNumber.toUpperCase(),
      //     REF_NO: store.REF_NO ?? store.reF_NO
      //   });
      // }
      
      return matches;
    });

    if (!storeInBin) {
      console.error("Store not found in bin:", {
        selectedBin,
        itemNumber,
        storesInRack: storesInRack.map(s => ({
          X: s.X ?? s.x,
          Y: s.Y ?? s.y,
          ITEM_NUMBER: s.ITEM_NUMBER ?? s.itemNumber ?? s.iteM_NUMBER
        }))
      });
      Swal.fire({ icon: "error", title: "Error", text: "Item not found in selected bin" });
      return;
    }

    const unitPrice = parseFloat(storeInBin.UNIT_PRICE ?? storeInBin.unitPrice ?? storeInBin.UNIT_PRICE1 ?? 0);
    
    // Get REF_NO from storeInBin - this is critical for backend matching
    // The backend checks REF_NO matches, so we must use the exact value from the store record
    const refNoFromStore = storeInBin.REF_NO ?? storeInBin.reF_NO ?? storeInBin.Ref_No ?? "";
    
    // console.log("Store in bin details:", {
    //   storeInBin,
    //   refNoFromStore,
    //   selectedBin,
    //   unitPrice
    // });

    try {
      // Show loading
      Swal.fire({
        title: "Saving...",
        text: "Please wait...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Get MR_NO
      const mrNo = selectedRowData.mR_NO ?? selectedRowData.inventorY_REQUEST_ID ?? selectedRowData.grN_NO ?? "";
      
      // Use REF_NO from storeInBin (this is what the backend expects to match)
      // The backend repository checks: (s.REF_NO?.ToString() ?? s.ref_no?.ToString() ?? "") == request.REF_NO
      // So we must use the exact REF_NO from the store record, even if it's empty string
      const refNo = refNoFromStore || ""; // Ensure it's never null/undefined

      if (!mrNo) {
        Swal.fire({ icon: "error", title: "Error", text: "Material Request Number not found" });
        return;
      }

      // Validate selected bin coordinates
      if (selectedBin.x === null || selectedBin.x === undefined || selectedBin.y === null || selectedBin.y === undefined) {
        Swal.fire({ icon: "error", title: "Error", text: "Invalid bin coordinates" });
        return;
      }

      // Validate selected rack ID
      if (!selectedRackId || isNaN(parseInt(selectedRackId))) {
        Swal.fire({ icon: "error", title: "Error", text: "Invalid rack ID" });
        return;
      }

      // Save to database (matching old system's StoresOutINVNew)
      // Use X and Y exactly as they are from database (no conversion)
      // selectedBin.x and selectedBin.y are DB values, send them directly to backend
      const saveRequest = {
        R_ID: parseInt(selectedRackId),
        X: dbX, // Use DB values directly (no conversion)
        Y: dbY, // Use DB values directly (no conversion)
        ITEM_NUMBER: itemNumber,
        REF_NO: refNo, // This must match the REF_NO in the store record
        MR_NO: mrNo,
        OUT_QTY: parseFloat(qty),
        UNIT_PRICE: parseFloat(unitPrice)
      };
      
      // console.log("Saving with coordinates:", {
      //   selectedBin,
      //   dbX,
      //   dbY,
      //   saveRequest
      // });

      // console.log("Saving store out item:", saveRequest);
      // console.log("Store in bin:", storeInBin);

      await SaveStoreOutItem(saveRequest);

      // Reload Out Item List from database
      await loadOutItemList(mrNo);

    handleCloseItemModal();
    Swal.fire({ icon: "success", title: "Success", text: "Item added to out list", timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error("Error saving item:", error);
      Swal.fire({ 
        icon: "error", 
        title: "Error", 
        text: error.message || "Failed to save item. Please try again." 
      });
    }
  };

  // Load Out Item List from database (matching old system's loadStoreItemByMRNo)
  const loadOutItemList = useCallback(async (refNo) => {
    if (!refNo) return;

    try {
      const outItemsFromDb = await GetOutItemList(refNo);
      
      // Transform to match component state structure
      const transformedItems = outItemsFromDb.map(item => ({
        R_ID: item.r_ID,
        X: item.x,
        Y: item.y,
        itemNo: item.iteM_NUMBER ?? "",
        issueNo: item.issuE_NO ?? "",
        qty: item.ouT_QTY ?? 0,
        status: item.ststus ?? 1,
        ISSUE_REF: item.issuE_REF ?? ""
      }));

      setOutItems(transformedItems);
    } catch (error) {
      console.error("Error loading Out Item List:", error);
      setOutItems([]);
    }
  }, []);

  // Highly optimized field finder function with caching
  const findField = useCallback((obj, possibleNames) => {
    // Fast path: try exact matches first (most common case)
    for (const name of possibleNames) {
      if (obj[name] !== undefined) {
        return obj[name];
      }
    }
    
    // Slow path: case-insensitive search (only if exact match fails)
    // Cache lowercase keys to avoid repeated Object.keys() calls
    const lowerKeys = Object.keys(obj).reduce((acc, key) => {
      acc[key.toLowerCase()] = key;
      return acc;
    }, {});
    
    for (const name of possibleNames) {
      const lowerName = name.toLowerCase();
      const foundKey = lowerKeys[lowerName];
      if (foundKey && obj[foundKey] !== undefined) {
        return obj[foundKey];
      }
    }
    
    return null;
  }, []);

  // Memoized field name arrays to avoid recreation
  const itemNumberNames = useMemo(() => [
    'ITEM_NUMBER', 'item_number', 'itemNumber', 'ItemNumber',
    'ITEM_NO', 'item_no', 'itemNo', 'ItemNo',
    'ITEMNUMBER', 'itemnumber', 'Item_Number', 'item_Number',
    'ITEM', 'item', 'Item'
  ], []);

  const qtyNames = useMemo(() => ['QTY', 'qty', 'Qty', 'quantity', 'requesteD_QTY', 'QTY_VALUE', 'qty_value'], []);
  const mrIdNames = useMemo(() => ['MR_ID', 'id', 'mrId', 'MrId', 'MRID', 'mrid'], []);

  // Optimized handler for viewing row details
  const createOnViewHandler = useCallback((rowData) => {
    return async () => {
      try {
        setLoadingItems(true);
        setSelectedRowData(rowData);
        setOutItems([]);
        setSelectedCarrier("");
        setSelectedIssueNo("");
        setIssueNumbers([]);
        
        // Get MR_NO and MR_ID upfront
        const mrNo = rowData.mR_NO ?? rowData.inventorY_REQUEST_ID ?? rowData.grN_NO ?? rowData.grn_NO ?? "";
        const mrId = rowData.MR_ID ?? rowData.mR_ID;
        
        // Parallelize independent API calls for faster loading
        const promises = [];
        
        // Load Out Item List from database (if mrNo exists)
        if (mrNo) {
          promises.push(loadOutItemList(mrNo));
          
          // Load issue numbers for reprint dropdown
          promises.push(
            (async () => {
              try {
                setLoadingIssueNumbers(true);
                const issueNos = await GetIssueNumbers(mrNo);
                if (Array.isArray(issueNos)) {
                  setIssueNumbers(issueNos.filter(no => no && no.trim() !== ""));
                } else {
                  setIssueNumbers([]);
                }
              } catch (issueError) {
                console.error("Error loading issue numbers:", issueError);
                setIssueNumbers([]);
              } finally {
                setLoadingIssueNumbers(false);
              }
            })()
          );
        }
        
        // Load Material Request Data (if mrId exists)
        if (mrId) {
          promises.push(
            (async () => {
              try {
                const items = await GetMaterialRequestData(String(mrId));
                
                // Optimized normalization with direct property access first (fastest path)
                const normalizedItems = Array.isArray(items) 
                  ? items.map((item) => {
                      // Fast path: try most common field names directly first (no function call overhead)
                      const itemNumber = item.ITEM_NUMBER ?? item.item_number ?? item.itemNumber ?? 
                                        item.ITEM_NO ?? item.item_no ?? item.itemNo ??
                                        findField(item, itemNumberNames);
                      
                      const qty = item.QTY ?? item.qty ?? item.Qty ?? item.quantity ?? 
                                  item.requesteD_QTY ?? item.QTY_VALUE ?? 
                                  (findField(item, qtyNames) ?? 0);
                      
                      const mrIdValue = item.MR_ID ?? item.id ?? item.mrId ?? 
                                       findField(item, mrIdNames);
                      
                      if (!itemNumber) {
                        console.warn("Item - No ITEM_NUMBER found. Available keys:", Object.keys(item));
                      }
                      
                      return {
                        MR_ID: mrIdValue,
                        ITEM_NUMBER: itemNumber,
                        QTY: qty
                      };
                    })
                  : [];
                
                setRequestItems(normalizedItems);
              } catch (itemError) {
                console.error(`Could not fetch details for MR_ID ${mrId}:`, itemError);
                setRequestItems([]);
                Swal.fire({ 
                  icon: "warning", 
                  title: "Warning", 
                  text: "Could not load request items" 
                });
              }
            })()
          );
        } else {
          console.warn("No MR_ID found in row data:", rowData);
          setRequestItems([]);
        }
        
        // Wait for all parallel requests to complete
        await Promise.all(promises);
      } catch (e) {
        Swal.fire({ 
          icon: "error", 
          title: "Error", 
          text: e?.message || "Failed to load store details" 
        });
      } finally {
        setLoadingItems(false);
      }
    };
  }, [loadOutItemList, findField, itemNumberNames, qtyNames, mrIdNames]);

  useEffect(() => {
    // Clear selected row data when filter changes
    setSelectedRowData(null);
    setRequestItems([]);
    setOutItems([]);
    // Set loading immediately for better UX
    setLoading(true);
    
    const loadStoreList = async () => {
      try {
        // Convert filter text to status code (backend expects integer)
        const statusCode = getStatusCode(statusFilter);
        // Call API with status code parameter
        const data = await GetStoreListBySknoAndStatus(statusCode);
        
        // Handle null, undefined, or non-array responses - treat as empty data
        if (!data || !Array.isArray(data)) {
          setRows([]);
          return;
        }

        // Optimized normalization - create normalized objects efficiently
        const normalized = data.map((r) => {
          // Pre-compute values to avoid repeated lookups
          const createdDate = r.CREATED_DATE ?? r.creatE_DATE ?? r.requestDate;
          const requestPerson = r.creatE_BY ?? r.title ?? r.REQUES_PERSON ?? r.requestPerson ?? r.request_PERSON ?? "";
          
          return {
            ...r,
            MR_ID: r.id ?? r.mR_ID,
            mR_NO: r.inventorY_REQUEST_ID ?? r.mR_NO ?? r.grN_NO ?? r.grn_NO,
            createD_DATE: formatDate(createdDate),
            requestPerson,
            status: r.STATUS ?? r.status ?? "0",
          };
        });

        // Attach per-row view handler using the optimized factory function
        const withHandlers = normalized.map((r) => ({
          ...r,
          onView: createOnViewHandler(r),
        }));

        setRows(withHandlers);
      } catch (err) {
        // Check if error is due to no data found (404 or empty result)
        const errorMessage = err?.message || "";
        const isNotFoundError = 
          errorMessage.includes("404") || 
          errorMessage.includes("not found") || 
          errorMessage.includes("No store list found");
        
        if (isNotFoundError) {
          // No data found - just show empty table
          setRows([]);
        } else {
          // Actual error - show error message
          Swal.fire({ 
            icon: "error", 
            title: "Error", 
            text: `Failed to fetch store list. ${err.message}` 
          });
          // Also set empty array to prevent showing stale data
          setRows([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadStoreList();
  }, [statusFilter, createOnViewHandler]); // Reload when filter changes

  // Memoize columns to avoid recreation on every render
  const columns = useMemo(() => [
    {
      accessorKey: "select",
      header: () => "",
      cell: ({ row }) => (
        <button 
          onClick={() => row.original.onView()} 
          className="brand-btn-warning brand-btn-sm"
          style={{
            width: "32px",
            height: "32px",
            padding: "0",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title="View/Edit"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
      ),
    },
    { 
      accessorKey: "mR_NO", 
      header: () => "Request No" 
    },
    { 
      accessorKey: "createD_DATE", 
      header: () => "Request Date" 
    },
    { 
      accessorKey: "requestPerson", 
      header: () => "Request Person" 
    },
    { 
      accessorKey: "status", 
      header: () => "Status" 
    },
  ], []);

  return (
    <div>
      <h3>Stores Out From Inventory</h3>
      <p className="text-muted">Request List</p>

      {/* Filter Section */}
      <div style={{ 
        display: "flex", 
        justifyContent: "flex-start", 
        alignItems: "center",
        marginBottom: "20px",
        gap: "16px"
      }}>
        <div style={{ position: "relative", minWidth: "200px" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{
              width: "100%",
              padding: "8px 32px 8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "14px",
              backgroundColor: "white",
              cursor: "pointer",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              backgroundSize: "12px"
            }}
          >
            {filterOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <TableSkeleton columns={columns} rows={10} />
      ) : (
        <Table 
          columns={columns} 
          data={rows} 
          pagination 
          highlightOnHover 
          striped 
        />
      )}

      {/* Request Item List, Out Item List, and MR Re-Print Sections */}
      {selectedRowData && (
        <div style={{ marginTop: "30px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Left Column: Request Item List and MR Re-Print */}
            <div>
              {/* Request Item List */}
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ marginBottom: "16px", fontSize: "16px", fontWeight: "600" }}>
                  Request Item List ({requestItems.length})
                </h4>
                {loadingItems ? (
                  <div className="text-center p-4">Loading...</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Select</th>
                          <th>Item No</th>
                          <th>Requested Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requestItems.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="text-center text-muted p-4">
                              No items found
                            </td>
                          </tr>
                        ) : (
                          requestItems.map((item, index) => {
                            const itemNumber = item.ITEM_NUMBER ?? item.item_number ?? item.itemNumber ?? item.ITEM_NO ?? item.item_no ?? item.itemNo ?? "-";
                            const qty = item.QTY ?? item.qty ?? item.Qty ?? item.quantity ?? 0;
                            
                            return (
                              <tr key={index}>
                                <td>
                                  <button
                                    onClick={() => handleOpenItemModal(item)}
                                    className="brand-btn-warning brand-btn-sm"
                                    title="Select"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                  </button>
                                </td>
                                <td>{itemNumber}</td>
                                <td>{qty}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* MR Re-Print */}
              <div>
                <h4 style={{ marginBottom: "16px", fontSize: "16px", fontWeight: "600" }}>MR Re-Print</h4>
                <div className="mb-3">
                  <label className="form-label">Issue No:</label>
                  <select
                    value={selectedIssueNo}
                    onChange={(e) => setSelectedIssueNo(e.target.value)}
                    className="form-select"
                    disabled={loadingIssueNumbers}
                  >
                    <option value="">-- Select Issue No --</option>
                    {issueNumbers.map((issueNo, index) => (
                      <option key={index} value={issueNo}>
                        {issueNo}
                      </option>
                    ))}
                  </select>
                  {loadingIssueNumbers && (
                    <small className="text-muted">Loading issue numbers...</small>
                  )}
                </div>
                <button
                  onClick={async () => {
                    if (!selectedIssueNo) {
                      Swal.fire({ icon: "warning", title: "Warning", text: "Please select an Issue No" });
                      return;
                    }
                    if (!selectedRowData) {
                      Swal.fire({ icon: "warning", title: "Warning", text: "Please select a request first" });
                      return;
                    }

                    try {
                      const mrNo = selectedRowData.mR_NO ?? selectedRowData.inventorY_REQUEST_ID ?? selectedRowData.grN_NO ?? "";
                      
                      if (!mrNo) {
                        Swal.fire({ 
                          icon: "error", 
                          title: "Error", 
                          text: "Material Request Number not found" 
                        });
                        return;
                      }

                      // Show loading
                      Swal.fire({
                        title: "Generating PDF...",
                        text: "Please wait...",
                        allowOutsideClick: false,
                        didOpen: () => {
                          Swal.showLoading();
                        }
                      });

                      // Generate PDF and trigger print dialog using hidden iframe
                      const pdfBlob = await GenerateWayBillReprintPdf(mrNo, selectedIssueNo);
                      const url = window.URL.createObjectURL(pdfBlob);
                      
                      // Create hidden iframe
                      const iframe = document.createElement('iframe');
                      iframe.style.position = 'fixed';
                      iframe.style.right = '0';
                      iframe.style.bottom = '0';
                      iframe.style.width = '0';
                      iframe.style.height = '0';
                      iframe.style.border = 'none';
                      iframe.style.display = 'none';
                      iframe.src = url;
                      
                      // Append to body
                      document.body.appendChild(iframe);
                      
                      // Trigger print dialog when PDF loads
                      iframe.onload = () => {
                        setTimeout(() => {
                          iframe.contentWindow?.print();
                          
                          // Clean up after print dialog closes (use afterprint event or long delay)
                          const cleanup = () => {
                            setTimeout(() => {
                              if (document.body.contains(iframe)) {
                                document.body.removeChild(iframe);
                                window.URL.revokeObjectURL(url);
                              }
                            }, 1000);
                          };
                          
                          // Try to use afterprint event if available
                          if (iframe.contentWindow) {
                            iframe.contentWindow.addEventListener('afterprint', cleanup);
                            // Fallback: cleanup after 30 seconds if event doesn't fire
                            setTimeout(cleanup, 30000);
                          } else {
                            // Fallback: cleanup after 10 seconds
                            setTimeout(cleanup, 10000);
                          }
                        }, 500);
                      };

                      Swal.close();
                    } catch (error) {
                      console.error("Error generating reprint PDF:", error);
                      await Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: error?.message || "Failed to generate reprint PDF. Please try again.",
                        confirmButtonColor: "#ef4444"
                      });
                    }
                  }}
                  className="brand-btn-success"
                  disabled={loadingIssueNumbers || !selectedIssueNo}
                  style={{ float: "right" }}
                >
                  Re-Print
                </button>
              </div>
            </div>

            {/* Right Column: Out Item List */}
            <div>
              <h4 style={{ marginBottom: "16px", fontSize: "16px", fontWeight: "600" }}>Out Item List</h4>
              <div className="table-responsive mb-3">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Delete</th>
                      <th>Item No</th>
                      <th>Issue No</th>
                      <th>Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outItems.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted p-4">
                          No items added yet
                        </td>
                      </tr>
                    ) : (
                      outItems.map((item, index) => (
                        <tr key={index}>
                          <td>
                            {/* Only show delete button if status is not "Out" (matching old system) */}
                            {item.status !== 8 ? (
                            <button
                                onClick={async () => {
                                  // TODO: Implement delete functionality (call backend to remove item)
                                  Swal.fire({ 
                                    icon: "info", 
                                    title: "Info", 
                                    text: "Delete functionality will be implemented" 
                                  });
                              }}
                              className="brand-btn-danger brand-btn-sm"
                              title="Delete"
                            >
                              ×
                            </button>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>{item.itemNo}</td>
                          <td>
                            {/* Display issue number as read-only text (matching old system) */}
                            <span>{item.issueNo || "-"}</span>
                          </td>
                          <td>{item.qty}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mb-3">
                <label className="form-label">The Carrier:</label>
                <SearchableDropdown
                  options={carriers.map((carrier, index) => ({
                    value: carrier.PFNO ?? carrier.pfno ?? index,
                    label: carrier.displayName || carrier.TITLE || carrier.FULLNAME || `User ${index + 1}`,
                    data: carrier
                  }))}
                  value={carriers.find(c => (c.PFNO ?? c.pfno) === selectedCarrier) 
                    ? {
                        value: selectedCarrier,
                        label: carriers.find(c => (c.PFNO ?? c.pfno) === selectedCarrier)?.displayName || 
                               carriers.find(c => (c.PFNO ?? c.pfno) === selectedCarrier)?.TITLE ||
                               carriers.find(c => (c.PFNO ?? c.pfno) === selectedCarrier)?.FULLNAME ||
                               "Selected Carrier"
                      }
                    : null
                  }
                  onChange={(selectedOption) => {
                    setSelectedCarrier(selectedOption ? selectedOption.value : "");
                  }}
                  placeholder={loadingCarriers ? "Loading carriers..." : "-- Please Select --"}
                  isDisabled={loadingCarriers}
                  isLoading={loadingCarriers}
                  isClearable={true}
                  isSearchable={true}
                />
              </div>
              <button
                onClick={handleIssueAndPrint}
                className="brand-btn-primary"
                style={{ float: "right" }}
              >
                Issue And Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Selection Modal */}
      {showItemModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseItemModal();
            }
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              minWidth: "500px",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{ marginBottom: "20px", fontSize: "18px", fontWeight: "600" }}>
              Item Details
            </h4>

            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: "500" }}>Item No:</label>
              <input
                type="text"
                className="form-control"
                value={selectedItemForModal?.itemNumber ?? ""}
                readOnly
                style={{ backgroundColor: "#f8f9fa" }}
              />
            </div>

            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: "500" }}>Warehouse:</label>
              <select
                  className="form-control"
                value={selectedWarehouseId}
                onChange={(e) => handleWarehouseChange(e.target.value)}
                disabled={loadingWarehouses}
              >
                <option value="">-- Please Select --</option>
                {warehouses.map((warehouse) => {
                  const wId = warehouse.W_ID ?? warehouse.w_ID ?? warehouse.wId ?? "";
                  const wCode = warehouse.W_CODE ?? warehouse.w_CODE ?? "";
                  const wName = warehouse.W_NAME ?? warehouse.w_NAME ?? "";
                  const displayName = wCode ? `${wCode}${wName ? ` - ${wName}` : ""}` : wName || "";
                  return (
                    <option key={wId} value={wId}>
                      {displayName}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: "500" }}>Rack:</label>
              <select
                className="form-control"
                value={selectedRackId}
                onChange={(e) => handleRackChange(e.target.value)}
                disabled={loadingRacks || !selectedWarehouseId}
              >
                <option value="">-- Please Select --</option>
                {racks.map((rack) => {
                  const rId = rack.R_ID ?? rack.r_ID ?? rack.rId ?? "";
                  const rackName = rack.RACKNAME ?? rack.rackname ?? rack.R_NAME ?? rack.r_NAME ?? "";
                  return (
                    <option key={rId} value={rId}>
                      {rackName}
                    </option>
                  );
                })}
              </select>
                </div>

            {/* Bin Dropdown */}
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: "500" }}>Select Bin:</label>
              {(() => {
                // Show disabled dropdown if no rack is selected
                if (!selectedRack) {
                  return (
                    <select className="form-control" disabled>
                      <option>-- Please Select Rack First --</option>
                    </select>
                  );
                }

                const availableBins = getAvailableBins; // Now a memoized value, not a function
                
                if (loadingBins) {
                  return (
                    <select className="form-control" disabled>
                      <option>Loading bins...</option>
                    </select>
                  );
                }
                
                if (availableBins.length === 0) {
                  return (
                    <>
                      <select className="form-control" disabled>
                        <option>-- No bins available --</option>
                      </select>
                      <div className="mt-2" style={{ fontSize: "12px", color: "#dc3545" }}>
                        {storesInRack.length === 0 
                          ? "No stores found in this rack" 
                          : `No bins found with item: ${selectedItemForModal?.itemNumber || "N/A"}`}
                      </div>
                    </>
                  );
                }
                
                return (
                  <select
                    className="form-control"
                    value={getSelectedBinValue()}
                    onChange={(e) => handleBinSelect(e.target.value)}
                  >
                    <option value="">-- Please Select Bin --</option>
                    {availableBins.map((bin) => (
                      <option key={bin.value} value={bin.value}>
                        {bin.display} - Qty: {bin.qty}
                      </option>
                    ))}
                  </select>
                );
              })()}
            </div>

            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: "500" }}>Requested Qty:</label>
              <input
                type="text"
                className="form-control"
                value={selectedItemForModal?.requestedQty ?? 0}
                readOnly
                style={{ backgroundColor: "#f8f9fa" }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label" style={{ fontWeight: "500" }}>
                Issue Quantity: <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                value={issueQuantity}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
                    setIssueQuantity(value);
                  }
                }}
                min="0"
                max={selectedItemForModal?.requestedQty ?? 0}
                placeholder="Enter issue quantity"
              />
              {selectedItemForModal?.requestedQty && (
                <small className="text-muted">
                  Maximum: {selectedItemForModal.requestedQty}
                </small>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={handleCloseItemModal}
                className="brand-btn-secondary"
              >
                Close
              </button>
              <button
                onClick={handleAddItemToOutList}
                className="brand-btn-primary"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoresOutFromInventoryTable;

