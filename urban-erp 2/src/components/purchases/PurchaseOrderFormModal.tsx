import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  AlertCircle,
  CreditCard,
  Loader2,
  Calculator,
  User,
  Calendar,
  Package,
  ShieldAlert
} from 'lucide-react';
import {
  PurchaseOrder,
  CreatePurchaseOrderDTO,
  UpdatePurchaseOrderDTO,
  CreatePurchaseOrderItemDTO
} from '../../types/purchaseOrder';
import { Contact } from '../../types/contact';
import { Product } from '../../types/product';
import { calculatePurchaseTotals } from '../../services/purchaseOrderService';

interface PurchaseOrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreatePurchaseOrderDTO | UpdatePurchaseOrderDTO,
    extraMeta: { vendorName: string; vendorEmail?: string; vendorMobile?: string }
  ) => Promise<void>;
  initialData?: PurchaseOrder | null;
  mode: 'create' | 'edit';
  contacts: Contact[];
  products: Product[];
  loadingData?: boolean;
}

interface ItemRowState {
  productId: string;
  productName: string;
  quantity: number | '';
  unitPrice: number | '';
}

export const PurchaseOrderFormModal: React.FC<PurchaseOrderFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  contacts,
  products,
  loadingData = false,
}) => {
  const [vendorId, setVendorId] = useState<string>('');
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [items, setItems] = useState<ItemRowState[]>([
    { productId: '', productName: '', quantity: 1, unitPrice: '' },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Eligible vendors: ONLY contacts with type 'VENDOR' or 'BOTH' and ACTIVE
  const eligibleVendors = useMemo(() => {
    return contacts.filter(
      c => (c.type === 'VENDOR' || c.type === 'BOTH') && c.status === 'ACTIVE'
    );
  }, [contacts]);

  // Active products
  const activeProducts = useMemo(() => {
    return products.filter(p => p.status === 'ACTIVE');
  }, [products]);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setVendorId(String(initialData.vendorId));
      setOrderDate(initialData.orderDate ? initialData.orderDate.split('T')[0] : new Date().toISOString().split('T')[0]);
      setNotes(initialData.notes || '');
      if (initialData.items && initialData.items.length > 0) {
        setItems(
          initialData.items.map(item => ({
            productId: String(item.productId),
            productName: item.productName || '',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          }))
        );
      } else {
        setItems([{ productId: '', productName: '', quantity: 1, unitPrice: '' }]);
      }
    } else {
      setVendorId('');
      setOrderDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setItems([{ productId: '', productName: '', quantity: 1, unitPrice: '' }]);
    }
    setErrors({});
    setApiError(null);
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const isEditable = mode === 'create' || (initialData && initialData.status === 'DRAFT');

  // Handle Product Selection on a specific line item
  const handleProductChange = (index: number, selectedProductId: string) => {
    const selectedProd = products.find(p => String(p.id) === String(selectedProductId));
    setItems(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        productId: selectedProductId,
        productName: selectedProd ? selectedProd.name : '',
        unitPrice: selectedProd ? selectedProd.purchaseCost : copy[index].unitPrice,
      };
      return copy;
    });
  };

  const handleItemFieldChange = (index: number, field: keyof ItemRowState, val: any) => {
    setItems(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: val,
      };
      return copy;
    });
  };

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      { productId: '', productName: '', quantity: 1, unitPrice: '' },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Live Calculations for summary display
  const calculatedTotals = useMemo(() => {
    const validItems = items.map(item => ({
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0,
    }));
    return calculatePurchaseTotals(validItems);
  }, [items]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!vendorId) {
      errs.vendorId = 'Vendor is required. Please select a vendor contact.';
    }

    if (!orderDate) {
      errs.orderDate = 'Order Date is required.';
    }

    if (items.length === 0) {
      errs.items = 'At least one product line item is required.';
    } else {
      items.forEach((item, idx) => {
        if (!item.productId) {
          errs[`item_${idx}_product`] = `Item #${idx + 1}: Please select a product.`;
        }
        if (item.quantity === '' || Number(item.quantity) <= 0) {
          errs[`item_${idx}_qty`] = `Item #${idx + 1}: Quantity must be greater than 0.`;
        }
        if (item.unitPrice === '' || Number(item.unitPrice) < 0) {
          errs[`item_${idx}_price`] = `Item #${idx + 1}: Unit price must be 0 or greater.`;
        }
      });
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedVendor = contacts.find(c => String(c.id) === String(vendorId));
    const vendorName = selectedVendor ? selectedVendor.name : 'Vendor #' + vendorId;
    const vendorEmail = selectedVendor?.email;
    const vendorMobile = selectedVendor?.mobile;

    const formattedItems: CreatePurchaseOrderItemDTO[] = items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
    }));

    setSubmitting(true);
    setApiError(null);

    try {
      const payload: CreatePurchaseOrderDTO = {
        vendorId,
        orderDate,
        items: formattedItems,
        notes: notes.trim() || undefined,
      };

      await onSubmit(payload, { vendorName, vendorEmail, vendorMobile });
      onClose();
    } catch (err: any) {
      setApiError(err?.message || 'Failed to save purchase order. Please verify backend connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl border border-gray-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D54B5] flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {mode === 'create' ? 'Create Purchase Order' : `Edit Purchase Order (${initialData?.orderNumber || ''})`}
              </h2>
              <p className="text-xs text-gray-500">
                {mode === 'create'
                  ? 'Select vendor, add product lines, and verify order totals'
                  : 'Update line items and order specifications before confirmation'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto py-4 space-y-5 flex-1 pr-1">
          {apiError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Edit Protection Notice */}
          {!isEditable && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Order Locked for Accounting Safety</strong>
                This purchase order has status <span className="font-bold">{initialData?.status}</span>. Orders that have been received or billed cannot be modified to prevent corrupting historical inventory and accounting records.
              </div>
            </div>
          )}

          {/* Top Section: Vendor & Date Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vendor Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  Vendor <span className="text-red-500">*</span>
                </span>
                <span className="text-[11px] text-gray-400 font-normal">From Contacts (Vendor / Both)</span>
              </label>

              {loadingData ? (
                <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#6D54B5]" />
                  <span>Loading vendors...</span>
                </div>
              ) : (
                <select
                  disabled={!isEditable}
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 ${
                    errors.vendorId
                      ? 'border-red-300 focus:ring-red-400 bg-red-50/30'
                      : 'border-gray-200 focus:ring-[#6D54B5]'
                  }`}
                >
                  <option value="">-- Select Vendor --</option>
                  {eligibleVendors.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name} ({contact.type}) {contact.city ? `• ${contact.city}` : ''}
                    </option>
                  ))}
                </select>
              )}

              {errors.vendorId && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.vendorId}</span>
                </p>
              )}
            </div>

            {/* Order Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Order Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                disabled={!isEditable}
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 ${
                  errors.orderDate
                    ? 'border-red-300 focus:ring-red-400 bg-red-50/30'
                    : 'border-gray-200 focus:ring-[#6D54B5]'
                }`}
              />
              {errors.orderDate && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.orderDate}</span>
                </p>
              )}
            </div>
          </div>

          {/* Line Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#6D54B5]" />
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Product Line Items <span className="text-red-500">*</span>
                </h3>
              </div>
              {isEditable && (
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#6D54B5] rounded-xl text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Item</span>
                </button>
              )}
            </div>

            {errors.items && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.items}</span>
              </p>
            )}

            {/* Line Items Table */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3 w-5/12">Product</th>
                      <th className="py-2.5 px-3 w-2/12">Quantity</th>
                      <th className="py-2.5 px-3 w-3/12">Unit Price</th>
                      <th className="py-2.5 px-3 w-2/12 text-right">Line Total</th>
                      {isEditable && <th className="py-2.5 px-2 w-12 text-center"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {items.map((item, idx) => {
                      const qty = Number(item.quantity) || 0;
                      const price = Number(item.unitPrice) || 0;
                      const lineTotal = qty * price;

                      const prodErr = errors[`item_${idx}_product`];
                      const qtyErr = errors[`item_${idx}_qty`];
                      const priceErr = errors[`item_${idx}_price`];

                      return (
                        <tr key={idx} className="hover:bg-purple-50/10">
                          {/* Product Select */}
                          <td className="p-2.5">
                            <select
                              disabled={!isEditable}
                              value={item.productId}
                              onChange={(e) => handleProductChange(idx, e.target.value)}
                              className={`w-full px-2.5 py-1.5 rounded-lg border text-xs bg-white text-gray-900 focus:ring-1 focus:ring-[#6D54B5] ${
                                prodErr ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
                              }`}
                            >
                              <option value="">-- Select Product --</option>
                              {activeProducts.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.type}) • Cost: ₹{p.purchaseCost.toLocaleString()}
                                </option>
                              ))}
                            </select>
                            {prodErr && <p className="text-[10px] text-red-600 mt-0.5">{prodErr}</p>}
                          </td>

                          {/* Quantity */}
                          <td className="p-2.5">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              disabled={!isEditable}
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemFieldChange(
                                  idx,
                                  'quantity',
                                  e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10))
                                )
                              }
                              className={`w-full px-2.5 py-1.5 rounded-lg border text-xs text-gray-900 focus:ring-1 focus:ring-[#6D54B5] ${
                                qtyErr ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
                              }`}
                            />
                            {qtyErr && <p className="text-[10px] text-red-600 mt-0.5">{qtyErr}</p>}
                          </td>

                          {/* Unit Price */}
                          <td className="p-2.5">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                                ₹
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                disabled={!isEditable}
                                value={item.unitPrice}
                                onChange={(e) =>
                                  handleItemFieldChange(
                                    idx,
                                    'unitPrice',
                                    e.target.value === '' ? '' : parseFloat(e.target.value)
                                  )
                                }
                                placeholder="0.00"
                                className={`w-full pl-6 pr-2.5 py-1.5 rounded-lg border text-xs text-gray-900 focus:ring-1 focus:ring-[#6D54B5] ${
                                  priceErr ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
                                }`}
                              />
                            </div>
                            {priceErr && <p className="text-[10px] text-red-600 mt-0.5">{priceErr}</p>}
                          </td>

                          {/* Line Total */}
                          <td className="p-2.5 text-right font-semibold text-gray-900">
                            <div>₹{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          </td>

                          {/* Remove Item */}
                          {isEditable && (
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                disabled={items.length <= 1}
                                className="p-1 text-gray-400 hover:text-red-500 rounded disabled:opacity-30 transition-colors"
                                title="Remove line item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Calculations Summary Box */}
          <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-sm">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                <Calculator className="w-3.5 h-3.5 text-[#6D54B5]" />
                <span>Order Calculation Summary</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Line Total = Quantity × Unit Price. Order Subtotal = sum of all line totals. Final calculation and validation confirmed by Spring Boot backend.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-800">
                  ₹{calculatedTotals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between text-sm">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="font-bold text-[#6D54B5]">
                  ₹{calculatedTotals.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Order Notes / Delivery Terms
            </label>
            <textarea
              rows={2}
              disabled={!isEditable}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Expected delivery at central warehouse within 5 business days, vendor quote ref #1234"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6D54B5] text-gray-900"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          {isEditable && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2.5 bg-[#6D54B5] hover:bg-[#5C459E] text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to PostgreSQL...</span>
                </>
              ) : (
                <span>{mode === 'create' ? 'Save Purchase Order' : 'Update Purchase Order'}</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
