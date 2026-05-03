import React, { useState, useCallback, useEffect, useRef } from 'react';
import ActivityStream from '../../components/timeline/ActivityStream';
import { useApi } from '../../hooks/useApi';
import { searchTimelineItems, getTimelineDetails, getOpenedSupplierDetails } from '../../utils/api/timeline';
import { FiSearch, FiClock, FiFileText, FiUsers } from 'react-icons/fi';
import SectionHeader from '../../components/shared/SectionHeader';
import { useStatus } from '../../hooks/useStatus';

const getVal = (obj, key) => {
    if (!obj) return undefined;
    const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
    return foundKey ? obj[foundKey] : undefined;
};

const TimelinePage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPr, setSelectedPr] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [openedSuppliers, setOpenedSuppliers] = useState([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(false);
    const searchRef = useRef(null);

    // API hook for fetching full PR details
    const { data: details, loading, error, execute: fetchDetails } = useApi(
        getTimelineDetails,
        [selectedPr],
        false // Do not run automatically
    );

    // Enum hooks for labels
    const { getLabel: getTypeLabel } = useStatus("TypePurchase");
    const { getLabel: getPrForLabel } = useStatus("PRFor");
    const { getLabel: getTenderLabel } = useStatus("TenderStatus");

    // Handle outside click to close suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch suggestions as user types
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchTerm.length < 2) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            try {
                const results = await searchTimelineItems(searchTerm);
                setSuggestions(results || []);
                setShowSuggestions(true);
            } catch (err) {
                console.error("Suggestion fetch failed", err);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleSelect = async (prNo) => {
        setSelectedPr(prNo);
        setSearchTerm(prNo);
        setShowSuggestions(false);
        fetchDetails(prNo);

        // Fetch supplier details
        setLoadingSuppliers(true);
        try {
            const results = await getOpenedSupplierDetails(prNo);
            setOpenedSuppliers(results || []);
        } catch (err) {
            console.error("Supplier details fetch failed", err);
            setOpenedSuppliers([]);
        } finally {
            setLoadingSuppliers(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-background p-6 lg:p-10">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Section */}
                <SectionHeader
                    title="Timeline Tracking"
                    subtitle="Monitor the lifecycle and real-time status of your purchase requests."
                    rightContent={
                        <div className="relative w-full md:w-[350px]" ref={searchRef}>
                            <div className="relative group">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted group-focus-within:text-brand-primary transition-colors" />
                                <input
                                    type="text"
                                    className="brand-input pl-11 h-11 shadow-brand-sm text-sm"
                                    placeholder="Search PR Number or Title..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                                />
                            </div>

                            {/* Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-brand-surface border border-brand-border-strong rounded-xl shadow-brand-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="max-h-[300px] overflow-y-auto py-2">
                                        {suggestions.map((item, idx) => (
                                            <button
                                                key={idx}
                                                className="w-full px-4 py-3 flex flex-col items-start hover:bg-brand-surface-hover transition-colors border-b border-brand-border last:border-0"
                                                onClick={() => handleSelect(getVal(item, 'PRNO'))}
                                            >
                                                <span className="text-sm font-bold text-brand-primary">{getVal(item, 'PRNO')}</span>
                                                <span className="text-xs text-brand-text-secondary truncate w-full text-left">{getVal(item, 'TITLE')}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    }
                />

                {/* State: Loading */}
                {loading && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8 animate-pulse">
                            <div className="h-[400px] bg-brand-surface border border-brand-border rounded-2xl"></div>
                        </div>
                        <div className="animate-pulse">
                            <div className="h-[600px] bg-brand-surface border border-brand-border rounded-2xl"></div>
                        </div>
                    </div>
                )}

                {/* State: Data Loaded */}
                {details && !loading && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Left Column: Information Cards */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="brand-card overflow-hidden">
                                {/* Minimal Card Header */}
                                <div className="px-6 py-4 border-b border-brand-border bg-brand-surface flex items-center gap-3">
                                    <FiFileText className="text-brand-text-muted text-lg" />
                                    <span className="text-sm font-bold text-brand-text uppercase tracking-wider">Request Details</span>
                                </div>

                                <div className="p-0">
                                    <div className="divide-y divide-brand-border">
                                        <MinimalRow
                                            label="PR Number"
                                            value={getVal(details, 'prno')}
                                            className="font-mono"
                                        />
                                        <MinimalRow
                                            label="Title"
                                            value={getVal(details, 'title')}
                                            className="text-brand-text-secondary"
                                        />
                                        <MinimalRow
                                            label="System ID"
                                            value={getVal(details, 'syS_ID')}
                                        />
                                        <MinimalRow
                                            label="Type"
                                            value={<TypeBadge type={getTypeLabel(getVal(details, 'typE_OF_PURCHASE'))} />}
                                        />
                                        <MinimalRow
                                            label="PR Type"
                                            value={<TypeBadge type={getPrForLabel(getVal(details, 'pR_FOR'))} />}
                                        />
                                        <MinimalRow
                                            label="Estimated Cost"
                                            value={<span className="font-black text-brand-text">{getVal(details, 'ESTIMATED_COST')}</span>}
                                        />
                                        <MinimalRow
                                            label="Requested By"
                                            value={
                                                getVal(details, 'C_FULLNAME')

                                                    ? `(${getVal(details, 'C') || 'N/A'}) ${getVal(details, 'C_FULLNAME') || 'Unknown'} - ${getVal(details, 'C_APP') || 'Position Unknown'}`
                                                    : null
                                            }
                                        />
                                        <MinimalRow
                                            label="Recommended By"
                                            value={
                                                getVal(details, 'R_FULLNAME')
                                                    ? `(${getVal(details, 'R')}) ${getVal(details, 'R_FULLNAME')} - ${getVal(details, 'R_APP')}`
                                                    : null
                                            }
                                        />
                                        <MinimalRow
                                            label="Approved By"
                                            value={
                                                getVal(details, 'A_FULLNAME')
                                                    ? `(${getVal(details, 'A')}) ${getVal(details, 'A_FULLNAME')} - ${getVal(details, 'A_APP')}`
                                                    : null
                                            }
                                        />
                                        <MinimalRow
                                            label={getVal(details, 'prno')?.charAt(3) === 'Q' ? "Evaluated By" : "Convener"}
                                            value={
                                                getVal(details, 'E_FULLNAME')
                                                    ? `(${getVal(details, 'RR')}) ${getVal(details, 'E_FULLNAME')} - ${getVal(details, 'E_APP')}`
                                                    : null
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Supplier Details Card - Conditional Rendering */}
                            {openedSuppliers.length > 0 && (
                                <div className="brand-card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="px-6 py-4 border-b border-brand-border bg-brand-surface flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FiUsers className="text-brand-text-muted text-lg" />
                                            <span className="text-sm font-bold text-brand-text uppercase tracking-wider">Opened Supplier Details</span>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-brand-background/50 border-b border-brand-border">
                                                <tr>
                                                    <th className="px-6 py-3 text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Supplier Name</th>
                                                    <th className="px-6 py-3 text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Award No</th>
                                                    <th className="px-6 py-3 text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Award Date</th>
                                                    <th className="px-6 py-3 text-[10px] font-bold text-brand-text-muted uppercase tracking-wider text-center">Status</th>
                                                    <th className="px-6 py-3 text-[10px] font-bold text-brand-text-muted uppercase tracking-wider text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-brand-border bg-brand-surface">
                                                {openedSuppliers.map((sup, idx) => (
                                                    <tr key={idx} className="hover:bg-brand-background/30 transition-colors group">
                                                        <td className="px-6 py-4 text-sm font-bold text-brand-text">{getVal(sup, 'SUP_NAME')}</td>
                                                        <td className="px-6 py-4 text-sm text-brand-text-secondary font-mono whitespace-nowrap">{getVal(sup, 'PO_NUMBER')}</td>
                                                        <td className="px-6 py-4 text-sm text-brand-text-secondary whitespace-nowrap">
                                                            {getVal(sup, 'PO_DATE') ? new Date(getVal(sup, 'PO_DATE')).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <TypeBadge type={getTenderLabel(getVal(sup, 'STATUS'))} />
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button className="text-[10px] font-bold uppercase tracking-widest text-brand-primary border border-brand-primary/30 px-3 py-1.5 rounded-md hover:bg-brand-primary hover:text-white transition-all shadow-brand-sm">
                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Activity Stream */}
                        <div className="brand-card p-6 h-full relative">
                            <div className="text-sm font-bold text-brand-text flex items-center gap-2 mb-8 uppercase tracking-wider">
                                <FiClock className="text-brand-primary" />
                                Activity History
                            </div>
                            <ActivityStream activity={getVal(details, 'ACTIVITY_HISTORY')} />
                        </div>
                    </div>
                )}

                {/* State: Empty */}
                {!details && !loading && !error && (
                    <div className="brand-card flex flex-col items-center justify-center p-20 text-center border-dashed border-2 bg-brand-surface/50">
                        <div className="w-20 h-20 rounded-full bg-brand-muted flex items-center justify-center mb-6 shadow-brand-inner">
                            <FiSearch className="w-8 h-8 text-brand-text-muted" />
                        </div>
                        <div className="text-2xl font-black text-brand-text">Enter tracking details</div>
                        <p className="text-brand-text-secondary mt-3 max-w-sm mx-auto text-lg">
                            Provide a Purchase Request or Purchase Order number to visualize the full activity history and current status.
                        </p>
                    </div>
                )}

                {/* State: Error */}
                {error && (
                    <div className="p-6 bg-error/5 border border-error/20 rounded-2xl flex items-center gap-4 text-error">
                        <div className="p-2 bg-error/10 rounded-full">
                            <FiInfo size={20} />
                        </div>
                        <div>
                            <p className="font-bold">Execution Error</p>
                            <p className="text-sm opacity-80">We encountered a problem fetching the tracking data for <span className="font-mono font-black">{selectedPr}</span>. Please verify the ID and try again.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/* Sub-components for clean architecture */

const MinimalRow = ({ label, value, className = "" }) => (
    <div className="flex flex-col md:flex-row md:items-start group px-6 py-3.5 gap-2 md:gap-0">
        <div className="w-full md:w-1/3 text-[11px] font-bold text-brand-text-muted uppercase tracking-[0.1em] pt-1">
            {label}
        </div>
        <div className={`w-full md:w-2/3 text-brand-text font-medium text-sm leading-relaxed ${className}`}>
            {value || <span className="text-brand-text-muted/40 font-normal italic">No data provided</span>}
        </div>
    </div>
);

const TypeBadge = ({ type }) => {
    if (!type) return null;
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-primary/10 text-brand-primary text-[11px] font-bold uppercase tracking-wider border border-brand-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
            {type}
        </span>
    );
};

export default TimelinePage;