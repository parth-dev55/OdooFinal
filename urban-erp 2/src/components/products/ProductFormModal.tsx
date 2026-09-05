import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Package, DollarSign, Tag, Layers, CheckCircle2, Loader2 } from 'lucide-react';
import { Product, ProductType, CreateProductDTO, UpdateProductDTO } from '../../types/product';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductDTO | UpdateProductDTO) => Promise<void>;
  initialData?: Product | null;
  mode: 'create' | 'edit';
}

const COMMON_CATEGORIES = [
  'Office Furniture',
  'Professional Services',
  'Bundles & Packages',
  'Electronics',
  'Hardware & Materials',
  'Software Licenses',
  'Consulting & Advisory',
  'Maintenance & Support',
  'Logistics & Shipping',
  'General Supplies',
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<ProductType>('GOODS');
  const [salesPrice, setSalesPrice] = useState<string>('');
  const [purchaseCost, setPurchaseCost] = useState<string>('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [customCategoryMode, setCustomCategoryMode] = useState(false);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setName(initialData.name || '');
      setType(initialData.type || 'GOODS');
      setSalesPrice(initialData.salesPrice !== undefined ? String(initialData.salesPrice) : '');
      setPurchaseCost(initialData.purchaseCost !== undefined ? String(initialData.purchaseCost) : '');
      setCategory(initialData.category || '');
      setDescription(initialData.description || '');
      setSku(initialData.sku || '');
      if (initialData.category && !COMMON_CATEGORIES.includes(initialData.category)) {
        setCustomCategoryMode(true);
      } else {
        setCustomCategoryMode(false);
      }
    } else {
      setName('');
      setType('GOODS');
      setSalesPrice('');
      setPurchaseCost('');
      setCategory('Office Furniture');
      setDescription('');
      setSku('');
      setCustomCategoryMode(false);
    }
    setErrors({});
    setApiError(null);
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Product Name is required';
    }

    if (!type) {
      errs.type = 'Product Type is required';
    }

    if (salesPrice === '' || salesPrice === null || salesPrice === undefined) {
      errs.salesPrice = 'Sales Price is required';
    } else {
      const sp = parseFloat(salesPrice);
      if (isNaN(sp) || sp < 0) {
        errs.salesPrice = 'Sales Price must be greater than or equal to 0';
      }
    }

    if (purchaseCost === '' || purchaseCost === null || purchaseCost === undefined) {
      errs.purchaseCost = 'Purchase Cost is required';
    } else {
      const pc = parseFloat(purchaseCost);
      if (isNaN(pc) || pc < 0) {
        errs.purchaseCost = 'Purchase Cost must be greater than or equal to 0';
      }
    }

    if (!category.trim()) {
      errs.category = 'Category is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError(null);

    try {
      const payload: CreateProductDTO = {
        name: name.trim(),
        type,
        salesPrice: parseFloat(salesPrice) || 0,
        purchaseCost: parseFloat(purchaseCost) || 0,
        category: category.trim(),
        description: description.trim() || undefined,
        sku: sku.trim() || undefined,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setApiError(err?.message || 'Failed to save product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D54B5] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {mode === 'create' ? 'Add New Product' : 'Edit Product'}
              </h2>
              <p className="text-xs text-gray-500">
                {mode === 'create'
                  ? 'Enter product details, pricing, and category'
                  : `Update specifications for ${initialData?.name || 'this product'}`}
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto py-4 space-y-4 flex-1 pr-1">
          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ergonomic Standing Desk Pro"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? 'border-red-300 focus:ring-red-400 bg-red-50/30 text-gray-900'
                  : 'border-gray-200 focus:ring-[#6D54B5] focus:border-transparent text-gray-900'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Product Type (Goods / Service / Combo) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Product Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { type: 'GOODS' as ProductType, label: 'Goods', desc: 'Physical inventory' },
                { type: 'SERVICE' as ProductType, label: 'Service', desc: 'Billable services' },
                { type: 'COMBO' as ProductType, label: 'Combo', desc: 'Bundled package' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setType(item.type)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    type === item.type
                      ? 'border-[#6D54B5] bg-purple-50/60 ring-1 ring-[#6D54B5]'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold ${
                        type === item.type ? 'text-[#6D54B5]' : 'text-gray-800'
                      }`}
                    >
                      {item.label}
                    </span>
                    {type === item.type && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#6D54B5]" />
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 block leading-tight">
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
            {errors.type && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.type}
              </p>
            )}
          </div>

          {/* Pricing Row: Sales Price & Purchase Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Sales Price */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Sales Price ($) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={salesPrice}
                  onChange={(e) => setSalesPrice(e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.salesPrice
                      ? 'border-red-300 focus:ring-red-400 bg-red-50/30 text-gray-900'
                      : 'border-gray-200 focus:ring-[#6D54B5] focus:border-transparent text-gray-900'
                  }`}
                />
              </div>
              {errors.salesPrice && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.salesPrice}
                </p>
              )}
            </div>

            {/* Purchase Cost */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Purchase Cost ($) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={purchaseCost}
                  onChange={(e) => setPurchaseCost(e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.purchaseCost
                      ? 'border-red-300 focus:ring-red-400 bg-red-50/30 text-gray-900'
                      : 'border-gray-200 focus:ring-[#6D54B5] focus:border-transparent text-gray-900'
                  }`}
                />
              </div>
              {errors.purchaseCost && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.purchaseCost}
                </p>
              )}
            </div>
          </div>

          {/* Price Margins Indicator */}
          {salesPrice !== '' && purchaseCost !== '' && !isNaN(parseFloat(salesPrice)) && !isNaN(parseFloat(purchaseCost)) && (
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs text-gray-600">
              <span>Gross Margin:</span>
              <span className={`font-semibold ${
                parseFloat(salesPrice) >= parseFloat(purchaseCost) ? 'text-green-600' : 'text-amber-600'
              }`}>
                ${(parseFloat(salesPrice) - parseFloat(purchaseCost)).toFixed(2)}
                {parseFloat(salesPrice) > 0 && (
                  <span className="ml-1 text-[11px] font-normal text-gray-500">
                    ({(((parseFloat(salesPrice) - parseFloat(purchaseCost)) / parseFloat(salesPrice)) * 100).toFixed(1)}%)
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Category <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setCustomCategoryMode(!customCategoryMode)}
                className="text-[11px] text-[#6D54B5] hover:underline font-medium"
              >
                {customCategoryMode ? 'Select from standard list' : '+ Enter custom category'}
              </button>
            </div>

            {customCategoryMode ? (
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Enter custom category name..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.category
                    ? 'border-red-300 focus:ring-red-400 bg-red-50/30 text-gray-900'
                    : 'border-gray-200 focus:ring-[#6D54B5] focus:border-transparent text-gray-900'
                }`}
              />
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all bg-white ${
                  errors.category
                    ? 'border-red-300 focus:ring-red-400 bg-red-50/30 text-gray-900'
                    : 'border-gray-200 focus:ring-[#6D54B5] focus:border-transparent text-gray-900'
                }`}
              >
                <option value="" disabled>Choose a category</option>
                {COMMON_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}

            {errors.category && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Description & SKU (optional metadata) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                SKU / Code
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. SKU-882"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6D54B5] text-gray-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description or notes..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6D54B5] text-gray-900"
              />
            </div>
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
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2.5 bg-[#6D54B5] hover:bg-[#5C459E] text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Product...</span>
              </>
            ) : (
              <span>{mode === 'create' ? 'Save Product' : 'Update Product'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
