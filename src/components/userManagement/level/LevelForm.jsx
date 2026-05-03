import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { levelAPI } from '../../../utils/api/level';

const LevelForm = ({ selectedLevel, onSuccess, onClearSelection }) => {
  const [formData, setFormData] = useState({
    levelId: '',
    worksTotalMonthlyLimit: '',
    worksQuotationLimit: '',
    serviceAndGoodsTotalMonthlyLimit: '',
    serviceAndGoodsQuotationLimit: ''
  });
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (selectedLevel) {
      loadLevelData(selectedLevel);
    }
  }, [selectedLevel]);

  const loadLevelData = (level) => {
    setFormData({
      levelId: level.LEVEL_ID?.toString() || '',
      worksTotalMonthlyLimit: level.WORKS_TOTAL_MONTHLY_LIMIT?.toString() || '',
      worksQuotationLimit: level.WORKS_QUOTATION_LIMIT?.toString() || '',
      serviceAndGoodsTotalMonthlyLimit: level.SERVICE_AND_GOODS_TOTAL_MONTHLY_LIMIT?.toString() || '',
      serviceAndGoodsQuotationLimit: level.SERVICE_AND_GOODS_QUOTATION_LIMIT?.toString() || ''
    });
    setIsEditMode(true);
  };

  const validateForm = () => {
    if (!formData.levelId) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Level ID is required!',
        confirmButtonColor: '#fbbf24'
      });
      return false;
    }

    const numericFields = [
      { value: formData.worksTotalMonthlyLimit, name: 'Works Total Monthly Limit' },
      { value: formData.worksQuotationLimit, name: 'Works Quotation Limit' },
      { value: formData.serviceAndGoodsTotalMonthlyLimit, name: 'Service & Goods Total Monthly Limit' },
      { value: formData.serviceAndGoodsQuotationLimit, name: 'Service & Goods Quotation Limit' }
    ];

    for (const field of numericFields) {
      if (!field.value) {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Information',
          text: `${field.name} is required!`,
          confirmButtonColor: '#fbbf24'
        });
        return false;
      }

      if (isNaN(field.value) || parseFloat(field.value) < 0) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Number',
          text: `${field.name} must be a valid positive number!`,
          confirmButtonColor: '#ef4444'
        });
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const saveData = {
        LEVEL_ID: parseInt(formData.levelId),
        WORKS_TOTAL_MONTHLY_LIMIT: parseFloat(formData.worksTotalMonthlyLimit),
        WORKS_QUOTATION_LIMIT: parseFloat(formData.worksQuotationLimit),
        SERVICE_AND_GOODS_TOTAL_MONTHLY_LIMIT: parseFloat(formData.serviceAndGoodsTotalMonthlyLimit),
        SERVICE_AND_GOODS_QUOTATION_LIMIT: parseFloat(formData.serviceAndGoodsQuotationLimit)
      };

      console.log('Submitting level save:', saveData);

      await levelAPI.saveLevel(saveData);

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Level ${isEditMode ? 'updated' : 'saved'} successfully!`,
        confirmButtonColor: '#10b981',
        timer: 2000,
        timerProgressBar: true
      });

      handleClear();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving level:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: error.message || 'Failed to save level',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.levelId) {
      await Swal.fire({
        icon: 'warning',
        title: 'No Level Selected',
        text: 'Please select a level to delete!',
        confirmButtonColor: '#fbbf24'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete Level ${formData.levelId}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);

        await levelAPI.deleteLevel(parseInt(formData.levelId));

        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Level deleted successfully!',
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true
        });

        handleClear();
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error('Error deleting level:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: error.message || 'Failed to delete level',
          confirmButtonColor: '#ef4444'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClear = () => {
    setFormData({
      levelId: '',
      worksTotalMonthlyLimit: '',
      worksQuotationLimit: '',
      serviceAndGoodsTotalMonthlyLimit: '',
      serviceAndGoodsQuotationLimit: ''
    });
    setIsEditMode(false);
    if (onClearSelection) {
      onClearSelection();
    }
  };

  return (
    <div className="level-form-card">
      <style jsx>{`
        .level-form-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .card-header {
          background: #3b82f6;
          color: white;
          padding: 16px;
          margin: -24px -24px 24px -24px;
          border-radius: 12px 12px 0 0;
          font-size: 20px;
          font-weight: 700;
        }
        .form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
        .form-group {
          display: flex;
          flex-direction: column;
        }
        .form-label {
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
        }
        .required {
          color: #ef4444;
        }
        .form-control {
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
        .button-container {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="card-header">Enter Appointment Level Details</div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            Level ID <span className="required">*</span>
          </label>
          <input
            type="number"
            className="form-control"
            value={formData.levelId}
            onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
            readOnly={isEditMode}
            placeholder="Enter Level ID"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Works Total Monthly Limit <span className="required">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            value={formData.worksTotalMonthlyLimit}
            onChange={(e) => setFormData({ ...formData, worksTotalMonthlyLimit: e.target.value })}
            placeholder="Enter amount"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            Works Quotation Limit <span className="required">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            value={formData.worksQuotationLimit}
            onChange={(e) => setFormData({ ...formData, worksQuotationLimit: e.target.value })}
            placeholder="Enter amount"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Service & Goods Total Monthly Limit <span className="required">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            value={formData.serviceAndGoodsTotalMonthlyLimit}
            onChange={(e) => setFormData({ ...formData, serviceAndGoodsTotalMonthlyLimit: e.target.value })}
            placeholder="Enter amount"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            Service & Goods Quotation Limit <span className="required">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            value={formData.serviceAndGoodsQuotationLimit}
            onChange={(e) => setFormData({ ...formData, serviceAndGoodsQuotationLimit: e.target.value })}
            placeholder="Enter amount"
          />
        </div>
        <div></div>
      </div>

      <div className="button-container">
        <button className="brand-btn-secondary" onClick={handleClear} disabled={loading}>
          ✖️ Clear
        </button>
        
        {isEditMode && (
          <button className="brand-btn-danger" onClick={handleDelete} disabled={loading}>
            {loading ? <div className="spinner"></div> : '🗑️'}
            Delete
          </button>
        )}
        
        <button className="brand-btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? <div className="spinner"></div> : '💾'}
          Save
        </button>
      </div>
    </div>
  );
};

export default LevelForm;