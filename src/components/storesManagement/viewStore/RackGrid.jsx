import React, { useState, useEffect } from 'react';
import { rackAPI, storeAPI, warehouseAPI } from '../../../utils/api/storeView';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import LoadingSpinner from '../../loading/LoadingSpinner';

const RackGrid = ({ warehouseId, onRackSelect, selectedRack, hideDownloadButton = false }) => {
  const [racks, setRacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [warehouseData, setWarehouseData] = useState(null);

  useEffect(() => {
    console.log('RackGrid: warehouseId changed to:', warehouseId);
    if (warehouseId) {
      fetchRacks();
      fetchWarehouseData();
    } else {
      console.log('RackGrid: No warehouse ID, clearing racks');
      setRacks([]);
    }
  }, [warehouseId]);

  const fetchWarehouseData = async () => {
    try {
      const response = await warehouseAPI.getWarehouseById(warehouseId);
      if (response) {
        setWarehouseData(response);
      }
    } catch (error) {
      console.error('Error fetching warehouse data:', error);
    }
  };

  const fetchRacks = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('RackGrid: Fetching racks for warehouse ID:', warehouseId);
      
      const data = await rackAPI.getAllRacksByWarehouseId(warehouseId);
      console.log('RackGrid: Racks API response data:', data);
      
      if (Array.isArray(data)) {
        setRacks(data);
        console.log(`RackGrid: Successfully loaded ${data.length} racks`);
      } else {
        setRacks([]);
        console.warn('RackGrid: API response is not an array:', data);
      }
    } catch (error) {
      console.error('RackGrid: Error fetching racks:', error);
      setError('Failed to load racks. Please try again.');
      setRacks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRackClick = (rack) => {
    console.log('RackGrid: Rack clicked:', rack);
    onRackSelect(rack);
  };

  const getItemProperty = (item, propName) => {
    if (item[propName] !== undefined) return item[propName];
    const keys = Object.keys(item);
    const foundKey = keys.find(key => key.toLowerCase() === propName.toLowerCase());
    if (foundKey) return item[foundKey];
    return null;
  };

  const calculateRowHeight = (description, maxChars = 33, baseHeight = 15.6) => {
    if (!description) return baseHeight;
    const rows = Math.ceil(description.length / maxChars);
    return rows * baseHeight;
  };

  const setupWorksheet = (worksheet) => {
    worksheet.getColumn(1).width = 3.7;
    worksheet.getColumn(4).width = 10;
    worksheet.getColumn(5).width = 30;
    worksheet.getColumn(6).width = 13.4;
    worksheet.getColumn(7).width = 9.4;
    worksheet.getColumn(8).width = 12;
    worksheet.getColumn(9).width = 12;
    worksheet.getColumn(10).width = 12;
    worksheet.getColumn(11).width = 12;
    worksheet.getColumn(12).width = 12;
    worksheet.getColumn(13).width = 12;
    worksheet.getColumn(14).width = 12;
    worksheet.getColumn(15).width = 12;
    worksheet.getColumn(16).width = 12;
    worksheet.getColumn(17).width = 12;

    worksheet.pageSetup = {
      paperSize: 9,
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.25,
        bottom: 0.25,
        header: 0,
        footer: 0
      }
    };
  };

  const addHeader = (worksheet, currentRow, rackCode) => {
    worksheet.getCell(`B${currentRow}`).value = 'TO BE FILLED IN TRIPLICATE';
    worksheet.getCell(`B${currentRow}`).font = { bold: true };
    worksheet.getCell(`P${currentRow}`).value = 'Form - AV/1/A';
    worksheet.getCell(`P${currentRow}`).font = { bold: true };
    currentRow += 2;

    worksheet.getCell(`B${currentRow}`).value = '1. ORIGINAL    :  Accountant';
    worksheet.getCell(`B${currentRow}`).font = { bold: true };
    worksheet.getCell(`K${currentRow}`).value = 'Sheet No. ….';
    worksheet.getCell(`K${currentRow}`).font = { bold: true };
    currentRow += 1;

    worksheet.getCell(`B${currentRow}`).value = '2. DUPLICATE  : (Unit) ';
    worksheet.getCell(`B${currentRow}`).font = { bold: true };
    worksheet.getCell(`K${currentRow}`).value = 'Date of Verification: …………';
    worksheet.getCell(`K${currentRow}`).font = { bold: true };
    currentRow += 1;

    worksheet.getCell(`B${currentRow}`).value = '3. TRIPLICATE  : Store-keeper/E.S.(C.S.C.)';
    worksheet.getCell(`B${currentRow}`).font = { bold: true };
    
    const warehouseName = warehouseData ? 
      `${warehouseData.w_CODE || ''} - ${warehouseData.w_NAME || ''}` : 
      'Warehouse';
    worksheet.getCell(`K${currentRow}`).value = `Warehouse: ${warehouseName}`;
    worksheet.getCell(`K${currentRow}`).font = { bold: true };
    currentRow += 1;

    worksheet.getCell(`K${currentRow}`).value = `Rack No: ${rackCode}`;
    worksheet.getCell(`K${currentRow}`).font = { bold: true };
    currentRow += 2;

    worksheet.getCell(`B${currentRow}`).value = `ANNUAL VERIFICATION OF STORES/STOCKS - ${new Date().getFullYear()}`;
    worksheet.getCell(`B${currentRow}`).font = { bold: true, size: 14, underline: true };
    currentRow += 2;

    return currentRow;
  };

  const addTableHeaders = (worksheet, currentRow) => {
    const columns = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'];
    columns.forEach((col, idx) => {
      worksheet.getCell(currentRow, idx + 2).value = col;
    });
    currentRow += 1;

    const headerRow = currentRow;
    
    worksheet.mergeCells(`B${headerRow}:B${headerRow + 3}`);
    worksheet.getCell(`B${headerRow}`).value = 'Serial No.';
    
    worksheet.mergeCells(`C${headerRow}:C${headerRow + 3}`);
    worksheet.getCell(`C${headerRow}`).value = 'Bin No';
    
    worksheet.mergeCells(`D${headerRow}:D${headerRow + 3}`);
    worksheet.getCell(`D${headerRow}`).value = 'Code No.';
    
    worksheet.mergeCells(`E${headerRow}:E${headerRow + 3}`);
    worksheet.getCell(`E${headerRow}`).value = 'Description';
    
    worksheet.mergeCells(`F${headerRow}:F${headerRow + 3}`);
    worksheet.getCell(`F${headerRow}`).value = 'Grade';
    
    worksheet.mergeCells(`G${headerRow}:G${headerRow + 3}`);
    worksheet.getCell(`G${headerRow}`).value = 'UOM';
    
    worksheet.mergeCells(`H${headerRow}:H${headerRow + 2}`);
    worksheet.getCell(`H${headerRow}`).value = 'Standard Price';
    worksheet.getCell(`H${headerRow + 3}`).value = 'Rs.     Cts.';
    
    worksheet.mergeCells(`I${headerRow}:L${headerRow}`);
    worksheet.getCell(`I${headerRow}`).value = 'Q   U   A   N   T   I   T   Y';
    
    worksheet.mergeCells(`M${headerRow}:P${headerRow}`);
    worksheet.getCell(`M${headerRow}`).value = 'V   A    L   U   E';
    
    worksheet.mergeCells(`I${headerRow + 1}:I${headerRow + 3}`);
    worksheet.getCell(`I${headerRow + 1}`).value = 'Book Balance';
    worksheet.mergeCells(`J${headerRow + 1}:J${headerRow + 3}`);
    worksheet.getCell(`J${headerRow + 1}`).value = 'Physical Balance';
    worksheet.mergeCells(`K${headerRow + 1}:K${headerRow + 3}`);
    worksheet.getCell(`K${headerRow + 1}`).value = 'Surplus';
    worksheet.mergeCells(`L${headerRow + 1}:L${headerRow + 3}`);
    worksheet.getCell(`L${headerRow + 1}`).value = 'Shortage';
    
    worksheet.mergeCells(`M${headerRow + 1}:M${headerRow + 2}`);
    worksheet.getCell(`M${headerRow + 1}`).value = 'Book Value';
    worksheet.getCell(`M${headerRow + 3}`).value = 'Rs.     Cts.';
    
    worksheet.mergeCells(`N${headerRow + 1}:N${headerRow + 2}`);
    worksheet.getCell(`N${headerRow + 1}`).value = 'Physical Value';
    worksheet.getCell(`N${headerRow + 3}`).value = 'Rs.     Cts.';
    
    worksheet.mergeCells(`O${headerRow + 1}:O${headerRow + 2}`);
    worksheet.getCell(`O${headerRow + 1}`).value = 'Surplus';
    worksheet.getCell(`O${headerRow + 3}`).value = 'Rs.     Cts.';
    
    worksheet.mergeCells(`P${headerRow + 1}:P${headerRow + 2}`);
    worksheet.getCell(`P${headerRow + 1}`).value = 'Shortage';
    worksheet.getCell(`P${headerRow + 3}`).value = 'Rs.     Cts.';
    
    worksheet.mergeCells(`Q${headerRow}:Q${headerRow + 3}`);
    worksheet.getCell(`Q${headerRow}`).value = 'Remarks (*)';

    for (let row = headerRow - 1; row <= headerRow + 3; row++) {
      for (let col = 2; col <= 17; col++) {
        const cell = worksheet.getCell(row, col);
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.font = { bold: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        if (row >= headerRow && row <= headerRow + 3) {
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

  const addFooter = (worksheet, currentRow) => {
    currentRow += 1;
    worksheet.getCell(`B${currentRow}`).value = 'We do hereby certify that the stocks were physically verified as per above record.';
    worksheet.getCell(`L${currentRow}`).value = 'Agreed for the above physical verification.';
    worksheet.getCell(`L${currentRow}`).font = { bold: true };
    currentRow += 2;

    worksheet.getCell(`B${currentRow}`).value = 'Board of Verification';
    worksheet.getCell(`B${currentRow}`).font = { bold: true };
    worksheet.getCell(`L${currentRow}`).value = 'Signature: …………………………..';
    worksheet.getCell(`L${currentRow}`).font = { bold: true };
    currentRow += 1;

    worksheet.getCell(`D${currentRow}`).value = 'Name';
    worksheet.getCell(`D${currentRow}`).font = { bold: true };
    worksheet.getCell(`F${currentRow}`).value = 'Designation';
    worksheet.getCell(`F${currentRow}`).font = { bold: true };
    worksheet.getCell(`G${currentRow}`).value = 'Signature';
    worksheet.getCell(`G${currentRow}`).font = { bold: true };
    worksheet.getCell(`H${currentRow}`).value = 'Date';
    worksheet.getCell(`H${currentRow}`).font = { bold: true };
    worksheet.getCell(`L${currentRow}`).value = 'Designation : (Store-keeper/Electrical Superintendent/……)';
    currentRow += 1;

    for (let i = 1; i <= 3; i++) {
      worksheet.getCell(`D${currentRow}`).value = `${i} . …………………………..`;
      worksheet.getCell(`F${currentRow}`).value = '…………………….';
      worksheet.getCell(`G${currentRow}`).value = '……………..';
      worksheet.getCell(`H${currentRow}`).value = '………….';
      if (i === 1) {
        worksheet.getCell(`L${currentRow}`).value = '(Place the rubber stamp)';
      }
      currentRow += 1;
    }

    worksheet.getCell(`L${currentRow - 1}`).value = 'Date :';
    worksheet.getCell(`L${currentRow - 1}`).font = { bold: true };
    currentRow += 2;

    worksheet.getCell(`B${currentRow}`).value = 'Note :';
    worksheet.getCell(`B${currentRow}`).font = { bold: true };
    currentRow += 1;

    worksheet.getCell(`B${currentRow}`).value = 'Columns 1 - 6 should be filled by the store-keeper/electrical superintendent if the format is not generated by the MITFIN Inventory system.';
    currentRow += 1;

    worksheet.getCell(`B${currentRow}`).value = 'Columns 7 - 15 should be filled by the Board of Verification.';
    currentRow += 2;

    worksheet.getCell(`B${currentRow}`).value = 'Please indicate in the Remark Column';
    currentRow += 1;

    worksheet.getCell(`B${currentRow}`).value = '(*)- Status of the stocks -Obsolete,Damage,idle,slow moving and non moving (O,D,I,SM and NM)';
    
    return currentRow;
  };

  const generateVerificationReportForRack = async (rackId, rackCode) => {
    try {
      console.log(`Generating Excel for rack: ${rackCode} (ID: ${rackId})`);
      
      const itemsResponse = await storeAPI.getStoresByRackId(rackId);
      const items = Array.isArray(itemsResponse) ? itemsResponse : [];
      
      if (items.length === 0) {
        console.warn(`No items found for rack ${rackCode}`);
        return;
      }

      console.log(`Found ${items.length} items for rack ${rackCode}`);

      const workbook = new ExcelJS.Workbook();
      let worksheet = workbook.addWorksheet('Verification Report');
      
      setupWorksheet(worksheet);
      
      let currentRow = 2;
      currentRow = addHeader(worksheet, currentRow, rackCode);
      currentRow = addTableHeaders(worksheet, currentRow);

      let serialNo = 1;
      let rowCount = 0;
      const maxRowsPerPage = 20;
      
      let totalBookValue = 0;
      let totalPhysicalValue = 0;
      let totalSurplus = 0;
      let totalShortage = 0;

      for (const item of items) {
        if (rowCount >= maxRowsPerPage) {
          addFooter(worksheet, currentRow);
          
          worksheet = workbook.addWorksheet(`Sheet ${workbook.worksheets.length + 1}`);
          setupWorksheet(worksheet);
          
          currentRow = 2;
          currentRow = addHeader(worksheet, currentRow, rackCode);
          currentRow = addTableHeaders(worksheet, currentRow);
          rowCount = 0;
        }

        const itemNumber = getItemProperty(item, 'item_NUMBER') || '';
        const description = getItemProperty(item, 'description') || '';
        const unitPrice = parseFloat(getItemProperty(item, 'unit_PRICE') || 0);
        const availableQty = parseFloat(getItemProperty(item, 'available_QTY') || 0);
        const uom = getItemProperty(item, 'uom') || '';
        const x = parseInt(getItemProperty(item, 'x') || 0);
        const y = parseInt(getItemProperty(item, 'y') || 0);

        const bookBalance = availableQty;
        const physicalBalance = availableQty;
        const qtyDifference = physicalBalance - bookBalance;
        
        const bookValue = bookBalance * unitPrice;
        const physicalValue = physicalBalance * unitPrice;
        const valueDifference = physicalValue - bookValue;

        totalBookValue += bookValue;
        totalPhysicalValue += physicalValue;
        
        if (valueDifference > 0) {
          totalSurplus += valueDifference;
        } else if (valueDifference < 0) {
          totalShortage += Math.abs(valueDifference);
        }

        const rowHeight = calculateRowHeight(description);
        worksheet.getRow(currentRow).height = rowHeight;
        
        worksheet.getCell(`B${currentRow}`).value = serialNo++;
        worksheet.getCell(`C${currentRow}`).value = `${x + 1},${y + 1}`;
        worksheet.getCell(`D${currentRow}`).value = itemNumber;
        worksheet.getCell(`E${currentRow}`).value = description;
        worksheet.getCell(`G${currentRow}`).value = uom;
        worksheet.getCell(`H${currentRow}`).value = unitPrice.toFixed(2);
        worksheet.getCell(`I${currentRow}`).value = bookBalance.toFixed(2);
        worksheet.getCell(`J${currentRow}`).value = physicalBalance.toFixed(2);
        
        if (qtyDifference > 0) {
          worksheet.getCell(`K${currentRow}`).value = qtyDifference.toFixed(2);
          worksheet.getCell(`L${currentRow}`).value = ' - ';
        } else if (qtyDifference < 0) {
          worksheet.getCell(`K${currentRow}`).value = ' - ';
          worksheet.getCell(`L${currentRow}`).value = Math.abs(qtyDifference).toFixed(2);
        } else {
          worksheet.getCell(`K${currentRow}`).value = ' - ';
          worksheet.getCell(`L${currentRow}`).value = ' - ';
        }
        
        worksheet.getCell(`M${currentRow}`).value = bookValue.toFixed(2);
        worksheet.getCell(`N${currentRow}`).value = physicalValue.toFixed(2);
        
        if (valueDifference > 0) {
          worksheet.getCell(`O${currentRow}`).value = valueDifference.toFixed(2);
          worksheet.getCell(`P${currentRow}`).value = ' - ';
        } else if (valueDifference < 0) {
          worksheet.getCell(`O${currentRow}`).value = ' - ';
          worksheet.getCell(`P${currentRow}`).value = Math.abs(valueDifference).toFixed(2);
        } else {
          worksheet.getCell(`O${currentRow}`).value = ' - ';
          worksheet.getCell(`P${currentRow}`).value = ' - ';
        }

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
      }

      ['M', 'N', 'O', 'P'].forEach(col => {
        const cell = worksheet.getCell(`${col}${currentRow}`);
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      
      worksheet.getCell(`M${currentRow}`).value = totalBookValue.toFixed(2);
      worksheet.getCell(`N${currentRow}`).value = totalPhysicalValue.toFixed(2);
      worksheet.getCell(`O${currentRow}`).value = totalSurplus.toFixed(2);
      worksheet.getCell(`P${currentRow}`).value = totalShortage.toFixed(2);

      addFooter(worksheet, currentRow + 1);

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      saveAs(blob, `${rackCode}.xlsx`);
      
      console.log(`Successfully generated Excel for rack ${rackCode}`);
      
    } catch (error) {
      console.error(`Error generating Excel for rack ${rackCode}:`, error);
      throw error;
    }
  };

  const handleDownloadAllReports = async () => {
    if (racks.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'No Racks Available',
        text: 'No racks available to download reports.',
        confirmButtonColor: '#fbbf24',
        confirmButtonText: 'OK'
      });
      return;
    }

    const result = await Swal.fire({
      icon: 'question',
      title: 'Download All Reports',
      html: `This will download verification reports for all <strong>${racks.length} racks</strong>.<br><br>This may take several minutes. Continue?`,
      showCancelButton: true,
      confirmButtonColor: '#fbbf24',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Download All',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDownloadingAll(true);
      setDownloadProgress({ current: 0, total: racks.length, status: 'starting' });

      const results = [];
      
      for (let i = 0; i < racks.length; i++) {
        const rack = racks[i];
        const rackId = rack.r_ID || rack.R_ID;
        const rackCode = rack.r_CODE || rack.R_CODE;

        setDownloadProgress({
          current: i + 1,
          total: racks.length,
          rackCode: rackCode,
          status: 'downloading'
        });

        try {
          await generateVerificationReportForRack(rackId, rackCode);
          
          results.push({ rackCode, success: true });

          setDownloadProgress({
            current: i + 1,
            total: racks.length,
            rackCode: rackCode,
            status: 'success'
          });

          if (i < racks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          console.error(`Error downloading report for rack ${rackCode}:`, error);
          results.push({ rackCode, success: false, error: error.message });
          
          setDownloadProgress({
            current: i + 1,
            total: racks.length,
            rackCode: rackCode,
            status: 'error',
            error: error.message
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      let htmlMessage = `
        <div style="text-align: left;">
          <p><strong>Successful:</strong> ${successCount}</p>
          <p><strong>Failed:</strong> ${failureCount}</p>
      `;
      
      if (failureCount > 0) {
        const failedRacks = results.filter(r => !r.success).map(r => r.rackCode).join(', ');
        htmlMessage += `<br><p><strong>Failed racks:</strong> ${failedRacks}</p>`;
      }

      htmlMessage += '<br><p>Please check your Downloads folder.</p></div>';

      await Swal.fire({
        icon: successCount > 0 ? 'success' : 'error',
        title: 'Download Complete',
        html: htmlMessage,
        confirmButtonColor: '#10b981',
        confirmButtonText: 'OK'
      });
      
    } catch (error) {
      console.error('Error downloading all reports:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: 'Failed to download all reports. Please try again.',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      });
    } finally {
      setDownloadingAll(false);
      setDownloadProgress(null);
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
    <div className="rack-grid-container">
      <style jsx>{`
        .rack-grid-container {
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
        
        .download-all-section {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: #f0f9ff;
          border-radius: 0.5rem;
          border: 2px solid #0ea5e9;
        }
        
        .download-all-btn {
          padding: 0.75rem 1.5rem;
          background: #0094ff;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .download-all-btn:hover:not(:disabled) {
          background: #0077cc;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 148, 255, 0.3);
        }
        
        .download-all-btn:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        .progress-indicator {
          margin-top: 1rem;
          padding: 0.75rem;
          background: white;
          border-radius: 0.375rem;
          border: 1px solid #e5e7eb;
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        
        .progress-fill {
          height: 100%;
          background: #0094ff;
          transition: width 0.3s ease;
        }
        
        .progress-text {
          font-size: 0.875rem;
          color: #4b5563;
          text-align: center;
        }
        
        .progress-status {
          font-size: 0.75rem;
          color: #6b7280;
          text-align: center;
          margin-top: 0.25rem;
        }
        
        .progress-status.success {
          color: #10b981;
        }
        
        .progress-status.error {
          color: #ef4444;
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
        
        .rack-card.unit:hover {
          border-color: #5f9ea0;
        }
        
        .rack-card.unit.selected {
          border-color: #10b981;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
          color: #6b7280;
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
          opacity: 0.8;
        }
        
        .rack-card.unit .rack-code {
          color: rgba(255, 255, 255, 0.8);
        }
        
        .rack-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          background: #fbbf24;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
        }
        
        .rack-card.unit .rack-badge {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .spinner {
          border: 2px solid transparent;
          border-top-color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .rack-card {
          animation: slideInUp 0.5s ease-out forwards;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <div className="rack-header">
        <h2 className="rack-title">Storage Racks</h2>
        <p className="rack-subtitle">Select a rack to view its contents and manage items ({racks.length} racks found)</p>
      </div>
      
      {!hideDownloadButton && racks.length > 0 && (
        <div className="download-all-section">
          <button 
            className="download-all-btn"
            onClick={handleDownloadAllReports}
            disabled={downloadingAll}
          >
            {downloadingAll ? (
              <>
                <div className="spinner"></div>
                Downloading...
              </>
            ) : (
              <>
                📊 Download All Verification Reports
              </>
            )}
          </button>
          
          {downloadProgress && (
            <div className="progress-indicator">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(downloadProgress.current / downloadProgress.total) * 100}%` }}
                />
              </div>
              <div className="progress-text">
                Downloading {downloadProgress.current} of {downloadProgress.total} racks
              </div>
              {downloadProgress.rackCode && (
                <div className={`progress-status ${downloadProgress.status}`}>
                  {downloadProgress.status === 'downloading' && `Processing: ${downloadProgress.rackCode}`}
                  {downloadProgress.status === 'success' && `✓ Completed: ${downloadProgress.rackCode}`}
                  {downloadProgress.status === 'error' && `✗ Failed: ${downloadProgress.rackCode}`}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
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
                {isUnit && <div className="rack-badge">UNIT</div>}
                
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
    </div>
  );
};

export default RackGrid;