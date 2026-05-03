import React, { useState, useEffect } from 'react';
import { verificationAPI } from '../../../utils/api/storeVerification';
import VerificationTable from '@/components/storesManagement/storeVerification/VerificationTable';
import StartVerificationModal from '@/components/storesManagement/storeVerification/StartVerificationModal';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import Swal from 'sweetalert2';

const Index = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userPFNO, setUserPFNO] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserPFNO(user.pfno || user.PFNO || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      console.log('Fetching all verification dates');
      setLoading(true);
      const data = await verificationAPI.getAllVerificationDates();
      console.log('Verification dates response:', data);
      setVerifications(data);
    } catch (error) {
      console.error('Error loading verifications:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to load verification dates.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartVerification = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSubmitVerification = async (data) => {
    try {
      setSubmitting(true);

      const verificationData = {
        YEAR: parseInt(data.year),
        END_DATE: data.endDate,
        TRN_BY: userPFNO || 'SYSTEM'
      };

      console.log('Submitting verification:', verificationData);

      await verificationAPI.declareVerificationPeriod(verificationData);

      setModalOpen(false);

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Verification Started. NOTE: From now on, the system will not allow store IN and OUT.',
        confirmButtonColor: '#10b981'
      });

      loadVerifications();
    } catch (error) {
      console.error('Error declaring verification:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error Occurred!',
        text: error.message || 'Failed to start verification. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndVerification = async (verificationId) => {
    try {
      const result = await Swal.fire({
        title: 'End Verification',
        text: 'Please Confirm End Verification. You may not be able to reverse this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirm!',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        await verificationAPI.endVerificationPeriod(verificationId, userPFNO || 'SYSTEM');

        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Verification ended successfully.',
          confirmButtonColor: '#10b981'
        });

        loadVerifications();
      }
    } catch (error) {
      console.error('Error ending verification:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error Occurred!',
        text: error.message || 'Failed to end verification. Please contact administrator.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  return (
    <>
      <PageHeader>
        <div className="header-content">
          <h1 className="page-title">Store Verification Dates</h1>
        </div>
      </PageHeader>

      <style jsx>{`
        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .main-content {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin-bottom: 20px;
          transition: all 0.3s ease;
        }

        .card-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .card-divider {
          height: 2px;
          background: linear-gradient(to right, #3b82f6, transparent);
          margin: 12px 0;
        }

        .btn-start {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
        }

        .btn-start:hover {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-start:active {
          transform: translateY(0);
        }

        .card-body {
          padding: 24px;
        }

        /* Dark mode */
        :global(body.dark-mode) .page-title {
          color: #f9fafb;
        }

        :global(body.dark-mode) .card {
          background: #1f2937;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        }

        :global(body.dark-mode) .card-title {
          color: #f9fafb;
        }

        :global(body.dark-mode) .card-header {
          border-bottom-color: #374151;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card {
          animation: fadeIn 0.5s ease-out;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .main-content {
            padding: 16px;
          }

          .page-title {
            font-size: 1.25rem;
          }

          .card-header {
            padding: 16px 20px;
          }

          .card-body {
            padding: 20px;
          }

          .card-title {
            font-size: 1.125rem;
          }

          .btn-start {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .main-content {
            padding: 12px;
          }

          .page-title {
            font-size: 1.125rem;
          }

          .card-header {
            padding: 12px 16px;
          }

          .card-body {
            padding: 16px;
          }

          .btn-start {
            font-size: 0.8125rem;
            padding: 8px 16px;
          }
        }
      `}</style>

      <div className="main-content">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Start / End Verification</h2>
            <div className="card-divider"></div>
            <button className="btn-start" onClick={handleStartVerification}>
              <span>➕</span> Start Verification
            </button>
          </div>

          <div className="card-body">
            <VerificationTable
              verifications={verifications}
              loading={loading}
              onEndVerification={handleEndVerification}
            />
          </div>
        </div>
      </div>

      <StartVerificationModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitVerification}
        loading={submitting}
      />
    </>
  );
};

export default Index;