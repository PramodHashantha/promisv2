import React, { useState, useEffect } from 'react';

const VerificationCell = ({ 
  items, 
  xPos, 
  yPos, 
  rackId,
  isStorekeeper,
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
      // Also check case-insensitive
      const keys = Object.keys(item);
      const foundKey = keys.find(key => key.toLowerCase() === propName.toLowerCase());
      if (foundKey && item[foundKey] !== undefined && item[foundKey] !== null) {
        return item[foundKey];
      }
    }
    return null;
  };

  useEffect(() => {
    // Initialize item states - handle both old and new property name formats
    const initialStates = {};
    items.forEach(item => {
      console.log('Item data:', item); // Debug log
      
      const id = getItemProperty(item, 'id', 'ID');
      const availableQty = getItemProperty(item, 'available_QTY', 'AVAILABLE_QTY', 'availableQty', 'availableQTY') || 0;
      const verificationStatus = getItemProperty(item, 'verification_STATUS', 'VERIFICATION_STATUS', 'verificationStatus');
      const verificationPID = getItemProperty(item, 'verification_P_ID', 'VERIFICATION_P_ID', 'verificationPId', 'verificationPID');
      
      initialStates[id] = {
        originalQty: parseFloat(availableQty) || 0,
        verifiedQty: parseFloat(availableQty) || 0,
        checked: verificationStatus === 3 && verificationPID === lastVerificationID,
        disabled: verificationStatus === 3 && verificationPID === lastVerificationID
      };
    });
    setItemStates(initialStates);
  }, [items, lastVerificationID]);

  // ✅ FIXED: Proper quantity parsing
  const handleQuantityChange = (itemId, newQty) => {
    const parsedQty = newQty === '' ? 0 : parseFloat(newQty);
    
    setItemStates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        verifiedQty: parsedQty
      }
    }));
  };

  const handleCheckboxChange = (itemId, checked) => {
    setItemStates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        checked: checked,
        verifiedQty: checked ? 0 : prev[itemId].originalQty
      }
    }));
  };

  const handleUpdate = async () => {
  setUpdating(true);
  try {
    // ✅ Get user ID from localStorage
    const userPFNO = localStorage.getItem('userPFNO') || localStorage.getItem('userId') || '';
    
    // ✅ VALIDATION: Check if user ID exists
    if (!userPFNO) {
      alert('User ID not found. Please log in again.');
      setUpdating(false);
      return;
    }

    const changedItems = items.filter(item => {
      const id = getItemProperty(item, 'id', 'ID');
      const state = itemStates[id];
      return state && parseFloat(state.verifiedQty) !== parseFloat(state.originalQty);
    }).map(item => {
      const id = getItemProperty(item, 'id', 'ID');
      const state = itemStates[id];
      const itemNumber = getItemProperty(item, 'item_NUMBER', 'ITEM_NUMBER', 'itemNumber');
      const refNo = getItemProperty(item, 'ref_NO', 'REF_NO', 'refNo') || '';
      const unitPrice = getItemProperty(item, 'unit_PRICE', 'UNIT_PRICE', 'unitPrice') || 0;
      
      return {
        ID: id,
        R_ID: rackId,
        X: xPos,
        Y: yPos,
        ITEM_NUMBER: itemNumber,
        PREV_QTY: parseFloat(state.originalQty),
        UPDATED_QTY: parseFloat(state.verifiedQty),
        AVAILABLE_QTY: parseFloat(state.verifiedQty),
        REF_NO: refNo,
        UNIT_PRICE: parseFloat(unitPrice),
        TRN_BY: userPFNO  // ✅ Use the validated user ID
      };
    });

    if (changedItems.length === 0) {
      alert('No changes to update');
      setUpdating(false);
      return;
    }

    // ✅ Debug log
    console.log('📤 Sending update data with TRN_BY:', userPFNO);
    console.log('📤 Full data:', JSON.stringify(changedItems, null, 2));

    await onUpdate(changedItems);
    
    // Update the item states to reflect saved changes
    const newStates = { ...itemStates };
    changedItems.forEach(item => {
      if (newStates[item.ID]) {
        newStates[item.ID].originalQty = item.UPDATED_QTY;
      }
    });
    setItemStates(newStates);
    
  } catch (error) {
    console.error('Error updating verification:', error);
  } finally {
    setUpdating(false);
  }
};

