import React from "react";

const RequestCartSkeleton = () => {
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
            <div className="row mb-5">
                {/* Left Column: Request Item List Skeleton */}
                <div className="col-lg-6 mb-4 mb-lg-0">
                    <div className="card sod-card shadow-sm h-100 border-0">
                        <div className="card-header bg-white border-bottom p-3">
                            <div style={{ ...skeletonStyle, width: '40%', height: '24px' }}></div>
                        </div>
                        <div className="card-body p-3">
                            <div className="table-responsive">
                                <table className="table sod-table align-middle mb-0">
                                    <thead>
                                        <tr>
                                            {[1, 2, 3, 4].map(i => (
                                                <th key={i}><div style={{ ...skeletonStyle, width: '100%', height: '20px' }}></div></th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[1, 2, 3, 4, 5].map((row) => (
                                            <tr key={row}>
                                                <td><div style={{ ...skeletonStyle, width: '60px', height: '30px' }}></div></td>
                                                <td><div style={{ ...skeletonStyle, width: '80px', height: '20px' }}></div></td>
                                                <td>
                                                    <div style={{ ...skeletonStyle, width: '90%', height: '16px', marginBottom: '4px' }}></div>
                                                    <div style={{ ...skeletonStyle, width: '40%', height: '12px' }}></div>
                                                </td>
                                                <td><div style={{ ...skeletonStyle, width: '50px', height: '20px', marginLeft: 'auto' }}></div></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Out Item List (Cart) & Issued Items History Skeleton */}
                <div className="col-lg-6 d-flex flex-column gap-4">

                    {/* SECTION 1: CURRENT CART SKELETON */}
                    <div className="bg-white rounded-3 shadow-sm border border-secondary-subtle">
                        {/* Card Header */}
                        <div className="bg-white border-bottom border-secondary-subtle px-4 py-3 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-3">
                                <div style={{ ...skeletonStyle, width: '40px', height: '40px', borderRadius: '8px' }}></div>
                                <div>
                                    <div style={{ ...skeletonStyle, width: '100px', height: '18px', marginBottom: '6px' }}></div>
                                    <div style={{ ...skeletonStyle, width: '150px', height: '14px' }}></div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div style={{ ...skeletonStyle, width: '70px', height: '30px', borderRadius: '50rem' }}></div>
                                <div style={{ ...skeletonStyle, width: '20px', height: '20px', borderRadius: '4px' }}></div>
                            </div>
                        </div>

                        {/* Collapsible Content */}
                        <div className="table-responsive">
                            <table className="table sod-table align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        {[1, 2, 3, 4, 5, 6].map(i => (
                                            <th key={i} className="px-4 py-3 border-bottom-0"><div style={{ ...skeletonStyle, width: '100%', height: '16px' }}></div></th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[1, 2, 3].map((row) => (
                                        <tr key={row}>
                                            <td className="px-4 py-3"><div style={{ ...skeletonStyle, width: '100px', height: '20px' }}></div></td>
                                            <td className="px-4 py-3"><div style={{ ...skeletonStyle, width: '180px', height: '20px' }}></div></td>
                                            <td className="px-4 py-3 text-center"><div style={{ ...skeletonStyle, width: '60px', height: '20px', margin: '0 auto' }}></div></td>
                                            <td className="px-4 py-3 text-center"><div style={{ ...skeletonStyle, width: '40px', height: '20px', margin: '0 auto' }}></div></td>
                                            <td className="px-4 py-3 text-center"><div style={{ ...skeletonStyle, width: '70px', height: '20px', borderRadius: '50rem', margin: '0 auto' }}></div></td>
                                            <td className="px-4 py-3 text-center"><div style={{ ...skeletonStyle, width: '30px', height: '30px', borderRadius: '4px', margin: '0 auto' }}></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* SECTION 2: ISSUED ITEMS HISTORY SKELETON */}
                    <div className="bg-white rounded-3 shadow-sm border border-secondary-subtle">
                        {/* Card Header */}
                        <div className="bg-white px-4 py-3 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-3">
                                <div style={{ ...skeletonStyle, width: '40px', height: '40px', borderRadius: '8px' }}></div>
                                <div>
                                    <div style={{ ...skeletonStyle, width: '140px', height: '18px', marginBottom: '6px' }}></div>
                                    <div style={{ ...skeletonStyle, width: '200px', height: '14px' }}></div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div style={{ ...skeletonStyle, width: '80px', height: '30px', borderRadius: '50rem' }}></div>
                                <div style={{ ...skeletonStyle, width: '20px', height: '20px', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default RequestCartSkeleton;
