import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { purchasingRequestFromInventoryAPI } from '@/utils/api/purchasingRequestFromInventory';

/**
 * PurchasingRequestViewFromInventory.jsx
 *
 * Fixes applied v2:
 *  1. Filter radio options are HARDCODED — same 4 the old page always showed:
 *       Show Recent | Draft Save | PR to Be Recommended | Show All
 *     Removed the API-driven filter call because the SP
 *     (SP_GET_PurchaseRequestByPFNoTableStatus) filters by PFNO and may not
 *     return results for every user, causing missing radio options.
 *
 *  2. Pagination — 10 rows per page with "Showing X to Y of Z entries"
 *     and Previous / page-number / Next buttons, exactly like old DataTable.
 *     "Show Recent" mode shows exactly the first 10 records with no pagination buttons.
 *
 * Status text (old code):
 *   STATUS == 0 → "Request Created"
 *   STATUS != 0 → "Request Approved"
 */

// ─── Status helpers ───────────────────────────────────────────────────────────
const getStatusText  = (status) => (status === 0 ? 'Request Created' : 'Request Approved');
const getStatusStyle = (status) =>
  status === 0
    ? { backgroundColor: '#ffafb0', color: '#7f1d1d' }
    : { backgroundColor: '#96d1c7', color: '#134e4a' };

// ─── Hardcoded filter options (mirrors old rdFilter exactly) ─────────────────
const FILTER_OPTIONS = [
  { label: 'Show Recent',          value: 'show_recent' },
  { label: 'Draft Save',           value: 'draft_save'  },
  { label: 'PR to Be Recommended', value: 'recommend'   },
  { label: 'Show All',             value: 'show_all'    },
];

const PAGE_SIZE = 10;

const formatDate = (val) => {
  if (!val) return '-';
  try {
    const d = new Date(val);
    return (
      d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) +
      ' ' +
      d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
    );
  } catch { return val; }
};

