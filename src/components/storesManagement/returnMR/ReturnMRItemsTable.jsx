import React, { useState, useEffect } from 'react';
import { returnMRAPI } from '@/utils/api/returnMR';

const ReturnMRItemsTable = ({ mrNo, items, onReturnQtyChange, onSave, saving }) => {
  const [returnQuantities, setReturnQuantities] = useState({});
  const [description, setDescription] = useState('');

  // ── SK dropdown state (mirrors old calldropdown2 behaviour) ────────────────
  const [skList, setSkList]       = useState([]);
  const [selectedSK, setSelectedSK] = useState('');
  const [skLoading, setSkLoading] = useState(false);

  // Reset quantities whenever the item list changes
  useEffect(() => {
    const initialQtys = {};
    items.forEach(item => {
      const key = buildKey(item);
      initialQtys[key] = 0;
    });
    setReturnQuantities(initialQtys);
  }, [items]);

  // Load SK list as soon as the table is shown (mirrors window.onload → calldropdown2)
  useEffect(() => {
    if (!mrNo) return;
    loadSKList();
  }, [mrNo]);

  const buildKey = (item) =>
    `${item.R_ID ?? item.r_ID}_${item.X ?? item.x}_${item.Y ?? item.y}_${item.ITEM_NUMBER ?? item.itemNumber}`;

  // ── Fetch SK list from backend ─────────────────────────────────────────────
  const loadSKList = async () => {
    try {
      setSkLoading(true);
      const data = await returnMRAPI.getSKList();

      if (data && data.length > 0) {
        setSkList(data);
        // Auto-select first SK — same as old code:
        // if (dobj.length > 0) { $("#selectsk").val(dobj[0].SKNO...).trigger('change'); }
        setSelectedSK(data[0].SKNO);
      }
    } catch (err) {
      console.error('Failed to load SK list:', err);
    } finally {
      setSkLoading(false);
    }
  };

  // ── Quantity change ────────────────────────────────────────────────────────
  const handleQuantityChange = (item, value) => {
    const key = buildKey(item);
    const parsedValue = value === '' ? 0 : parseFloat(value) || 0;

    setReturnQuantities(prev => ({ ...prev, [key]: parsedValue }));

    if (onReturnQtyChange) onReturnQtyChange(item, parsedValue);
  };

  // ── Save click ─────────────────────────────────────────────────────────────
  const handleSaveClick = () => {
    const itemsToReturn = items
      .map(item => ({
        ...item,
        RETURN_QTY: returnQuantities[buildKey(item)] || 0
      }))
      .filter(item => item.RETURN_QTY > 0);

    if (itemsToReturn.length === 0) {
      alert('Please enter return quantity for at least one item');
      return;
    }

    const invalidItems = itemsToReturn.filter(
      item => item.RETURN_QTY > (item.ADJUSTED_QTY ?? item.adjustedQty ?? 0)
    );

    if (invalidItems.length > 0) {
      alert('Return quantity cannot exceed Adjusted Qty for some items');
      return;
    }

    if (onSave) {
      onSave({
        items: itemsToReturn,
        // Pass selected SK — mirrors old Request.Form["selectsk"]
        sk: selectedSK,
        description
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="return-mr-items-table">
      <style jsx>{`
        .return-mr-items-table {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          padding: 24px;
          margin-top: 24px;
        }

        .table-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 16px;
        }

        /* ── Items table ── */
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .items-table thead {
          background: #e5e7eb;
        }
        .items-table th {
          padding: 10px 12px;
          text-align: left;
          font-weight: 700;
          color: #1f2937;
          font-size: 13px;
          border: 1px solid #d1d5db;
        }
        .items-table th:nth-child(1),
        .items-table th:nth-child(2),
        .items-table th:nth-child(3) { text-align: center; }
        .items-table th:nth-child(6),
        .items-table th:nth-child(7) { text-align: right; }

        .items-table tbody tr {
          border-bottom: 1px solid #e5e7eb;
          transition: background 0.2s;
        }
        .items-table tbody tr:hover { background: #f9fafb; }
        .items-table td {
          padding: 10px 12px;
          color: #374151;
          font-size: 13px;
          border: 1px solid #e5e7eb;
        }
        .items-table td:nth-child(1),
        .items-table td:nth-child(2),
        .items-table td:nth-child(3) { text-align: center; }
        .items-table td:nth-child(6) { text-align: right; }

        /* ── Qty input ── */
        .qty-input {
          width: 100%;
          max-width: 100px;
          padding: 6px 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 13px;
          text-align: right;
        }
        .qty-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        /* ── Form section below the table ── */
        .form-section {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 2px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-row {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          align-items: flex-start;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          min-width: 200px;
          max-width: 500px;
        }

        .form-label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .form-textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
        }
        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        /* ── SK dropdown — matches old select2 look ── */
        .sk-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          color: #374151;
          cursor: pointer;
          appearance: auto;
        }
        .sk-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .sk-select:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
          color: #9ca3af;
        }

        .sk-loading-text {
          font-size: 13px;
          color: #6b7280;
          font-style: italic;
        }

        /* ── Submit button ── */
        .submit-btn {
          padding: 10px 24px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          align-self: flex-end;
        }
        .submit-btn:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }
        .submit-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          border: 2px solid transparent;
          border-top-color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Table title ── */}
      <h4 className="table-title">Out Item List : {mrNo}</h4>

      {/* ── Items grid ── */}
      <table className="items-table">
        <thead>
          <tr>
            <th>Rack ID</th>
            <th>X</th>
            <th>Y</th>
            <th>Item code</th>
            <th>Description</th>
            <th>Out Qty</th>
            <th>Return Qty</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const rackId      = item.R_ID      ?? item.r_ID      ?? '';
            const x           = item.X         ?? item.x         ?? '';
            const y           = item.Y         ?? item.y         ?? '';
            const itemCode    = item.ITEM_NUMBER ?? item.itemNumber ?? '';
            const desc        = item.DESCRIPTION ?? item.description ?? '';
            const adjustedQty = parseFloat(item.ADJUSTED_QTY ?? item.adjustedQty ?? 0);
            const key         = `${rackId}_${x}_${y}_${itemCode}`;
            const returnQty   = returnQuantities[key] || 0;

            return (
              <tr key={index}>
                <td>{rackId}</td>
                <td>{x}</td>
                <td>{y}</td>
                <td>{itemCode}</td>
                <td>{desc}</td>
                <td>{adjustedQty.toFixed(2)}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    max={adjustedQty}
                    className="qty-input"
                    value={returnQty}
                    onChange={e => handleQuantityChange(item, e.target.value)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ── Form section ── */}
      <div className="form-section">
        <div className="form-row">

          {/* Description textarea */}
          <div className="form-group">
            <label className="form-label">Description :</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter description (optional)"
            />
          </div>

          {/* SK dropdown — auto-populated & auto-selected, same as old calldropdown2 */}
          <div className="form-group">
            <label className="form-label">Select SK :</label>
            {skLoading ? (
              <span className="sk-loading-text">Loading store keepers...</span>
            ) : (
              <select
  id="selectsk"
  className="sk-select"
  value={selectedSK}
  onChange={e => setSelectedSK(e.target.value)}
  disabled={skList.length === 0}
  style={{ 
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
    appearance: 'auto',
    WebkitAppearance: 'auto',
    MozAppearance: 'auto'
  }}
>

                {skList.length === 0 && (
                  <option value="0">-- No store keepers found --</option>
                )}
                {skList.map((sk, i) => (
                  <option key={i} value={sk.SKNO}>
                    {/* Matches old: fullname + " - " + skno1 */}
                    {sk.FULLNAME} - {sk.RESPONSIBLE_PERSON}
                  </option>
                ))}
              </select>
            )}
          </div>

        </div>

        {/* Submit button — float right matches old layout */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="submit-btn"
            onClick={handleSaveClick}
            disabled={saving}
          >
            {saving && <div className="spinner" />}
            <span>{saving ? 'Processing...' : '↩ Return Request'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnMRItemsTable;