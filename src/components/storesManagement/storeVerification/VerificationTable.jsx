import React from 'react';
import Swal from 'sweetalert2';
import LoadingSpinner from '../../loading/LoadingSpinner';

const VerificationTable = ({ verifications, loading, onEndVerification }) => {
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'null') return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (error) {
      return dateString;
    }
  };

  const getProperty = (obj, propName) => {
    if (obj[propName] !== undefined) return obj[propName];
    const keys = Object.keys(obj);
    const foundKey = keys.find(key => key.toLowerCase() === propName.toLowerCase());
    return foundKey ? obj[foundKey] : null;
  };

  const getStatusBadge = (status) => {
    if (status === 1) {
      return <span className="status-badge status-progress">Verification On Progress</span>;
    } else if (status === 5) {
      return <span className="status-badge status-completed">Verification Completed</span>;
    }
    return <span className="status-badge">Unknown</span>;
  };

  const handleEndVerificationClick = async (id) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'End Verification',
      text: 'Are you sure you want to end this verification?',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, End Verification',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      onEndVerification(id);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner text="Loading verification dates..." size="large" variant="primary" />
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .verification-table {
          width: 100%;
          border-collapse: collapse;
        }

        .verification-table thead {
          background: #f9fafb;
        }

        .verification-table th {
          padding: 12px 16px;
          text-align: left;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          white-space: nowrap;
        }

        .verification-table tbody tr {
          border-bottom: 1px solid #e5e7eb;
          transition: background 0.2s;
        }

        .verification-table tbody tr:hover {
          background: #f9fafb;
        }

        .verification-table tbody tr:last-child {
          border-bottom: none;
        }

        .verification-table td {
          padding: 14px 16px;
          font-size: 0.875rem;
          color: #1f2937;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .status-progress {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-completed {
          background: #d1fae5;
          color: #065f46;
        }

        .btn-end {
          padding: 6px 16px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .btn-end:hover {
          background: #dc2626;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .btn-completed {
          padding: 6px 16px;
          background: #9ca3af;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: not-allowed;
          white-space: nowrap;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #9ca3af;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 16px;
        }

        .empty-text {
          font-size: 1rem;
          color: #6b7280;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
        }

        @media (max-width: 1024px) {
          .verification-table th,
          .verification-table td {
            padding: 10px 12px;
            font-size: 0.8125rem;
          }
        }

        @media (max-width: 768px) {
          .verification-table {
            font-size: 0.75rem;
          }

          .verification-table th,
          .verification-table td {
            padding: 8px 10px;
            font-size: 0.75rem;
          }

          .btn-end,
          .btn-completed {
            padding: 4px 12px;
            font-size: 0.75rem;
          }

          .status-badge {
            font-size: 0.6875rem;
            padding: 3px 8px;
          }
        }

        @media (max-width: 640px) {
          .table-responsive {
            overflow-x: scroll;
          }

          .verification-table {
            min-width: 600px;
          }
        }
      `}</style>

      <div className="table-container">
        {verifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p className="empty-text">No verification dates found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="verification-table">
              <thead>
                <tr>
                  <th>Verification Year</th>
                  <th>Started Date</th>
                  <th>Ended Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {verifications.map((verification) => {
                  const id = getProperty(verification, 'ID') || getProperty(verification, 'id');
                  const year = getProperty(verification, 'YEAR') || getProperty(verification, 'year');
                  const startedDate = getProperty(verification, 'STARTED_DATE') || getProperty(verification, 'starteD_DATE');
                  const endedDate = getProperty(verification, 'ENDED_DATE') || getProperty(verification, 'endeD_DATE');
                  const status = getProperty(verification, 'STATUS') || getProperty(verification, 'status');

                  return (
                    <tr key={id}>
                      <td>{year || 'N/A'}</td>
                      <td>{formatDate(startedDate)}</td>
                      <td>{formatDate(endedDate)}</td>
                      <td>{getStatusBadge(status)}</td>
                      <td>
                        {status === 1 ? (
                          <button
                            className="btn-end"
                            onClick={() => handleEndVerificationClick(id)}
                          >
                            End Verification
                          </button>
                        ) : (
                          <button className="btn-completed" disabled>
                            Verification Completed
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default VerificationTable;