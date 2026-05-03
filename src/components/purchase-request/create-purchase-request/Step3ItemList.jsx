import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePRCreate } from '../../../context/PurchasingRequestCreateContext';
import { useApi } from '../../../hooks/useApi';
import useNotification from '../../../hooks/useNotification';
import { getFormData, getItemByNumber, searchItems } from '../../../api/services/purchasingRequestCreate';

// TypePurchase enum: Goods = 1, Service = 2, Work = 3
const Step3ItemList = ({ onNext, onBack }) => {
  const { form, addItem, removeItem, updateItem, estimatedCost } = usePRCreate();
  const { showNotification } = useNotification();

  const isGoods = form.typeOfPurchase === 1;

  const { data: formData } = useApi(getFormData, [], true);
  const uomList = formData?.uomList ?? [];
  const uomMap = Object.fromEntries(uomList.map((u) => [u.id, u.name]));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemCode, setEditingItemCode] = useState(null); // null = add mode

  // ── modal state ────────────────────────────────────────────────────────────
  const [budgetRowId, setBudgetRowId] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [uomId, setUomId] = useState(0);
  const [uomName, setUomName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [qty, setQty] = useState('');
  const [stockAvailability, setStockAvailability] = useState('N');
  const [availableQty, setAvailableQty] = useState(null);
  const [capitalBudget, setCapitalBudget] = useState(0);
  const [lookingUp, setLookingUp] = useState(false);

  // live item search
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingItems, setSearchingItems] = useState(false);
  const debounceRef = useRef(null);
  const searchAbortRef = useRef(null);

  const selectedBudget = form.budgetItems.find((b) => b.rowId === parseInt(budgetRowId, 10));

  const fmt = (n) =>
    Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleLookupItem = async (code) => {
    const target = code ?? itemCode;
    if (!target) return;
    setLookingUp(true);
    try {
      const result = await getItemByNumber(target);
      if (result) {
        setItemCode(target);
        setItemDesc(result.description);
        setUnitPrice(result.lastPrice.toString());
        setUomId(result.uomId);
        setUomName(uomMap[result.uomId] ?? String(result.uomId));
        setAvailableQty(result.availableQty);
        setStockAvailability(result.availableQty > 0 ? Number(result.availableQty).toFixed(2) : 'Nil');
      } else {
        showNotification({ type: 'warning', message: `Item '${target}' not found in store.` });
      }
    } catch {
      showNotification({ type: 'error', message: 'Failed to look up item.' });
    } finally {
      setLookingUp(false);
    }
  };

  const handleItemSearchChange = (e) => {
    const q = e.target.value;
    setItemSearchQuery(q);
    setItemCode('');
    setItemDesc('');
    setUomId(0);
    setUomName('');
    setUnitPrice('');
    setAvailableQty(null);
    setStockAvailability('N');

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchAbortRef.current) searchAbortRef.current.abort();

    if (!q.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      searchAbortRef.current = controller;
      setSearchingItems(true);
      try {
        const results = await searchItems(q.trim(), controller.signal);
        setSuggestions(results ?? []);
        setShowSuggestions(true);
      } catch {
        // aborted or error — ignore
      } finally {
        setSearchingItems(false);
      }
    }, 300);
  };

  const handleSuggestionSelect = (suggestion) => {
    setItemSearchQuery(`${suggestion.itemNumber} — ${suggestion.description}`);
    setSuggestions([]);
    setShowSuggestions(false);
    handleLookupItem(suggestion.itemNumber);
  };

  const openEditModal = (item) => {
    const budgetItem = form.budgetItems.find((b) => b.budgetNoView === item.budgetNo);
    setEditingItemCode(item.itemCode);
    setBudgetRowId(budgetItem ? String(budgetItem.rowId) : '');
    setItemCode(isGoods ? item.itemCode : '');
    setItemSearchQuery(isGoods ? `${item.itemCode} — ${item.description}` : '');
    setSuggestions([]);
    setShowSuggestions(false);
    setItemDesc(item.description);
    setUomId(item.uomId);
    setUomName(item._uomName || uomMap[item.uomId] || '');
    setUnitPrice(String(item.unitPrice));
    setQty(String(item.qty));
    setStockAvailability(item.stockAvailability);
    setAvailableQty(item._availableQty ?? null);
    setCapitalBudget(item.capitalBudget ?? 0);
    setLookingUp(false);
    setIsModalOpen(true);
  };

  const handleSaveItem = () => {
    if (!budgetRowId) {
      showNotification({ type: 'warning', message: 'Please select a budget item.' });
      return;
    }
    const qtyNum = parseFloat(qty);
    const priceNum = parseFloat(unitPrice);
    if (!itemDesc || isNaN(qtyNum) || qtyNum <= 0 || isNaN(priceNum) || priceNum < 0) return;
    if (!isGoods && uomId === 0) {
      showNotification({ type: 'warning', message: 'Please select a UOM.' });
      return;
    }

    const budgetItem = form.budgetItems.find((b) => b.rowId === parseInt(budgetRowId, 10));
    const key = editingItemCode ?? (isGoods && itemCode ? itemCode : `SVC-${Date.now()}`);

    const newItem = {
      itemCode: key,
      description: itemDesc,
      uomId,
      unitPrice: priceNum,
      qty: qtyNum,
      total: priceNum * qtyNum,
      stockAvailability: isGoods ? stockAvailability : 'N',
      capitalBudget: isGoods ? capitalBudget : 0,
      // matches old system: BUDGET_NO = CURRENT_PROC_ITEM_NO, BUDGET_NO_VIEW = CURRENT_PROC_ITEM_NO(YEAR)
      budgetNo: budgetItem?.budgetNoView ?? '',
      budgetNoView: budgetItem ? `${budgetItem.budgetNoView}(${budgetItem.year})` : '',
      _uomName: isGoods ? uomName : (uomMap[uomId] ?? ''),
      _availableQty: isGoods ? availableQty : null,
    };

    if (editingItemCode !== null) {
      updateItem(editingItemCode, newItem);
    } else {
      addItem(newItem);
    }
    closeModal();
  };

  const closeModal = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchAbortRef.current) searchAbortRef.current.abort();
    setIsModalOpen(false);
    setEditingItemCode(null);
    setBudgetRowId('');
    setItemCode('');
    setItemDesc('');
    setUomId(0);
    setUomName('');
    setUnitPrice('');
    setQty('');
    setStockAvailability('N');
    setAvailableQty(null);
    setCapitalBudget(0);
    setLookingUp(false);
    setItemSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const budgetEstimatedCost = form.budgetItems.reduce((sum, b) => sum + (b._remainBudget || 0), 0);
  const isOverBudget = estimatedCost > budgetEstimatedCost && budgetEstimatedCost > 0;

  const colCount = isGoods ? 11 : 8;
  const totalLabelSpan = isGoods ? 7 : 6;

  const ChevronIcon = () => (
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brand-text-muted">
      <svg width="12" height="8" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1l4 4 4-4" /></svg>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="brand-card overflow-hidden">
        <div className="p-6 border-b border-brand-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-lg text-brand-text">Item Details</h3>
            <p className="text-sm text-brand-text-muted mt-1">Define the items to be procured</p>
          </div>
          <button type="button" onClick={() => setIsModalOpen(true)} className="brand-btn-primary gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-brand-background/50 border-b border-brand-border">
                <th className="px-4 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider">No.</th>
                <th className="px-4 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider whitespace-nowrap">Budget Item No</th>
                {isGoods && <th className="px-4 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider whitespace-nowrap">Item Code</th>}
                <th className="px-4 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider">Description</th>
                <th className="px-4 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider">UOM</th>
                <th className="px-4 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-right whitespace-nowrap">Unit Price (Rs.)</th>
                <th className="px-4 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-center whitespace-nowrap">Request Qty</th>
                <th className="px-4 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-right whitespace-nowrap">Total (Rs.)</th>
                {isGoods && <th className="px-4 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-center whitespace-nowrap">Available Stock Level</th>}
                {isGoods && <th className="px-4 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-center whitespace-nowrap">Capital Budget</th>}
                <th className="px-4 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {form.items.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="px-6 py-16 text-center">
                    <div className="w-16 h-16 bg-brand-background rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-text-muted">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
                      </svg>
                    </div>
                    <p className="font-medium text-brand-text">No items added yet</p>
                    <p className="text-sm text-brand-text-muted mt-1">Click "Add Item" to start building your request.</p>
                  </td>
                </tr>
              ) : (
                form.items.map((item, idx) => (
                  <tr key={item.itemCode} className="hover:bg-brand-background/30 transition-colors">
                    <td className="px-4 py-4 font-medium text-brand-text">{idx + 1}</td>
                    <td className="px-4 py-4 text-brand-text-secondary whitespace-nowrap">{item.budgetNo}</td>
                    {isGoods && <td className="px-4 py-4 text-brand-text-secondary whitespace-nowrap">{item.itemCode}</td>}
                    <td className="px-4 py-4 text-brand-text-secondary max-w-xs">{item.description}</td>
                    <td className="px-4 py-4 text-brand-text whitespace-nowrap">{item._uomName || uomMap[item.uomId] || item.uomId}</td>
                    <td className="px-4 py-4 font-medium text-brand-text text-right whitespace-nowrap">{fmt(item.unitPrice)}</td>
                    <td className="px-4 py-4 text-brand-text text-center">{item.qty}</td>
                    <td className="px-4 py-4 font-bold text-brand-text text-right whitespace-nowrap">{fmt(item.total)}</td>
                    {isGoods && (
                      <td className="px-4 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.stockAvailability !== 'Nil' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                          {item.stockAvailability !== 'Nil' ? 'Available' : 'Not Available'}
                        </span>
                      </td>
                    )}
                    {isGoods && (
                      <td className="px-4 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.capitalBudget === 1 ? 'bg-brand-primary/10 text-brand-primary' : 'bg-brand-surface text-brand-text-muted border border-brand-border'}`}>
                          {item.capitalBudget === 1 ? 'Yes' : 'No'}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-2 rounded-lg border-0 bg-transparent appearance-none text-brand-text-muted hover:bg-brand-primary/10 hover:text-brand-primary transition-all"
                          title="Edit item"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.itemCode)}
                          className="p-2 rounded-lg border-0 bg-transparent appearance-none text-brand-text-muted hover:bg-error/10 hover:text-error transition-all"
                          title="Delete item"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {form.items.length > 0 && (
              <tfoot className="border-t-2 border-brand-border bg-brand-background/30">
                <tr>
                  <td colSpan={totalLabelSpan} className="px-6 py-4 text-right font-bold text-brand-text-secondary">Total</td>
                  <td className="px-6 py-4 text-right font-bold text-lg text-brand-text whitespace-nowrap">{fmt(estimatedCost)}</td>
                  {isGoods && <td colSpan="2" />}
                  <td />
                </tr>
                <tr className="border-t border-brand-border">
                  <td colSpan={totalLabelSpan} className="px-6 py-3 text-right font-semibold text-brand-text-secondary">
                    Estimated Cost <span className="font-normal text-brand-text-muted">(Approx: + / - 10 %)</span>
                  </td>
                  <td className={`px-6 py-3 text-right font-bold whitespace-nowrap ${isOverBudget ? 'bg-red-100 text-error' : 'text-brand-text'}`}>
                    {fmt(budgetEstimatedCost)}
                  </td>
                  {isGoods && <td colSpan="2" />}
                  <td />
                </tr>
              </tfoot>
            )}
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
          Continue
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
          </svg>
        </button>
      </div>

      {/* Add Item Modal */}
      {isModalOpen && createPortal(
        <div className="modal-overlay-new" role="dialog" aria-modal="true">
          <div className="modal-content-new max-w-lg animate-in">
            <button type="button" onClick={closeModal} className="modal-close">✕</button>
            <div className="modal-title">{editingItemCode !== null ? 'Edit Item' : 'Add Item'}</div>

            <div className="modal-body">
              <div className="space-y-4">

                {/* Budget Item No */}
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-brand-text-secondary ml-1">
                    Budget Item No <span className="text-error ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="appearance-none brand-input pr-10"
                      value={budgetRowId}
                      onChange={(e) => setBudgetRowId(e.target.value)}
                    >
                      <option value="">
                        {form.budgetItems.length === 0
                          ? 'No budget items — add them in Step 2'
                          : 'Select budget item...'}
                      </option>
                      {form.budgetItems.map((b) => (
                        <option key={b.rowId} value={b.rowId}>{b.budgetNo}</option>
                      ))}
                    </select>
                    <ChevronIcon />
                  </div>
                  {selectedBudget && (
                    <p className="text-xs text-brand-text-muted ml-1">
                      Remain: <span className="font-semibold text-success">Rs. {fmt(selectedBudget._remainBudget)}</span>
                    </p>
                  )}
                </div>

                {/* Goods: live item search */}
                {isGoods && (
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-brand-text-secondary ml-1">
                      Item Search
                      {lookingUp && <span className="ml-2 text-xs font-normal text-brand-text-muted">Loading...</span>}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="brand-input w-full"
                        placeholder="Type item number or description..."
                        value={itemSearchQuery}
                        onChange={handleItemSearchChange}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        autoComplete="off"
                      />
                      {searchingItems && (
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                          <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      {showSuggestions && suggestions.length > 0 && (
                        <ul className="absolute z-50 w-full mt-1 bg-brand-surface border border-brand-border rounded-xl shadow-lg max-h-56 overflow-y-auto">
                          {suggestions.map((s) => (
                            <li
                              key={s.itemNumber}
                              onMouseDown={() => handleSuggestionSelect(s)}
                              className="px-4 py-3 cursor-pointer hover:bg-brand-background/60 transition-colors border-b border-brand-border last:border-0"
                            >
                              <span className="font-semibold text-brand-text text-sm">{s.itemNumber}</span>
                              <span className="text-brand-text-muted text-xs ml-2">{s.description}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {showSuggestions && !searchingItems && suggestions.length === 0 && itemSearchQuery.trim() && (
                        <div className="absolute z-50 w-full mt-1 bg-brand-surface border border-brand-border rounded-xl shadow-lg px-4 py-3 text-sm text-brand-text-muted">
                          No items found.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description — read-only for Goods, editable for Services/Works */}
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-brand-text-secondary ml-1">Description</label>
                  <textarea
                    className={`brand-input resize-none ${isGoods ? 'opacity-70 cursor-not-allowed' : ''}`}
                    rows="2"
                    placeholder={isGoods ? 'Auto-filled from item lookup' : 'Enter description'}
                    value={itemDesc}
                    onChange={(e) => { if (!isGoods) setItemDesc(e.target.value); }}
                    readOnly={isGoods}
                  />
                </div>

                {/* UOM — read-only for Goods, dropdown for Services/Works */}
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-brand-text-secondary ml-1">UOM</label>
                  {isGoods ? (
                    <input
                      type="text"
                      className="brand-input opacity-70 cursor-not-allowed"
                      value={uomName}
                      readOnly
                      placeholder="Auto-filled from item lookup"
                    />
                  ) : (
                    <div className="relative">
                      <select
                        className="appearance-none brand-input pr-10"
                        value={uomId}
                        onChange={(e) => setUomId(parseInt(e.target.value, 10))}
                      >
                        <option value={0}>Select UOM...</option>
                        {uomList.map((u) => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                      <ChevronIcon />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Unit Price — pre-filled for Goods but editable */}
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-brand-text-secondary ml-1">Unit Price (Rs.)</label>
                    <input
                      type="number"
                      className="brand-input"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-brand-text-secondary ml-1">Request Qty</label>
                    <input
                      type="number"
                      className="brand-input"
                      placeholder="0"
                      min="0.001"
                      step="0.001"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                    />
                  </div>
                </div>

                {qty && unitPrice && !isNaN(parseFloat(qty)) && !isNaN(parseFloat(unitPrice)) && (
                  <div className="text-sm font-semibold text-right text-brand-text">
                    Total: Rs. {fmt(parseFloat(qty) * parseFloat(unitPrice))}
                  </div>
                )}

                {/* Goods-only: Available Stock Level + Capital Budget */}
                {isGoods && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-brand-text-secondary ml-1">Available Stock Level</label>
                      <input
                        type="text"
                        className="brand-input opacity-70 cursor-not-allowed"
                        value={availableQty !== null
                          ? `${availableQty} (${stockAvailability !== 'Nil' ? 'Available' : 'Not Available'})`
                          : '—'}
                        readOnly
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-brand-text-secondary ml-1">Capital Budget</label>
                      <div className="relative">
                        <select
                          className="appearance-none brand-input pr-10"
                          value={capitalBudget}
                          onChange={(e) => setCapitalBudget(parseInt(e.target.value, 10))}
                        >
                          <option value={0}>No</option>
                          <option value={1}>Yes</option>
                        </select>
                        <ChevronIcon />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            <div className="modal-actions">
              <div className="danger-actions">
                <button type="button" onClick={closeModal} className="brand-btn-secondary">Cancel</button>
              </div>
              <div className="save-actions">
                <button type="button" onClick={handleSaveItem} className="brand-btn-primary">
                  {editingItemCode !== null ? 'Save Changes' : 'Add to List'}
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

export default Step3ItemList;