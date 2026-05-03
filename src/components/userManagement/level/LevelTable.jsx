import React, { useState, useEffect } from 'react';
import { levelAPI } from '../../../utils/api/level';

const LevelTable = ({ onSelectLevel, refresh }) => {
  const [levels, setLevels] = useState([]);
  const [filteredLevels, setFilteredLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadLevels();
  }, [refresh]);

  useEffect(() => {
    filterLevels();
  }, [searchTerm, levels]);

  const getProperty = (obj, ...keys) => {
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return obj[key];
      }
    }
    return 0;
  };

  const loadLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching levels...');
      const data = await levelAPI.getAllLevels();
      console.log('Raw data received:', data);
      
      if (!data) {
        setLevels([]);
        setFilteredLevels([]);
        return;
      }

      const levelsList = Array.isArray(data) ? data : [];
      console.log('Processed levels:', levelsList);
      setLevels(levelsList);
      setFilteredLevels(levelsList);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading levels:', error);
      setError('Failed to load levels. Please try again.');
      setLevels([]);
      setFilteredLevels([]);
    } finally {
      setLoading(false);
    }
  };

  const filterLevels = () => {
    if (!searchTerm) {
      setFilteredLevels(levels);
      setCurrentPage(1);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = levels.filter(level => {
      const levelId = getProperty(level, 'LEVEL_ID', 'level_ID', 'levelId').toString().toLowerCase();
      return levelId.includes(term);
    });
    
    setFilteredLevels(filtered);
    setCurrentPage(1);
  };

  const handleSelectLevel = (level) => {
    if (onSelectLevel) {
      console.log('Selected level for edit:', level);
      onSelectLevel(level);
      // Scroll to form
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLevels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLevels.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="loading-container">
        <style jsx>{`
          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 3rem;
            background: white;
            border-radius: 12px;
          }
          .spinner {
            border: 3px solid #f3f4f6;
            border-top-color: #3b82f6;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <style jsx>{`
          .error-container {
            padding: 2rem;
            text-align: center;
            background: #fef2f2;
            border-radius: 12px;
            color: #dc2626;
          }
          .retry-btn {
            margin-top: 1rem;
            padding: 8px 16px;
            background: #dc2626;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }
          .retry-btn:hover {
            background: #b91c1c;
          }
        `}</style>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
        <p>{error}</p>
        <button className="retry-btn" onClick={loadLevels}>Retry</button>
      </div>
    );
  }

  return (
    <div className="level-table-card">
      <style jsx>{`
        .level-table-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .card-header {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e5e7eb;
        }
        .controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 16px;
        }
        .show-entries {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6b7280;
        }
        .entries-select {
          padding: 6px 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }
        .search-container {
          flex: 1;
          max-width: 300px;
        }
        .search-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }
        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .table-container {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          margin-bottom: 20px;
        }
        .level-table {
          width: 100%;
          border-collapse: collapse;
        }
        .level-table thead {
          background: #f3f4f6;
        }
        .level-table th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          white-space: nowrap;
        }
        .level-table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          color: #4b5563;
        }
        .level-table tbody tr {
          transition: background 0.2s;
        }
        .level-table tbody tr:hover {
          background: #f9fafb;
        }
        .btn-edit {
          padding: 6px 12px;
          background: #fbbf24;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .btn-edit:hover {
          background: #f59e0b;
          transform: translateY(-1px);
        }
        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }
        .showing-info {
          font-size: 14px;
          color: #6b7280;
        }
        .pagination {
          display: flex;
          gap: 4px;
        }
        .page-btn {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        .page-btn:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #9ca3af;
        }
        .page-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #9ca3af;
        }
        .amount {
          text-align: right;
        }
      `}</style>

      <div className="card-header">Appointment Level Management Details</div>

      <div className="controls-row">
        <div className="show-entries">
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

        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search by Level ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {currentItems.length > 0 ? (
        <>
          <div className="table-container">
            <table className="level-table">
              <thead>
                <tr>
                  <th>Edit</th>
                  <th>Level ID</th>
                  <th>Works Total Monthly Limit</th>
                  <th>Works Quotation Limit</th>
                  <th>Service & Goods Total Monthly Limit</th>
                  <th>Service & Goods Quotation Limit</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((level, index) => {
                  const levelId = getProperty(level, 'LEVEL_ID', 'level_ID', 'levelId');
                  const worksTotalMonthly = getProperty(level, 'WORKS_TOTAL_MONTHLY_LIMIT', 'works_TOTAL_MONTHLY_LIMIT', 'worksTotalMonthlyLimit');
                  const worksQuotation = getProperty(level, 'WORKS_QUOTATION_LIMIT', 'works_QUOTATION_LIMIT', 'worksQuotationLimit');
                  const serviceAndGoodsTotalMonthly = getProperty(level, 'SERVICE_AND_GOODS_TOTAL_MONTHLY_LIMIT', 'service_AND_GOODS_TOTAL_MONTHLY_LIMIT', 'serviceAndGoodsTotalMonthlyLimit');
                  const serviceAndGoodsQuotation = getProperty(level, 'SERVICE_AND_GOODS_QUOTATION_LIMIT', 'service_AND_GOODS_QUOTATION_LIMIT', 'serviceAndGoodsQuotationLimit');

                  return (
                    <tr key={index}>
                      <td>
                        <button className="btn-edit" onClick={() => handleSelectLevel(level)}>
                          ✏️ Edit
                        </button>
                      </td>
                      <td>{levelId}</td>
                      <td className="amount">{parseFloat(worksTotalMonthly || 0).toFixed(2)}</td>
                      <td className="amount">{parseFloat(worksQuotation || 0).toFixed(2)}</td>
                      <td className="amount">{parseFloat(serviceAndGoodsTotalMonthly || 0).toFixed(2)}</td>
                      <td className="amount">{parseFloat(serviceAndGoodsQuotation || 0).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pagination-container">
            <div className="showing-info">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLevels.length)} of {filteredLevels.length} entries
            </div>
            
            <div className="pagination">
              <button 
                className="page-btn" 
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      className={`page-btn ${currentPage === pageNumber ? 'active' : ''}`}
                      onClick={() => paginate(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                  return <span key={pageNumber} style={{ padding: '0 4px' }}>...</span>;
                }
                return null;
              })}
              
              <button 
                className="page-btn" 
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <p>{searchTerm ? 'No levels found matching your search' : 'No levels available'}</p>
        </div>
      )}
    </div>
  );
};

export default LevelTable;