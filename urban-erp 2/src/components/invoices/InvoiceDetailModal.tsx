import React from 'react';
import { 
  X, 
  Printer, 
  Calendar, 
  User, 
  FileSpreadsheet, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Building2,
  Mail,
  Phone
} from 'lucide-react';
import { CustomerInvoice, InvoiceStatus, PaymentStatus } from '../../types/invoice';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: CustomerInvoice | null;
  onRegisterPayment?: (invoice: CustomerInvoice) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onRegisterPayment,
}) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: InvoiceStatus) => {
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
        id="customer-invoice-detail-modal"
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-100 my-8 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D54B5] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-gray-900">{invoice.invoiceNumber}</h2>
                {getStatusBadge(invoice.status)}
                {getPaymentStatusBadge(invoice.paymentStatus)}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {invoice.salesOrderNumber ? `Generated from ${invoice.salesOrderNumber}` : 'Customer Sales Invoice'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              title="Download / Print Invoice"
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

        {/* Invoice Printable Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Company & Customer Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl bg-gray-50/70 border border-gray-100">
            <div>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Billed To
              </span>
              <div className="flex items-start gap-2 text-gray-900 font-semibold text-base">
                <User className="w-4 h-4 text-purple-600 mt-1 shrink-0" />
                <div>
                  <p>{invoice.customerName}</p>
                  {invoice.customerEmail && (
                    <p className="text-xs text-gray-500 font-normal flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-gray-400" />
                      {invoice.customerEmail}
                    </p>
                  )}
                  {invoice.customerMobile && (
                    <p className="text-xs text-gray-500 font-normal flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-gray-400" />
                      {invoice.customerMobile}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 md:text-right">
              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Invoice Date
                </span>
                <div className="text-sm font-medium text-gray-800 flex md:justify-end items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>{invoice.invoiceDate}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Due Date
                </span>
                <div className="text-sm font-medium text-gray-800 flex md:justify-end items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />
                  <span>{invoice.dueDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Line Items</h3>
              <span className="text-xs text-gray-500">{invoice.items?.length || 0} items</span>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3 text-right">Quantity</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-right">Tax</th>
                    <th className="px-4 py-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-900">{item.productName}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-600">${Number(item.unitPrice).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {item.taxRate !== undefined ? `${item.taxRate}%` : '$' + Number(item.taxAmount || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          ${Number(item.total).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-400 text-xs">
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
              {invoice.notes && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="font-semibold text-gray-700 mb-1">Notes & Reference:</p>
                  <p className="whitespace-pre-line">{invoice.notes}</p>
                </div>
              )}
            </div>

            <div className="w-full md:w-72 bg-gray-50 p-4 rounded-xl border border-gray-200/80 space-y-2.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal:</span>
                <span className="font-medium">${Number(invoice.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax Total:</span>
                <span className="font-medium">${Number(invoice.taxAmount).toFixed(2)}</span>
              </div>
              <div className="h-px bg-gray-200 my-1" />
              <div className="flex justify-between text-base font-bold text-gray-900">
                <span>Grand Total:</span>
                <span className="text-[#6D54B5]">${Number(invoice.totalAmount).toFixed(2)}</span>
              </div>

              {invoice.amountPaid !== undefined && invoice.amountPaid > 0 && (
                <>
                  <div className="flex justify-between text-xs text-emerald-700">
                    <span>Amount Paid:</span>
                    <span>-${Number(invoice.amountPaid).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-gray-800 pt-1 border-t border-gray-200">
                    <span>Balance Due:</span>
                    <span>${Number(invoice.balanceDue ?? (invoice.totalAmount - invoice.amountPaid)).toFixed(2)}</span>
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
              onClick={() => onRegisterPayment?.(invoice)}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#6D54B5] hover:bg-[#5B459B] rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
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
export default InvoiceDetailModal;
