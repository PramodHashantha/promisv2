import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import LoadingSpinner from "@/components/loading/LoadingSpinner";
import { quotationReceivedAPI } from "../../utils/api/quotationReceived";
import { useStatus } from "@/hooks/useStatus";
import Table from "../shared/table/Table";
import { FiEdit, FiCheckCircle, FiRotateCcw, FiSend } from "react-icons/fi";

const normalizeKey = (key) =>
  String(key).toLowerCase().replace(/_/g, '');

const getByLooseKey = (obj, ...keys) => {
  if (!obj) return undefined;
  const objKeys = Object.keys(obj);

  for (const key of keys) {
    const target = normalizeKey(key);
    const hit = objKeys.find((p) => normalizeKey(p) === target);
    if (hit !== undefined) return obj[hit];
  }
  return undefined;
};

const getNumberByLooseKey = (obj, ...keys) => {
  const v = getByLooseKey(obj, ...keys);
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

const TYPE_PURCHASE = {
  1: "Goods",
  2: "Services",
  3: "Works",
};

const getQuotationStatusBadgeClass = (status, quotationStatus) => {
  switch (status) {
    case quotationStatus.Request_for_Quotaio:
      return "badge-status-warning";
    case quotationStatus.Received_Quotation:
      return "badge-status-success";
    case quotationStatus.Forward_Quotation_Opening:
      return "badge-status-info";
    default:
      return "badge-status-secondary";
  }
};

const formatAmount = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return "N/A";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2 });
};

