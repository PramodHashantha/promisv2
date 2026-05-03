import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { labStoreAPI } from '../../../utils/api/labStore';

const StockOut = ({ selectedItem, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    item: '',
    itemName: '',
    ref: '',
    qty: '',
    requestedBy: ''
  });
  const [refDetails, setRefDetails] = useState([]);
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [maxQty, setMaxQty] = useState(0);

  useEffect(() => {
    if (selectedItem) {
      loadItemDetails();
    }
  }, [selectedItem]);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const loadItemDetails = async () => {
    try {
      if (!selectedItem) {
        console.log('No selected item');
        return;
      }

      console.log('Selected item received in StockOut:', selectedItem);
      
      const itemNo = selectedItem.ITEM_NO || selectedItem.ITEM_NUMBER || selectedItem.iteM_NO || selectedItem.iteM_NUMBER;
      const refId = selectedItem.REF_ID || selectedItem.reF_ID;
      const itemName = selectedItem.ITEM_NAME || selectedItem.iteM_NAME || selectedItem.item_NAME || '';
      const bal = selectedItem.BAL || selectedItem.bal || 0;

      console.log('Parsed values:', { itemNo, refId, itemName, bal });

      setFormData({
        item: itemNo || '',
        itemName: itemName || '',
        ref: refId || '',
        qty: bal.toString(),
        requestedBy: ''
      });
      setMaxQty(bal);

      if (!itemNo) {
        console.log('No item number available');
        return;
      }

      try {
        console.log('Loading REFs for item:', itemNo);
        const refs = await labStoreAPI.getRefsByItem(itemNo);
        
        if (refs && refs.length > 0) {
          console.log('Loaded REFs:', refs);
          
          const normalizedRefs = refs.map(ref => ({
            REF_ID: ref.REF_ID || ref.reF_ID,
            BAL: parseFloat(ref.BAL || ref.bal || 0),
            IN_QTY: parseFloat(ref.IN_QTY || ref.iN_QTY || 0),
            UMO_ID: ref.UMO_ID || ref.umO_ID || 0,
            ITEM_NO: ref.ITEM_NO || ref.iteM_NO
          }));
          
          setRefDetails(normalizedRefs);
          
          const totalAvailable = normalizedRefs.reduce((sum, ref) => sum + ref.BAL, 0);
          setMaxQty(totalAvailable);
          
          console.log(`Total available quantity: ${totalAvailable}`);
        }
      } catch (refError) {
        console.error('Error loading REFs:', refError);
      }
      
    } catch (error) {
      console.error('Error in loadItemDetails:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Load Failed',
        text: 'Failed to load item details: ' + error.message,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      });
    }
  };

  const searchUsers = async (searchText) => {
    if (!searchText || searchText.length < 1) {
      setUserSuggestions([]);
      return;
    }

    try {
      const results = await labStoreAPI.searchUsers(searchText);
      setUserSuggestions(results || []);
      setShowUserSuggestions(true);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const debouncedSearchUsers = debounce(searchUsers, 300);

  const handleUserChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, requestedBy: value });
    debouncedSearchUsers(value);
  };

  const selectUser = (selectedUser) => {
    setFormData({ ...formData, requestedBy: selectedUser });
    setShowUserSuggestions(false);
  };

  const validateQuantity = async () => {
    const qty = parseFloat(formData.qty);
    if (qty > maxQty) {
      await Swal.fire({
        icon: 'error',
        title: 'Quantity Exceeded',
        text: 'Available Quantity exceeded, Try Again!',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      });
      setFormData({ ...formData, qty: maxQty.toString() });
      return false;
    }
    return true;
  };

  const calculateDistribution = (totalQty) => {
    const distribution = [];
    let remainingQty = totalQty;
    
    const sortedRefs = [...refDetails].sort((a, b) => a.BAL - b.BAL);

    for (let i = 0; i < sortedRefs.length && remainingQty > 0; i++) {
      const ref = sortedRefs[i];
      const qtyToTake = Math.min(ref.BAL, remainingQty);
      
      if (qtyToTake > 0) {
        distribution.push({
          REF_ID: ref.REF_ID,
          ITEM_ID: ref.ITEM_NO,
          QTY: qtyToTake,
          UOM: ref.UMO_ID,
          OUT_QTY: qtyToTake,
          REQUESTED_BY: formData.requestedBy.split('-')[0].trim()
        });
        
        remainingQty -= qtyToTake;
      }
    }

    return distribution;
  };

  const handleSubmit = async () => {
    if (!formData.qty || !formData.requestedBy) {
      await Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Quantity or Requested By Cannot be null, Try Again!',
        confirmButtonColor: '#fbbf24',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!(await validateQuantity())) {
      return;
    }

    try {
      setLoading(true);

      const requestedQty = parseFloat(formData.qty);
      const distribution = calculateDistribution(requestedQty);

      if (distribution.length === 0) {
        await Swal.fire({
          icon: 'error',
          title: 'No Stock Available',
          text: 'Unable to process stock out. No available stock.',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK'
        });
        return;
      }

      const stockOutData = {
        ITEM_ID: formData.item,
        OUT_QTY: requestedQty,
        REQUESTED_BY: formData.requestedBy.split('-')[0].trim(),
        Items: distribution
      };

      console.log('Submitting stock out:', stockOutData);

      await labStoreAPI.stockOut(stockOutData);

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Stock out successful!',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'OK',
        timer: 2000,
        timerProgressBar: true
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error('Error in stock out:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Stock Out Failed',
        text: error.message || 'Failed to process stock out',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stock-out-card">
      <style jsx>{`
        .stock-out-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .card-header {
          background: coral;
          color: white;
          padding: 16px;
          margin: -24px -24px 24px -24px;
          border-radius: 12px 12px 0 0;
          font-size: 20px;
          font-weight: 700;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .btn-back {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid white;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-back:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .form-group {
          margin-bottom: 20px;
          position: relative;
        }
        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
        }
        .form-control {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        .form-control:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .form-control:read-only {
          background: #f3f4f6;
          cursor: not-allowed;
        }
        .suggestions-list {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          max-height: 200px;
          overflow-y: auto;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          margin-top: 4px;
        }
        .suggestion-item {
          padding: 10px 12px;
          cursor: pointer;
          transition: background 0.2s;
          color: #1f2937;
        }
        .suggestion-item:hover {
          background: #f3f4f6;
        }
        .row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .ref-table-container {
          margin: 24px 0;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        .ref-table {
          width: 100%;
          border-collapse: collapse;
        }
        .ref-table thead {
          background: #f3f4f6;
        }
        .ref-table th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }
        .ref-table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          color: #4b5563;
        }
        .ref-table tbody tr:hover {
          background: #f9fafb;
        }
        .button-container {
          display: flex;
          justify-content: flex-end;
          margin-top: 24px;
        }
        .btn-save {
          padding: 12px 24px;
          background: #fbbf24;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-save:hover:not(:disabled) {
          background: #f59e0b;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
        }
        .btn-save:disabled {
          background: #d1d5db;
          cursor: not-allowed;
          opacity: 0.6;
        }
        .spinner {
          border: 2px solid transparent;
          border-top-color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="card-header">
        <span>Stock Out</span>
        <button className="btn-back" onClick={onBack}>
          ← Back to Stock In
        </button>
      </div>

      <div className="row">
        <div className="form-group">
          <label className="form-label">Item:</label>
          <input
            type="text"
            className="form-control"
            value={formData.item}
            readOnly
          />
        </div>

        <div className="form-group">
          <label className="form-label">Item Name:</label>
          <input
            type="text"
            className="form-control"
            value={formData.itemName}
            readOnly
          />
        </div>
      </div>

      <div className="row">
        <div className="form-group">
          <label className="form-label">Qty:</label>
          <input
            type="number"
            className="form-control"
            value={formData.qty}
            onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
            onBlur={validateQuantity}
            step="1"
            max={maxQty}
          />
        </div>

        <div className="form-group">
          <label className="form-label">REF:</label>
          <input
            type="text"
            className="form-control"
            value={formData.ref}
            readOnly
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Request By:</label>
        <input
          type="text"
          className="form-control"
          value={formData.requestedBy}
          onChange={handleUserChange}
          onBlur={() => setTimeout(() => setShowUserSuggestions(false), 200)}
          placeholder="Search user..."
        />
        {showUserSuggestions && userSuggestions.length > 0 && (
          <div className="suggestions-list">
            {userSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => selectUser(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {refDetails.length > 0 && (
        <div className="ref-table-container">
          <table className="ref-table">
            <thead>
              <tr>
                <th>REF</th>
                <th>Available Quantity</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {refDetails.map((ref, index) => (
                <tr key={index}>
                  <td>{ref.REF_ID}</td>
                  <td>{ref.BAL} / {ref.IN_QTY}</td>
                  <td>{ref.BAL}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="button-container">
        <button
          className="btn-save"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading && <div className="spinner"></div>}
          💾 Stock Out
        </button>
      </div>
    </div>
  );
};

export default StockOut;