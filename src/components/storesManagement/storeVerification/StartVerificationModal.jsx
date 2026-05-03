import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const StartVerificationModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [endDate, setEndDate] = useState('');
  const [startDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isOpen) {
      setYear(new Date().getFullYear());
      setEndDate('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!year) {
      await Swal.fire({
        icon: 'warning',
        title: 'Year Required',
        text: 'Please select a verification year.',
        confirmButtonColor: '#fbbf24',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    if (!endDate) {
      await Swal.fire({
        icon: 'warning',
        title: 'End Date Required',
        text: 'Please enter a valid end date.',
        confirmButtonColor: '#fbbf24',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    if (new Date(endDate) < new Date(startDate)) {
      await Swal.fire({
        icon: 'error',
        title: 'Invalid Date',
        text: 'End date must be on or after the start date.',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      });
      return;
    }

    const formattedEndDate = new Date(endDate).toISOString();

    onSubmit({ 
      year: parseInt(year), 
      endDate: formattedEndDate 
    });
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 2023; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  };

  if (!isOpen) return null;

  return (
    <>
      <style jsx>{`
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
          animation: fadeIn 0.2s ease-out;
          padding: 16px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 0;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
          max-height: 90vh;
          overflow-y: auto;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .modal-body {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: all 0.2s;
          background: white;
          color: #1f2937;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
          color: #6b7280;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          border: 2px solid transparent;
          border-top-color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .note-text {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 4px;
        }

        @media (max-width: 640px) {
          .modal-content {
            max-width: 100%;
            border-radius: 12px 12px 0 0;
            max-height: 95vh;
          }

          .modal-header {
            padding: 16px 20px;
          }

          .modal-title {
            font-size: 1.125rem;
          }

          .modal-body {
            padding: 20px;
          }

          .modal-footer {
            padding: 12px 20px;
            flex-direction: column-reverse;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h4 className="modal-title">Declare Verification For the Year</h4>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Verification Year</label>
                <select
                  className="form-select"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  disabled={loading}
                  required
                >
                  {generateYearOptions().map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  disabled
                />
                <p className="note-text">Start date is automatically set to today</p>
              </div>

              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="brand-btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Close
              </button>
              <button
                type="submit"
                className="brand-btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default StartVerificationModal;