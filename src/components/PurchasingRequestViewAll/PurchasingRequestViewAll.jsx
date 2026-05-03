import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Swal from 'sweetalert2';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { purchasingRequestViewAllAPI } from '@/utils/api/purchasingRequestViewAll';
import { generatePRExcel } from './generatePRExcel';

// ─── Constants ────────────────────────────────────────────────────────────────

const TENDER_LIMIT = 2_000_000;
const PAGE_SIZE    = 10;
const START_YEAR   = 2019;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS        = Array.from({ length: CURRENT_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);

// ─── Status colour map (mirrors old getDatausColor / SetColor JS) ─────────────
const STATUS_COLORS = {
  95:  { bg: '#ede6e6', color: '#374151' }, // Draft Save
  99:  { bg: '#fc7978', color: '#7f1d1d' }, // Deleted
  100: { bg: '#ffafb0', color: '#7f1d1d' }, // PR to Be Recommended
  104: { bg: '#fc7978', color: '#7f1d1d' }, // Not Recommended
  105: { bg: '#96d1c7', color: '#134e4a' }, // PR to Be Approved
  109: { bg: '#fc7978', color: '#7f1d1d' }, // Rejected
  110: { bg: '#5eb7b7', color: '#fff'    }, // Approved / Quotation to Be Called
  111: { bg: '#5eb7b7', color: '#fff'    },
  112: { bg: '#5eb7b7', color: '#fff'    },
  115: { bg: '#e3b04b', color: '#fff'    }, // PR Completed
  200: { bg: '#e3b04b', color: '#fff'    }, // Tech Letter Generated
};

const getStatusStyle = (status) =>
  STATUS_COLORS[status] ?? { bg: '#e5e7eb', color: '#374151' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (val) => {
  if (!val) return '-';
  try {
    const d = new Date(val);
    return (
      d.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }) +
      ' ' +
      d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    );
  } catch { return val; }
};

const formatDateShort = (val) => {
  if (!val) return '';
  try {
    return new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
  } catch { return val; }
};

const formatCurrency = (val) =>
  val != null
    ? Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0.00';

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

