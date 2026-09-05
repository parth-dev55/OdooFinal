import { useState, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Topbar from '../../components/dashboard/Topbar';
import Sidebar from '../../components/dashboard/Sidebar';
import { 
  Receipt, 
  FileSpreadsheet, 
  Wallet, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  CreditCard,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  X,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ContactDashboard() {
  const { profile } = useAuth();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState('INV-2026-0091');
  const [paymentAmount, setPaymentAmount] = useState('2850.00');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [paymentSuccessToast, setPaymentSuccessToast] = useState(false);

  // Contact specific KPIs
  const kpis = [
    { 
      title: 'Outstanding Invoices', 
      value: '$2,850.00', 
      count: '2 Unpaid Invoices',
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50',
      badge: 'Due in 14 days'
    },
    { 
      title: 'Outstanding Bills', 
      value: '$1,200.00', 
      count: '1 Pending Bill',
      icon: <Receipt className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-50',
      badge: 'Vendor Balance'
    },
    { 
      title: 'Total Payments Made', 
      value: '$18,400.00', 
      count: '6 Settled Transactions',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50',
      badge: 'Lifetime Cleared'
    },
  ];

  // Isolated Demo Data (Specific to current contact's account)
  const mockInvoices = [
    { id: '1', date: '2026-09-01', dueDate: '2026-09-15', reference: 'INV-2026-0091', description: 'Office Walnut Desks (x4)', amount: '$2,850.00', status: 'Unpaid' },
    { id: '2', date: '2026-08-20', dueDate: '2026-09-03', reference: 'INV-2026-0084', description: 'Ergonomic Mesh Chairs (x8)', amount: '$4,600.00', status: 'Paid' },
    { id: '3', date: '2026-08-05', dueDate: '2026-08-19', reference: 'INV-2026-0078', description: 'Conference Table Setup', amount: '$6,200.00', status: 'Paid' },
  ];

  const mockBills = [
    { id: '1', date: '2026-08-28', dueDate: '2026-09-12', reference: 'BILL-2026-0032', description: 'Assembly & Installation Service', amount: '$1,200.00', status: 'Pending' },
    { id: '2', date: '2026-08-10', dueDate: '2026-08-24', reference: 'BILL-2026-0028', description: 'Freight & Delivery', amount: '$450.00', status: 'Paid' },
  ];

  const mockPayments = [
    { id: '1', date: '2026-08-22', reference: 'PAY-2026-0067', invoiceRef: 'INV-2026-0084', method: 'Credit Card (•••• 4242)', amount: '$4,600.00', status: 'Completed' },
    { id: '2', date: '2026-08-12', reference: 'PAY-2026-0059', invoiceRef: 'INV-2026-0078', method: 'Bank Transfer', amount: '$6,200.00', status: 'Completed' },
    { id: '3', date: '2026-07-28', reference: 'PAY-2026-0045', invoiceRef: 'INV-2026-0062', method: 'Bank Transfer', amount: '$7,600.00', status: 'Completed' },
  ];

  const handleMakePayment = (e: FormEvent) => {
    e.preventDefault();
    setIsPaymentModalOpen(false);
    setPaymentSuccessToast(true);
    setTimeout(() => setPaymentSuccessToast(false), 5000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid': 
      case 'Completed': 
        return <span className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"><CheckCircle2 className="w-3 h-3" /> {status}</span>;
      case 'Pending': 
      case 'Unpaid': 
        return <span className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"><Clock className="w-3 h-3" /> {status}</span>;
      case 'Overdue': 
        return <span className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10"><AlertCircle className="w-3 h-3" /> Overdue</span>;
      default: 
        return <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20">{status}</span>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50/50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Toast Notification */}
            {paymentSuccessToast && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Payment successfully registered!</p>
                    <p className="text-xs text-emerald-700 mt-0.5">Reference #{selectedInvoice} has been processed via demo gateway.</p>
                  </div>
                </div>
                <button onClick={() => setPaymentSuccessToast(false)} className="text-emerald-600 hover:text-emerald-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome, {profile?.name || 'Customer'}</h1>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                    Contact Portal
                  </span>
                </div>
                <p className="text-gray-500 mt-2">Manage your personal invoices, bills, and payment records.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-2 bg-white border border-gray-200 hover:border-[#6D54B5]/40 text-gray-700 px-5 py-3 rounded-xl font-medium transition-all shadow-sm text-sm"
                >
                  <User className="w-4 h-4 text-[#6D54B5]" />
                  My Profile
                </button>
                <button 
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="flex items-center gap-2 bg-[#6D54B5] hover:bg-[#5a4596] text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm text-sm"
                >
                  <Wallet className="w-4 h-4" />
                  Make Payment
                </button>
              </div>
            </div>

            {/* Contact Portal KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {kpis.map((kpi, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-500 text-sm font-medium">{kpi.title}</span>
                    <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                      {kpi.icon}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 tracking-tight">{kpi.value}</div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 text-xs">
                    <span className="text-gray-500">{kpi.count}</span>
                    <span className="font-medium text-gray-700">{kpi.badge}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Navigation Pills */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Portal Navigation:</span>
                <span>Access your personal ledger records</span>
              </div>
              <div className="flex items-center gap-2">
                <Link 
                  to="/contact/invoices" 
                  className="px-4 py-2 bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-[#6D54B5] rounded-xl text-xs font-semibold border border-gray-100 transition-colors flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  All Invoices
                </Link>
                <Link 
                  to="/contact/bills" 
                  className="px-4 py-2 bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-[#6D54B5] rounded-xl text-xs font-semibold border border-gray-100 transition-colors flex items-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  All Bills
                </Link>
                <Link 
                  to="/contact/payments" 
                  className="px-4 py-2 bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-[#6D54B5] rounded-xl text-xs font-semibold border border-gray-100 transition-colors flex items-center gap-1.5"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  Payment History
                </Link>
              </div>
            </div>

            {/* Section 1: Recent Invoices */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Recent Invoices</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Billing statements issued to your account</p>
                </div>
                <Link to="/contact/invoices" className="text-[#6D54B5] text-sm font-semibold hover:text-purple-700 flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 bg-gray-50/50 uppercase border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-medium">Invoice Reference</th>
                      <th className="px-6 py-4 font-medium">Description</th>
                      <th className="px-6 py-4 font-medium">Issue Date</th>
                      <th className="px-6 py-4 font-medium">Due Date</th>
                      <th className="px-6 py-4 font-medium text-right">Amount</th>
                      <th className="px-6 py-4 font-medium text-center">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{inv.reference}</td>
                        <td className="px-6 py-4 text-gray-600">{inv.description}</td>
                        <td className="px-6 py-4 text-gray-500">{inv.date}</td>
                        <td className="px-6 py-4 text-gray-500">{inv.dueDate}</td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">{inv.amount}</td>
                        <td className="px-6 py-4 text-center">{getStatusBadge(inv.status)}</td>
                        <td className="px-6 py-4 text-right">
                          {inv.status === 'Unpaid' ? (
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv.reference);
                                setIsPaymentModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-[#6D54B5] hover:bg-[#5a4596] text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              Pay Now
                            </button>
                          ) : (
                            <Link to="/contact/invoices" className="text-xs text-gray-500 hover:text-gray-900 font-medium">
                              View
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 2 & 3: Recent Bills and Recent Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Recent Bills */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Recent Bills</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Payable vendor expenses</p>
                    </div>
                    <Link to="/contact/bills" className="text-[#6D54B5] text-sm font-semibold hover:text-purple-700 flex items-center gap-1">
                      View All <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-500 bg-gray-50/50 uppercase border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 font-medium">Bill Reference</th>
                          <th className="px-6 py-4 font-medium">Service</th>
                          <th className="px-6 py-4 font-medium text-right">Amount</th>
                          <th className="px-6 py-4 font-medium text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {mockBills.map((bill) => (
                          <tr key={bill.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">{bill.reference}</td>
                            <td className="px-6 py-4 text-gray-500">{bill.description}</td>
                            <td className="px-6 py-4 text-right font-semibold text-gray-900">{bill.amount}</td>
                            <td className="px-6 py-4 text-center">{getStatusBadge(bill.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500 flex justify-between">
                  <span>Filtered for your contact account</span>
                  <span className="font-medium text-purple-600">Active</span>
                </div>
              </div>

              {/* Recent Payments */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Recent Payments</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Cleared transactions & receipts</p>
                    </div>
                    <Link to="/contact/payments" className="text-[#6D54B5] text-sm font-semibold hover:text-purple-700 flex items-center gap-1">
                      View All <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-500 bg-gray-50/50 uppercase border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 font-medium">Payment Ref</th>
                          <th className="px-6 py-4 font-medium">Method</th>
                          <th className="px-6 py-4 font-medium text-right">Amount</th>
                          <th className="px-6 py-4 font-medium text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {mockPayments.map((pay) => (
                          <tr key={pay.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">
                              <div>{pay.reference}</div>
                              <span className="text-xs text-gray-400">For {pay.invoiceRef}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-500 text-xs">{pay.method}</td>
                            <td className="px-6 py-4 text-right font-bold text-emerald-600">{pay.amount}</td>
                            <td className="px-6 py-4 text-center">{getStatusBadge(pay.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500 flex justify-between">
                  <span>SSL Encrypted Transactions</span>
                  <span className="font-medium text-emerald-600">Verified</span>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>

      {/* Make Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-gray-100 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6D54B5] flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Make a Payment</h3>
                  <p className="text-xs text-gray-500">Pay your outstanding customer invoice</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMakePayment} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Select Outstanding Invoice
                </label>
                <select
                  value={selectedInvoice}
                  onChange={(e) => setSelectedInvoice(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#6D54B5]/20 focus:border-[#6D54B5] transition-all bg-white"
                >
                  <option value="INV-2026-0091">INV-2026-0091 — Office Walnut Desks ($2,850.00)</option>
                  <option value="INV-2026-0092">INV-2026-0092 — Custom Oak Bookshelf ($1,400.00)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Payment Amount ($)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#6D54B5]/20 focus:border-[#6D54B5] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CREDIT_CARD')}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      paymentMethod === 'CREDIT_CARD'
                        ? 'border-[#6D54B5] bg-purple-50 text-[#6D54B5]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Credit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      paymentMethod === 'BANK_TRANSFER'
                        ? 'border-[#6D54B5] bg-purple-50 text-[#6D54B5]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    Bank Transfer
                  </button>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#6D54B5] hover:bg-[#5a4596] text-white text-sm font-semibold shadow-md transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Pay ${paymentAmount}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-gray-100 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Contact Profile</h3>
                  <p className="text-xs text-gray-500">Your account and billing credentials</p>
                </div>
              </div>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Building className="w-4 h-4 text-[#6D54B5]" />
                  <div>
                    <span className="text-xs text-gray-400 block">Account Entity</span>
                    <span className="font-semibold text-gray-900">{profile?.name || 'Urban Living Ltd'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="w-4 h-4 text-[#6D54B5]" />
                  <div>
                    <span className="text-xs text-gray-400 block">Email Address</span>
                    <span className="font-semibold text-gray-900">{profile?.email || 'contact@urbanliving.com'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="w-4 h-4 text-[#6D54B5]" />
                  <div>
                    <span className="text-xs text-gray-400 block">Phone</span>
                    <span className="font-semibold text-gray-900">+1 (555) 438-9201</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="w-4 h-4 text-[#6D54B5]" />
                  <div>
                    <span className="text-xs text-gray-400 block">Billing Address</span>
                    <span className="font-semibold text-gray-900">742 Evergreen Terrace, Suite 400, Chicago, IL</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                  <span className="text-xs text-gray-500 block">Payment Terms</span>
                  <span className="font-bold text-[#6D54B5]">Net 15 Days</span>
                </div>
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                  <span className="text-xs text-gray-500 block">Currency</span>
                  <span className="font-bold text-[#6D54B5]">USD ($)</span>
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
