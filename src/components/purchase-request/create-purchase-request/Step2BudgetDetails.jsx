import React, { useState } from 'react';
import { usePRCreate } from '../../../context/PurchasingRequestCreateContext';
import { useApi } from '../../../hooks/useApi';
import useNotification from '../../../hooks/useNotification';
import { getBudgetItems, getBudgetDetail } from '../../../api/services/purchasingRequestCreate';

const Step2BudgetDetails = ({ onNext, onBack }) => {
  const { form, updateForm, addBudgetItem, removeBudgetItem } = usePRCreate();
  const { showNotification } = useNotification();

  const currentYear = new Date().getFullYear();
  const [selectedRowId, setSelectedRowId] = useState('');
  const [addingDetail, setAddingDetail] = useState(false);

  const { data: budgetItemsRaw = [], loading: loadingItems } = useApi(
    getBudgetItems,
    [currentYear],
    true
  );

  const selectedRowIds = new Set(form.budgetItems.map((b) => b.rowId));
  const availableItems = (budgetItemsRaw ?? []).filter((b) => !selectedRowIds.has(b.rowId));

  const handleAdd = async () => {
    if (!selectedRowId) return;
    const rowId = parseInt(selectedRowId, 10);
    const listItem = availableItems.find((b) => b.rowId === rowId);

    setAddingDetail(true);
    try {
      const detail = await getBudgetDetail(rowId);
      if (!detail) {
        showNotification({ type: 'error', message: 'Budget detail not found.' });
        return;
      }
      addBudgetItem({
        rowId: detail.rowId,
        budgetNo: detail.budgetItemNo,
        budgetNoView: detail.procItemNo,
        estimatedCost: 0,
        year: detail.year,
        _appName: listItem?.typeOfProcurement ?? '',
        _costCode: detail.costCode,
        _costName: detail.costName,
        _approvedAmount: detail.approvedAmount,
        _submissionAmount: detail.submissionAmount,
        _prAmount: detail.prAmount,
        _remainBudget: detail.remainBudget,
      });
      setSelectedRowId('');
    } catch {
      showNotification({ type: 'error', message: 'Failed to load budget detail.' });
    } finally {
      setAddingDetail(false);
    }
  };

  const fmt = (n) =>
    Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const ChevronIcon = () => (
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brand-text-muted">
      <svg width="12" height="8" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1l4 4 4-4" /></svg>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Select Budget Source Card */}
      <div className="brand-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-warning/10 flex items-center justify-center text-brand-warning">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-brand-text">Select Budget Source</h2>
        </div>

        {/* Budget Availability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-text-secondary ml-1">
              Budget Availability <span className="text-error ml-0.5">*</span>
            </label>
            <div className="relative">
              <select
                className="appearance-none brand-input pr-10"
                value={form.budgetAvailability}
                onChange={(e) => updateForm({ budgetAvailability: e.target.value })}
              >
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
              <ChevronIcon />
            </div>
          </div>
        </div>

        {/* Two synchronized budget item dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-text-secondary ml-1">Proc. Plan No</label>
            <div className="relative">
              <select
                className="appearance-none brand-input pr-10"
                value={selectedRowId}
                onChange={(e) => setSelectedRowId(e.target.value)}
                disabled={loadingItems}
              >
                <option value="">
                  {loadingItems ? 'Loading...' : availableItems.length === 0 ? 'No items available' : 'Select by proc. plan no...'}
                </option>
                {availableItems.map((b) => (
                  <option key={b.rowId} value={b.rowId}>
                    {b.procItemNo}({b.year})
                  </option>
                ))}
              </select>
              <ChevronIcon />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-text-secondary ml-1">Type of Procurement</label>
            <div className="relative">
              <select
                className="appearance-none brand-input pr-10"
                value={selectedRowId}
                onChange={(e) => setSelectedRowId(e.target.value)}
                disabled={loadingItems}
              >
                <option value="">
                  {loadingItems ? 'Loading...' : availableItems.length === 0 ? 'No items available' : 'Select by procurement type...'}
                </option>
                {availableItems.map((b) => (
                  <option key={b.rowId} value={b.rowId}>
                    {b.typeOfProcurement}({b.year})
                  </option>
                ))}
              </select>
              <ChevronIcon />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selectedRowId || addingDetail}
            className="brand-btn-primary gap-2 h-[46px] disabled:opacity-50"
          >
            {addingDetail ? (
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" opacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
            Add to List
          </button>
        </div>
      </div>

      {/* Budget Allocation List Card */}
      <div className="brand-card overflow-hidden">
        <div className="p-6 border-b border-brand-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-text">Budget Allocation List</h2>
          <span className="text-sm text-brand-text-muted">{form.budgetItems.length} item(s) selected</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-brand-background/50 border-b border-brand-border">
                <th className="px-4 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider whitespace-nowrap">Proc. Plan No</th>
                <th className="px-4 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider whitespace-nowrap">Budget Item No</th>
                <th className="px-4 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider whitespace-nowrap">Type of Procurement</th>
                <th className="px-4 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider whitespace-nowrap">Cost Code</th>
                <th className="px-4 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider whitespace-nowrap">Cost Code Description</th>
                <th className="px-4 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-right whitespace-nowrap">EGL Approved Amount (Rs.Min)</th>
                <th className="px-4 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-right whitespace-nowrap">Total Allocated Amount (Rs.)</th>
                <th className="px-4 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-right whitespace-nowrap">Total Approved Amount (Rs.)</th>
                <th className="px-4 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-right whitespace-nowrap">Remain (Rs.)</th>
                <th className="px-4 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {form.budgetItems.map((item) => (
                <tr key={item.rowId} className="hover:bg-brand-background/30 transition-colors">
                  <td className="px-4 py-4 font-semibold text-brand-text-secondary whitespace-nowrap">{item.budgetNoView}({item.year})</td>
                  <td className="px-4 py-4 text-brand-text whitespace-nowrap">{item.budgetNo}</td>
                  <td className="px-4 py-4 text-brand-text">{item._appName}</td>
                  <td className="px-4 py-4 text-brand-text font-medium">{item._costCode}</td>
                  <td className="px-4 py-4 text-brand-text-muted">{item._costName}</td>
                  <td className="px-4 py-4 font-bold text-brand-text text-right whitespace-nowrap">{fmt(item._approvedAmount)}</td>
                  <td className="px-4 py-4 text-brand-text text-right whitespace-nowrap">{fmt(item._submissionAmount)}</td>
                  <td className="px-4 py-4 text-brand-text text-right whitespace-nowrap">{fmt(item._prAmount)}</td>
                  <td className="px-4 py-4 text-brand-text text-right whitespace-nowrap">{fmt(item._remainBudget)}</td>
                  <td className="px-4 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => removeBudgetItem(item.rowId)}
                      className="p-2 rounded-lg border-0 bg-transparent appearance-none text-brand-text-muted hover:bg-error/10 hover:text-error transition-all"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {form.budgetItems.length === 0 && (
                <tr>
                  <td colSpan="10" className="px-6 py-10 text-center text-brand-text-muted italic">
                    No budget items added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-6">
        <button onClick={onBack} className="brand-btn-secondary gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12,19 5,12 12,5" />
          </svg>
          Back
        </button>
        <button onClick={onNext} className="brand-btn-primary gap-2">
          Continue
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Step2BudgetDetails;