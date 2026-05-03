import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { storeAPI, av4API } from '@/utils/api/storeView';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

const ItemsViewAV4 = ({ rackId, warehouseId, rackCode }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [outQuantity, setOutQuantity] = useState(0);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!rackId || !warehouseId || !rackCode) {
      if (!rackId) {
        setItems([]);
        setError(null);
      }
      return;
    }

    fetchRackItems();
  }, [rackId, warehouseId, rackCode]);

  const fetchRackItems = async (skipCache = false) => {
    if (!rackId || !warehouseId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (!rackId || !warehouseId) {
        setLoading(false);
        return;
      }
      
      // Force cache clear if skipCache is true
      if (skipCache) {
        console.log('Clearing cache and forcing fresh data fetch...');
        storeAPI.clearCache(rackId);
      }

      const itemsResponse = await storeAPI.getStoresByRackId(rackId);

      if (itemsResponse && Array.isArray(itemsResponse)) {
        console.log('Fetched items:', itemsResponse.length);
        setItems(itemsResponse);
      } else {
        setItems([]);
      }
      
    } catch (error) {
      console.error('Error fetching rack items:', error);
      setError('Failed to load rack details. Please try again.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getItemProperty = (item, propName) => {
    if (item[propName] !== undefined) return item[propName];
    const keys = Object.keys(item);
    const foundKey = keys.find(key => key.toLowerCase() === propName.toLowerCase());
    if (foundKey) return item[foundKey];
    return null;
  };

  const groupItemsByPosition = () => {
    const grouped = {};
    items.forEach(item => {
      const x = parseInt(getItemProperty(item, 'x') || 0);
      const y = parseInt(getItemProperty(item, 'y') || 0);
      const key = `${x + 1},${y + 1}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });
    return grouped;
  };

  const handleOutClick = (item) => {
    const availableQty = parseFloat(getItemProperty(item, 'available_QTY') || 0);
    const itemNumber = getItemProperty(item, 'item_NUMBER') || '';
    const x = parseInt(getItemProperty(item, 'x') || 0);
    const y = parseInt(getItemProperty(item, 'y') || 0);
    const itemId = getItemProperty(item, 'id') || getItemProperty(item, 'ID');

    setSelectedItem({
      id: itemId,
      itemNumber: itemNumber,
      availableQty: availableQty,
      x: x + 1,
      y: y + 1,
      rackCode: rackCode,
      fullItem: item
    });
    setOutQuantity(0);
    setShowModal(true);
  };

  const handleUpdateAV4 = async () => {
    if (!selectedItem || !outQuantity || outQuantity <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Quantity',
        text: 'Please enter a valid quantity',
        confirmButtonColor: '#fbbf24',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (outQuantity > selectedItem.availableQty) {
      Swal.fire({
        icon: 'error',
        title: 'Quantity Exceeded',
        text: 'Out quantity cannot exceed available quantity',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      setUpdating(true);

      const result = await av4API.updateAV4Out(selectedItem.id, outQuantity);

      if (result.success) {
        // Close modal first
        setShowModal(false);
        setSelectedItem(null);
        setOutQuantity(0);

        // Show success message
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          html: `
            <p>Available Quantity updated successfully!</p>
            <p style="margin-top: 10px; font-size: 14px; color: #6b7280;">
              <strong>New Available Qty:</strong> ${result.newAvailableQty?.toFixed(2) || 'N/A'}
            </p>
          `,
          confirmButtonColor: '#10b981',
          confirmButtonText: 'OK',
          timer: 3000,
          timerProgressBar: true
        });
        
        // Force refresh with cache clear
        console.log('Refreshing items after successful update...');
        await fetchRackItems(true); // skipCache = true
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: result.message || 'Failed to update quantity',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Error updating AV4:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'An error occurred while updating',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      });
    } finally {
      setUpdating(false);
    }
  };

  if (!rackId) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <div style={{ fontSize: '3.75rem', color: '#9ca3af', marginBottom: '1rem' }}>📦</div>
        <p style={{ color: '#6b7280' }}>Please select a rack to view items</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <LoadingSpinner text="Loading items..." size="large" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '2rem',
        background: '#fef2f2',
        borderRadius: '0.5rem'
      }}>
        <div style={{ fontSize: '1.875rem', color: '#ef4444', marginBottom: '0.5rem' }}>⚠️</div>
        <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
        <button 
          onClick={() => fetchRackItems(true)}
          style={{
            padding: '0.5rem 1rem',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const groupedItems = groupItemsByPosition();

  return (
    <div className="items-view-av4-container">
      <style>{`
        .items-view-av4-container {
          padding: 20px 0;
          animation: fadeInUp 0.6s ease-out;
        }
        
        .position-section {
          margin-bottom: 30px;
        }
        
        .position-header {
          background: #fbbf24;
          color: #000;
          padding: 8px 16px;
          font-weight: 700;
          font-size: 16px;
          border-radius: 6px 6px 0 0;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-radius: 0 0 6px 6px;
          overflow: hidden;
        }
        
        .items-table thead {
          background: #fbbf24;
        }
        
        .items-table th {
          padding: 12px 15px;
          text-align: left;
          font-weight: 700;
          color: #000;
          font-size: 14px;
          border-bottom: 2px solid #f59e0b;
        }
        
        .items-table tbody tr {
          border-bottom: 1px solid #e5e7eb;
          transition: background 0.2s;
        }
        
        .items-table tbody tr:hover {
          background: #f9fafb;
        }
        
        .items-table tbody tr:last-child {
          border-bottom: none;
        }
        
        .items-table td {
          padding: 15px;
          color: #374151;
          font-size: 13px;
        }
        
        .item-number {
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 3px;
        }
        
        .item-description {
          color: #6b7280;
          font-size: 12px;
          line-height: 1.4;
        }
        
        .item-price {
          color: #374151;
          font-size: 13px;
        }
        
        .item-qty {
          font-weight: 600;
          color: #1f2937;
        }
        
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }
        
        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 30px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideInUp 0.3s ease-out;
        }
        
        .modal-header {
          margin-bottom: 24px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 16px;
        }
        
        .modal-title {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }
        
        .modal-body {
          margin-bottom: 24px;
        }
        
        .info-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }
        
        .info-item {
          background: #f9fafb;
          padding: 12px;
          border-radius: 8px;
        }
        
        .info-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .info-value {
          font-size: 16px;
          color: #1f2937;
          font-weight: 700;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }
        
        .form-input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        
        .form-input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }
        
        .modal-footer {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 16px;
          border-top: 2px solid #e5e7eb;
        }
        
        
        .spinner {
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
          display: inline-block;
          margin-right: 8px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      {items.length > 0 ? (
        Object.keys(groupedItems).sort().map((position) => {
          const positionItems = groupedItems[position];
          
          return (
            <div key={position} className="position-section">
              <div className="position-header">
                ({position})
              </div>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Item No</th>
                    <th>Qty</th>
                    <th>AV4</th>
                  </tr>
                </thead>
                <tbody>
                  {positionItems.map((item, index) => {
                    const itemNumber = getItemProperty(item, 'item_NUMBER') || '';
                    const description = getItemProperty(item, 'description') || '';
                    const unitPrice = getItemProperty(item, 'unit_PRICE') || 0;
                    const availableQty = getItemProperty(item, 'available_QTY') || 0;
                    const uom = getItemProperty(item, 'uom') || '';
                    
                    return (
                      <tr key={index}>
                        <td>
                          <div className="item-number">{itemNumber}</div>
                          <div className="item-description">{description}</div>
                          <div className="item-price">
                            Unit Price Rs.{parseFloat(unitPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="item-qty">
                          {parseFloat(availableQty || 0).toFixed(2)} ({uom})
                        </td>
                        <td>
                          <button 
                            className="brand-btn-success"
                            onClick={() => handleOutClick(item)}
                          >
                            Out
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <p>No items found for this rack</p>
        </div>
      )}

      {showModal && selectedItem && (
        <div className="modal-overlay" onClick={() => !updating && setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">AV4 Form</h2>
            </div>
            
            <div className="modal-body">
              <div className="info-row">
                <div className="info-item">
                  <div className="info-label">Item</div>
                  <div className="info-value">{selectedItem.itemNumber}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Rack</div>
                  <div className="info-value">
                    {selectedItem.rackCode} ({selectedItem.x},{selectedItem.y})
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Available Qty</div>
                  <div className="info-value">{selectedItem.availableQty.toFixed(2)}</div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Enter AV4 Out Quantity:</label>
                <input
                  type="number"
                  className="form-input"
                  value={outQuantity}
                  onChange={(e) => setOutQuantity(parseFloat(e.target.value) || 0)}
                  min="0"
                  max={selectedItem.availableQty}
                  step="1"
                  disabled={updating}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="brand-btn-warning"
                onClick={handleUpdateAV4}
                disabled={updating || !outQuantity || outQuantity <= 0}
              >
                {updating && <span className="spinner"></span>}
                {updating ? 'Saving...' : 'Out'}
              </button>
              <button
                className="brand-btn-secondary"
                onClick={() => setShowModal(false)}
                disabled={updating}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsViewAV4;