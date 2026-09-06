import React from 'react';
import { 
  X, 
  Printer, 
  Calendar, 
  Receipt, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Building2,
  Mail,
  Phone,
  Truck
} from 'lucide-react';
import { VendorBill, BillStatus, PaymentStatus } from '../../types/bill';

interface BillDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: VendorBill | null;
  onRegisterPayment?: (bill: VendorBill) => void;
}

export const BillDetailModal: React.FC<BillDetailModalProps> = ({
  isOpen,
  onClose,
  bill,
  onRegisterPayment,
}) => {
  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: BillStatus) => {
    switch (status) {
      case 'DRAFT':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200"><Clock className="w-3.5 h-3.5" />Draft</span>;
      case 'POSTED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"><CheckCircle2 className="w-3.5 h-3.5" />Posted</span>;
      case 'PAID':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" />Paid</span>;
      case 'PARTIALLY_PAID':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5" />Partially Paid</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"><AlertCircle className="w-3.5 h-3.5" />Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const getPaymentStatusBadge = (paymentStatus: PaymentStatus) => {
    switch (paymentStatus) {
      case 'PAID':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" />PAID</span>;
      case 'PARTIALLY_PAID':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" />PARTIALLY PAID</span>;
      case 'UNPAID':
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"><AlertCircle className="w-3 h-3" />UNPAID</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div 
        id="vendor-bill-detail-modal"
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-100 my-8 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-gray-900">{bill.billNumber}</h2>
                {getStatusBadge(bill.status)}
                {getPaymentStatusBadge(bill.paymentStatus)}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {bill.purchaseOrderNumber ? `Derived from ${bill.purchaseOrderNumber}` : 'Vendor Payable Bill'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              title="Download / Print Bill"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bill Printable Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Vendor & Dates Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl bg-gray-50/70 border border-gray-100">
            <div>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Vendor
              </span>
              <div className="flex items-start gap-2 text-gray-900 font-semibold text-base">
                <Truck className="w-4 h-4 text-orange-600 mt-1 shrink-0" />
                <div>
                  <p>{bill.vendorName}</p>
                  {bill.vendorEmail && (
                    <p className="text-xs text-gray-500 font-normal flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-gray-400" />
                      {bill.vendorEmail}
                    </p>
                  )}
                  {bill.vendorMobile && (
                    <p className="text-xs text-gray-500 font-normal flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-gray-400" />
                      {bill.vendorMobile}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 md:text-right">
              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Bill Date
                </span>
                <div className="text-sm font-medium text-gray-800 flex md:justify-end items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>{bill.billDate}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Due Date
                </span>
                <div className="text-sm font-medium text-gray-800 flex md:justify-end items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />
                  <span>{bill.dueDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Line Items</h3>
              <span className="text-xs text-gray-500">{bill.items?.length || 0} items</span>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3 text-right">Quantity</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bill.items && bill.items.length > 0 ? (
                    bill.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-900">{item.productName}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-600">${Number(item.unitPrice).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          ${Number(item.total).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-xs">
                        No line items recorded
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Calculation */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 pt-2">
            <div className="text-xs text-gray-500 max-w-sm">
              {bill.notes && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="font-semibold text-gray-700 mb-1">Notes & Reference:</p>
                  <p className="whitespace-pre-line">{bill.notes}</p>
                </div>
              )}
            </div>

            <div className="w-full md:w-72 bg-gray-50 p-4 rounded-xl border border-gray-200/80 space-y-2.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal:</span>
                <span className="font-medium">${Number(bill.subtotal).toFixed(2)}</span>
              </div>
              <div className="h-px bg-gray-200 my-1" />
              <div className="flex justify-between text-base font-bold text-gray-900">
                <span>Grand Total:</span>
                <span className="text-orange-600">${Number(bill.totalAmount).toFixed(2)}</span>
              </div>

              {bill.amountPaid !== undefined && bill.amountPaid > 0 && (
                <>
                  <div className="flex justify-between text-xs text-emerald-700">
                    <span>Amount Paid:</span>
                    <span>-${Number(bill.amountPaid).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-gray-800 pt-1 border-t border-gray-200">
                    <span>Balance Due:</span>
                    <span>${Number(bill.balanceDue ?? (bill.totalAmount - bill.amountPaid)).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-gray-400" />
            <span>Urban Furniture Accounting ERP</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors shadow-sm"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onRegisterPayment?.(bill)}
              className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Register Payment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BillDetailModal;
