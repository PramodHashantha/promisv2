import React from "react";

const StockIssueSkeleton = () => {
    const skeletonStyle = {
        backgroundColor: "#e2e5e9",
        animation: "pulse 1.5s infinite ease-in-out",
        borderRadius: "4px"
    };

    const styleSheet = `
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
  `;

    return (
        <React.Fragment>
            <style>{styleSheet}</style>
            <div className="card-header bg-white border-bottom p-3">
                <div className="d-flex justify-content-between align-items-center">
                    <div style={{ ...skeletonStyle, width: '300px', height: '20px' }}></div>
                </div>
            </div>

            <div className="card-body p-4">
                <div className="row g-4">
                    {/* Left Sidebar Skeleton */}
                    <div className="col-lg-3">
                        <div className="mb-4">
                            <div style={{ ...skeletonStyle, width: '80px', height: '14px', marginBottom: '8px' }}></div>
                            <div style={{ ...skeletonStyle, width: '100%', height: '38px' }}></div>
                        </div>
                        <div className="mb-4">
                            <div style={{ ...skeletonStyle, width: '60px', height: '14px', marginBottom: '8px' }}></div>
                            <div style={{ ...skeletonStyle, width: '100%', height: '38px' }}></div>
                        </div>

                        {/* Progress Section */}
                        <div className="p-3 bg-light rounded-3">
                            <div className="d-flex justify-content-between mb-2">
                                <div style={{ ...skeletonStyle, width: '80px', height: '14px' }}></div>
                                <div style={{ ...skeletonStyle, width: '30px', height: '14px' }}></div>
                            </div>
                            <div style={{ ...skeletonStyle, width: '100%', height: '12px', marginBottom: '16px' }}></div>

                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="d-flex justify-content-between mb-2">
                                    <div style={{ ...skeletonStyle, width: '100px', height: '14px' }}></div>
                                    <div style={{ ...skeletonStyle, width: '40px', height: '14px' }}></div>
                                </div>
                            ))}
                            <div className="border-top mt-3 pt-3 d-flex justify-content-between">
                                <div style={{ ...skeletonStyle, width: '110px', height: '16px' }}></div>
                                <div style={{ ...skeletonStyle, width: '50px', height: '16px' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content (Bin Inventory) Skeleton */}
                    <div className="col-lg-9">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div style={{ ...skeletonStyle, width: '120px', height: '24px' }}></div>
                            <div style={{ ...skeletonStyle, width: '150px', height: '16px' }}></div>
                        </div>

                        <div className="border rounded-3 p-5 text-center bg-light">
                            <div className="d-flex justify-content-center align-items-center" style={{ height: '100px' }}>
                                <div style={{ ...skeletonStyle, width: '200px', height: '16px', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Skeleton */}
            <div className="card-footer bg-white p-4 d-flex justify-content-end align-items-center gap-4">
                <div className="d-flex flex-column align-items-end">
                    <div style={{ ...skeletonStyle, width: '150px', height: '14px', marginBottom: '6px' }}></div>
                    <div style={{ ...skeletonStyle, width: '80px', height: '24px' }}></div>
                </div>
                <div style={{ ...skeletonStyle, width: '140px', height: '40px', borderRadius: '4px' }}></div>
            </div>
        </React.Fragment>
    );
};

export default StockIssueSkeleton;
