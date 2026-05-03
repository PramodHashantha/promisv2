import React, { useState, useEffect } from 'react';

const PriceUpdateCell = ({ 
  items, 
  xPos, 
  yPos, 
  rackId,
  isAccountTeam,
  lastVerificationID,
  onUpdate,
  onVerify 
}) => {
  const [itemStates, setItemStates] = useState({});
  const [updating, setUpdating] = useState(false);

  // Helper function to get property with multiple possible names
  const getItemProperty = (item, ...propertyNames) => {
    for (const propName of propertyNames) {
      if (item[propName] !== undefined && item[propName] !== null) {
        return item[propName];
      }
      const keys = Object.keys(item);
      const foundKey = keys.find(key => key.toLowerCase() === propName.toLowerCase());
      if (foundKey && item[foundKey] !== undefined && item[foundKey] !== null) {
        return item[foundKey];
      }
    }
    return null;
  };

  useEffect(() => {
    // Initialize item states
    const initialStates = {};
    items.forEach(item => {
      console.log('Item data:', item);
      
      const id = getItemProperty(item, 'id', 'ID');
      const trnId = getItemProperty(item, 'trn_ID', 'TRN_ID', 'trnId');
      const unitPrice = getItemProperty(item, 'unit_PRICE', 'UNIT_PRICE', 'unitPrice') || 0;
      const verificationStatus = getItemProperty(item, 'verification_STATUS', 'VERIFICATION_STATUS', 'verificationStatus');
      const verificationPIDForPrice = getItemProperty(item, 'verification_P_ID_FOR_PRICE', 'VERIFICATION_P_ID_FOR_PRICE', 'verificationPIdForPrice');
      const unitPriceUpdateStatus = getItemProperty(item, 'unitpriceupdate_STATUS', 'UNITPRICEUPDATE_STATUS', 'unitPriceUpdateStatus');
      
      initialStates[id] = {
        originalPrice: parseFloat(unitPrice) || 0,
        updatedPrice: parseFloat(unitPrice) || 0,
        trnId: trnId,
        checked: false,
        disabled: false,
        rowColor: 'default'
      };

      // Determine row color based on status
      if (verificationPIDForPrice === lastVerificationID) {
        if (verificationStatus === 3 && (!unitPriceUpdateStatus || unitPriceUpdateStatus < 1)) {
          // Red: Verified but price not updated
          initialStates[id].rowColor = 'red';
          initialStates[id].disabled = true;
        } else if (verificationStatus === 3 && unitPriceUpdateStatus === 1) {
          // Yellow: Price updated, pending verification
          initialStates[id].rowColor = 'yellow';
        } else if (verificationStatus === 3 && unitPriceUpdateStatus === 3) {
          // Green: Price verified by account
          initialStates[id].rowColor = 'green';
          initialStates[id].disabled = true;
          initialStates[id].checked = true;
        }
      }

      if (verificationStatus !== 3) {
        // Light pink: Not verified
        initialStates[id].rowColor = 'lightPink';
        initialStates[id].disabled = true;
      }
    });
    setItemStates(initialStates);
  }, [items, lastVerificationID]);

  const handlePriceChange = (itemId, newPrice) => {
    const parsedPrice = newPrice === '' ? 0 : parseFloat(newPrice);
    
    setItemStates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        updatedPrice: parsedPrice
      }
    }));
  };

  const handleCheckboxChange = (itemId, checked) => {
    setItemStates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        checked: checked
      }
    }));
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const userPFNO = localStorage.getItem('userPFNO') || localStorage.getItem('userId') || '';
      
      if (!userPFNO) {
        alert('User ID not found. Please log in again.');
        setUpdating(false);
        return;
      }

      const changedItems = items.filter(item => {
        const id = getItemProperty(item, 'id', 'ID');
        const state = itemStates[id];
        return state && parseFloat(state.updatedPrice) !== parseFloat(state.originalPrice);
      }).map(item => {
        const id = getItemProperty(item, 'id', 'ID');
        const state = itemStates[id];
        
        return {
          ID: id,
          TRN_ID: state.trnId,
          UNIT_PRICE: parseFloat(state.updatedPrice),
          UnitPrice_ModifiedBy: userPFNO
        };
      });

      if (changedItems.length === 0) {
        alert('No changes to update');
        setUpdating(false);
        return;
      }

      console.log('📤 Sending price update data:', changedItems);

      await onUpdate(changedItems);
      
      // Update the item states to reflect saved changes
      const newStates = { ...itemStates };
      changedItems.forEach(item => {
        if (newStates[item.ID]) {
          newStates[item.ID].originalPrice = item.UNIT_PRICE;
          newStates[item.ID].rowColor = 'yellow'; // Price updated, pending verification
        }
      });
      setItemStates(newStates);
      
    } catch (error) {
      console.error('Error updating prices:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleVerify = async () => {
    setUpdating(true);
    try {
      const userPFNO = localStorage.getItem('userPFNO') || localStorage.getItem('userId') || '';
      
      if (!userPFNO) {
        alert('User ID not found. Please log in again.');
        setUpdating(false);
        return;
      }

      const itemsToVerify = items.filter(item => {
        const id = getItemProperty(item, 'id', 'ID');
        const state = itemStates[id];
        return state && state.checked;
      }).map(item => {
        const id = getItemProperty(item, 'id', 'ID');
        const state = itemStates[id];
        const unitPrice = getItemProperty(item, 'unit_PRICE', 'UNIT_PRICE', 'unitPrice') || 0;
        
        return {
          ID: id,
          TRN_ID: state.trnId,
          UNIT_PRICE: parseFloat(unitPrice),
          UnitPrice_ModifiedBy: userPFNO,
          UNITPRICEUPDATE_STATUS: 3
        };
      });

      if (itemsToVerify.length === 0) {
        alert('No items selected for verification');
        setUpdating(false);
        return;
      }

      console.log('📤 Sending verify data:', itemsToVerify);

      await onVerify(itemsToVerify);
      
      // Update the item states to reflect verified changes
      const newStates = { ...itemStates };
      itemsToVerify.forEach(item => {
        if (newStates[item.ID]) {
          newStates[item.ID].disabled = true;
          newStates[item.ID].checked = true;
          newStates[item.ID].rowColor = 'green'; // Verified
        }
      });
      setItemStates(newStates);
      
    } catch (error) {
      console.error('Error verifying prices:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getRowBackgroundColor = (rowColor) => {
    switch(rowColor) {
      case 'red':
        return '#ffa8a8'; // Pastel Red / Light Coral
      case 'yellow':
        return '#f8ffa8'; // Yellow
      case 'green':
        return '#a8ffaf'; // Mint Green / Pale Green
      case 'lightPink':
        return '#ffc4c4'; // Light Pink / Very Pale Red
      default:
        return 'transparent';
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="price-update-cell">
      <style jsx>{`
        .price-update-cell {
          margin-bottom: 20px;
        }

        .cell-header {
          background: #fbbf24;
          color: #000;
          padding: 8px 12px;
          font-weight: 700;
          font-size: 14px;
          border-radius: 6px 6px 0 0;
        }

        .cell-table {
          width: 100%;
          max-width: 800px;
          border-collapse: collapse;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 12px;
        }

        .cell-table thead {
          background: #28a745;
        }

        .cell-table th {
          padding: 10px 12px;
          text-align: center;
          font-weight: 700;
          color: white;
          font-size: 13px;
          border: 1px solid #ddd;
        }

        .cell-table td {
          padding: 12px;
          font-size: 13px;
          color: #374151;
          border: 1px solid #ddd;
          text-align: center;
        }

        .item-info {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
          text-align: left;
        }

        .qty-text {
          color: red;
          font-weight: bold;
        }

        .price-text {
          color: red;
          font-weight: bold;
        }

        .price-input {
          width: 80%;
          padding: 6px 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 13px;
        }

        .price-input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .checkbox-label {
          position: relative;
          display: inline-block;
          width: 30px;
          height: 30px;
          cursor: pointer;
        }

        .checkbox-input {
          display: none;
        }

        .checkbox-span {
          position: relative;
          display: inline-block;
          width: 30px;
          height: 30px;
          background-color: #ccc;
          border-radius: 50%;
          transition: 0.4s;
        }

        .checkbox-input:checked + .checkbox-span {
          background-color: #005711;
        }

        .checkbox-input:disabled + .checkbox-span {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 8px 0;
        }

        .spinner {
          border: 2px solid transparent;
          border-top-color: white;
          border-radius: 50%;
          width: 14px;
          height: 14px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <h5 className="cell-header">
        Position ({xPos + 1}, {yPos + 1})
      </h5>

      <table className="cell-table">
        <thead>
          <tr>
            <th style={{ width: '40%' }}>Item No</th>
            <th style={{ width: '30%' }}>Unit Price</th>
            {!isAccountTeam && <th style={{ width: '30%' }}>Verified Unit Price</th>}
            {isAccountTeam && <th style={{ width: '30%' }}>Check</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const id = getItemProperty(item, 'id', 'ID');
            const state = itemStates[id] || {};
            const itemNumber = getItemProperty(item, 'item_NUMBER', 'ITEM_NUMBER', 'itemNumber');
            const description = getItemProperty(item, 'description', 'DESCRIPTION');
            const availableQty = getItemProperty(item, 'available_QTY', 'AVAILABLE_QTY', 'availableQty') || 0;
            const uom = getItemProperty(item, 'uom', 'UOM');

            return (
              <tr key={id} style={{ backgroundColor: getRowBackgroundColor(state.rowColor) }}>
                <td style={{ textAlign: 'left' }}>
                  <div><strong>{itemNumber}</strong></div>
                  <div className="item-info">{description}</div>
                  <div className="item-info qty-text">
                    Qty: {parseFloat(availableQty).toFixed(2)}
                  </div>
                </td>
                <td>
                  <span className="price-text">{parseFloat(state.originalPrice || 0).toFixed(2)}</span>
                </td>
                {!isAccountTeam && (
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="price-input"
                      value={state.updatedPrice !== undefined ? state.updatedPrice : 0}
                      disabled={state.disabled}
                      onChange={(e) => handlePriceChange(id, e.target.value)}
                    />
                  </td>
                )}
                {isAccountTeam && (
                  <td>
                    <div className="checkbox-container">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          className="checkbox-input"
                          checked={state.checked || false}
                          disabled={state.disabled}
                          onChange={(e) => handleCheckboxChange(id, e.target.checked)}
                        />
                        <span className="checkbox-span"></span>
                      </label>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="action-buttons">
        {!isAccountTeam ? (
          <button
            className="brand-btn-success"
            onClick={handleUpdate}
            disabled={updating}
          >
            {updating && <div className="spinner"></div>}
            <span>{updating ? 'Updating...' : 'Update'}</span>
          </button>
        ) : (
          <button
            className="brand-btn-success"
            onClick={handleVerify}
            disabled={updating}
          >
            {updating && <div className="spinner"></div>}
            <span>{updating ? 'Verifying...' : 'Verify'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PriceUpdateCell;