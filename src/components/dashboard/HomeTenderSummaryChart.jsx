import React from 'react'
import { Link } from 'react-router-dom'
import ReactApexChart from 'react-apexcharts'
import CardHeader from '@/components/shared/CardHeader'
import { useApi } from '@/hooks/useApi'
import { getHomeTenderSummary } from '@/utils/api/api'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import { leadsOverviewChartOptions } from '@/utils/chartsLogic/leadsOverviewChartOptions'
import CardLoader from '@/components/shared/CardLoader'
import WidgetSkeleton from '@/components/skeletons/WidgetSkeleton';

const HomeTenderSummaryChart = ({ chartHeight, isFooterShow }) => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();
    const { data, loading, execute: refetch } = useApi(getHomeTenderSummary);

    const handleComponentRefresh = () => {
        handleRefresh();
        refetch();
    };

    const expandedItemsState = React.useState({});
    const expandedItems = expandedItemsState[0];
    const setExpandedItems = expandedItemsState[1];
    
    const showAllStatusesState = React.useState(false);
    const showAllStatuses = showAllStatusesState[0];
    const setShowAllStatuses = showAllStatusesState[1];

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

    if (isRemoved) {
        return null;
    }

    if (loading && !data) {
        return <div className="col-xxl-4"><WidgetSkeleton type="donut" chartHeight={chartHeight} /></div>;
    }

    const dynamicOptions = {
        ...leadsOverviewChartOptions,
        labels: chartLabels,
        tooltip: {
            ...leadsOverviewChartOptions.tooltip,
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                const item = sortedData[seriesIndex];
                return (
                    '<div class="p-3">' +
                    '<div class="fw-bold mb-1">' + item.label + ': ' + item.value + '</div>' +
                    '<div style="max-height: 200px; overflow-y: auto; font-size: 11px;">' + 
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
                <CardHeader title={"Tender Summary"} refresh={handleComponentRefresh} remove={handleDelete} expanded={handleExpand} />

                <div className="card-body custom-card-action">
                    {data && data.length > 0 ? (
                        <ReactApexChart
                            options={dynamicOptions}
                            series={chartSeries}
                            type='donut'
                            height={chartHeight}
                        />
                    ) : (
                        <div className="d-flex align-items-center justify-content-center" style={{ height: chartHeight }}>
                            <span className="text-muted">No tender data available</span>
                        </div>
                    )}
                    <div className="row g-2 pt-2">
                        {displayedData?.map((item, idx) => {
                            const isItemExpanded = expandedItems[idx];
                            return (
                                <div key={idx} className="col-12">
                                    <div className="p-2 rounded border border-dashed border-gray-5 bg-light-subtle">
                                        <div 
                                            className="hstack gap-2 justify-content-between cursor-pointer"
                                            onClick={() => toggleExpand(idx)}
                                        >
                                            <div className="hstack gap-2">
                                                <span className={`wd-7 ht-7 rounded-circle d-inline-block circle-${(idx % 6) + 1}`}></span>
                                                <span className="fw-bold fs-11">{item.label}</span>
                                            </div>
                                            <div className="hstack gap-2">
                                                <span className="fs-11 text-dark fw-bold">{item.value}</span>
                                                <i className={`feather-${isItemExpanded ? 'chevron-up' : 'chevron-down'} fs-12 text-muted`}></i>
                                            </div>
                                        </div>
                                        {isItemExpanded && item.details && (
                                            <div 
                                                className="mt-2 fs-10 text-muted ps-3 border-top pt-2"
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
                            <div className="col-12 text-center mt-2">
                                <button 
                                    className="btn btn-sm btn-light-brand w-100 fs-10 fw-bold py-1"
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

export default HomeTenderSummaryChart
