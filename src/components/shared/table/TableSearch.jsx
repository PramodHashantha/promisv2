import React, { useState } from 'react'
import { FaCompressAlt, FaExpandAlt, FaFilter } from 'react-icons/fa'
import { FiPaperclip } from "react-icons/fi";
import { BsFiletypePdf, BsFiletypeCsv, BsFiletypeXml, BsFiletypeTsx, BsFiletypeExe, BsPrinter } from "react-icons/bs";
import Dropdown from '@/components/shared/Dropdown';

const TableSearch = ({ table, setGlobalFilter, globalFilter, density, setDensity }) => {

    // Helper to extract header string even if it's a function
    const getHeaderValue = (column) => {
        const header = column.columnDef.header;
        return typeof header === 'function' ? header() : header;
    }

    const exportCsv = async () => {
        const rows = table.getPrePaginationRowModel().rows;
        // Standard: Use getHeaderValue for headers, cell.getValue() for data.
        // This relies on columns defining accessorFn to return the "text" value.
        const csvContent = table.getVisibleFlatColumns().map(c => getHeaderValue(c)).join(",") + "\n"
            + rows.map(row => row.getVisibleCells().map(cell => JSON.stringify(cell.getValue())).join(",")).join("\n");

        try {
            // @ts-ignore - showSaveFilePicker is not yet in all standard TS defs
            if (window.showSaveFilePicker) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: 'export.csv',
                    types: [{
                        description: 'CSV File',
                        accept: { 'text/csv': ['.csv'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(csvContent);
                await writable.close();
            } else {
                // Fallback for browsers without File System Access API
                const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "export.csv");
                document.body.appendChild(link);
                link.click();
            }
        } catch (err) {
            console.error("Export cancelled or failed:", err);
        }
    }

    const copyToClipboard = () => {
        const rows = table.getPrePaginationRowModel().rows;
        const text = rows.map(row =>
            row.getVisibleCells().map(cell => {
                const val = cell.getValue();
                return val === null || val === undefined ? "" : val;
            }).join("\t")
        ).join("\n");
        navigator.clipboard.writeText(text);
        if (typeof window !== 'undefined' && window.alert) {
            alert("Copied to clipboard!");
        }

    }

    const fileTypeItems = [
        { label: "PDF", icon: <BsFiletypePdf /> },
        { label: "CSV", icon: <BsFiletypeCsv /> },
        { label: "XML", icon: <BsFiletypeXml /> },
        { label: "Text", icon: <BsFiletypeTsx /> }, // We'll use this for Copy
        { label: "Excel", icon: <BsFiletypeExe /> }, // We'll use this for Copy too
        { label: "Print", icon: <BsPrinter /> }
    ];

    const handleActionClick = (label) => {
        switch (label) {
            case 'CSV':
                exportCsv();
                break;
            case 'Text':
            case 'Excel':
                copyToClipboard();
                break;
            case 'Print':
                window.print();
                break;
            default:
                console.log(`Action ${label} not implemented yet`);
                break;
        }
    }

    return (
        <div className='flex flex-wrap items-center justify-between gap-4 px-6 py-2.5'>
            {/* Left: Search & Page Size */}
            <div className='flex items-center flex-wrap gap-4'>
                <div className='flex items-center gap-2'>
                    <label className="text-xs font-medium text-brand-text-secondary uppercase tracking-wider">Show</label>
                    <select
                        className='bg-brand-surface border border-brand-border text-brand-text text-sm rounded-lg focus:border-brand-primary block w-auto p-1.5 transition-all duration-200 outline-none cursor-pointer hover:border-brand-border-strong'
                        value={table.getState().pagination.pageSize}
                        onChange={e => table.setPageSize(Number(e.target.value))}
                    >
                        {[10, 20, 30, 40, 50].map(pageSize => (
                            <option key={pageSize} value={pageSize}>{pageSize}</option>
                        ))}
                    </select>
                    <span className="text-xs font-medium text-brand-text-secondary uppercase tracking-wider">Entries</span>
                </div>

                <div className='relative group'>
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-brand-text-muted group-focus-within:text-brand-primary transition-colors duration-200">
                        <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={globalFilter ?? ""}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder='Search records...'
                        className="block w-full min-w-[240px] pr-4 py-2 text-sm text-brand-text border border-brand-border bg-brand-surface focus:border-brand-primary transition-all duration-200 outline-none placeholder:text-brand-text-muted"
                        style={{ paddingLeft: '3rem', borderRadius: '8px' }}
                    />
                </div>
            </div>

            {/* Right: Toolbar Actions */}
            <div className='flex items-center gap-2'>

                {/* Density Toggle */}
                <button
                    className={`
                        p-2 border transition-all duration-200 flex items-center justify-center
                        ${density === 'compact' 
                            ? 'bg-brand-primary text-white border-brand-primary shadow-sm' 
                            : 'bg-brand-surface text-brand-text-secondary border-brand-border hover:bg-brand-surface-hover hover:text-brand-text'}
                    `}
                    onClick={() => setDensity(density === 'normal' ? 'compact' : 'normal')}
                    title="Toggle Density"
                    style={{ borderRadius: '8px' }}
                >
                    {density === 'normal' ? <FaCompressAlt size={16} /> : <FaExpandAlt size={16} />}
                </button>

                {/* Clip Action Menu */}
                <div className="relative">
                    <Dropdown
                        dropdownItems={fileTypeItems}
                        triggerPosition={"0, 12"}
                        triggerIcon={<FiPaperclip size={18} strokeWidth={2} />}
                        triggerClass="inline-flex items-center justify-center p-2 text-sm font-medium text-brand-text bg-brand-surface border border-brand-border hover:bg-brand-surface-hover transition-all duration-200 outline-none"
                        style={{ borderRadius: '8px' }}
                        iconStrokeWidth={0}
                        isAvatar={false}
                        onClick={handleActionClick}
                    />
                </div>

                {/* Column/View Filter */}
                <div className="relative group/dropdown">
                    <button 
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-text bg-brand-surface border border-brand-border hover:bg-brand-surface-hover transition-all duration-200 outline-none" 
                        type="button" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
                        style={{ borderRadius: '8px' }}
                    >
                        <FaFilter className="text-brand-text-muted group-hover/dropdown:text-brand-text transition-colors" /> 
                        <span>View</span>
                    </button>
                    <div className="dropdown-menu p-2 shadow-xl border-brand-border bg-brand-surface rounded-xl hidden group-hover/dropdown:block absolute right-0 z-50 mt-1 min-w-[200px]" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <div className="px-3 py-2 border-b border-brand-border mb-2">
                            <h6 className="text-[10px] uppercase font-bold text-brand-text-muted tracking-widest">Toggle Columns</h6>
                        </div>
                        <div className="space-y-1">
                            {table.getAllLeafColumns().map(column => (
                                <div key={column.id} className="flex items-center px-3 py-1.5 hover:bg-brand-surface-hover rounded-md transition-colors cursor-pointer group/item">
                                    <input
                                        className="w-4 h-4 text-brand-primary bg-brand-background border-brand-border rounded focus:ring-brand-primary/20 cursor-pointer"
                                        type="checkbox"
                                        id={`col-${column.id}`}
                                        checked={column.getIsVisible()}
                                        onChange={column.getToggleVisibilityHandler()}
                                    />
                                    <label className="ml-2 text-sm font-medium text-brand-text-secondary group-hover/item:text-brand-text cursor-pointer select-none" htmlFor={`col-${column.id}`}>
                                        {getHeaderValue(column)}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TableSearch
