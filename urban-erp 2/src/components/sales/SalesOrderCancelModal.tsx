import React, { useState } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { SalesOrder } from '../../types/salesOrder';

interface SalesOrderCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string | number) => Promise<void>;
  order: SalesOrder | null;
}

export const SalesOrderCancelModal: React.FC<SalesOrderCancelModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  order,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handleCancelOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm(order.id);
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to cancel sales order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-amber-600">
            <div className="p-2 bg-amber-50 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Cancel Sales Order</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to cancel sales order <span className="font-semibold text-gray-900">{order.orderNumber}</span> for customer <span className="font-semibold text-gray-900">{order.customerName}</span>?
          </p>
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-800">
            <strong>Accounting Audit Compliance:</strong> In accordance with accounting best practices, historical orders are never hard-deleted. The order status will be updated to <span className="font-bold">CANCELLED</span>.
          </div>
          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={handleCancelOrder}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-2"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Confirm Cancellation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
