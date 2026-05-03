import React from 'react';

const DefaultPermissionCreator = ({ 
  permissionName, 
  onPermissionNameChange, 
  onSave, 
  onClear,
  disabled 
}) => {
  return (
    <div className="creator-card">
      <style>{`
        .creator-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
          margin-top: 20px;
        }

        .creator-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #1f2937;
        }

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

        .form-input {
          width: 100%;
          padding: 10px;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .form-input:focus {
          outline: none;
          border-color: #fbbf24;
        }

        .form-input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .button-group {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

      `}</style>

      <h3 className="creator-title">Create Default Permission</h3>
      
      <div className="form-group">
        <label className="form-label">Permission Name:</label>
        <input
          type="text"
          className="form-input"
          value={permissionName}
          onChange={onPermissionNameChange}
          placeholder="Enter permission name"
          disabled={disabled}
        />
      </div>

      <div className="button-group">
        <button
          className="brand-btn-secondary"
          onClick={onClear}
          disabled={disabled}
        >
          Clear
        </button>
        <button
          className="brand-btn-primary"
          onClick={onSave}
          disabled={disabled || !permissionName.trim()}
        >
          {disabled ? 'Saving...' : 'Save Default'}
        </button>
      </div>
    </div>
  );
};

export default DefaultPermissionCreator;