// ─── Component ────────────────────────────────────────────────────────────────
const PurchasingRequestViewFromInventory = () => {
  const [list,          setList]          = useState([]);
  const [loadingList,   setLoadingList]   = useState(true);
  const [activeFilter,  setActiveFilter]  = useState('show_recent'); // old: SelectedIndex=0
  const [search,        setSearch]        = useState('');
  const [currentPage,   setCurrentPage]   = useState(1);
  const [selectedId,    setSelectedId]    = useState(null);
  const [detailRows,    setDetailRows]    = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => { loadList(); }, []);

  const loadList = async () => {
    try {
      setLoadingList(true);
      const data = await purchasingRequestFromInventoryAPI.getAll();
      setList(data || []);
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setLoadingList(false);
    }
  };

  // ── Filter then search ────────────────────────────────────────────────────
  const filteredList = useMemo(() => {
    let result = [...list]; // API already sorted by CREATE_DATE desc

    if      (activeFilter === 'show_recent') result = result.slice(0, 10);
    else if (activeFilter === 'draft_save')  result = result.filter((r) => r.STATUS === 5);
    else if (activeFilter === 'recommend')   result = result.filter((r) => r.STATUS === 1);
    // 'show_all' → keep all

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          String(r.ID).includes(q) ||
          String(r.INVENTORY_REQUEST_ID).toLowerCase().includes(q) ||
          r.CREATE_BY.toLowerCase().includes(q) ||
          getStatusText(r.STATUS).toLowerCase().includes(q)
      );
    }
    return result;
  }, [list, activeFilter, search]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const isShowRecent = activeFilter === 'show_recent';
  const totalPages   = isShowRecent ? 1 : Math.ceil(filteredList.length / PAGE_SIZE);

  const pagedList = useMemo(() => {
    if (isShowRecent) return filteredList; // already sliced to 10
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [filteredList, currentPage, isShowRecent]);

  const startEntry = filteredList.length === 0 ? 0
    : isShowRecent ? 1 : (currentPage - 1) * PAGE_SIZE + 1;
  const endEntry   = isShowRecent
    ? filteredList.length
    : Math.min(currentPage * PAGE_SIZE, filteredList.length);

  // Reset page when filter/search changes
  useEffect(() => { setCurrentPage(1); }, [activeFilter, search]);

  // ── View (👁) ─────────────────────────────────────────────────────────────
  const handleView = useCallback(async (id) => {
    if (selectedId === id) { setSelectedId(null); setDetailRows([]); return; }
    try {
      setSelectedId(id);
      setDetailRows([]);
      setLoadingDetail(true);
      const data = await purchasingRequestFromInventoryAPI.getDetailsById(id);
      setDetailRows(data || []);
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
      setSelectedId(null);
    } finally {
      setLoadingDetail(false);
    }
  }, [selectedId]);

  // ── Select (✏) → navigate to Purchasing Request form ─────────────────────
  const handleSelect = useCallback((id) => {
    window.location.href = `/PurchasingRequest?ID=${id}&MOD=1`;
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="prfi-wrap">
      <style>{`
        .prfi-wrap { display:flex; flex-direction:column; gap:24px;
          font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; }

        /* Card */
        .prfi-card { background:#fff; border-radius:10px;
          box-shadow:0 2px 8px rgba(0,0,0,0.08); overflow:hidden; }
        .prfi-card-header { padding:14px 20px; border-bottom:1px solid #e5e7eb;
          background:#fafafa; display:flex; align-items:center;
          justify-content:space-between; }
        .prfi-card-header h2 { margin:0; font-size:1rem; font-weight:700; color:#1f2937; }
        .prfi-card-body { padding:20px; }

        /* Filter radio — vertical stack like old page */
        .filter-bar { display:flex; flex-direction:column; gap:10px; margin-bottom:20px; }
        .filter-radio-item { display:flex; align-items:center; gap:8px; cursor:pointer;
          font-size:13.5px; color:#374151; user-select:none; }
        .filter-radio-item input[type="radio"] { accent-color:#16a34a;
          width:15px; height:15px; cursor:pointer; }

        /* Toolbar */
        .prfi-toolbar { display:flex; align-items:center; justify-content:space-between;
          flex-wrap:wrap; gap:10px; margin-bottom:14px; }
        .prfi-search { padding:7px 12px; border:1px solid #d1d5db; border-radius:6px;
          font-size:13.5px; width:220px; outline:none; }
        .prfi-search:focus { border-color:#f59e0b; }

        .btn-excel { display:inline-flex; align-items:center; gap:6px;
          padding:7px 16px; background:#16a34a; color:#fff; border:none;
          border-radius:6px; font-size:13.5px; font-weight:600; cursor:pointer;
          transition:background 0.2s; }
        .btn-excel:hover { background:#15803d; }

        /* Table */
        .prfi-table-wrap { overflow-x:auto; }
        .prfi-table { width:100%; border-collapse:collapse;
          font-size:13.5px; min-width:700px; }
        .prfi-table thead tr { background:#f59e0b; }
        .prfi-table thead th { padding:11px 14px; text-align:center;
          border:1px solid #fcd34d; color:#1c1917; font-weight:700; white-space:nowrap; }
        .prfi-table tbody tr:nth-child(even) { background:#f9fafb; }
        .prfi-table tbody tr:nth-child(odd)  { background:#ffffff; }
        .prfi-table tbody tr:hover           { background:#fef9ee; }
        .prfi-table tbody tr.row-active      { background:#fef3c7 !important; }
        .prfi-table td { padding:9px 14px; border:1px solid #e5e7eb;
          text-align:center; vertical-align:middle; }

        /* Status badge */
        .status-badge { display:inline-block; padding:3px 10px; border-radius:12px;
          font-size:12px; font-weight:600; white-space:nowrap; }

        /* Action buttons */
        .btn-view { display:inline-flex; align-items:center; justify-content:center;
          width:34px; height:34px; border:none; border-radius:6px;
          background:#f59e0b; color:#fff; cursor:pointer; font-size:15px;
          transition:background 0.2s; }
        .btn-view:hover  { background:#d97706; }
        .btn-view.active { background:#b45309; }

        .btn-sel { display:inline-flex; align-items:center; justify-content:center;
          width:34px; height:34px; border:none; border-radius:6px;
          background:#22c55e; color:#fff; cursor:pointer; font-size:15px;
          transition:background 0.2s; }
        .btn-sel:hover { background:#16a34a; }

        /* Empty */
        .prfi-empty { text-align:center; color:#9ca3af; padding:36px;
          font-style:italic; font-size:14px; }

        /* Pagination — mirrors old DataTable look */
        .prfi-pager { display:flex; align-items:center; justify-content:space-between;
          flex-wrap:wrap; gap:10px; margin-top:14px;
          font-size:13.5px; color:#6b7280; }
        .prfi-page-btns { display:flex; gap:4px; flex-wrap:wrap; }
        .prfi-page-btn { padding:5px 12px; border:1px solid #d1d5db; border-radius:4px;
          background:#fff; color:#374151; font-size:13px; cursor:pointer;
          transition:background 0.15s, color 0.15s; }
        .prfi-page-btn:hover:not(:disabled):not(.pg-active) { background:#f3f4f6; }
        .prfi-page-btn.pg-active { background:#f59e0b; color:#fff;
          border-color:#f59e0b; font-weight:700; }
        .prfi-page-btn:disabled { opacity:0.45; cursor:not-allowed; }

        /* Detail card */
        .detail-card .prfi-card-header { background:#f0fdf4; }
        .detail-card .prfi-table thead tr { background:#6b7280; }
        .detail-card .prfi-table thead th { border-color:#9ca3af; color:#fff; }
        .detail-label { font-size:13px; color:#6b7280; margin-bottom:12px; }
        .detail-label strong { color:#1f2937; }

        @media(max-width:640px){
          .prfi-toolbar { flex-direction:column; align-items:flex-start; }
          .prfi-search  { width:100%; }
        }
      `}</style>

      {/* ══ REQUEST LIST CARD ══ */}
      <div className="prfi-card">
        <div className="prfi-card-header">
          <h2>Request List</h2>
        </div>

        <div className="prfi-card-body">

          {/* Radio filter — vertical, matches old screenshot */}
          <div className="filter-bar">
            {FILTER_OPTIONS.map((opt) => (
              <label key={opt.value} className="filter-radio-item">
                <input
                  type="radio"
                  name="prfi-filter"
                  value={opt.value}
                  checked={activeFilter === opt.value}
                  onChange={() => setActiveFilter(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>

          {/* Toolbar: search */}
          <div className="prfi-toolbar">
            <input
              className="prfi-search"
              type="text"
              placeholder="Search ID, Inventory ID, Created By…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

          {/* Table */}
          {loadingList ? <LoadingSpinner /> : (
            <>
              <div className="prfi-table-wrap">
                <table className="prfi-table">
                  <thead>
                    <tr>
                      <th>View</th>
                      <th>Select</th>
                      <th>ID</th>
                      <th>Inventory Request ID</th>
                      <th>Created By</th>
                      <th>Create Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedList.length === 0 ? (
                      <tr>
                        <td colSpan={7}>
                          <div className="prfi-empty">No purchase requests found.</div>
                        </td>
                      </tr>
                    ) : (
                      pagedList.map((row) => (
                        <tr key={row.ID} className={selectedId === row.ID ? 'row-active' : ''}>
                          <td>
                            <button
                              className={`btn-view${selectedId === row.ID ? ' active' : ''}`}
                              title="View Details"
                              onClick={() => handleView(row.ID)}
                            >👁</button>
                          </td>
                          <td>
                            <button
                              className="btn-sel"
                              title="Open in Purchasing Request"
                              onClick={() => handleSelect(row.ID)}
                            >✏</button>
                          </td>
                          <td>{row.ID}</td>
                          <td>{row.INVENTORY_REQUEST_ID}</td>
                          <td>{row.CREATE_BY}</td>
                          <td>{formatDate(row.CREATE_DATE)}</td>
                          <td>
                            <span className="status-badge" style={getStatusStyle(row.STATUS)}>
                              {getStatusText(row.STATUS)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination bar */}
              <div className="prfi-pager">
                <span>
                  {filteredList.length === 0
                    ? 'No entries'
                    : `Showing ${startEntry} to ${endEntry} of ${filteredList.length} entries`}
                </span>

                {!isShowRecent && totalPages > 1 && (
                  <div className="prfi-page-btns">
                    <button
                      className="prfi-page-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >Previous</button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`prfi-page-btn${currentPage === p ? ' pg-active' : ''}`}
                        onClick={() => setCurrentPage(p)}
                      >{p}</button>
                    ))}

                    <button
                      className="prfi-page-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >Next</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══ REQUEST LIST DETAILS CARD ══ */}
      {selectedId !== null && (
        <div className="prfi-card detail-card">
          <div className="prfi-card-header">
            <h2>Request List Details</h2>
            <button
              style={{ background:'none', border:'none', cursor:'pointer',
                fontSize:'18px', color:'#6b7280', lineHeight:1 }}
              title="Close"
              onClick={() => { setSelectedId(null); setDetailRows([]); }}
            >✕</button>
          </div>

          <div className="prfi-card-body">
            <p className="detail-label">
              Showing details for <strong>Purchase Request ID: {selectedId}</strong>
            </p>

            {loadingDetail ? <LoadingSpinner /> : (
              <div className="prfi-table-wrap">
                <table className="prfi-table">
                  <thead>
                    <tr>
                      <th>Inventory Request ID</th>
                      <th>Inventory Item Details ID</th>
                      <th>Item Number</th>
                      <th>Quantity</th>
                      <th>Created By</th>
                      <th>Create Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailRows.length === 0 ? (
                      <tr>
                        <td colSpan={7}>
                          <div className="prfi-empty">No detail records found.</div>
                        </td>
                      </tr>
                    ) : (
                      detailRows.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.PURCHASE_REQUEST_FROM_INVENTORY_ID}</td>
                          <td>{row.INVENTORY_ITEM_DETAILS_ID}</td>
                          <td>{row.ITEM_NUMBER}</td>
                          <td>{row.QTY}</td>
                          <td>{row.CREATE__BY}</td>
                          <td>{formatDate(row.CREATE_DATE)}</td>
                          <td>
                            <span className="status-badge" style={getStatusStyle(row.STATUS)}>
                              {getStatusText(row.STATUS)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasingRequestViewFromInventory;