import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Building2, 
  User, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  Receipt,
  CreditCard,
  Banknote,
  RotateCw
} from 'lucide-react';
import { PaymentType, PaymentMethod, CreatePaymentDto, OutstandingBalanceInfo } from '../../types/payment';
import { CustomerInvoice } from '../../types/invoice';
import { VendorBill } from '../../types/bill';
import { invoiceService } from '../../services/invoiceService';
import { billService } from '../../services/billService';
import { paymentService } from '../../services/paymentService';
import { useAuth } from '../../contexts/AuthContext';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  initialInvoiceId?: string | number;
  initialBillId?: string | number;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialInvoiceId,
  initialBillId
}) => {
  const { profile } = useAuth();

  const [paymentType, setPaymentType] = useState<PaymentType>('CUSTOMER_RECEIPT');
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [bills, setBills] = useState<VendorBill[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState<boolean>(false);

  // Selected document state
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [selectedBillId, setSelectedBillId] = useState<string>('');
  const [outstandingInfo, setOutstandingInfo] = useState<OutstandingBalanceInfo | null>(null);
  const [loadingOutstanding, setLoadingOutstanding] = useState<boolean>(false);

  // Form fields
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK');
  const [amount, setAmount] = useState<string>('');
  const [referenceNotes, setReferenceNotes] = useState<string>('');

  // Submitting state & inline errors
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset or load initial documents
  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setAmount('');
      setReferenceNotes('');
      return;
    }

    if (initialBillId) {
      setPaymentType('VENDOR_PAYMENT');
      setSelectedBillId(String(initialBillId));
    } else if (initialInvoiceId) {
      setPaymentType('CUSTOMER_RECEIPT');
      setSelectedInvoiceId(String(initialInvoiceId));
    }

    loadDocuments();
  }, [isOpen, initialInvoiceId, initialBillId]);

  // Load Invoices and Bills from real services
  const loadDocuments = async () => {
    setLoadingDocuments(true);
    try {
      const [invList, billList] = await Promise.all([
        invoiceService.getInvoices(),
        billService.getBills()
      ]);
      
      // Filter out cancelled documents
      const activeInvoices = invoiceService.filterForRole(invList.filter(i => i.status !== 'CANCELLED'), profile);
      const activeBills = billService.filterForRole(billList.filter(b => b.status !== 'CANCELLED'), profile);

      setInvoices(activeInvoices);
      setBills(activeBills);
    } catch (err: any) {
      console.warn('Error loading invoices/bills for payment modal:', err);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Whenever document selection changes, fetch outstanding balance and auto-populate party
  useEffect(() => {
    const fetchBalance = async () => {
      setErrors((prev) => ({ ...prev, document: '', amount: '' }));
      if (paymentType === 'CUSTOMER_RECEIPT' && selectedInvoiceId) {
        setLoadingOutstanding(true);
        try {
          const info = await paymentService.getInvoiceOutstanding(selectedInvoiceId);
          setOutstandingInfo(info);
          if (info.outstandingAmount > 0) {
            setAmount(String(info.outstandingAmount));
          } else {
            setAmount('0');
          }
        } catch (err: any) {
          console.warn('Error fetching invoice balance:', err);
        } finally {
          setLoadingOutstanding(false);
        }
      } else if (paymentType === 'VENDOR_PAYMENT' && selectedBillId) {
        setLoadingOutstanding(true);
        try {
          const info = await paymentService.getBillOutstanding(selectedBillId);
          setOutstandingInfo(info);
          if (info.outstandingAmount > 0) {
            setAmount(String(info.outstandingAmount));
          } else {
            setAmount('0');
          }
        } catch (err: any) {
          console.warn('Error fetching bill balance:', err);
        } finally {
          setLoadingOutstanding(false);
        }
      } else {
        setOutstandingInfo(null);
        setAmount('');
      }
    };

    fetchBalance();
  }, [paymentType, selectedInvoiceId, selectedBillId]);

  // Handle Payment Type switch
  const handleTypeChange = (type: PaymentType) => {
    setPaymentType(type);
    setSelectedInvoiceId('');
    setSelectedBillId('');
    setOutstandingInfo(null);
    setAmount('');
    setErrors({});
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (paymentType === 'CUSTOMER_RECEIPT' && !selectedInvoiceId) {
      newErrors.document = 'Please select a customer invoice.';
    } else if (paymentType === 'VENDOR_PAYMENT' && !selectedBillId) {
      newErrors.document = 'Please select a vendor bill.';
    }

    if (!paymentDate) {
      newErrors.paymentDate = 'Payment date is required.';
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Amount must be greater than 0.';
    } else if (outstandingInfo && numAmount > outstandingInfo.outstandingAmount + 0.001) {
      newErrors.amount = `Amount cannot exceed outstanding balance of ₹${outstandingInfo.outstandingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;
    }

    if (outstandingInfo && outstandingInfo.outstandingAmount <= 0) {
      newErrors.amount = 'This document is already fully paid.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!outstandingInfo) return;

    setSubmitting(true);
    try {
      const dto: CreatePaymentDto = {
        paymentType,
        invoiceId: paymentType === 'CUSTOMER_RECEIPT' ? selectedInvoiceId : undefined,
        billId: paymentType === 'VENDOR_PAYMENT' ? selectedBillId : undefined,
        partyId: outstandingInfo.partyId,
        partyName: outstandingInfo.partyName,
        paymentDate,
        paymentMethod,
        amount: parseFloat(amount),
        referenceNotes: referenceNotes.trim() || undefined,
      };

      const result = await paymentService.createPayment(dto, profile);
      const targetDoc = paymentType === 'CUSTOMER_RECEIPT' ? `Invoice ${outstandingInfo.number}` : `Bill ${outstandingInfo.number}`;
      onSuccess(`Payment ${result.paymentReference} for ${targetDoc} (₹${result.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}) successfully recorded.`);
      onClose();
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        form: err?.message || 'Failed to record payment. Please check inputs and try again.'
      }));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50/80 to-white">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${
              paymentType === 'CUSTOMER_RECEIPT' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
            }`}>
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Record Payment</h2>
              <p className="text-xs text-gray-500">Register customer receipts or vendor disbursements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Top Form Error */}
          {errors.form && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Payment Type Toggle */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-2">
              Payment Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('CUSTOMER_RECEIPT')}
                className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all ${
                  paymentType === 'CUSTOMER_RECEIPT'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs ring-2 ring-emerald-500/20'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                <span>Customer Receipt</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('VENDOR_PAYMENT')}
                className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all ${
                  paymentType === 'VENDOR_PAYMENT'
                    ? 'bg-orange-50 text-orange-700 border-orange-300 shadow-xs ring-2 ring-orange-500/20'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-orange-600" />
                <span>Vendor Payment</span>
              </button>
            </div>
          </div>

          {/* Document Selection (Customer Invoice / Vendor Bill) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700">
                {paymentType === 'CUSTOMER_RECEIPT' ? 'Customer Invoice' : 'Vendor Bill'} <span className="text-rose-500">*</span>
              </label>
              {loadingDocuments && (
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <RotateCw className="w-3 h-3 animate-spin" /> Loading...
                </span>
              )}
            </div>

            {paymentType === 'CUSTOMER_RECEIPT' ? (
              <select
                value={selectedInvoiceId}
                onChange={(e) => setSelectedInvoiceId(e.target.value)}
                className={`w-full text-xs bg-gray-50/70 border rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                  errors.document ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200'
                }`}
              >
                <option value="">-- Select Customer Invoice --</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} - {inv.customerName} (Total: ₹{Number(inv.totalAmount).toFixed(2)} | Status: {inv.paymentStatus})
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={selectedBillId}
                onChange={(e) => setSelectedBillId(e.target.value)}
                className={`w-full text-xs bg-gray-50/70 border rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all ${
                  errors.document ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200'
                }`}
              >
                <option value="">-- Select Vendor Bill --</option>
                {bills.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.billNumber} - {b.vendorName} (Total: ₹{Number(b.totalAmount).toFixed(2)} | Status: {b.paymentStatus})
                  </option>
                ))}
              </select>
            )}

            {errors.document && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.document}
              </p>
            )}
          </div>

          {/* Party Information Display (Read-Only) */}
          {outstandingInfo && (
            <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200/70 space-y-1.5 animate-in fade-in duration-150">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                {paymentType === 'CUSTOMER_RECEIPT' ? 'Customer (Party)' : 'Vendor (Party)'}
              </span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 font-semibold text-xs shadow-2xs">
                    {outstandingInfo.partyName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">{outstandingInfo.partyName}</span>
                    {outstandingInfo.partyEmail && (
                      <span className="text-[11px] text-gray-500">{outstandingInfo.partyEmail}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {outstandingInfo.number}
                </span>
              </div>
            </div>
          )}

          {/* Outstanding Balance Breakdown Card */}
          {loadingOutstanding ? (
            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-200/60 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
              <RotateCw className="w-4 h-4 animate-spin text-orange-600" />
              <span>Fetching outstanding balance details...</span>
            </div>
          ) : outstandingInfo ? (
            <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-gray-500" />
                  Balance Breakdown
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  outstandingInfo.outstandingAmount <= 0
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {outstandingInfo.paymentStatus}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 bg-white rounded-lg border border-gray-100">
                  <span className="text-[10px] uppercase font-semibold text-gray-400 block">Total Amount</span>
                  <span className="text-xs font-bold text-gray-900 mt-0.5 block">
                    ₹{outstandingInfo.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-2 bg-white rounded-lg border border-gray-100">
                  <span className="text-[10px] uppercase font-semibold text-gray-400 block">Already Paid</span>
                  <span className="text-xs font-bold text-emerald-600 mt-0.5 block">
                    ₹{outstandingInfo.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-2 bg-amber-50/50 rounded-lg border border-amber-200/60">
                  <span className="text-[10px] uppercase font-semibold text-amber-700 block">Outstanding</span>
                  <span className="text-xs font-bold text-amber-800 mt-0.5 block">
                    ₹{outstandingInfo.outstandingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Payment Date & Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Payment Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className={`w-full text-xs bg-gray-50/70 border rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                    errors.paymentDate ? 'border-rose-300' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.paymentDate && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.paymentDate}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Payment Method <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('BANK')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'BANK'
                      ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500/20'
                      : 'bg-gray-50/70 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Bank</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'CASH'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-gray-50/70 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cash</span>
                </button>
              </div>
            </div>
          </div>

          {/* Amount Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Amount (₹) <span className="text-rose-500">*</span>
              </label>
              {outstandingInfo && outstandingInfo.outstandingAmount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setAmount(String(outstandingInfo.outstandingAmount));
                    setErrors((prev) => ({ ...prev, amount: '' }));
                  }}
                  className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Fill Outstanding (₹{outstandingInfo.outstandingAmount.toFixed(2)})
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={outstandingInfo ? outstandingInfo.outstandingAmount : undefined}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrors((prev) => ({ ...prev, amount: '' }));
                }}
                placeholder="0.00"
                className={`w-full pl-8 pr-4 py-2.5 text-xs bg-gray-50/70 border rounded-xl text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                  errors.amount ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.amount}
              </p>
            )}
          </div>

          {/* Reference / Notes */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Reference / Notes <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={referenceNotes}
              onChange={(e) => setReferenceNotes(e.target.value)}
              placeholder="e.g. UTR / NEFT Ref #, Cheque No., or Cash Receipt ID"
              className="w-full text-xs bg-gray-50/70 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 ${
              paymentType === 'CUSTOMER_RECEIPT'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-orange-600 hover:bg-orange-700'
            } disabled:opacity-50`}
          >
            {submitting ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Recording Payment...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm & Record Payment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default RecordPaymentModal;
