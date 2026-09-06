import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Receipt,
  Search,
  Filter,
  RotateCw,
  Eye,
  Printer,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Truck,
  Calendar,
  DollarSign
} from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import { VendorBill, BillStatus, PaymentStatus } from '../../types/bill';
import { Contact } from '../../types/contact';
import { billService } from '../../services/billService';
import { contactService } from '../../services/contactService';
import { useAuth } from '../../contexts/AuthContext';
import { BillDetailModal } from '../../components/bills/BillDetailModal';

export const BillsPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [bills, setBills] = useState<VendorBill[]>([]);
  const [vendors, setVendors] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('ALL');
  const [selectedVendor, setSelectedVendor] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);

  // Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedBill, setSelectedBill] = useState<VendorBill | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Fetch Bills
  const fetchBills = async () => {
    setLoading(true);
    try {
      const data = await billService.getBills({
        search: searchQuery,
        status: selectedStatus,
        paymentStatus: selectedPaymentStatus,
        vendorId: selectedVendor,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      // Role check: If Contact, restrict to own bills only
      const authorizedBills = billService.filterForRole(data, profile);
      setBills(authorizedBills);
    } catch (err: any) {
      console.warn('Notice while fetching vendor bills:', err?.message || err);
      showToast(err?.message || 'Failed to fetch vendor bills.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Vendors for Filter dropdown
  const fetchVendors = async () => {
    try {
      const allContacts = await contactService.getContacts();
      const vendorContacts = allContacts.filter(c => c.type === 'VENDOR' || c.type === 'BOTH');
      setVendors(vendorContacts);
    } catch (e) {
      console.warn('Failed to load contacts for vendor filter:', e);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [profile, selectedStatus, selectedPaymentStatus, selectedVendor, startDate, endDate]);

  useEffect(() => {
    fetchVendors();
  }, []);

  // Filtered bills in-memory for instant typing search
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const matchesSearch = !searchQuery || 
        b.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.purchaseOrderNumber && b.purchaseOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = selectedStatus === 'ALL' || b.status === selectedStatus;
      const matchesPayment = selectedPaymentStatus === 'ALL' || b.paymentStatus === selectedPaymentStatus;
      const matchesVendor = selectedVendor === 'ALL' || String(b.vendorId) === String(selectedVendor);

      const matchesStart = !startDate || b.billDate >= startDate;
      const matchesEnd = !endDate || b.billDate <= endDate;

      return matchesSearch && matchesStatus && matchesPayment && matchesVendor && matchesStart && matchesEnd;
    });
  }, [bills, searchQuery, selectedStatus, selectedPaymentStatus, selectedVendor, startDate, endDate]);

  // Metrics calculation
  const metrics = useMemo(() => {
    const totalCount = filteredBills.length;
    const unpaidCount = filteredBills.filter(b => b.paymentStatus === 'UNPAID').length;
    const paidCount = filteredBills.filter(b => b.paymentStatus === 'PAID').length;
    const totalPayables = filteredBills
      .filter(b => b.status !== 'CANCELLED')
      .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

    return { totalCount, unpaidCount, paidCount, totalPayables };
  }, [filteredBills]);

  const handleViewBill = (b: VendorBill) => {
    setSelectedBill(b);
    setIsDetailModalOpen(true);
  };

  const handleDownloadBill = (b: VendorBill) => {
    setSelectedBill(b);
    setIsDetailModalOpen(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleRegisterPayment = (b: VendorBill) => {
    showToast(`Payment registration for Bill ${b.billNumber} ($${Number(b.totalAmount).toFixed(2)}) initiated. Ready for Payments module.`, 'info');
    // Prepare navigation for next Payment step
    navigate(`/payments?billId=${b.id}&amount=${b.totalAmount}`);
  };

  const getStatusBadge = (status: BillStatus) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            <Clock className="w-3 h-3 text-gray-500" />
            DRAFT
          </span>
        );
      case 'POSTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-500" />
            POSTED
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            PAID
          </span>
        );
      case 'PARTIALLY_PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            PARTIALLY_PAID
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-500" />
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (paymentStatus: PaymentStatus) => {
    switch (paymentStatus) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            PAID
          </span>
        );
      case 'PARTIALLY_PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            PARTIALLY_PAID
          </span>
        );
      case 'UNPAID':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            UNPAID
          </span>
        );
    }
  };

  const resetFilters = () => {
    setSelectedStatus('ALL');
    setSelectedPaymentStatus('ALL');
    setSelectedVendor('ALL');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
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
                  <Receipt className="w-7 h-7 text-orange-600" />
                  Vendor Bills
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage bills generated from purchase orders.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchBills()}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 bg-white shadow-sm"
                  title="Refresh Bills"
                >
                  <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-600' : ''}`} />
                </button>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Bills</span>
                  <span className="text-2xl font-bold text-gray-900 mt-1 block">{metrics.totalCount}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Unpaid Bills</span>
                  <span className="text-2xl font-bold text-rose-600 mt-1 block">{metrics.unpaidCount}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Paid Bills</span>
                  <span className="text-2xl font-bold text-emerald-600 mt-1 block">{metrics.paidCount}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Payables</span>
                  <span className="text-2xl font-bold text-orange-600 mt-1 block">
                    ${metrics.totalPayables.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Action Bar: Search & Filter */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200/70 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by bill number or vendor name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
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
                    showFilterMenu || selectedStatus !== 'ALL' || selectedPaymentStatus !== 'ALL' || selectedVendor !== 'ALL' || startDate || endDate
                      ? 'bg-orange-500/10 text-orange-600 border-orange-500/30'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters</span>
                  {(selectedStatus !== 'ALL' || selectedPaymentStatus !== 'ALL' || selectedVendor !== 'ALL' || startDate || endDate) && (
                    <span className="w-2 h-2 rounded-full bg-orange-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Filter Expansion Tray */}
            {showFilterMenu && (
              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm animate-in fade-in duration-200 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-orange-600" />
                    Filter Vendor Bills
                  </h3>
                  <button
                    onClick={resetFilters}
                    className="text-xs text-orange-600 hover:underline font-semibold"
                  >
                    Reset All Filters
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Vendor Filter */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">Vendor</label>
                    <select
                      value={selectedVendor}
                      onChange={(e) => setSelectedVendor(e.target.value)}
                      className="w-full text-xs bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                      <option value="ALL">All Vendors</option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">Bill Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full text-xs bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="POSTED">POSTED</option>
                      <option value="PAID">PAID</option>
                      <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  {/* Payment Status Filter */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">Payment Status</label>
                    <select
                      value={selectedPaymentStatus}
                      onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                      className="w-full text-xs bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                      <option value="ALL">All Payments</option>
                      <option value="UNPAID">UNPAID</option>
                      <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
                      <option value="PAID">PAID</option>
                    </select>
                  </div>

                  {/* Date Range Filters */}
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
                className={`p-4 rounded-xl border flex items-center justify-between text-sm shadow-sm transition-all ${
                  toastMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : toastMessage.type === 'info'
                    ? 'bg-orange-50 border-orange-200 text-orange-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {toastMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : toastMessage.type === 'info' ? (
                    <CreditCard className="w-4 h-4 text-orange-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span className="font-medium">{toastMessage.message}</span>
                </div>
                <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Bills Table */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Bill Number</th>
                      <th className="px-6 py-4">Vendor</th>
                      <th className="px-6 py-4">Bill Date</th>
                      <th className="px-6 py-4">Due Date</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-center">Payment Status</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                          <RotateCw className="w-6 h-6 animate-spin mx-auto text-orange-600 mb-2" />
                          <span className="text-sm">Loading vendor bills from database...</span>
                        </td>
                      </tr>
                    ) : filteredBills.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                          <Receipt className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                          <p className="text-base font-semibold text-gray-800">No vendor bills found</p>
                          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                            Vendor bills are generated when purchase orders are confirmed and converted to bills.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredBills.map((bill) => (
                        <tr key={bill.id} className="hover:bg-gray-50/60 transition-colors group">
                          {/* Bill Number */}
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors flex items-center gap-1.5">
                              <span>{bill.billNumber}</span>
                            </div>
                            {bill.purchaseOrderNumber && (
                              <span className="text-[11px] text-gray-400 block font-normal">
                                From {bill.purchaseOrderNumber}
                              </span>
                            )}
                          </td>

                          {/* Vendor */}
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900 flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-gray-400" />
                              <span>{bill.vendorName}</span>
                            </div>
                            {bill.vendorEmail && (
                              <span className="text-[11px] text-gray-400 block">
                                {bill.vendorEmail}
                              </span>
                            )}
                          </td>

                          {/* Bill Date */}
                          <td className="px-6 py-4 text-gray-600 text-xs">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>{bill.billDate}</span>
                            </div>
                          </td>

                          {/* Due Date */}
                          <td className="px-6 py-4 text-gray-600 text-xs">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-orange-500" />
                              <span>{bill.dueDate}</span>
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-gray-900">
                              ${Number(bill.totalAmount).toFixed(2)}
                            </span>
                          </td>

                          {/* Payment Status */}
                          <td className="px-6 py-4 text-center">
                            {getPaymentStatusBadge(bill.paymentStatus)}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 text-center">
                            {getStatusBadge(bill.status)}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Action */}
                              <button
                                onClick={() => handleViewBill(bill)}
                                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                title="View Vendor Bill"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Download Action */}
                              <button
                                onClick={() => handleDownloadBill(bill)}
                                className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Download / Print Bill"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              {/* Register Payment Action */}
                              <button
                                onClick={() => handleRegisterPayment(bill)}
                                className="px-2.5 py-1 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs flex items-center gap-1"
                                title="Register Payment"
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>Register Payment</span>
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

      {/* Bill Detail Modal */}
      <BillDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        bill={selectedBill}
        onRegisterPayment={handleRegisterPayment}
      />
    </div>
  );
};
export default BillsPage;
