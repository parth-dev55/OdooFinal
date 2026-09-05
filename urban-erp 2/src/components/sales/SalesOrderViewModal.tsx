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
  FileCheck, 
  Ban, 
  Printer, 
  Receipt,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { SalesOrder, SalesOrderStatus } from '../../types/salesOrder';

interface SalesOrderViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: SalesOrder | null;
  onStatusChange?: (id: string | number, newStatus: SalesOrderStatus) => Promise<void>;
  onGenerateInvoice?: (id: string | number) => Promise<void>;
  canManageStatus?: boolean; // ADMIN or ACCOUNTANT
}

export const SalesOrderViewModal: React.FC<SalesOrderViewModalProps> = ({
  isOpen,
  onClose,
  order,
  onStatusChange,
  onGenerateInvoice,
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
      setActionError(e?.message || 'Failed to confirm sales order');
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
      setActionError(e?.message || 'Failed to cancel sales order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleInvoice = async () => {
    if (!onGenerateInvoice) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await onGenerateInvoice(order.id);
    } catch (e: any) {
      setActionError(e?.message || 'Failed to generate customer invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: SalesOrderStatus) => {
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
      case 'INVOICED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Invoiced</span>
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
              <span>Created: {order.orderDate || new Date(order.createdAt || '').toLocaleDateString()}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              title="Print Sales Order"
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

          {/* Customer and Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#6D54B5]" />
                <span>Customer Details</span>
              </div>
              <p className="text-sm font-bold text-gray-900">{order.customerName}</p>
              {order.customerEmail && (
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{order.customerEmail}</span>
                </p>
              )}
              {order.customerMobile && (
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{order.customerMobile}</span>
                </p>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-[#6D54B5]" />
                <span>Invoice Status</span>
              </div>
              {order.invoiceId ? (
                <div>
                  <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <FileCheck className="w-4 h-4" />
                    <span>Invoiced as {order.invoiceId}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Historical record locked. Ledger postings completed.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-gray-600">Pending invoice generation.</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Once confirmed, click &quot;Generate Customer Invoice&quot; to push this transaction to the general ledger.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Order Line Items ({order.items?.length || 0})
            </h4>
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-center">Tax %</th>
                    <th className="py-2.5 px-3 text-right">Tax Amt</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {order.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3 font-medium text-gray-900">{item.productName}</td>
                      <td className="py-2.5 px-3 text-center text-gray-700">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right text-gray-700">₹{item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-2.5 px-3 text-center text-gray-500">{item.taxRate}%</td>
                      <td className="py-2.5 px-3 text-right text-gray-500">₹{item.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
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
              <div className="flex justify-between text-gray-600">
                <span>Total Tax:</span>
                <span className="font-semibold text-gray-800">
                  ₹{order.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between text-base">
                <span className="font-bold text-gray-900">Grand Total:</span>
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
                    onClick={handleInvoice}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#6D54B5] hover:bg-[#5C459E] rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Invoice...</span>
                      </>
                    ) : (
                      <>
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Generate Customer Invoice</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
