import React from "react";
import { createPortal } from "react-dom";
import "@/components/storesManagement/materialRequestAll/modalStyle.scss";

const ModalBoxMaterialRequestAllSkeleton = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay-new loading-skeleton" role="dialog" aria-modal="true">
            <div className="modal-content-new" role="dialog" aria-modal="true">
                <button type="button" className="modal-close" onClick={onClose}>
                    ✕
                </button>

                <div className="ceb-form">
                    {/* HEADER */}
                    <div className="ceb-header">
                        <div className="ceb-logo-section mr-skele-header"></div>
                        <div className="ceb-title-section">
                            <div className="mr-skele-header w-64 mb-2"></div>
                            <div className="mr-skele-line w-48"></div>
                        </div>
                    </div>

                    {/* TABLE PLACEHOLDERS */}
                    <div className="mt-6 space-y-4 skeleton-item">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="mr-skele-line w-full"></div>
                        ))}
                    </div>

                    {/* COMMENT AREA */}
                    <div className="comment-area"
                        style={{
                            marginTop: "24px",
                            padding: "16px",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                        }}
                    >
                        <div className="mr-skele-line w-32 mb-2"></div>
                        <div className="mr-skele-table w-full"></div>
                    </div>

                    {/* ACTION BUTTON PLACEHOLDERS */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "12px",
                            marginTop: "24px",
                        }}
                    >
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="mr-skele-line w-24"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ModalBoxMaterialRequestAllSkeleton;