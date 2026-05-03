import React, { createContext, useContext, useState } from 'react';

const PurchasingRequestCreateContext = createContext(null);

export const usePRCreate = () => {
  const ctx = useContext(PurchasingRequestCreateContext);
  if (!ctx) throw new Error('usePRCreate must be used inside PurchasingRequestCreateProvider');
  return ctx;
};

const initialFormData = {
  sysId: 0,
  status: 0,
  title: '',
  description: '',
  typeOfPurchase: 0,
  prFor: 0,
  prForUnit: 0,
  prForLevel: '',
  remark: '',
  accountExpenseCode: '',
  budgetAvailability: 'Y',
  proceedAsTender: false,
  budgetItems: [],
  items: [],
  procurementMethods: [],
  biddingTypes: [],
  techCommittee: [],
  suppliers: [],
  attachments: [],
};

export const PurchasingRequestCreateProvider = ({ children }) => {
  const [form, setForm] = useState(initialFormData);

  const updateForm = (patch) =>
    setForm((prev) => ({ ...prev, ...patch }));

  // Budget items helpers
  const addBudgetItem = (item) =>
    setForm((prev) => ({ ...prev, budgetItems: [...prev.budgetItems, item] }));

  const removeBudgetItem = (rowId) =>
    setForm((prev) => ({
      ...prev,
      budgetItems: prev.budgetItems.filter((b) => b.rowId !== rowId),
    }));

  // Items helpers
  const addItem = (item) =>
    setForm((prev) => ({ ...prev, items: [...prev.items, item] }));

  const removeItem = (itemCode) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.itemCode !== itemCode),
    }));

  const updateItem = (originalItemCode, updatedItem) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.itemCode === originalItemCode ? updatedItem : i)),
    }));

  // Procurement method toggles
  const toggleProcurementMethod = (id) =>
    setForm((prev) => {
      const has = prev.procurementMethods.includes(id);
      return {
        ...prev,
        procurementMethods: has
          ? prev.procurementMethods.filter((m) => m !== id)
          : [...prev.procurementMethods, id],
      };
    });

  // Bidding type toggles
  const toggleBiddingType = (id) =>
    setForm((prev) => {
      const has = prev.biddingTypes.includes(id);
      return {
        ...prev,
        biddingTypes: has
          ? prev.biddingTypes.filter((b) => b !== id)
          : [...prev.biddingTypes, id],
      };
    });

  // Tech committee helpers
  const addTechMember = (member) =>
    setForm((prev) => ({ ...prev, techCommittee: [...prev.techCommittee, member] }));

  const removeTechMember = (pfno, roleId) =>
    setForm((prev) => ({
      ...prev,
      techCommittee: prev.techCommittee.filter(
        (m) => !(m.pfno === pfno && m.roleId === roleId)
      ),
    }));

  // Supplier helpers
  const addSupplier = ({ supplierId, _name = '' }) =>
    setForm((prev) => ({
      ...prev,
      suppliers: prev.suppliers.some((s) => s.supplierId === supplierId)
        ? prev.suppliers
        : [...prev.suppliers, { supplierId, _name }],
    }));

  const removeSupplier = (supplierId) =>
    setForm((prev) => ({
      ...prev,
      suppliers: prev.suppliers.filter((s) => s.supplierId !== supplierId),
    }));

  const estimatedCost = form.items.reduce((sum, i) => sum + (i.total || 0), 0);

  return (
    <PurchasingRequestCreateContext.Provider
      value={{
        form,
        updateForm,
        addBudgetItem,
        removeBudgetItem,
        addItem,
        removeItem,
        updateItem,
        toggleProcurementMethod,
        toggleBiddingType,
        addTechMember,
        removeTechMember,
        addSupplier,
        removeSupplier,
        estimatedCost,
      }}
    >
      {children}
    </PurchasingRequestCreateContext.Provider>
  );
};