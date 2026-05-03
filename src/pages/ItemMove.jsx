import PageHeader from "@/components/shared/pageHeader/PageHeader";
import React, { useEffect, useRef, useState } from "react";
import WarehouseMapBySK from "@/components/storesManagement/viewStore/WarehouseMapBySK";
import RackGrid from "@/components/storesManagement/viewStore/RackGrid";
import ItemViewForSK from "@/components/storesManagement/viewStore/ItemViewForSK";

const ItemMove = () => {
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

  const SKNo = JSON.parse(localStorage.getItem("user"));
  const SKpfno = SKNo?.pfno;

  console.log("PFNO:", SKpfno);

  return (
    <>
      <PageHeader>
        <userHeader />
      </PageHeader>
      <div className="main-content">
        <div className="row">
          <h2 className="pb-10">Item Move</h2>
          <div className="section">
            <WarehouseMapBySK
              onWarehouseSelect={handleWarehouseSelect}
              selectedWarehouse={selectedWarehouse}
              SKNo={SKpfno}
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
              <ItemViewForSK
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

export default ItemMove;
