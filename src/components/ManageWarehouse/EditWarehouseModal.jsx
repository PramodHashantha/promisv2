import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { GetStoreWarehouseByWID, GetAllUsers } from '@/utils/api/api';
import { useApi } from '@/hooks/useApi';
import SearchableDropdown from '@/components/shared/SearchableDropdown';

const EditWarehouseModal = ({ wId, onClose, onSave, isSaving }) => {
    const { data: rawData, loading, error } = useApi(GetStoreWarehouseByWID, [wId], !!wId);
    const { data: rawUsers, loading: usersLoading } = useApi(GetAllUsers);

    const usersList = rawUsers?.data || rawUsers || [];
    const modalRef = useRef(null);

    const [formData, setFormData] = useState({
        w_TYPE: "Main",
        w_NAME: "",
        w_CODE: "",
        w_DESCRIPTION: "",
        skno: "",
        responsiblE_PERSON: ""
    });

    useEffect(() => {
        if (rawData) {
            const d = rawData.data || rawData;
            if (d) {
                setFormData({
                    w_TYPE: d.w_TYPE || "Main",
                    w_NAME: d.w_NAME || "",
                    w_CODE: d.w_CODE || "",
                    w_DESCRIPTION: d.w_DESCRIPTION || "",
                    skno: d.skno || "",
                    responsiblE_PERSON: d.responsiblE_PERSON || ""
                });
            }
        }
    }, [rawData]);

    useEffect(() => {
        if (modalRef.current) {
            modalRef.current.focus();
        }
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    // Prepare users for SearchableDropdown
    const userOptions = Array.isArray(usersList) ? usersList.map(u => {
        const pfno = u.pfno || u.pF_NO || u.PFNO;
        const name = u.fullName || u.fullname || u.fulL_NAME || pfno;
        return {
            id: pfno,
            title: `${name} (${pfno})`,
            actualValue: pfno
        };
    }) : [];

    return createPortal(
        <div className="modal-overlay-new" role="dialog" aria-labelledby="modal-title" aria-modal="true">
            <div 
                ref={modalRef} 
                className="modal-content-new rounded-[12px] bg-brand-surface shadow-2xl flex flex-col overflow-hidden outline-none max-w-[560px] w-[95%] sm:my-[5vh] my-2 mx-auto p-0 border border-brand-border sm:min-h-[480px] h-fit sm:max-h-[90vh] max-h-[96vh]"
                tabIndex={-1}
            >
                {/* Header */}
                <div className="relative px-6 pt-4 pb-2 bg-brand-surface border-b border-brand-border shrink-0 rounded-t-[12px]">
                    <button
                        type="button"
                        className="absolute top-6 right-6 text-brand-text-secondary hover:text-brand-text transition-colors p-1"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                    <h2 className="text-xl font-bold text-brand-text">
                        {wId ? "Edit Warehouse Details" : "Add New Warehouse"}
                    </h2>
                    <p className="text-sm text-brand-text-secondary mt-1">
                        {wId ? (
                            <>Update information for <span className="text-brand-text font-medium">{formData.w_CODE || '...'}</span></>
                        ) : (
                            "Fill in the details below to create a new warehouse."
                        )}
                    </p>
                </div>

                {/* Form Body - Scrollable Container */}
                <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col overflow-hidden min-h-0">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {error && (
                            <div className="text-sm text-error mb-4 font-bold bg-error/10 p-4 rounded-xl border border-error/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 uppercase tracking-wide">
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                </svg>
                                <span>Failed to load warehouse data. Please try again.</span>
                            </div>
                        )}

                        {loading ? (
                            <div className="animate-pulse space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <div className="h-3 bg-brand-border-strong/20 rounded w-24 mb-3"></div>
                                        <div className="h-[46px] bg-brand-muted rounded-xl w-full"></div>
                                    </div>
                                    <div>
                                        <div className="h-3 bg-brand-border-strong/20 rounded w-16 mb-3"></div>
                                        <div className="h-[46px] bg-brand-muted rounded-xl w-full"></div>
                                    </div>
                                </div>
                                <div className="h-3 bg-brand-border-strong/20 rounded w-32 mb-3"></div>
                                <div className="h-[46px] bg-brand-muted rounded-xl w-full"></div>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="group/input">
                                        <label className="block text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.15em] mb-2.5 ml-1 transition-colors group-focus-within/input:text-brand-primary">Warehouse Code</label>
                                        <input
                                            type="text"
                                            name="w_CODE"
                                            value={formData.w_CODE}
                                            onChange={handleChange}
                                            pattern="^[A-Za-z][0-9\- \t]*[0-9].*"
                                            title="Code must start with a letter and contain at least one number (e.g., W1, M02, W-3)"
                                            className="brand-input min-h-[46px] transition-all duration-300"
                                            placeholder="e.g. W1-A"
                                            required
                                        />
                                    </div>
                                    <div className="group/input">
                                        <label className="block text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.15em] mb-2.5 ml-1 transition-colors group-focus-within/input:text-brand-primary">SK No</label>
                                        <input
                                            type="text"
                                            name="skno"
                                            value={formData.skno}
                                            onChange={handleChange}
                                            className="brand-input min-h-[46px] transition-all duration-300"
                                            placeholder="e.g. SK 01"
                                        />
                                    </div>
                                </div>

                                <div className="group/input">
                                    <label className="block text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.15em] mb-2.5 ml-1 transition-colors group-focus-within/input:text-brand-primary">Warehouse Name</label>
                                    <input
                                        type="text"
                                        name="w_NAME"
                                        value={formData.w_NAME}
                                        onChange={handleChange}
                                        className="brand-input min-h-[46px] transition-all duration-300"
                                        placeholder="Full Warehouse Name"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="group/input">
                                        <label className="block text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.15em] mb-2.5 ml-1 transition-colors group-focus-within/input:text-brand-primary">Type</label>
                                        <div className="relative">
                                            <select
                                                name="w_TYPE"
                                                value={formData.w_TYPE}
                                                onChange={handleChange}
                                                className="brand-input min-h-[46px] appearance-none pr-10 cursor-pointer overflow-hidden transition-all duration-300"
                                            >
                                                <option value="Main">Main Warehouse</option>
                                                <option value="Sub">Sub Warehouse</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-3.5 pointer-events-none text-brand-text-secondary transition-colors group-focus-within/input:text-brand-primary">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="group/input">
                                        <label className="block text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.15em] mb-2.5 ml-1 transition-colors group-focus-within/input:text-brand-primary">In Charge / Assigner</label>
                                        {usersLoading ? (
                                            <div className="brand-input min-h-[46px] flex items-center text-brand-text-muted animate-pulse">
                                                <span className="brand-status-indicator mr-2"></span>
                                                Syncing users...
                                            </div>
                                        ) : (
                                            <div className="assigner-dropdown-wrapper [&_.dropdown-trigger]:min-h-[46px] [&_.dropdown-trigger]:h-[46px] [&_.dropdown-trigger]:bg-brand-surface [&_.dropdown-trigger]:border [&_.dropdown-trigger]:border-brand-border [&_.dropdown-trigger]:rounded-lg [&_.dropdown-trigger]:px-3 [&_.dropdown-trigger]:py-2 [&_.dropdown-trigger]:text-sm [&_.dropdown-trigger]:text-brand-text [&_.dropdown-trigger]:w-full [&_.dropdown-trigger]:shadow-none [&_.dropdown-trigger]:border-brand-primary [&_.dropdown-wrapper.open_.dropdown-trigger]:border-brand-primary [&_.dropdown-menu]:rounded-xl [&_.dropdown-menu]:border [&_.dropdown-menu]:border-brand-border [&_.dropdown-menu]:shadow-2xl [&_.dropdown-menu]:overflow-hidden [&_.search-input]:px-3 [&_.search-input]:py-2.5 [&_.search-input]:text-sm [&_.search-input]:border-brand-border [&_.option-item]:text-sm [&_.option-item]:px-3 [&_.option-item]:py-2.5 [&_.option-item]:text-brand-text [&_.option-title]:font-bold [&_.option-item.selected]:bg-brand-primary/10 [&_.option-item.selected_.option-title]:text-brand-primary [&_.option-item.focused]:bg-brand-background">
                                                <SearchableDropdown
                                                    options={userOptions}
                                                    value={formData.responsiblE_PERSON}
                                                    onChange={(val) => setFormData(prev => ({ ...prev, responsiblE_PERSON: val }))}
                                                    placeholder="Choose an official..."
                                                    id="assignerDropdown"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="group/input">
                                    <label className="block text-[10px] font-bold text-brand-text-secondary uppercase tracking-[0.15em] mb-2.5 ml-1 transition-colors group-focus-within/input:text-brand-primary">Description</label>
                                    <textarea
                                        name="w_DESCRIPTION"
                                        rows="3"
                                        value={formData.w_DESCRIPTION}
                                        onChange={handleChange}
                                        className="brand-input min-h-[100px] py-3 transition-all duration-300 resize-none"
                                        placeholder="Brief details about the warehouse layout or stored goods..."
                                    ></textarea>
                                </div>
                            </>
                        )}
                    </div>
                    {/* Footer Actions */}
                    <div className="px-6 py-4 bg-brand-background/50 border-t border-brand-border flex items-center justify-end shrink-0 gap-4 rounded-b-[12px]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="brand-btn-secondary h-11 px-6 text-xs font-bold uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || usersLoading || isSaving}
                            className="brand-btn-secondary h-11 px-6 text-xs font-bold uppercase tracking-widest min-w-[140px]"
                        >
                            {isSaving ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Syncing...</span>
                                </div>
                            ) : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
            {/* Some minimal styling to correct SearchableDropdown's overly nested visuals if need be */}
        </div>,
        document.body
    );
};

export default EditWarehouseModal;
