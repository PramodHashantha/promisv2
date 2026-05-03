import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// ─── Constants ────────────────────────────────────────────────────────────────

const TENDER_LIMIT = 2_000_000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (val) =>
  val != null
    ? Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0.00';

/**
 * Mirrors old RowHeight() method:
 * calculates how tall a row should be based on description length.
 * @param {string} desc
 * @param {number} len  - chars per line (old default 80)
 * @param {number} h    - base height    (old default 40)
 */
const calcRowHeight = (desc, len = 80, h = 40) => {
  if (!desc) return h;
  return Math.max(h, Math.ceil(desc.length / len) * h);
};

// ─── Shared border style ──────────────────────────────────────────────────────

const borderThin = {
  top:    { style: 'thin' },
  left:   { style: 'thin' },
  bottom: { style: 'thin' },
  right:  { style: 'thin' },
};

// ─── Core cell helper ─────────────────────────────────────────────────────────

/**
 * Sets value, font, alignment (and optional numFmt) on a cell reference.
 * @param {ExcelJS.Cell} cell
 * @param {*}            value
 * @param {object}       opts  - bold, size, align, valign, wrap, numFmt
 */
const setCell = (cell, value, opts = {}) => {
  cell.value     = value;
  cell.font      = { name: 'Times New Roman', size: opts.size ?? 11, bold: opts.bold ?? false };
  cell.alignment = {
    horizontal: opts.align  ?? 'left',
    vertical:   opts.valign ?? 'middle',
    wrapText:   opts.wrap   ?? false,
  };
  if (opts.numFmt) cell.numFmt = opts.numFmt;
  return cell;
};

/**
 * Convenience: merge cells safely (ignores already-merged errors).
 */
const merge = (ws, range) => {
  try { ws.mergeCells(range); } catch (_) {}
};

/**
 * Apply thin border to every cell in a rectangular block.
 */
