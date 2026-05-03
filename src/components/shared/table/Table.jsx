import React, { useState } from 'react'
import TableSearch from './TableSearch'
import TablePagination from './TablePagination'
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa'
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

const Table = ({ data, columns }) => {
    // const [data] = useState([...fackData])
    const [sorting, setSorting] = useState([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const [density, setDensity] = useState('normal') // normal | compact


    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
            pagination
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
    })


    return (
        <div className="w-full mb-10">
            <div className="bg-brand-surface shadow-sm rounded-xl border border-brand-border overflow-hidden transition-all duration-200">
                <div className="p-0">
                    <div className="overflow-x-auto">
                        <div className='w-full'>
                            <TableSearch
                                table={table}
                                setGlobalFilter={setGlobalFilter}
                                globalFilter={globalFilter}
                                density={density}
                                setDensity={setDensity}
                            />

                            <div className="border-t border-brand-border">
                                <div className="w-full">
                                    <table className="w-full text-sm text-left border-collapse" id='projectList'>
                                        <thead className="sticky top-0 z-10">
                                            {table.getHeaderGroups().map((headerGroup) => (
                                                <tr key={headerGroup.id} className="bg-brand-muted/80 backdrop-blur-sm border-b border-brand-border">
                                                    {
                                                        headerGroup.headers.map((header) => {
                                                            const isCompact = density === 'compact'
                                                            return (
                                                                <th
                                                                    key={header.id}
                                                                    className={`
                                                                        ${header.column.columnDef.meta?.headerClassName || ''}
                                                                        text-brand-text-secondary font-bold uppercase tracking-wider whitespace-nowrap align-middle
                                                                        ${isCompact ? 'px-3 py-2 text-[10px]' : 'px-4 py-3.5 text-[11px]'}
                                                                    `}
                                                                >
                                                                    {
                                                                        header.id === "id" ?
                                                                            <div className='flex gap-2 items-center'>
                                                                                {
                                                                                    flexRender(
                                                                                        header.column.columnDef.header,
                                                                                        header.getContext()
                                                                                    )
                                                                                 }
                                                                                <ArrowToggle header={header} />
                                                                            </div>
                                                                            :
                                                                            <ArrowToggle header={header}>
                                                                                {
                                                                                    flexRender(
                                                                                        header.column.columnDef.header,
                                                                                        header.getContext()
                                                                                    )
                                                                                }
                                                                            </ArrowToggle>
                                                                    }
                                                                </th>
                                                            )
                                                        })
                                                    }
                                                </tr>
                                            ))}
                                        </thead>
                                        <tbody className="divide-y divide-brand-border">
                                            {table.getRowModel().rows.length === 0 ? (
                                                <tr>
                                                    <td colSpan={columns.length} className="bg-brand-surface py-12 text-center">
                                                        <div className="flex flex-col items-center justify-center min-h-[350px]">
                                                            <div className="mb-6 relative flex justify-center items-center">
                                                                {/* Background blob for modern look */}
                                                                <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute opacity-5 dark:opacity-10 scale-125">
                                                                    <path fill="currentColor" className="text-brand-primary" d="M45.7,-76.3C58.9,-69.3,69.5,-55.3,77.7,-40.5C85.9,-25.7,91.8,-10.1,89.5,4.6C87.3,19.3,76.9,33,65.8,44.7C54.7,56.4,42.9,66.1,29.4,72.4C15.9,78.7,0.7,81.6,-13.7,79.5C-28.1,77.4,-41.7,70.3,-52.1,60.2C-62.5,50.1,-69.6,37,-75.1,23.3C-80.6,9.6,-84.5,-4.7,-81.1,-17.1C-77.7,-29.5,-67.1,-40,-55.6,-48.5C-44.1,-57,-31.7,-63.5,-18.4,-68.8C-5.1,-74.1,9.1,-78.2,23.1,-79.4C37.1,-80.6,50.9,-78.9,45.7,-76.3Z" transform="translate(100 100)" />
                                                                </svg>
                                                                {/* Document Illustration */}
                                                                <svg width="90" height="90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
                                                                    <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H14L21 10V19C21 20.1046 20.1046 21 19 21Z" className="stroke-brand-primary fill-brand-muted" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M14 3V10H21" className="stroke-brand-primary" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M9 13H15" className="stroke-brand-primary" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M9 17H13" className="stroke-brand-primary" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                {/* Search glass floating accent */}
                                                                <div className="absolute -bottom-1 right-11 z-20 bg-brand-surface rounded-full p-1 shadow-sm">
                                                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <circle cx="11" cy="11" r="7" className="stroke-brand-accent fill-brand-surface" strokeWidth="2" />
                                                                        <path d="M20 20L16 16" className="stroke-brand-accent" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                            <h5 className="font-bold text-brand-text text-xl tracking-tight mb-2">No Data Found</h5>
                                                            <p className="text-brand-text-secondary max-w-xs text-sm leading-relaxed mx-auto">
                                                                We couldn't find any records matching your current criteria. Try adjusting your filters or checking back later.
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                table.getRowModel().rows.map((row) => (
                                                    <tr key={row.id} className='group hover:bg-brand-surface-hover transition-colors duration-150'>
                                                        {row.getVisibleCells().map((cell) => {
                                                            const isCompact = density === 'compact'
                                                            return (
                                                                <td
                                                                    key={cell.id}
                                                                    className={`
                                                                        ${cell.column.columnDef.meta?.className || ''}
                                                                        text-brand-text align-middle
                                                                        ${isCompact ? 'px-3 py-1.5' : 'px-4 py-3'}
                                                                    `}
                                                                >
                                                                    {
                                                                        flexRender(
                                                                            cell.column.columnDef.cell,
                                                                            cell.getContext()
                                                                        )
                                                                    }
                                                                </td>
                                                            )
                                                        })}
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="px-6 py-3 border-t border-brand-border bg-brand-background/30">
                                <TablePagination table={table} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Table

const ArrowToggle = ({ header, children }) => {
    const position = header.column.getIsSorted()
    return (
        <div
            className={`flex items-center gap-1.5 ${header.column.getCanSort() ? "cursor-pointer select-none" : "cursor-default"}`}
            onClick={header.column.getToggleSortingHandler()}
        >

            <span className="flex-grow">{children}</span>
            <div className="flex flex-col justify-center text-brand-text-muted">
                {
                    {
                        asc: <FaSortUp size={12} className="text-brand-primary" />,
                        desc: <FaSortDown size={12} className="text-brand-primary" />
                    }[position]
                }
                {header.column.getCanSort() && !position ? (
                    <FaSort size={12} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                ) : null}
            </div>
        </div>
    )
}