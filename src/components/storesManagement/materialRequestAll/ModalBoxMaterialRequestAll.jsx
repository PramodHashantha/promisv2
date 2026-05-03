import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import "../../../../public/assets/scss/themes/components/_modal.scss";
import "./modalStyle.scss";
import { useStatus } from "@/hooks/useStatus";

const ModalBoxMaterialRequestAll = ({
    isOpen,
    materialRequest,
    onClose,
    onApprove,
    onReject,
    onDelete,
    onSaveComment,
    costCenterTitle,
    //logoUrl = "/images/logo/CEB.png",
}) => {
    const modalRef = useRef(null);
    const [comment, setComment] = useState("");
    const { getLabel: getCostCenterTitle } = useStatus("CostCenterTitle");
    const { statuses: storeStatuses, getValue: getStoreStatusValue } = useStatus("StoreStatus");

    const storeStatusEnum = React.useMemo(() => {
        return {
            Created: getStoreStatusValue("Created") ?? 1,
            MaterialApproved: getStoreStatusValue("MaterialApproved") ?? 1120,
            MaterialRejected: getStoreStatusValue("MaterialRejected") ?? 1114,
            Delete: getStoreStatusValue("Delete") ?? 99
        };
    }, [getStoreStatusValue]);

    useEffect(() => {
        if (materialRequest?.header?.COMMENT)
            setComment(materialRequest.header.COMMENT);
        else setComment("");
    }, [materialRequest]);

    useEffect(() => {
        if (isOpen && modalRef.current) modalRef.current.focus();
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (e) => e.key === "Escape" && onClose();
        if (isOpen) {
            window.addEventListener("keydown", handleEsc);
            return () => window.removeEventListener("keydown", handleEsc);
        }
    }, [isOpen, onClose]);

    if (!isOpen || !materialRequest) return null;

    const { header, items } = materialRequest;
    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");
    
    //cost center is in REF_ENUM so after create ref enum need to call here
    const ccText = () => {
        if (header?.cosT_CENTER == null || header?.cosT_CENTER === "") return "-";
        const valStr = String(header.cosT_CENTER);
        return getCostCenterTitle(valStr) || valStr;
    };

    const storeKeeperNo = header?.skno ?? header?.sK_NO ?? "-";
    const placeOfWork = header?.placofwork ?? "-";
    const jobNo = header?.reF_NO ?? "-";
    const requiredBy = header?.requiredname ?? header?.TITLE ?? "-";
    const accountExpense = header?.a_AND_E_CODE_DEC ?? "-";
    const authorizedBy = header?.auth ?? "-";

    const confirmDelete = async () => {
        if (!onDelete) return;
        const res = await Swal.fire({
            title: "Delete this request?",
            text: `MR No: ${header.MR_NO}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete",
        });
        if (res.isConfirmed) {
            await onDelete(header.MR_NO);
            onClose();
        }
    };

    const act = async (kind) => {
        try {
            if (kind === "approve" && onApprove) {
                await onApprove(header.mR_NO, comment || undefined);
                Swal.fire("Success", "Material Request approved.", "success");
            }
            if (kind === "reject" && onReject) {
                await onReject(header.mR_NO, comment || undefined);
                Swal.fire("Success", "Material Request rejected.", "success");
            }
            onClose();
        } catch (e) {
            Swal.fire("Error", e?.message || `Failed to ${kind} request`, "error");
        }
    };

    const saveComment = async () => {
        if (!onSaveComment) return;
        try {
            await onSaveComment(header.mR_NO, comment);
            Swal.fire("Saved", "Comment updated.", "success");
        } catch (e) {
            Swal.fire("Error", e?.message || "Failed to save comment", "error");
        }
    };

    return createPortal(
        <div className="modal-overlay-new" role="dialog" aria-modal="true">
            <div ref={modalRef} className="modal-content-new max-w-5xl" tabIndex={-1}>
                <button type="button" className="modal-close" onClick={onClose}>
                    ✕
                </button>

                <div className="ceb-form">
                    {/* HEADER WITH LOGO AND TITLE */}
                    <div className="ceb-header">
                        <div className="ceb-logo-section">
                            <img src="/images/logo/CEB-NOBG.png" alt="CEB Logo" className="ceb-logo" />
                        </div>
                        <div className="ceb-title-section">
                            <div className="ceb-main-title">CEYLON ELECTRICITY BOARD</div>
                            <div className="ceb-sub-title">REQUISITION FOR MATERIAL</div>
                        </div>
                    </div>

                    <table className="ceb-table">
                        <tbody>
                            {/* MR NUMBER AND DATE ROW */}
                            <tr>
                                <td style={{ width: "50%" }}>
                                    <div className="field-group">
                                        <span className="field-label">MR No:</span>
                                        <span className="field-value">{header.mR_NO}</span>
                                    </div>
                                </td>
                                <td style={{ width: "50%" }}>
                                    <div className="field-group">
                                        <span className="field-label">Date of Requisition:</span>
                                        <span className="field-value">{fmtDate(header.createD_DATE)}</span>
                                    </div>
                                </td>
                            </tr>

                            {/* STORE KEEPER AND JOB NUMBER ROW */}
                            <tr>
                                <td>
                                    <div className="field-group">
                                        <span className="field-label">Store Keeper's No:</span>
                                        <span className="field-value">{storeKeeperNo}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="field-group">
                                        <span className="field-label">Job No:</span>
                                        <span className="field-value">{jobNo}</span>
                                    </div>
                                </td>
                            </tr>

                            {/* PLACE OF WORK AND COST CENTER ROW */}
                            <tr>
                                <td>
                                    <div className="field-group">
                                        <span className="field-label">Place of Work:</span>
                                        <span className="field-value">{placeOfWork}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="field-group">
                                        <span className="field-label">Cost Center:</span>
                                        <span className="field-value">{ccText()}</span>
                                    </div>
                                </td>
                            </tr>

                            {/* REQUIRED BY - FULL WIDTH */}
                            <tr>
                                <td colSpan={2}>
                                    <div className="field-group">
                                        <span className="field-label">Required By:</span>
                                        <span className="field-value">{requiredBy}</span>
                                    </div>
                                </td>
                            </tr>

                            {/* ACCOUNT/EXPENSE CODE - FULL WIDTH */}
                            <tr>
                                <td colSpan={2}>
                                    <div className="field-group">
                                        <span className="field-label">Account / Expense Code:</span>
                                        <span className="field-value">{accountExpense}</span>
                                    </div>
                                </td>
                            </tr>

                            {/* ITEMS TABLE */}
                            <tr>
                                <td colSpan={2} className="p-0">
                                    <table className="ceb-items">
                                        <thead>
                                            <tr>
                                                <th style={{ width: "20%" }}>PL No.</th>
                                                <th style={{ width: "60%" }}>Description of Stores</th>
                                                <th style={{ width: "20%", textAlign: "right" }}>
                                                    Quantity Required
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(items ?? []).length ? (
                                                items.map((it, i) => (
                                                    <tr key={i}>
                                                        <td>{it.iteM_NUMBER}</td>
                                                        <td>{it.description}</td>
                                                        <td style={{ textAlign: "right" }}>{it.qty}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="text-center text-gray-500">
                                                        No items
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                            {/* AUTHORIZATION AND SIGNATURE ROW */}
                            <tr>
                                <td>
                                    <div className="field-group vertical">
                                        <span className="field-label">Authorized By:</span>
                                        <span className="field-value block mt-1">{authorizedBy}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="field-group vertical">
                                        <span className="field-label">Signature of Indenting Officer:</span>
                                        <span className="field-value block mt-1">{requiredBy}</span>
                                    </div>
                                </td>
                            </tr>

                            {/* STORE KEEPER ACKNOWLEDGMENT - LEFT ALIGNED */}
                            <tr>
                                <td colSpan={2}>
                                    <div className="acknowledgment-section">
                                        <div className="acknowledgment-title">
                                            Issued and the Issue Duly Entered in My Stock Ledgers
                                        </div>
                                        <div className="signature-area">
                                            <div className="signature-line">
                                                <span className="signature-label">Date:</span>
                                                <span className="signature-space"></span>
                                            </div>
                                            <div className="signature-line">
                                                <span className="signature-label">Store Keeper:</span>
                                                <span className="signature-space"></span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>

                            {/* RECEIVING OFFICER ACKNOWLEDGMENT - LEFT ALIGNED */}
                            <tr>
                                <td colSpan={2}>
                                    <div className="acknowledgment-section">
                                        <div className="acknowledgment-title">
                                            The Above Materials Have Been Duly Received by Me
                                        </div>
                                        <div className="signature-area">
                                            <div className="signature-line">
                                                <span className="signature-label">Date:</span>
                                                <span className="signature-space"></span>
                                            </div>
                                            <div className="signature-line">
                                                <span className="signature-label">Signature of Receiving Officer:</span>
                                                <span className="signature-space"></span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* COMMENT SECTION */}
                {/* <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: '#f9fafb'
                }}>
                    <label style={{
                        display: 'block',
                        fontWeight: 'bold',
                        color: '#374151',
                        marginBottom: '12px',
                        fontSize: '14px'
                    }}>
                        Comment:
                    </label>
                    <textarea
                        style={{
                            width: '100%',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            padding: '12px 16px',
                            backgroundColor: 'white',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            fontSize: '14px',
                            lineHeight: '1.5'
                        }}
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment (optional)"
                        onFocus={(e) => {
                            e.target.style.outline = 'none';
                            e.target.style.borderColor = '#3b82f6';
                            e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div> */}

                {/* ACTIONS */}
                <div className='actions-bar'>
                    {/* <div className="danger-actions">
                        {onDelete && (
                            <button
                                type="button"
                                onClick={confirmDelete}
                                style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    backgroundColor: '#dc2626',
                                    color: 'white',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
                            >
                                Delete
                            </button>
                        )}
                    </div> */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {/* {onReject && (
                            <button
                                type="button"
                                onClick={() => act("reject")}
                                style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
                            >
                                Reject
                            </button>
                        )} */}
                        {/* {onApprove && (
                            <button
                                type="button"
                                onClick={() => act("approve")}
                                style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                            >
                                Approve
                            </button>
                        )} */}
                        {/* {onSaveComment && (
                            <button
                                type="button"
                                onClick={saveComment}
                                style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                            >
                                Save Comment
                            </button>
                        )} */}
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '14px',
                                backgroundColor: '#6b7280',
                                color: 'white',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ModalBoxMaterialRequestAll;