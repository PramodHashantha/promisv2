import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// Helper function to convert number to words (for GRN total)
const numberToWords = (number) => {
  try {
    if (number === 0) return "Zero";

    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const thousands = ["", "Thousand", "Million", "Billion"];

    const integerPart = Math.floor(number);
    const decimalPart = Math.round((number - integerPart) * 100);

    let result = convertIntegerToWords(integerPart, ones, teens, tens, thousands);

    if (decimalPart > 0) {
      result += " and " + convertIntegerToWords(decimalPart, ones, teens, tens, thousands) + " Cents";
    }

    return result + " Rupees Only";
  } catch {
    return number.toFixed(2);
  }
};

const convertIntegerToWords = (number, ones, teens, tens, thousands) => {
  if (number === 0) return "";

  let result = "";
  let groupIndex = 0;
  let num = number;

  while (num > 0) {
    const group = num % 1000;
    if (group !== 0) {
      const groupWords = convertGroupToWords(group, ones, teens, tens);
      result = groupWords + " " + thousands[groupIndex] + " " + result;
    }
    num = Math.floor(num / 1000);
    groupIndex++;
  }

  return result.trim();
};

const convertGroupToWords = (group, ones, teens, tens) => {
  let result = "";

  const hundreds = Math.floor(group / 100);
  const remainder = group % 100;

  if (hundreds > 0) {
    result += ones[hundreds] + " Hundred ";
  }

  if (remainder >= 10 && remainder < 20) {
    result += teens[remainder - 10] + " ";
  } else {
    const tensDigit = Math.floor(remainder / 10);
    const onesDigit = remainder % 10;

    if (tensDigit > 0) {
      result += tens[tensDigit] + " ";
    }

    if (onesDigit > 0) {
      result += ones[onesDigit] + " ";
    }
  }

  return result.trim();
};

// Function to get PFNO from localStorage
export const getPFNO = () => {
  // Try to get from localStorage with various possible keys
  let pfno = localStorage.getItem("pfno") || 
             localStorage.getItem("PFNO") || 
             localStorage.getItem("pf_no") ||
             localStorage.getItem("PF_NO");
  
  if (!pfno) {
    // Try to get from user object in localStorage
    const userStr = localStorage.getItem("user") || localStorage.getItem("userData");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        pfno = user.pfno || user.PFNO || user.pf_no || user.PF_NO || user.pfNo;
      } catch (e) {
        console.error("Could not parse user:", e);
      }
    }
  }
  
  // Try to get from sessionStorage as fallback
  if (!pfno) {
    pfno = sessionStorage.getItem("pfno") || 
           sessionStorage.getItem("PFNO") || 
           sessionStorage.getItem("pf_no") ||
           sessionStorage.getItem("PF_NO");
  }
  
  return pfno || "";
};

/**
 * Generates and downloads a GRN Excel file
 * @param {Object} params - Parameters for GRN generation
 * @param {string} params.grnNo - GRN number
 * @param {Object} params.grnDetails - GRN details (invoiceNo, supplier, tenderNo, invoiceDate)
 * @param {Array} params.itemsToPrint - Array of items to include in the GRN
 * @param {string} params.warehouseName - Warehouse name
 * @param {string} params.warehouseCode - Warehouse code
 */
