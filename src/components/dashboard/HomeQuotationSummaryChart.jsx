import React from 'react'
import { Link } from 'react-router-dom'
import ReactApexChart from 'react-apexcharts'
import CardHeader from '@/components/shared/CardHeader'
import { useApi } from '@/hooks/useApi'
import { getHomeQuotationSummary } from '@/utils/api/api'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import { leadsOverviewChartOptions } from '@/utils/chartsLogic/leadsOverviewChartOptions'
import CardLoader from '@/components/shared/CardLoader'
import WidgetSkeleton from '@/components/skeletons/WidgetSkeleton';

const HomeQuotationSummaryChart = ({ chartHeight, isFooterShow }) => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();
    const { data, loading, execute: refetch } = useApi(getHomeQuotationSummary);

    const handleComponentRefresh = () => {
        handleRefresh();
        refetch();
    };

    if (isRemoved) {
        return null;
    }

    const [expandedItems, setExpandedItems] = React.useState({});
    const [showAllStatuses, setShowAllStatuses] = React.useState(false);

    const toggleExpand = (idx) => {
        setExpandedItems(prev => ({
            ...prev,
            [idx]: !prev[idx]
        }));
    };

    // Sort data to show active ones first
    const sortedData = React.useMemo(() => {
        if (!data) return [];
        return [...data].sort((a, b) => (b.value || 0) - (a.value || 0));
    }, [data]);

    const chartSeries = sortedData?.map(item => Number(item.value || 0)) || [];
    const chartLabels = sortedData?.map(item => item.label || "") || [];

    if (loading && !data) {
        return <div className="col-xxl-4"><WidgetSkeleton type="donut" chartHeight={chartHeight} /></div>;
    }

    const dynamicOptions = {
        ...leadsOverviewChartOptions,
        labels: chartLabels,
        colors: [
            'var(--chart-1)',
            'var(--chart-2)',
            'var(--chart-3)',
            'var(--chart-4)',
            'var(--chart-5)'
        ],
        tooltip: {
            ...leadsOverviewChartOptions.tooltip,
            theme: document.documentElement.classList.contains('app-skin-dark') ? 'dark' : 'light',
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                const item = sortedData[seriesIndex];
                return (
                    '<div class="p-3 bg-brand-surface border border-brand-border rounded-lg shadow-xl">' +
                    '<div class="text-xs font-bold text-brand-text mb-1">' + item.label + ': ' + item.value + '</div>' +
                    '<div class="text-[10px] text-brand-text-secondary leading-relaxed" style="max-height: 200px; overflow-y: auto;">' + 
                    item.details + 
                    '</div>' +
                    '</div>'
                );
            }
        }
    };

    const displayedData = showAllStatuses ? sortedData : sortedData?.slice(0, 5);
    const hasMore = sortedData?.length > 5;

    return (
        <div className="col-xxl-4">
            <div className={`card stretch stretch-full leads-overview ${isExpanded ? "card-expand" : ""} ${(refreshKey || loading) ? "card-loading" : ""}`}>
                <CardHeader title={"Quotation Summary"} refresh={handleComponentRefresh} remove={handleDelete} expanded={handleExpand} />

                <div className="card-body custom-card-action">
                    {data && data.length > 0 ? (
                        <div className="relative group">
                            <ReactApexChart
                                options={dynamicOptions}
                                series={chartSeries}
                                type='donut'
                                height={chartHeight}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center border border-dashed border-brand-border rounded-xl" style={{ height: chartHeight }}>
                            <span className="text-sm text-brand-text-muted">No quotation data available</span>
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-2 pt-4">
                        {displayedData?.map((item, idx) => {
                            const isItemExpanded = expandedItems[idx];
                            const chartColorClass = `bg-chart-${(idx % 5) + 1}`;
                            return (
                                <div key={idx} className="w-full">
                                    <div className="p-3 rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-surface-hover transition-colors shadow-sm">
                                        <div 
                                            className="flex items-center justify-between cursor-pointer group"
                                            onClick={() => toggleExpand(idx)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm var(--chart-${(idx % 5) + 1})`} style={{ backgroundColor: `var(--chart-${(idx % 5) + 1})` }}></span>
                                                <span className="text-xs font-semibold text-brand-text truncate max-w-[150px]">{item.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-brand-primary">{item.value}</span>
                                                <i className={`feather-${isItemExpanded ? 'chevron-up' : 'chevron-down'} text-xs text-brand-text-muted group-hover:text-brand-text transition-colors`}></i>
                                            </div>
                                        </div>
                                        {isItemExpanded && item.details && (
                                            <div 
                                                className="mt-3 text-[10px] text-brand-text-secondary ps-4 border-t border-brand-border pt-3 leading-relaxed"
                                                style={{ maxHeight: '150px', overflowY: 'auto' }}
                                            >
                                                <div dangerouslySetInnerHTML={{ __html: item.details }} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                        {hasMore && (
                            <div className="mt-4">
                                <button 
                                    className="w-full py-2 px-4 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white rounded-lg text-xs font-bold transition-all border border-brand-primary/20 hover:border-brand-primary shadow-sm"
                                    onClick={() => setShowAllStatuses(!showAllStatuses)}
                                >
                                    {showAllStatuses ? 'Show Less' : `Show ${sortedData.length - 5} More Statuses`}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {isFooterShow && <div className="card-footer fs-11 fw-bold text-uppercase text-center">Summary of Subordinates</div>}
                <CardLoader refreshKey={refreshKey} />
            </div>
        </div>
    )
}

export default HomeQuotationSummaryChart
