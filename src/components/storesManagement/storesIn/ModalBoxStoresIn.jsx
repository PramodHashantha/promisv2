import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import "../../../../public/assets/scss/themes/components/_modal.scss";

const ModalBoxStoresIn = ({
    isOpen,
    storeRecord,
    onClose,
}) => {
    const modalRef = useRef(null);

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

    if (!isOpen || !storeRecord) return null;

    const { header, items } = storeRecord;

    // Calculate totals
    const totalQuantity = items?.reduce((sum, item) => sum + (item.invoicE_QTY || 0), 0) || 0;
    const totalValue = items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;

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
                            <div className="ceb-sub-title">STORE RECORD DETAILS</div>
                        </div>
                    </div>

                    <table className="ceb-table">
                        <tbody>
                            {/* GRN NUMBER AND TYPE ROW */}
                            <tr>
                                <td style={{ width: "50%" }}>
                                    <div className="field-group">
                                        <span className="field-label">GRN Number:</span>
                                        <span className="field-value">{header.grnNo || 'N/A'}</span>
                                    </div>
                                </td>
                                <td style={{ width: "50%" }}>
                                    <div className="field-group">
                                        <span className="field-label">Type:</span>
                                        <span className="field-value">{header.typeName || 'N/A'}</span>
                                    </div>
                                </td>
                            </tr>

                            {/* SUPPLIER AND PR NUMBER ROW */}
                            <tr>
                                <td>
                                    <div className="field-group">
                                        <span className="field-label">Supplier Name:</span>
                                        <span className="field-value">{header.supplierName || 'N/A'}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="field-group">
                                        <span className="field-label">PR Number:</span>
                                        <span className="field-value">{header.prNo || 'N/A'}</span>
                                    </div>
                                </td>
                            </tr>

                            {/* TITLE AND SK NUMBER ROW */}
                            <tr>
                                <td>
                                    <div className="field-group">
                                        <span className="field-label">Title:</span>
                                        <span className="field-value">{header.title || 'N/A'}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="field-group">
                                        <span className="field-label">SK Number:</span>
                                        <span className="field-value">{header.skno || 'N/A'}</span>
                                    </div>
                                </td>
                            </tr>

                            {/* ITEMS TABLE */}
                            {items && items.length > 0 && (
                                <>
                                    <tr>
                                        <td colSpan={2} className="p-0">
                                            <table className="ceb-items">
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: "10%" }}>Item Number</th>
                                                        <th style={{ width: "40%" }}>Description</th>
                                                        <th style={{ width: "16%", textAlign: "right" }}>Quantity</th>
                                                        <th style={{ width: "16%", textAlign: "right" }}>Unit Price</th>
                                                        <th style={{ width: "18%", textAlign: "right" }}>Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {items.map((item, i) => (
                                                        <tr key={i}>
                                                            <td>{item.iteM_NO || 'N/A'}</td>
                                                            <td>{item.description || 'N/A'}</td>
                                                            <td style={{ textAlign: "right" }}>{item.invoicE_QTY || '0'}</td>
                                                            <td style={{ textAlign: "right" }}>
                                                                {item.invoicE_UNIT_PRICE ? item.invoicE_UNIT_PRICE.toFixed(2) : '0.00'}
                                                            </td>
                                                            <td style={{ textAlign: "right" }}>
                                                                {item.total ? item.total.toFixed(2) : '0.00'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                {/* TOTALS ROW */}
                                                <tfoot>
                                                    <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                                                        <td colSpan="2" style={{ textAlign: "right" }}>Totals:</td>
                                                        <td style={{ textAlign: "right" }}>{totalQuantity}</td>
                                                        <td style={{ textAlign: "right" }}>-</td>
                                                        <td style={{ textAlign: "right" }}>{totalValue.toFixed(2)}</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginTop: '10px',
                                                fontSize: '14px',
                                                color: '#666'
                                            }}>
                                                <span>Total Items: {items.length}</span>
                                                <span>Total Value: {totalValue.toFixed(2)}</span>
                                            </div>
                                        </td>
                                    </tr>
                                </>
                            )}

                            {(!items || items.length === 0) && (
                                <tr>
                                    <td colSpan={2}>
                                        <div className="text-center text-gray-500 py-4">
                                            No items available for this GRN
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ACTION BUTTONS */}
                <div className='actions-bar'>
                    <div style={{ display: 'flex', gap: '12px' }}>
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
}

export default ModalBoxStoresIn;