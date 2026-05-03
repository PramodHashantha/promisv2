import React from "react";
import "../../styles/index.scss";


const TableSkeleton = ({ columns = 6, rows = 8 }) => {
  const rowArray = Array(rows).fill(null);
  const headerArray = Array(columns).fill(null);

  return (
    <div className="w-full">
      <div className="bg-brand-surface shadow-sm rounded-xl border border-brand-border overflow-hidden">
        <div className="p-0">
          <div className="overflow-x-auto">
            <div className='w-full text-sm'>
              {/* Search and Density Skeleton */}
              <div className="flex items-center justify-between gap-4 px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-9 bg-brand-muted animate-pulse" style={{ borderRadius: '8px' }}></div>
                  <div className="w-60 h-9 bg-brand-muted animate-pulse" style={{ borderRadius: '8px' }}></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-9 bg-brand-muted animate-pulse" style={{ borderRadius: '8px' }}></div>
                  <div className="w-10 h-9 bg-brand-muted animate-pulse" style={{ borderRadius: '8px' }}></div>
                  <div className="w-24 h-9 bg-brand-muted animate-pulse" style={{ borderRadius: '8px' }}></div>
                </div>
              </div>

              <div className="border-t border-brand-border">
                <div className="w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-brand-muted/80 border-b border-brand-border">
                        {headerArray.map((_, index) => (
                          <th key={index} className="px-4 py-3.5">
                            <div className="w-4/5 h-4 bg-brand-border/50 animate-pulse" style={{ borderRadius: '4px' }}></div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {rowArray.map((_, rowIndex) => (
                        <tr key={rowIndex}>
                          {headerArray.map((_, colIndex) => (
                            <td key={colIndex} className="px-4 py-3">
                              <div className="w-full h-4 bg-brand-muted/30 animate-pulse" style={{ borderRadius: '4px' }}></div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination Skeleton */}
              <div className="flex items-center justify-between gap-4 px-6 py-6 border-t border-brand-border bg-brand-background/30">
                <div className="w-40 h-4 bg-brand-muted animate-pulse" style={{ borderRadius: '4px' }}></div>
                <div className="flex gap-2">
                  <div className="w-20 h-8 bg-brand-muted animate-pulse" style={{ borderRadius: '8px' }}></div>
                  <div className="flex gap-1">
                    <div className="w-8 h-8 bg-brand-muted animate-pulse" style={{ borderRadius: '8px' }}></div>
                    <div className="w-8 h-8 bg-brand-muted animate-pulse" style={{ borderRadius: '8px' }}></div>
                    <div className="w-8 h-8 bg-brand-muted animate-pulse" style={{ borderRadius: '8px' }}></div>
                  </div>
                  <div className="w-20 h-8 bg-brand-muted animate-pulse" style={{ borderRadius: '8px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;
