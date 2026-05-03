import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import {
  GetWarehouseItemShortagesWithDescription,
  GETItemINVirtualRack,
  GetStoreWarehouseDetailsByLoggedInUser as GetWarehouseDetailsAPI
} from "@/utils/api/api";
import Table from "@/components/shared/table/Table";
import SelectDropdown from "@/components/shared/SelectDropdown";
import SectionHeader from "@/components/shared/SectionHeader";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import {
  FiCopy,
  FiDownload,
  FiPrinter,
  FiSearch,
  FiAlertTriangle,
  FiRefreshCw,
  FiEye,
} from "react-icons/fi";

const ManageWarehouse = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentFilter, setCurrentFilter] = useState("All");
  const [virtualRackItems, setVirtualRackItems] = useState([]);
  const virtualRackItemsPerPage = 10;
  const [loadingVirtualRack, setLoadingVirtualRack] = useState(false);

  const [virtualRackSearch, setVirtualRackSearch] = useState("");
  const [virtualRackPage, setVirtualRackPage] = useState(1);

  const [reorderData, setReorderData] = useState([]);
  const [selectedWarehouseCode, setSelectedWarehouseCode] = useState("");
  const [loadingReorder, setLoadingReorder] = useState(false);
  const [warehouseOptions, setWarehouseOptions] = useState([]);

  useEffect(() => {
    loadVirtualRackItems();
    loadWarehouseOptions();
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const data = await GetWarehouseDetailsAPI();
      setWarehouses(data || []);
    } catch (err) {
      console.error("Error loading warehouses:", err);
      setError("Failed to load warehouses");
    } finally {
      setLoading(false);
    }
  };

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const showToast = (icon, title) =>
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });

  const showAlert = (icon, title, text) =>
    Swal.fire({ icon, title, text, confirmButtonColor: "#4f46e5" });

  // ─── Data loaders ────────────────────────────────────────────────────────────

  const loadReorderData = async () => {
    if (!selectedWarehouseCode) {
      showAlert("warning", "Select Warehouse", "Please select a warehouse code");
      return;
    }

    try {
      setLoadingReorder(true);

      const selectedWH = warehouseOptions.find(
        (wh) => wh.code === selectedWarehouseCode
      );

      if (!selectedWH || !selectedWH.id) {
        showAlert("error", "Error", "Warehouse ID not found for the selected warehouse code.");
        return;
      }

      const data = await GetWarehouseItemShortagesWithDescription(selectedWH.id);
      const transformedData = Array.isArray(data)
        ? data.map((item) => ({
          warehouseCode: item.W_CODE || item.w_CODE || "",
          itemNumber: item.ITEM_NUMBER || item.item_NUMBER || item.Item_Number || item.iteM_NUMBER || "",
          availableQty: item.Available_Qty_By_Warehouse || item.available_Qty_By_Warehouse || 0,
          shortage: item.Shortage || item.shortage || 0,
          description: item.Availability_Description || item.availability_Description || ""
        }))
        : [];
      setReorderData(transformedData);
    } catch (err) {
      console.error("Error loading reorder data:", err);
      showAlert("error", "Error", err.message || "Failed to load reorder data. Please try again.");
      setReorderData([]);
    } finally {
      setLoadingReorder(false);
    }
  };

  const loadVirtualRackItems = async () => {
    try {
      setLoadingVirtualRack(true);
      const virtualRacks = await GETItemINVirtualRack();
      const virtualRackData = Array.isArray(virtualRacks)
        ? virtualRacks.map((w) => ({
          warehouseCode: w.W_CODE || w.warehouseCode || w.w_CODE || "",
          rackName: w.r_NAME || w.rackname || w.w_NAME || "",
          bin: w.bin || "",
          x: w.x || "",
          y: w.y || "",
          itemNumber: w.ITEM_NUMBER || w.itemNumber || w.iteM_NUMBER || "",
          description: w.description || "",
          uom: w.uom || "",
          availableQty: w.available_Qty || w.availableQty || w.availablE_QTY || 0,
          grnNumber: w.grnNumber || w.GRN_NUMBER || w.grN_NUMBER || "",
          storeInDate: w.storeInDate || w.StoreInDate || w.storE_CREATED_DATE || ""
        }))
        : [];
      setVirtualRackItems(virtualRackData);
    } catch (err) {
      console.error("Error loading virtual rack items:", err);
      setVirtualRackItems([]);
    } finally {
      setLoadingVirtualRack(false);
    }
  };

  const loadWarehouseOptions = async () => {
    try {
      const whs = await GetWarehouseDetailsAPI();
      const options = Array.isArray(whs)
        ? whs
          .map((w) => ({
            id: w.w_ID || 0,
            code: w.w_CODE || "",
            name: w.w_NAME || ""
          }))
          .filter((w) => w.code && w.id > 0)
        : [];
      setWarehouseOptions(options);
    } catch (err) {
      console.error("Error loading warehouse options:", err);
      setWarehouseOptions([]);
    }
  };

  // ─── Virtual rack filtering / pagination ────────────────────────────────────

  const filteredVirtualRackItems = virtualRackItems.filter((item) => {
    const q = virtualRackSearch.toLowerCase();
    return (
      (item.warehouseCode || "").toLowerCase().includes(q) ||
      (item.rackName || "").toLowerCase().includes(q) ||
      (item.itemNumber || "").toLowerCase().includes(q) ||
      (item.description || "").toLowerCase().includes(q) ||
      (item.grnNumber || "").toLowerCase().includes(q)
    );
  });

  const virtualRackTotalPages = Math.ceil(filteredVirtualRackItems.length / virtualRackItemsPerPage);
  const virtualRackStartIndex = (virtualRackPage - 1) * virtualRackItemsPerPage;
  const paginatedVirtualRackItems = filteredVirtualRackItems.slice(
    virtualRackStartIndex,
    virtualRackStartIndex + virtualRackItemsPerPage
  );

  // ─── Action handlers ─────────────────────────────────────────────────────────

  const handleVirtualRackCopy = () => {
    const text = filteredVirtualRackItems
      .map((item) =>
        [
          item.warehouseCode || "",
          item.rackName || "",
          `${item.x || ""},${item.y || ""}`,
          item.itemNumber || "",
          item.description || "",
          item.uom || "",
          item.availableQty || "",
          item.grnNumber || "",
          item.storeInDate ? new Date(item.storeInDate).toLocaleDateString() : ""
        ].join("\t")
      )
      .join("\n");
    navigator.clipboard.writeText(text);
    showToast("success", "Virtual rack items copied to clipboard");
  };

  const handleVirtualRackCSV = () => {
    const csv =
      "Warehouse Code,Rack Name,Bin,Item Number,Description,UOM,Available Qty,GRN Number,Store In Date\n" +
      filteredVirtualRackItems
        .map((item) =>
          [
            item.warehouseCode || "",
            item.rackName || "",
            `${item.x || ""},${item.y || ""}`,
            item.itemNumber || "",
            item.description || "",
            item.uom || "",
            item.availableQty || "",
            item.grnNumber || "",
            item.storeInDate ? new Date(item.storeInDate).toLocaleDateString() : ""
          ].join(",")
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "virtual_rack_items.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleVirtualRackPrint = () => {
    const printWindow = window.open("", "", "width=1200,height=800");
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Item List In Virtual Rack</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .header h1 { margin: 0 0 10px 0; font-size: 20px; color: #333; }
          .warning { background-color: #f44336; color: white; padding: 10px; margin-bottom: 20px; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
          thead { background-color: #f5f5f5; }
          th, td { padding: 6px 4px; text-align: left; border: 1px solid #ddd; }
          tbody tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="header"><h1>Item List In Virtual Rack</h1></div>
        <div class="warning">
          The Following Items Have Been Stored In The Virtual Rack For More Than <strong>3 Days</strong>. Please Move Them To Their Correct Locations As Soon As Possible.
        </div>
        <table>
          <thead>
            <tr>
              <th>Warehouse Code</th><th>Rack Name</th><th>Bin</th><th>Item Number</th>
              <th>Description</th><th>UOM</th><th>Available Qty</th><th>GRN Number</th><th>Store In Date</th>
            </tr>
          </thead>
          <tbody>
            ${filteredVirtualRackItems
        .map(
          (item) => `
              <tr>
                <td>${item.warehouseCode || ""}</td>
                <td>${item.rackName || ""}</td>
                <td>${item.x || ""},${item.y || ""}</td>
                <td>${item.itemNumber || ""}</td>
                <td>${item.description || ""}</td>
                <td>${item.uom || ""}</td>
                <td>${item.availableQty || ""}</td>
                <td>${item.grnNumber || ""}</td>
                <td>${item.storeInDate ? new Date(item.storeInDate).toLocaleDateString() : ""}</td>
              </tr>`
        )
        .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
  };

  const getPFNO = () => {
    let pfno =
      localStorage.getItem("pfno") ||
      localStorage.getItem("PFNO") ||
      localStorage.getItem("pf_no") ||
      localStorage.getItem("PF_NO");

    if (!pfno) {
      const userStr = localStorage.getItem("user") || localStorage.getItem("userData");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          pfno = user.pfno || user.PFNO || user.pf_no || user.PF_NO || user.pfNo;
        } catch (e) {
          console.error("Could not parse user:", e);
        }
      }
    }

    if (!pfno) {
      pfno =
        sessionStorage.getItem("pfno") ||
        sessionStorage.getItem("PFNO") ||
        sessionStorage.getItem("pf_no") ||
        sessionStorage.getItem("PF_NO");
    }

    return pfno || "DEFAULT_PFNO";
  };

  const handleEditClick = (warehouse) => {
    if (!warehouse) {
      showAlert("error", "Error", "Warehouse data is missing");
      return;
    }
    if (!warehouse.id) {
      showAlert("error", "Error", `Warehouse ID is missing. Warehouse code: ${warehouse.warehouseCode || warehouse.code || "N/A"}`);
      return;
    }
    const navigationPath = `/stockWareHouse/warehouseRackManagement?W_ID=${warehouse.id}`;
    try {
      navigate(navigationPath);
    } catch (error) {
      showAlert("error", "Navigation Error", error.message);
    }
  };

  // ─── Derived state ────────────────────────────────────────────────────────────

  const filterOptions = ["All", "Main", "Sub"];

  const filteredData = warehouses.filter(
    (warehouse) => currentFilter === "All" || warehouse.type === currentFilter
  );

  // ─── Reusable sub-components ─────────────────────────────────────────────────

  const TableSpinner = ({ colSpan }) => (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm">Loading data...</span>
        </div>
      </td>
    </tr>
  );

  const TableEmpty = ({ colSpan, message }) => (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-slate-400">
        {message}
      </td>
    </tr>
  );

  const Pagination = ({ page, totalPages, startIndex, itemsPerPage, total, onPageChange }) => {
    if (total === 0) return null;
    return (
      <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
        <p className="text-sm text-slate-500">
          Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
          <span className="font-medium">{Math.min(startIndex + itemsPerPage, total)}</span> of{" "}
          <span className="font-medium">{total}</span> entries
        </p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              if (totalPages <= 5) return true;
              return p === page || p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1);
            })
            .map((p, idx, arr) => {
              const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
              return (
                <React.Fragment key={p}>
                  {showEllipsis && <span className="px-1 text-slate-400 text-sm">…</span>}
                  <button
                    onClick={() => onPageChange(p)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${page === p
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              );
            })}
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="px-3 py-1 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  // ─── Table Columns ───────────────────────────────────────────────────────────

  const reorderColumns = [
    {
      header: "Warehouse Code",
      accessorKey: "warehouseCode",
      cell: (info) => (
        <span className="font-medium text-brand-text">{info.getValue() || ""}</span>
      ),
    },
    {
      header: "Item Number",
      accessorKey: "itemNumber",
      cell: (info) => (
        <span className="font-medium  whitespace-nowrap">{info.getValue() || ""}</span>
      ),
    },
    {
      header: "Available Qty (By Warehouse)",
      accessorKey: "availableQty",
      cell: (info) => {
        const val = info.getValue();
        return <span className="text-brand-text-secondary">{val !== undefined && val !== null ? Number(val).toFixed(2) : "0.00"}</span>;
      },
    },
    {
      header: "Shortage",
      accessorKey: "shortage",
      cell: (info) => {
        const val = info.getValue();
        const numVal = val !== undefined && val !== null ? Number(val) : 0;
        return (
          <span className={`font-bold ${numVal > 0 ? "text-brand-text-secondary" : "text-brand-text-secondary"}`}>
            {numVal.toFixed(2)}
          </span>
        );
      },
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (info) => (
        <span className="text-brand-text-muted">{info.getValue() || ""}</span>
      ),
    },
  ];

  const warehouseColumns = [
    {
      header: "Warehouse Code",
      accessorKey: "w_CODE",
      cell: (info) => (
        <span className="font-medium text-brand-text">{info.getValue()}</span>
      ),
    },
    {
      header: "Warehouse Name",
      accessorKey: "w_NAME",
      cell: (info) => (
        <span className="text-brand-text-secondary">{info.getValue()}</span>
      ),
    },
    {
      header: "Type",
      accessorKey: "w_TYPE",
      cell: (info) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${info.getValue() === "Main"
            ? "bg-indigo-100 text-indigo-700"
            : "bg-amber-100 text-amber-700"
          }`}>
          {info.getValue()}
        </span>
      ),
    },
    {
      header: "Responsible Person",
      accessorKey: "fullname",
      cell: (info) => {
        const val = info.getValue();
        return <span className="text-brand-text-muted italic">{val && val !== "null" ? val : "Not Assigned"}</span>;
      },
    },
    {
      header: "Actions",
      id: "actions",
      cell: (info) => (
        <button
          onClick={() => handleEditClick({ id: info.row.original.w_ID, code: info.row.original.w_CODE })}
          className="brand-btn-secondary h-8 px-3 text-[10px] font-bold uppercase tracking-wider"
        >
          View Racks
        </button>
      ),
    },
  ];

  const dropdownFilterOptions = [
    { label: "All Warehouses", value: "All" },
    { label: "Main Warehouse", value: "Main" },
    { label: "Sub Warehouse", value: "Sub" },
  ];

  const ActionBtn = ({ onClick, icon: Icon, label }) => (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="w-full">

        {/* ── Page Header ── */}
        <SectionHeader
          title="Warehouse Management"
          subtitle="Monitor and manage all warehouse locations and inventory status"
          rightContent={
            <div className="flex items-center gap-3 bg-brand-surface rounded-xl border border-brand-border shadow-sm min-w-[240px]">
              {/* <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.15em] ml-2">Type Filter:</span> */}
              <SelectDropdown
                options={dropdownFilterOptions}
                selectedOption={dropdownFilterOptions.find(opt => opt.value === currentFilter)}
                onSelectOption={(opt) => setCurrentFilter(opt.value)}
                className="flex-1 !border-none !shadow-none"
                defaultSelect="All"
              />
            </div>
          }
        />

        <div className="mb-4" /> {/* Spacing */}

        {/* ── Error Banner ── */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
            <FiAlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ── Warehouse Table ── */}
        <div className="mb-8">
          {loading ? (
            <TableSkeleton columns={5} rows={5} />
          ) : (
            <Table
              data={filteredData}
              columns={warehouseColumns}
            />
          )}
        </div>

        {/* ── Card: Item List In Virtual Rack ── */}
        {(loadingVirtualRack || filteredVirtualRackItems.length > 0) && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs mb-5 overflow-hidden">
            {/* Red gradient header */}
            <div className="px-5 py-4 bg-gradient-to-r from-red-500 to-red-600 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <FiAlertTriangle className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
                Item List In Virtual Rack
              </h2>
            </div>

            <div className="p-5">
              {/* Warning banner */}
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5">
                <FiAlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800 leading-relaxed">
                  The Following Items Have Been Stored In The Virtual Rack For More Than{" "}
                  <strong>3 Days</strong>. Please Move Them To Their Correct Locations As Soon As
                  Possible.
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <ActionBtn onClick={handleVirtualRackCopy} icon={FiCopy} label="Copy" />
                  <ActionBtn onClick={handleVirtualRackCSV} icon={FiDownload} label="CSV" />
                  <ActionBtn onClick={handleVirtualRackPrint} icon={FiPrinter} label="Print" />
                </div>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400 w-56"
                    value={virtualRackSearch}
                    onChange={(e) => { setVirtualRackSearch(e.target.value); setVirtualRackPage(1); }}
                    placeholder="Search items..."
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Warehouse Code", "Rack Name", "Bin", "Item Number", "Description", "UOM", "Available Qty", "GRN Number", "Store In Date"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {loadingVirtualRack ? (
                      <TableSpinner colSpan={9} />
                    ) : paginatedVirtualRackItems.length === 0 ? (
                      <TableEmpty colSpan={9} message="No data available in table" />
                    ) : (
                      paginatedVirtualRackItems.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{item.warehouseCode || ""}</td>
                          <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{item.rackName || ""}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{item.x || ""},{item.y || ""}</td>
                          <td className="px-4 py-3 text-sm font-medium text-indigo-600 whitespace-nowrap">{item.itemNumber || ""}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{item.description || ""}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{item.uom || ""}</td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.availableQty || "0.00"}</td>
                          <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{item.grnNumber || ""}</td>
                          <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                            {item.storeInDate ? new Date(item.storeInDate).toLocaleDateString() : ""}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                page={virtualRackPage}
                totalPages={virtualRackTotalPages}
                startIndex={virtualRackStartIndex}
                itemsPerPage={virtualRackItemsPerPage}
                total={filteredVirtualRackItems.length}
                onPageChange={setVirtualRackPage}
              />
            </div>
          </div>
        )}

        {/* ── Card: Reorder / Availability By Warehouse ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs mb-5 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <FiRefreshCw className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
              Reorder / Availability By Warehouse
            </h2>
          </div>

          <div className="p-5">
            {/* Controls */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <label className="text-sm font-medium text-slate-600 whitespace-nowrap">
                Warehouse (W_CODE):
              </label>
              <select
                value={selectedWarehouseCode}
                onChange={(e) => setSelectedWarehouseCode(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-700 min-w-[220px]"
              >
                <option value="">-- Select Warehouse --</option>
                {warehouseOptions.map((wh) => (
                  <option key={wh.code} value={wh.code}>
                    {wh.code}{wh.name ? ` - ${wh.name}` : ""}
                  </option>
                ))}
              </select>
              <button
                onClick={loadReorderData}
                disabled={loadingReorder || !selectedWarehouseCode}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiEye className="w-4 h-4" />
                {loadingReorder ? "Loading..." : "Preview"}
              </button>
            </div>

            {/* Table */}
            <div className="w-full">
              {loadingReorder ? (
                <TableSkeleton columns={5} rows={5} />
              ) : reorderData.length === 0 ? (
                <div className="bg-brand-surface border border-brand-border rounded-xl p-10 text-center shadow-sm">
                  <div className="flex flex-col items-center justify-center">
                    <FiAlertTriangle className="w-10 h-10 text-brand-text-muted mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-brand-text mb-1">No Data Available</h3>
                    <p className="text-sm text-brand-text-secondary">Please select a warehouse and click Preview.</p>
                  </div>
                </div>
              ) : (
                <Table
                  data={reorderData}
                  columns={reorderColumns}
                />
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManageWarehouse;
