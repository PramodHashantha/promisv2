import React, { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { 
  rackAPI,
  storeAPI,
  warehouseAPI
} from "../../../utils/api/storeView";
import LoadingSpinner from '../../loading/LoadingSpinner';

const ItemsView = ({ rackId, warehouseId, rackCode }) => {
  const [rackData, setRackData] = useState(null);
  const [items, setItems] = useState([]);
  const [warehouseData, setWarehouseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!rackId || !warehouseId || !rackCode) {
      console.log('ItemsView: Missing required props', { rackId, warehouseId, rackCode });
      if (!rackId) {
        setItems([]);
        setRackData(null);
        setError(null);
      }
      return;
    }

    let isMounted = true;
    
    const loadData = async () => {
      if (!isMounted || !rackId || !warehouseId) {
        return;
      }
      
      await fetchRackItems();
      
      if (isMounted && warehouseId) {
        await fetchWarehouseData();
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [rackId, warehouseId, rackCode]);

  const getItemProperty = (item, propName) => {
    if (item[propName] !== undefined) return item[propName];
    const keys = Object.keys(item);
    const foundKey = keys.find(key => key.toLowerCase() === propName.toLowerCase());
    if (foundKey) return item[foundKey];
    return null;
  };

  const fetchWarehouseData = async () => {
    if (!warehouseId) {
      console.warn('fetchWarehouseData called without warehouseId');
      return;
    }

    try {
      const response = await warehouseAPI.getWarehouseById(warehouseId);
      if (response) {
        setWarehouseData(response);
      }
    } catch (error) {
      console.error('Error fetching warehouse data:', error);
    }
  };

  const fetchRackItems = async () => {
    if (!rackId || !warehouseId || !rackCode) {
      console.warn('fetchRackItems called with missing props:', { rackId, warehouseId, rackCode });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (!rackId || !warehouseId) {
        console.warn('Props became null during delay');
        setLoading(false);
        return;
      }
      
      const [rackResponse, itemsResponse] = await Promise.all([
        rackAPI.getRackById(rackId).catch(err => {
          console.warn('Rack API failed:', err);
          return null;
        }),
        storeAPI.getStoresByRackId(rackId).catch(err => {
          console.error('Items API failed:', err);
          throw err;
        })
      ]);

      if (itemsResponse && Array.isArray(itemsResponse)) {
        setItems(itemsResponse);
      } else {
        setItems([]);
      }

      let rack = null;
      
      if (Array.isArray(rackResponse) && rackResponse.length > 0) {
        rack = rackResponse[0];
      } else if (rackResponse && typeof rackResponse === 'object' && !Array.isArray(rackResponse)) {
        rack = rackResponse;
      } else if (itemsResponse && itemsResponse.length > 0) {
        let maxX = 0;
        let maxY = 0;
        
        itemsResponse.forEach(item => {
          const itemX = parseInt(getItemProperty(item, 'x') || 0);
          const itemY = parseInt(getItemProperty(item, 'y') || 0);
          if (itemX > maxX) maxX = itemX;
          if (itemY > maxY) maxY = itemY;
        });
        
        rack = {
          r_ID: rackId,
          r_CODE: rackCode,
          x: maxX + 1,
          y: maxY + 1,
          w_ID: warehouseId
        };
      }

      if (rack) {
        setRackData(rack);
      }
      
    } catch (error) {
      console.error('Error fetching rack items:', error);
      setError('Failed to load rack details. Please try again.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const groupItemsByPosition = () => {
    const grouped = {};
    items.forEach(item => {
      const x = parseInt(getItemProperty(item, 'x') || 0);
      const y = parseInt(getItemProperty(item, 'y') || 0);
      const key = `${x + 1},${y + 1}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });
    return grouped;
  };

  const calculateRowHeight = (description, maxChars = 33, baseHeight = 15.6) => {
    if (!description) return baseHeight;
    const rows = Math.ceil(description.length / maxChars);
    return rows * baseHeight;
  };

  const addHeader = (worksheet, currentRow) => {
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

  const generateVerificationSheet = async (includeBalance = true, includePrice = true) => {
    try {
      setDownloading(true);

      const workbook = new ExcelJS.Workbook();
      let worksheet = workbook.addWorksheet('Verification Sheet');
      
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

        const itemNumber = getItemProperty(item, 'item_NUMBER') || '';
        const description = getItemProperty(item, 'description') || '';
        const unitPrice = parseFloat(getItemProperty(item, 'unit_PRICE') || 0);
        const availableQty = parseFloat(getItemProperty(item, 'available_QTY') || 0);
        const uom = getItemProperty(item, 'uom') || '';
        const x = parseInt(getItemProperty(item, 'x') || 0);
        const y = parseInt(getItemProperty(item, 'y') || 0);

        const rowHeight = calculateRowHeight(description);
        
        worksheet.getRow(currentRow).height = rowHeight;
        
        worksheet.getCell(`B${currentRow}`).value = serialNo++;
        worksheet.getCell(`C${currentRow}`).value = `${x + 1},${y + 1}`;
        worksheet.getCell(`D${currentRow}`).value = itemNumber;
        worksheet.getCell(`E${currentRow}`).value = description;
        worksheet.getCell(`G${currentRow}`).value = uom;
        
        if (includePrice) {
          worksheet.getCell(`H${currentRow}`).value = unitPrice.toFixed(2);
        }
        
        if (includeBalance) {
          worksheet.getCell(`I${currentRow}`).value = availableQty.toFixed(2);
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

      addFooter(worksheet, currentRow);

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const fileName = includeBalance 
        ? `VerificationSheet_${rackCode}_${Date.now()}.xlsx`
        : `VerificationSheet_NoBalance_${rackCode}_${Date.now()}.xlsx`;
      
      saveAs(blob, fileName);

      await Swal.fire({
        icon: 'success',
        title: 'Download Complete',
        text: 'Verification sheet has been downloaded successfully!',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'OK',
        timer: 2000,
        timerProgressBar: true
      });
      
    } catch (error) {
      console.error('Error generating verification sheet:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: 'Failed to generate verification sheet. Please try again.',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      });
    } finally {
      setDownloading(false);
    }
  };

  const generateVerificationReport = async () => {
    try {
      setDownloading(true);

      const workbook = new ExcelJS.Workbook();
      let worksheet = workbook.addWorksheet('Verification Report');
      
      setupWorksheet(worksheet);
      
      let currentRow = 2;
      currentRow = addHeader(worksheet, currentRow);
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
          currentRow = addHeader(worksheet, currentRow);
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
      
      saveAs(blob, `VerificationReport_${rackCode}_${Date.now()}.xlsx`);

      await Swal.fire({
        icon: 'success',
        title: 'Download Complete',
        text: 'Verification report has been downloaded successfully!',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'OK',
        timer: 2000,
        timerProgressBar: true
      });
      
    } catch (error) {
      console.error('Error generating verification report:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: 'Failed to generate verification report. Please try again.',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleDownload = async (type) => {
    try {
      if (type === 'with_balance') {
        await generateVerificationSheet(true, true);
      } else if (type === 'without_balance') {
        await generateVerificationSheet(false, false);
      } else if (type === 'report') {
        await generateVerificationReport();
      } else if (type === 'report_without_balance') {
        await generateVerificationSheet(false, true);
      }
    } catch (error) {
      console.error('Error downloading:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: 'Failed to download file. Please try again.',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      });
    }
  };

  if (!rackId) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <div style={{ fontSize: '3.75rem', color: '#9ca3af', marginBottom: '1rem' }}>📦</div>
        <p style={{ color: '#6b7280' }}>Please select a rack to view items</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <LoadingSpinner text="Loading items..." size="large" variant="primary" />
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
          onClick={fetchRackItems}
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

  const groupedItems = groupItemsByPosition();

  return (
    <div className="items-view-container">
      <style>{`
        .items-view-container {
          padding: 20px 0;
        }
        
        .verification-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: inherit;
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
        
        .position-section {
          margin-bottom: 30px;
        }
        
        .position-header {
          background: #fbbf24;
          color: #000;
          padding: 8px 16px;
          font-weight: 700;
          font-size: 16px;
          border-radius: 6px 6px 0 0;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-radius: 0 0 6px 6px;
          overflow: hidden;
        }
        
        .items-table thead {
          background: #fbbf24;
        }
        
        .items-table th {
          padding: 12px 15px;
          text-align: left;
          font-weight: 700;
          color: #000;
          font-size: 14px;
          border-bottom: 2px solid #f59e0b;
        }
        
        .items-table th:last-child {
          text-align: right;
        }
        
        .items-table tbody tr {
          border-bottom: 1px solid #e5e7eb;
          transition: background 0.2s;
        }
        
        .items-table tbody tr:hover {
          background: #f9fafb;
        }
        
        .items-table tbody tr:last-child {
          border-bottom: none;
        }
        
        .items-table td {
          padding: 15px;
          color: #374151;
          font-size: 13px;
        }
        
        .item-number {
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 3px;
        }
        
        .item-description {
          color: #6b7280;
          font-size: 12px;
          line-height: 1.4;
        }
        
        .item-price {
          color: #374151;
          font-size: 13px;
        }
        
        .item-qty {
          text-align: right;
          font-weight: 600;
          color: #1f2937;
        }
        
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #9ca3af;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .items-view-container {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
      
      <div className="verification-buttons">
        <button 
          className="brand-btn-primary"
          onClick={() => handleDownload('with_balance')}
          disabled={downloading || items.length === 0}
        >
          {downloading && <div className="spinner"></div>}
          📄 DOWNLOAD VERIFICATION SHEET
        </button>
        <button 
          className="brand-btn-success"
          onClick={() => handleDownload('without_balance')}
          disabled={downloading || items.length === 0}
        >
          {downloading && <div className="spinner"></div>}
          📝 DOWNLOAD VERIFICATION SHEET WITHOUT BOOK BALANCE
        </button>
        <button 
          className="brand-btn-primary"
          onClick={() => handleDownload('report')}
          disabled={downloading || items.length === 0}
        >
          {downloading && <div className="spinner"></div>}
          📊 DOWNLOAD VERIFICATION REPORT
        </button>
        <button 
          className="brand-btn-warning"
          onClick={() => handleDownload('report_without_balance')}
          disabled={downloading || items.length === 0}
        >
          {downloading && <div className="spinner"></div>}
          📋 DOWNLOAD VERIFICATION REPORT WITHOUT BOOK BALANCE & WITH PRICE
        </button>
      </div>
      
      {items.length > 0 ? (
        Object.keys(groupedItems).sort().map((position) => {
          const positionItems = groupedItems[position];
          
          return (
            <div key={position} className="position-section">
              <div className="position-header">
                ({position})
              </div>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Item No</th>
                    <th>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {positionItems.map((item, index) => {
                    const itemNumber = getItemProperty(item, 'item_NUMBER') || 
                                      getItemProperty(item, 'itemNumber') || 
                                      getItemProperty(item, 'ITEM_NUMBER') || '';
                    
                    const description = getItemProperty(item, 'description') || 
                                       getItemProperty(item, 'DESCRIPTION') || '';
                    
                    const unitPrice = getItemProperty(item, 'unit_PRICE') || 
                                     getItemProperty(item, 'unitPrice') || 
                                     getItemProperty(item, 'UNIT_PRICE') || 0;
                    
                    const availableQty = getItemProperty(item, 'available_QTY') || 
                                        getItemProperty(item, 'availableQty') || 
                                        getItemProperty(item, 'AVAILABLE_QTY') || 0;
                    
                    const uom = getItemProperty(item, 'uom') || 
                               getItemProperty(item, 'UOM') || '';
                    
                    return (
                      <tr key={index}>
                        <td>
                          <div className="item-number">{itemNumber}</div>
                          <div className="item-description">{description}</div>
                          <div className="item-price">
                            Unit Price Rs.{parseFloat(unitPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="item-qty">
                          {parseFloat(availableQty || 0).toFixed(2)} ({uom})
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })
      ) : (
        <div className="empty-state">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <p>No items found for this rack</p>
        </div>
      )}
    </div>
  );
};

export default ItemsView;