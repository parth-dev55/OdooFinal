import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  Calendar, 
  FileSpreadsheet, 
  Receipt, 
  CreditCard, 
  Banknote, 
  Building2,
  AlertCircle,
  RotateCw
} from 'lucide-react';
import { PaymentRecord, PaymentStatus } from '../../types/payment';
import { paymentService } from '../../services/paymentService';
import { useAuth } from '../../contexts/AuthContext';

interface PaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentRecord | null;
  onPaymentCancelled?: (cancelledPayment: PaymentRecord) => void;
}

export const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  isOpen,
  onClose,
  payment,
  onPaymentCancelled
}) => {
  const { profile } = useAuth();
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  if (!isOpen || !payment) return null;

  const isCustomerReceipt = payment.paymentType === 'CUSTOMER_RECEIPT';
  const canCancel = (profile?.role === 'ADMIN' || profile?.role === 'ACCOUNTANT') && payment.status === 'COMPLETED';

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      const updated = await paymentService.cancelPayment(payment.id);
      if (onPaymentCancelled) {
        onPaymentCancelled(updated);
      }
      setShowCancelConfirm(false);
      onClose();
    } catch (err: any) {
      setCancelError(err?.message || 'Failed to cancel payment.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${
              isCustomerReceipt ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
            }`}>
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">{payment.paymentReference}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  payment.status === 'COMPLETED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {payment.status}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {isCustomerReceipt ? 'Customer Receipt Voucher' : 'Vendor Payment Voucher'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 print:p-0">
          {/* Cancel Error */}
          {cancelError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{cancelError}</span>
            </div>
          )}

          {/* Cancel Confirmation Prompt */}
          {showCancelConfirm && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">Cancel Payment Voucher?</h4>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    This will mark the payment as <strong>CANCELLED</strong> and restore the outstanding balance on the related invoice or bill. Payment history will be preserved.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-amber-100/60 rounded-lg"
                  disabled={cancelling}
                >
                  Keep Payment
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg flex items-center gap-1 shadow-xs"
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <span>Yes, Cancel Payment</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Amount Showcase Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white text-center shadow-sm space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">
              {isCustomerReceipt ? 'Received Amount' : 'Disbursed Amount'}
            </span>
            <div className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1">
              <span>₹</span>
              <span>{Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-gray-200 mt-1">
              {payment.paymentMethod === 'BANK' ? (
                <>
                  <Building2 className="w-3 h-3 text-blue-300" />
                  <span>Settled via Bank Transfer</span>
                </>
              ) : (
                <>
                  <Banknote className="w-3 h-3 text-emerald-300" />
                  <span>Settled via Cash</span>
                </>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-4 space-y-3.5 text-xs">
            {/* Reference & Date */}
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-200/60">
              <div>
                <span className="text-[11px] text-gray-400 font-semibold uppercase block">Payment Reference</span>
                <span className="font-bold text-gray-900 mt-0.5 block">{payment.paymentReference}</span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 font-semibold uppercase block">Payment Date</span>
                <span className="font-semibold text-gray-800 mt-0.5 block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {payment.paymentDate}
                </span>
              </div>
            </div>

            {/* Type & Party */}
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-200/60">
              <div>
                <span className="text-[11px] text-gray-400 font-semibold uppercase block">Payment Type</span>
                <span className={`inline-flex items-center gap-1 font-bold mt-1 ${
                  isCustomerReceipt ? 'text-emerald-700' : 'text-orange-700'
                }`}>
                  {isCustomerReceipt ? 'CUSTOMER RECEIPT' : 'VENDOR PAYMENT'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 font-semibold uppercase block">
                  {isCustomerReceipt ? 'Customer (Party)' : 'Vendor (Party)'}
                </span>
                <span className="font-bold text-gray-900 mt-0.5 block">{payment.partyName}</span>
                {payment.partyEmail && (
                  <span className="text-[11px] text-gray-500">{payment.partyEmail}</span>
                )}
              </div>
            </div>

            {/* Related Invoice / Bill */}
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-200/60">
              <div>
                <span className="text-[11px] text-gray-400 font-semibold uppercase block">Linked Document</span>
                <span className="font-semibold text-gray-900 mt-0.5 flex items-center gap-1.5">
                  {isCustomerReceipt ? (
                    <>
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{payment.invoiceNumber || `Invoice #${payment.invoiceId}`}</span>
                    </>
                  ) : (
                    <>
                      <Receipt className="w-3.5 h-3.5 text-orange-600" />
                      <span>{payment.billNumber || `Bill #${payment.billId}`}</span>
                    </>
                  )}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 font-semibold uppercase block">Payment Method</span>
                <span className="font-semibold text-gray-800 mt-0.5 block">
                  {payment.paymentMethod}
                </span>
              </div>
            </div>

            {/* Created By & Timestamp */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-gray-400 font-semibold uppercase block">Created By</span>
                <span className="text-gray-700 font-medium mt-0.5 block">
                  {payment.createdBy || 'System'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 font-semibold uppercase block">Record Status</span>
                <span className={`inline-flex items-center gap-1 font-semibold mt-0.5 ${
                  payment.status === 'COMPLETED' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {payment.status === 'COMPLETED' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  {payment.status}
                </span>
              </div>
            </div>

            {/* Reference Notes if any */}
            {payment.referenceNotes && (
              <div className="pt-2 border-t border-gray-200/60">
                <span className="text-[11px] text-gray-400 font-semibold uppercase block">Reference / Notes</span>
                <p className="text-gray-700 mt-0.5 text-xs bg-white p-2 rounded-lg border border-gray-200/50">
                  {payment.referenceNotes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            {canCancel && !showCancelConfirm && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors border border-rose-200"
              >
                Cancel Payment
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold text-white bg-gray-900 hover:bg-black rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PaymentDetailModal;
