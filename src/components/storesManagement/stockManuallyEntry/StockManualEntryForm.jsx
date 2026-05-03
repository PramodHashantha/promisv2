import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { rackAPI } from "@/utils/api/storeView";
import { GetStoreWarehouseByResponsiblePerson, SearchItemCode, GetGoodByItemNumber, insertValueStores, saveManualGRNHeader, GETItemINVirtualRack } from "@/utils/api/api";
import Swal from "sweetalert2";
import { FiPlus, FiTrash2, FiSave } from "react-icons/fi";
import { generateGRNExcel, getPFNO } from "./generateGRNExcel";

const StockManualEntryForm = () => {
  const [formData, setFormData] = useState({
    storeInType: "1", 
    warehouse: "",
    rack: "",
    rackOrder: "",
    itemNo: "",
    itemName: "",
    unitPrice: "",
    allocatedQty: ""
  });

  const [warehouses, setWarehouses] = useState([]);
  const [racks, setRacks] = useState([]);
  const [rackOrders, setRackOrders] = useState([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingRacks, setLoadingRacks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [itemSuggestions, setItemSuggestions] = useState([]);
  const [showItemSuggestions, setShowItemSuggestions] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingItemDetails, setLoadingItemDetails] = useState(false);
  const [manualItemList, setManualItemList] = useState([]);
  const [savedItemsForGRN, setSavedItemsForGRN] = useState([]); 
  const itemNoInputRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);
  const isSelectingFromDropdown = useRef(false);
  const [savingAll, setSavingAll] = useState(false);
  const [savedGRNNo, setSavedGRNNo] = useState(""); 
  const [grnDetails, setGrnDetails] = useState({
    grnNo: "",
    invoiceNo: "",
    invoiceDate: "",
    tenderNo: "",
    supplier: ""
  });


  useEffect(() => {
    loadWarehouses();
    loadManualItemList();
  }, []);

  
  useEffect(() => {
    if (savedGRNNo) {
      console.log("savedGRNNo updated:", savedGRNNo);
    }
  }, [savedGRNNo]);


  useEffect(() => {
    if (grnDetails.grnNo) {
      console.log("grnDetails.grnNo updated:", grnDetails.grnNo);
    }
  }, [grnDetails.grnNo]);

  const loadManualItemList = () => {
    try {
      const storedData = localStorage.getItem('manualItemList');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setManualItemList(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Error loading manual item list:", error);
      setManualItemList([]);
    }
  };


  const saveManualItemList = (items) => {
    try {
      localStorage.setItem('manualItemList', JSON.stringify(items));
    } catch (error) {
      console.error("Error saving manual item list:", error);
    }
  };


  useEffect(() => {
    if (formData.warehouse) {
      loadRacks(formData.warehouse);
    } else {
      setRacks([]);
      setRackOrders([]);
      setFormData(prev => ({ ...prev, rack: "", rackOrder: "" }));
    }
  }, [formData.warehouse]);

  const loadWarehouses = async () => {
    setLoadingWarehouses(true);
    try {
      const data = await GetStoreWarehouseByResponsiblePerson();
      setWarehouses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading warehouses:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load warehouses"
      });
      setWarehouses([]);
    } finally {
      setLoadingWarehouses(false);
    }
  };

  const loadRacks = async (warehouseId) => {
    setLoadingRacks(true);
    try {
      const data = await rackAPI.getAllRacksByWarehouseId(warehouseId);
      setRacks(Array.isArray(data) ? data : []);
      setRackOrders([]);
    } catch (error) {
      console.error("Error loading racks:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load racks"
      });
      setRacks([]);
    } finally {
      setLoadingRacks(false);
    }
  };

  useEffect(() => {
    if (formData.rack) {
      loadRackOrders(formData.rack);
    } else {
      setRackOrders([]);
      setFormData(prev => ({ ...prev, rackOrder: "" }));
    }

  }, [formData.rack]);

  const loadRackOrders = async (rackId) => {
    try {
      
      const rackResponse = await rackAPI.getRackById(rackId);

      let rackData = null;
      if (Array.isArray(rackResponse) && rackResponse.length > 0) {
        rackData = rackResponse[0];
      } else if (rackResponse && typeof rackResponse === "object") {
        rackData = rackResponse;
      }

      if (!rackData) {
        setRackOrders([]);
        return;
      }

  
      const positionsArray = rackData.positions || rackData.Positions;
      
      if (positionsArray && Array.isArray(positionsArray) && positionsArray.length > 0) {
 
        const positions = positionsArray.map(pos => {
   
          const x = pos.x ?? pos.X ?? 0;
          const y = pos.y ?? pos.Y ?? 0;
          const displayName = pos.displayName ?? pos.DisplayName ?? `(${x},${y})`;
          
          return {
            value: `${x - 1},${y - 1}`, 
            name: displayName
          };
        });

        setRackOrders(positions);
        setFormData(prev => ({ ...prev, rackOrder: "" }));
        return;
      }

      
      const rawX = rackData.X ?? rackData.x ?? rackData.maxX ?? rackData.MaxX;
      const rawY = rackData.Y ?? rackData.y ?? rackData.maxY ?? rackData.MaxY;

      const xCount = parseInt(rawX || "0", 10);
      const yCount = parseInt(rawY || "0", 10);

      if (!xCount || !yCount) {
        setRackOrders([]);
        return;
      }

      const positions = [];
     
      for (let row = 0; row < yCount; row++) {
        for (let col = 0; col < xCount; col++) {
          positions.push({
            value: `${col},${row}`, 
            name: `(${col + 1},${row + 1})` 
          });
        }
      }

      setRackOrders(positions);
      setFormData(prev => ({ ...prev, rackOrder: "" }));
    } catch (error) {
      console.error("Error loading rack orders:", error);
      setRackOrders([]);
    }
  };


  const updateDropdownPosition = () => {
    if (itemNoInputRef.current) {
      const rect = itemNoInputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

 
  useEffect(() => {
    if (showItemSuggestions && itemSuggestions.length > 0) {
      updateDropdownPosition();
    
      const handleUpdate = () => updateDropdownPosition();
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);
      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    }
  }, [showItemSuggestions, itemSuggestions]);


  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };


  const searchItems = async (searchText) => {
    if (!searchText || searchText.length < 1) {
      setItemSuggestions([]);
      setShowItemSuggestions(false);
      return;
    }

    setLoadingItems(true);
    try {
      const results = await SearchItemCode(searchText);
      setItemSuggestions(Array.isArray(results) ? results : []);
      if (results && results.length > 0) {
        updateDropdownPosition();
        setShowItemSuggestions(true);
      } else {
        setShowItemSuggestions(false);
      }
    } catch (error) {
      console.error("Error searching items:", error);
      setItemSuggestions([]);
      setShowItemSuggestions(false);
    } finally {
      setLoadingItems(false);
    }
  };

  const debouncedSearchItems = debounce(searchItems, 300);

 
  const loadItemDetails = async (itemNo) => {
    if (!itemNo) return;

    setLoadingItemDetails(true);
    try {
      console.log("Loading item details for:", itemNo);
      const response = await GetGoodByItemNumber(itemNo);
      
    
      let itemData = response;
      if (Array.isArray(response) && response.length > 0) {
        itemData = response[0];
      } else if (response && response.data) {
        itemData = response.data; 
      }
      
      console.log("Item details received:", itemData);
      
      if (itemData) {
        
        const itemName = itemData.ITEM_NAME || 
                       itemData.item_NAME || 
                       itemData.ItemName || 
                       itemData.itemName ||
                       itemData.ITEM_DESCRIPTION ||
                       itemData.item_DESCRIPTION ||
                       itemData.ItemDescription ||
                       itemData.itemDescription ||
                       itemData.DESCRIPTION || 
                       itemData.description ||
                       itemData.DESC ||
                       itemData.desc ||
                       itemData.NAME ||
                       itemData.name ||
                       itemData.Name ||
                       "";
        
     
        const unitPrice = itemData.UNIT_PRICE || 
                         itemData.unit_PRICE || 
                         itemData.UnitPrice || 
                         itemData.unitPrice ||
                         itemData.PRICE ||
                         itemData.price ||
                         itemData.Price ||
                         "";
        
        console.log("Extracted item name:", itemName);
        console.log("Extracted unit price:", unitPrice);
        
        
        setFormData(prev => ({
          ...prev,
          itemNo: itemNo,
          itemName: itemName,
          unitPrice: unitPrice || prev.unitPrice
        }));
        
        if (itemName) {
          console.log("Item name successfully populated:", itemName);
        } else {
          console.warn("Item name not found in response. Available fields:", Object.keys(itemData));
        }
      } else {
        console.warn("No item data received from API");
        Swal.fire({
          icon: "warning",
          title: "No Data",
          text: "Item details not found for the selected item"
        });
      }
    } catch (error) {
      console.error("Error loading item details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load item details: " + (error.message || "Unknown error")
      });
    } finally {
      setLoadingItemDetails(false);
    }
  };

 
  const selectItem = async (selectedItem) => {
    
    let itemNo;
    if (typeof selectedItem === 'string') {
      
      itemNo = selectedItem.split('-')[0].trim();
    } else if (typeof selectedItem === 'object' && selectedItem !== null) {
      
      itemNo = selectedItem.ITEM_NO || selectedItem.item_NO || selectedItem.ItemNo || selectedItem.itemNo || 
               selectedItem.ITEM_CODE || selectedItem.item_CODE || selectedItem.ItemCode || selectedItem.itemCode ||
               selectedItem.ITEM_NUMBER || selectedItem.item_NUMBER || selectedItem.ItemNumber || selectedItem.itemNumber ||
               selectedItem.toString();
    } else {
      itemNo = String(selectedItem);
    }
    
    setFormData(prev => ({ ...prev, itemNo: itemNo }));
    setShowItemSuggestions(false);
    setItemSuggestions([]);
    
    await loadItemDetails(itemNo);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
   
    if (name === "itemNo") {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        itemName: "" 
      }));
      debouncedSearchItems(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

 
  const handleAddItem = (e) => {
    e.preventDefault();
    
   
    if (!formData.warehouse) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please select a warehouse"
      });
      return;
    }

    if (racks.length > 0 && !formData.rack) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please select a rack"
      });
      return;
    }

    if (rackOrders.length > 0 && !formData.rackOrder) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please select a rack order position"
      });
      return;
    }

    if (!formData.itemNo || !formData.itemName) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill in Item No and Item Name"
      });
      return;
    }

    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter a valid unit price"
      });
      return;
    }

    if (!formData.allocatedQty || parseFloat(formData.allocatedQty) <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter a valid allocated quantity"
      });
      return;
    }


    const isDuplicate = manualItemList.some(
      item => item.itemNo.toLowerCase() === formData.itemNo.toLowerCase()
    );

    if (isDuplicate) {
      Swal.fire({
        icon: "warning",
        title: "Duplicate Item",
        text: `Item No "${formData.itemNo}" has already been added.`
      });
      return;
    }

 
    const selectedWarehouse = warehouses.find(
      wh => String(wh.W_ID ?? wh.w_ID ?? wh.WID) === String(formData.warehouse)
    );
    const warehouseText = selectedWarehouse 
      ? (selectedWarehouse.W_NAME ?? selectedWarehouse.w_NAME ?? selectedWarehouse.WName ?? selectedWarehouse.w_name ?? selectedWarehouse.W_CODE ?? selectedWarehouse.w_CODE ?? "Unknown")
      : "";

    const rackIdToFind = String(formData.rack);
    const selectedRack = racks.find(
      rack => String(rack.R_ID ?? rack.r_ID ?? rack.RID) === rackIdToFind
    );
    
    console.log("Finding rack:", {
      rackIdToFind,
      racksLength: racks.length,
      racks: racks.map(r => ({ id: r.R_ID ?? r.r_ID ?? r.RID, name: r.RACKNAME ?? r.R_CODE })),
      selectedRack: selectedRack ? { id: selectedRack.R_ID ?? selectedRack.r_ID ?? selectedRack.RID, name: selectedRack.RACKNAME ?? selectedRack.R_CODE } : null
    });
    
    const rackText = selectedRack
      ? (selectedRack.RACKNAME ??
         selectedRack.RACK_NAME ??
         selectedRack.R_CODE ??
         selectedRack.r_CODE ??
         selectedRack.RCode ??
         selectedRack.r_code ??
         "Unknown")
      : "";
    
    console.log("Rack text extracted:", rackText);

    let rackOrderX = "";
    let rackOrderY = "";
    let rackOrderName = "";
    if (formData.rackOrder) {
      const [xStr, yStr] = String(formData.rackOrder).split(",");
      rackOrderX = xStr ?? "";
      rackOrderY = yStr ?? "";
      const pos = rackOrders.find(p => p.value === formData.rackOrder);
      rackOrderName = pos ? pos.name : "";
    }

    const newItem = {
      itemNo: formData.itemNo.trim(),
      gType: formData.storeInType,
      itemName: formData.itemName.trim(),
      unitPrice: formData.unitPrice.trim(),
      allocatedQty: formData.allocatedQty.trim(),
      warehouse: formData.warehouse,
      warehouseText: warehouseText,
      rack: formData.rack,
      rackText: rackText,
      rackOrderX,
      rackOrderY,
      rackOrderName
    };

    const updatedList = [...manualItemList, newItem];
    setManualItemList(updatedList);
    saveManualItemList(updatedList);

    setFormData(prev => ({
      storeInType: prev.storeInType,
      warehouse: prev.warehouse,
      rack: prev.rack,
      rackOrder: prev.rackOrder,
      itemNo: "",
      itemName: "",
      unitPrice: "",
      allocatedQty: ""
    }));

    Swal.fire({
      icon: "success",
      title: "Item Added",
      text: "Item has been added to the list",
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleDeleteItem = (index) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this item",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedList = manualItemList.filter((_, i) => i !== index);
        setManualItemList(updatedList);
        saveManualItemList(updatedList);
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Item has been deleted.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const handleClearAll = () => {
    if (manualItemList.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Items",
        text: "There are no items to clear"
      });
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: "You want to clear all items",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, clear all!'
    }).then((result) => {
      if (result.isConfirmed) {
        setManualItemList([]);
        localStorage.removeItem('manualItemList');
        setSavedGRNNo(""); 
        setSavedItemsForGRN([]); 
        
        Swal.fire({
          icon: 'success',
          title: 'Cleared!',
          text: 'All items have been cleared.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  
  const handleSaveAll = async () => {
    if (manualItemList.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Items",
        text: "Please add at least one item before saving"
      });
      return;
    }

    const itemsWithoutWarehouse = manualItemList.filter(item => !item.warehouse);
    if (itemsWithoutWarehouse.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Some items are missing warehouse information. Please remove and re-add those items."
      });
      return;
    }

    if (!grnDetails.invoiceNo || !grnDetails.supplier || !grnDetails.tenderNo || !grnDetails.invoiceDate) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill in all GRN details (Invoice No, Supplier, Tender No, Invoice Date) before saving."
      });
      return;
    }

    setSavingAll(true);
    try {
      const pfno = getPFNO();
      
      if (!pfno) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "User PFNO not found. Please login again."
        });
        setSavingAll(false);
        return;
      }

      const itemsToSend = manualItemList.map((item) => {
  
        let gTypeValue = item.gType;
        if (gTypeValue === "Local" || gTypeValue === "local") {
          gTypeValue = "1";
        } else if (gTypeValue === "Indent" || gTypeValue === "indent") {
          gTypeValue = "2";
        }
   
        let rackId = item.rack;
        if (!rackId || rackId === "" || rackId === "0") {
          rackId = "0"; 
        }
        
        return {
          RID: rackId, 
          x: item.rackOrderX ?? "", 
          y: item.rackOrderY ?? "", 
          PFNO: pfno,
          ITEMNO: item.itemNo,
          txtBoxValue: item.allocatedQty,
          UnitPrice: item.unitPrice,
          GType: gTypeValue,
          Warehouse: item.warehouseText || "",
          Rack: item.rackText || "",
          RemainingQty: item.allocatedQty,
          ItemName: item.itemName,
          Qty: "" 
        };
      });

   
      const requestPayload = {
        Items: itemsToSend,
        GrnDetails: null 
      };

      console.log("Sending to backend:", requestPayload);

      const response = await insertValueStores(requestPayload);
      
      console.log("=== RESPONSE DEBUG ===");
      console.log("Full response:", response);
      console.log("Response type:", typeof response);
      console.log("Response is array:", Array.isArray(response));
      if (response && typeof response === 'object') {
        console.log("Response keys:", Object.keys(response));
        console.log("Response.GRN_NO:", response.GRN_NO);
        console.log("Response.grnNo:", response.grnNo);
        console.log("Response.grn_no:", response.grn_no);
        console.log("Response.d:", response.d);
      }
      console.log("======================");
  
      let grnNo = "";
      if (response) {
        
        if (response.grN_NO) {
          grnNo = String(response.grN_NO).trim();
          console.log("✓ Found grN_NO:", grnNo);
        }
  
        else if (response.GRN_NO) {
          grnNo = String(response.GRN_NO).trim();
          console.log("✓ Found GRN_NO:", grnNo);
        }
    
        else if (response.grnNo) {
          grnNo = String(response.grnNo).trim();
          console.log("✓ Found grnNo:", grnNo);
        }
        else if (response.grn_no) {
          grnNo = String(response.grn_no).trim();
          console.log("✓ Found grn_no:", grnNo);
        }
  
        else if (typeof response === 'string') {
          grnNo = response.trim();
          console.log("✓ Response is string:", grnNo);
        }

        else if (response.d) {
          grnNo = String(response.d).trim();
          console.log("✓ Found response.d:", grnNo);
        }
    
        else if (response.data) {
          if (response.data.grN_NO) {
            grnNo = String(response.data.grN_NO).trim();
            console.log("✓ Found response.data.grN_NO:", grnNo);
          } else if (response.data.GRN_NO) {
            grnNo = String(response.data.GRN_NO).trim();
            console.log("✓ Found response.data.GRN_NO:", grnNo);
          } else if (typeof response.data === 'string') {
            grnNo = String(response.data).trim();
            console.log("✓ Found response.data (string):", grnNo);
          }
        }
      }

      console.log("Final extracted GRN No:", grnNo);

      if (!grnNo) {
        console.error("✗ No GRN number found in response!");
        console.error("Response structure:", JSON.stringify(response, null, 2));
        throw new Error("Failed to get GRN number from server response.");
      }

     
      console.log("Saving GRN header with GRN_NO:", grnNo);
      const saveHeaderResponse = await saveManualGRNHeader({
        GRN_No: grnNo,
        Invoice_No: grnDetails.invoiceNo,
        Supplier: grnDetails.supplier,
        Tender_No: grnDetails.tenderNo,
        Invoice_Date: grnDetails.invoiceDate
      });

      if (!saveHeaderResponse || !saveHeaderResponse.success) {
        throw new Error(saveHeaderResponse?.message || "Failed to save GRN header. Please try again.");
      }

      console.log("✓ GRN header saved successfully");

    
      setSavedGRNNo(grnNo);
      setGrnDetails(prev => ({
        ...prev,
        grnNo: grnNo
      }));
      setSavedItemsForGRN([...manualItemList]);
      sessionStorage.setItem("RefNo", grnNo);

  
      const itemsToPrint = manualItemList.map(item => {
        
        const unitPrice = item.unitPrice != null ? String(item.unitPrice).trim() : "0";
        const allocatedQty = item.allocatedQty != null ? String(item.allocatedQty).trim() : "0";
        
        return {
          itemNo: item.itemNo || "",
          itemName: item.itemName || "N/A",
          unitPrice: unitPrice,
          allocatedQty: allocatedQty,
          gType: item.gType || "1",
          warehouse: item.warehouse || "",
          warehouseText: item.warehouseText || "",
          rack: item.rack || "",
          rackText: item.rackText || ""
        };
      });
      
      console.log("Items to print in Excel:", itemsToPrint);

      const firstItemWarehouse = manualItemList[0]?.warehouse || "";
      const firstItemWarehouseText = manualItemList[0]?.warehouseText || "";
  
      const warehouseName = saveHeaderResponse.header?.WAREHOUSE || 
        firstItemWarehouseText || 
        (warehouses.find(w => (w.W_ID ?? w.w_ID ?? w.WID) === firstItemWarehouse)?.W_NAME || "Unknown");
      const warehouseCode = saveHeaderResponse.header?.W_CODE || 
        (warehouses.find(w => (w.W_ID ?? w.w_ID ?? w.WID) === firstItemWarehouse)?.W_CODE || firstItemWarehouse || "Unknown");


      await generateGRNExcel({
        grnNo,
        grnDetails,
        itemsToPrint,
        warehouseName,
        warehouseCode
      });

      setManualItemList([]);
      localStorage.removeItem('manualItemList');
      setSavedGRNNo("");
      setSavedItemsForGRN([]);
      sessionStorage.removeItem("RefNo");

      setFormData({
        storeInType: "1", 
        warehouse: "",
        rack: "",
        rackOrder: "",
        itemNo: "",
        itemName: "",
        unitPrice: "",
        allocatedQty: ""
      });

      setGrnDetails({
        grnNo: "",
        invoiceNo: "",
        invoiceDate: "",
        tenderNo: "",
        supplier: ""
      });

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Items saved and GRN generated successfully.`,
        confirmButtonColor: '#10b981',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error("Error saving items:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.Message ||
                          error.message || 
                          "Failed to save items. Please try again.";
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage
      });
    } finally {
      setSavingAll(false);
    }
  };

  return (
    <div style={{ 
      backgroundColor: "white", 
      borderRadius: "8px", 
      padding: "24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      position: "relative",
      overflow: "visible"
    }}>
    
      <div style={{
        backgroundColor: "#3b82f6",
        color: "white",
        padding: "16px 20px",
        borderRadius: "8px 8px 0 0",
        margin: "-24px -24px 24px -24px",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        <FiPlus size={20} />
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
          Add Manual Item
        </h2>
      </div>

   
      <form onSubmit={handleAddItem} style={{ position: "relative", overflow: "visible" }}>
     
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginBottom: "20px"
        }}>
      
          <div>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "500",
              color: "#374151"
            }}>
              Store In Type :
            </label>
            <select
              name="storeInType"
              value={formData.storeInType}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "white"
              }}
            >
              <option value="1">Local</option>
              <option value="2">Indent</option>
            </select>
          </div>

      
          <div>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "500",
              color: "#374151"
            }}>
              Warehouse :
            </label>
            <select
              name="warehouse"
              value={formData.warehouse}
              onChange={handleInputChange}
              disabled={loadingWarehouses}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: loadingWarehouses ? "#f3f4f6" : "white",
                cursor: loadingWarehouses ? "not-allowed" : "pointer"
              }}
            >
              <option value="">-- Select Warehouse --</option>
              {warehouses.map((wh) => (
                <option key={wh.W_ID ?? wh.w_ID ?? wh.WID} value={wh.W_ID ?? wh.w_ID ?? wh.WID}>
                  {wh.W_NAME ?? wh.w_NAME ?? wh.WName ?? wh.w_name ?? wh.W_CODE ?? wh.w_CODE ?? "Unknown"}
                </option>
              ))}
            </select>
          </div>

   
          <div>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "500",
              color: "#374151"
            }}>
              Rack :
            </label>
            <select
              name="rack"
              value={formData.rack}
              onChange={handleInputChange}
              disabled={!formData.warehouse || loadingRacks}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: (!formData.warehouse || loadingRacks) ? "#f3f4f6" : "white",
                cursor: (!formData.warehouse || loadingRacks) ? "not-allowed" : "pointer"
              }}
            >
              <option value="">-- Select Rack --</option>
              {racks.map((rack) => (
                <option key={rack.R_ID ?? rack.r_ID ?? rack.RID} value={rack.R_ID ?? rack.r_ID ?? rack.RID}>
                  {rack.RACKNAME ??
                   rack.RACK_NAME ??
                   rack.R_CODE ??
                   rack.r_CODE ??
                   rack.RCode ??
                   rack.r_code ??
                   "Unknown"}
                </option>
              ))}
            </select>
          </div>

 
          <div>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "500",
              color: "#374151"
            }}>
              Bin :
            </label>
            <select
              name="rackOrder"
              value={formData.rackOrder}
              onChange={handleInputChange}
              disabled={!formData.rack || rackOrders.length === 0}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: (!formData.rack || rackOrders.length === 0) ? "#f3f4f6" : "white",
                cursor: (!formData.rack || rackOrders.length === 0) ? "not-allowed" : "pointer"
              }}
            >
              <option value="">-- Select Rack Order --</option>
              {rackOrders.map((pos, index) => (
                <option key={pos.value ?? index} value={pos.value}>
                  {pos.name}
                </option>
              ))}
            </select>
          </div>
        </div>

       
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginBottom: "20px"
        }}>
      
          <div style={{ position: "relative", zIndex: 1 }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "500",
              color: "#374151"
            }}>
              Item No :
            </label>
            <input
              ref={itemNoInputRef}
              type="text"
              name="itemNo"
              value={formData.itemNo}
              onChange={handleInputChange}
              onBlur={(e) => {
            
                if (!isSelectingFromDropdown.current) {
                  setTimeout(() => {
                    if (!isSelectingFromDropdown.current) {
                      setShowItemSuggestions(false);
                    }
                  }, 300);
                }
              }}
              onFocus={() => {
                if (itemSuggestions.length > 0) {
                  updateDropdownPosition();
                  setShowItemSuggestions(true);
                }
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px"
              }}
              placeholder="Enter Item No"
              autoComplete="off"
            />
            {showItemSuggestions && itemSuggestions.length > 0 && (
              <div 
                ref={dropdownRef}
                style={{
                  position: "fixed",
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`,
                  backgroundColor: "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  overflowX: "hidden",
                  zIndex: 9999,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  marginTop: "4px"
                }}
                onMouseDown={(e) => {
          
                  e.preventDefault();
                }}
              >
                {itemSuggestions.map((suggestion, index) => {
                  const displayText = typeof suggestion === 'string' 
                    ? suggestion 
                    : (suggestion.ITEM_NO || suggestion.item_NO || suggestion.ItemNo || suggestion.itemNo || suggestion.ITEM_CODE || suggestion.item_CODE || JSON.stringify(suggestion));
                  
                  return (
                    <div
                      key={index}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        isSelectingFromDropdown.current = true;
                        selectItem(suggestion);
                        setTimeout(() => {
                          isSelectingFromDropdown.current = false;
                          setShowItemSuggestions(false);
                        }, 100);
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        isSelectingFromDropdown.current = true;
                        selectItem(suggestion);
                        setTimeout(() => {
                          isSelectingFromDropdown.current = false;
                          setShowItemSuggestions(false);
                        }, 100);
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      style={{
                        padding: "10px 12px",
                        cursor: "pointer",
                        transition: "background 0.2s",
                        color: "#1f2937",
                        WebkitTapHighlightColor: "transparent"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#f3f4f6";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "white";
                      }}
                    >
                      {displayText}
                    </div>
                  );
                })}
              </div>
            )}
            {loadingItems && (
              <div style={{
                position: "absolute",
                right: "12px",
                top: "42px",
                color: "#6b7280",
                fontSize: "12px"
              }}>
                Searching...
              </div>
            )}
          </div>

 
          <div style={{ position: "relative" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "500",
              color: "#374151"
            }}>
              Item Name :
            </label>
            <input
              type="text"
              name="itemName"
              value={formData.itemName}
              onChange={handleInputChange}
              readOnly={loadingItemDetails}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: loadingItemDetails ? "#f3f4f6" : "white",
                cursor: loadingItemDetails ? "wait" : "text"
              }}
              placeholder={loadingItemDetails ? "Loading item details..." : "Item name will be auto-filled when item is selected"}
            />
            {loadingItemDetails && (
              <div style={{
                position: "absolute",
                right: "12px",
                top: "42px",
                color: "#6b7280",
                fontSize: "12px"
              }}>
                Loading...
              </div>
            )}
          </div>

          <div>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "500",
              color: "#374151"
            }}>
              Unit Price :
            </label>
            <input
              type="number"
              name="unitPrice"
              value={formData.unitPrice}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px"
              }}
              placeholder="Enter Unit Price"
            />
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "20px",
          marginBottom: "24px"
        }}>

          <div>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "500",
              color: "#374151"
            }}>
              Allocated Qty :
            </label>
            <input
              type="number"
              name="allocatedQty"
              value={formData.allocatedQty}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px"
              }}
              placeholder="Enter Allocated Quantity"
            />
          </div>
        </div>


        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "24px"
        }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.target.style.backgroundColor = "#059669";
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting) {
                e.target.style.backgroundColor = "#10b981";
              }
            }}
          >
            <FiPlus size={18} />
            Add
          </button>
        </div>
      </form>

      {/* GRN Number Display (shown after saving)
      {savedGRNNo && (
        <div style={{
          marginTop: "24px",
          padding: "16px 20px",
          backgroundColor: "#d1fae5",
          border: "2px solid #10b981",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <strong style={{ color: "#065f46", fontSize: "16px" }}>GRN Number: </strong>
            <span style={{ color: "#047857", fontSize: "18px", fontWeight: "600" }}>{savedGRNNo}</span>
          </div>
          <button
            onClick={generateGRNExcel}
            style={{
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <FiSave size={18} />
            Print GRN
          </button>
        </div>
      )} */}

  
      {(manualItemList.length > 0 || savedGRNNo) && (
        <div style={{
          marginTop: "32px",
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          
          {manualItemList.length > 0 && (
            <>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px"
              }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#374151" }}>
                  Manually Entered Item List ({manualItemList.length})
                  {savedGRNNo && (
                    <span style={{ 
                      marginLeft: "12px", 
                      fontSize: "14px", 
                      color: "#059669",
                      fontWeight: "500"
                    }}>
                  
                    </span>
                  )}
                </h3>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={handleClearAll}
                    style={{
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <FiTrash2 size={16} />
                    Clear All
                  </button>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px"
                }}>
                  <thead>
                    <tr style={{
                      backgroundColor: "#f3f4f6",
                      borderBottom: "2px solid #e5e7eb"
                    }}>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#374151" }}>#</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#374151" }}>Item No</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#374151" }}>Store In Type</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#374151" }}>Rack</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#374151" }}>Bin</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#374151" }}>Item Name</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#374151" }}>Unit Price</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#374151" }}>Allocated Qty</th>
                      <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "#374151" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manualItemList.map((item, index) => {
               
                      let displayRackText = item.rackText;
                      if (!displayRackText && item.rack) {
                        const foundRack = racks.find(
                          rack => String(rack.R_ID ?? rack.r_ID ?? rack.RID) === String(item.rack)
                        );
                        if (foundRack) {
                          displayRackText = foundRack.RACKNAME ??
                                           foundRack.RACK_NAME ??
                                           foundRack.R_CODE ??
                                           foundRack.r_CODE ??
                                           foundRack.RCode ??
                                           foundRack.r_code ??
                                           "";
                        }
                      }
                      
                      return (
                      <tr key={index} style={{
                        borderBottom: "1px solid #e5e7eb",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f9fafb";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                      }}
                      >
                        <td style={{ padding: "12px", color: "#6b7280" }}>{index + 1}</td>
                        <td style={{ padding: "12px", color: "#1f2937" }}>{item.itemNo}</td>
                        <td style={{ padding: "12px", color: "#1f2937" }}>{item.gType === "1" ? "Local" : item.gType === "2" ? "Indent" : item.gType}</td>
                        <td style={{ padding: "12px", color: "#1f2937" }}>{displayRackText || "-"}</td>
                        <td style={{ padding: "12px", color: "#1f2937" }}>{item.rackOrderName || "-"}</td>
                        <td style={{ padding: "12px", color: "#1f2937" }}>{item.itemName}</td>
                        <td style={{ padding: "12px", color: "#1f2937" }}>{item.unitPrice}</td>
                        <td style={{ padding: "12px", color: "#1f2937" }}>{item.allocatedQty}</td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <button
                            onClick={() => handleDeleteItem(index)}
                            style={{
                              backgroundColor: "#ef4444",
                              color: "white",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <FiTrash2 size={14} />
                            Delete
                          </button>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

    
          <div style={{
            marginTop: manualItemList.length > 0 ? "32px" : "0",
            paddingTop: manualItemList.length > 0 ? "24px" : "0",
            borderTop: manualItemList.length > 0 ? "2px solid #e5e7eb" : "none"
          }}>
            <h4 style={{
              marginBottom: "20px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#374151"
            }}>
              GRN Details
            </h4>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
              marginBottom: "20px"
            }}>
              {/* GRN No */}
              {/* <div>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  color: "#374151"
                }}>
                  GRN No :
                </label>
                <input
                  type="text"
                  value={savedGRNNo || grnDetails.grnNo || ""}
                  onChange={(e) => {
                    // Only allow editing if GRN hasn't been saved yet
                    if (!savedGRNNo) {
                      setGrnDetails(prev => ({ ...prev, grnNo: e.target.value }));
                    }
                  }}
                  placeholder={savedGRNNo ? savedGRNNo : "GRN No"}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: savedGRNNo ? "#f0fdf4" : "white",
                    fontWeight: savedGRNNo ? "600" : "normal"
                  }}
                  readOnly={!!savedGRNNo} // Read-only if GRN is already saved
                />
              </div> */}

            
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  color: "#374151"
                }}>
                  Invoice No :
                </label>
                <input
                  type="text"
                  value={grnDetails.invoiceNo}
                  onChange={(e) => setGrnDetails(prev => ({ ...prev, invoiceNo: e.target.value }))}
                  placeholder="Enter Invoice No..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                />
              </div>

        
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  color: "#374151"
                }}>
                  Invoice Date :
                </label>
                <input
                  type="date"
                  value={grnDetails.invoiceDate}
                  onChange={(e) => setGrnDetails(prev => ({ ...prev, invoiceDate: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                />
              </div>

        
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  color: "#374151"
                }}>
                  Tender No :
                </label>
                <input
                  type="text"
                  value={grnDetails.tenderNo}
                  onChange={(e) => setGrnDetails(prev => ({ ...prev, tenderNo: e.target.value }))}
                  placeholder="Enter Tender No..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                />
              </div>

             
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  color: "#374151"
                }}>
                  Supplier :
                </label>
                <input
                  type="text"
                  value={grnDetails.supplier}
                  onChange={(e) => setGrnDetails(prev => ({ ...prev, supplier: e.target.value }))}
                  placeholder="Enter Supplier Name..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                />
              </div>
            </div>

         
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "24px"
            }}>
              <button
                onClick={handleSaveAll}
                disabled={savingAll}
                style={{
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: savingAll ? "not-allowed" : "pointer",
                  opacity: savingAll ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                <FiSave size={20} />
                {savingAll ? "Saving & Printing..." : "Save All & Print GRN"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default StockManualEntryForm;

