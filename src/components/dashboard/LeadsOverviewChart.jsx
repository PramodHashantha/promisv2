import React from 'react'
import { Link } from 'react-router-dom'
import ReactApexChart from 'react-apexcharts'
import CardHeader from '@/components/shared/CardHeader'
import { useApi } from '@/hooks/useApi'
import { getOnMyDeskData } from '@/utils/api/api'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import { leadsOverviewChartOptions } from '@/utils/chartsLogic/leadsOverviewChartOptions'
import CardLoader from '@/components/shared/CardLoader'
import WidgetSkeleton from '@/components/skeletons/WidgetSkeleton';

const LeadsOverviewChart = ({ chartHeight, isFooterShow }) => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();
    const { data, loading, execute: refetch } = useApi(getOnMyDeskData);

    const handleComponentRefresh = () => {
        handleRefresh();
        refetch();
    };

    const chartSeries = data?.map(item => Number(item.count || 0)) || [];
    const chartLabels = data?.map(item => item.description || "") || [];

    if (isRemoved) {
        return null;
    }

    if (loading && !data) {
        return <div className="col-xxl-4"><WidgetSkeleton type="donut" chartHeight={chartHeight} /></div>;
    }

    const dynamicOptions = {
        ...leadsOverviewChartOptions,
        labels: chartLabels
    };

    return (
        <div className="col-xxl-4">
            <div className={`card stretch stretch-full leads-overview ${isExpanded ? "card-expand" : ""} ${(refreshKey || loading) ? "card-loading" : ""}`}>
                <CardHeader title={"On My Desk"} refresh={handleComponentRefresh} remove={handleDelete} expanded={handleExpand} />

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
                            <span className="text-muted">No data available</span>
                        </div>
                    )}
                    <div className="row g-2 pt-2">
                        {data?.map((item, idx) => {
                            return (
                                <div key={idx} className="col-12">
                                    <Link to="#" className="p-2 hstack gap-2 rounded border border-dashed border-gray-5 justify-content-between">
                                        <div className="hstack gap-2">
                                            <span className={`wd-7 ht-7 rounded-circle d-inline-block circle-${(idx % 6) + 1}`}></span>
                                            <span>{item.description}</span>
                                        </div>
                                        <span className="fs-10 text-muted ms-1 fw-bold">({item.count})</span>
                                    </Link>
                                </div>
                            )
                        })}
                    </div>
                </div>
                {isFooterShow && <Link to="#" className="card-footer fs-11 fw-bold text-uppercase text-center">Update: 50 Min Ago</Link>}
                <CardLoader refreshKey={refreshKey} />
            </div>
        </div>
    )
}

export default LeadsOverviewChart
