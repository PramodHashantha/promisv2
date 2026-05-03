import React, { useState } from 'react';
import StockIn from '@/components/storesManagement/labStore/StockIn';
import StockOut from '@/components/storesManagement/labStore/StockOut';
import CurrentStock from '@/components/storesManagement/labStore/CurrentStock';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';

const Index = () => {
  const [currentView, setCurrentView] = useState('stockIn');
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectItem = (item) => {
    console.log('Item selected for stock out:', item);
    setSelectedItem(item);
    setCurrentView('stockOut');
  };

  const handleBackToStockIn = () => {
    setSelectedItem(null);
    setCurrentView('stockIn');
  };

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setSelectedItem(null);
    setCurrentView('stockIn');
  };

  return (
    <>
      <PageHeader>
        <div className="store-header-wrapper">
          <h1 className="page-title">Lab Stores Management</h1>
          
          <div className="breadcrumb-navigation">
            <div className="breadcrumb">
              <div 
                className={`breadcrumb-item ${currentView === 'stockIn' ? 'breadcrumb-active' : 'breadcrumb-link'}`}
                onClick={handleBackToStockIn}
              >
                📥 Stock In
              </div>
              
              {selectedItem && (
                <>
                  <span className="breadcrumb-separator">›</span>
                  <div className="breadcrumb-item breadcrumb-active">
                    📤 Stock Out - {selectedItem.ITEM_NO}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </PageHeader>
      
      <div className="main-content">
        <style jsx>{`
          .store-header-wrapper {
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
          
          .breadcrumb-navigation {
            display: flex;
            align-items: center;
          }
          
          .breadcrumb {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
          }
          
          .breadcrumb-item {
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
          }
          
          .breadcrumb-separator {
            color: #d1d5db;
          }
          
          .breadcrumb-active {
            color: #3b82f6;
            font-weight: 600;
          }
          
          .breadcrumb-link {
            cursor: pointer;
            transition: color 0.2s ease;
            color: #6b7280;
          }
          
          .breadcrumb-link:hover {
            color: #3b82f6;
          }
          
          @media (max-width: 768px) {
            .store-header-wrapper {
              flex-direction: column;
              align-items: flex-start;
            }
            
            .page-title {
              font-size: 1.1rem;
            }
            
            .breadcrumb {
              font-size: 12px;
            }
          }
          
          .lab-store-page {
            min-height: 100vh;
            padding: 20px;
          }

          .container {
            max-width: 1400px;
            margin: 0 auto;
          }

          .content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 40px;
          }

          @media (max-width: 1024px) {
            .content-grid {
              grid-template-columns: 1fr;
            }
          }

          .section {
            animation: slideInFromRight 0.5s ease-out;
          }

          @keyframes slideInFromRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
        
        <div className="lab-store-page">
          <div className="container">
            <div className="content-grid">
              <div className="section">
                {currentView === 'stockIn' ? (
                  <StockIn onSuccess={handleSuccess} />
                ) : (
                  <StockOut
                    selectedItem={selectedItem}
                    onBack={handleBackToStockIn}
                    onSuccess={handleSuccess}
                  />
                )}
              </div>

              <div className="section">
                <CurrentStock
                  onSelectItem={handleSelectItem}
                  refresh={refreshKey}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Index;
