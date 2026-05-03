import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Checkbox from '@/components/shared/Checkbox';
import SearchableDropdown from '../../shared/SearchableDropdown';
import { usePRCreate } from '../../../context/PurchasingRequestCreateContext';
import { useApi } from '../../../hooks/useApi';
import { getFormData, getApprovalHierarchy, getTenderLimit } from '../../../api/services/purchasingRequestCreate';

const CHAIRMAN_ROLE_ID = 1;
const CONVENER_ROLE_ID = 2;
const EVALUATOR_ROLE_ID = 4;

const Step4ProcurementDetails = ({ onNext, onBack }) => {
  const {
    form,
    estimatedCost,
    toggleProcurementMethod,
    toggleBiddingType,
    addTechMember,
    removeTechMember,
  } = usePRCreate();

  const { data: formData } = useApi(getFormData, [], true);
  const { data: hierarchy = [] } = useApi(getApprovalHierarchy, [], true);
  const { data: tenderLimit } = useApi(getTenderLimit, [form.typeOfPurchase], form.typeOfPurchase > 0);

  const isTender = form.proceedAsTender || (form.typeOfPurchase > 0 && estimatedCost > (tenderLimit ?? 0));

  const procurementMethods = formData?.procurementMethods ?? [];
  const biddingTypes = formData?.biddingTypes ?? [];
  const techRoles = formData?.techRoles ?? [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberRoleId, setMemberRoleId] = useState('');
  const [memberPfno, setMemberPfno] = useState('');

  const hasChairman = form.techCommittee.some((m) => m.roleId === CHAIRMAN_ROLE_ID);
  const hasConvener = form.techCommittee.some((m) => m.roleId === CONVENER_ROLE_ID);

  // Quotation: only 1 evaluator allowed; Tender: unlimited members
  const isAddDisabled = !isTender && form.techCommittee.length >= 1;

  // Tender mode shows Chairman/Convener/Member; Quotation mode role is fixed to Evaluator
  const availableRoles = techRoles.filter((r) => r.id !== EVALUATOR_ROLE_ID);

  const isRoleDisabled = (roleId) => {
    if (roleId === CHAIRMAN_ROLE_ID && hasChairman) return true;
    if (roleId === CONVENER_ROLE_ID && hasConvener) return true;
    return false;
  };

  const openModal = () => {
    setMemberRoleId(isTender ? '' : String(EVALUATOR_ROLE_ID));
    setMemberPfno('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setMemberRoleId('');
    setMemberPfno('');
  };

  const handleAddMember = () => {
    const roleId = isTender ? parseInt(memberRoleId, 10) : EVALUATOR_ROLE_ID;
    if (!memberPfno || !roleId) return;
    const alreadyAdded = form.techCommittee.some(
      (m) => m.pfno === memberPfno && m.roleId === roleId
    );
    if (!alreadyAdded) {
      addTechMember({ pfno: memberPfno, roleId });
    }
    closeModal();
  };

  const getRoleName = (roleId) =>
    techRoles.find((r) => r.id === roleId)?.name ?? `Role ${roleId}`;

  const getUserLabel = (pfno) => {
    const u = (hierarchy ?? []).find((h) => h.pfno === pfno);
    return u ? `${u.fullName} (${u.pfno})` : pfno;
  };

  const CheckboxItem = ({ id, label, isChecked, onToggle }) => (
    <div
      className={`flex items-center gap-2 p-3 brand-selection-card ${isChecked ? 'selected' : ''}`}
      onClick={(e) => { if (e.target.tagName !== 'INPUT') onToggle(); }}
    >
      <Checkbox
        id={`cb-${id}`}
        label={label}
        checked={isChecked}
        onChange={onToggle}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="brand-card p-6 lg:p-8 space-y-8 animate-in">

        {/* Procurement Methods */}
        <div>
          <h3 className="text-lg font-bold text-brand-text mb-4">Procurement Methods</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {procurementMethods.map((m) => (
              <CheckboxItem
                key={m.id}
                id={m.id}
                label={m.name}
                isChecked={form.procurementMethods.includes(m.id)}
                onToggle={() => toggleProcurementMethod(m.id)}
              />
            ))}
          </div>
        </div>

        {/* Bidding Types */}
        <div>
          <h3 className="text-lg font-bold text-brand-text mb-4">Bidding Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {biddingTypes.map((b) => (
              <CheckboxItem
                key={b.id}
                id={b.id}
                label={b.name}
                isChecked={form.biddingTypes.includes(b.id)}
                onToggle={() => toggleBiddingType(b.id)}
              />
            ))}
          </div>
        </div>

        {/* Tech Committee */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-brand-text">Technical Committee</h3>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isTender ? 'bg-brand-warning/15 text-brand-warning' : 'bg-brand-primary/15 text-brand-primary'}`}>
                {isTender ? 'Tender' : 'Quotation'}
              </span>
            </div>
            <button
              type="button"
              onClick={openModal}
              disabled={isAddDisabled}
              className="brand-btn-primary gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Member
            </button>
          </div>

          {!isTender && (
            <p className="text-sm text-brand-text-muted mb-3">
              Quotation mode — only one Evaluator member allowed.
            </p>
          )}

          <div className="border border-brand-border rounded-xl overflow-hidden shadow-brand-sm bg-brand-surface">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-brand-background/50 border-b border-brand-border">
                  <th className="px-6 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {form.techCommittee.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-brand-text-muted italic">
                      No committee members added yet.
                    </td>
                  </tr>
                ) : (
                  form.techCommittee.map((m) => (
                    <tr key={`${m.pfno}-${m.roleId}`} className="hover:bg-brand-background/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="badge-status-primary">{getRoleName(m.roleId)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-brand-text-secondary">{getUserLabel(m.pfno)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => removeTechMember(m.pfno, m.roleId)}
                          className="p-2 rounded-lg text-brand-text-muted hover:bg-error/10 hover:text-error transition-all"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          Continue
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
          </svg>
        </button>
      </div>

      {/* Add Member Modal */}
      {isModalOpen && createPortal(
        <div className="modal-overlay-new" role="dialog" aria-modal="true">
          <div className="modal-content-new animate-in" style={{ minWidth: 0, width: '100%', maxWidth: '520px', overflow: 'visible' }}>
            <button type="button" onClick={closeModal} className="modal-close">✕</button>
            <div className="modal-title">Add Committee Member</div>

            <div className="modal-body space-y-5">
              {isTender ? (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-brand-text-secondary ml-1">Role</label>
                  <select
                    className="brand-input"
                    value={memberRoleId}
                    onChange={(e) => setMemberRoleId(e.target.value)}
                  >
                    <option value="" disabled>Select role...</option>
                    {availableRoles.map((r) => (
                      <option key={r.id} value={r.id} disabled={isRoleDisabled(r.id)}>
                        {r.name}{isRoleDisabled(r.id) ? ' (already added)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="px-3 py-2 rounded-lg bg-brand-background border border-brand-border text-sm text-brand-text-secondary">
                  Role: <span className="font-semibold text-brand-text">Evaluator</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-brand-text-secondary ml-1">Employee</label>
                <SearchableDropdown
                  options={(hierarchy ?? []).map((u) => ({
                    id: u.pfno,
                    title: u.fullName,
                    subtitle: u.pfno,
                  }))}
                  value={memberPfno}
                  onChange={(val) => setMemberPfno(val)}
                  placeholder="Select employee..."
                />
              </div>
            </div>

            <div className="modal-actions">
              <div className="danger-actions">
                <button type="button" onClick={closeModal} className="brand-btn-secondary">Cancel</button>
              </div>
              <div className="save-actions">
                <button
                  type="button"
                  onClick={handleAddMember}
                  disabled={!memberPfno || (isTender && !memberRoleId)}
                  className="brand-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Member
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

export default Step4ProcurementDetails;