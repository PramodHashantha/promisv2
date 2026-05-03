import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiEdit3, FiTrash2, FiPlus, FiArrowLeft } from "react-icons/fi";
import { useApi } from "@/hooks/useApi";
import useNotification from "@/hooks/useNotification";
import useConfirmation from "@/hooks/useConfirmation";
import {
  GetStoreWarehouseDetailsByLoggedInUser,
  GetAllStoreRacksByWID,
  UpsertStoreRack,
  DeleteStoreRack
} from "@/utils/api/api";
import Table from "@/components/shared/table/Table";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import SectionHeader from "@/components/shared/SectionHeader";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import Input from "@/components/shared/Input";

const WarehouseRackManagement = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const warehouseId = searchParams.get("W_ID");
  const notification = useNotification();
  const { confirmAction } = useConfirmation();

  // State for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRack, setEditingRack] = useState(null);
  const [formData, setFormData] = useState({
    r_CODE: "",
    x: "",
    y: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // API Hooks
  const { data: warehouses, loading: loadingWarehouses } = useApi(GetStoreWarehouseDetailsByLoggedInUser);
  const { data: racks, loading: loadingRacks, execute: refreshRacks } = useApi(
    GetAllStoreRacksByWID,
    [parseInt(warehouseId)],
    !!warehouseId
  );

  // Derived State
  const warehouse = useMemo(() => {
    if (!warehouses || !warehouseId) return null;
    return warehouses.find(w => (w.w_ID || w.W_ID) === parseInt(warehouseId));
  }, [warehouses, warehouseId]);

  const transformedRacks = useMemo(() => {
    if (!racks) return [];
    return racks.map(rack => ({
      id: rack.r_ID || rack.R_ID || rack.id,
      code: rack.r_CODE || rack.R_CODE || rack.code,
      x: rack.x || rack.X || "0",
      y: rack.y || rack.Y || "0",
      dimensions: `${rack.x || rack.X || "0"} x ${rack.y || rack.Y || "0"}`,
      status: rack.status || rack.STATUS,
    }));
  }, [racks]);

  // Handlers
  const openModal = (rack = null) => {
    if (rack) {
      setEditingRack(rack);
      setFormData({
        r_CODE: rack.code,
        x: rack.x.toString(),
        y: rack.y.toString(),
      });
    } else {
      setEditingRack(null);
      setFormData({ r_CODE: "", x: "", y: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRack(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.r_CODE || !formData.x || !formData.y) {
      notification.warning("Please fill all required fields");
      return;
    }

    try {
      setIsSaving(true);
      const pfno = localStorage.getItem("pfno") || "1";
      const payload = {
        r_ID: editingRack ? editingRack.id : 0,
        r_CODE: formData.r_CODE.trim(),
        x: formData.x.trim(),
        y: formData.y.trim(),
        w_ID: parseInt(warehouseId),
        create_BY: pfno,
        status: 0,
      };

      await UpsertStoreRack(payload);
      notification.success(editingRack ? "Rack updated successfully" : "Rack created successfully");
      closeModal();
      refreshRacks(parseInt(warehouseId));
    } catch (err) {
      console.error("Save Error:", err);
      notification.error(err.message || "Failed to save rack");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (rack) => {
    const isConfirmed = await confirmAction({
      title: "Delete Rack?",
      text: `Are you sure you want to delete rack "${rack.code}"?`,
      confirmButtonText: "Yes, delete",
    });

    if (isConfirmed) {
      try {
        const pfno = localStorage.getItem("pfno") || "1";
        await DeleteStoreRack(rack.id, pfno);
        notification.success("Rack deleted successfully");
        refreshRacks(parseInt(warehouseId));
      } catch (err) {
        notification.error(err.message || "Failed to delete rack");
      }
    }
  };

  // Table Columns
  const columns = [
    {
      header: "Rack Code",
      accessorKey: "code",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-brand-text">{info.getValue()}</span>
        </div>
      ),
    },
    {
      header: "Dimensions (X x Y)",
      accessorKey: "dimensions",
      cell: (info) => (
        <span className="text-brand-text-secondary">{info.getValue()}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (info) => {
        const status = info.getValue();
        return (
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${status === 0 ? 'bg-success/10 text-success' : 'bg-brand-muted text-brand-text-muted'
            }`}>
            {status === 1 ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal(row.original)}
            className="p-2 rounded-lg hover:bg-brand-primary/10 text-brand-text-secondary hover:text-brand-primary transition-colors"
            title="Edit Rack"
          >
            <FiEdit3 size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.original)}
            className="p-2 rounded-lg hover:bg-error/10 text-brand-text-secondary hover:text-error transition-colors"
            title="Delete Rack"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (!warehouseId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-brand-text-muted">
        <FiInfo size={48} className="mb-4" />
        <p>No Warehouse selected. Please return to the management page.</p>
        <button
          onClick={() => navigate("/stockWareHouse")}
          className="mt-4 flex items-center gap-2 text-brand-primary hover:underline"
        >
          <FiArrowLeft /> Back to Warehouse List
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500">
      {/* <button
        onClick={() => navigate("/stockWareHouse")}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-text-secondary hover:text-brand-text transition-colors"
      >
        <FiArrowLeft /> Back
      </button> */}

      <SectionHeader
        title="Warehouse Rack Management"
        subtitle="View warehouse layout and manage storage racks"
        rightContent={
          <button
            onClick={() => openModal()}
            className="brand-btn-secondary flex items-center gap-2 h-10 px-4"
          >
            <FiPlus size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Create Rack</span>
          </button>
        }
      />

      {/* Warehouse Details - Minimal View */}
      <div className="flex flex-wrap items-center gap-y-4 gap-x-8 px-6 py-4 bg-brand-surface border border-brand-border rounded-2xl shadow-sm">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest">Warehouse Name</span>
          <span className="text-sm font-semibold text-brand-text">
            {loadingWarehouses ? <div className="h-4 w-32 bg-brand-muted animate-pulse rounded" /> : (warehouse?.w_NAME || warehouse?.W_NAME || "N/A")}
          </span>
        </div>
        <div className="hidden md:block w-px h-8 bg-brand-border" />
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest">Code</span>
          <span className="text-sm font-semibold text-brand-text">
            {loadingWarehouses ? <div className="h-4 w-16 bg-brand-muted animate-pulse rounded" /> : (warehouse?.w_CODE || warehouse?.W_CODE || "N/A")}
          </span>
        </div>
        <div className="hidden md:block w-px h-8 bg-brand-border" />
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest">Type</span>
          <div className="flex items-center">
            {loadingWarehouses ? (
              <div className="h-4 w-12 bg-brand-muted animate-pulse rounded" />
            ) : (
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                (warehouse?.w_TYPE || warehouse?.W_TYPE) === "Main" 
                  ? "bg-indigo-100 text-indigo-700" 
                  : "bg-amber-100 text-amber-700"
              }`}>
                {warehouse?.w_TYPE || warehouse?.W_TYPE || "Main"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Rack List Table */}

      <div className="p-0">
        {loadingRacks ? (
          <TableSkeleton columns={4} rows={5} />
        ) : (
          <Table data={transformedRacks} columns={columns} />
        )}
      </div>

      {/* Rack Modal */}
      {isModalOpen && (
        <div className="modal-overlay-new" role="dialog" aria-modal="true">
          <div className="brand-card max-w-md w-[95%] mx-auto my-[10vh] flex flex-col overflow-hidden outline-none animate-in fade-in zoom-in duration-200 shadow-brand-lg">
            {/* Header */}
            <div className="p-6 border-b border-brand-border bg-brand-surface">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-brand-text">
                    {editingRack ? "Edit Rack Details" : "Enter Rack Details"}
                  </h3>
                  <p className="text-sm text-brand-text-secondary mt-1 font-medium">
                    Configure your storage rack dimensions and code
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 -mr-2 text-brand-text-secondary hover:text-brand-text hover:bg-brand-muted rounded-full transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSave} className="flex flex-col">
              <div className="p-6 space-y-6">
                <div className="group/input">
                  <label className="block text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.15em] mb-2.5 ml-1 transition-colors group-focus-within/input:text-brand-primary">
                    Rack Code
                  </label>
                  <input
                    type="text"
                    name="r_CODE"
                    value={formData.r_CODE}
                    onChange={handleInputChange}
                    className="brand-input transition-all duration-300"
                    placeholder="e.g. RACK-01"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="group/input">
                    <label className="block text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.15em] mb-2.5 ml-1 transition-colors group-focus-within/input:text-brand-primary">
                      X Dimension
                    </label>
                    <input
                      type="number"
                      name="x"
                      value={formData.x}
                      onChange={handleInputChange}
                      className="brand-input transition-all duration-300"
                      placeholder="Items per row"
                      required
                    />
                  </div>
                  <div className="group/input">
                    <label className="block text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.15em] mb-2.5 ml-1 transition-colors group-focus-within/input:text-brand-primary">
                      Y Dimension
                    </label>
                    <input
                      type="number"
                      name="y"
                      value={formData.y}
                      onChange={handleInputChange}
                      className="brand-input transition-all duration-300"
                      placeholder="Number of rows"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-brand-muted/10 border-t border-brand-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="brand-btn-secondary h-11 px-6 text-xs font-bold uppercase tracking-widest min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="brand-btn-primary h-11 px-6 text-xs font-bold uppercase tracking-widest min-w-[140px] disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{editingRack ? "Updating..." : "Saving..."}</span>
                    </>
                  ) : (
                    editingRack ? "Update Rack" : "Save Rack"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



export default WarehouseRackManagement;
