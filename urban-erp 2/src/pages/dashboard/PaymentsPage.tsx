import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Wallet,
  Search,
  Filter,
  RotateCw,
  Eye,
  Printer,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Banknote,
  CheckCircle2,
  AlertCircle,
  X,
  FileSpreadsheet,
  Receipt,
  Calendar,
  User,
  DollarSign
} from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import { PaymentRecord, PaymentType, PaymentMethod, PaymentStatus } from '../../types/payment';
import { paymentService } from '../../services/paymentService';
import { useAuth } from '../../contexts/AuthContext';
import { RecordPaymentModal } from '../../components/payments/RecordPaymentModal';
import { PaymentDetailModal } from '../../components/payments/PaymentDetailModal';

export const PaymentsPage: React.FC = () => {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);

  // Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  // Preselection from query params (e.g., from InvoicesPage / BillsPage "Register Payment")
  const [initialInvoiceId, setInitialInvoiceId] = useState<string | undefined>(undefined);
  const [initialBillId, setInitialBillId] = useState<string | undefined>(undefined);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Check URL params on initial load
  useEffect(() => {
    const invId = searchParams.get('invoiceId');
    const bId = searchParams.get('billId');

    if (invId) {
      setInitialInvoiceId(invId);
      setIsRecordModalOpen(true);
    } else if (bId) {
      setInitialBillId(bId);
      setIsRecordModalOpen(true);
    }
  }, [searchParams]);

  // Fetch Payments from Service
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getPayments({
        search: searchQuery,
        paymentType: selectedType,
        paymentMethod: selectedMethod,
        status: selectedStatus,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      // Role authorization check: CONTACT sees only their own payments
      const authorized = paymentService.filterForRole(data, profile);
      setPayments(authorized);
    } catch (err: any) {
      console.warn('Notice while loading payments:', err?.message || err);
      showToast(err?.message || 'Failed to fetch payments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [profile, selectedType, selectedMethod, selectedStatus, startDate, endDate]);

  // In-memory filter for typing searches
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        p.paymentReference.toLowerCase().includes(q) ||
        p.partyName.toLowerCase().includes(q) ||
        (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(q)) ||
        (p.billNumber && p.billNumber.toLowerCase().includes(q));

      const matchesType = selectedType === 'ALL' || p.paymentType === selectedType;
      const matchesMethod = selectedMethod === 'ALL' || p.paymentMethod === selectedMethod;
      const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
      const matchesStart = !startDate || p.paymentDate >= startDate;
      const matchesEnd = !endDate || p.paymentDate <= endDate;

      return matchesSearch && matchesType && matchesMethod && matchesStatus && matchesStart && matchesEnd;
    });
  }, [payments, searchQuery, selectedType, selectedMethod, selectedStatus, startDate, endDate]);

  // Metrics summary
  const metrics = useMemo(() => {
    const totalCount = filteredPayments.length;
    const completedPayments = filteredPayments.filter((p) => p.status === 'COMPLETED');

    const totalReceipts = completedPayments
      .filter((p) => p.paymentType === 'CUSTOMER_RECEIPT')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const totalDisbursals = completedPayments
      .filter((p) => p.paymentType === 'VENDOR_PAYMENT')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const completedCount = completedPayments.length;

    return { totalCount, totalReceipts, totalDisbursals, completedCount };
  }, [filteredPayments]);

  const resetFilters = () => {
    setSelectedType('ALL');
    setSelectedMethod('ALL');
    setSelectedStatus('ALL');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const handleOpenRecord = () => {
    setInitialInvoiceId(undefined);
    setInitialBillId(undefined);
    setIsRecordModalOpen(true);
  };

  const handleCloseRecord = () => {
    setIsRecordModalOpen(false);
    // Clear URL params if present
    if (searchParams.get('invoiceId') || searchParams.get('billId')) {
      setSearchParams({});
    }
  };

  const handleRecordSuccess = (msg: string) => {
    showToast(msg, 'success');
    fetchPayments();
  };

  const handleViewPayment = (p: PaymentRecord) => {
    setSelectedPayment(p);
    setIsDetailModalOpen(true);
  };

  const handlePaymentCancelled = (cancelled: PaymentRecord) => {
    showToast(`Payment ${cancelled.paymentReference} marked as CANCELLED. Balance restored.`, 'info');
    fetchPayments();
  };

  const handlePrintReceipt = (p: PaymentRecord) => {
    setSelectedPayment(p);
    setIsDetailModalOpen(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const getTypeBadge = (type: PaymentType) => {
    if (type === 'CUSTOMER_RECEIPT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
          CUSTOMER RECEIPT
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
        <ArrowUpRight className="w-3 h-3 text-orange-600" />
        VENDOR PAYMENT
      </span>
    );
  };

  const getMethodBadge = (method: PaymentMethod) => {
    if (method === 'BANK') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700">
          <Building2 className="w-3.5 h-3.5 text-blue-500" />
          BANK
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700">
        <Banknote className="w-3.5 h-3.5 text-emerald-500" />
        CASH
      </span>
    );
  };

  const getStatusBadge = (status: PaymentStatus) => {
    if (status === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          COMPLETED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertCircle className="w-3 h-3 text-rose-500" />
        CANCELLED
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
                  <Wallet className="w-7 h-7 text-[#6D54B5]" />
                  Payments
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Track customer receipts and vendor payments.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchPayments()}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 bg-white shadow-xs"
                  title="Refresh Payments"
                >
                  <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#6D54B5]' : ''}`} />
                </button>

                <button
                  onClick={handleOpenRecord}
                  className="px-4 py-2 bg-[#6D54B5] hover:bg-[#5B4599] text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Record Payment</span>
                </button>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Payments</span>
                  <span className="text-2xl font-bold text-gray-900 mt-1 block">{metrics.totalCount}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D54B5] flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Customer Receipts</span>
                  <span className="text-2xl font-bold text-emerald-600 mt-1 block">
                    ₹{metrics.totalReceipts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Vendor Payments</span>
                  <span className="text-2xl font-bold text-orange-600 mt-1 block">
                    ₹{metrics.totalDisbursals.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Completed</span>
                  <span className="text-2xl font-bold text-blue-600 mt-1 block">{metrics.completedCount}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Action Bar: Search & Filter */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200/70 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by reference, party, invoice or bill #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#6D54B5] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border flex items-center gap-2 transition-all ${
                    showFilterMenu || selectedType !== 'ALL' || selectedMethod !== 'ALL' || selectedStatus !== 'ALL' || startDate || endDate
                      ? 'bg-purple-500/10 text-[#6D54B5] border-[#6D54B5]/30'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter</span>
                  {(selectedType !== 'ALL' || selectedMethod !== 'ALL' || selectedStatus !== 'ALL' || startDate || endDate) && (
                    <span className="w-2 h-2 rounded-full bg-[#6D54B5]" />
                  )}
                </button>
              </div>
            </div>

            {/* Filter Expansion Tray */}
            {showFilterMenu && (
              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs animate-in fade-in duration-200 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-[#6D54B5]" />
                    Filter Payments
                  </h3>
                  <button
                    onClick={resetFilters}
                    className="text-xs text-[#6D54B5] hover:underline font-semibold"
                  >
                    Reset All Filters
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Payment Type */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">Payment Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full text-xs bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    >
                      <option value="ALL">All Types</option>
                      <option value="CUSTOMER_RECEIPT">CUSTOMER RECEIPT</option>
                      <option value="VENDOR_PAYMENT">VENDOR PAYMENT</option>
                    </select>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">Payment Method</label>
                    <select
                      value={selectedMethod}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="w-full text-xs bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    >
                      <option value="ALL">All Methods</option>
                      <option value="BANK">BANK</option>
                      <option value="CASH">CASH</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full text-xs bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">Date Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="text-xs bg-gray-50/80 border border-gray-200 rounded-xl px-2 py-1.5 text-gray-700"
                        title="Start Date"
                      />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="text-xs bg-gray-50/80 border border-gray-200 rounded-xl px-2 py-1.5 text-gray-700"
                        title="End Date"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Toast Notification */}
            {toastMessage && (
              <div
                className={`p-4 rounded-xl border flex items-center justify-between text-sm shadow-xs transition-all ${
                  toastMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : toastMessage.type === 'info'
                    ? 'bg-purple-50 border-purple-200 text-[#6D54B5]'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {toastMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : toastMessage.type === 'info' ? (
                    <Wallet className="w-4 h-4 text-[#6D54B5] shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span className="font-medium text-xs">{toastMessage.message}</span>
                </div>
                <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Payment Table */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Payment Reference</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Party</th>
                      <th className="px-6 py-4">Invoice / Bill</th>
                      <th className="px-6 py-4">Payment Method</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                          <RotateCw className="w-6 h-6 animate-spin mx-auto text-[#6D54B5] mb-2" />
                          <span className="text-sm">Loading payments from backend...</span>
                        </td>
                      </tr>
                    ) : filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                          <Wallet className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                          <p className="text-base font-semibold text-gray-800">No payment records found</p>
                          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                            Register payments against customer invoices or vendor bills to keep account balances updated.
                          </p>
                          <button
                            onClick={handleOpenRecord}
                            className="mt-4 px-4 py-2 bg-[#6D54B5] hover:bg-[#5B4599] text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Record First Payment</span>
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50/60 transition-colors group">
                          {/* Payment Reference */}
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900 group-hover:text-[#6D54B5] transition-colors flex items-center gap-1.5 text-xs">
                              <span>{payment.paymentReference}</span>
                            </div>
                            {payment.referenceNotes && (
                              <span className="text-[11px] text-gray-400 truncate max-w-xs block font-normal">
                                {payment.referenceNotes}
                              </span>
                            )}
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4 text-gray-600 text-xs">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>{payment.paymentDate}</span>
                            </div>
                          </td>

                          {/* Type */}
                          <td className="px-6 py-4">
                            {getTypeBadge(payment.paymentType)}
                          </td>

                          {/* Party */}
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900 flex items-center gap-1.5 text-xs">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              <span>{payment.partyName}</span>
                            </div>
                            {payment.partyEmail && (
                              <span className="text-[11px] text-gray-400 block">
                                {payment.partyEmail}
                              </span>
                            )}
                          </td>

                          {/* Invoice / Bill */}
                          <td className="px-6 py-4 text-xs">
                            {payment.paymentType === 'CUSTOMER_RECEIPT' ? (
                              <div className="flex items-center gap-1 text-gray-700 font-medium">
                                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{payment.invoiceNumber || `Invoice #${payment.invoiceId}`}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-gray-700 font-medium">
                                <Receipt className="w-3.5 h-3.5 text-orange-600" />
                                <span>{payment.billNumber || `Bill #${payment.billId}`}</span>
                              </div>
                            )}
                          </td>

                          {/* Payment Method */}
                          <td className="px-6 py-4">
                            {getMethodBadge(payment.paymentMethod)}
                          </td>

                          {/* Amount */}
                          <td className="px-6 py-4 text-right">
                            <span className={`font-bold text-xs ${
                              payment.status === 'CANCELLED' ? 'text-gray-400 line-through' : 'text-gray-900'
                            }`}>
                              ₹{Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 text-center">
                            {getStatusBadge(payment.status)}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Voucher Details */}
                              <button
                                onClick={() => handleViewPayment(payment)}
                                className="p-1.5 text-gray-500 hover:text-[#6D54B5] hover:bg-purple-50 rounded-lg transition-colors"
                                title="View Payment Voucher"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Print Receipt */}
                              <button
                                onClick={() => handlePrintReceipt(payment)}
                                className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Print Receipt"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordModalOpen}
        onClose={handleCloseRecord}
        onSuccess={handleRecordSuccess}
        initialInvoiceId={initialInvoiceId}
        initialBillId={initialBillId}
      />

      {/* Payment Detail Modal */}
      <PaymentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        payment={selectedPayment}
        onPaymentCancelled={handlePaymentCancelled}
      />
    </div>
  );
};
export default PaymentsPage;
