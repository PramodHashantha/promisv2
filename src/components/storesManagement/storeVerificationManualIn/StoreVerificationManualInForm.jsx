import { useState, useEffect, useRef } from "react";
import { rackAPI } from "@/utils/api/storeView";
import { 
  GetStoreWarehouseByResponsiblePerson, 
  SearchItemCode, 
  GetGoodByItemNumber
} from "@/utils/api/api";
import { storeVerificationManualInAPI } from "@/utils/api/storeVerificationManualIn";
import Swal from "sweetalert2";
import { FiPlus, FiTrash2, FiSave, FiCheckCircle } from "react-icons/fi";
import { getPFNO } from "../stockManuallyEntry/generateGRNExcel";

const StoreVerificationManualInForm = () => {
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
  const [itemSuggestions, setItemSuggestions] = useState([]);
  const [showItemSuggestions, setShowItemSuggestions] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingItemDetails, setLoadingItemDetails] = useState(false);
  const [verificationItemList, setVerificationItemList] = useState([]);
  const itemNoInputRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);
  const isSelectingFromDropdown = useRef(false);
  const [savingAll, setSavingAll] = useState(false);

  useEffect(() => {
    loadWarehouses();
    loadVerificationItemList();
  }, []);

  const loadVerificationItemList = () => {
    try {
      const storedData = localStorage.getItem('verificationItemList');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setVerificationItemList(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Error loading verification item list:", error);
      setVerificationItemList([]);
    }
  };

  const saveVerificationItemList = (items) => {
    try {
      localStorage.setItem('verificationItemList', JSON.stringify(items));
    } catch (error) {
      console.error("Error saving verification item list:", error);
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
        text: "Please select a bin position"
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

    const isDuplicate = verificationItemList.some(
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
    
    const rackText = selectedRack
      ? (selectedRack.RACKNAME ??
         selectedRack.RACK_NAME ??
         selectedRack.R_CODE ??
         selectedRack.r_CODE ??
         selectedRack.RCode ??
         selectedRack.r_code ??
         "Unknown")
      : "";

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

    const updatedList = [...verificationItemList, newItem];
    setVerificationItemList(updatedList);
    saveVerificationItemList(updatedList);

    // Reset item fields but keep warehouse, rack, bin
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
      text: "Item has been added to the verification list",
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
        const updatedList = verificationItemList.filter((_, i) => i !== index);
        setVerificationItemList(updatedList);
        saveVerificationItemList(updatedList);
        
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
    if (verificationItemList.length === 0) {
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
        setVerificationItemList([]);
        localStorage.removeItem('verificationItemList');
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
    if (verificationItemList.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Items",
        text: "Please add at least one item before saving"
      });
      return;
    }

    const itemsWithoutWarehouse = verificationItemList.filter(item => !item.warehouse);
    if (itemsWithoutWarehouse.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Some items are missing warehouse information. Please remove and re-add those items."
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

      const itemsToSend = verificationItemList.map((item) => {
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
          ItemName: item.itemName,
          Qty: item.allocatedQty,
          UnitPrice: item.unitPrice,
          GType: gTypeValue,
          Warehouse: item.warehouseText || "",
          Rack: item.rackText || ""
        };
      });

      const requestPayload = {
        Items: itemsToSend
      };

      console.log("Sending verification data to backend:", requestPayload);

      const response = await storeVerificationManualInAPI.saveVerificationItems(requestPayload);
      
      if (!response || !response.success) {
        throw new Error(response?.message || "Failed to save verification items.");
      }

      console.log("✓ Verification items saved successfully");
      console.log("Generated REF Numbers:", response.generatedRefNumbers);

      // Clear form
      setVerificationItemList([]);
      localStorage.removeItem('verificationItemList');
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

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        html: `
          <p>${response.itemsProcessed} item(s) saved successfully!</p>
          ${response.generatedRefNumbers && response.generatedRefNumbers.length > 0 ? 
            `<p style="font-size: 12px; margin-top: 10px;">First REF: ${response.generatedRefNumbers[0]}</p>` : 
            ''}
        `,
        confirmButtonColor: '#10b981',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error("Error saving verification items:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.Message ||
                          error.message || 
                          "Failed to save verification items. Please try again.";
      
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
      {/* Header */}
      <div style={{
        backgroundColor: "#8b5cf6",
        color: "white",
        padding: "16px 20px",
        borderRadius: "8px 8px 0 0",
        margin: "-24px -24px 24px -24px",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        <FiCheckCircle size={20} />
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
          Store Verification Manual In
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleAddItem} style={{ position: "relative", overflow: "visible" }}>
        {/* First Row: Store In Type, Warehouse, Rack, Bin */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginBottom: "20px"
        }}>
          {/* Store In Type */}
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

          {/* Warehouse */}
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

          {/* Rack */}
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

          {/* Bin */}
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
              <option value="">-- Select Bin --</option>
              {rackOrders.map((pos, index) => (
                <option key={pos.value ?? index} value={pos.value}>
                  {pos.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Second Row: Item No, Item Name, Unit Price */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginBottom: "20px"
        }}>
          {/* Item No with Autocomplete */}
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
              placeholder="Enter or select Item No"
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
                onMouseDown={(e) => e.preventDefault()}
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

          {/* Item Name */}
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
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px"
              }}
              placeholder={loadingItemDetails ? "Loading..." : "Enter or auto-fill item name"}
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

          {/* Unit Price */}
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

        {/* Third Row: Allocated Qty */}
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

        {/* Add Button */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "24px"
        }}>
          <button
            type="submit"
            style={{
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#059669";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#10b981";
            }}
          >
            <FiPlus size={18} />
            Add
          </button>
        </div>
      </form>

      {/* Item List Table */}
      {verificationItemList.length > 0 && (
        <div style={{
          marginTop: "32px",
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#374151" }}>
              Verification Item List ({verificationItemList.length})
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
              <button
                onClick={handleSaveAll}
                disabled={savingAll}
                style={{
                  backgroundColor: "#8b5cf6",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: savingAll ? "not-allowed" : "pointer",
                  opacity: savingAll ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <FiSave size={16} />
                {savingAll ? "Saving..." : "Save All"}
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
                {verificationItemList.map((item, index) => {
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
                          gap: "4px",
                          margin: "0 auto"
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
        </div>
      )}
    </div>
  );
};

export default StoreVerificationManualInForm;