import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePRCreate } from '../../../context/PurchasingRequestCreateContext';
import { useAuth } from '../../../context/AuthContext';
import useNotification from '../../../hooks/useNotification';
import { useApi } from '../../../hooks/useApi';
import { useStatus } from '../../../hooks/useStatus';
import {
  getFormData,
  getApprovalHierarchy,
  getAuthorizationChain,
  getAccountExpenseCodes,
  getTenderLimit,
  submitPurchaseRequest,
  saveDraftPurchaseRequest,
  uploadPRFiles,
} from '../../../api/services/purchasingRequestCreate';

const Step6ReviewSubmit = ({ onBack }) => {
  const { form, estimatedCost, updateForm } = usePRCreate();
  const { user } = useAuth();
  const { success: notifySuccess, error: notifyError } = useNotification();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const { data: formData } = useApi(getFormData, [], true);
  const { data: hierarchy = [] } = useApi(getApprovalHierarchy, [], true);
  const { data: authChain } = useApi(
    getAuthorizationChain,
    [estimatedCost, form.typeOfPurchase, form.proceedAsTender ?? false],
    !!form.typeOfPurchase && estimatedCost > 0
  );
  const { data: accountCodes = [] } = useApi(
    getAccountExpenseCodes,
    [form.typeOfPurchase, form.prFor, form.prForUnit ?? '', form.prForLevel ?? ''],
    !!form.typeOfPurchase && !!form.prFor
  );
  const { data: tenderLimit = 0 } = useApi(getTenderLimit, [form.typeOfPurchase], form.typeOfPurchase > 0);

  const { getLabel: getCostCenterLabel } = useStatus('CostCenterTitle');

  const fmt = (n) =>
    Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const byId = (list, id) => (list ?? []).find((x) => x.id === id);

  const isGoods = form.typeOfPurchase === 1;

  const getUomName = (uomId) => byId(formData?.uomList, uomId)?.name ?? uomId ?? '—';
  const getProcurementName = (id) => byId(formData?.procurementMethods, id)?.name ?? String(id);
  const getBiddingName = (id) => byId(formData?.biddingTypes, id)?.name ?? String(id);
  const getRoleName = (id) => byId(formData?.techRoles, id)?.name ?? `Role ${id}`;
  const getUserName = (pfno) => (hierarchy ?? []).find((u) => u.pfno === pfno)?.fullName ?? pfno;

  const sectionName = getCostCenterLabel(user?.costCenter) || '—';
  const unitName = user?.sectionName || '—';

  const accountCodeDisplay =
    (accountCodes ?? []).find((c) => c.code === form.accountExpenseCode)?.codeAndDescription
    ?? form.accountExpenseCode
    ?? '—';

  const creator = authChain?.creator;
  const recommender = authChain?.recommender;
  const approver = authChain?.approver;

  const buildSubmitPayload = () => ({
    sysId: form.sysId,
    title: form.title,
    description: form.description,
    typeOfPurchase: form.typeOfPurchase,
    prFor: form.prFor,
    prForUnit: form.prForUnit,
    prForLevel: form.prForLevel,
    remark: form.remark,
    accountExpenseCode: form.accountExpenseCode,
    budgetAvailability: form.budgetAvailability,
    proceedAsTender: form.proceedAsTender,
    budgetItems: form.budgetItems.map((b) => ({
      rowId: b.rowId,
      budgetNo: b.budgetNo,
      budgetNoView: b.budgetNoView,
      estimatedCost: b.estimatedCost ?? 0,
      year: b.year,
    })),
    items: form.items.map((i, idx) => ({
      itemCode: form.typeOfPurchase === 1 ? i.itemCode : idx.toString(),
      description: i.description,
      uomId: i.uomId,
      unitPrice: i.unitPrice,
      qty: i.qty,
      total: i.total,
      stockAvailability: i.stockAvailability,
      capitalBudget: i.capitalBudget ?? 0,
      budgetNo: i.budgetNo ?? '',
      budgetNoView: i.budgetNoView ?? '',
    })),
    procurementMethods: form.procurementMethods,
    biddingTypes: form.biddingTypes,
    techCommittee: form.techCommittee,
    suppliers: form.suppliers,
  });

  const splitAttachments = () => ({
    newFiles: form.attachments.filter((a) => a.type === 'new').map((a) => a.file),
    keepUrls: form.attachments.filter((a) => a.type === 'existing').map((a) => a.url),
  });

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await submitPurchaseRequest(buildSubmitPayload());
      const { newFiles, keepUrls } = splitAttachments();
      const shouldUpload = form.sysId > 0 || newFiles.length > 0;
      if (shouldUpload)
        await uploadPRFiles(result.sysId, newFiles, keepUrls, result.status);
      notifySuccess(`Purchase request submitted successfully. PR No: ${result.prNo}`);
      navigate('/purchasingrequest');
    } catch (err) {
      notifyError(err.message || 'Failed to submit purchase request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      const result = await saveDraftPurchaseRequest({
        sysId: form.sysId,
        title: form.title,
        description: form.description,
        typeOfPurchase: form.typeOfPurchase,
        prFor: form.prFor,
        prForUnit: form.prForUnit,
        prForLevel: form.prForLevel,
        remark: form.remark,
        accountExpenseCode: form.accountExpenseCode,
        budgetAvailability: form.budgetAvailability,
        budgetItems: form.budgetItems.map((b) => ({
          rowId: b.rowId,
          budgetNo: b.budgetNo,
          budgetNoView: b.budgetNoView,
          estimatedCost: b.estimatedCost ?? 0,
          year: b.year,
        })),
        items: form.items.map((i) => ({
          itemCode: i.itemCode,
          description: i.description,
          uomId: i.uomId,
          unitPrice: i.unitPrice,
          qty: i.qty,
          total: i.total,
          stockAvailability: i.stockAvailability,
          capitalBudget: i.capitalBudget ?? 0,
          budgetNo: i.budgetNo ?? '',
          budgetNoView: i.budgetNoView ?? '',
        })),
      });

      const { newFiles, keepUrls } = splitAttachments();
      const shouldUpload = form.sysId > 0 || newFiles.length > 0;
      if (shouldUpload)
        await uploadPRFiles(result.sysId, newFiles, keepUrls, result.status);

      // After draft save: store sysId and convert new files to existing entries
      const updatedAttachments = [
        ...form.attachments.filter((a) => a.type === 'existing'),
        ...newFiles.map((f) => ({
          type: 'existing',
          url: `~/Documents/PR/${result.sysId}/${f.name}`,
          name: f.name,
        })),
      ];
      updateForm({ sysId: result.sysId, status: result.status, attachments: updatedAttachments });

      notifySuccess(`Draft saved. PR No: ${result.prNo}`);
    } catch (err) {
      notifyError(err.message || 'Failed to save draft.');
    } finally {
      setSavingDraft(false);
    }
  };

  const SectionTitle = ({ children }) => (
    <h3 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-3">{children}</h3>
  );

  const Field = ({ label, value }) => (
    <div>
      <p className="text-xs text-brand-text-muted font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-brand-text mt-0.5">{value || '—'}</p>
    </div>
  );

  const SignatureBox = ({ label, name, designation }) => (
    <div className="border border-brand-border rounded-xl p-4 space-y-3">
      <p className="text-xs font-bold text-brand-text-muted uppercase tracking-wider">{label}</p>
      <div className="h-12 border-b border-dashed border-brand-border" />
      <div>
        <p className="text-sm font-semibold text-brand-text">{name || '—'}</p>
        <p className="text-xs text-brand-text-muted mt-0.5">{designation || '—'}</p>
      </div>
    </div>
  );

  const thCls = 'py-2 px-3 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-left whitespace-nowrap';
  const tdCls = 'py-2 px-3 text-sm text-brand-text';
  const tdSecCls = 'py-2 px-3 text-sm text-brand-text-secondary';

  return (
    <div className="space-y-6">
      <div className="brand-card overflow-hidden animate-in">

        {/* Document header */}
        <div className="text-center py-5 px-6 border-b border-brand-border bg-brand-surface/60">
          <h2 className="text-lg font-bold text-brand-text tracking-widest uppercase">
            Purchase Requisition Application
          </h2>
        </div>

        {/* Section / Unit row */}
        <div className="grid grid-cols-2 divide-x divide-brand-border border-b border-brand-border">
          <div className="px-6 py-3">
            <p className="text-xs text-brand-text-muted font-semibold uppercase tracking-wider">Section</p>
            <p className="text-sm font-medium text-brand-text mt-0.5">{sectionName}</p>
          </div>
          <div className="px-6 py-3">
            <p className="text-xs text-brand-text-muted font-semibold uppercase tracking-wider">Unit</p>
            <p className="text-sm font-medium text-brand-text mt-0.5">{unitName}</p>
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-8">

          {/* Basic Info + Budget Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8 border-b border-brand-border">

            {/* Left: Basic details — vertical, no section title */}
            <div className="space-y-4">
              <Field label="Suggested Tender Title :" value={form.title} />
              <Field label="Brief Description of The Requirement :" value={form.description} />
              <Field label="Account / Expense Code :" value={accountCodeDisplay} />
              <Field label="Estimated Cost (Approx) :" value={`Rs. ${fmt(estimatedCost)}`} />
            </div>

            {/* Right: Budget availability + budget items */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-brand-text-muted font-semibold uppercase tracking-wider mb-1">
                  Budget Allocation Availability :
                </p>
                <p className="text-sm font-medium text-brand-text">
                  {form.budgetAvailability === 'Y' ? 'Available' : 'Not Available'}
                </p>
              </div>

              {form.budgetItems.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-brand-border">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-brand-background/50 border-b border-brand-border">
                        <th className={thCls}>Budget Item Number</th>
                        <th className={thCls}>Cost Code</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {form.budgetItems.map((b) => (
                        <tr key={b.rowId}>
                          <td className={tdCls + ' font-medium'}>{b.budgetNo || '—'}</td>
                          <td className={tdSecCls}>{b._costCode || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {form.budgetItems.length === 0 && (
                <p className="text-sm text-brand-text-muted italic">No budget items added.</p>
              )}
            </div>
          </div>

          {/* Required Items */}
          {form.items.length > 0 && (
            <div className="pb-8 border-b border-brand-border">
              <SectionTitle>Required Items ({form.items.length})</SectionTitle>
              <div className="overflow-x-auto rounded-lg border border-brand-border">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brand-background/50 border-b border-brand-border">
                      <th className={thCls}>No.</th>
                      {isGoods && <th className={thCls}>Item Code</th>}
                      <th className={thCls}>Description</th>
                      <th className={thCls}>UOM</th>
                      <th className={`${thCls} text-center`}>Req Qty</th>
                      <th className={`${thCls} text-right`}>Unit Price</th>
                      {isGoods && <th className={`${thCls} text-center`}>Available Stock Level</th>}
                      {isGoods && <th className={`${thCls} text-center`}>Capital Budget</th>}
                      {!isGoods && <th className={thCls}>Budget Item No</th>}
                      <th className={thCls}>Proc. Plan No</th>
                      <th className={`${thCls} text-right`}>Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {form.items.map((i, idx) => (
                      <tr key={isGoods ? i.itemCode : idx} className="hover:bg-brand-background/20 transition-colors">
                        <td className={tdCls}>{idx + 1}</td>
                        {isGoods && <td className={tdSecCls + ' font-semibold whitespace-nowrap'}>{i.itemCode}</td>}
                        <td className={tdCls + ' max-w-xs'}>{i.description}</td>
                        <td className={tdSecCls + ' whitespace-nowrap'}>{getUomName(i.uomId)}</td>
                        <td className={tdCls + ' text-center'}>{i.qty}</td>
                        <td className={tdCls + ' text-right'}>{fmt(i.unitPrice)}</td>
                        {isGoods && (
                          <td className={tdCls + ' text-center'}>
                            {i.stockAvailability}
                          </td>
                        )}
                        {isGoods && (
                          <td className={tdCls + ' text-center'}>
                            {i.capitalBudget === 1 ? 'Yes' : 'No'}
                          </td>
                        )}
                        {!isGoods && (
                          <td className={tdSecCls}>{i.budgetNo || '—'}</td>
                        )}
                        <td className={tdSecCls}>{i.budgetNoView || '—'}</td>
                        <td className={tdCls + ' text-right font-semibold'}>{fmt(i.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-brand-border">
                    <tr className="bg-brand-background/30">
                      <td
                        colSpan={isGoods ? 9 : 7}
                        className="py-2 px-3 text-right text-sm font-bold text-brand-text-secondary"
                      >
                        Total (Rs.)
                      </td>
                      <td className="py-2 px-3 text-right text-sm font-bold text-brand-text">
                        Rs. {fmt(estimatedCost)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Procurement + Bidding + Tech Committee */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8 border-b border-brand-border">

            <div className="space-y-6">
              {form.procurementMethods.length > 0 && (
                <div>
                  <SectionTitle>Procurement Method :</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {form.procurementMethods.map((id) => (
                      <span key={id} className="badge-status-primary">{getProcurementName(id)}</span>
                    ))}
                  </div>
                </div>
              )}
              {form.biddingTypes.length > 0 && (
                <div>
                  <SectionTitle>Bidding Type :</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {form.biddingTypes.map((id) => (
                      <span key={id} className="badge-status-success">{getBiddingName(id)}</span>
                    ))}
                  </div>
                </div>
              )}
              {form.procurementMethods.length === 0 && form.biddingTypes.length === 0 && (
                <p className="text-sm text-brand-text-muted italic">No procurement methods or bidding types selected.</p>
              )}
            </div>

            <div>
              <SectionTitle>Suggested Tech Committee :</SectionTitle>
              {form.techCommittee.length === 0 ? (
                <p className="text-sm text-brand-text-muted italic">No committee members added.</p>
              ) : (
                <div className="rounded-lg border border-brand-border overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-brand-background/50 border-b border-brand-border">
                        <th className={thCls}>Role</th>
                        <th className={thCls}>Name</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {form.techCommittee.map((m) => (
                        <tr key={`${m.pfno}-${m.roleId}`}>
                          <td className={tdCls}>
                            <span className="badge-status-primary">{getRoleName(m.roleId)}</span>
                          </td>
                          <td className={tdCls + ' font-medium'}>{getUserName(m.pfno)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Suppliers */}
          {form.suppliers.length > 0 && (
            <div className="pb-8 border-b border-brand-border">
              <SectionTitle>Suppliers ({form.suppliers.length})</SectionTitle>
              <div className="rounded-lg border border-brand-border overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brand-background/50 border-b border-brand-border">
                      <th className={thCls}>No.</th>
                      <th className={thCls}>Supplier ID</th>
                      <th className={thCls}>Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {form.suppliers.map((s, idx) => (
                      <tr key={s.supplierId}>
                        <td className={tdCls}>{idx + 1}</td>
                        <td className={tdSecCls + ' font-semibold'}>{s.supplierId}</td>
                        <td className={tdCls}>{s._name || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Remark — only shown when filled */}
          {form.remark && (
            <div className="pb-8 border-b border-brand-border">
              <SectionTitle>Remark</SectionTitle>
              <p className="text-sm text-brand-text bg-brand-background/40 rounded-lg p-4 border border-brand-border">
                {form.remark}
              </p>
            </div>
          )}

          {/* Attachments */}
          {form.attachments?.length > 0 && (
            <div className="pb-8 border-b border-brand-border">
              <SectionTitle>Attachments ({form.attachments.length})</SectionTitle>
              <ul className="space-y-1.5">
                {form.attachments.map((file, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-brand-text">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-text-muted shrink-0">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span>{file.name}</span>
                    <span className="text-brand-text-muted text-xs">({(file.size / 1024).toFixed(0)} KB)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Authorisation signatures */}
          {(() => {
            const strQT = (estimatedCost > tenderLimit || form.proceedAsTender) ? 'Tender' : 'Quotation';
            return (
              <div className="space-y-4">
                <SignatureBox
                  label="Requested By :"
                  name={creator?.name ?? '—'}
                  designation={creator?.designation ?? '—'}
                />
                <SignatureBox
                  label="Above All Details Are Correct And Recommended to Proceed :"
                  name={recommender?.name ?? '—'}
                  designation={recommender?.designation ?? '—'}
                />
                <SignatureBox
                  label={`Approved to Issue A ${strQT} Number :`}
                  name={approver?.name ?? '—'}
                  designation={approver?.designation ?? '—'}
                />
              </div>
            );
          })()}

        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={onBack} className="brand-btn-secondary gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12,19 5,12 12,5" />
          </svg>
          Back
        </button>

        <div className="flex gap-3">
          {(form.status === 0 || form.status === 95) && (
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={savingDraft || submitting}
              className="brand-btn-secondary gap-2 disabled:opacity-50"
            >
              {savingDraft ? 'Saving...' : 'Save as Draft'}
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || savingDraft || form.status === 100}
            className="brand-btn-primary gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                Submit Request
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step6ReviewSubmit;