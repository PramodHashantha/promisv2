import React, { useState, useEffect } from 'react';
import { labStoreAPI } from '../../../utils/api/labStore';

const CurrentStock = ({ onSelectItem, refresh }) => {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadStocks();
  }, [refresh]);

  useEffect(() => {
    filterStocks();
  }, [searchTerm, stocks]);

  const getProperty = (obj, ...keys) => {
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return obj[key];
      }
    }
    return '';
  };

  const loadStocks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching lab stores...');
      const data = await labStoreAPI.getAllLabStores();
      console.log('Raw data received:', data);
      
      if (!data) {
        setStocks([]);
        setFilteredStocks([]);
        return;
      }

      const nonZeroStocks = (Array.isArray(data) ? data : []).filter(item => {
        const bal = getProperty(item, 'BAL', 'bal', 'Bal');
        return parseFloat(bal || 0) > 0;
      });
      
      setStocks(nonZeroStocks);
      setFilteredStocks(nonZeroStocks);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading stocks:', error);
      setError('Failed to load stocks. Please try again.');
      setStocks([]);
      setFilteredStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const filterStocks = () => {
    if (!searchTerm) {
      setFilteredStocks(stocks);
      setCurrentPage(1);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = stocks.filter(stock => {
      const refId = getProperty(stock, 'REF_ID', 'reF_ID', 'ref_ID', 'refId').toString().toLowerCase();
      const itemNo = getProperty(stock, 'ITEM_NO', 'iteM_NO', 'item_NO', 'itemNo').toString().toLowerCase();
      const itemName = getProperty(stock, 'ITEM_NAME', 'iteM_NAME', 'item_NAME', 'itemName').toString().toLowerCase();
      
      return refId.includes(term) || itemNo.includes(term) || itemName.includes(term);
    });
    
    setFilteredStocks(filtered);
    setCurrentPage(1);
  };

  const handleSelectItem = (stock) => {
    if (onSelectItem) {
      const normalizedStock = {
        REF_ID: getProperty(stock, 'REF_ID', 'reF_ID', 'ref_ID', 'refId'),
        ITEM_NO: getProperty(stock, 'ITEM_NO', 'iteM_NO', 'item_NO', 'itemNo'),
        ITEM_NUMBER: getProperty(stock, 'ITEM_NO', 'iteM_NO', 'item_NO', 'itemNo'),
        ITEM_NAME: getProperty(stock, 'ITEM_NAME', 'iteM_NAME', 'item_NAME', 'itemName'),
        UMO_NAME: getProperty(stock, 'UMO_NAME', 'umO_NAME', 'umo_NAME', 'umoName'),
        BAL: parseFloat(getProperty(stock, 'BAL', 'bal', 'Bal') || 0)
      };
      
      console.log('Selected stock for edit:', normalizedStock);
      onSelectItem(normalizedStock);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStocks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);

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
        <button className="retry-btn" onClick={loadStocks}>Retry</button>
      </div>
    );
  }

  return (
    <div className="current-stock-card">
      <style jsx>{`
        .current-stock-card {
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
        .stock-table {
          width: 100%;
          border-collapse: collapse;
        }
        .stock-table thead {
          background: #f3f4f6;
        }
        .stock-table th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          white-space: nowrap;
        }
        .stock-table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          color: #4b5563;
        }
        .stock-table tbody tr {
          transition: background 0.2s;
        }
        .stock-table tbody tr:hover {
          background: #f9fafb;
        }
        .btn-select {
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
        .btn-select:hover {
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
      `}</style>

      <div className="card-header">Current Stock Details</div>

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
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {currentItems.length > 0 ? (
        <>
          <div className="table-container">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>REF</th>
                  <th>Item</th>
                  <th>Item Name</th>
                  <th>UOM</th>
                  <th>Bal QTY</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((stock, index) => {
                  const refId = getProperty(stock, 'REF_ID', 'reF_ID', 'ref_ID', 'refId');
                  const itemNo = getProperty(stock, 'ITEM_NO', 'iteM_NO', 'item_NO', 'itemNo');
                  const itemName = getProperty(stock, 'ITEM_NAME', 'iteM_NAME', 'item_NAME', 'itemName');
                  const uomName = getProperty(stock, 'UMO_NAME', 'umO_NAME', 'umo_NAME', 'umoName');
                  const bal = getProperty(stock, 'BAL', 'bal', 'Bal');

                  return (
                    <tr key={index}>
                      <td>
                        <button className="btn-select" onClick={() => handleSelectItem(stock)}>
                          ✏️ Edit
                        </button>
                      </td>
                      <td>{refId}</td>
                      <td>{itemNo}</td>
                      <td>{itemName}</td>
                      <td>{uomName}</td>
                      <td>{parseFloat(bal || 0).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pagination-container">
            <div className="showing-info">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStocks.length)} of {filteredStocks.length} entries
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
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <p>{searchTerm ? 'No items found matching your search' : 'No stock available'}</p>
        </div>
      )}
    </div>
  );
};

export default CurrentStock;