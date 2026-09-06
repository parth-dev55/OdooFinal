import React, { useState } from 'react';
import {
  X,
  FileText,
  Calendar,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  PackageCheck,
  Ban,
  Printer,
  Receipt,
  Loader2,
  AlertCircle,
  Truck
} from 'lucide-react';
import { PurchaseOrder, PurchaseOrderStatus } from '../../types/purchaseOrder';

interface PurchaseOrderViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: PurchaseOrder | null;
  onStatusChange?: (id: string | number, newStatus: PurchaseOrderStatus) => Promise<void>;
  onMarkReceived?: (id: string | number) => Promise<void>;
  onConvertToBill?: (id: string | number) => Promise<void>;
  canManageStatus?: boolean; // ADMIN or ACCOUNTANT
}

export const PurchaseOrderViewModal: React.FC<PurchaseOrderViewModalProps> = ({
  isOpen,
  onClose,
  order,
  onStatusChange,
  onMarkReceived,
  onConvertToBill,
  canManageStatus = true,
}) => {
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleConfirm = async () => {
    if (!onStatusChange) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await onStatusChange(order.id, 'CONFIRMED');
    } catch (e: any) {
      setActionError(e?.message || 'Failed to confirm purchase order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkReceived = async () => {
    if (!onMarkReceived) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await onMarkReceived(order.id);
    } catch (e: any) {
      setActionError(e?.message || 'Failed to mark goods received');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToBill = async () => {
    if (!onConvertToBill) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await onConvertToBill(order.id);
    } catch (e: any) {
      setActionError(e?.message || 'Failed to convert to vendor bill');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!onStatusChange) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await onStatusChange(order.id, 'CANCELLED');
    } catch (e: any) {
      setActionError(e?.message || 'Failed to cancel purchase order');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Draft</span>
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed</span>
          </span>
        );
      case 'RECEIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-[#6D54B5] border border-purple-200 rounded-full text-xs font-semibold">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Received</span>
          </span>
        );
      case 'BILLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
            <Receipt className="w-3.5 h-3.5" />
            <span>Billed</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 border border-gray-300 rounded-full text-xs font-semibold">
            <Ban className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-gray-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold text-gray-900">{order.orderNumber}</span>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Order Date: {order.orderDate || new Date(order.createdAt || '').toLocaleDateString()}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              title="Print Purchase Order"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Order Sheet */}
        <div className="overflow-y-auto py-4 space-y-5 flex-1 pr-1">
          {actionError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Vendor and Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#6D54B5]" />
                <span>Vendor Details</span>
              </div>
              <p className="text-sm font-bold text-gray-900">{order.vendorName}</p>
              {order.vendorEmail && (
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{order.vendorEmail}</span>
                </p>
              )}
              {order.vendorMobile && (
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{order.vendorMobile}</span>
                </p>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#6D54B5]" />
                <span>Fulfillment & Billing Status</span>
              </div>
              {order.status === 'DRAFT' && (
                <div>
                  <p className="text-xs text-amber-700 font-semibold">Draft Purchase Order</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Pending order confirmation. You can edit line items or confirm with vendor.
                  </p>
                </div>
              )}
              {order.status === 'CONFIRMED' && (
                <div>
                  <p className="text-xs text-blue-700 font-semibold">Confirmed with Vendor</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Awaiting shipment. Once items arrive, click &quot;Mark Goods Received&quot;.
                  </p>
                </div>
              )}
              {order.status === 'RECEIVED' && (
                <div>
                  <div className="text-xs text-[#6D54B5] font-semibold flex items-center gap-1">
                    <PackageCheck className="w-4 h-4" />
                    <span>Goods Received</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Eligible for vendor billing. Click &quot;Convert to Vendor Bill&quot; to generate invoice from vendor.
                  </p>
                </div>
              )}
              {order.status === 'BILLED' && (
                <div>
                  <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <Receipt className="w-4 h-4" />
                    <span>Billed as {order.billId}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Vendor bill registered in system. Historical purchase record locked.
                  </p>
                </div>
              )}
              {order.status === 'CANCELLED' && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Order Cancelled</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    This order was cancelled. Historical record preserved for audit compliance.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Purchase Line Items ({order.items?.length || 0})
            </h4>
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3 text-center">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {order.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3 font-medium text-gray-900">{item.productName}</td>
                      <td className="py-2.5 px-3 text-center text-gray-700">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right text-gray-700">
                        ₹{item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-gray-900">
                        ₹{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end">
            <div className="w-72 bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-800">
                  ₹{order.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between text-base">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="font-bold text-[#6D54B5]">
                  ₹{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="p-3.5 bg-gray-50 rounded-xl text-xs text-gray-600 border border-gray-100">
              <span className="font-bold text-gray-700 block mb-1">Notes:</span>
              <span>{order.notes}</span>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Close
          </button>

          {canManageStatus && (
            <div className="flex items-center gap-2">
              {order.status === 'DRAFT' && (
                <>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleCancel}
                    className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
                  >
                    Cancel Order
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleConfirm}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Confirm Order</span>
                  </button>
                </>
              )}

              {order.status === 'CONFIRMED' && (
                <>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleCancel}
                    className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
                  >
                    Cancel Order
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleMarkReceived}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#6D54B5] hover:bg-[#5C459E] rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating Status...</span>
                      </>
                    ) : (
                      <>
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Mark Goods Received</span>
                      </>
                    )}
                  </button>
                </>
              )}

              {order.status === 'RECEIVED' && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConvertToBill}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Converting to Bill...</span>
                    </>
                  ) : (
                    <>
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Convert to Vendor Bill</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
