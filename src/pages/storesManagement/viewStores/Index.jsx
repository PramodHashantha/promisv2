import React, { useState, useRef } from "react";
import WarehouseMap from "@/components/storesManagement/viewStore/WarehouseMap";
import RackGrid from "@/components/storesManagement/viewStore/RackGrid";
import ItemsView from "@/components/storesManagement/viewStore/ItemsView";
import PageHeader from "@/components/shared/pageHeader/PageHeader";

const Index = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedRack, setSelectedRack] = useState(null);
  const [currentView, setCurrentView] = useState("warehouses");
  const racksRef = useRef(null);
  const itemsRef = useRef(null);

  const handleWarehouseSelect = (warehouse) => {
    console.log("Index: Warehouse selected:", warehouse);
    console.log("Index: Warehouse w_ID:", warehouse.w_ID);

    setSelectedRack(null);
    setCurrentView("racks");

    setTimeout(() => {
      setSelectedWarehouse(warehouse);

      setTimeout(() => {
        if (racksRef.current) {
          racksRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      }, 150);
    }, 50);
  };

  const handleRackSelect = (rack) => {
    console.log("Index: Rack selected:", rack);
    setSelectedRack(rack);
    setCurrentView("items");

    setTimeout(() => {
      if (itemsRef.current) {
        itemsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    }, 100);
  };

  const handleBackToWarehouses = () => {
    setSelectedWarehouse(null);
    setSelectedRack(null);
    setCurrentView("warehouses");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToRacks = () => {
    setSelectedRack(null);
    setCurrentView("racks");
    if (racksRef.current) {
      racksRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };

  return (
    <>
      <PageHeader>
        <div className="store-header-wrapper">
          <h1 className="page-title">Store Management System</h1>

          <div className="breadcrumb-navigation">
            <div className="breadcrumb">
              <div
                className={`breadcrumb-item ${currentView === "warehouses" ? "breadcrumb-active" : "breadcrumb-link"}`}
                onClick={handleBackToWarehouses}
              >
                🏢 Warehouses
              </div>

              {selectedWarehouse && (
                <>
                  <span className="breadcrumb-separator">›</span>
                  <div
                    className={`breadcrumb-item ${currentView === "racks" ? "breadcrumb-active" : "breadcrumb-link"}`}
                    onClick={handleBackToRacks}
                  >
                    📦 {selectedWarehouse.w_CODE} Racks
                  </div>
                </>
              )}

              {selectedRack && (
                <>
                  <span className="breadcrumb-separator">›</span>
                  <div className="breadcrumb-item breadcrumb-active">
                    📋 {selectedRack.r_CODE} Items
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </PageHeader>

      <div className="main-content">
        <style jsx>{`
          .store-header-wrapper {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }

          .page-title {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 0;
          }

          .breadcrumb-navigation {
            display: flex;
            align-items: center;
          }

          .breadcrumb {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
          }

          .breadcrumb-item {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .breadcrumb-separator {
            color: #d1d5db;
          }

          .breadcrumb-active {
            color: #3b82f6;
            font-weight: 600;
          }

          .breadcrumb-link {
            cursor: pointer;
            transition: color 0.2s ease;
          }

          .breadcrumb-link:hover {
            color: #3b82f6;
          }

          .section {
            margin-bottom: 40px;
            border-radius: 16px;
            padding: 30px;
            animation: slideInFromRight 0.5s ease-out;
          }

          .back-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 20px;
          }

          .back-button:hover {
            transform: translateY(-2px);
          }

          @keyframes slideInFromRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>

        <div className="row">
          <div className="section">
            <WarehouseMap
              onWarehouseSelect={handleWarehouseSelect}
              selectedWarehouse={selectedWarehouse}
            />
          </div>

          {selectedWarehouse && (
            <div ref={racksRef} className="section">
              <button
                className="back-button btn"
                onClick={handleBackToWarehouses}
              >
                ← Back to Warehouses
              </button>
              <RackGrid
                warehouseId={selectedWarehouse.w_ID}
                onRackSelect={handleRackSelect}
                selectedRack={selectedRack}
              />
            </div>
          )}

          {selectedRack && (
            <div ref={itemsRef} className="section">
              <button className="back-button btn" onClick={handleBackToRacks}>
                ← Back to Racks
              </button>
              <ItemsView
                rackId={selectedRack.r_ID}
                warehouseId={selectedWarehouse.w_ID}
                rackCode={selectedRack.r_CODE}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Index;
