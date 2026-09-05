import React, { useState } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { PurchaseOrder } from '../../types/purchaseOrder';

interface PurchaseOrderCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: PurchaseOrder | null;
  onConfirmCancel: (orderId: string | number) => Promise<void>;
}

export const PurchaseOrderCancelModal: React.FC<PurchaseOrderCancelModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirmCancel,
}) => {
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handleCancel = async () => {
    setCancelling(true);
    setError(null);
    try {
      await onConfirmCancel(order.id);
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to cancel purchase order');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={cancelling}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-base font-bold text-gray-900">
            Cancel Purchase Order {order.orderNumber}?
          </h3>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Are you sure you want to cancel this purchase order from vendor <strong className="text-gray-700">{order.vendorName}</strong>?
            In accordance with ERP accounting rules, the order will be marked as <strong className="text-red-700 font-semibold">CANCELLED</strong> and retained for historical audit compliance rather than permanently deleted.
          </p>

          {error && (
            <div className="mt-3 p-2.5 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={cancelling}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Keep Order
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            {cancelling ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Cancelling...</span>
              </>
            ) : (
              <span>Confirm Cancellation</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