const QuotationReceivedDetails = () => {
    const [filter, setFilter] = useState(1); // 1: Today, 2: Show All
    const [quotationList, setQuotationList] = useState([]);
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [quotationDetails, setQuotationDetails] = useState(null);
    const [supplierIssueList, setSupplierIssueList] = useState([]);
    const [supplierReceivedList, setSupplierReceivedList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const {
        getLabel: getQuotationStatusLabel,
        getValue: getQuotationStatusValue,
        loading: isQuotationStatusLoading,
    } = useStatus("QuotaionStatus");

    const quotationStatus = useMemo(() => ({
        Request_for_Quotaio: getQuotationStatusValue("Request_for_Quotaio"),
        Received_Quotation: getQuotationStatusValue("Received_Quotation"),
        Forward_Quotation_Opening: getQuotationStatusValue("Forward_Quotation_Opening"),
        Quotation_Open: getQuotationStatusValue("Quotation_Open"),
    }), [getQuotationStatusValue]);

    // Legacy behavior parity (old WebForms):
    // invited = pending(issue) + received, received = received count.
    const totalReceivedCount = supplierReceivedList.length;
    const totalInvitedCount = supplierIssueList.length + supplierReceivedList.length;

    useEffect(() => {
        if (isQuotationStatusLoading || quotationStatus.Request_for_Quotaio == null) return;
        fetchQuotationList();
    }, [filter, isQuotationStatusLoading, quotationStatus.Request_for_Quotaio]);

    const fetchQuotationList = async () => {
        try {
            setLoading(true);
            const data = await quotationReceivedAPI.getList(
                filter,
                quotationStatus.Request_for_Quotaio
            );
            setQuotationList(data || []);
        } catch (err) {
            console.error(err);
            Swal.fire("Error", err.message || "Failed to fetch quotation list", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectQuotation = async (item) => {
        const qNum = getByLooseKey(item, "QT_NUM", "qT_NUM");
        setSelectedQuotation(item);
        try {
            setDetailsLoading(true);
            const [details, issueList, receivedList] = await Promise.all([
                quotationReceivedAPI.getDetails(qNum),
                quotationReceivedAPI.getSupplierIssueList(qNum),
                quotationReceivedAPI.getSupplierReceivedList(qNum)
            ]);
            console.log("Fetched Details:", details);
            setQuotationDetails(details);
            setSupplierIssueList(issueList || []);
            setSupplierReceivedList(receivedList || []);
            
            window.scrollTo({ top: 500, behavior: "smooth" });
        } catch (err) {
            console.error(err);
            Swal.fire("Error", err.message || "Failed to fetch details", "error");
        } finally {
            setDetailsLoading(false);
        }
    };

    const refreshDetailsAndLists = async (qNum) => {
        const [issueList, receivedList, details] = await Promise.all([
            quotationReceivedAPI.getSupplierIssueList(qNum),
            quotationReceivedAPI.getSupplierReceivedList(qNum),
            quotationReceivedAPI.getDetails(qNum),
        ]);

        setSupplierIssueList(issueList || []);
        setSupplierReceivedList(receivedList || []);
        setQuotationDetails(details);
    };

    const handleMarkReceived = async (supplierId) => {
        const qNum = getByLooseKey(selectedQuotation, "QT_NUM", "qT_NUM");
        if (!qNum || !supplierId) return;

        try {
            setDetailsLoading(true);
            await quotationReceivedAPI.updateSupplierReceived({
                quotaNo: qNum,
                supplierId,
            });

            await refreshDetailsAndLists(qNum);

            Swal.fire({
                icon: "success",
                title: "Updated",
                text: "Supplier marked as received.",
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: "top-end",
            });
        } catch (err) {
            console.error(err);
            Swal.fire("Error", err.message || "Failed to mark received.", "error");
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleUndoReceived = async (supplierId) => {
        const qNum = getByLooseKey(selectedQuotation, "QT_NUM", "qT_NUM");
        if (!qNum || !supplierId) return;

        try {
            setDetailsLoading(true);
            await quotationReceivedAPI.undoSupplierReceived({
                quotaNo: qNum,
                supplierId,
            });

            await refreshDetailsAndLists(qNum);

            Swal.fire({
                icon: "success",
                title: "Updated",
                text: "Undo successful.",
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: "top-end",
            });
        } catch (err) {
            console.error(err);
            Swal.fire("Error", err.message || "Failed to undo.", "error");
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleForwardToOpen = async () => {
        const qNum = getByLooseKey(selectedQuotation, "QT_NUM", "qT_NUM");
        if (!qNum) return;

        const result = await Swal.fire({
            title: 'Forward to Opening?',
            text: "This will forward the quotation for the opening process.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Forward',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#5b5cf6'
        });

        if (!result.isConfirmed) return;

        try {
            setDetailsLoading(true);
            await quotationReceivedAPI.forwardToOpen(qNum);
            
            Swal.fire("Success", "Successfully Forwarded", "success");
            
            setSelectedQuotation(null);
            setQuotationDetails(null);
            setSupplierIssueList([]);
            setSupplierReceivedList([]);
            fetchQuotationList();
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
            console.error(err);
            Swal.fire("Error", err.message || "Failed to forward quotation", "error");
        } finally {
            setDetailsLoading(false);
        }
    };

    const quotationColumns = useMemo(() => [
        {
            header: "Action",
            accessorKey: "action",
            cell: ({ row }) => (
                <button 
                    onClick={() => handleSelectQuotation(row.original)}
                    className="p-2 rounded-lg bg-brand-surface-hover text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                    title="View Details"
                >
                    <FiEdit size={16} />
                </button>
            )
        },
        {
            header: "Quotation No",
            accessorKey: "qT_NUM",
            cell: ({ row }) => getByLooseKey(row.original, "QT_NUM") ?? "N/A",
        },
        { 
            header: "Type", 
            accessorKey: "type_OF_PURCHASE",
            cell: ({ row }) => {
                const val = getNumberByLooseKey(row.original, "TYPE_OF_PURCHASE");
                const label = TYPE_PURCHASE[val] ?? "N/A";
                return (
                    <span className={`badge-status-${val === 1 ? "info" : "primary"}`}>
                        {label}
                    </span>
                );
            }
        },
        { 
            header: "Title",
            accessorKey: "title",
            cell: ({ row }) => getByLooseKey(row.original, "TITLE") ?? "N/A",
        },
        { 
            header: "Status", 
            accessorKey: "status",
            cell: ({ row }) => {
                const statusVal = getNumberByLooseKey(row.original, "STATUS");
                const badgeClass = getQuotationStatusBadgeClass(statusVal, quotationStatus);
                const label = statusVal !== null ? getQuotationStatusLabel(statusVal) : "N/A";
                return <span className={badgeClass}>{label}</span>;
            },
        },
        { 
            header: "Closing Date", 
            accessorKey: "qT_EXPIR_DATE",
            cell: ({ row }) => {
                const val = getByLooseKey(row.original, "QT_EXPIR_DATE");
                return val ? new Date(val).toLocaleDateString() : "N/A";
            }
        }
    ], [getQuotationStatusLabel, quotationStatus]);

    const issueColumns = useMemo(() => [
        { header: "Quotation", accessorKey: "qT_NUM", cell: ({ row }) => getByLooseKey(row.original, "QT_NUM") ?? "N/A" },
        { header: "Supplier ID", accessorKey: "supplieR_ID", cell: ({ row }) => getByLooseKey(row.original, "SUPPLIER_ID") ?? "N/A" },
        { header: "Supplier Name", accessorKey: "suP_NAME", cell: ({ row }) => getByLooseKey(row.original, "SUP_NAME") ?? "N/A" },
        {
            header: "Mark Received",
            accessorKey: "received",
            cell: ({ row }) => {
                const supplierId = getByLooseKey(row.original, "SUPPLIER_ID");
                return (
                    <button
                        onClick={() => handleMarkReceived(supplierId)}
                        disabled={!supplierId || detailsLoading}
                        className="p-2 rounded-lg bg-brand-surface-hover text-brand-success hover:bg-brand-success hover:text-white transition-all shadow-sm mx-auto flex items-center justify-center"
                    >
                        <FiCheckCircle size={18} />
                    </button>
                );
            },
        },
    ], [selectedQuotation, detailsLoading]);

    const receivedColumns = useMemo(() => [
        { header: "Quotation", accessorKey: "qT_NUM", cell: ({ row }) => getByLooseKey(row.original, "QT_NUM") ?? "N/A" },
        { header: "Supplier ID", accessorKey: "supplieR_ID", cell: ({ row }) => getByLooseKey(row.original, "SUPPLIER_ID") ?? "N/A" },
        { header: "Supplier Name", accessorKey: "suP_NAME", cell: ({ row }) => getByLooseKey(row.original, "SUP_NAME") ?? "N/A" },
        {
            header: "Undo",
            accessorKey: "undo",
            cell: ({ row }) => {
                const supplierId = getByLooseKey(row.original, "SUPPLIER_ID");
                const supplierStatus = getNumberByLooseKey(row.original, "STATUS");
                const disabled =
                    !supplierId ||
                    supplierStatus === null ||
                    quotationStatus.Quotation_Open == null ||
                    supplierStatus >= quotationStatus.Quotation_Open;

                return (
                    <button
                        onClick={() => handleUndoReceived(supplierId)}
                        disabled={disabled || detailsLoading}
                        title={disabled ? "Cannot undo (quotation opened)" : "Undo received"}
                        className={`p-2 rounded-lg bg-brand-surface-hover text-brand-error hover:bg-brand-error hover:text-white transition-all shadow-sm mx-auto flex items-center justify-center ${
                            disabled ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        <FiRotateCcw size={18} />
                    </button>
                );
            },
        },
    ], [selectedQuotation, detailsLoading, quotationStatus.Quotation_Open]);

    return (
        <div className="p-6 max-w-[1600px] mx-auto min-h-screen bg-brand-background">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h5 className=" font-bold text-brand-text mb-2 text-left">Quotation Received Details</h5>
                    <p className="text-brand-text-secondary text-xs text-left">Manage and track quotations received from suppliers</p>
                </div>
                
                <div className="flex bg-brand-surface p-1 rounded-xl border border-brand-border shadow-sm">
                    <button 
                        onClick={() => setFilter(1)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 1 ? 'bg-brand-primary text-white shadow-md' : 'text-brand-text-secondary hover:bg-brand-surface-hover'}`}
                    >
                        Today
                    </button>
                    <button 
                        onClick={() => setFilter(2)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 2 ? 'bg-brand-primary text-white shadow-md' : 'text-brand-text-secondary hover:bg-brand-surface-hover'}`}
                    >
                        Show All
                    </button>
                </div>
            </div>

            <div className="mb-10">
                {loading ? (
                    <div className="brand-card p-10 flex flex-col items-center justify-center ">
                        <LoadingSpinner size="large" />
                        <span className="mt-4 text-brand-text-secondary font-medium">Loading quotations...</span>
                    </div>
                ) : (
                    <Table data={quotationList} columns={quotationColumns}/>
                )}
            </div>

            {selectedQuotation && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="brand-card overflow-hidden text-left">
                        <div className="px-6 py-4 border-b border-brand-border bg-brand-surface-elevated">
                            <h6 className="text-lg font-bold text-brand-text">
                                Quotation Details:{" "}
                                <span className="text-brand-primary">
                                    {getByLooseKey(selectedQuotation, "QT_NUM") ?? "N/A"}
                                </span>
                            </h6>
                        </div>
                        <div className="p-6 text-left">
                            {detailsLoading ? (
                                <div className="flex justify-center py-8"><LoadingSpinner /></div>
                            ) : quotationDetails && (
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                    <DetailBox label="Quotation No" value={getByLooseKey(quotationDetails, "QT_NUM") ?? "N/A"} />
                                    <DetailBox
                                        label="Estimated Cost"
                                        value={formatAmount(getByLooseKey(quotationDetails, "ESTIMATED_COST"))}
                                    />
                                    <DetailBox label="Title" value={getByLooseKey(quotationDetails, "TITLE") ?? "N/A"} />
                                    <DetailBox
                                        label="Total Invited"
                                        value={totalInvitedCount}
                                        highlight
                                    />
                                    <DetailBox
                                        label="Total Received"
                                        value={totalReceivedCount}
                                        highlight
                                        success
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                        <div className="">
                            <div className="px-6 py-4 border-b border-brand-border bg-brand-surface-elevated flex justify-between items-center text-left">
                                <h5 className="font-bold text-brand-text">Supplier Issue List</h5>
                                <span className="badge-status-secondary">{supplierIssueList.length} Pending</span>
                            </div>
                            <div className="p-0" style={{ minHeight: "100" }}>
                                <Table data={supplierIssueList} columns={issueColumns} />
                            </div>
                        </div>

                        <div className="">
                            <div className="px-6 py-4 border-b border-brand-border bg-brand-surface-elevated flex justify-between items-center text-left">
                                <h5 className="font-bold text-brand-text">Supplier Received List</h5>
                                <span className="badge-status-success">{supplierReceivedList.length} Received</span>
                            </div>
                            <div className="p-0">
                                <Table data={supplierReceivedList} columns={receivedColumns} />
                            </div>
                            
                            {supplierReceivedList.length > 0 && (
                                <div className="p-6 border-t border-brand-border flex justify-end">
                                    <button 
                                        onClick={handleForwardToOpen}
                                        className="brand-btn-primary gap-2"
                                        disabled={detailsLoading}
                                    >
                                        <FiSend />
                                        Forward to Opening
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DetailBox = ({ label, value, highlight, success }) => (
    <div className={`p-4 rounded-xl border border-brand-border ${highlight ? 'bg-brand-muted/50' : 'bg-brand-surface'} transition-all hover:border-brand-primary/30 text-left`}>
        <p className="text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-sm  ${success ? 'text-brand-success' : 'text-brand-text'}`}>{value}</p>
    </div>
);

export default QuotationReceivedDetails;