export const generateGRNExcel = async ({
  grnNo,
  grnDetails,
  itemsToPrint,
  warehouseName,
  warehouseCode
}) => {
  // Generate Excel file
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('GRN');

  // Set column widths
  worksheet.getColumn('A').width = 14;
  worksheet.getColumn('B').width = 45;
  worksheet.getColumn('C').width = 8;
  worksheet.getColumn('D').width = 16;
  worksheet.getColumn('E').width = 16;

  // Page setup
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: 'portrait',
    margins: {
      left: 0.5,
      right: 0.5,
      top: 0.7,
      bottom: 0.7
    },
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: false
  };

  let currentRow = 1;
  
  console.log("Generating Excel with itemsToPrint:", itemsToPrint);

  // Title section
  worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
  worksheet.getCell(`A${currentRow}`).value = "CEYLON ELECTRICITY BOARD";
  worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
  worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
  currentRow++;

  worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
  worksheet.getCell(`A${currentRow}`).value = "Lakvijaya Power Plant, Norochcholai";
  worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
  currentRow += 2;

  worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
  worksheet.getCell(`A${currentRow}`).value = "GOODS RECEIVED NOTE";
  worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
  worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
  currentRow++;

  // Document info (top right)
  const docInfoStartRow = 1;
  worksheet.getCell(`D${docInfoStartRow}`).value = "Doc No:";
  worksheet.getCell(`E${docInfoStartRow}`).value = "PROMIS/06";
  worksheet.getCell(`D${docInfoStartRow + 1}`).value = "Date of issue:";
  worksheet.getCell(`E${docInfoStartRow + 1}`).value = "1-Jan-20";
  worksheet.getCell(`D${docInfoStartRow + 2}`).value = "Revision Status:";
  worksheet.getCell(`E${docInfoStartRow + 2}`).value = "1";
  worksheet.getCell(`D${docInfoStartRow + 3}`).value = "Revised Date:";
  worksheet.getCell(`E${docInfoStartRow + 3}`).value = "1-Jan-20";

  // Apply borders and formatting to doc info
  for (let i = docInfoStartRow; i <= docInfoStartRow + 3; i++) {
    worksheet.getCell(`D${i}`).font = { bold: true };
    worksheet.getCell(`D${i}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    worksheet.getCell(`E${i}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  }

  // Branch & Serial
  worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
  worksheet.getCell(`A${currentRow}`).value = `Branch : ${warehouseCode} - ${warehouseName}`;
  worksheet.mergeCells(`D${currentRow}:E${currentRow}`);
  worksheet.getCell(`D${currentRow}`).value = `Serial No : ${grnNo}`;
  worksheet.getRow(currentRow).font = { bold: true };
  worksheet.getRow(currentRow).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' }
  };
  for (let col = 1; col <= 5; col++) {
    worksheet.getCell(currentRow, col).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  }
  currentRow++;

  // Invoice / Supplier
  worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
  worksheet.getCell(`A${currentRow}`).value = `Invoice No : ${grnDetails.invoiceNo}`;
  worksheet.mergeCells(`D${currentRow}:E${currentRow}`);
  worksheet.getCell(`D${currentRow}`).value = `Supplier : ${grnDetails.supplier}`;
  worksheet.getRow(currentRow).font = { bold: true };
  for (let col = 1; col <= 5; col++) {
    worksheet.getCell(currentRow, col).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  }
  currentRow++;

  worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
  worksheet.getCell(`A${currentRow}`).value = `Tender No : ${grnDetails.tenderNo}`;
  worksheet.mergeCells(`D${currentRow}:E${currentRow}`);
  worksheet.getCell(`D${currentRow}`).value = `Invoice Date : ${grnDetails.invoiceDate}`;
  worksheet.getRow(currentRow).font = { bold: true };
  for (let col = 1; col <= 5; col++) {
    worksheet.getCell(currentRow, col).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  }
  currentRow += 2;

  // Table Header
  const headerRow = currentRow;
  worksheet.getCell(`A${headerRow}`).value = "Part Serial No";
  worksheet.getCell(`B${headerRow}`).value = "Description";
  worksheet.getCell(`C${headerRow}`).value = "Qty";
  worksheet.getCell(`D${headerRow}`).value = "Unit Price";
  worksheet.getCell(`E${headerRow}`).value = "Unit Total";

  // Format header
  for (let col = 1; col <= 5; col++) {
    const cell = worksheet.getCell(headerRow, col);
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  }
  currentRow++;

  // Data rows
  let totalAmount = 0;
  for (const item of itemsToPrint) {
    // Parse quantities and prices, ensuring they're numbers
    // Handle both string and number types, and handle empty strings/null values
    const qtyStr = item.allocatedQty != null ? String(item.allocatedQty).trim() : "0";
    const priceStr = item.unitPrice != null ? String(item.unitPrice).trim() : "0";
    const qty = qtyStr && qtyStr !== "" && !isNaN(qtyStr) ? parseFloat(qtyStr) : 0;
    const unitPrice = priceStr && priceStr !== "" && !isNaN(priceStr) ? parseFloat(priceStr) : 0;
    const unitTotal = qty * unitPrice;
    totalAmount += unitTotal;
    
    // Debug logging to help identify issues
    console.log("Processing Excel Item:", {
      itemNo: item.itemNo,
      originalAllocatedQty: item.allocatedQty,
      originalUnitPrice: item.unitPrice,
      qtyStr: qtyStr,
      priceStr: priceStr,
      parsedQty: qty,
      parsedPrice: unitPrice,
      unitTotal: unitTotal
    });

    // Set item number (Part Serial No)
    worksheet.getCell(`A${currentRow}`).value = item.itemNo || "";
    
    // Set description
    worksheet.getCell(`B${currentRow}`).value = item.itemName || "N/A";
    
    // Set quantity - ensure it's a number
    worksheet.getCell(`C${currentRow}`).value = qty;
    worksheet.getCell(`C${currentRow}`).numFmt = '#,##0.00';
    
    // Set unit price - ensure it's a number
    worksheet.getCell(`D${currentRow}`).value = unitPrice;
    worksheet.getCell(`D${currentRow}`).numFmt = '#,##0.00';
    
    // Set unit total - ensure it's a number
    worksheet.getCell(`E${currentRow}`).value = unitTotal;
    worksheet.getCell(`E${currentRow}`).numFmt = '#,##0.00';

    // Apply borders and alignment
    for (let col = 1; col <= 5; col++) {
      const cell = worksheet.getCell(currentRow, col);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      // Set alignment based on column
      if (col === 1 || col === 2) {
        // Part Serial No and Description - left align
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      } else if (col === 3 || col === 4 || col === 5) {
        // Qty, Unit Price, Unit Total - right align for numbers
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      }
    }
    currentRow++;
  }

  // Total row
  worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
  worksheet.getCell(`A${currentRow}`).value = `In Words: ${numberToWords(totalAmount)}`;
  worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'left', vertical: 'middle' };
  worksheet.getCell(`D${currentRow}`).value = "Total";
  worksheet.getCell(`D${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getCell(`E${currentRow}`).value = totalAmount;
  worksheet.getCell(`E${currentRow}`).numFmt = '#,##0.00';
  worksheet.getCell(`E${currentRow}`).alignment = { horizontal: 'right', vertical: 'middle' };

  // Format total row
  for (let col = 1; col <= 5; col++) {
    const cell = worksheet.getCell(currentRow, col);
    cell.font = { bold: true };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  }
  currentRow++;

  // Footer
  worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
  worksheet.getCell(`A${currentRow}`).value = grnNo;
  worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'left', vertical: 'middle' };
  worksheet.mergeCells(`D${currentRow}:E${currentRow}`);
  const receivedBy = getPFNO();
  worksheet.getCell(`D${currentRow}`).value = `Received By : ${receivedBy || 'N/A'}`;
  worksheet.getCell(`D${currentRow}`).alignment = { horizontal: 'left', vertical: 'middle' };

  // Apply borders to footer
  for (let col = 1; col <= 5; col++) {
    const cell = worksheet.getCell(currentRow, col);
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  }

  // Full page outline border
  const lastRow = currentRow;
  for (let row = 1; row <= lastRow; row++) {
    for (let col = 1; col <= 5; col++) {
      const cell = worksheet.getCell(row, col);
      if (!cell.border) {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    }
  }

  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const fileName = `GRN_${grnNo.replace(/\//g, '')}_${new Date().getTime()}.xlsx`;
  saveAs(blob, fileName);
};