const applyBorderBlock = (ws, startRow, endRow, startCol, endCol) => {
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      ws.getCell(r, c).border = borderThin;
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  buildHeader  — rows 2–7
//  Mirrors old PR() header block exactly
// ─────────────────────────────────────────────────────────────────────────────

const buildHeader = (ws) => {
  // Logo placeholder (old code inserted CEB.png — kept as text fallback)
  merge(ws, 'A2:B7');
  setCell(ws.getCell('A2'), 'CEB', { bold: true, align: 'center' });

  // Company name
  merge(ws, 'C3:I3');
  setCell(ws.getCell('C3'), 'CEYLON ELECTRICITY BOARD', { bold: true, size: 18, align: 'center' });

  merge(ws, 'C4:I4');
  setCell(ws.getCell('C4'), 'Lakvijaya Power Plant, Norochcholai', { size: 11, align: 'center' });

  merge(ws, 'C6:I7');
  setCell(ws.getCell('C6'), 'PURCHASE REQUISITION APPLICATION', { bold: true, size: 12, align: 'center' });

  // Top-right doc info
  setCell(ws.getCell('J3'), 'Doc No:',          { size: 9, align: 'right' });
  setCell(ws.getCell('J4'), 'Date of issue:',   { size: 9, align: 'right' });
  setCell(ws.getCell('J5'), 'Revision Status:', { size: 9, align: 'right' });
  setCell(ws.getCell('J6'), 'Revised Date:',    { size: 9, align: 'right' });

  merge(ws, 'K3:L3');
  setCell(ws.getCell('K3'), 'PROMIS/01', { size: 9, align: 'center' });

  merge(ws, 'K4:L4');
  const k4     = ws.getCell('K4');
  k4.value     = new Date(2020, 0, 1);
  k4.numFmt    = 'dd-mmm-yyyy';
  k4.font      = { name: 'Times New Roman', size: 9 };
  k4.alignment = { horizontal: 'center', vertical: 'middle' };

  merge(ws, 'K5:L5');
  setCell(ws.getCell('K5'), '1', { size: 9, align: 'center' });

  merge(ws, 'K6:L6');
  const k6     = ws.getCell('K6');
  k6.value     = new Date(2020, 0, 1);
  k6.numFmt    = 'dd-mmm-yyyy';
  k6.font      = { name: 'Times New Roman', size: 9 };
  k6.alignment = { horizontal: 'center', vertical: 'middle' };

  // Header outer borders
  for (let r = 2; r <= 7; r++) {
    ws.getCell(r, 1).border  = { ...ws.getCell(r, 1).border,  left:   borderThin.left  };
    ws.getCell(r, 2).border  = { ...ws.getCell(r, 2).border,  right:  borderThin.right };
    ws.getCell(r, 10).border = { ...ws.getCell(r, 10).border, left:   borderThin.left  };
    ws.getCell(r, 12).border = { ...ws.getCell(r, 12).border, right:  borderThin.right };
  }
  for (let c = 1; c <= 12; c++) {
    ws.getCell(2, c).border = { ...ws.getCell(2, c).border, top:    borderThin.top    };
    ws.getCell(7, c).border = { ...ws.getCell(7, c).border, bottom: borderThin.bottom };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  buildDataSection  — rows 8–49
//  Mirrors old PR() data load block exactly
// ─────────────────────────────────────────────────────────────────────────────

const buildDataSection = (ws, detail) => {
  const isTender = (detail.ESTIMATED_COST ?? 0) >= TENDER_LIMIT;
  const qtLabel  = isTender ? 'Tender' : 'Quotation';

  // ── Row 8: spacer, Row 9: Section / Unit / Q-T No ─────────────────────
  merge(ws, 'A8:L8');

  merge(ws, 'A9:B9');
  setCell(ws.getCell('A9'), 'Section', { bold: true, size: 12, align: 'center' });

  merge(ws, 'C9:E9');
  setCell(ws.getCell('C9'), detail.COSTCENTER_NAME ?? '', { size: 11, align: 'center' });

  setCell(ws.getCell('F9'), 'Unit', { bold: true, size: 12, align: 'center' });

  merge(ws, 'G9:I9');
  setCell(ws.getCell('G9'), detail.CE_SECTION_NAME ?? '', { size: 11, align: 'center' });

  setCell(ws.getCell('J9'), qtLabel, { bold: true, size: 12, align: 'center' });

  merge(ws, 'K9:L9');
  setCell(ws.getCell('K9'), detail.PRNO ?? '', { size: 10, align: 'center' });

  // ── Row 10: spacer ───────────────────────────────────────────────────────
  merge(ws, 'A10:L10');

  // ── Rows 11–20: Title / Description / Budget ─────────────────────────────
  merge(ws, 'A11:F11');
  setCell(ws.getCell('A11'), `Suggested ${qtLabel} Title`, { bold: true, size: 12 });

  merge(ws, 'A12:F15');
  setCell(ws.getCell('A12'), detail.TITLE ?? '', { size: 11, wrap: true });

  merge(ws, 'A16:F16');
  setCell(ws.getCell('A16'), 'Brief Description of The Requirement', { bold: true, size: 12 });

  merge(ws, 'A17:F20');
  setCell(ws.getCell('A17'), detail.DESCRIPTION ?? '', { size: 11, wrap: true });

  // Budget availability
  merge(ws, 'G11:I11');
  setCell(ws.getCell('G11'), 'Budget Availability', { bold: true, size: 12 });
  merge(ws, 'J11:L11');
  setCell(ws.getCell('J11'),
    (detail.BUDGET_AVAILABILITY ?? '').toUpperCase() === 'Y' ? 'Yes' : 'No',
    { size: 11 }
  );

  // Proc Plan / Cost Code headers
  merge(ws, 'G12:I12');
  setCell(ws.getCell('G12'), 'Proc. Plan Number', { bold: true, size: 12 });
  merge(ws, 'J12:L12');
  setCell(ws.getCell('J12'), 'Cost Code', { bold: true, size: 12 });

  // Budget detail rows — up to 8, mirrors old for (int i = 0; i < 8; i++)
  const budgetRows = detail.BudgetDetails ?? [];
  for (let i = 0; i < 8; i++) {
    const r = 13 + i;
    merge(ws, `G${r}:I${r}`);
    setCell(ws.getCell(`G${r}`), i < budgetRows.length ? (budgetRows[i].BUDGET_NO ?? '') : '', { size: 11 });
    merge(ws, `J${r}:L${r}`);
    setCell(ws.getCell(`J${r}`), i < budgetRows.length ? (budgetRows[i].COST_CODE ?? '') : '', { size: 11 });
  }

  // ── Rows 21–22: Type of Purchase / Estimated Cost ─────────────────────────
  merge(ws, 'A21:F21');
  setCell(ws.getCell('A21'), 'Type of Purchase', { bold: true, size: 12 });
  merge(ws, 'G21:L21');
  setCell(ws.getCell('G21'), 'Estimated Cost (Approx)', { bold: true, size: 12 });

  merge(ws, 'A22:F22');
  setCell(ws.getCell('A22'), detail.TYPE_OF_PURCHASE_NAME ?? '', { size: 11, wrap: true });
  merge(ws, 'G22:L22');
  setCell(ws.getCell('G22'), formatCurrency(detail.ESTIMATED_COST), { size: 11, wrap: true });

  // ── Row 23: Account & Expense Code ───────────────────────────────────────
  merge(ws, 'A23:C23');
  setCell(ws.getCell('A23'), 'Account and Expenses Code', { bold: true, size: 12, wrap: true });
  merge(ws, 'D23:L23');
  setCell(ws.getCell('D23'), detail.A_E_CODE_DEC ?? '', { size: 11, wrap: true });

  // ── Row 24: Required Items heading ───────────────────────────────────────
  merge(ws, 'A24:L24');
  setCell(ws.getCell('A24'), 'Required Items', { bold: true, size: 12 });

  // ── Row 25: Item table headers ────────────────────────────────────────────
  ws.getRow(25).height = 40;
  setCell(ws.getCell('A25'), 'Items Code',        { bold: true, size: 12, align: 'center', wrap: true });
  merge(ws, 'B25:D25');
  setCell(ws.getCell('B25'), 'Description',       { bold: true, size: 12, align: 'center' });
  setCell(ws.getCell('E25'), 'UOM',               { bold: true, size: 12, align: 'center' });
  setCell(ws.getCell('F25'), 'Unit Price',        { bold: true, size: 12, align: 'center', wrap: true });
  setCell(ws.getCell('G25'), 'QTY',               { bold: true, size: 12, align: 'center' });
  merge(ws, 'H25:I25');
  setCell(ws.getCell('H25'), 'Total',             { bold: true, size: 12, align: 'center' });
  setCell(ws.getCell('J25'), 'Stock Level',       { bold: true, size: 12, align: 'center', wrap: true });
  merge(ws, 'K25:L25');
  setCell(ws.getCell('K25'), 'Proc. Plan Number', { bold: true, size: 12, align: 'center', wrap: true });

  // ── Rows 26+: Item data rows ──────────────────────────────────────────────
  const items         = detail.ItemList ?? [];
  let   rowId         = 26;
  let   pageRowHeight = 200; // matches old code initial budget
  let   lastIndex     = 0;

  for (let i = 0; i < items.length; i++) {
    const item    = items[i];
    const desc    = item.Description ?? '';
    const rowSize = calcRowHeight(desc);
    pageRowHeight -= rowSize;

    if (pageRowHeight < 0) break; // overflow → appendix

    lastIndex++;
    ws.getRow(rowId).height = rowSize;

    setCell(ws.getCell(rowId, 1), item.ItemCode ?? '', { size: 10, align: 'center', wrap: true });
    merge(ws, `B${rowId}:D${rowId}`);
    setCell(ws.getCell(`B${rowId}`), desc, { size: 10, wrap: true });
    setCell(ws.getCell(`E${rowId}`), item.UOM ?? '', { size: 10, align: 'center' });

    const cellF = ws.getCell(rowId, 6);
    cellF.value     = Number(item.UnitPrice ?? 0);
    cellF.numFmt    = '#,##0.00';
    cellF.font      = { name: 'Times New Roman', size: 10 };
    cellF.alignment = { horizontal: 'right', vertical: 'middle' };

    const cellG = ws.getCell(rowId, 7);
    cellG.value     = Number(item.Qty ?? 0);
    cellG.numFmt    = '#,##0.00';
    cellG.font      = { name: 'Times New Roman', size: 10 };
    cellG.alignment = { horizontal: 'center', vertical: 'middle' };

    merge(ws, `H${rowId}:I${rowId}`);
    const cellH = ws.getCell(rowId, 8);
    cellH.value     = Number(item.Total ?? 0);
    cellH.numFmt    = '#,##0.00';
    cellH.font      = { name: 'Times New Roman', size: 10 };
    cellH.alignment = { horizontal: 'right', vertical: 'middle' };

    setCell(ws.getCell(`J${rowId}`), item.AvailableStockLevel ?? '', { size: 10, align: 'center' });
    merge(ws, `K${rowId}:L${rowId}`);
    setCell(ws.getCell(`K${rowId}`), item.BudgetNo ?? '', { size: 10, align: 'center' });

    rowId++;
  }

  // Fill empty rows up to row 30 — mirrors old i = row_id; i < 31 loop
  if (lastIndex !== 0) {
    for (let i = rowId; i < 31; i++) {
      ws.getRow(i).height = pageRowHeight > 0 ? 40 : 0;
      pageRowHeight -= 40;
      merge(ws, `B${i}:D${i}`);
      merge(ws, `H${i}:I${i}`);
      merge(ws, `K${i}:L${i}`);
    }
  } else {
    // No items fit on first page
    merge(ws, 'A26:L32');
    const cellSee     = ws.getCell('A26');
    cellSee.value     = 'See Appendix';
    cellSee.font      = { name: 'Times New Roman', size: 11 };
    cellSee.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(26).height = 100;
  }

  merge(ws, 'A31:L32');

  // ── Rows 33–39: Procurement / Bidder / Tech Committee ─────────────────────
  merge(ws, 'A33:F33');
  setCell(ws.getCell('A33'), 'Procurement Method', { bold: true, size: 12 });

  const procNames = (detail.ProcurementTypes ?? []).map((p) => p.PROC_TYPE_NAME).join(' , ');
  merge(ws, 'A34:F36');
  setCell(ws.getCell('A34'), procNames, { size: 11 });

  merge(ws, 'A37:F37');
  setCell(ws.getCell('A37'), 'Bidding Type', { bold: true, size: 12 });

  const bidderNames = (detail.BidderTypes ?? []).map((b) => b.BIDDER_TYPE_NAME).join(' , ');
  merge(ws, 'A38:F39');
  setCell(ws.getCell('A38'), bidderNames, { size: 11 });

  // Tech committee only for Tender — mirrors old if (PRTotal > TenderLimit)
  if (isTender) {
    merge(ws, 'G33:L33');
    setCell(ws.getCell('G33'), 'Suggested BEC Committee', { bold: true, size: 12 });

    const techList = detail.TechCommittee ?? [];
    for (let y = 0; y < Math.min(techList.length, 6); y++) {
      const tr = 34 + y;
      merge(ws, `G${tr}:H${tr}`);
      setCell(ws.getCell(`G${tr}`), techList[y].Role ?? '', { size: 11 });
      merge(ws, `I${tr}:L${tr}`);
      setCell(ws.getCell(`I${tr}`), techList[y].Name ?? '', { size: 11 });
    }
  } else {
    merge(ws, 'G33:L39');
  }

  merge(ws, 'A40:F40');

  // ── Rows 41–49: Access Level sections (Requested / Recommend / Approved) ──
  const accessLevels = detail.AccessLevels ?? [];
  const getAccess    = (type) => accessLevels.find((a) => a.APPRVAL_TYPE === type) ?? {};
  const accessC      = getAccess('C');
  const accessR      = getAccess('R');
  const accessA      = getAccess('A');

  // Requested By — rows 41–43
  merge(ws, 'A41:I41');
  setCell(ws.getCell('A41'), 'Requested By', { bold: true, size: 12 });

  if (accessC.TRN_DATE) {
    setCell(ws.getCell('J41'), 'Date', { bold: true, size: 11 });
    merge(ws, 'K41:L41');
    const dc41    = ws.getCell('K41');
    dc41.value    = new Date(accessC.TRN_DATE);
    dc41.numFmt   = 'dd MMMM yyyy';
    dc41.font     = { name: 'Times New Roman', size: 11 };
  }

  merge(ws, 'A42:A43'); setCell(ws.getCell('A42'), 'Name',        { bold: true, size: 11 });
  merge(ws, 'B42:D43'); setCell(ws.getCell('B42'), accessC.NAME ?? '',        { size: 11, wrap: true });
  merge(ws, 'E42:F43'); setCell(ws.getCell('E42'), 'Designation', { bold: true, size: 11 });
  merge(ws, 'G42:I43'); setCell(ws.getCell('G42'), accessC.DESIGNATION ?? '', { size: 11, wrap: true });
  merge(ws, 'J42:J43'); setCell(ws.getCell('J42'), 'Signature',   { bold: true, size: 11 });
  merge(ws, 'K42:L43'); setCell(ws.getCell('K42'), accessC.SIGNATURE_LABEL ?? '', { size: 11, wrap: true });

  // Recommended By — rows 44–46
  merge(ws, 'A44:I44');
  setCell(ws.getCell('A44'), 'Above All Details are Correct And Recommended to Proceed', { bold: true, size: 12 });

  if (accessR.TRN_DATE) {
    setCell(ws.getCell('J44'), 'Date', { bold: true, size: 11 });
    merge(ws, 'K44:L44');
    const dc44    = ws.getCell('K44');
    dc44.value    = new Date(accessR.TRN_DATE);
    dc44.numFmt   = 'dd MMMM yyyy';
    dc44.font     = { name: 'Times New Roman', size: 11 };
  }

  merge(ws, 'A45:A46'); setCell(ws.getCell('A45'), 'Name',        { bold: true, size: 11 });
  merge(ws, 'B45:D46'); setCell(ws.getCell('B45'), accessR.NAME ?? '',        { size: 11, wrap: true });
  merge(ws, 'E45:F46'); setCell(ws.getCell('E45'), 'Designation', { bold: true, size: 11 });
  merge(ws, 'G45:I46'); setCell(ws.getCell('G45'), accessR.DESIGNATION ?? '', { size: 11, wrap: true });
  merge(ws, 'J45:J46'); setCell(ws.getCell('J45'), 'Signature',   { bold: true, size: 11 });
  merge(ws, 'K45:L46'); setCell(ws.getCell('K45'), accessR.SIGNATURE_LABEL ?? '', { size: 11, wrap: true });

  // Approved By — rows 47–49
  merge(ws, 'A47:I47');
  setCell(ws.getCell('A47'),
    isTender ? 'Approved to Issue Tender No' : 'Approved To Issue Quotation No',
    { bold: true, size: 12 }
  );

  if (accessA.TRN_DATE) {
    setCell(ws.getCell('J47'), 'Date', { bold: true, size: 11 });
    merge(ws, 'K47:L47');
    const dc47    = ws.getCell('K47');
    dc47.value    = new Date(accessA.TRN_DATE);
    dc47.numFmt   = 'dd MMMM yyyy';
    dc47.font     = { name: 'Times New Roman', size: 11 };
  }

  merge(ws, 'A48:A49'); setCell(ws.getCell('A48'), 'Name',        { bold: true, size: 11 });
  merge(ws, 'B48:D49'); setCell(ws.getCell('B48'), accessA.NAME ?? '',        { size: 11, wrap: true });
  merge(ws, 'E48:F49'); setCell(ws.getCell('E48'), 'Designation', { bold: true, size: 11 });
  merge(ws, 'G48:I49'); setCell(ws.getCell('G48'), accessA.DESIGNATION ?? '', { size: 11, wrap: true });
  merge(ws, 'J48:J49'); setCell(ws.getCell('J48'), 'Signature',   { bold: true, size: 11 });
  merge(ws, 'K48:L49'); setCell(ws.getCell('K48'), accessA.SIGNATURE_LABEL ?? '', { size: 11, wrap: true });

  // Apply borders to entire data block rows 8–49
  applyBorderBlock(ws, 8, 49, 1, 12);

  // Return overflow info for appendix generation
  return { lastIndex, items, pageRowHeight };
};

// ─────────────────────────────────────────────────────────────────────────────
//  buildAppendixSheet  — creates one appendix worksheet with headers
//  Mirrors old "open Appendix" block
// ─────────────────────────────────────────────────────────────────────────────

const buildAppendixSheet = (workbook, sheetName) => {
  const ws = workbook.addWorksheet(sheetName);

  // Column widths
  [8, 10, 20, 10, 8, 12, 8, 10, 8, 16, 13, 10].forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  ws.pageSetup = { paperSize: 9, fitToPage: true, fitToWidth: 1 };

  // "Appendix" title row 2
  merge(ws, 'A2:L2');
  const titleCell     = ws.getCell('A2');
  titleCell.value     = 'Appendix';
  titleCell.font      = { name: 'Times New Roman', bold: true, size: 12 };
  titleCell.alignment = { wrapText: true };

  // Header row 3
  ws.getRow(3).height = 40;
  setCell(ws.getCell('A3'), 'Items Code',        { bold: true, size: 12, align: 'center', wrap: true });
  merge(ws, 'B3:D3');
  setCell(ws.getCell('B3'), 'Description',       { bold: true, size: 12, align: 'center' });
  setCell(ws.getCell('E3'), 'UOM',               { bold: true, size: 12, align: 'center' });
  setCell(ws.getCell('F3'), 'Unit Price',        { bold: true, size: 12, align: 'center', wrap: true });
  setCell(ws.getCell('G3'), 'QTY',               { bold: true, size: 12, align: 'center' });
  merge(ws, 'H3:I3');
  setCell(ws.getCell('H3'), 'Total',             { bold: true, size: 12, align: 'center' });
  setCell(ws.getCell('J3'), 'Stock Level',       { bold: true, size: 12, align: 'center', wrap: true });
  merge(ws, 'K3:L3');
  setCell(ws.getCell('K3'), 'Proc. Plan Number', { bold: true, size: 12, align: 'center', wrap: true });

  for (let c = 1; c <= 12; c++) {
    ws.getCell(3, c).border = borderThin;
  }

  return ws;
};

// ─────────────────────────────────────────────────────────────────────────────
//  buildAppendixItems  — fills overflow items across appendix sheets
// ─────────────────────────────────────────────────────────────────────────────

const buildAppendixItems = (workbook, items, lastIndex) => {
  let appendixSheet = buildAppendixSheet(workbook, '2');
  let appRow        = 4;
  let appPageHeight = 750; // matches old code
  let sheetCount    = 2;

  for (let i = lastIndex; i < items.length; i++) {
    const item    = items[i];
    const desc    = item.Description ?? '';
    const rowSize = calcRowHeight(desc);

    // New page when height budget runs out — mirrors old if (pageRowHeight < 0)
    if (appPageHeight < 0) {
      sheetCount++;
      appendixSheet = buildAppendixSheet(workbook, String(sheetCount));
      appRow        = 4;
      appPageHeight = 750;
    }

    appPageHeight -= rowSize;
    appendixSheet.getRow(appRow).height = rowSize;

    setCell(appendixSheet.getCell(appRow, 1), item.ItemCode ?? '', { size: 10, align: 'center', wrap: true });
    merge(appendixSheet, `B${appRow}:D${appRow}`);
    setCell(appendixSheet.getCell(appRow, 2), desc, { size: 10, wrap: true });
    setCell(appendixSheet.getCell(appRow, 5), item.UOM ?? '', { size: 10, align: 'center' });

    const apF = appendixSheet.getCell(appRow, 6);
    apF.value   = Number(item.UnitPrice ?? 0);
    apF.numFmt  = '#,##0.00';
    apF.font    = { name: 'Times New Roman', size: 10 };

    const apG = appendixSheet.getCell(appRow, 7);
    apG.value   = Number(item.Qty ?? 0);
    apG.numFmt  = '#,##0.00';
    apG.font    = { name: 'Times New Roman', size: 10 };

    merge(appendixSheet, `H${appRow}:I${appRow}`);
    const apH = appendixSheet.getCell(appRow, 8);
    apH.value   = Number(item.Total ?? 0);
    apH.numFmt  = '#,##0.00';
    apH.font    = { name: 'Times New Roman', size: 10 };

    setCell(appendixSheet.getCell(appRow, 10), item.AvailableStockLevel ?? '', { size: 10, align: 'center' });
    merge(appendixSheet, `K${appRow}:L${appRow}`);
    setCell(appendixSheet.getCell(appRow, 11), item.BudgetNo ?? '', { size: 10, align: 'center' });

    // Row border
    for (let c = 1; c <= 12; c++) {
      appendixSheet.getCell(appRow, c).border = borderThin;
    }

    appRow++;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  generatePRExcel  — main exported function
//  Mirrors old PR() / PRinExcel() Excel Interop methods combined
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates the Purchase Requisition Excel file and triggers browser download.
 * @param {object} detail - Full PR detail object from ViewPR API
 */
export const generatePRExcel = async (detail) => {
  const workbook  = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('1');

  // ── Column widths ──────────────────────────────────────────────────────────
  [8, 10, 20, 10, 8, 12, 8, 10, 8, 16, 13, 10].forEach((w, i) => {
    worksheet.getColumn(i + 1).width = w;
  });

  // ── Page setup ─────────────────────────────────────────────────────────────
  worksheet.pageSetup = {
    paperSize:   9, // A4
    fitToPage:   true,
    fitToWidth:  1,
    fitToHeight: false,
    margins: { top: 0.85, left: 2.75, right: 1.7, bottom: 0.85 },
  };

  // ── Build sections ─────────────────────────────────────────────────────────
  buildHeader(worksheet);

  const { lastIndex, items } = buildDataSection(worksheet, detail);

  // ── Appendix sheets for overflow items ────────────────────────────────────
  if (lastIndex < items.length) {
    buildAppendixItems(workbook, items, lastIndex);
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  const buffer   = await workbook.xlsx.writeBuffer();
  const blob     = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `${detail.PRNO ?? 'PR'}_${Date.now()}.xlsx`);
};

export default generatePRExcel;