import React, { useState, useEffect, useRef } from "react";
import { warehouseAPI } from "../../../utils/api/storeView";
import LoadingSpinner from "../../loading/LoadingSpinner";

const WarehouseMapBySK = ({ onWarehouseSelect, selectedWarehouse, SKNo, warehouseFilter = "All" }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    fetchWarehouses();

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      setError(null);
      // const data = await warehouseAPI.getAllWarehousesBySKNo(SKNo);
      const data = await warehouseAPI.GetStoreWarehouseDetailsByLoggedInUser();
      console.log("Warehouses API response:", data);
      setWarehouses(data || []);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      setError("Failed to load warehouses. Please try again.");
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  const getWarehousePositions = () => {
    if (!warehouses || warehouses.length === 0) return [];

    // Filter warehouses based on type filter
    const filteredWarehouses = warehouses.filter(
      (warehouse) => warehouseFilter === "All" || warehouse.w_TYPE === warehouseFilter || warehouse.type === warehouseFilter
    );

    const positions = [];

    // Responsive columns based on screen width
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
    const cols = isMobile ? 2 : 6;
    const rows = Math.ceil(filteredWarehouses.length / cols);

    // Mobile: use percentage-based positioning for better fit
    const marginX = isMobile ? 8 : 6;
    const marginY = isMobile ? 8 : 10;

    const availableWidth = 100 - 2 * marginX;
    const availableHeight = isMobile ? 90 : 80;

    console.log("Calculating warehouse positions:",filteredWarehouses);
    // On mobile, position at 25% and 75% for even distribution
    filteredWarehouses.forEach((warehouse, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      let xPos;
      if (isMobile) {
        // Position first column at 25% and second at 75% for mobile
        xPos = col === 0 ? 25 : 75;
      } else {
        // Desktop positioning
        const horizontalSpacing = cols > 1 ? availableWidth / (cols - 1) : 0;
        xPos = marginX + col * horizontalSpacing;
      }

      const verticalSpacing = rows > 1 ? availableHeight / (rows - 1) : 0;
      const yPos = marginY + row * verticalSpacing;

      positions.push({
        x: xPos,
        y: yPos,
        warehouse: warehouse
      });
    });

    return positions;
  };

  const handleWarehouseClick = (warehouse, position) => {
    console.log("Warehouse clicked:", warehouse);
    onWarehouseSelect(warehouse);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px"
        }}
      >
        <LoadingSpinner
          text="Loading warehouses..."
          size="large"
          variant="primary"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-96 bg-red-50 rounded-lg">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchWarehouses}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const rows = Math.ceil(warehouses.length / (windowWidth <= 768 ? 2 : 6));
  const mapHeight =
    windowWidth <= 768
      ? Math.max(300, rows * 220 + 150)
      : Math.max(500, rows * 170 + 150);

  return (
    <div
      className="warehouse-map-container"
      style={{ minHeight: `${mapHeight}px` }}
    >
      <style jsx>{`
        .warehouse-map-container {
          position: relative;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .map-content {
          position: relative;
          width: 100%;
          height: 100%;
          padding: 165px 15px 70px 15px;
          background-image:
            radial-gradient(
              circle at 20% 20%,
              rgba(255, 255, 255, 0.1) 1px,
              transparent 1px
            ),
            radial-gradient(
              circle at 80% 80%,
              rgba(255, 255, 255, 0.1) 1px,
              transparent 1px
            );
          background-size: 50px 50px;
        }

        @media (max-width: 768px) {
          .map-content {
            padding: 25px 10px 50px 10px;
          }
        }

        .warehouse-marker {
          position: absolute;
          transform: translate(-50%, -50%);
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          max-width: 190px;
        }

        @media (max-width: 768px) {
          .warehouse-marker {
            max-width: 175px;
          }
        }

        .warehouse-marker:hover {
          transform: translate(-50%, -50%) scale(1.08);
          z-index: 50;
        }

        .marker-icon {
          width: 40px;
          height: 40px;
          background: #ef4444;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          position: relative;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border: 3px solid white;
          transition: all 0.3s ease;
        }

        @media (max-width: 768px) {
          .marker-icon {
            width: 40px;
            height: 40px;
            border: 3px solid white;
          }
        }

        .marker-icon::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
        }

        @media (max-width: 768px) {
          .marker-icon::before {
            width: 12px;
            height: 12px;
          }
        }

        .warehouse-marker.selected .marker-icon {
          background: #10b981;
          animation: pulse 2s infinite;
        }

        .warehouse-marker:hover .marker-icon {
          transform: rotate(-45deg) scale(1.15);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        }

        @keyframes pulse {
          0% {
            box-shadow:
              0 4px 12px rgba(0, 0, 0, 0.3),
              0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            box-shadow:
              0 4px 12px rgba(0, 0, 0, 0.3),
              0 0 0 10px rgba(16, 185, 129, 0);
          }
          100% {
            box-shadow:
              0 4px 12px rgba(0, 0, 0, 0.3),
              0 0 0 0 rgba(16, 185, 129, 0);
          }
        }

        .warehouse-info {
          background: white;
          color: #1f2937;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          text-align: center;
          line-height: 1.4;
          width: 180px;
          border: 2px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        @media (max-width: 768px) {
          .warehouse-info {
            width: 165px;
            padding: 9px 12px;
            font-size: 13px;
          }
        }

        .warehouse-marker.selected .warehouse-info {
          background: #10b981;
          color: white;
          border-color: #059669;
        }

        .warehouse-marker:hover .warehouse-info {
          transform: translateY(-4px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
          z-index: 60;
        }

        .info-code {
          font-weight: 700;
          font-size: 15px;
          margin-bottom: 5px;
          color: #1f2937;
        }

        @media (max-width: 768px) {
          .info-code {
            font-size: 14px;
            margin-bottom: 4px;
          }
        }

        .warehouse-marker.selected .info-code {
          color: white;
        }

        .info-name {
          font-size: 13px;
          margin-bottom: 4px;
          font-weight: 500;
          line-height: 1.3;
          word-wrap: break-word;
        }

        @media (max-width: 768px) {
          .info-name {
            font-size: 12px;
            margin-bottom: 3px;
          }
        }

        .info-type {
          font-size: 12px;
          opacity: 0.85;
          margin-bottom: 4px;
        }

        @media (max-width: 768px) {
          .info-type {
            font-size: 11px;
            margin-bottom: 3px;
          }
        }

        .info-keeper {
          font-size: 11px;
          opacity: 0.8;
          font-style: italic;
          padding-top: 5px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          margin-top: 4px;
        }

        @media (max-width: 768px) {
          .info-keeper {
            font-size: 10px;
            padding-top: 4px;
            margin-top: 3px;
          }
        }

        .warehouse-marker.selected .info-keeper {
          border-top-color: rgba(255, 255, 255, 0.3);
        }

        .map-grid {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.08) 1px,
              transparent 1px
            );
          background-size: 50px 50px;
          pointer-events: none;
        }

        .map-header {
          position: absolute;
          top: 15px;
          left: 15px;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          padding: 12px 15px;
          border-radius: 8px;
          z-index: 10;
        }

        @media (max-width: 768px) {
          .map-header {
            top: 10px;
            left: 10px;
            padding: 8px 12px;
            border-radius: 6px;
          }
        }

        .map-header h3 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        @media (max-width: 768px) {
          .map-header h3 {
            font-size: 12px;
            margin-bottom: 2px;
          }
        }

        .map-header p {
          font-size: 12px;
          opacity: 0.75;
          margin: 0;
        }

        @media (max-width: 768px) {
          .map-header p {
            font-size: 10px;
          }
        }

        .warehouse-map-container {
          overflow: hidden;
          padding: 90px 60px;
          min-height: inherit;
        }

        .classB {
          margin-bootm: 100px;
        }
      `}</style>

      <div ref={mapRef} className="map-content">
        <div className="map-grid"></div>
        {getWarehousePositions().map((position) => {
          const warehouse = position.warehouse;
          const wId = warehouse.w_ID || warehouse.W_ID;
          const wCode = warehouse.w_CODE || warehouse.W_CODE;
          const wName = warehouse.w_NAME || warehouse.W_NAME;
          const wType = warehouse.w_TYPE || warehouse.W_TYPE;
          const responsiblePerson =
            warehouse.responsible_PERSON || warehouse.responsiblE_PERSON;

          const isSelected =
            selectedWarehouse?.w_ID === wId || selectedWarehouse?.W_ID === wId;

          return (
            <div
              key={wId}
              className={`warehouse-marker ${isSelected ? "selected" : ""}`}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`
              }}
              onClick={() => handleWarehouseClick(warehouse, position)}
            >
              <div className="marker-icon"></div>
              <div className="warehouse-info">
                <div className="info-code">{wCode}</div>
                <div className="info-name">{wName}</div>
                <div className="info-type">({wType})</div>
                {responsiblePerson && responsiblePerson !== "null" && (
                  <div className="info-keeper">{responsiblePerson}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {warehouses.length === 0 && !loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🏢</div>
            <p>No warehouses available</p>
          </div>
        </div>
      )}

      {/* <div className="classB absolute bottom-1 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg z-10 ">
        <h3 className="text-sm font-semibold mb-1">
          Warehouse Locations ({warehouses.length})
        </h3>
        <p className="text-xs opacity-75">Click on a marker to view details</p>
      </div> */}
    </div>
  );
};

export default WarehouseMapBySK;
