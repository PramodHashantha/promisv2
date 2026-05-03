import React, { useMemo } from 'react';

// Un-exported helper to create an array range [start, end]
const range = (start, end) => {
    let length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
};

// Helper to calculate pagination range
const returnPaginationRange = (totalPage, page, siblings) => {
    let totalPageNoInArray = 7 + siblings;
    if (totalPageNoInArray >= totalPage) {
        return range(1, totalPage);
    }

    let leftSiblingsIndex = Math.max(page - siblings, 1);
    let rightSiblingsIndex = Math.min(page + siblings, totalPage);

    let showLeftDots = leftSiblingsIndex > 2;
    let showRightDots = rightSiblingsIndex < totalPage - 2;

    if (!showLeftDots && showRightDots) {
        let leftItemCount = 3 + 2 * siblings;
        let leftRange = range(1, leftItemCount);
        return [...leftRange, '... ', totalPage];
    } else if (showLeftDots && !showRightDots) {
        let rightItemCount = 3 + 2 * siblings;
        let rightRange = range(totalPage - rightItemCount + 1, totalPage);
        return [1, ' ...', ...rightRange];
    } else {
        let middleRange = range(leftSiblingsIndex, rightSiblingsIndex);
        return [1, ' ...', ...middleRange, '... ', totalPage];
    }
};

const TablePagination = ({ table }) => {
    const totalCount = table.getFilteredRowModel().rows.length;
    const pageIndex = table.getState().pagination.pageIndex;
    const pageSize = table.getState().pagination.pageSize;
    const totalPages = table.getPageCount();

    // Use useMemo to recalculate only when state changes
    const array = useMemo(() => {
        return returnPaginationRange(totalPages, pageIndex + 1, 1);
    }, [totalPages, pageIndex]);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                Showing <span className="text-brand-text">{totalCount === 0 ? 0 : pageIndex * pageSize + 1}</span> to <span className="text-brand-text">{Math.min((pageIndex + 1) * pageSize, totalCount)}</span> of <span className="text-brand-text">{totalCount}</span> entries
            </div>

            <nav className="flex items-center gap-1.5" aria-label="Table navigation">
                {/* Previous Button */}
                <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className={`
                        flex items-center justify-center px-4 py-2 text-sm font-medium transition-all duration-200
                        ${!table.getCanPreviousPage() 
                            ? "text-brand-text-muted cursor-not-allowed bg-brand-muted/20 border border-transparent" 
                            : "text-brand-text bg-brand-surface border border-brand-border hover:bg-brand-surface-hover hover:border-brand-primary/30 shadow-sm"}
                    `}
                    style={{ borderRadius: '8px' }}
                >
                    Previous
                </button>

                {/* Page Numbers */}
                <div className="hidden md:flex items-center gap-1.5">
                    {array.map((value, idx) => {
                        if (value === ' ...' || value === '... ') {
                            return (
                                <span key={idx} className="px-2 text-brand-text-muted">...</span>
                            );
                        }
                        const isActive = value === pageIndex + 1;
                        return (
                            <button
                                key={idx}
                                className={`
                                    min-w-[38px] h-[38px] flex items-center justify-center text-sm font-medium transition-all duration-200
                                    ${isActive 
                                        ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20 border-transparent" 
                                        : "text-brand-text-secondary bg-brand-surface border border-brand-border hover:bg-brand-surface-hover hover:text-brand-text shadow-sm"}
                                `}
                                onClick={() => table.setPageIndex(value - 1)}
                                style={{ borderRadius: '8px' }}
                            >
                                {value}
                            </button>
                        );
                    })}
                </div>

                {/* Next Button */}
                <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className={`
                        flex items-center justify-center px-4 py-2 text-sm font-medium transition-all duration-200
                        ${!table.getCanNextPage() 
                            ? "text-brand-text-muted cursor-not-allowed bg-brand-muted/20 border border-transparent" 
                            : "text-brand-text bg-brand-surface border border-brand-border hover:bg-brand-surface-hover hover:border-brand-primary/30 shadow-sm"}
                    `}
                    style={{ borderRadius: '8px' }}
                >
                    Next
                </button>
            </nav>
        </div>
    );
};

export default TablePagination;