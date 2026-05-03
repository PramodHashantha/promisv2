import React, { useState, useRef } from 'react';
import WarehouseMap from '@/components/storesManagement/viewStore/WarehouseMap';
import PriceUpdateRackGrid from '@/components/storesManagement/storesVerificationPriceUpdate/PriceUpdateRackGrid';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import priceUpdateAPI from '@/utils/api/storeVerificationPriceUpdate';
import { storeAPI } from '@/utils/api/storeView';

const Index = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedRack, setSelectedRack] = useState(null);
  const [currentView, setCurrentView] = useState('warehouses');
  const [downloading, setDownloading] = useState(false);
  const racksRef = useRef(null);
  const itemsRef = useRef(null);

  const handleWarehouseSelect = (warehouse) => {
    console.log('Index: Warehouse selected:', warehouse);
    
    setSelectedRack(null);
    setCurrentView('racks');
    
    setTimeout(() => {
      setSelectedWarehouse(warehouse);
      
      setTimeout(() => {
        if (racksRef.current) {
          racksRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 150);
    }, 50);
  };

  const handleRackSelect = (rack) => {
    console.log('Index: Rack selected:', rack);
    setSelectedRack(rack);
    
    setTimeout(() => {
      if (itemsRef.current) {
        itemsRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 300);
  };

  const handleBackToWarehouses = () => {
    setSelectedWarehouse(null);
    setSelectedRack(null);
    setCurrentView('warehouses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToRacks = () => {
    setSelectedRack(null);
    setCurrentView('racks');
    if (racksRef.current) {
      racksRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Helper function to get property with multiple possible names
  const getItemProperty = (item, ...propertyNames) => {
    if (!item) return null;
    
    for (const propName of propertyNames) {
      if (item[propName] !== undefined && item[propName] !== null) {
        return item[propName];
      }
      
      const keys = Object.keys(item);
      const foundKey = keys.find(key => key.toLowerCase() === propName.toLowerCase());
      if (foundKey && item[foundKey] !== undefined && item[foundKey] !== null) {
        return item[foundKey];
      }
    }
    
    return null;
  };

  // Helper function to calculate row height
  const calculateRowHeight = (description, maxChars = 33, baseHeight = 15.6) => {
    if (!description) return baseHeight;
    const rows = Math.ceil(description.length / maxChars);
    return rows * baseHeight;
  };

  // ✅ Generate full price update sheet - matches old Storeverification()
  const generatePriceUpdateSheet = async () => {
    if (!selectedRack) {
      await Swal.fire({
        icon: 'warning',
        title: 'No Rack Selected',
        text: 'Please select a rack first.',
        confirmButtonColor: '#fbbf24'
      });
      return;
    }

    try {
      setDownloading(true);

      const rackId = selectedRack.r_ID || selectedRack.R_ID;
      const rackCode = selectedRack.r_CODE || selectedRack.R_CODE;
      const warehouseId = selectedWarehouse.w_ID || selectedWarehouse.W_ID;

      console.log('Fetching warehouse details for ID:', warehouseId);
      const warehouseData = await priceUpdateAPI.getWarehouseDetailsByWID(warehouseId);
      console.log('Warehouse data received:', warehouseData);

      console.log('Fetching items for rack ID:', rackId);
      const items = await storeAPI.getStoresByRackId(rackId);
      console.log('Items received:', items?.length || 0);

      if (!items || items.length === 0) {
        await Swal.fire({
          icon: 'info',
          title: 'No Items',
          text: 'No items found in this rack.',
          confirmButtonColor: '#fbbf24'
        });
        setDownloading(false);
        return;
      }

      const workbook = new ExcelJS.Workbook();
      let worksheet = workbook.addWorksheet('Verification Report');

      const setupWorksheet = (ws) => {
        ws.getColumn(1).width = 3.7;
        ws.getColumn(4).width = 10;
        ws.getColumn(5).width = 30;
        ws.getColumn(6).width = 13.4;
        ws.getColumn(7).width = 9.4;
        ws.getColumn(8).width = 10;
        ws.getColumn(9).width = 8;
        ws.getColumn(10).width = 8;
        ws.getColumn(11).width = 8;
        ws.getColumn(12).width = 8;
        ws.getColumn(13).width = 10;
        ws.getColumn(14).width = 10;
        ws.getColumn(15).width = 10;
        ws.getColumn(16).width = 10;
        ws.getColumn(17).width = 10;

        ws.pageSetup = {
          paperSize: 9,
          orientation: 'landscape',
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 1,
          margins: { left: 0.25, right: 0.25, top: 0.25, bottom: 0.25 }
        };
      };

      const addHeader = (ws, row) => {
        ws.getCell(`B${row}`).value = 'TO BE FILLED IN TRIPLICATE';
        ws.getCell(`B${row}`).font = { bold: true };
        ws.getCell(`P${row}`).value = 'Form - AV/1/A';
        ws.getCell(`P${row}`).font = { bold: true };
        row += 2;

        ws.getCell(`B${row}`).value = '1. ORIGINAL    :  Accountant';
        ws.getCell(`B${row}`).font = { bold: true };
        ws.getCell(`K${row}`).value = 'Sheet No. ….';
        ws.getCell(`K${row}`).font = { bold: true };
        row += 1;

        ws.getCell(`B${row}`).value = '2. DUPLICATE  : (Unit) ';
        ws.getCell(`B${row}`).font = { bold: true };
        ws.getCell(`K${row}`).value = 'Date of Verification: …………';
        ws.getCell(`K${row}`).font = { bold: true };
        row += 1;

        ws.getCell(`B${row}`).value = '3. TRIPLICATE  : Store-keeper/E.S.(C.S.C.)';
        ws.getCell(`B${row}`).font = { bold: true };
        
        const wCode = getItemProperty(warehouseData, 'w_CODE', 'W_CODE') || '';
        const wName = getItemProperty(warehouseData, 'w_NAME', 'W_NAME') || '';
        ws.getCell(`K${row}`).value = `Warehouse: ${wCode} - ${wName}`;
        ws.getCell(`K${row}`).font = { bold: true };
        row += 1;

        ws.getCell(`K${row}`).value = `Rack No: ${rackCode}`;
        ws.getCell(`K${row}`).font = { bold: true };
        row += 2;

        ws.getCell(`B${row}`).value = `ANNUAL VERIFICATION OF STORES/STOCKS - ${new Date().getFullYear()}`;
        ws.getCell(`B${row}`).font = { bold: true, size: 14, underline: true };
        row += 2;

        return row;
      };

      const addTableHeaders = (ws, row) => {
        const columns = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'];
        columns.forEach((col, idx) => {
          ws.getCell(row, idx + 2).value = col;
        });
        row += 1;

        const headerRow = row;
        
        ws.mergeCells(`B${headerRow}:B${headerRow + 3}`);
        ws.getCell(`B${headerRow}`).value = 'Serial No.';
        ws.mergeCells(`C${headerRow}:C${headerRow + 3}`);
        ws.getCell(`C${headerRow}`).value = 'Bin No';
        ws.mergeCells(`D${headerRow}:D${headerRow + 3}`);
        ws.getCell(`D${headerRow}`).value = 'Code No.';
        ws.mergeCells(`E${headerRow}:E${headerRow + 3}`);
        ws.getCell(`E${headerRow}`).value = 'Description';
        ws.mergeCells(`F${headerRow}:F${headerRow + 3}`);
        ws.getCell(`F${headerRow}`).value = 'Grade';
        ws.mergeCells(`G${headerRow}:G${headerRow + 3}`);
        ws.getCell(`G${headerRow}`).value = 'UOM';
        ws.mergeCells(`H${headerRow}:H${headerRow + 2}`);
        ws.getCell(`H${headerRow}`).value = 'Standard Price';
        ws.getCell(`H${headerRow + 3}`).value = 'Rs.     Cts.';
        
        ws.mergeCells(`I${headerRow}:L${headerRow}`);
        ws.getCell(`I${headerRow}`).value = 'Q   U   A   N   T   I   T   Y';
        ws.mergeCells(`M${headerRow}:P${headerRow}`);
        ws.getCell(`M${headerRow}`).value = 'V   A    L   U   E';
        
        ws.mergeCells(`I${headerRow + 1}:I${headerRow + 3}`);
        ws.getCell(`I${headerRow + 1}`).value = 'Book Balance';
        ws.mergeCells(`J${headerRow + 1}:J${headerRow + 3}`);
        ws.getCell(`J${headerRow + 1}`).value = 'Physical Balance';
        ws.mergeCells(`K${headerRow + 1}:K${headerRow + 3}`);
        ws.getCell(`K${headerRow + 1}`).value = 'Surplus';
        ws.mergeCells(`L${headerRow + 1}:L${headerRow + 3}`);
        ws.getCell(`L${headerRow + 1}`).value = 'Shortage';
        
        ws.mergeCells(`M${headerRow + 1}:M${headerRow + 2}`);
        ws.getCell(`M${headerRow + 1}`).value = 'Book Value';
        ws.getCell(`M${headerRow + 3}`).value = 'Rs.     Cts.';
        ws.mergeCells(`N${headerRow + 1}:N${headerRow + 2}`);
        ws.getCell(`N${headerRow + 1}`).value = 'Physical Value';
        ws.getCell(`N${headerRow + 3}`).value = 'Rs.     Cts.';
        ws.mergeCells(`O${headerRow + 1}:O${headerRow + 2}`);
        ws.getCell(`O${headerRow + 1}`).value = 'Surplus';
        ws.getCell(`O${headerRow + 3}`).value = 'Rs.     Cts.';
        ws.mergeCells(`P${headerRow + 1}:P${headerRow + 2}`);
        ws.getCell(`P${headerRow + 1}`).value = 'Shortage';
        ws.getCell(`P${headerRow + 3}`).value = 'Rs.     Cts.';
        
        ws.mergeCells(`Q${headerRow}:Q${headerRow + 3}`);
        ws.getCell(`Q${headerRow}`).value = 'Remarks (*)';

        for (let r = headerRow - 1; r <= headerRow + 3; r++) {
          for (let c = 2; c <= 17; c++) {
            const cell = ws.getCell(r, c);
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.font = { bold: true };
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
            if (r >= headerRow && r <= headerRow + 3) {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' }
              };
            }
          }
        }

        return headerRow + 4;
      };

      const addFooter = (ws, row) => {
        row += 1;
        ws.getCell(`B${row}`).value = 'We do hereby certify that the stocks were physically verified as per above record.';
        ws.getCell(`L${row}`).value = 'Agreed for the above physical verification.';
        ws.getCell(`L${row}`).font = { bold: true };
        row += 2;

        ws.getCell(`B${row}`).value = 'Board of Verification';
        ws.getCell(`B${row}`).font = { bold: true };
        ws.getCell(`L${row}`).value = 'Signature: …………………………..';
        ws.getCell(`L${row}`).font = { bold: true };
        row += 1;

        ws.getCell(`D${row}`).value = 'Name';
        ws.getCell(`D${row}`).font = { bold: true };
        ws.getCell(`F${row}`).value = 'Designation';
        ws.getCell(`F${row}`).font = { bold: true };
        ws.getCell(`G${row}`).value = 'Signature';
        ws.getCell(`G${row}`).font = { bold: true };
        ws.getCell(`H${row}`).value = 'Date';
        ws.getCell(`H${row}`).font = { bold: true };
        ws.getCell(`L${row}`).value = 'Designation : (Store-keeper/Electrical Superintendent/……)';
        row += 1;

        for (let i = 1; i <= 3; i++) {
          ws.getCell(`D${row}`).value = `${i} . …………………………..`;
          ws.getCell(`F${row}`).value = '…………………….';
          ws.getCell(`G${row}`).value = '……………..';
          ws.getCell(`H${row}`).value = '………….';
          if (i === 1) {
            ws.getCell(`L${row}`).value = '(Place the rubber stamp)';
          }
          row += 1;
        }

        ws.getCell(`L${row - 1}`).value = 'Date :';
        ws.getCell(`L${row - 1}`).font = { bold: true };
        row += 2;

        ws.getCell(`B${row}`).value = 'Note :';
        ws.getCell(`B${row}`).font = { bold: true };
        row += 1;

        ws.getCell(`B${row}`).value = 'Columns 1 - 6 should be filled by the store-keeper/electrical superintendent if the format is not generated by the MITFIN Inventory system.';
        row += 1;

        ws.getCell(`B${row}`).value = 'Columns 7 - 15 should be filled by the Board of Verification.';
        row += 2;

        ws.getCell(`B${row}`).value = 'Please indicate in the Remark Column';
        row += 1;

        ws.getCell(`B${row}`).value = '(*)- Status of the stocks -Obsolete,Damage,idle,slow moving and non moving (O,D,I,SM and NM)';
        
        return row;
      };

      setupWorksheet(worksheet);
      let currentRow = 2;
      currentRow = addHeader(worksheet, currentRow);
      currentRow = addTableHeaders(worksheet, currentRow);

      let serialNo = 1;
      let rowCount = 0;
      const maxRowsPerPage = 20;

      for (const item of items) {
        if (rowCount >= maxRowsPerPage) {
          addFooter(worksheet, currentRow);
          
          worksheet = workbook.addWorksheet(`Sheet ${workbook.worksheets.length + 1}`);
          setupWorksheet(worksheet);
          
          currentRow = 2;
          currentRow = addHeader(worksheet, currentRow);
          currentRow = addTableHeaders(worksheet, currentRow);
          rowCount = 0;
        }

        try {
          const itemNumber = getItemProperty(item, 'item_NUMBER', 'ITEM_NUMBER', 'itemNumber') || '';
          const description = getItemProperty(item, 'description', 'DESCRIPTION') || '';
          const unitPrice = parseFloat(getItemProperty(item, 'unit_PRICE', 'UNIT_PRICE', 'unitPrice') || 0);
          const availableQty = parseFloat(getItemProperty(item, 'available_QTY', 'AVAILABLE_QTY', 'availableQty') || 0);
          const uom = getItemProperty(item, 'uom', 'UOM') || '';
          const x = parseInt(getItemProperty(item, 'x', 'X') || 0);
          const y = parseInt(getItemProperty(item, 'y', 'Y') || 0);

          const rowHeight = calculateRowHeight(description);
          worksheet.getRow(currentRow).height = rowHeight;
          
          worksheet.getCell(`B${currentRow}`).value = serialNo++;
          worksheet.getCell(`C${currentRow}`).value = `${x + 1},${y + 1}`;
          worksheet.getCell(`D${currentRow}`).value = itemNumber;
          worksheet.getCell(`E${currentRow}`).value = description;
          worksheet.getCell(`G${currentRow}`).value = uom;
          worksheet.getCell(`H${currentRow}`).value = unitPrice.toFixed(2);

          for (let col = 2; col <= 17; col++) {
            const cell = worksheet.getCell(currentRow, col);
            cell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          }

          currentRow++;
          rowCount++;
        } catch (itemError) {
          console.error('Error processing item:', itemError, item);
        }
      }

      addFooter(worksheet, currentRow);

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const filename = `VerificationSheet_${rackCode}_${Date.now()}.xlsx`;
      console.log('Saving file as:', filename);
      
      saveAs(blob, filename);

      await Swal.fire({
        icon: 'success',
        title: 'Download Complete',
        text: 'Verification sheet has been downloaded successfully!',
        confirmButtonColor: '#10b981',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error generating verification sheet:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: error.message || 'Failed to generate verification sheet. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <PageHeader>
        <div className="store-header-wrapper">
          <h1 className="page-title">Store Verification - Price Update System</h1>
          
          <div className="breadcrumb-navigation">
            <div className="breadcrumb">
              <div 
                className={`breadcrumb-item ${currentView === 'warehouses' ? 'breadcrumb-active' : 'breadcrumb-link'}`}
                onClick={handleBackToWarehouses}
              >
                🏢 Warehouses
              </div>
              
              {selectedWarehouse && (
                <>
                  <span className="breadcrumb-separator">›</span>
                  <div 
                    className={`breadcrumb-item ${currentView === 'racks' ? 'breadcrumb-active' : 'breadcrumb-link'}`}
                    onClick={handleBackToRacks}
                  >
                    📦 {selectedWarehouse.w_CODE} Racks
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
          }
          
          .breadcrumb-link:hover {
            color: #3b82f6;
          }
          
          .section {
            margin-bottom: 40px;
            border-radius: 16px;
            padding: 30px;
            animation: slideInFromRight 0.5s ease-out;
          }
          
          .back-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 20px;
            background: #6b7280;
            color: white;
          }
          
          .back-button:hover {
            transform: translateY(-2px);
            background: #4b5563;
          }

          .download-section {
            margin-bottom: 20px;
            padding: 16px;
            background: #f0f9ff;
            border-radius: 8px;
            border: 2px solid #0ea5e9;
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .download-btn {
            padding: 10px 20px;
            background: #0094ff;
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
          }

          .download-btn:hover:not(:disabled) {
            background: #0077cc;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 148, 255, 0.3);
          }

          .download-btn:disabled {
            background: #94a3b8;
            cursor: not-allowed;
            opacity: 0.6;
          }

          .spinner {
            border: 2px solid transparent;
            border-top-color: white;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
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
        
        <div className="row">
          <div className="section">
            <WarehouseMap
              onWarehouseSelect={handleWarehouseSelect}
              selectedWarehouse={selectedWarehouse}
            />
          </div>

          {selectedWarehouse && (
            <div ref={racksRef} className="section">
              <button 
                className="back-button"
                onClick={handleBackToWarehouses}
              >
                ← Back to Warehouses
              </button>

              {selectedRack && (
                <div className="download-section">
                  <button
                    className="download-btn"
                    onClick={generatePriceUpdateSheet}
                    disabled={downloading}
                  >
                    {downloading && <div className="spinner"></div>}
                    📊 Download Verification Sheet
                  </button>
                </div>
              )}

              <PriceUpdateRackGrid
                warehouseId={selectedWarehouse.w_ID || selectedWarehouse.W_ID}
                onRackSelect={handleRackSelect}
                selectedRack={selectedRack}
              />
              
              {selectedRack && (
                <div ref={itemsRef} style={{ marginTop: '20px' }}>
                  {/* Items will be rendered inside PriceUpdateRackGrid */}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Index;