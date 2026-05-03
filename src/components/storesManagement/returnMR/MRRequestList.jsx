import React, { useState, useEffect } from 'react';
import { returnMRAPI } from '../../../utils/api/returnMR';
import LoadingSpinner from '../../loading/LoadingSpinner';

const MRRequestList = ({ onSelectMR, selectedMRNo }) => {
  const [approvalFilter, setApprovalFilter] = useState('Issued With Approval');
  const [mrRequests, setMrRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadMRRequests();
  }, [approvalFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [approvalFilter, searchTerm]);

  const loadMRRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔵 Loading MR requests with status:', approvalFilter);
      const data = await returnMRAPI.getMRRequests(approvalFilter);
      console.log('✅ MR requests loaded:', data);
      setMrRequests(data || []);
    } catch (error) {
      console.error('❌ Error loading MR requests:', error);
      setError(error.message || 'Failed to load MR requests');
      setMrRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: pass full request row as second arg so Index.jsx can read REQUEST_PERSON as CARRIER
  const handleSelectMR = (mrNo, requestRow) => {
    console.log('Selected MR:', mrNo, requestRow);
    onSelectMR(mrNo, requestRow);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    try {
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  const filteredRequests = mrRequests.filter(mr => {
    if (searchTerm === '') return true;
    const searchLower = searchTerm.toLowerCase();
    const mrNo = (mr.MR_NO || mr.mr_NO || '').toLowerCase();
    const person = (mr.REQUEST_PERSON || mr.request_PERSON || '').toLowerCase();
    const type = (mr.REQUEST_TYPE || mr.request_TYPE || '').toLowerCase();
    return mrNo.includes(searchLower) || 
           person.includes(searchLower) || 
           type.includes(searchLower);
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  const goToPage = (pageNumber) => setCurrentPage(pageNumber);
  const goToPrevious = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const goToNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="mr-request-list">
      <style jsx>{`
        .mr-request-list {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 24px;
        }
        .list-header { margin-bottom: 20px; }
        .list-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 12px;
        }
        .filter-section {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .filter-label { font-weight: 600; color: #374151; font-size: 14px; }
        .filter-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          min-width: 200px;
          background: white;
          cursor: pointer;
        }
        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .search-input {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          flex: 1;
          min-width: 200px;
        }
        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .entries-control {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
        }
        .entries-select {
          padding: 6px 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 14px;
        }
        .entries-info { color: #6b7280; font-size: 14px; font-weight: 500; }
        .mr-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        .mr-table thead { background: #10b981; }
        .mr-table th {
          padding: 12px 15px;
          text-align: left;
          font-weight: 700;
          color: white;
          font-size: 14px;
          border: 1px solid #059669;
        }
        .mr-table th:first-child { width: 100px; text-align: center; }
        .mr-table tbody tr { border-bottom: 1px solid #e5e7eb; transition: background 0.2s; }
        .mr-table tbody tr:hover { background: #f9fafb; }
        .mr-table tbody tr.selected { background: #dbeafe; }
        .mr-table td {
          padding: 12px 15px;
          color: #374151;
          font-size: 13px;
          border: 1px solid #e5e7eb;
        }
        .select-btn {
          width: 36px;
          height: 36px;
          background: #fbbf24;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .select-btn:hover {
          background: #f59e0b;
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(251, 191, 36, 0.4);
        }
        .select-btn:active { transform: scale(0.95); }
        .select-btn svg { width: 20px; height: 20px; fill: white; }
        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }
        .pagination-info { color: #6b7280; font-size: 14px; }
        .pagination { display: flex; gap: 6px; align-items: center; }
        .page-btn {
          min-width: 36px;
          height: 36px;
          padding: 0 12px;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .page-btn:hover:not(:disabled) { background: #f3f4f6; border-color: #9ca3af; }
        .page-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .page-btn.ellipsis { border: none; background: transparent; cursor: default; }
        .page-btn.ellipsis:hover { background: transparent; }
        .empty-state, .error-state { text-align: center; padding: 3rem; color: #9ca3af; }
        .error-state { color: #ef4444; }
        .error-icon, .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
        .retry-btn {
          margin-top: 1rem;
          padding: 8px 16px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .retry-btn:hover {
          background: #dc2626;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mr-table tbody tr { animation: fadeIn 0.3s ease-out; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mr-request-list { animation: slideDown 0.4s ease-out; }
      `}</style>

      <div className="list-header">
        <h3 className="list-title">Request List</h3>
        
        <div className="filter-section">
          <label className="filter-label">Approval Status:</label>
          <select
            className="filter-select"
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
          >
            <option value="Issued With Approval">Issued With Approval</option>
            <option value="Issued With Not Approval">Issued With Not Approval</option>
          </select>

          <div className="entries-control">
            <span>Show</span>
            <select
              className="entries-select"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>

          <input
            type="text"
            className="search-input"
            placeholder="Search by MR No, Person, or Type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <LoadingSpinner text="Loading requests..." size="large" variant="primary" />
        </div>
      ) : error ? (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button className="retry-btn" onClick={loadMRRequests}>
            🔄 Retry
          </button>
        </div>
      ) : filteredRequests.length > 0 ? (
        <>
          <table className="mr-table">
            <thead>
              <tr>
                <th>SELECT</th>
                <th>REQUEST NO</th>
                <th>REQUEST TYPE</th>
                <th>REQUEST DATE</th>
                <th>REQUEST PERSON</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {currentRequests.map((request, index) => {
                const mrNo         = request.MR_NO         || request.mr_NO         || '';
                const requestType  = request.REQUEST_TYPE  || request.request_TYPE  || '';
                const requestDate  = request.REQUEST_DATE  || request.request_DATE  || null;
                const requestPerson = request.REQUEST_PERSON || request.request_PERSON || '';
                const status       = request.STATUS        || request.status        || '';
                
                return (
                  <tr
                    key={mrNo || index}
                    className={selectedMRNo === mrNo ? 'selected' : ''}
                  >
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="select-btn"
                        // ✅ Pass full request row as second arg → Index.jsx reads REQUEST_PERSON as CARRIER
                        onClick={() => handleSelectMR(mrNo, request)}
                        title={`Select ${mrNo} for return`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>
                    </td>
                    <td><strong>{mrNo}</strong></td>
                    <td>{requestType}</td>
                    <td>{formatDate(requestDate)}</td>
                    <td>{requestPerson}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: status === 'Issued With Approval' ? '#dcfce7' : '#fee2e2',
                        color: status === 'Issued With Approval' ? '#166534' : '#991b1b'
                      }}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="pagination-container">
            <div className="pagination-info">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} entries
            </div>

            <div className="pagination">
              <button className="page-btn" onClick={goToPrevious} disabled={currentPage === 1}>
                Previous
              </button>

              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <button key={`ellipsis-${index}`} className="page-btn ellipsis" disabled>
                    ...
                  </button>
                ) : (
                  <button
                    key={page}
                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                )
              ))}

              <button className="page-btn" onClick={goToNext} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>No requests found</p>
          {searchTerm && (
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Try adjusting your search term
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MRRequestList;