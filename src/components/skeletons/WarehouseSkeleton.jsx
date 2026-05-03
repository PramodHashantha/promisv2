import React from 'react';

const WarehouseSkeleton = () => {
    const skeletonClass = "bg-brand-border-strong/10 animate-shimmer rounded-md";
    const barClass = "bg-brand-muted animate-shimmer rounded-xl";

    return (
        <div className="w-full animate-in fade-in duration-500">
            
            {/* Filter Bar Skeleton */}
            <div className="brand-card p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    {/* Search Placeholder */}
                    <div className="relative w-full sm:w-64">
                        <div className="w-full h-11 bg-brand-muted border border-brand-border rounded-xl flex items-center px-4 animate-shimmer overflow-hidden">
                            <div className={`bg-brand-text-muted/10 w-4 h-4 rounded-full`}></div>
                            <div className={`bg-brand-text-muted/10 ml-4 w-[120px] h-3`}></div>
                        </div>
                    </div>

                    {/* Filter Dropdown Placeholder */}
                    <div className="bg-brand-muted border border-brand-border rounded-xl w-full sm:w-[140px] h-11 animate-shimmer"></div>
                </div>

                {/* View Toggle Placeholder (Hidden on mobile) */}
                <div className="hidden sm:flex items-center space-x-1 p-1 bg-brand-background border border-brand-border/50 rounded-xl animate-shimmer">
                    <div className={`bg-brand-border-strong/20 w-9 h-9 rounded-lg`}></div>
                    <div className={`bg-brand-border-strong/20 w-9 h-9 rounded-lg opacity-60`}></div>
                </div>
            </div>

            {/* Table Skeleton */}
            <div className="brand-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-brand-border/40">
                        <thead className="bg-brand-muted/30">
                            <tr>
                                <th className="px-4 py-3.5 text-left">
                                    <div className={`${skeletonClass} w-[100px] h-3`}></div>
                                </th>
                                <th className="px-4 py-3.5 text-left">
                                    <div className={`${skeletonClass} w-[120px] h-3`}></div>
                                </th>
                                <th className="px-4 py-3.5 text-left hidden sm:table-cell">
                                    <div className={`${skeletonClass} w-[60px] h-3`}></div>
                                </th>
                                <th className="px-4 py-3.5 text-left hidden lg:table-cell">
                                    <div className={`${skeletonClass} w-[100px] h-3`}></div>
                                </th>
                                <th className="px-4 py-3.5 text-center">
                                    <div className={`${skeletonClass} w-[60px] mx-auto h-3`}></div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-brand-surface divide-y divide-brand-border/30">
                            {[1, 2, 3, 4, 5, 6].map(row => (
                                <tr key={row} className="hover:bg-brand-background/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className={`${skeletonClass} w-20 h-6 rounded-lg`}></div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className={`${skeletonClass} w-full max-w-[200px] h-4 rounded-md`}></div>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell">
                                        <div className={`${skeletonClass} w-[70px] h-6 rounded-full`}></div>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <div className="flex items-center">
                                            <div className={`${skeletonClass} w-8 h-8 rounded-full mr-3`}></div>
                                            <div className={`${skeletonClass} w-[110px] h-3.5 rounded-md`}></div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center space-x-3">
                                            <div className={`${skeletonClass} w-8 h-8 rounded-lg opacity-40`}></div>
                                            <div className={`${skeletonClass} w-8 h-8 rounded-lg opacity-40`}></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="bg-brand-background/30 px-6 py-5 border-t border-brand-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className={`${skeletonClass} w-full max-w-[220px] h-4 rounded-md opacity-40`}></div>
                    <div className="flex space-x-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`${skeletonClass} w-9 h-9 rounded-lg ${i > 3 ? 'hidden sm:block' : ''} ${i > 1 ? 'opacity-20' : 'opacity-100'}`}></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarehouseSkeleton;
