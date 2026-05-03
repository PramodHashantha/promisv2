import React, { useState, useEffect } from 'react'
import ReactApexChart from 'react-apexcharts';
import { paymentRecordChartOption } from '@/utils/chartsLogic/paymentRecordChartOption';
import useCardTitleActions from '@/hooks/useCardTitleActions';
import CardHeader from '@/components/shared/CardHeader';
import CardLoader from '@/components/shared/CardLoader';
import { useApi } from '@/hooks/useApi';
import { getPaymentDetails } from '@/utils/api/api';

const PaymentRecordChart = () => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();
    const { data, loading, execute: refetch } = useApi(getPaymentDetails);
    const [chartSeries, setChartSeries] = useState([]);

    const handleComponentRefresh = () => {
        handleRefresh();
        refetch();
    };

    useEffect(() => {
        if (data && data.length > 0) {
            const counts = data.map(item => item.count);
            
            // Phase 1: Only Bars with staggered animation
            setChartSeries([
                {
                    name: "Total Count",
                    type: "bar",
                    data: counts
                }
            ]);

            // Phase 2: Add the line (curve) after bars finish animating
            const timer = setTimeout(() => {
                setChartSeries([
                    {
                        name: "Total Count",
                        type: "bar",
                        data: counts
                    },
                    {
                        name: "Trend",
                        type: "line",
                        data: counts
                    }
                ]);
            }, 800); // Wait for bar animation to settle

            return () => clearTimeout(timer);
        }
    }, [data, refreshKey]);

    if (isRemoved) {
        return null;
    }

    const categories = data?.map(item => item.grouP_NAME) || [];

    const baseOptions = paymentRecordChartOption();
    const chartOptions = {
        ...baseOptions,
        chart: {
            ...baseOptions.chart,
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 100 // Staggered bars (bottom to top one by one)
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            },
            toolbar: { show: false }
        },
        xaxis: {
            ...baseOptions.xaxis,
            categories: categories,
            labels: {
                ...baseOptions.xaxis.labels,
                rotate: 0,
                style: {
                    colors: 'var(--brand-text-muted)',
                    fontSize: '11px',
                    fontWeight: 500
                }
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        plotOptions: {
            ...baseOptions.plotOptions,
            bar: {
                ...baseOptions.plotOptions.bar,
                columnWidth: '25%',
                borderRadius: 2,
            }
        },
        stroke: {
            show: true,
            width: [0, 2],
            curve: 'smooth'
        },
        colors: ["var(--brand-primary)", "var(--brand-info)"],
        yaxis: {
            ...baseOptions.yaxis,
            labels: {
                ...baseOptions.yaxis.labels,
                style: {
                    colors: 'var(--brand-text-muted)',
                    fontSize: '11px'
                },
                formatter: function (val) {
                    return val >= 1000 ? (val / 1000).toFixed(0) + 'K' : val;
                }
            }
        },
        tooltip: {
            ...baseOptions.tooltip,
            shared: true,
            intersect: false,
            theme: 'light',
            y: {
                formatter: function (val) {
                    return val ? val.toLocaleString() : 0;
                }
            }
        },
        grid: {
            borderColor: 'var(--brand-border)',
            strokeDashArray: 4,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } }
        },
        legend: {
            show: false
        }
    };

    return (
        <div className="col-12">
            <div className={`card stretch stretch-full flex flex-col overflow-hidden transition-all duration-300 ${isExpanded ? "card-expand" : ""} ${(refreshKey || loading) ? "card-loading" : ""}`}>
                <CardHeader title={"Payment Record"} refresh={handleComponentRefresh} remove={handleDelete} expanded={handleExpand} />
                <div className="card-body custom-card-action p-0">
                    <ReactApexChart
                        options={chartOptions}
                        series={chartSeries}
                        height={350}
                    />
                </div>
                <div className="card-footer bg-brand-surface/30 border-t border-brand-border">
                    <div className="flex flex-wrap lg:flex-nowrap gap-4 justify-between">
                        {data?.map((item, idx) => (
                            <Card 
                                key={idx}
                                color={idx % 4 === 0 ? "var(--brand-primary)" : idx % 4 === 1 ? "var(--brand-success)" : idx % 4 === 2 ? "var(--brand-info)" : "var(--brand-accent)"} 
                                count={item.count.toLocaleString()} 
                                title={item.grouP_NAME} 
                            />
                        ))}
                    </div>
                </div>
                <CardLoader refreshKey={refreshKey} />
            </div>
        </div>
    )
}

export default PaymentRecordChart

const Card = ({ title, count, color }) => {
    return (
        <div className="flex-1 min-w-[140px] max-w-full group">
            <div className="p-4 bg-brand-surface rounded-xl border border-brand-border transition-all duration-300 hover:shadow-brand-md hover:border-brand-primary/20">
                <div className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-2">{title}</div>
                <h6 className="text-xl font-extrabold text-brand-text mb-3 tracking-tight group-hover:text-brand-primary transition-colors">{count}</h6>
                <div className="h-1 w-full bg-brand-muted rounded-full overflow-hidden">
                    <div 
                        className="h-full transition-all duration-1000 ease-out" 
                        style={{ 
                            width: '100%', 
                            backgroundColor: color,
                            opacity: 0.8
                        }} 
                    />
                </div>
            </div>
        </div>
    )
}
