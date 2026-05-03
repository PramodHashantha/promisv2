import React, { useState, useEffect } from 'react';
import { rackAPI, storeAPI } from '../../../utils/api/storeView'; // ✅ Import storeAPI
import verificationAPI from '../../../utils/api/storesVerification';
import VerificationCell from './VerificationCell';
import LoadingSpinner from '../../loading/LoadingSpinner';
import Swal from 'sweetalert2';

const VerificationRackGrid = ({ warehouseId, onRackSelect, selectedRack }) => {
  const [racks, setRacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rackData, setRackData] = useState(null);
  const [gridItems, setGridItems] = useState([]);
  const [lastVerificationID, setLastVerificationID] = useState(null);
  const [isStorekeeper, setIsStorekeeper] = useState(false);
  const [loadingVerification, setLoadingVerification] = useState(false);

  useEffect(() => {
    console.log('VerificationRackGrid: warehouseId changed to:', warehouseId);
    if (warehouseId) {
      fetchRacks();
      checkUserRole();
    } else {
      console.log('VerificationRackGrid: No warehouse ID, clearing racks');
      setRacks([]);
    }
  }, [warehouseId]);

  useEffect(() => {
    if (selectedRack) {
      loadRackTable();
      fetchLastVerificationID();
    } else {
      setRackData(null);
      setGridItems([]);
    }
  }, [selectedRack]);

  const checkUserRole = async () => {
    try {
      const result = await verificationAPI.isStorekeeper();
      setIsStorekeeper(result === true || result === 'true');
      console.log('User is storekeeper:', result);
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsStorekeeper(false);
    }
  };

  const fetchLastVerificationID = async () => {
    try {
      const result = await verificationAPI.getLastVerificationID();
      const id = result?.id || result?.ID;
      setLastVerificationID(id);
      console.log('Last verification ID:', id);
    } catch (error) {
      console.error('Error fetching last verification ID:', error);
    }
  };

  const fetchRacks = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('VerificationRackGrid: Fetching racks for warehouse ID:', warehouseId);
      
      const data = await rackAPI.getAllRacksByWarehouseId(warehouseId);
      console.log('VerificationRackGrid: Racks API response data:', data);
      
      if (Array.isArray(data)) {
        setRacks(data);
        console.log(`VerificationRackGrid: Successfully loaded ${data.length} racks`);
      } else {
        setRacks([]);
        console.warn('VerificationRackGrid: API response is not an array:', data);
      }
    } catch (error) {
      console.error('VerificationRackGrid: Error fetching racks:', error);
      setError('Failed to load racks. Please try again.');
      setRacks([]);
    } finally {
      setLoading(false);
    }
  };

  const getItemProperty = (item, propName) => {
    if (item[propName] !== undefined) return item[propName];
    const keys = Object.keys(item);
    const foundKey = keys.find(key => key.toLowerCase() === propName.toLowerCase());
    if (foundKey) return item[foundKey];
    return null;
  };

  const loadRackTable = async () => {
    try {
      setLoadingVerification(true);
      console.log('Loading rack data for:', selectedRack);
      
      const rackId = selectedRack.r_ID || selectedRack.R_ID;
      
      // ✅ STEP 1: Fetch ALL items for the rack at once (SAME AS ItemsView)
      console.log('Fetching all items for rack:', rackId);
      const allItems = await storeAPI.getStoresByRackId(rackId);
      
      if (!allItems || allItems.length === 0) {
        console.log('No items found for this rack');
        setGridItems([]);
        setLoadingVerification(false);
        return;
      }

      console.log(`✅ Fetched ${allItems.length} total items for rack`);

      // ✅ STEP 2: Group items by position (EXACT SAME LOGIC as ItemsView)
      const grouped = {};
      
      allItems.forEach(item => {
        // Parse X and Y coordinates
        const xVal = getItemProperty(item, 'x');
        const yVal = getItemProperty(item, 'y');
        
        let x, y;
        
        // Handle string or number X,Y values
        if (typeof xVal === 'string') {
          x = parseInt(xVal, 10);
        } else {
          x = xVal;
        }
        
        if (typeof yVal === 'string') {
          y = parseInt(yVal, 10);
        } else {
          y = yVal;
        }

        // Skip invalid coordinates
        if (isNaN(x) || isNaN(y)) {
          console.warn('Invalid coordinates for item:', item);
          return;
        }

        // ✅ Create position key with 1-based indexing (matching display format)
        const positionKey = `(${x + 1},${y + 1})`;
        
        if (!grouped[positionKey]) {
          grouped[positionKey] = {
            x: x,
            y: y,
            items: []
          };
        }
        
        grouped[positionKey].items.push(item);
      });

      // ✅ STEP 3: Convert to array and sort by position (X first, then Y)
      const sortedPositions = Object.keys(grouped).sort((a, b) => {
        // Extract numbers from position strings like "(1,1)", "(1,3)", etc.
        const matchA = a.match(/\((\d+),(\d+)\)/);
        const matchB = b.match(/\((\d+),(\d+)\)/);
        
        if (!matchA || !matchB) return 0;
        
        const xA = parseInt(matchA[1]);
        const yA = parseInt(matchA[2]);
        const xB = parseInt(matchB[1]);
        const yB = parseInt(matchB[2]);
        
        // Sort by X first, then by Y
        if (xA !== xB) {
          return xA - xB;
        }
        return yA - yB;
      });

      const grid = sortedPositions.map(key => grouped[key]);

      console.log(`✅ Loaded ${grid.length} positions with items in correct order:`, 
        sortedPositions.join(', '));
      
      setGridItems(grid);
      
    } catch (error) {
      console.error('Error loading rack table:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Load Failed',
        text: error.message || 'Failed to load rack details. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoadingVerification(false);
    }
  };

  const handleRackClick = (rack) => {
    console.log('VerificationRackGrid: Rack clicked:', rack);
    onRackSelect(rack);
  };

  const handleCellUpdate = async (items) => {
    try {
      const result = await verificationAPI.saveVerificationDetails(items);
      
      if (result.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Available Quantity saved successfully.',
          confirmButtonColor: '#10b981',
          timer: 1800,
          timerProgressBar: true
        });
        
        setTimeout(() => {
          loadRackTable();
        }, 1800);
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating verification:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.message || 'Failed to update. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleCellVerify = async (items) => {
    try {
      const result = await verificationAPI.saveVerificationDetails1(items);
      
      if (result.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Verified!',
          text: 'Items verified successfully.',
          confirmButtonColor: '#10b981',
          timer: 1800,
          timerProgressBar: true
        });
        
        setTimeout(() => {
          loadRackTable();
        }, 1800);
      } else {
        throw new Error(result.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Error verifying items:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Verification Failed',
        text: error.message || 'Failed to verify. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  if (!warehouseId) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <div style={{ fontSize: '3.75rem', color: '#9ca3af', marginBottom: '1rem' }}>📦</div>
        <p style={{ color: '#6b7280' }}>Please select a warehouse to view racks</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <LoadingSpinner text="Loading racks..." size="large" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '2rem',
        background: '#fef2f2',
        borderRadius: '0.5rem'
      }}>
        <div style={{ fontSize: '1.875rem', color: '#ef4444', marginBottom: '0.5rem' }}>⚠️</div>
        <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
        <button 
          onClick={fetchRacks}
          style={{
            padding: '0.5rem 1rem',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="verification-rack-grid-container">
      <style jsx>{`
        .verification-rack-grid-container {
          padding: 20px 0;
        }
        
        .rack-header {
          margin-bottom: 1.5rem;
        }
        
        .rack-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }
        
        .rack-subtitle {
          color: #4b5563;
        }
        
        .user-role-badge {
          margin-left: 12px;
          padding: 4px 12px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 13px;
        }
        
        .storekeeper-badge {
          background: #d1fae5;
          color: #065f46;
        }
        
        .board-member-badge {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .rack-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
          margin-top: 16px;
        }
        
        .rack-card {
          background: white;
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
        }
        
        .rack-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          border-color: #3b82f6;
        }
        
        .rack-card.selected {
          border-color: #10b981;
          background: #f0fdf4;
        }
        
        .rack-card.unit {
          background: linear-gradient(135deg, #5f9ea0 0%, #4682b4 100%);
          color: white;
        }
        
        .rack-icon {
          width: 32px;
          height: 32px;
          background: #f3f4f6;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          font-size: 18px;
        }
        
        .rack-card.unit .rack-icon {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }
        
        .rack-name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
          color: #1f2937;
        }
        
        .rack-card.unit .rack-name {
          color: white;
        }
        
        .rack-code {
          font-size: 12px;
          color: #6b7280;
        }
        
        .rack-card.unit .rack-code {
          color: rgba(255, 255, 255, 0.8);
        }
        
        .verification-table-container {
          margin-top: 2rem;
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 8px;
        }
        
        .grid-cells {
          display: grid;
          gap: 20px;
          grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
        }
      `}</style>
      
      <div className="rack-header">
        <h2 className="rack-title">
          Storage Racks - Verification
          <span className={`user-role-badge ${isStorekeeper ? 'storekeeper-badge' : 'board-member-badge'}`}>
            {isStorekeeper ? '👤 Storekeeper Mode' : '👤 Board Member Mode'}
          </span>
        </h2>
        <p className="rack-subtitle">
          Select a rack to verify its contents ({racks.length} racks found)
        </p>
      </div>
      
      {racks.length > 0 ? (
        <div className="rack-grid">
          {racks.map((rack, index) => {
            const rackCode = rack.r_CODE || rack.R_CODE || '';
            const rackName = rack.rackname || rack.RACKNAME || rack.rackName || rack.RackName || `Rack ${rackCode}`;
            const rackId = rack.r_ID || rack.R_ID;
            
            const isUnit = rackCode.includes('(Unit)');
            const isSelected = (selectedRack?.r_ID || selectedRack?.R_ID) === rackId;
            
            return (
              <div
                key={rackId}
                className={`rack-card ${isUnit ? 'unit' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => handleRackClick(rack)}
                style={{
                  animationDelay: `${index * 0.05}s`
                }}
              >
                <div className="rack-icon">
                  {isUnit ? '📦' : '🏪'}
                </div>
                
                <div className="rack-name">
                  {rackName}
                </div>
                
                <div className="rack-code">
                  {rackCode}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          background: '#f9fafb',
          borderRadius: '0.5rem'
        }}>
          <div style={{ fontSize: '3.75rem', color: '#9ca3af', marginBottom: '1rem' }}>📦</div>
          <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>No racks found for this warehouse</p>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Try selecting a different warehouse</p>
        </div>
      )}
      
      {selectedRack && (
        <div className="verification-table-container">
          {loadingVerification ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <LoadingSpinner text="Loading verification data..." size="large" variant="primary" />
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '14px' }}>
                Showing {gridItems.length} positions with items
              </div>
              <div className="grid-cells">
                {gridItems.map((cell) => (
                  <VerificationCell
                    key={`${cell.x}-${cell.y}`}
                    items={cell.items}
                    xPos={cell.x}
                    yPos={cell.y}
                    rackId={selectedRack.r_ID || selectedRack.R_ID}
                    isStorekeeper={isStorekeeper}
                    lastVerificationID={lastVerificationID}
                    onUpdate={handleCellUpdate}
                    onVerify={handleCellVerify}
                  />
                ))}
                
                {gridItems.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                    <p>No items found in this rack for verification</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VerificationRackGrid;