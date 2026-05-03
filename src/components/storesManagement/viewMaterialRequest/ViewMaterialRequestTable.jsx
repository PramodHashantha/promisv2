import React, { useState, useEffect } from 'react';
import { getMaterialRequestMyTRNandMRStatus, getMaterialRequestByMrNo } from "@/utils/api/api";
import ModalBoxViewMaterialRequest from './ModalBoxViewMaterialRequest';
import Table from "@/components/shared/table/Table";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import ModalBoxMaterialRequestAllSkeleton from "@/components/skeletons/MaterialRequestAll/ModalBoxMaterialRequestAllSkeleton";
import SearchableDropdown from "@/components/shared/SearchableDropdown";
import { useStatus } from "@/hooks/useStatus";
import { formatDate } from "@/utils/dateHelpers";
import CopyCell from "@/components/shared/CopyCell";

import Swal from "sweetalert2";

const getStatusBadgeClass = (statusVal) => {
    switch (statusVal) {
        case 1: return "secondary"; // Created
        case 4: return "danger"; // Reject
        case 5: return "success"; // Approved
        case 9: return "warning"; // Out_With_Not_Approval
        case 10: return "info"; // Out
        case 99: return "dark"; // Delete
        case 1114: return "danger"; // MaterialRejected
        case 1115: return "info"; // MaterialRequested (To Be Approved)
        case 1120: return "success"; // MaterialApproved
        default: return "primary";
    }
};


const ViewMaterialRequestTable = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState(null); // { header, items }
    const [isSkeletonOpen, setIsSkeletonOpen] = useState(false);

    const { getLabel: getStoreStatusLabel, statuses: storeStatuses } = useStatus("StoreStatus");
    console.log("storeStatuses", storeStatuses);
    const { getLabel: getMaterialRequestTypeLabel } = useStatus("MaterialRequestType");

    // Initialize with "Recent" (-2)
    const [selectedStatus, setSelectedStatus] = useState(-2);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refreshData = () => setRefreshTrigger(prev => prev + 1);

    // Build the dropdown options
    const statusOptions = [
        { id: -2, title: "Recent" },
        { id: -1, title: "All" },
        ...(storeStatuses || []).map(s => ({ id: s.value, title: s.label }))
    ];

    useEffect(() => {
        const load = async () => {
            if (selectedStatus === undefined || selectedStatus === null) return;

            setLoading(true);
            try {
                const data = await getMaterialRequestMyTRNandMRStatus(selectedStatus);
                if (!Array.isArray(data)) throw new Error("Invalid data from server.");

                const normalized = data.map((r) => ({
                    ...r,
                    mR_NO: r.MR_NO ?? r.mR_NO,
                    createD_DATE: r.CREATED_DATE ?? r.createD_DATE,
                    title: r.TITLE ?? r.title,
                    type: r.TYPE ?? r.type,
                    mR_STATUS: r.STATUS ?? r.status,
                }));

                // attach per-row view handler
                const withHandlers = normalized.map((r) => ({
                    ...r,
                    onView: async () => {
                        try {
                            setIsSkeletonOpen(true);
                            const mrNo = r.MR_NO ?? r.mR_NO;
                            const details = await getMaterialRequestByMrNo(mrNo); // { header, items }
                            console.log("Fetched details:", details);
                            setSelected(details);
                            setIsSkeletonOpen(false);
                            setIsModalOpen(true);
                        } catch (e) {
                            setIsSkeletonOpen(false);
                            Swal.fire({ icon: "error", title: "Error", text: e?.message || "Failed to load details" });
                        } finally {
                            setLoading(false);
                        }
                    },
                }));

                setRows(withHandlers);
            } catch (err) {
                Swal.fire({ icon: "error", title: "Error", text: `Failed to fetch material requests. ${err.message}` });
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [selectedStatus, refreshTrigger]);

    const columns = [
        {
            accessorKey: "view",
            header: () => "View",
            cell: ({ row }) => (
                <button onClick={() => row.original.onView()} className="brand-btn-outline brand-btn-sm">
                    <i className="bi bi-eye me-1"></i> View
                </button>
            ),
        },
        { 
            accessorKey: "mR_NO", 
            header: () => "Request NO",
            cell: ({ row }) => <CopyCell value={row.original.mR_NO} />
        },
        {
            id: "type",
            header: () => "Request Type",
            accessorFn: (row) => getMaterialRequestTypeLabel(row.type),
            sortingFn: (rowA, rowB) => rowA.original.type - rowB.original.type,
            cell: ({ row }) => getMaterialRequestTypeLabel(row.original.type)
        },
        {
            accessorKey: "createD_DATE",
            header: () => "Request Date",
            cell: ({ row }) => formatDate(row.original.createD_DATE),
        },
        { accessorKey: "title", header: () => "Request Person" },
        {
            id: "mR_STATUS",
            header: () => "Status",
            accessorFn: (row) => getStoreStatusLabel(row.mR_STATUS),
            sortingFn: (rowA, rowB) => rowA.original.mR_STATUS - rowB.original.mR_STATUS,
            cell: ({ cell, row }) => (
                <span className={`badge-status-${getStatusBadgeClass(row.original.mR_STATUS)}`}>
                    {cell.getValue()}
                </span>
            ),
        },
    ];


    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>View Material Request</h3>
                <div style={{ width: "300px" }}>
                    <SearchableDropdown
                        options={statusOptions}
                        value={selectedStatus}
                        onChange={(val) => setSelectedStatus(val)}
                        placeholder="Filter by Status"
                    />
                </div>
            </div>

            {loading ? (
                <TableSkeleton columns={columns.length} rows={10} />
            ) : (
                <Table columns={columns} data={rows} pagination highlightOnHover striped />
            )}
            <ModalBoxMaterialRequestAllSkeleton
                isOpen={isSkeletonOpen}
                onClose={() => setIsSkeletonOpen(false)}
            />
            <ModalBoxViewMaterialRequest
                isOpen={isModalOpen}
                materialRequest={selected} // { header, items }
                onClose={() => {
                    setIsModalOpen(false);
                    setSelected(null);
                }}
                onRefresh={refreshData}
                logoUrl="/assets/images/CEB.png"
            />
        </div>
    );
}

export default ViewMaterialRequestTable