import React from 'react';

const shimmerAnimation = `
  @keyframes skeleton-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

const skeletonBaseStyle = {
    background: 'linear-gradient(90deg, #f3f4f6 25%, #ffffff 50%, #f3f4f6 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-shimmer 2s infinite linear',
    borderRadius: '4px'
};

const WidgetSkeleton = ({ type = 'donut', chartHeight = 315 }) => {
    const renderHeaderSkeleton = () => (
        <div className="card-header border-bottom-0 pb-0 pt-4 px-4 d-flex align-items-center justify-content-between">
            <div style={{ ...skeletonBaseStyle, width: '120px', height: '18px' }}></div>
            <div className="hstack gap-1">
                <div style={{ ...skeletonBaseStyle, width: '7px', height: '7px', borderRadius: '50%', opacity: 0.2 }}></div>
                <div style={{ ...skeletonBaseStyle, width: '7px', height: '7px', borderRadius: '50%', opacity: 0.2 }}></div>
                <div style={{ ...skeletonBaseStyle, width: '7px', height: '7px', borderRadius: '50%', opacity: 0.2 }}></div>
                <div className="ms-1" style={{ ...skeletonBaseStyle, width: '20px', height: '20px', borderRadius: '50%' }}></div>
            </div>
        </div>
    );

    const donutSize = 250; 
    const borderThickness = 22; // Professional thin ring

    if (type === 'progress') {
        return (
            <div className="col-12">
                <style>{shimmerAnimation}</style>
                <div className="card stretch stretch-full flex flex-col overflow-hidden" style={{ border: '1px solid var(--brand-border)' }}>
                    {/* Header Skeleton */}
                    <div className="px-6 py-5 border-b border-brand-border flex justify-between items-center">
                        <div style={{ ...skeletonBaseStyle, width: '220px', height: '22px' }}></div>
                        <div className="flex gap-2">
                            <div style={{ ...skeletonBaseStyle, width: '24px', height: '24px', borderRadius: '50%' }}></div>
                            <div style={{ ...skeletonBaseStyle, width: '24px', height: '24px', borderRadius: '50%' }}></div>
                        </div>
                    </div>

                    {/* Body Skeleton */}
                    <div className="flex-1 flex flex-col lg:flex-row bg-brand-surface/50">
                        {[1, 2].map((col, idx) => (
                            <div key={idx} className={`flex flex-col flex-1 p-6 ${idx === 0 ? 'border-b lg:border-b-0 lg:border-r border-brand-border' : ''}`}>
                                {/* Section Header */}
                                <div className="flex justify-between items-center mb-6">
                                    <div style={{ ...skeletonBaseStyle, width: '100px', height: '24px', borderRadius: '6px' }}></div>
                                    <div style={{ ...skeletonBaseStyle, width: '80px', height: '20px', borderRadius: '4px' }}></div>
                                </div>

                                {/* Content Island */}
                                <div className="bg-brand-surface-elevated/20 rounded-2xl border border-brand-border p-5 mb-6">
                                    <div className="flex items-center gap-4">
                                        {/* Radial Chart Placeholder */}
                                        <div style={{ 
                                            width: '160px', height: '160px', borderRadius: '50%',
                                            background: 'transparent', border: '12px solid var(--brand-muted)', position: 'relative',
                                            opacity: 0.2
                                        }}>
                                            <div style={{
                                                ...skeletonBaseStyle,
                                                position: 'absolute', top: '-12px', left: '-12px', right: '-12px', bottom: '-12px',
                                                borderRadius: '50%', border: '12px solid transparent',
                                                background: 'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.4) 50%, transparent 75%)',
                                                backgroundSize: '200% 100%', animation: 'skeleton-shimmer 2s infinite linear',
                                                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                                maskComposite: 'exclude', WebkitMaskComposite: 'xor'
                                            }}></div>
                                        </div>
                                        <div className="flex-1">
                                            <div style={{ ...skeletonBaseStyle, width: '80%', height: '10px', marginBottom: '10px', opacity: 0.6 }}></div>
                                            <div style={{ ...skeletonBaseStyle, width: '60%', height: '28px' }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    {[1, 2].map(i => (
                                        <div key={i} className="flex flex-col p-4 rounded-xl border border-dashed border-brand-border bg-brand-surface-hover/30">
                                            <div style={{ ...skeletonBaseStyle, width: '60%', height: '8px', marginBottom: '10px', opacity: 0.5 }}></div>
                                            <div style={{ ...skeletonBaseStyle, width: '80%', height: '20px' }}></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card stretch stretch-full leads-overview" style={{ border: '1px solid #f1f5f9' }}>
            <style>{shimmerAnimation}</style>
            {renderHeaderSkeleton()}
            <div className="card-body custom-card-action pb-4">
                <div style={{ height: `${chartHeight}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', paddingBottom: '10px' }}>
                    <div style={{ 
                        width: `${donutSize}px`, height: `${donutSize}px`, borderRadius: '50%',
                        background: 'transparent', border: `${borderThickness}px solid #f3f4f6`, position: 'relative'
                    }}>
                        <div style={{
                            ...skeletonBaseStyle,
                            position: 'absolute', top: `-${borderThickness}px`, left: `-${borderThickness}px`, right: `-${borderThickness}px`, bottom: `-${borderThickness}px`,
                            borderRadius: '50%', border: `${borderThickness}px solid transparent`,
                            background: 'linear-gradient(90deg, #f3f4f6 25%, #ffffff 50%, #f3f4f6 75%)',
                            backgroundSize: '200% 100%', animation: 'skeleton-shimmer 2s infinite linear',
                            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            maskComposite: 'exclude', WebkitMaskComposite: 'xor'
                        }}></div>
                    </div>
                </div>
                
                <div className="row g-2 pt-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="col-12">
                            <div className="p-2 hstack gap-2 rounded border border-dashed border-gray-5 justify-content-between" style={{ background: 'rgba(248, 249, 250, 0.4)' }}>
                                <div className="hstack gap-2">
                                    <div className="wd-7 ht-7 rounded-circle" style={{ ...skeletonBaseStyle, opacity: 0.15 }}></div>
                                    <div style={{ ...skeletonBaseStyle, width: '150px', height: '14px' }}></div>
                                </div>
                                <div style={{ ...skeletonBaseStyle, width: '25px', height: '14px', opacity: 0.5 }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WidgetSkeleton;