const PurchasingRequestViewAll = () => {
  const [selectedYear,   setSelectedYear]   = useState(CURRENT_YEAR);
  const [list,           setList]           = useState([]);
  const [loadingList,    setLoadingList]    = useState(false);
  const [search,         setSearch]         = useState('');
  const [currentPage,    setCurrentPage]    = useState(1);
  const [selectedSysId,  setSelectedSysId]  = useState(null);
  const [detail,         setDetail]         = useState(null);
  const [loadingDetail,  setLoadingDetail]  = useState(false);
  const [downloadingXls, setDownloadingXls] = useState(false);
  const detailRef = useRef(null);

  // ── Load list whenever year changes ────────────────────────────────────────
  useEffect(() => { loadList(selectedYear); }, [selectedYear]);

  const loadList = async (year) => {
    try {
      setLoadingList(true);
      setDetail(null);
      setSelectedSysId(null);
      const data = await purchasingRequestViewAllAPI.getPRAll(year);
      setList(data || []);
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setLoadingList(false);
    }
  };

  // ── Search filter ───────────────────────────────────────────────────────────
  const filteredList = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (r) =>
        String(r.PRNO        ?? '').toLowerCase().includes(q) ||
        String(r.P_TYPE      ?? '').toLowerCase().includes(q) ||
        String(r.TITLE       ?? '').toLowerCase().includes(q) ||
        String(r.FULLNAME    ?? '').toLowerCase().includes(q) ||
        String(r.STATUS_NAME ?? '').toLowerCase().includes(q)
    );
  }, [list, search]);

  // ── Pagination ──────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const pagedList  = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [filteredList, currentPage]);

  const startEntry = filteredList.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endEntry   = Math.min(currentPage * PAGE_SIZE, filteredList.length);

  useEffect(() => { setCurrentPage(1); }, [search, selectedYear]);

  // ── View button — load detail ───────────────────────────────────────────────
  const handleView = useCallback(async (sysId) => {
    if (selectedSysId === sysId) {
      setSelectedSysId(null);
      setDetail(null);
      return;
    }
    try {
      setSelectedSysId(sysId);
      setDetail(null);
      setLoadingDetail(true);
      const data = await purchasingRequestViewAllAPI.viewPR(sysId);
      setDetail(data);
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
      setSelectedSysId(null);
    } finally {
      setLoadingDetail(false);
    }
  }, [selectedSysId]);

  // ── Download Excel ──────────────────────────────────────────────────────────
  const handleDownloadExcel = useCallback(async () => {
    if (!detail) return;
    try {
      setDownloadingXls(true);
      await generatePRExcel(detail);
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to generate Excel.', 'error');
    } finally {
      setDownloadingXls(false);
    }
  }, [detail]);

  // ── Print ───────────────────────────────────────────────────────────────────
  const handlePrint = useCallback(() => { window.print(); }, []);

  // ── Close detail ────────────────────────────────────────────────────────────
  const handleCloseDetail = useCallback(() => {
    setDetail(null);
    setSelectedSysId(null);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="prva-wrap">
      <style>{`
        .prva-wrap { display:flex; flex-direction:column; gap:24px;
          font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; }

        /* Card */
        .prva-card { background:#fff; border-radius:10px;
          box-shadow:0 2px 8px rgba(0,0,0,0.08); overflow:hidden; }
        .prva-card-header { padding:14px 20px; border-bottom:1px solid #e5e7eb;
          background:#fafafa; display:flex; align-items:center;
          justify-content:space-between; flex-wrap:wrap; gap:10px; }
        .prva-card-header h2 { margin:0; font-size:1rem; font-weight:700; color:#1f2937; }
        .prva-card-body { padding:20px; }

        /* Toolbar */
        .prva-toolbar { display:flex; align-items:center;
          justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:14px; }
        .prva-year-select { padding:7px 12px; border:1px solid #d1d5db;
          border-radius:6px; font-size:13.5px; outline:none; cursor:pointer; }
        .prva-year-select:focus { border-color:#f59e0b; }
        .prva-search { padding:7px 12px; border:1px solid #d1d5db; border-radius:6px;
          font-size:13.5px; width:220px; outline:none; }
        .prva-search:focus { border-color:#f59e0b; }

        /* Table */
        .prva-table-wrap { overflow-x:auto; }
        .prva-table { width:100%; border-collapse:collapse; font-size:13.5px; min-width:900px; }
        .prva-table thead tr { background:#f59e0b; }
        .prva-table thead th { padding:11px 14px; text-align:center;
          border:1px solid #fcd34d; color:#1c1917; font-weight:700; white-space:nowrap; }
        .prva-table tbody tr:nth-child(even) { background:#f9fafb; }
        .prva-table tbody tr:nth-child(odd)  { background:#ffffff; }
        .prva-table tbody tr:hover           { background:#fef9ee; }
        .prva-table tbody tr.row-active      { background:#fef3c7 !important; }
        .prva-table td { padding:9px 14px; border:1px solid #e5e7eb;
          text-align:center; vertical-align:middle; }
        .prva-table td.td-left { text-align:left; }

        /* Status badge */
        .status-badge { display:inline-block; padding:3px 10px; border-radius:12px;
          font-size:12px; font-weight:600; white-space:nowrap; }

        /* Buttons */
        .btn-view { padding:5px 14px; border:none; border-radius:6px;
          background:#374151; color:#fff; cursor:pointer; font-size:13px;
          font-weight:600; transition:background 0.2s; }
        .btn-view:hover  { background:#1f2937; }
        .btn-view.active { background:#f59e0b; color:#1c1917; }

        .btn-print { display:inline-flex; align-items:center; gap:6px;
          padding:7px 16px; background:#6b7280; color:#fff; border:none;
          border-radius:6px; font-size:13.5px; font-weight:600; cursor:pointer;
          transition:background 0.2s; }
        .btn-print:hover { background:#4b5563; }

        .btn-excel { display:inline-flex; align-items:center; gap:6px;
          padding:7px 16px; background:#16a34a; color:#fff; border:none;
          border-radius:6px; font-size:13.5px; font-weight:600; cursor:pointer;
          transition:background 0.2s; }
        .btn-excel:hover:not(:disabled) { background:#15803d; }
        .btn-excel:disabled { opacity:0.55; cursor:not-allowed; }

        .btn-close { background:none; border:none; cursor:pointer;
          font-size:18px; color:#6b7280; line-height:1; padding:0; }
        .btn-close:hover { color:#374151; }

        /* Pagination */
        .prva-pager { display:flex; align-items:center; justify-content:space-between;
          flex-wrap:wrap; gap:10px; margin-top:14px; font-size:13.5px; color:#6b7280; }
        .prva-page-btns { display:flex; gap:4px; flex-wrap:wrap; }
        .prva-page-btn { padding:5px 12px; border:1px solid #d1d5db; border-radius:4px;
          background:#fff; color:#374151; font-size:13px; cursor:pointer;
          transition:background 0.15s; }
        .prva-page-btn:hover:not(:disabled):not(.pg-active) { background:#f3f4f6; }
        .prva-page-btn.pg-active { background:#f59e0b; color:#fff;
          border-color:#f59e0b; font-weight:700; }
        .prva-page-btn:disabled { opacity:0.45; cursor:not-allowed; }

        /* Empty state */
        .prva-empty { text-align:center; color:#9ca3af; padding:36px;
          font-style:italic; font-size:14px; }

        /* PR detail form */
        .pr-form-table { width:100%; border-collapse:collapse; font-size:13.5px; }
        .pr-form-table th, .pr-form-table td {
          border:1px solid #d1d5db; padding:10px 14px; vertical-align:top; }
        .pr-form-table th { background:#f9fafb; font-weight:600; color:#374151; }
        .pr-header-title { text-align:center; font-size:1.4rem;
          font-weight:700; color:#1f2937; }
        .pr-label { font-weight:700; color:#374151; font-size:13px; }
        .pr-value { color:#1f2937; font-size:13.5px; }

        /* Items table inside detail */
        .pr-items-table { width:100%; border-collapse:collapse; font-size:13px; }
        .pr-items-table th { background:#f59e0b; padding:8px 10px; text-align:center;
          border:1px solid #fcd34d; color:#1c1917; font-weight:700; white-space:nowrap; }
        .pr-items-table td { padding:7px 10px; border:1px solid #e5e7eb;
          text-align:center; vertical-align:middle; }
        .pr-items-table td.td-left { text-align:left; }
        .pr-items-table tr:nth-child(even) { background:#f9fafb; }

        /* Tech committee table */
        .pr-tech-table { width:100%; border-collapse:collapse; font-size:13px; }
        .pr-tech-table th { background:#6b7280; color:#fff; padding:8px 10px;
          text-align:center; border:1px solid #9ca3af; }
        .pr-tech-table td { padding:7px 10px; border:1px solid #e5e7eb; }

        /* Budget table */
        .pr-budget-table { width:100%; border-collapse:collapse;
          font-size:13px; margin-top:6px; }
        .pr-budget-table th { background:#f3f4f6; padding:7px 10px;
          border:1px solid #e5e7eb; text-align:left; font-weight:600; }
        .pr-budget-table td { padding:6px 10px; border:1px solid #e5e7eb; }

        /* Print: hide list card, hide action buttons */
        @media print {
          .prva-card:first-child { display:none !important; }
          .btn-print, .btn-excel, .btn-close { display:none !important; }
        }

        @media(max-width:640px) {
          .prva-toolbar { flex-direction:column; align-items:flex-start; }
          .prva-search  { width:100%; }
        }
      `}</style>

      {/* ══ REQUEST LIST CARD ════════════════════════════════════════════════ */}
      <div className="prva-card">
        <div className="prva-card-header">
          <h2>Request List</h2>
        </div>

        <div className="prva-card-body">
          {/* Year selector + Search */}
          <div className="prva-toolbar">
            <select
              className="prva-year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <input
              className="prva-search"
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          {loadingList ? <LoadingSpinner /> : (
            <>
              <div className="prva-table-wrap">
                <table className="prva-table">
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>Q/T No</th>
                      <th>Type of Purchase</th>
                      <th>Title</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Requested By</th>
                      <th>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedList.length === 0 ? (
                      <tr>
                        <td colSpan={8}>
                          <div className="prva-empty">No purchase requests found.</div>
                        </td>
                      </tr>
                    ) : (
                      pagedList.map((row) => {
                        const sc = getStatusStyle(row.STATUS);
                        return (
                          <tr
                            key={row.SYS_ID}
                            className={selectedSysId === row.SYS_ID ? 'row-active' : ''}
                          >
                            <td>
                              <button
                                className={`btn-view${selectedSysId === row.SYS_ID ? ' active' : ''}`}
                                onClick={() => handleView(row.SYS_ID)}
                              >
                                View
                              </button>
                            </td>
                            <td>{row.PRNO}</td>
                            <td>{row.P_TYPE}</td>
                            <td className="td-left">{row.TITLE}</td>
                            <td style={{ textAlign: 'right' }}>
                              {formatCurrency(row.ESTIMATED_COST)}
                            </td>
                            <td>
                              <span
                                className="status-badge"
                                style={{ backgroundColor: sc.bg, color: sc.color }}
                              >
                                {row.STATUS_NAME}
                              </span>
                            </td>
                            <td>{row.FULLNAME}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              {formatDate(row.CREATED_DATE)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="prva-pager">
                <span>
                  {filteredList.length === 0
                    ? 'No entries'
                    : `Showing ${startEntry} to ${endEntry} of ${filteredList.length} entries`}
                </span>
                {totalPages > 1 && (
                  <div className="prva-page-btns">
                    <button
                      className="prva-page-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`prva-page-btn${currentPage === p ? ' pg-active' : ''}`}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </button>
                    ))}

                    <button
                      className="prva-page-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══ PR DETAIL CARD ═══════════════════════════════════════════════════ */}
      {(loadingDetail || detail) && (
        <div className="prva-card" ref={detailRef}>
          <div className="prva-card-header">
            <h2>Purchase Requisition Application</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {detail && (
                <>
                  <button className="btn-print" onClick={handlePrint}>
                    🖨 Print
                  </button>
                  <button
                    className="btn-excel"
                    onClick={handleDownloadExcel}
                    disabled={downloadingXls}
                  >
                    {downloadingXls ? '⏳ Generating…' : '📥 Download Excel'}
                  </button>
                </>
              )}
              <button className="btn-close" onClick={handleCloseDetail} title="Close">
                ✕
              </button>
            </div>
          </div>

          <div className="prva-card-body">
            {loadingDetail ? (
              <LoadingSpinner />
            ) : (
              detail && <PRDetailView detail={detail} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
//  PR DETAIL VIEW
//  Renders the Purchase Requisition Application form.
//  Mirrors frmPurchasingRequestViewAll.aspx divView table layout exactly.
// ═════════════════════════════════════════════════════════════════════════════

const PRDetailView = ({ detail }) => {
  const isTender = (detail.ESTIMATED_COST ?? 0) >= TENDER_LIMIT;
  const qtLabel  = isTender ? 'Tender' : 'Quotation';
  const isGoods  = (detail.TYPE_OF_PURCHASE ?? 1) === 1;

  const accessLevels = detail.AccessLevels ?? [];
  const getAccess    = (type) => accessLevels.find((a) => a.APPRVAL_TYPE === type) ?? {};
  const accessC      = getAccess('C');
  const accessR      = getAccess('R');
  const accessA      = getAccess('A');

  return (
    <table className="pr-form-table">
      <tbody>

        {/* Logo / Title */}
        <tr>
          <td style={{ width: 120 }}>
            <img
              src="/assets/images/CEB.png"
              alt="CEB"
              style={{ width: 80 }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </td>
          <td colSpan={11} className="pr-header-title">
            PURCHASE REQUISITION APPLICATION
          </td>
        </tr>

        {/* Section / Unit / Date / PR No */}
        <tr>
          <td colSpan={3}>
            <span className="pr-label">Section: </span>
            <span className="pr-value">{detail.COSTCENTER_NAME}</span>
          </td>
          <td colSpan={3}>
            <span className="pr-label">Unit: </span>
            <span className="pr-value">{detail.CE_SECTION_NAME}</span>
          </td>
          <td colSpan={3}>
            <span className="pr-label">Date: </span>
            <span className="pr-value">{formatDateShort(detail.PR_DATE)}</span>
          </td>
          <td colSpan={3}>
            <span className="pr-label">{qtLabel} No: </span>
            <span className="pr-value">{detail.PRNO}</span>
          </td>
        </tr>

        {/* Title / Description / Type / A&E Code / Cost | Budget */}
        <tr>
          <td colSpan={8}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 0' }}>
                    <div className="pr-label">Suggested {qtLabel} Title :</div>
                    <div className="pr-value" style={{ marginTop: 4 }}>{detail.TITLE}</div>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0' }}>
                    <div className="pr-label">Brief Description of The Requirement :</div>
                    <div className="pr-value" style={{ marginTop: 4 }}>{detail.DESCRIPTION}</div>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0' }}>
                    <div className="pr-label">Type of Purchase :</div>
                    <div className="pr-value" style={{ marginTop: 4 }}>{detail.TYPE_OF_PURCHASE_NAME}</div>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0' }}>
                    <div className="pr-label">Account/Expense Code :</div>
                    <div className="pr-value" style={{ marginTop: 4 }}>{detail.A_E_CODE_DEC}</div>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0' }}>
                    <div className="pr-label">Estimated Cost (Approx): </div>
                    <div className="pr-value" style={{ marginTop: 4 }}>
                      {formatCurrency(detail.ESTIMATED_COST)}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>

          <td colSpan={4}>
            <div className="pr-label">Budget Allocation Availability :</div>
            <span className="pr-value">
              {(detail.BUDGET_AVAILABILITY ?? '').toUpperCase() === 'Y' ? 'Yes' : 'No'}
            </span>

            {(detail.BudgetDetails ?? []).length > 0 && (
              <table className="pr-budget-table">
                <thead>
                  <tr>
                    <th>Procurement Plan Number</th>
                    <th>Cost Code</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.BudgetDetails.map((b, idx) => (
                    <tr key={idx}>
                      <td>{b.BUDGET_NO}</td>
                      <td>{b.COST_CODE}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </td>
        </tr>

        {/* Required Items */}
        <tr>
          <td colSpan={12}>
            <div className="pr-label" style={{ marginBottom: 10 }}>Required Items</div>
            {isGoods ? (
              <table className="pr-items-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Item code</th>
                    <th>Description</th>
                    <th>UOM</th>
                    <th>Unit Price (Rs)</th>
                    <th>Req Qty</th>
                    <th>Total (Rs)</th>
                    <th>Available Stock Level</th>
                    <th>Capital Budget</th>
                    <th>Procurement Plan Number</th>
                  </tr>
                </thead>
                <tbody>
                  {(detail.ItemList ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ color: '#9ca3af', fontStyle: 'italic' }}>No items.</td>
                    </tr>
                  ) : (
                    detail.ItemList.map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{item.ItemCode}</td>
                        <td className="td-left">{item.Description}</td>
                        <td>{item.UOM}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(item.UnitPrice)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(item.Qty)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(item.Total)}</td>
                        <td>{item.AvailableStockLevel}</td>
                        <td>{item.CapitalBudget === '1' ? 'YES' : 'NO'}</td>
                        <td>{item.BudgetNo}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="pr-items-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Description</th>
                    <th>UOM</th>
                    <th>Unit Price (Rs)</th>
                    <th>Req Qty</th>
                    <th>Total (Rs)</th>
                    <th>Proc. Plan Number</th>
                  </tr>
                </thead>
                <tbody>
                  {(detail.ItemList ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ color: '#9ca3af', fontStyle: 'italic' }}>No items.</td>
                    </tr>
                  ) : (
                    detail.ItemList.map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td className="td-left">{item.Description}</td>
                        <td>{item.UOM}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(item.UnitPrice)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(item.Qty)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(item.Total)}</td>
                        <td>{item.BudgetNo}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </td>
        </tr>

        {/* Procurement Method / Bidder / Tech Committee */}
        <tr>
          <td colSpan={8}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 0' }}>
                    <div className="pr-label">Procurement Method:</div>
                    <div className="pr-value" style={{ marginTop: 4 }}>
                      {(detail.ProcurementTypes ?? []).map((p) => p.PROC_TYPE_NAME).join(' , ')}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0' }}>
                    <div className="pr-label">Bidding Type:</div>
                    <div className="pr-value" style={{ marginTop: 4 }}>
                      {(detail.BidderTypes ?? []).map((b) => b.BIDDER_TYPE_NAME).join(' , ')}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>

          <td colSpan={4}>
            <div className="pr-label" style={{ marginBottom: 8 }}>Suggested Tech committee:</div>
            <table className="pr-tech-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                {(detail.TechCommittee ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={2} style={{ color: '#9ca3af', fontStyle: 'italic', textAlign: 'center' }}>—</td>
                  </tr>
                ) : (
                  detail.TechCommittee.map((t, idx) => (
                    <tr key={idx}>
                      <td>{t.Role}</td>
                      <td>{t.Name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </td>
        </tr>

        {/* Requested By */}
        <tr>
          <td colSpan={12}>
            <span className="pr-label">Requested By: </span>
            &nbsp;&nbsp;
            <span className="pr-label">Name: </span>
            <span className="pr-value">{accessC.NAME}</span>
            &nbsp;&nbsp;&nbsp;
            <span className="pr-label">Designation: </span>
            <span className="pr-value">{accessC.DESIGNATION}</span>
            &nbsp;&nbsp;&nbsp;
            <span className="pr-label">Signature: </span>
            <span className="pr-value">{accessC.SIGNATURE_LABEL}</span>
          </td>
        </tr>

        {/* Recommended By */}
        <tr>
          <td colSpan={12}>
            <span className="pr-label">Above All Details Are Correct And Recommended to Proceed: </span>
            &nbsp;&nbsp;
            <span className="pr-label">Name: </span>
            <span className="pr-value">{accessR.NAME}</span>
            &nbsp;&nbsp;&nbsp;
            <span className="pr-label">Designation: </span>
            <span className="pr-value">{accessR.DESIGNATION}</span>
            &nbsp;&nbsp;&nbsp;
            <span className="pr-label">Signature: </span>
            <span className="pr-value">{accessR.SIGNATURE_LABEL}</span>
          </td>
        </tr>

        {/* Approved By */}
        <tr>
          <td colSpan={12}>
            <span className="pr-label">Approved to Issue A {qtLabel} Number: </span>
            &nbsp;&nbsp;
            <span className="pr-label">Name: </span>
            <span className="pr-value">{accessA.NAME}</span>
            &nbsp;&nbsp;&nbsp;
            <span className="pr-label">Designation: </span>
            <span className="pr-value">{accessA.DESIGNATION}</span>
            &nbsp;&nbsp;&nbsp;
            <span className="pr-label">Signature: </span>
            <span className="pr-value">{accessA.SIGNATURE_LABEL}</span>
          </td>
        </tr>

        {/* Remarks — only shown when not empty, mirrors old divPRRemark.Visible */}
        {detail.PR_REMARK && (
          <tr>
            <td colSpan={12}>
              <span className="pr-label">Remarks :</span>
              <br />
              <span className="pr-value">{detail.PR_REMARK}</span>
            </td>
          </tr>
        )}

      </tbody>
    </table>
  );
};

export default PurchasingRequestViewAll;