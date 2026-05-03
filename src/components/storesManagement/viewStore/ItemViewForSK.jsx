import React, { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import {
  rackAPI,
  storeAPI,
  warehouseAPI,
  getWarehousDetailsByRIDItemNumberXY
} from "../../../utils/api/storeView";
import LoadingSpinner from "../../loading/LoadingSpinner";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { set } from "lodash";
import { insertMoveItemDetails } from "@/utils/api/api";

const ItemViewForSK = ({ rackId, warehouseId, rackCode }) => {
  const [rackData, setRackData] = useState(null);
  const [items, setItems] = useState([]);
  const [warehouseData, setWarehouseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemWarehouseDetails, setItemWarehouseDetails] = useState(null);
  const [currentUserWarehouseData, setCurrentWarehouseData] = useState(null);
  const [rackDetails, setRackDetails] = useState(null);
  const [cellDetails, setCellDetails] = useState(null);

  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [selectedRackId, setSelectedRackId] = useState("");
  const [selectedBin, setselectedBin] = useState("");
  const [moveQty, setMoveQty] = useState("");
  const [sourcePosition, setSourcePosition] = useState(null); // {x: number, y: number}

  useEffect(() => {
    if (!rackId || !warehouseId || !rackCode) {
      console.log("ItemsView: Missing required props", {
        rackId,
        warehouseId,
        rackCode
      });
      if (!rackId) {
        setItems([]);
        setRackData(null);
        setError(null);
      }
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      if (!isMounted || !rackId || !warehouseId) {
        return;
      }

      await fetchRackItems();

      if (isMounted && warehouseId) {
        await fetchWarehouseData();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [rackId, warehouseId, rackCode]);

  const getItemProperty = (item, propName) => {
    if (item[propName] !== undefined) return item[propName];
    const keys = Object.keys(item);
    const foundKey = keys.find(
      (key) => key.toLowerCase() === propName.toLowerCase()
    );
    if (foundKey) return item[foundKey];
    return null;
  };

  const fetchWarehouseData = async () => {
    if (!warehouseId) {
      console.warn("fetchWarehouseData called without warehouseId");
      return;
    }

    try {
      const response = await warehouseAPI.getWarehouseById(warehouseId);
      if (response) {
        setWarehouseData(response);
      }
    } catch (error) {
      console.error("Error fetching warehouse data:", error);
    }
  };

  const fetchRackItems = async () => {
    console.log("Test here");
    if (!rackId || !warehouseId || !rackCode) {
      console.warn("fetchRackItems called with missing props:", {
        rackId,
        warehouseId,
        rackCode
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await new Promise((resolve) => setTimeout(resolve, 200));

      if (!rackId || !warehouseId) {
        console.warn("Props became null during delay");
        setLoading(false);
        return;
      }

      const [rackResponse, itemsResponse] = await Promise.all([
        rackAPI.getRackById(rackId).catch((err) => {
          console.warn("Rack API failed:", err);
          return null;
        }),
        storeAPI.getStoresByRackId(rackId).catch((err) => {
          console.error("Items API failed:", err);
          throw err;
        })
      ]);
      console.log("Item Details", itemsResponse);

      if (itemsResponse && Array.isArray(itemsResponse)) {
        setItems(itemsResponse);
      } else {
        setItems([]);
      }

      let rack = null;

      if (Array.isArray(rackResponse) && rackResponse.length > 0) {
        rack = rackResponse[0];
      } else if (
        rackResponse &&
        typeof rackResponse === "object" &&
        !Array.isArray(rackResponse)
      ) {
        rack = rackResponse;
      } else if (itemsResponse && itemsResponse.length > 0) {
        let maxX = 0;
        let maxY = 0;

        itemsResponse.forEach((item) => {
          const itemX = parseInt(getItemProperty(item, "x") || 0);
          const itemY = parseInt(getItemProperty(item, "y") || 0);
          if (itemX > maxX) maxX = itemX;
          if (itemY > maxY) maxY = itemY;
        });

        rack = {
          r_ID: rackId,
          r_CODE: rackCode,
          x: maxX + 1,
          y: maxY + 1,
          w_ID: warehouseId
        };
      }

      if (rack) {
        setRackData(rack);
      }
    } catch (error) {
      console.error("Error fetching rack items:", error);
      setError("Failed to load rack details. Please try again.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const groupItemsByPosition = () => {
    const grouped = {};
    items.forEach((item) => {
      const x = parseInt(getItemProperty(item, "x") || 0);
      const y = parseInt(getItemProperty(item, "y") || 0);
      const key = `${x + 1},${y + 1}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });
    return grouped;
  };

  const calculateRowHeight = (
    description,
    maxChars = 33,
    baseHeight = 15.6
  ) => {
    if (!description) return baseHeight;
    const rows = Math.ceil(description.length / maxChars);
    return rows * baseHeight;
  };

  if (!rackId) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 0" }}>
        <div
          style={{
            fontSize: "3.75rem",
            color: "#9ca3af",
            marginBottom: "1rem"
          }}
        >
          📦
        </div>
        <p style={{ color: "#6b7280" }}>Please select a rack to view items</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "300px"
        }}
      >
        <LoadingSpinner
          text="Loading items..."
          size="large"
          variant="primary"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "2rem",
          background: "#fef2f2",
          borderRadius: "0.5rem"
        }}
      >
        <div
          style={{
            fontSize: "1.875rem",
            color: "#ef4444",
            marginBottom: "0.5rem"
          }}
        >
          ⚠️
        </div>
        <p style={{ color: "#dc2626", marginBottom: "1rem" }}>{error}</p>
        <button
          onClick={fetchRackItems}
          style={{
            padding: "0.5rem 1rem",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer"
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const groupedItems = groupItemsByPosition();

  const toggleMoveItemModal = async (item) => {
    // get warehouse details for the item
    const response = await getWarehousDetailsByRIDItemNumberXY(
      rackId,
      item.itemNumber,
      parseInt(getItemProperty(item, "x") || 0),
      parseInt(getItemProperty(item, "y") || 0)
    );
    console.log("item details - ", item);

    // get warehouse details by Current User
    const userWarehouseDetails =
      await warehouseAPI.getWarehousesByCurrentPFNO();

    setCurrentWarehouseData(userWarehouseDetails);
    const data = response[0];
    setSelectedItem(item);
    setItemWarehouseDetails(data);
    setSourcePosition({
      x: Number(getItemProperty(item, "x") ?? 0),
      y: Number(getItemProperty(item, "y") ?? 0)
    });
    setShowMoveModal(true);
  };

  const closeModal = () => {
    setShowMoveModal(false);
    setSelectedItem(null);
    setItemWarehouseDetails(null);
    setCurrentWarehouseData(null);
  };

  const handleWarehouseChange = async (e) => {
    const w_ID = e.target.value;
    setSelectedWarehouseId(w_ID);
    setSelectedRackId(""); // reset rack
    setRackDetails([]); // reset rack list

    setselectedBin("");
    setCellDetails([]);

    if (!w_ID) return;

    try {
      const response = await rackAPI.getAllRacksByWarehouseId(w_ID);
      console.log("Racks by Warehouse ID:", response);
      setRackDetails(response);
    } catch (error) {
      console.error("Error fetching rack data:", error);
    }
  };

  const handleRackChange = async (e) => {
    const r_ID = e.target.value;
    console.log("rack ID", r_ID);
    setSelectedRackId(e.target.value);
    if (!r_ID) return;
    try {
      const response = await rackAPI.getRackById(r_ID);
      console.log("Bins", response);
      setCellDetails(response.positions);
      console.log("cellDetails", response.positions);
      console.log(r_ID);
    } catch (error) {
      console.log("Error featching Cell- ", error);
    }
  };
  const handleCellChange = async (e) => {
    try {
      setselectedBin(e.target.value);
    } catch (error) {
      console.log(error);
    }
  };

  const handleMove = async () => {
    const qty = Number(moveQty);
    if (!qty || qty <= 0) {
      Swal.fire("Error", "Please enter a valid quantity", "warning");
      return;
    }
    if (qty > selectedItem.availableQty) {
      Swal.fire("Error", "Quantity exceeds available stock", "error");
      return;
    }

    if (!selectedWarehouseId || !selectedRackId || !selectedBin) {
      Swal.fire(
        "Error",
        "Please select target warehouse, rack and cell",
        "warning"
      );
      return;
    }
    // Prevent moving to same position
    const [targetX, targetY] = selectedBin.split(",").map(Number);
    const sourceX = Number(getItemProperty(selectedItem, "x") || 0);
    const sourceY = Number(getItemProperty(selectedItem, "y") || 0);

    if (
      selectedRackId === selectedItem.r_ID &&
      targetX === sourceX &&
      targetY === sourceY
    ) {
      Swal.fire("Invalid", "Cannot move item to the same position", "info");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const UserPfNo = user?.pfno;
    console.log("sourcePosition", sourcePosition);
    console.log("sourcePosition Y", sourcePosition.y);
    console.log("sourcePosition X", sourcePosition.x);
    // Decide payload format according to your backend expectation
    // Option A – most common: one combined payload

    // Fix: use target coordinates where appropriate
    const payload = {
      updateStoreRequest: {
        r_ID: String(selectedItem.r_ID),
        x: String(sourcePosition.x),
        y: String(sourcePosition.y),
        iteM_NUMBER: String(selectedItem.itemNumber),
        reF_NO: String(selectedItem.reF_NO || ""),
        status: "1",
        trN_BY: String(UserPfNo),
        availablE_QTY: String(Number(selectedItem.availableQty) - qty)
      },

      insertStoreTRNRequest: {
        from_R_ID: String(selectedItem.r_ID),
        to_R_ID: String(selectedRackId),
        x: String(sourcePosition.x),
        y: String(sourcePosition.y),
        ouT_QTY: String(qty),
        uniT_PRICE: String(selectedItem.unitPrice || 0),
        reF_NO: String(selectedItem.reF_NO || ""),
        iteM_NUMBER: String(selectedItem.itemNumber),
        status: "1",
        trN_BY: String(UserPfNo)
      },

      insertStoreRequest: {
        r_ID: String(selectedRackId),
        x: String(targetX - 1), // backend expects 0-based index
        y: String(targetY - 1), // backend expects 0-based index
        availablE_QTY: String(qty),
        reF_NO: String(selectedItem.reF_NO || ""),
        iteM_NUMBER: String(selectedItem.itemNumber),
        status: "1",
        trN_BY: String(UserPfNo),
        gType: String(selectedItem.gType || "")
      },

      itemMoveStoreTRNRequest: {
        r_ID: String(selectedRackId),
        from_R_ID: String(selectedItem.r_ID),
        x: String(targetX - 1), // backend expects 0-based index
        y: String(targetY - 1), // backend expects 0-based index
        iN_QTY: String(qty),
        ouT_QTY: "0",
        reF_NO: String(selectedItem.reF_NO || ""),
        iteM_NUMBER: String(selectedItem.itemNumber),
        uniT_PRICE: String(selectedItem.unitPrice || 0),
        status: "1",
        trN_BY: String(UserPfNo),
        issuE_REF: String(selectedItem.reF_NO || "")
      }
    };
    try {
      console.log("Selected Item", selectedItem);
      console.log("Pass Item", payload);
      console.log("MOVE PAYLOAD →", JSON.stringify(payload, null, 2));
      const response = await insertMoveItemDetails(payload);

      if (!response.success) {
        throw new Error("Move failed");
      }

      Swal.fire({
        icon: "success",
        title: "Moved",
        text: `${qty} unit(s) moved successfully`,
        timer: 2200
      });
      closeModal();
      setMoveQty("");
      await fetchRackItems(); // refresh list
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.message || "Could not complete the move. Try again."
      });
    }
  };

  return (
    <div className="items-view-container">
      <style>{`
        .items-view-container {
          padding: 20px 0;
        }
        
        .verification-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: inherit;
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        .btn-blue {
          background: #3b82f6;
          color: white;
        }
        
        .btn-green {
          background: #10b981;
          color: white;
        }
        
        .btn-purple {
          background: #a7009f;
          color: white;
        }
        
        .btn-orange {
          background: #f97316;
          color: white;
        }
        
        .spinner {
          border: 2px solid transparent;
          border-top-color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .position-section {
          margin-bottom: 30px;
        }
        
        .position-header {
          background: #3b82f6;
          color: #000;
          padding: 8px 16px;
          font-weight: 700;
          font-size: 16px;
          border-radius: 6px 6px 0 0;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-radius: 0 0 6px 6px;
          overflow: hidden;
        }
        
        .items-table thead {
          background: #3b82f6;
        }
        
        .items-table th {
          padding: 12px 15px;
          text-align: left;
          font-weight: 700;
          color: #000;
          font-size: 14px;
          border-bottom: 2px solid #2563eb;
        }
        
        .items-table th:last-child {
          text-align: right;
        }
        
        .items-table tbody tr {
          border-bottom: 1px solid #e5e7eb;
          transition: background 0.2s;
        }
        
        .items-table tbody tr:hover {
          background: #f9fafb;
        }
        
        .items-table tbody tr:last-child {
          border-bottom: none;
        }
        
        .items-table td {
          padding: 15px;
          color: #374151;
          font-size: 13px;
        }
        
        .item-number {
          font-weight: 800;
            color: #111827;
            font-size: 15px; 
            margin-bottom: 6px;
        }
        
        .item-description {
          color: #111827;
          font-size: 15px;
          line-height: 1.4;
        }
        
        .item-price {
          color: #111827;
          font-size: 14px;
        }
        
        .item-qty {
          text-align: right;
          font-weight: 600;
          font-size: 15px;
          color: #111827;
        }
        
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #9ca3af;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .items-view-container {
          animation: fadeInUp 0.6s ease-out;
        }
        .positions-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr); /* 🔥 two tables */
            gap: 20px;
        }

        /* Mobile responsive */
        @media (max-width: 900px) {
            .positions-grid {
                grid-template-columns: 1fr;
            }
        }

        /* Backdrop */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          transition: opacity 0.7s ease;
        }

        /* Modal positioning */
        .modal-wrapper {
          position: fixed;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1001;
          transition: opacity 0.7s ease;
        }

        /* Modal box */
        .modal-box {
          background: #fff;
          width: 900px;
          max-width: 95%;
          border-radius: 6px;
          overflow: hidden;
        }

        /* Header */
        .modal-header {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #ddd;
        }

        /* Body */
        .modal-body {
          display: flex;
          gap: 20px;
          padding: 16px;
        }

        .modal-column {
          flex: 1;
        }

        .modal-column input,
        .modal-column select {
          width: 100%;
          padding: 6px;
          margin-bottom: 10px;
        }

        /* Footer */
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 12px 16px;
          border-top: 1px solid #ddd;
        }

        /* Buttons */
        .move-btn {
          background: #2563eb;
          color: white;
          border: none;
          padding: 6px 10px;
          cursor: pointer;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
        }

        .btn-move {
          background: #2563eb;
          color: white;
          border: none;
          padding: 6px 14px;
          cursor: pointer;
        }

        .btn-close {
          background: #6b7280;
          color: white;
          border: none;
          padding: 6px 14px;
          cursor: pointer;
        }
        
        .move-btn {
          padding: 6px 10px;
          background: #2563eb;
          color: white;
          border: none;
          font-size: 14px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 15px;
        }
      `}</style>

      <div className="verification-buttons"></div>
      {items.length > 0 ? (
        <div className="positions-grid">
          {Object.keys(groupedItems)
            .sort()
            .map((position) => {
              const positionItems = groupedItems[position];

              return (
                <div key={position} className="position-section">
                  <div className="position-header">({position})</div>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Items</th>
                        <th>Qty</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {positionItems.map((item, index) => {
                        const itemNumber =
                          getItemProperty(item, "item_NUMBER") ||
                          getItemProperty(item, "itemNumber") ||
                          getItemProperty(item, "ITEM_NUMBER") ||
                          "";

                        const description =
                          getItemProperty(item, "description") ||
                          getItemProperty(item, "DESCRIPTION") ||
                          "";

                        const unitPrice =
                          getItemProperty(item, "unit_PRICE") ||
                          getItemProperty(item, "unitPrice") ||
                          getItemProperty(item, "UNIT_PRICE") ||
                          0;

                        const availableQty =
                          getItemProperty(item, "available_QTY") ||
                          getItemProperty(item, "availableQty") ||
                          getItemProperty(item, "AVAILABLE_QTY") ||
                          0;

                        const uom =
                          getItemProperty(item, "uom") ||
                          getItemProperty(item, "UOM") ||
                          "";
                        const reF_NO = getItemProperty(item, "reF_NO") || "";
                        const r_ID = getItemProperty(item, "r_ID") || rackId;
                        const x = parseInt(getItemProperty(item, "x") || 0);
                        const y = parseInt(getItemProperty(item, "y") || 0);
                        const gType = getItemProperty(item, "gType") || 99;
                        return (
                          <tr key={index}>
                            <td>
                              <div className="item-number">{itemNumber}</div>
                              <div className="item-description">
                                {description}
                              </div>
                              <div className="item-price">
                                Unit Price Rs.
                                {parseFloat(unitPrice || 0).toLocaleString(
                                  "en-US",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  }
                                )}
                              </div>
                            </td>
                            <td className="item-qty">
                              {parseFloat(availableQty || 0).toFixed(2)} ({uom})
                            </td>
                            <tb>
                              <button
                                onClick={() =>
                                  toggleMoveItemModal({
                                    itemNumber,
                                    description,
                                    unitPrice,
                                    availableQty,
                                    uom,
                                    rackCode,
                                    position,
                                    reF_NO,
                                    r_ID,
                                    x,
                                    y,
                                    gType
                                  })
                                }
                                className="move-btn"
                              >
                                <i className="fa-solid fa-right-left"></i>
                              </button>
                            </tb>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="empty-state">
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</div>
          <p>No items found for this rack</p>
        </div>
      )}
      {showMoveModal && selectedItem && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
            onClick={closeModal}
          />
          {/* Modal Wrapper */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              maxWidth: "920px",
              width: "94vw",
              maxHeight: "90vh",
              overflow: "auto"
            }}
          >
            {/* Modal Box */}
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                padding: "20px",
                display: "flex",
                flexDirection: "column"
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "16px",
                  marginBottom: "20px"
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: "#1e40af",
                    fontSize: "1.5rem",
                    fontWeight: "bold"
                  }}
                >
                  Move Item
                </h3>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    color: "#6b7280"
                  }}
                  onClick={closeModal}
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  flex: 1
                }}
              >
                {/* From Section */}
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "16px",
                    borderRadius: "8px"
                  }}
                >
                  <h5
                    style={{
                      margin: "0 0 12px 0",
                      color: "#334155",
                      fontSize: "1.1rem",
                      fontWeight: "600"
                    }}
                  >
                    From Location
                  </h5>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px"
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "4px",
                          fontWeight: "500"
                        }}
                      >
                        Warehouse
                      </label>
                      <input
                        readOnly
                        value={`${itemWarehouseDetails?.w_CODE} - ${itemWarehouseDetails?.w_DESCRIPTION || ""}`}
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          backgroundColor: "#f9fafb"
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "4px",
                          fontWeight: "500"
                        }}
                      >
                        Rack
                      </label>
                      <input
                        readOnly
                        value={selectedItem.rackCode || rackCode || "—"}
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          backgroundColor: "#f9fafb"
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "4px",
                          fontWeight: "500"
                        }}
                      >
                        Cell
                      </label>
                      <input
                        readOnly
                        value={
                          selectedItem.position ||
                          (sourcePosition
                            ? `${sourcePosition.x + 1},${sourcePosition.y + 1}`
                            : "—")
                        }
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          backgroundColor: "#f9fafb"
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "4px",
                          fontWeight: "500"
                        }}
                      >
                        Item No
                      </label>
                      <input
                        readOnly
                        value={selectedItem.itemNumber}
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          backgroundColor: "#f9fafb"
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: "16px",
                      fontWeight: 600,
                      color: "#374151"
                    }}
                  >
                    Available:{" "}
                    {Number(selectedItem.availableQty).toLocaleString()}{" "}
                    {selectedItem.uom}
                  </div>
                </div>

                {/* To Section */}
                <div>
                  <h5
                    style={{
                      margin: "0 0 12px 0",
                      color: "#334155",
                      fontSize: "1.1rem",
                      fontWeight: "600"
                    }}
                  >
                    To Location
                  </h5>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "16px"
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "4px",
                          fontWeight: "500"
                        }}
                      >
                        Warehouse <span style={{ color: "red" }}>*</span>
                      </label>
                      <select
                        value={selectedWarehouseId}
                        onChange={handleWarehouseChange}
                        disabled={downloading}
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          backgroundColor: "#fff"
                        }}
                      >
                        <option value="">Select warehouse...</option>
                        {currentUserWarehouseData?.map((w) => (
                          <option key={w.w_ID} value={w.w_ID}>
                            {w.w_CODE} – {w.w_NAME || w.w_DESCRIPTION}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "4px",
                          fontWeight: "500"
                        }}
                      >
                        Rack <span style={{ color: "red" }}>*</span>
                      </label>
                      <select
                        value={selectedRackId}
                        onChange={handleRackChange}
                        disabled={!selectedWarehouseId || downloading}
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          backgroundColor: "#fff"
                        }}
                      >
                        <option value="">Select rack...</option>
                        {rackDetails?.map((r) => (
                          <option key={r.r_ID} value={r.r_ID}>
                            {r.r_CODE}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "4px",
                          fontWeight: "500"
                        }}
                      >
                        Cell/Bin <span style={{ color: "red" }}>*</span>
                      </label>
                      <select
                        value={selectedBin}
                        onChange={handleCellChange}
                        disabled={!selectedRackId || downloading}
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          backgroundColor: "#fff"
                        }}
                      >
                        <option value="">Select cell...</option>
                        {cellDetails?.map((c) => (
                          <option key={`${c.x}-${c.y}`} value={`${c.x},${c.y}`}>
                            {c.displayName || `${c.x + 1},${c.y + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "4px",
                          fontWeight: "500"
                        }}
                      >
                        Quantity to Move <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={selectedItem.availableQty}
                        step="any"
                        value={moveQty}
                        onChange={(e) => setMoveQty(e.target.value)}
                        disabled={downloading}
                        placeholder={`Max: ${selectedItem.availableQty}`}
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          backgroundColor: "#fff",
                          fontWeight: 600
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  borderTop: "1px solid #e5e7eb",
                  paddingTop: "16px",
                  marginTop: "20px"
                }}
              >
                <button
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    backgroundColor: "#fff",
                    cursor: "pointer"
                  }}
                  onClick={closeModal}
                  disabled={downloading}
                >
                  Cancel
                </button>
                <button
                  style={{
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                    backgroundColor: "#3b82f6",
                    color: "#fff",
                    cursor: "pointer"
                  }}
                  onClick={handleMove}
                  disabled={downloading || !moveQty || !selectedBin}
                >
                  {downloading ? (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid #fff",
                          borderTop: "2px solid transparent",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite"
                        }}
                      />
                      Moving...
                    </span>
                  ) : (
                    "Confirm Move"
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ItemViewForSK;
