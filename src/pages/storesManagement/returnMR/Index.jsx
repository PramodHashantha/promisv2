import React, { useState } from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import MRRequestList from '@/components/storesManagement/returnMR/MRRequestList';
import ReturnMRItemsTable from '@/components/storesManagement/returnMR/ReturnMRItemsTable';
import { returnMRAPI } from '@/utils/api/returnMR';
import Swal from 'sweetalert2';

const Index = () => {
  const [selectedMRNo, setSelectedMRNo] = useState(null);
  const [selectedMR, setSelectedMR]     = useState(null);
  const [outItems, setOutItems]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [saving, setSaving]             = useState(false);

  // ─── Reset page state (hides items table, deselects MR) ────────────────────
  const resetPage = () => {
    setSelectedMRNo(null);
    setSelectedMR(null);
    setOutItems([]);
  };

  // ─── Select MR ─────────────────────────────────────────────────────────────
  const handleSelectMR = async (mrNo, mrRow) => {
    try {
      setLoading(true);
      setSelectedMRNo(mrNo);
      setSelectedMR(mrRow || null);

      const data = await returnMRAPI.getStoreItemsByMRNo(mrNo);

      if (!data || data.length === 0) {
        await Swal.fire({
          icon: 'info',
          title: 'No Items',
          text: `No returnable items found for MR: ${mrNo}`,
          confirmButtonColor: '#fbbf24'
        });
        setOutItems([]);
        return;
      }

      setOutItems(data);

      setTimeout(() => {
        const itemsTable = document.querySelector('.return-mr-items-table');
        if (itemsTable) itemsTable.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Load Failed',
        text: error.message || 'Failed to load items. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReturnQtyChange = (item, qty) => {
    // Managed by child component
  };

  // ─── Save Return ────────────────────────────────────────────────────────────
  const handleSaveReturn = async (returnData) => {
    try {
      const { items, description, sk } = returnData;

      if (items.length === 0) {
        await Swal.fire({
          icon: 'warning',
          title: 'No Items',
          text: 'Please enter return quantity for at least one item',
          confirmButtonColor: '#fbbf24'
        });
        return;
      }

      const totalReturnQty = items.reduce((sum, item) => sum + (item.RETURN_QTY || 0), 0);

      const result = await Swal.fire({
        icon: 'question',
        title: 'Confirm Return',
        html: `<div style="text-align: left;">
                 <p><strong>MR Number:</strong> ${selectedMRNo}</p>
                 <p><strong>Items:</strong> ${items.length}</p>
                 <p><strong>Return Qty:</strong> ${totalReturnQty.toFixed(2)}</p>
               </div>`,
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, Save Return',
        cancelButtonText: 'Cancel'
      });

      if (!result.isConfirmed) return;

      setSaving(true);

      const firstItem = items[0];

      const carrier  = selectedMR
        ? `${selectedMR.REQUEST_PERSON || ''} (${selectedMR.PFNO || ''})`.trim()
        : '';
      const costCode = selectedMR?.COST_CODE || '';

      const saveRequest = {
        MR_NO:       selectedMRNo,
        W_ID:        firstItem.W_ID    || firstItem.w_ID || 0,
        R_ID:        firstItem.R_ID    || firstItem.r_ID || 0,
        SK_PFNO:     sk                || '',
        X:           firstItem.X       || firstItem.x    || '0',
        Y:           firstItem.Y       || firstItem.y    || '0',
        Description: description       || '',
        Carrier:     carrier,
        CostCode:    costCode,
        Items: items.map(item => ({
          ID:           item.ID           || item.id           || 0,
          R_ID:         item.R_ID         || item.r_ID         || 0,
          X:            item.X            || item.x            || '',
          Y:            item.Y            || item.y            || '',
          ITEM_NUMBER:  item.ITEM_NUMBER  || item.itemNumber   || '',
          DESCRIPTION:  item.DESCRIPTION  || item.description  || '',
          UNIT_PRICE:   item.UNIT_PRICE   || item.unitPrice    || 0,
          OUT_QTY:      item.OUT_QTY      || item.outQty       || 0,
          RETURN_QTY:   item.RETURN_QTY,
          ADJUSTED_QTY: item.ADJUSTED_QTY || item.adjustedQty  || 0,
          REF_NO:       item.REF_NO       || item.refNo        || ''
        }))
      };

      console.log('Saving Return MR:', saveRequest);
      const response = await returnMRAPI.saveReturnMR(saveRequest);

      if (response.success) {
        // ✅ Show success — THEN reset the page once user dismisses/timer ends
        await Swal.fire({
          icon: 'success',
          title: 'Return Saved',
          html: `<p>Return MR saved successfully!</p>
                 <p><strong>Return Ref ID:</strong> ${response.returnRefId || 'Generated'}</p>`,
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true
        });

        // ✅ Page resets after Swal closes — items table hides, MR deselected
        resetPage();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(response.message || 'Save failed');
      }
    } catch (error) {
      console.error('Error saving Return MR:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: error.message || 'Failed to save Return MR. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <PageHeader>
        <div className="return-mr-header-wrapper">
          <h1 className="page-title">Return MR</h1>
        </div>
      </PageHeader>

      <div className="main-content">
        <style jsx>{`
          .return-mr-header-wrapper { display: flex; align-items: center; }
          .page-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 0; color: #1f2937; }
          .section { margin-bottom: 24px; animation: slideIn 0.3s ease-out; }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div className="row">
          <div className="section">
            <MRRequestList
              onSelectMR={handleSelectMR}
              selectedMRNo={selectedMRNo}
            />
          </div>

          {selectedMRNo && outItems.length > 0 && (
            <div className="section">
              <ReturnMRItemsTable
                mrNo={selectedMRNo}
                items={outItems}
                onReturnQtyChange={handleReturnQtyChange}
                onSave={handleSaveReturn}
                saving={saving}
              />
            </div>
          )}

          {loading && (
            <div className="section" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{
                width: '40px', height: '40px', margin: '0 auto 1rem',
                border: '4px solid #e5e7eb', borderTopColor: '#3b82f6',
                borderRadius: '50%', animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: '#6b7280' }}>Loading items...</p>
            </div>
          )}
        </div>
      </div>

      <Footer />

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default Index;