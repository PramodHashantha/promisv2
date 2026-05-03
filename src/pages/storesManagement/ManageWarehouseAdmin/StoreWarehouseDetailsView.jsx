import React, { useState } from 'react';
import StoreWarehouseList from '@/components/ManageWarehouse/StoreWarehouseList';
import EditWarehouseModal from '@/components/ManageWarehouse/EditWarehouseModal';
import WarehouseSkeleton from '@/components/skeletons/WarehouseSkeleton';
import { GetStoreWarehouseDetails, CreateStoreWarehouse, DeleteStoreWarehouse } from '@/utils/api/api';
import { useApi } from '@/hooks/useApi';
import useNotification from '@/hooks/useNotification';
import useConfirmation from '@/hooks/useConfirmation';
import SectionHeader from '@/components/shared/SectionHeader';

const StoreWarehouseDetailsView = () => {
    const { data: rawData, loading, error: apiError, execute: reloadWarehouses } = useApi(GetStoreWarehouseDetails);

    const data = rawData;
    const warehouseData = Array.isArray(data) ? data : [];
    const error = apiError ? "Failed to load warehouse details." : null;

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const { notify } = useNotification();
    const { confirmAction } = useConfirmation();

    const handleAdd = () => {
        setSelectedWarehouseId(0);
        setIsEditModalOpen(true);
    };

    const handleEdit = (warehouse) => {
        setSelectedWarehouseId(warehouse.w_ID);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (updatedData) => {
        try {
            setIsSaving(true);
            // Include existing w_ID, ensure Type is "Main" or "Sub"
            const payload = {
                w_ID: updatedData.w_ID || selectedWarehouseId,
                w_CODE: updatedData.w_CODE,
                w_NAME: updatedData.w_NAME,
                w_DESCRIPTION: updatedData.w_DESCRIPTION,
                responsiblE_PERSON: updatedData.responsiblE_PERSON,
                w_TYPE: updatedData.w_TYPE,
                skno: updatedData.skno,
                status: 1
            };

            await CreateStoreWarehouse(payload);
            
            notify('success', 'Warehouse details have been updated.');

            setIsEditModalOpen(false);
            reloadWarehouses(); // Refresh the list
        } catch (err) {
            console.error("Error saving warehouse", err);
            notify('error', err.message || 'An error occurred while saving.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (warehouse) => {
        const confirmed = await confirmAction({
            title: 'Delete Warehouse',
            text: `Are you sure you want to delete ${warehouse.w_CODE} - ${warehouse.w_NAME}? This action cannot be undone.`,
            icon: 'warning',
            confirmButtonText: 'Yes, delete it!'
        });

        if (confirmed) {
            try {
                // Endpoint handles the user identity cleanly via the token context
                await DeleteStoreWarehouse(warehouse.w_ID); 
                
                notify('success', 'Warehouse deleted successfully.');
                reloadWarehouses(); // Refresh list after deleting
            } catch (err) {
                console.error("Error deleting warehouse", err);
                notify('error', err.message || 'Failed to delete warehouse.');
            }
        }
    };

    if (error) {
        return (
            <div className="p-6 m-6 text-error bg-error/10 rounded-xl border border-error/20 shadow-sm text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-brand-background h-full">
            <div className="p-4 sm:p-8">
                <SectionHeader 
                    title="Manage Warehouse"
                    subtitle={
                        <div className="flex items-center text-[10px] text-brand-text-secondary font-medium uppercase tracking-wider">
                            Showing all warehouses
                        </div>
                    }
                    rightContent={
                        <button 
                            onClick={handleAdd}
                            className="brand-btn-secondary group gap-2 h-11 px-6 shadow-md shadow-brand-primary/10 border border-brand-primary/20"
                        >
                            <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
                            </svg>
                            Add Warehouse
                        </button>
                    }
                />

                {loading ? (
                    <WarehouseSkeleton />
                ) : (
                    <StoreWarehouseList
                        data={warehouseData}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            {/* Edit / Add Modal */}
            {isEditModalOpen && selectedWarehouseId !== null && (
                <EditWarehouseModal 
                    wId={selectedWarehouseId} 
                    onClose={() => setIsEditModalOpen(false)} 
                    onSave={handleSaveEdit}
                    isSaving={isSaving} 
                />
            )}
        </div>
    );
};

export default StoreWarehouseDetailsView;
