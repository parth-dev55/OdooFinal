import React from 'react';
import { X, Package, DollarSign, Tag, Calendar, Edit3, Power, CheckCircle2, XCircle, FileText, BarChart2 } from 'lucide-react';
import { Product } from '../../types/product';

interface ProductViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onEdit: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
}

export const ProductViewModal: React.FC<ProductViewModalProps> = ({
  isOpen,
  onClose,
  product,
  onEdit,
  onToggleStatus,
}) => {
  if (!isOpen || !product) return null;

  const typeStyles: Record<string, { bg: string; text: string; border: string }> = {
    GOODS: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    SERVICE: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    COMBO: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  };

  const currentTypeStyle = typeStyles[product.type] || typeStyles.GOODS;

  const salesPrice = Number(product.salesPrice) || 0;
  const purchaseCost = Number(product.purchaseCost) || 0;
  const margin = salesPrice - purchaseCost;
  const marginPct = salesPrice > 0 ? ((margin / salesPrice) * 100).toFixed(1) : '0.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-[#6D54B5] flex items-center justify-center font-bold">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">{product.name}</h2>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    product.status === 'ACTIVE'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {product.status === 'ACTIVE' ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {product.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {product.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto py-4 space-y-4 flex-1">
          {/* Classification & Category Badges */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50/70 rounded-xl border border-gray-100">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Type
              </span>
              <span
                className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${currentTypeStyle.bg} ${currentTypeStyle.text} ${currentTypeStyle.border}`}
              >
                {product.type}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Category
              </span>
              <span className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#6D54B5]" />
                {product.category || 'Uncategorized'}
              </span>
            </div>
          </div>

          {/* Pricing Details & Margins */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-gray-500 block mb-0.5">
                Sales Price
              </span>
              <span className="text-base font-bold text-gray-900">
                ${salesPrice.toFixed(2)}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-gray-500 block mb-0.5">
                Purchase Cost
              </span>
              <span className="text-base font-bold text-gray-900">
                ${purchaseCost.toFixed(2)}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-gray-500 block mb-0.5">
                Gross Margin
              </span>
              <span
                className={`text-base font-bold ${
                  margin >= 0 ? 'text-green-600' : 'text-amber-600'
                }`}
              >
                ${margin.toFixed(2)}
                <span className="text-xs font-normal text-gray-500 ml-1">({marginPct}%)</span>
              </span>
            </div>
          </div>

          {/* Description & Metadata */}
          {product.description && (
            <div className="p-3.5 bg-gray-50/50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                <FileText className="w-3.5 h-3.5 text-gray-400" />
                <span>Description</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          {/* SKU / System Details */}
          <div className="space-y-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
            {product.sku && (
              <div className="flex justify-between py-1">
                <span className="text-gray-400">SKU / Code:</span>
                <span className="font-mono text-gray-700 font-medium">{product.sku}</span>
              </div>
            )}
            {product.createdAt && (
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Created:</span>
                <span className="text-gray-700">
                  {new Date(product.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
            {product.updatedAt && (
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Last Modified:</span>
                <span className="text-gray-700">
                  {new Date(product.updatedAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              onClose();
              onToggleStatus(product);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              product.status === 'ACTIVE'
                ? 'border-red-200 text-red-600 hover:bg-red-50'
                : 'border-green-200 text-green-600 hover:bg-green-50'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {product.status === 'ACTIVE' ? 'Deactivate Product' : 'Reactivate Product'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(product);
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#6D54B5] hover:bg-[#5C459E] text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
