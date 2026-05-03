import React from 'react';

const DefaultPermissionSelector = ({ 
  defaultPermissions, 
  selectedDefault, 
  onDefaultChange, 
  disabled 
}) => {
  if (!defaultPermissions || defaultPermissions.length === 0) {
    return null;
  }

  return (
    <div className="form-group">
      <style>{`
        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #374151;
          font-size: 14px;
        }

        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .radio-item {
          display: flex;
          align-items: center;
          padding: 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .radio-item:hover {
          background: #f9fafb;
        }

        .radio-item input[type="radio"] {
          margin-right: 10px;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .radio-item input[type="radio"]:disabled {
          cursor: not-allowed;
        }

        .radio-item span {
          font-size: 14px;
          color: #374151;
        }
      `}</style>

      <label className="form-label">Default Permissions:</label>
      <div className="radio-group">
        {defaultPermissions.map((dp, index) => (
          <label key={index} className="radio-item">
            <input
              type="radio"
              name="defaultPermission"
              value={dp.defaulT_NAME}
              checked={selectedDefault === dp.defaulT_NAME}
              onChange={onDefaultChange}
              disabled={disabled}
            />
            <span>{dp.defaulT_NAME}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default DefaultPermissionSelector;