import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { returnMRRequestAPI } from '@/utils/api/returnMRRequest';

/**
 * HeadPersonApproval.jsx
 *
 * Converts frmReturnMRRequest (old ASP.NET WebForms page) to React.
 *
 * Old page behaviour:
 *  - On load: AJAX calls LoadMaterialRequestedBySKnoForReturnMRRequest
 *             → populates a DataTable with return MR requests
 *  - Clicking a row: reveals item details + approve/reject panel (via query string REF_ID in old page)
 *  - btnApprove_Click → SP_UPDATE_ReturnMRHeadApproval with RETURN_STATUS=2
 *  - btnReject_Click  → SP_UPDATE_ReturnMRHeadApproval with RETURN_STATUS=3
 *  - TextBox1 → head comment field (same for both approve and reject)
 *
 * New behaviour (exact equivalent):
 *  - Load list on mount
 *  - Click row → show item details + comment box + Approve/Reject buttons
 *  - Approve / Reject calls API → shows Swal → refreshes list
 */

const HeadPersonApproval = () => {
  const [list,            setList]            = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [selectedRow,     setSelectedRow]     = useState(null);
  const [selectedItems,   setSelectedItems]   = useState([]);
  const [headComment,     setHeadComment]     = useState('');
  const [actionLoading,   setActionLoading]   = useState(false);
  const [search,          setSearch]          = useState('');
  // Old page: optType dropdown — "10" = Request To Be Approved, "9" = Approved
  const [filterType,      setFilterType]      = useState('10');

  useEffect(() => {
    loadList();
  }, []);

  const loadList = async () => {
    try {
      setLoading(true);
      const data = await returnMRRequestAPI.getApprovalListByHeadPerson();
      setList(data || []);
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Group items by RETURN_REF_ID for the list table ────────────────────────
  // Old page showed one row per RETURN_REF_ID in the top DataTable
  const groupedList = React.useMemo(() => {
    const map = {};
    (list || []).forEach((item) => {
      if (!map[item.RETURN_REF_ID]) {
        map[item.RETURN_REF_ID] = {
          returnRefId: item.RETURN_REF_ID,
          mrNo:        item.REF_ID,
          requestType: item.REQUEST_TYPE || item.REF_ID || '',
          createdDate: item.CREATED_DATE,
          carrier:     item.CARRIER,
          statusText:  item.RETURN_STATUS_TEXT || String(item.RETURN_STATUS),
          status:      item.RETURN_STATUS,
          items:       [],
        };
      }
      map[item.RETURN_REF_ID].items.push(item);
    });
    return Object.values(map);
  }, [list]);

  // Old page: optType "10" = pending (RETURN_STATUS=1), "9" = approved/rejected (5 or 6)
  const filteredByType = groupedList.filter((row) => {
    if (filterType === '10') return row.status === 1;
    if (filterType === '9')  return row.status === 5 || row.status === 6;
    return true;
  });

  const filteredList = filteredByType.filter((row) =>
    !search ||
    row.returnRefId.toLowerCase().includes(search.toLowerCase()) ||
    row.mrNo.toLowerCase().includes(search.toLowerCase()) ||
    row.carrier.toLowerCase().includes(search.toLowerCase())
  );

  // ── Row click → show detail panel (old: query string REF_ID → loadStoreItemByMRNoRequest) ──
  const handleRowClick = (row) => {
    setSelectedRow(row);
    setSelectedItems(row.items);
    setHeadComment('');
  };

  // ── Approve (old: btnApprove_Click) ────────────────────────────────────────
  const handleApprove = async () => {
    if (!selectedRow) return;

    const confirm = await Swal.fire({
      title:              'Approve?',
      text:               `Approve return request ${selectedRow.returnRefId}?`,
      icon:               'question',
      showCancelButton:   true,
      confirmButtonColor: '#10b981',
      cancelButtonColor:  '#6b7280',
      confirmButtonText:  'Yes, Approve',
    });

    if (!confirm.isConfirmed) return;

    try {
      setActionLoading(true);
      await returnMRRequestAPI.approveByHeadPerson(
        selectedRow.returnRefId,
        selectedRow.mrNo,
        headComment
      );
      await Swal.fire('Accepted', 'Successfully Accepted', 'success');
      setSelectedRow(null);
      setSelectedItems([]);
      setHeadComment('');
      await loadList();
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Reject (old: btnReject_Click) ──────────────────────────────────────────
  const handleReject = async () => {
    if (!selectedRow) return;

    const confirm = await Swal.fire({
      title:              'Reject?',
      text:               `Reject return request ${selectedRow.returnRefId}?`,
      icon:               'warning',
      showCancelButton:   true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor:  '#6b7280',
      confirmButtonText:  'Yes, Reject',
    });

    if (!confirm.isConfirmed) return;

    try {
      setActionLoading(true);
      await returnMRRequestAPI.rejectByHeadPerson(
        selectedRow.returnRefId,
        selectedRow.mrNo,
        headComment
      );
      await Swal.fire('Rejected', 'Successfully Rejected', 'success');
      setSelectedRow(null);
      setSelectedItems([]);
      setHeadComment('');
      await loadList();
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (val) => {
    if (!val) return '-';
    try { return new Date(val).toLocaleDateString('en-GB'); } catch { return val; }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="head-approval-wrap">
      <style jsx>{`
        .head-approval-wrap { display: flex; flex-direction: column; gap: 24px; }

        /* ── Request List card ── */
        .card {
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.08);
          overflow: hidden;
        }
        .card-header {
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .card-header h2 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #1f2937; }
        .card-body { padding: 20px; }

        .search-input {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          width: 240px;
          outline: none;
        }
        .search-input:focus { border-color: #10b981; }
        .filter-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          background: #fff;
          cursor: pointer;
        }
        .filter-select:focus { border-color: #10b981; }

        /* ── Table ── */
        .table-responsive { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        thead tr { background: #4CAF50; color: #fff; }
        thead th { padding: 12px; text-align: center; border: 1px solid #ddd; font-weight: 600; }
        tbody tr { transition: background 0.2s; cursor: pointer; }
        tbody tr:nth-child(even)  { background: #f9f9f9; }
        tbody tr:nth-child(odd)   { background: #fff; }
        tbody tr:hover            { background: #f0fdf4; }
        tbody tr.selected-row     { background: #d1fae5 !important; font-weight: 600; }
        td { padding: 10px 12px; border: 1px solid #ddd; text-align: center; }

        .empty-msg { text-align: center; color: #9ca3af; padding: 32px; font-style: italic; }

        /* ── Detail panel (old: divOutItemList + approve/reject) ── */
        .detail-card .card-header { background: #f0fdf4; }
        .detail-table thead tr    { background: #6b7280; }

        .comment-label { font-weight: 600; color: #374151; margin-bottom: 6px; display: block; font-size: 14px; }
        .comment-box {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          resize: vertical;
          min-height: 80px;
          outline: none;
          box-sizing: border-box;
        }
        .comment-box:focus { border-color: #10b981; }

        .action-row { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }

      `}</style>

      {/* ── Request List (old: top DataTable) ── */}
      <div className="card">
        <div className="card-header">
          <h2>Request List</h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Old page: optType dropdown — onchange="Optupdate()" */}
            <select
              className="filter-select"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setSelectedRow(null);
                setSelectedItems([]);
              }}
            >
              <option value="10">Request To Be Approved</option>
              <option value="9">Approved</option>
            </select>
            <input
              className="search-input"
              placeholder="Search by Ref ID, MR No, Carrier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Request No</th>
                    <th>Request Type</th>
                    <th>Request Date</th>
                    <th>Request Person</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-msg">No pending approval requests found.</div>
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((row) => (
                      <tr
                        key={row.returnRefId}
                        className={selectedRow?.returnRefId === row.returnRefId ? 'selected-row' : ''}
                        onClick={() => handleRowClick(row)}
                      >
                        <td>
                          <button
                            className="brand-btn-success brand-btn-sm"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                            onClick={(e) => { e.stopPropagation(); handleRowClick(row); }}
                          >
                            ✏️
                          </button>
                        </td>
                        <td>{row.returnRefId}</td>
                        <td>{row.requestType}</td>
                        <td>{formatDate(row.createdDate)}</td>
                        <td>{row.carrier}</td>
                        <td>{row.statusText}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Panel (old: divOutItemList + TextBox1 + btnApprove + btnReject) ── */}
      {selectedRow && (
        <div className="card detail-card">
          <div className="card-header">
            <h2>Out Item List : {selectedRow.returnRefId}</h2>
          </div>
          <div className="card-body">
            {/* Items table (old: GridViewItemReturn) */}
            <div className="table-responsive" style={{ marginBottom: 20 }}>
              <table>
                <thead>
                  <tr>
                    <th>Item Code</th>
                    <th>Description</th>
                    <th>Out Qty</th>
                    <th>Return Qty</th>
                    <th>Return Description</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.ITEM_CODE}</td>
                      <td style={{ textAlign: 'left' }}>{item.DESCRIPTION1}</td>
                      <td>{item.OUT_QTY}</td>
                      <td>{item.RETURN_QTY}</td>
                      <td style={{ textAlign: 'left' }}>{item.HeadComment || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Comment box (old: TextBox1 — used for both approve and reject) */}
            <label className="comment-label">Description / Comment :</label>
            <textarea
              className="comment-box"
              placeholder="Enter comment..."
              value={headComment}
              onChange={(e) => setHeadComment(e.target.value)}
            />

            {/* Approve / Reject buttons (old: btnApprove + btnReject, float-right) */}
            <div className="action-row">
              <button
                className="brand-btn-danger"
                onClick={handleReject}
                disabled={actionLoading}
              >
                ✗ Reject
              </button>
              <button
                className="brand-btn-success"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                ✓ Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeadPersonApproval;