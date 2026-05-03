import React, { useState } from 'react';
import LevelForm from '@/components/userManagement/level/LevelForm';
import LevelTable from '@/components/userManagement/level/LevelTable';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';

const Index = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectLevel = (level) => {
    console.log('Level selected for edit:', level);
    setSelectedLevel(level);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearSelection = () => {
    setSelectedLevel(null);
  };

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setSelectedLevel(null);
  };

  return (
    <>
      <PageHeader>
        <div className="level-header-wrapper">
          <h1 className="page-title">Appointment Level Management</h1>
        </div>
      </PageHeader>
      
      <div className="main-content">
        <style jsx>{`
          .level-header-wrapper {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 16px;
          }
          
          .page-title {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 0;
          }
          
          @media (max-width: 768px) {
            .level-header-wrapper {
              flex-direction: column;
              align-items: flex-start;
            }
            
            .page-title {
              font-size: 1.1rem;
            }
          }
          
          .level-page {
            min-height: 100vh;
            padding: 20px;
            background: #f3f4f6;
          }

          .container {
            max-width: 1400px;
            margin: 0 auto;
          }

          .content-section {
            margin-bottom: 40px;
            animation: slideIn 0.5s ease-out;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
        
        <div className="level-page">
          <div className="container">
            {/* Table Section */}
            <div className="content-section">
              <LevelTable
                onSelectLevel={handleSelectLevel}
                refresh={refreshKey}
              />
            </div>

            {/* Form Section */}
            <div className="content-section">
              <LevelForm
                selectedLevel={selectedLevel}
                onSuccess={handleSuccess}
                onClearSelection={handleClearSelection}
              />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Index;