const handleVerify = async () => {
  setUpdating(true);
  try {
    // ✅ Get user ID from localStorage
    const userPFNO = localStorage.getItem('userPFNO') || localStorage.getItem('userId') || '';
    
    // ✅ VALIDATION: Check if user ID exists
    if (!userPFNO) {
      alert('User ID not found. Please log in again.');
      setUpdating(false);
      return;
    }

    const changedItems = items.filter(item => {
      const id = getItemProperty(item, 'id', 'ID');
      const state = itemStates[id];
      return state && parseFloat(state.verifiedQty) !== parseFloat(state.originalQty);
    }).map(item => {
      const id = getItemProperty(item, 'id', 'ID');
      const state = itemStates[id];
      const itemNumber = getItemProperty(item, 'item_NUMBER', 'ITEM_NUMBER', 'itemNumber');
      const refNo = getItemProperty(item, 'ref_NO', 'REF_NO', 'refNo') || '';
      const unitPrice = getItemProperty(item, 'unit_PRICE', 'UNIT_PRICE', 'unitPrice') || 0;
      
      return {
        ID: id,
        R_ID: rackId,
        X: xPos,
        Y: yPos,
        ITEM_NUMBER: itemNumber,
        PREV_QTY: parseFloat(state.originalQty),
        UPDATED_QTY: parseFloat(state.verifiedQty),
        AVAILABLE_QTY: parseFloat(state.verifiedQty),
        REF_NO: refNo,
        UNIT_PRICE: parseFloat(unitPrice),
        TRN_BY: userPFNO,  // ✅ Use the validated user ID
        VERIFICATION_STATUS: 3
      };
    });

    if (changedItems.length === 0) {
      alert('No changes to verify');
      setUpdating(false);
      return;
    }

    // ✅ Debug log
    console.log('📤 Sending verify data with TRN_BY:', userPFNO);
    console.log('📤 Full data:', JSON.stringify(changedItems, null, 2));

    await onVerify(changedItems);
    
    // Update the item states to reflect saved changes
    const newStates = { ...itemStates };
    changedItems.forEach(item => {
      if (newStates[item.ID]) {
        newStates[item.ID].originalQty = item.UPDATED_QTY;
        newStates[item.ID].disabled = true;
      }
    });
    setItemStates(newStates);
    
  } catch (error) {
    console.error('Error verifying items:', error);
  } finally {
    setUpdating(false);
  }
};

  const getRowStyle = (item) => {
    const verificationStatus = getItemProperty(item, 'verification_STATUS', 'VERIFICATION_STATUS', 'verificationStatus');
    const verificationPID = getItemProperty(item, 'verification_P_ID', 'VERIFICATION_P_ID', 'verificationPId', 'verificationPID');

    if (verificationPID === lastVerificationID) {
      if (verificationStatus === 1) {
        return { opacity: 1, backgroundColor: '#a0ff77' }; // Green - Updated
      } else if (verificationStatus === 3) {
        return { opacity: 1, backgroundColor: '#ffbdbd' }; // Red - Verified
      }
    }
    return {};
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="verification-cell">
      <style jsx>{`
        .verification-cell {
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
          background: #fbbf24;
        }

        .cell-table th {
          padding: 10px 12px;
          text-align: left;
          font-weight: 700;
          color: #000;
          font-size: 13px;
          border: 1px solid #e5e7eb;
        }

        .cell-table td {
          padding: 12px;
          font-size: 13px;
          color: #374151;
          border: 1px solid #e5e7eb;
        }

        .item-info {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }

        .qty-input {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 13px;
        }

        .qty-input:disabled {
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
            <th style={{ width: '40%' }}>Item Details</th>
            <th style={{ width: '20%' }}>Available Qty</th>
            {isStorekeeper && <th style={{ width: '20%' }}>Verified Qty</th>}
            {!isStorekeeper && <th style={{ width: '20%' }}>Verify</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const id = getItemProperty(item, 'id', 'ID');
            const state = itemStates[id] || {};
            const itemNumber = getItemProperty(item, 'item_NUMBER', 'ITEM_NUMBER', 'itemNumber');
            const description = getItemProperty(item, 'description', 'DESCRIPTION');
            const unitPrice = getItemProperty(item, 'unit_PRICE', 'UNIT_PRICE', 'unitPrice') || 0;
            const uom = getItemProperty(item, 'uom', 'UOM');
            const verificationStatus = getItemProperty(item, 'verification_STATUS', 'VERIFICATION_STATUS', 'verificationStatus');

            return (
              <tr key={id} style={getRowStyle(item)}>
                <td>
                  <div><strong>{itemNumber}</strong></div>
                  <div className="item-info">{description}</div>
                  <div className="item-info">
                    Unit Price: Rs.{parseFloat(unitPrice).toFixed(2)} | UOM: {uom}
                  </div>
                </td>
                <td>
                  <strong>{state.originalQty?.toFixed(2) || '0.00'}</strong> <small>{uom}</small>
                </td>
                {isStorekeeper && (
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="qty-input"
                      value={state.verifiedQty !== undefined ? state.verifiedQty : 0}
                      disabled={state.disabled}
                      onChange={(e) => handleQuantityChange(id, e.target.value)}
                    />
                  </td>
                )}
                {!isStorekeeper && (
                  <td>
                    <div className="checkbox-container">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          className="checkbox-input"
                          checked={state.checked || false}
                          disabled={verificationStatus !== 1}
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
        {isStorekeeper ? (
          <button
            className="brand-btn-primary"
            onClick={handleUpdate}
            disabled={updating}
          >
            {updating && <div className="spinner"></div>}
            <span>{updating ? 'Updating...' : 'Update'}</span>
          </button>
        ) : (
          <button
            className="brand-btn-primary"
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

export default VerificationCell;