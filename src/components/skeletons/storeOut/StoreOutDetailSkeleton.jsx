import React from "react";
import RequestCartSkeleton from "./RequestCartSkeleton";
import StockIssueSkeleton from "./StockIssueSkeleton";

const StoreOutDetailSkeleton = () => {
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

            <div className="container-fluid p-3 p-md-4 store-out-detail">

                {/* Page Header Skeleton */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div style={{ ...skeletonStyle, width: '200px', height: '28px' }}></div>
                    <div style={{ ...skeletonStyle, width: '120px', height: '38px' }}></div>
                </div>

                <RequestCartSkeleton />

                {/* Stock Issue Skeleton */}
                <div className="row">
                    <div className="col-12">
                        <div className="card sod-card shadow-sm border-0" style={{ minHeight: '400px' }}>
                            <StockIssueSkeleton />
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default StoreOutDetailSkeleton;
