import React, { useState, useMemo } from 'react';
import { FiGrid, FiList, FiSearch, FiEdit2, FiTrash2, FiChevronDown } from 'react-icons/fi';

const StoreWarehouseList = ({
  data = [],
  columns = [
    { key: 'w_CODE', label: 'Warehouse Code', renderType: 'badge-code' },
    { key: 'w_NAME', label: 'Warehouse Name', renderType: 'text' },
    { key: 'w_TYPE', label: 'Type', renderType: 'badge-type' },
    { key: 'fullname', label: 'In Charge', renderType: 'avatar-text' },
  ],
  gridMapping = {
    code: 'w_CODE',
    type: 'w_TYPE',
    title: 'w_NAME',
    subtitle: 'w_DESCRIPTION',
    footerText: 'fullname',
  },
  onEdit = () => {},
  onDelete = () => {}
}) => {
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = searchTerm === '' || 
        (item[gridMapping.code] && item[gridMapping.code].toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item[gridMapping.title] && item[gridMapping.title].toLowerCase().includes(searchTerm.toLowerCase()));
      
      const typeValue = item[gridMapping.type] || '';
      const matchType = typeFilter === 'All Types' || (typeValue === typeFilter);

      return matchSearch && matchType;
    });
  }, [data, searchTerm, typeFilter, gridMapping]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getTypeOptions = () => {
    return ['All Types', 'Main', 'Sub'];
  };

  const renderListBadgeType = (text) => {
      if (!text) return null;
      if (text === 'Main') {
          return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">{text}</span>;
      }
      return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-brand-background text-brand-text-secondary border border-brand-border">{text}</span>;
  };

  const renderAvatarText = (text) => {
    if (!text) return null;
    const initial = text.charAt(0).toUpperCase();
    return (
      <div className="flex items-center">
          <div className="w-7 h-7 rounded-full bg-brand-background mr-2 flex items-center justify-center text-xs font-medium text-brand-text-secondary border border-brand-border">
              {initial}
          </div>
          <span className="text-sm text-brand-text-secondary">{text}</span>
      </div>
    );
  };

  const renderCell = (item, col) => {
    const value = item[col.key];
    switch(col.renderType) {
      case 'badge-code': 
          if(item[gridMapping.type] === 'Sub') return <div className="text-sm font-bold text-brand-text-secondary bg-brand-background w-fit px-2 py-0.5 rounded border border-brand-border">{value}</div>;
          return <div className="text-sm font-bold text-brand-primary bg-brand-primary/10 w-fit px-2 py-0.5 rounded border border-brand-primary/20">{value}</div>;
      case 'badge-type': return renderListBadgeType(value);
      case 'avatar-text': return renderAvatarText(value);
      case 'text':
      default: return <div className="text-sm font-medium text-brand-text">{value}</div>;
    }
  };

  return (
    <div className="w-full">
      {/* Filters & View Toggle Bar */}
      <div className="brand-card p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
              {/* Search */}
              <div className="relative group/search">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted transition-colors group-focus-within/search:text-brand-primary" />
                  <input 
                      type="text" 
                      placeholder="Search by code or name..."
                      className="brand-input w-full sm:w-64 !pl-12"
                      value={searchTerm}
                      onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                      }}
                  />
              </div>

              {/* Filter Dropdown */}
              <div className="relative group/filter">
                <select
                    className="brand-input appearance-none pr-10 min-w-[140px]"
                    value={typeFilter}
                    onChange={(e) => {
                        setTypeFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                >
                    {getTypeOptions().map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brand-text-muted group-hover/filter:text-brand-text transition-colors">
                    <FiChevronDown className="h-4 w-4" />
                </div>
              </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-1 p-1 bg-brand-background border border-brand-border rounded-xl hidden sm:flex">
              <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand-surface shadow-sm text-brand-primary border border-brand-border' : 'text-brand-text-muted hover:text-brand-text'}`}
                  title="List View"
              >
                  <FiList className="w-4 h-4" />
              </button>
              <button 
                   onClick={() => setViewMode('grid')}
                   className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand-surface shadow-sm text-brand-primary border border-brand-border' : 'text-brand-text-muted hover:text-brand-text'}`}
                  title="Grid View"
              >
                  <FiGrid className="w-4 h-4" />
              </button>
          </div>
      </div>

      {/* LIST VIEW */}
      {viewMode === 'list' ? (
          <div className="brand-card overflow-hidden">
              <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-brand-border/40">
                      <thead className="bg-brand-muted/30">
                          <tr>
                              {columns.map(col => (
                                  <th key={col.key} className="px-4 py-3.5 text-left text-xs font-bold text-brand-text-secondary uppercase tracking-widest">
                                      {col.label}
                                  </th>
                              ))}
                              <th className="px-4 py-3.5 text-center text-xs font-bold text-brand-text-secondary uppercase tracking-widest">
                                  Actions
                              </th>
                          </tr>
                      </thead>
                      <tbody className="bg-brand-surface divide-y divide-brand-border/40">
                          {currentData.map((item, idx) => (
                              <tr key={item.w_ID || idx} className="hover:bg-brand-background/50 transition-colors group">
                                  {columns.map(col => (
                                      <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                                          {renderCell(item, col)}
                                      </td>
                                  ))}
                                  <td className="px-4 py-3 whitespace-nowrap text-center">
                                      <div className="flex items-center justify-center space-x-2">
                                          <button onClick={() => onEdit(item)} className="p-2 text-brand-text-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg border border-transparent hover:border-brand-primary/20 transition-all duration-200">
                                              <FiEdit2 className="w-4 h-4" />
                                          </button>
                                          <button onClick={() => onDelete(item)} className="p-2 text-brand-text-muted hover:text-error hover:bg-error/10 rounded-lg border border-transparent hover:border-error/20 transition-all duration-200">
                                              <FiTrash2 className="w-4 h-4" />
                                          </button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                          {filteredData.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 1} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="p-3 bg-brand-muted/50 rounded-full text-brand-text-muted">
                                            <FiSearch className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-medium text-brand-text-secondary">No warehouses found matching your criteria</p>
                                    </div>
                                </td>
                            </tr>
                          )}
                      </tbody>
                  </table>
              </div>

              {/* Pagination */}
              {filteredData.length > 0 && (
                  <div className="bg-brand-background/30 px-6 py-3 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                          Showing <span className="text-brand-text">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-brand-text">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="text-brand-text">{filteredData.length}</span> results
                      </p>
                      <div className="flex items-center gap-2">
                          <button 
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="brand-btn-secondary px-4 py-1.5 text-xs h-9"
                          >
                              Previous
                          </button>
                          <div className="flex items-center gap-1.5 mx-1">
                              {Array.from({ length: totalPages }).map((_, i) => {
                                   if (totalPages > 5) {
                                     if (i !== 0 && i !== totalPages - 1 && Math.abs(i + 1 - currentPage) > 1) {
                                       if (i === 1 || i === totalPages - 2) return <span key={i} className="px-1 text-brand-text-muted">...</span>;
                                       return null;
                                     }
                                   }
                                   return (
                                      <button
                                          key={i}
                                          onClick={() => setCurrentPage(i + 1)}
                                          className={`w-9 h-9 rounded-lg text-xs font-bold transition-all duration-200 ${
                                              currentPage === i + 1 
                                              ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 scale-105' 
                                              : 'bg-brand-surface text-brand-text-secondary border border-brand-border hover:bg-brand-surface-hover hover:text-brand-text hover:border-brand-border-strong'
                                          }`}
                                      >
                                          {i + 1}
                                      </button>
                                   );
                              })}
                          </div>
                          <button 
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              className="brand-btn-secondary px-4 py-1.5 text-xs h-9"
                          >
                              Next
                          </button>
                      </div>
                  </div>
              )}
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentData.map((item, idx) => {
                  const type = item[gridMapping.type];
                  const isSub = type === 'Sub';
                  
                  return (
                      <div key={item.w_ID || idx} className="brand-card overflow-hidden group">
                          <div className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm border transition-all duration-300 ${
                                      !isSub 
                                        ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary group-hover:bg-brand-primary group-hover:text-white' 
                                        : 'bg-brand-background border-brand-border text-brand-text-secondary group-hover:bg-brand-text-secondary group-hover:text-white'
                                  }`}>
                                      {item[gridMapping.code]}
                                  </div>
                                  <span className={`px-2.5 py-1 text-[10px] uppercase font-bold border rounded-full tracking-wider ${
                                      !isSub 
                                        ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/10' 
                                        : 'bg-brand-background text-brand-text-muted border-brand-border'
                                  }`}>
                                      {type}
                                  </span>
                              </div>
                              <h3 className="font-bold text-brand-text mb-1 group-hover:text-brand-primary transition-colors">{item[gridMapping.title]}</h3>
                              <p className="text-xs text-brand-text-secondary/60 mb-5 line-clamp-2 min-h-[32px]">{item[gridMapping.subtitle] || 'Specialized warehouse facility providing optimized storage solutions.'}</p>

                              <div className="pt-4 border-t border-brand-border flex items-center justify-between">
                                  {renderAvatarText(item[gridMapping.footerText])}
                                  <div className="flex items-center gap-1">
                                      <button onClick={() => onEdit(item)} className="p-2 text-brand-text-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all" title="Edit">
                                          <FiEdit2 className="w-4 h-4" />
                                      </button>
                                      <button onClick={() => onDelete(item)} className="p-2 text-brand-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-all" title="Delete">
                                          <FiTrash2 className="w-4 h-4" />
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )
              })}
              {filteredData.length === 0 && (
                  <div className="col-span-full py-10 text-center text-sm text-brand-text-secondary bg-brand-surface rounded-xl border border-brand-border">
                      No warehouses found
                  </div>
              )}

              {/* Pagination for Grid */}
              {filteredData.length > 0 && (
                  <div className="col-span-full bg-brand-background/30 px-6 py-3 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                       <p className="text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                          Showing <span className="text-brand-text">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-brand-text">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="text-brand-text">{filteredData.length}</span> results
                      </p>
                      <div className="flex items-center gap-2">
                          <button 
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="brand-btn-secondary px-4 py-1.5 text-xs h-9"
                          >
                              Previous
                          </button>
                          <div className="flex items-center gap-1.5 mx-1">
                              {Array.from({ length: totalPages }).map((_, i) => {
                                   if (totalPages > 5) {
                                     if (i !== 0 && i !== totalPages - 1 && Math.abs(i + 1 - currentPage) > 1) {
                                       if (i === 1 || i === totalPages - 2) return <span key={i} className="px-1 text-brand-text-muted">...</span>;
                                       return null;
                                     }
                                   }
                                   return (
                                      <button
                                          key={i}
                                          onClick={() => setCurrentPage(i + 1)}
                                          className={`w-9 h-9 rounded-lg text-xs font-bold transition-all duration-200 ${
                                              currentPage === i + 1 
                                              ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 scale-105' 
                                              : 'bg-brand-surface text-brand-text-secondary border border-brand-border hover:bg-brand-surface-hover hover:text-brand-text hover:border-brand-border-strong'
                                          }`}
                                      >
                                          {i + 1}
                                      </button>
                                   );
                              })}
                          </div>
                          <button 
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              className="brand-btn-secondary px-4 py-1.5 text-xs h-9"
                          >
                              Next
                          </button>
                      </div>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default StoreWarehouseList;
