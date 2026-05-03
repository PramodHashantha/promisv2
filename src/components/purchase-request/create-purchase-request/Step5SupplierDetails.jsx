import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import SearchableDropdown from '../../shared/SearchableDropdown';
import { usePRCreate } from '../../../context/PurchasingRequestCreateContext';
import useNotification from '../../../hooks/useNotification';
import { apiGet } from '../../../api/client/httpClient';
import { useApi } from '../../../hooks/useApi';

const getSupplierCategories = (signal) =>
  apiGet('/api/Supplier/Categories', signal);

const Step5SupplierDetails = ({ onNext, onBack }) => {
  const { form, addSupplier, removeSupplier } = usePRCreate();
  const { error: notifyError } = useNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [suppliersInCategory, setSuppliersInCategory] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  const { data: categories = [] } = useApi(getSupplierCategories, [], true);

  const handleCategoryChange = async (compositeValue) => {
    if (!compositeValue) {
      setCategoryId('');
      setSelectedSupplierId('');
      setSuppliersInCategory([]);
      return;
    }

    const [catId, type] = compositeValue.split('|');
    setCategoryId(catId);
    setSelectedSupplierId('');
    setSuppliersInCategory([]);

    setLoadingSuppliers(true);
    try {
      const result = await apiGet(
        `/api/Supplier/ByTypeAndId?id=${encodeURIComponent(catId)}&type=${encodeURIComponent(type)}`
      );
      setSuppliersInCategory(result ?? []);
    } catch {
      notifyError('Failed to load suppliers.');
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const handleAddSupplier = () => {
    if (!selectedSupplierId) return;
    const sup = suppliersInCategory.find((s) => s.supId === selectedSupplierId);
    addSupplier({ supplierId: selectedSupplierId, _name: sup?.supName ?? selectedSupplierId });
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCategoryId('');
    setSelectedSupplierId('');
    setSuppliersInCategory([]);
  };

  return (
    <div className="space-y-6">
      <div className="brand-card overflow-hidden">
        <div className="p-6 border-b border-brand-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-lg text-brand-text">Supplier Details</h3>
            <p className="text-sm text-brand-text-muted mt-1">
              Select suppliers to invite for quotation (minimum 3 recommended)
            </p>
          </div>
          <button type="button" onClick={() => setIsModalOpen(true)} className="brand-btn-primary gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Supplier
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-background/50 border-b border-brand-border">
                <th className="px-6 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider">No.</th>
                <th className="px-6 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider">Supplier ID</th>
                <th className="px-6 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {form.suppliers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <p className="font-medium text-brand-text">No suppliers added yet</p>
                    <p className="text-sm text-brand-text-muted mt-1">Click "Add Supplier" to select suppliers.</p>
                  </td>
                </tr>
              ) : (
                form.suppliers.map((s, idx) => (
                  <tr key={s.supplierId} className="hover:bg-brand-background/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-brand-text">{idx + 1}</td>
                    <td className="px-6 py-4 text-sm text-brand-text-secondary font-semibold whitespace-nowrap">{s.supplierId}</td>
                    <td className="px-6 py-4 text-sm text-brand-text">{s._name || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => removeSupplier(s.supplierId)}
                        className="p-2 rounded-lg border-0 bg-transparent appearance-none text-brand-text-muted hover:bg-error/10 hover:text-error transition-all"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-6">
        <button type="button" onClick={onBack} className="brand-btn-secondary gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12,19 5,12 12,5" />
          </svg>
          Back
        </button>
        <button type="button" onClick={onNext} className="brand-btn-primary gap-2">
          Review &amp; Submit
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
          </svg>
        </button>
      </div>

      {/* Add Supplier Modal */}
      {isModalOpen && createPortal(
        <div className="modal-overlay-new" role="dialog" aria-modal="true">
          <div className="modal-content-new animate-in" style={{ minWidth: 0, width: '100%', maxWidth: '520px', overflow: 'visible' }}>
            <button type="button" onClick={closeModal} className="modal-close">✕</button>
            <div className="modal-title">Add Supplier</div>

            <div className="modal-body space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-brand-text-secondary ml-1">Category</label>
                <select
                  className="brand-input"
                  value={categoryId ? `${categoryId}|${(categories.find(c => String(c.id) === categoryId) || {}).type}` : ''}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="">Select category...</option>
                  {(categories ?? []).map((c) => (
                    <option key={`${c.id}-${c.type}`} value={`${c.id}|${c.type}`}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-brand-text-secondary ml-1">Supplier</label>
                <SearchableDropdown
                  options={suppliersInCategory.map((s) => ({ id: s.supId, title: s.supName ?? s.supId }))}
                  value={selectedSupplierId}
                  onChange={(val) => setSelectedSupplierId(val)}
                  placeholder={
                    !categoryId ? 'Select a category first...' :
                    loadingSuppliers ? 'Loading suppliers...' :
                    'Select supplier...'
                  }
                  id="supplierSelect"
                />
              </div>
            </div>

            <div className="modal-actions">
              <div className="danger-actions">
                <button type="button" onClick={closeModal} className="brand-btn-secondary">Cancel</button>
              </div>
              <div className="save-actions">
                <button type="button" onClick={handleAddSupplier} disabled={!selectedSupplierId} className="brand-btn-primary disabled:opacity-50">
                  Add Supplier
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Step5SupplierDetails;