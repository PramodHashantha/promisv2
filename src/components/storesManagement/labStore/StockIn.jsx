import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { labStoreAPI } from '../../../utils/api/labStore';

const StockIn = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    item: '',
    itemName: '',
    ref: '',
    qty: '',
    uom: ''
  });
  const [itemSuggestions, setItemSuggestions] = useState([]);
  const [showItemSuggestions, setShowItemSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [itemDetails, setItemDetails] = useState(null);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const searchItems = async (searchText) => {
    if (!searchText || searchText.length < 1) {
      setItemSuggestions([]);
      return;
    }

    try {
      const results = await labStoreAPI.searchItems(searchText);
      setItemSuggestions(results || []);
      setShowItemSuggestions(true);
    } catch (error) {
      console.error('Error searching items:', error);
    }
  };

  const debouncedSearchItems = debounce(searchItems, 300);

  const handleItemChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, item: value, itemName: '', uom: '' });
    setItemDetails(null);
    debouncedSearchItems(value);
  };

  const selectItem = async (selectedItem) => {
    const itemNumber = selectedItem.split('-')[0].trim();
    setFormData({ ...formData, item: selectedItem });
    setShowItemSuggestions(false);
    
    await loadItemDetails(itemNumber);
  };

  const loadItemDetails = async (itemNumber) => {
    try {
      console.log('=== Loading item details for:', itemNumber);
      const details = await labStoreAPI.getItemDetails(itemNumber);
      
      if (!details) {
        console.log('No item found');
        await Swal.fire({
          icon: 'warning',
          title: 'Item Not Found',
          text: 'Item not found in the system.',
          confirmButtonColor: '#fbbf24',
          confirmButtonText: 'OK'
        });
        return;
      }

      console.log('Item details received:', details);
      
      const itemNum = details.ITEM_NUMBER || details.item_NUMBER || details.itemNumber || itemNumber;
      const description = details.DESCRIPTION || details.description || '';
      let uomName = details.UMO_NAME || details.umo_NAME || details.umoName || '';
      let uomId = details.UOM_ID || details.uom_ID || details.uomId || 0;
      
      console.log('Parsed from item master:', { itemNum, description, uomName, uomId });
      
      if (!uomId || uomId === 0 || !uomName || uomName === '') {
        console.log('⚠️ UOM missing in item master, checking existing lab stores...');
        
        try {
          const existingUom = await labStoreAPI.checkUom(itemNum);
          console.log('Existing UOM check result:', existingUom);
          
          if (existingUom) {
            const existingUomId = existingUom.UOM_ID || existingUom.uom_ID || 0;
            const existingUomName = existingUom.UMO_NAME || existingUom.umo_NAME || existingUom.umoName || '';
            
            if (existingUomId > 0) {
              console.log('✅ Found UOM from lab stores:', { existingUomId, existingUomName });
              
              uomId = existingUomId;
              uomName = existingUomName || `UOM ID: ${existingUomId}`;
              
              setFormData(prev => ({
                ...prev,
                itemName: description,
                uom: uomName
              }));

              setItemDetails({
                itemNumber: itemNum,
                uomId: uomId,
                description: description,
                uomName: uomName
              });
              
              console.log('Successfully loaded UOM from lab stores');
              return;
            }
          }
        } catch (uomError) {
          console.log('No existing UOM found in lab stores:', uomError);
        }
        
        console.log('❌ ERROR: No UOM found anywhere for this item');
        await Swal.fire({
          icon: 'error',
          title: 'UOM Missing',
          text: 'Item details loaded but UOM is missing. Please contact administrator.',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK'
        });
        setFormData(prev => ({
          ...prev,
          itemName: description,
          uom: 'UOM Missing - Contact Admin'
        }));
        setItemDetails(null);
        return;
      }
      
      console.log('✅ UOM found in item master:', { uomId, uomName });
      setFormData(prev => ({
        ...prev,
        itemName: description,
        uom: uomName
      }));

      setItemDetails({
        itemNumber: itemNum,
        uomId: uomId,
        description: description,
        uomName: uomName
      });
      
      console.log('Successfully loaded item details with UOM from master');
    } catch (error) {
      console.error('Error loading item details:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Load Failed',
        text: 'Failed to load item details: ' + error.message,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.item || !formData.qty || !formData.ref) {
      await Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Item, Quantity, and REF cannot be null. Try Again!',
        confirmButtonColor: '#fbbf24',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!itemDetails || !itemDetails.uomId || itemDetails.uomId === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Invalid Item',
        text: 'Please select a valid item with UOM.',
        confirmButtonColor: '#fbbf24',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      setLoading(true);

      const refCheck = await labStoreAPI.checkRefAvailability(formData.ref);
      console.log('REF check result:', refCheck);
      
      if (refCheck && refCheck.isAvailable) {
        await Swal.fire({
          icon: 'error',
          title: 'REF Already Exists',
          text: 'REF ID already exists! Try Again.',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK'
        });
        setFormData({ ...formData, ref: '' });
        return;
      }

      const stockInData = {
        REF_ID: formData.ref,
        ITEM_ID: itemDetails.itemNumber,
        QTY: parseFloat(formData.qty),
        UOM: parseInt(itemDetails.uomId)
      };

      console.log('Submitting stock in:', stockInData);

      await labStoreAPI.stockIn(stockInData);

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Stock in successful!',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'OK',
        timer: 2000,
        timerProgressBar: true
      });
      
      setFormData({
        item: '',
        itemName: '',
        ref: '',
        qty: '',
        uom: ''
      });
      setItemDetails(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error in stock in:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Stock In Failed',
        text: error.message || 'Failed to process stock in',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stock-in-card">
      <style jsx>{`
        .stock-in-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .card-header {
          background: darkcyan;
          color: white;
          padding: 16px;
          margin: -24px -24px 24px -24px;
          border-radius: 12px 12px 0 0;
          font-size: 20px;
          font-weight: 700;
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
        .uom-label {
          padding: 10px 12px;
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 6px;
          color: #92400e;
          font-weight: 600;
        }
        .uom-label.error {
          background: #fee2e2;
          border: 1px solid #ef4444;
          color: #991b1b;
        }
        .row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        @media (max-width: 768px) {
          .row {
            grid-template-columns: 1fr;
          }
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

      <div className="card-header">Stock In</div>

      <div className="row">
        <div className="form-group">
          <label className="form-label">Item: *</label>
          <input
            type="text"
            className="form-control"
            value={formData.item}
            onChange={handleItemChange}
            onBlur={() => setTimeout(() => setShowItemSuggestions(false), 200)}
            placeholder="Search item..."
            autoComplete="off"
          />
          {showItemSuggestions && itemSuggestions.length > 0 && (
            <div className="suggestions-list">
              {itemSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => selectItem(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Item Name:</label>
          <input
            type="text"
            className="form-control"
            value={formData.itemName}
            readOnly
            placeholder="Item name will appear here"
          />
        </div>
      </div>

      <div className="row">
        <div className="form-group">
          <label className="form-label">REF: *</label>
          <input
            type="text"
            className="form-control"
            value={formData.ref}
            onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
            placeholder="Enter REF..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">UOM:</label>
          <div className={`uom-label ${!itemDetails || !itemDetails.uomId ? 'error' : ''}`}>
            {formData.uom || 'Select an item first'}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="form-group">
          <label className="form-label">Qty: *</label>
          <input
            type="number"
            className="form-control"
            value={formData.qty}
            onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
            placeholder="Enter quantity..."
            step="1"
            min="1"
          />
        </div>
      </div>

      <div className="button-container">
        <button
          className="btn-save"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading && <div className="spinner"></div>}
          <span>💾 Stock In</span>
        </button>
      </div>
    </div>
  );
};

export default StockIn;