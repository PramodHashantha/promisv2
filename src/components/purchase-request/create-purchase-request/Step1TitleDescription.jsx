import React, { useEffect, useState } from 'react';
import Radio from '@/components/shared/Radio';
import Checkbox from '@/components/shared/Checkbox';
import { usePRCreate } from '../../../context/PurchasingRequestCreateContext';
import { useApi } from '../../../hooks/useApi';
import {
  getFormData,
  getTenderLimit,
  getAccountExpenseCodes,
} from '../../../api/services/purchasingRequestCreate';

const PR_UNIT_OPTIONS = [
  { id: 1, name: 'Unit 1' },
  { id: 2, name: 'Unit 2' },
  { id: 3, name: 'Unit 3' },
];

const PR_LEVEL_OPTIONS = [
  { id: 'A', name: 'Level A' },
  { id: 'B', name: 'Level B' },
  { id: 'C', name: 'Level C' },
];

const Step1TitleDescription = ({ onNext, onPrTypeChange }) => {
  const { form, updateForm } = usePRCreate();
  const [accountCodes, setAccountCodes] = useState([]);
  const [loadingCodes, setLoadingCodes] = useState(false);

  const { data: formData, loading: loadingForm } = useApi(getFormData, [], true);

  const typesOfPurchase = formData?.typesOfPurchase ?? [];
  const prForOptions = formData?.prForOptions ?? [];

  // Fetch account expense codes whenever any of the 4 filter fields change.
  // Matches old system: TYPE_OF_PURCHASE + PR_FOR required; PR_FOR_UINT defaults "1",
  // PR_FOR_LEVEL defaults "A" on the server when not supplied.
  useEffect(() => {
    if (!form.typeOfPurchase || !form.prFor) {
      setAccountCodes([]);
      return;
    }

    let cancelled = false;
    setLoadingCodes(true);

    getAccountExpenseCodes(
      form.typeOfPurchase,
      form.prFor,
      form.prForUnit > 0 ? form.prForUnit : '',
      form.prForLevel || '',
      null
    )
      .then((data) => {
        if (!cancelled) setAccountCodes(data ?? []);
      })
      .catch(() => {
        if (!cancelled) setAccountCodes([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingCodes(false);
      });

    return () => { cancelled = true; };
  }, [form.typeOfPurchase, form.prFor, form.prForUnit, form.prForLevel]);

  // Reset account code selection when filter dependencies change
  useEffect(() => {
    updateForm({ accountExpenseCode: '' });
  }, [form.typeOfPurchase, form.prFor, form.prForUnit, form.prForLevel]);

  // Recalculate prType whenever estimatedCost, proceedAsTender, or typeOfPurchase changes
  const { data: tenderLimit } = useApi(
    getTenderLimit,
    [form.typeOfPurchase],
    form.typeOfPurchase > 0
  );

  const estimatedCost = form.items?.reduce((s, i) => s + (i.total || 0), 0) ?? 0;

  useEffect(() => {
    if (!form.typeOfPurchase) return;
    const limit = tenderLimit ?? 0;
    const isTender = form.proceedAsTender || estimatedCost > limit;
    onPrTypeChange?.(isTender ? 'T' : 'Q');
  }, [form.proceedAsTender, estimatedCost, tenderLimit, form.typeOfPurchase]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.typeOfPurchase || !form.prFor) return;
    if (form.prFor === 1 && (!form.prForUnit || !form.prForLevel)) return;
    onNext?.();
  };

  return (
    <div className="brand-card p-6 lg:p-8">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Title */}
        <div className="animate-in">
          <label className="block font-medium text-sm text-brand-text-secondary mb-2">
            Tender/Quotation Title <span className="text-error ml-0.5">*</span>
          </label>
          <input
            type="text"
            className="brand-input"
            placeholder="Enter a descriptive title for this request"
            value={form.title}
            onChange={(e) => updateForm({ title: e.target.value })}
            required
          />
        </div>

        {/* Description */}
        <div className="animate-in">
          <label className="block font-medium text-sm text-brand-text-secondary mb-2">
            Description <span className="text-error ml-0.5">*</span>
          </label>
          <textarea
            className="brand-input min-h-[120px] resize-y"
            placeholder="Provide detailed description of the purchasing requirements..."
            value={form.description}
            onChange={(e) => updateForm({ description: e.target.value })}
            required
          />
        </div>

        {/* Type of Purchase */}
        <div className="animate-in">
          <label className="block font-medium text-sm text-brand-text-secondary mb-2">
            Type Of Purchase <span className="text-error ml-0.5">*</span>
          </label>
          {loadingForm ? (
            <div className="text-sm text-brand-text-muted">Loading...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {typesOfPurchase.map((opt) => (
                <div
                  key={opt.id}
                  className={`px-4 py-3 brand-selection-card flex items-center ${form.typeOfPurchase === opt.id ? 'selected' : ''}`}
                >
                  <Radio
                    id={`type-${opt.id}`}
                    name="purchaseType"
                    label={opt.name}
                    checked={form.typeOfPurchase === opt.id}
                    onChange={() => updateForm({ typeOfPurchase: opt.id, accountExpenseCode: '' })}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PR For */}
        <div className="animate-in">
          <label className="block font-medium text-sm text-brand-text-secondary mb-2">
            PR For <span className="text-error ml-0.5">*</span>
          </label>
          {loadingForm ? (
            <div className="text-sm text-brand-text-muted">Loading...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {prForOptions.map((opt) => (
                <div
                  key={opt.id}
                  className={`px-4 py-3 brand-selection-card flex items-center ${form.prFor === opt.id ? 'selected' : ''}`}
                >
                  <Radio
                    id={`prfor-${opt.id}`}
                    name="prFor"
                    label={opt.name}
                    checked={form.prFor === opt.id}
                    onChange={() =>
                      updateForm({
                        prFor: opt.id,
                        prForUnit: opt.id === 1 ? 1 : 0,
                        prForLevel: opt.id === 1 ? 'A' : '',
                        accountExpenseCode: '',
                      })
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PR Unit — only when PR For = Overhaul (id 1) */}
        {form.prFor === 1 && (
          <div className="animate-in">
            <label className="block font-medium text-sm text-brand-text-secondary mb-2">
              PR Unit <span className="text-error ml-0.5">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PR_UNIT_OPTIONS.map((opt) => (
                <div
                  key={opt.id}
                  className={`px-4 py-3 brand-selection-card flex items-center ${form.prForUnit === opt.id ? 'selected' : ''}`}
                >
                  <Radio
                    id={`prunit-${opt.id}`}
                    name="prForUnit"
                    label={opt.name}
                    checked={form.prForUnit === opt.id}
                    onChange={() => updateForm({ prForUnit: opt.id, accountExpenseCode: '' })}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PR Level — only when PR For = Overhaul (id 1) */}
        {form.prFor === 1 && (
          <div className="animate-in">
            <label className="block font-medium text-sm text-brand-text-secondary mb-2">
              PR Level <span className="text-error ml-0.5">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PR_LEVEL_OPTIONS.map((opt) => (
                <div
                  key={opt.id}
                  className={`px-4 py-3 brand-selection-card flex items-center ${form.prForLevel === opt.id ? 'selected' : ''}`}
                >
                  <Radio
                    id={`prlevel-${opt.id}`}
                    name="prForLevel"
                    label={opt.name}
                    checked={form.prForLevel === opt.id}
                    onChange={() => updateForm({ prForLevel: opt.id, accountExpenseCode: '' })}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account/Expense Code */}
        <div className="animate-in">
          <label className="block font-medium text-sm text-brand-text-secondary mb-2">
            Account/Expense Code
          </label>
          <div className="relative">
            <select
              className="appearance-none brand-input pr-10"
              value={form.accountExpenseCode}
              onChange={(e) => updateForm({ accountExpenseCode: e.target.value })}
              disabled={!form.typeOfPurchase || !form.prFor || loadingCodes}
            >
              <option value="">
                {loadingCodes
                  ? 'Loading...'
                  : !form.typeOfPurchase || !form.prFor
                  ? 'Select Type of Purchase and PR For first'
                  : accountCodes.length === 0
                  ? 'No codes available'
                  : 'Select account code...'}
              </option>
              {accountCodes.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.codeAndDescription || c.code}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-brand-text-muted">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 1l4 4 4-4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Remark */}
        <div className="animate-in">
          <label className="block font-medium text-sm text-brand-text-secondary mb-2">
            Remark
          </label>
          <textarea
            className="brand-input min-h-[80px] resize-y"
            placeholder="Additional notes or comments..."
            value={form.remark}
            onChange={(e) => updateForm({ remark: e.target.value })}
          />
        </div>

        {/* Attachments */}
        <div className="animate-in">
          <label className="block font-medium text-sm text-brand-text-secondary mb-2">
            Attachments
          </label>
          <div className="space-y-3">
            {form.attachments.length > 0 && (
              <ul className="space-y-2">
                {form.attachments.map((att, idx) => {
                  const name = att.type === 'new' ? att.file.name : att.name;
                  const sizeKb = att.type === 'new' ? (att.file.size / 1024).toFixed(0) : null;
                  return (
                    <li key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg border border-brand-border bg-brand-background/40 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-text-muted shrink-0">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <span className="truncate text-brand-text">{name}</span>
                        {sizeKb && <span className="text-brand-text-muted shrink-0 text-xs">({sizeKb} KB)</span>}
                        {att.type === 'existing' && <span className="text-brand-text-muted shrink-0 text-xs">(saved)</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => updateForm({ attachments: form.attachments.filter((_, i) => i !== idx) })}
                        className="ml-3 p-1 rounded text-brand-text-muted hover:text-error hover:bg-error/10 transition-all shrink-0"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <label className="brand-btn-secondary gap-2 cursor-pointer inline-flex items-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
              Attach Files
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const picked = Array.from(e.target.files).map((f) => ({ type: 'new', file: f }));
                  updateForm({ attachments: [...form.attachments, ...picked] });
                  e.target.value = '';
                }}
              />
            </label>
          </div>
        </div>

        {/* Proceed as Tender */}
        <div className="animate-in pt-4 border-t border-brand-border">
          <Checkbox
            id="proceed-as-tender"
            label="Proceed as Tender"
            checked={form.proceedAsTender}
            onChange={(e) => updateForm({ proceedAsTender: e.target.checked })}
          />
          {form.proceedAsTender && (
            <p className="text-sm text-brand-warning mt-2">
              This request will be processed as a Tender. Supplier details step will be skipped.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 animate-in">
          {(form.status === 0 || form.status === 95) && (
            <button type="button" className="brand-btn-secondary">
              Save as Draft
            </button>
          )}
          <button type="submit" className="brand-btn-primary gap-2">
            Continue
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12,5 19,12 12,19" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step1TitleDescription;