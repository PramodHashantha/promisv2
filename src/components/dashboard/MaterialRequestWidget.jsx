import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiEye, FiExternalLink } from 'react-icons/fi'
import { useApi } from '@/hooks/useApi'
import { getRecentMaterialRequests, getRecentIssuedItems } from '@/utils/api/api'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import CardLoader from '@/components/shared/CardLoader'
import CardHeader from '@/components/shared/CardHeader'

const MaterialRequestWidget = () => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();
    const [activeTab, setActiveTab] = useState('requested');

    const requestedApi = useApi(getRecentMaterialRequests, [], true);
    const issuedApi = useApi(getRecentIssuedItems, [], true);

    const handleComponentRefresh = () => {
        handleRefresh();
        requestedApi.execute();
        issuedApi.execute();
    };

    if (isRemoved) return null;

    const getStatusBadge = (status) => {
        switch (status) {
            case 1:
                return <span className="badge-status-primary">Created</span>;
            case 5:
                return <span className="badge-status-success">Approved</span>;
            case 9:
                return <span className="badge-status-info">Issued</span>;
            case 10:
                return <span className="badge-status-success">Fully Issued</span>;
            default:
                return <span className="badge-status-secondary">Unknown</span>;
        }
    };

    const currentData = activeTab === 'requested' ? requestedApi.data : issuedApi.data;
    const currentLoading = activeTab === 'requested' ? requestedApi.loading : issuedApi.loading;

    return (
        <div className="col-12">
            <div className={`card stretch stretch-full flex flex-col overflow-hidden transition-all duration-300 ${isExpanded ? "card-expand" : ""} ${(refreshKey || currentLoading) ? "relative" : ""}`}>
                <CardHeader
                    title="Recent Material Requests"
                    refresh={handleComponentRefresh}
                    remove={handleDelete}
                    expanded={handleExpand}
                />

                {/* Body with Tabs and Table */}
                <div className="flex-1 flex flex-col min-h-[400px]">
                    {/* Segmented Tabs moved to body */}
                    <div className="px-6 py-4 bg-brand-surface-elevated/10 border-b border-brand-border">
                        <div className="flex p-1 bg-brand-muted/50 rounded-lg border border-brand-border w-fit h-9">
                            <button
                                onClick={() => setActiveTab('requested')}
                                className={`px-4 py-1 text-[11px] font-bold rounded-md transition-all duration-200 uppercase tracking-wide ${activeTab === 'requested' ? 'bg-brand-surface text-brand-primary shadow-sm' : 'text-brand-text-muted hover:text-brand-text'}`}
                            >
                                Requests
                            </button>
                            <button
                                onClick={() => setActiveTab('issued')}
                                className={`px-4 py-1 text-[11px] font-bold rounded-md transition-all duration-200 uppercase tracking-wide ${activeTab === 'issued' ? 'bg-brand-surface text-brand-primary shadow-sm' : 'text-brand-text-muted hover:text-brand-text'}`}
                            >
                                Issued
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-brand-surface-elevated/30 border-b border-brand-border text-brand-text-muted">
                                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.1em]">MR / Ref No</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.1em]">Description</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.1em]">Requested By</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.1em]">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.1em]">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.1em] text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/50">
                                {currentData && currentData.length > 0 ? (
                                    currentData.map((req, index) => (
                                        <tr key={index} className="hover:bg-brand-surface-hover/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-brand-text text-sm group-hover:text-brand-primary transition-colors">{req.mR_NO}</span>
                                                    <span className="text-[11px] text-brand-text-muted font-medium">{req.reF_NO}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-[240px] truncate text-sm text-brand-text-secondary font-medium" title={req.description}>
                                                    {req.description || <span className="opacity-30 italic">No description</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="text-xs text-brand-text font-semibold truncate max-w-[120px]">
                                                        {req.title || "Unknown"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-brand-text-secondary">
                                                {req.createD_DATE ? new Date(req.createD_DATE).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(req.mR_STATUS)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link 
                                                    to={`/material-request/details/${encodeURIComponent(req.mR_NO)}`} 
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-muted/50 text-brand-text-muted hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                                                >
                                                    <FiEye size={14} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            {currentLoading ? (
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                                                    <span className="text-xs font-bold text-brand-text-muted uppercase tracking-widest">Loading Records...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center opacity-40">
                                                    <div className="w-12 h-12 rounded-full bg-brand-muted flex items-center justify-center mb-3 text-brand-text-muted">
                                                        <FiEye size={24} />
                                                    </div>
                                                    <span className="text-sm font-bold text-brand-text-muted uppercase tracking-widest">
                                                        No {activeTab === 'requested' ? 'Requests' : 'Issued Items'} Found
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-brand-surface-elevated/20 border-t border-brand-border flex items-center justify-between">
                    <p className="text-[11px] text-brand-text-muted font-bold uppercase tracking-wider">
                        Showing {currentData?.length || 0} recent activities
                    </p>
                    <Link to="/material-request/list" className="brand-btn-secondary py-1.5 px-4 text-xs flex items-center gap-2 group">
                        View All
                        <FiExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                </div>
                
                <CardLoader refreshKey={refreshKey} />
            </div>
        </div>
    )
}

export default MaterialRequestWidget
