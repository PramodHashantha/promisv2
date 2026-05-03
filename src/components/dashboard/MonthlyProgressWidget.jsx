import React from 'react'
import { useApi } from '@/hooks/useApi';
import { getMonthlyProgress } from '@/utils/api/api';
import CardLoader from '@/components/shared/CardLoader';
import CardHeader from '@/components/shared/CardHeader';
import useCardTitleActions from '@/hooks/useCardTitleActions';
import ReactApexChart from 'react-apexcharts';

import WidgetSkeleton from '@/components/skeletons/WidgetSkeleton';

const MonthlyProgressWidget = ({ chartHeight = 315 }) => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();
    const { data, loading, execute: refetch } = useApi(getMonthlyProgress);

    const handleComponentRefresh = () => {
        handleRefresh();
        refetch();
    };

    if (isRemoved) return null;

    const formatNumber = (num) => {
        return (num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatShortNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
        if (num >= 1000) return (num / 1000).toFixed(1) + "K";
        return (num || 0).toLocaleString();
    };

    if (loading && !data) {
        return <WidgetSkeleton type="progress" chartHeight={chartHeight} />;
    }

    if (!data) return null;

    const renderRadialChart = (percentage, color) => {
        const options = {
            chart: {
                type: 'radialBar',
                sparkline: { enabled: true },
                animations: { enabled: true, speed: 1000, easing: 'easeinout' }
            },
            plotOptions: {
                radialBar: {
                    hollow: { 
                        size: '65%',
                        margin: 0,
                    },
                    track: {
                        background: 'var(--brand-muted)',
                        strokeWidth: '100%',
                        opacity: 0.3
                    },
                    dataLabels: {
                        show: true,
                        name: { show: false },
                        value: {
                            show: true,
                            fontSize: '20px',
                            fontWeight: '700',
                            offsetY: 8,
                            color: 'var(--brand-text)',
                            formatter: (val) => val + "%"
                        }
                    }
                }
            },
            colors: [color],
            stroke: { lineCap: 'round' },
            states: {
                hover: { filter: { type: 'none' } },
                active: { filter: { type: 'none' } }
            }
        };
        return (
            <ReactApexChart
                options={options}
                series={[Math.round(percentage)]}
                type="radialBar"
                height={160}
                width={160}
            />
        );
    };

    const renderCategorySection = (title, count, percentage, color, limit, current, balance, isLast = false) => {
        const isGoods = title.includes('Goods');
        const badgeClass = isGoods ? 'badge-status-primary' : 'badge-status-warning';

        return (
            <div className={`flex flex-col flex-1 p-6 ${!isLast ? 'border-b lg:border-b-0 lg:border-r border-brand-border' : ''}`}>
                {/* Section Header */}
                <div className="flex justify-between items-center mb-6">
                    <span className={`${badgeClass} uppercase tracking-[0.08em] px-3 py-1`}>
                        {title}
                    </span>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-brand-surface-hover rounded-md border border-brand-border text-brand-text-secondary text-[11px] font-medium shadow-sm">
                        <span>{count} Approved</span>
                    </div>
                </div>

                {/* Content Island */}
                <div className="bg-brand-surface-elevated/40 rounded-2xl border border-brand-border p-5 mb-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-brand-primary/20 group">
                    <div className="flex items-center gap-4">
                        <div className="relative shrink-0 flex items-center justify-center">
                            {renderRadialChart(percentage, color)}
                            <div className="absolute top-[65%] w-full text-center text-[10px] font-bold uppercase tracking-widest text-brand-text-muted opacity-60">
                                Utilized
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">
                                Monthly Budget Limit
                            </div>
                            <div className="text-2xl font-extrabold text-brand-text tracking-tight group-hover:text-brand-primary transition-colors">
                                {formatNumber(limit)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sub Stats Grid - Neutralized Colors */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col p-4 rounded-xl border border-dashed border-brand-border bg-brand-surface-hover/30 hover:bg-brand-surface-hover transition-colors group/stat">
                        <div className="text-brand-text-muted text-[10px] font-extrabold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-text-muted" />
                            Utilization
                        </div>
                        <div className="text-lg font-bold text-brand-text group-hover/stat:translate-x-1 transition-transform">
                            {formatNumber(current)}
                        </div>
                    </div>
                    <div className="flex flex-col p-4 rounded-xl border border-dashed border-brand-border bg-brand-surface-hover/30 hover:bg-brand-surface-hover transition-colors group/stat">
                        <div className="text-brand-text-muted text-[10px] font-extrabold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-text-muted" />
                            Balance
                        </div>
                        <div className="text-lg font-bold text-brand-text group-hover/stat:translate-x-1 transition-transform">
                            {formatShortNumber(balance)}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="col-12">
            <div className={`card stretch stretch-full flex flex-col overflow-hidden transition-all duration-300 ${isExpanded ? "card-expand" : ""} ${(refreshKey || loading) ? "card-loading" : ""}`}>
                <CardHeader
                    title="Monthly Procurement Progress"
                    refresh={handleComponentRefresh}
                    remove={handleDelete}
                    expanded={handleExpand}
                />

                <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-brand-surface/50">
                    {renderCategorySection(
                        "Goods & Services",
                        data.prForGoodsAndServices,
                        data.usagePercentageGoodsAndServices,
                        'var(--brand-primary)',
                        data.monthlyQuotationForGoodsAndServices,
                        data.currentMonthlyTotalForGoodsAndServices,
                        data.remainingGoodsAndServices
                    )}
                    {renderCategorySection(
                        "Works",
                        data.prForWorks,
                        data.worksUsagePercentage,
                        'var(--brand-warning)',
                        data.monthlyQuotationForWorks,
                        data.currentMonthlyTotalForWorks,
                        data.remainingWorks,
                        true
                    )}
                </div>
                <CardLoader refreshKey={refreshKey} />
            </div>
        </div>
    )
}

export default MonthlyProgressWidget
