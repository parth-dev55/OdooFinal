import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Topbar from '../../components/dashboard/Topbar';
import Sidebar from '../../components/dashboard/Sidebar';
import KpiCard from '../../components/dashboard/KpiCard';
import { SalesTrendChart, ExpenseBreakdownChart, BudgetActualChart } from '../../components/dashboard/Charts';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingDown, 
  PieChart, 
  Activity, 
  Wallet, 
  Percent, 
  CreditCard,
  FileSpreadsheet,
  Receipt,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Scale
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AccountantDashboard() {
  const { profile } = useAuth();

  // Accounting-oriented KPI metrics (Demo/Mock values clearly isolated for UI presentation)
  const kpis = [
    { 
      title: 'Total Sales', 
      value: '$124,500.00', 
      icon: <ShoppingCart className="w-5 h-5 text-indigo-600" />, 
      trend: '12.4%', 
      trendUp: true 
    },
    { 
      title: 'Total Purchases', 
      value: '$68,200.00', 
      icon: <CreditCard className="w-5 h-5 text-orange-600" />, 
      trend: '3.1%', 
      trendUp: false 
    },
    { 
      title: 'Total Expenses', 
      value: '$18,400.00', 
      icon: <TrendingDown className="w-5 h-5 text-rose-600" />, 
      trend: '2.3%', 
      trendUp: false 
    },
    { 
      title: 'Receivables', 
      value: '$28,600.00', 
      icon: <Activity className="w-5 h-5 text-blue-600" />,
      trend: '8 pending invoices',
      trendUp: true
    },
    { 
      title: 'Payables', 
      value: '$14,200.00', 
      icon: <Wallet className="w-5 h-5 text-amber-600" />,
      trend: '4 pending bills',
      trendUp: false
    },
    { 
      title: 'Net Profit', 
      value: '$37,900.00', 
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />, 
      trend: '15.8%', 
      trendUp: true 
    }
  ];

  const quickAccountingActions = [
    { name: 'Customer Invoice', icon: FileSpreadsheet, color: 'text-indigo-600', bg: 'bg-indigo-50', path: '/invoices' },
    { name: 'Vendor Bill', icon: Receipt, color: 'text-orange-600', bg: 'bg-orange-50', path: '/bills' },
    { name: 'Record Payment', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/payments' },
    { name: 'Chart of Accounts', icon: Scale, color: 'text-blue-600', bg: 'bg-blue-50', path: '/accounts' },
    { name: 'General Journals', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50', path: '/journals' },
  ];

  // Accounting-oriented recent transactions (Demo data with Debit/Credit indications)
  const accountingTransactions = [
    { id: '1', date: '2026-09-04', reference: 'INV-2026-0089', type: 'Customer Invoice', party: 'Urban Living Ltd', debit: '$4,200.00', credit: '—', status: 'Paid' },
    { id: '2', date: '2026-09-03', reference: 'BILL-2026-0045', type: 'Vendor Bill', party: 'Timberland Supplies', debit: '—', credit: '$1,850.00', status: 'Pending' },
    { id: '3', date: '2026-09-03', reference: 'PAY-2026-0112', type: 'Customer Payment', party: 'Nordic Spaces', debit: '$3,400.00', credit: '—', status: 'Paid' },
    { id: '4', date: '2026-09-02', reference: 'BILL-2026-0044', type: 'Vendor Bill', party: 'Apex Foam & Fabrics', debit: '—', credit: '$920.00', status: 'Paid' },
    { id: '5', date: '2026-09-01', reference: 'INV-2026-0088', type: 'Customer Invoice', party: 'Metropolis Homes', debit: '$6,800.00', credit: '—', status: 'Overdue' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"><CheckCircle2 className="w-3 h-3" /> Paid</span>;
      case 'Pending':
        return <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20"><Clock className="w-3 h-3" /> Pending</span>;
      case 'Overdue':
        return <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10">Overdue</span>;
      default:
        return <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20">{status}</span>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50/50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header with Role Context */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Good morning, {profile?.name || 'Accountant'}</h1>
                  <span className="px-3 py-1 bg-purple-100 text-[#6D54B5] text-xs font-semibold rounded-full border border-purple-200">
                    Accountant Workspace
                  </span>
                </div>
                <p className="text-gray-500 mt-2">Here's your accounting and financial overview.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/reports/balance-sheet"
                  className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-[#6D54B5]/40 text-gray-700 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm"
                >
                  <Scale className="w-4 h-4 text-[#6D54B5]" />
                  Balance Sheet
                </Link>
                <Link
                  to="/reports/profit-loss"
                  className="inline-flex items-center gap-2 bg-[#6D54B5] hover:bg-[#5a4596] text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm"
                >
                  <Activity className="w-4 h-4" />
                  Profit & Loss
                </Link>
              </div>
            </div>

            {/* Quick Accounting Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Accounting Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {quickAccountingActions.map((action) => (
                  <Link
                    key={action.name}
                    to={action.path}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-[#6D54B5]/30 hover:shadow-md transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-full ${action.bg} ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 text-center">{action.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Accounting KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kpis.map((kpi, idx) => (
                <KpiCard 
                  key={idx} 
                  title={kpi.title} 
                  value={kpi.value} 
                  icon={kpi.icon} 
                  trend={kpi.trend} 
                  trendUp={kpi.trendUp} 
                />
              ))}
            </div>

            {/* Charts Row 1: Sales Trend & Expense Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SalesTrendChart />
              </div>
              <div className="lg:col-span-1">
                <ExpenseBreakdownChart />
              </div>
            </div>

            {/* Charts Row 2 & Accounting Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <BudgetActualChart />
                
                {/* Report Shortcuts */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Financial Reports</h3>
                  <div className="space-y-3">
                    <Link to="/reports/balance-sheet" className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-[#6D54B5]/30 hover:bg-purple-50/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <Scale className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-gray-700 group-hover:text-[#6D54B5]">Balance Sheet</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#6D54B5]" />
                    </Link>
                    <Link to="/reports/profit-loss" className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-[#6D54B5]/30 hover:bg-purple-50/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <Activity className="w-4 h-4 text-indigo-600" />
                        <span className="font-medium text-gray-700 group-hover:text-[#6D54B5]">Profit & Loss</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#6D54B5]" />
                    </Link>
                    <Link to="/reports/budget" className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-[#6D54B5]/30 hover:bg-purple-50/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <Percent className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium text-gray-700 group-hover:text-[#6D54B5]">Budget Report</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#6D54B5]" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Accounting Recent Transactions */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col justify-between">
                  <div>
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">Recent Accounting Transactions</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Customer invoices, vendor bills & recorded payments</p>
                      </div>
                      <Link to="/invoices" className="text-[#6D54B5] text-sm font-semibold hover:text-purple-700">
                        View All
                      </Link>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 bg-gray-50/50 uppercase border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-4 font-medium">Date</th>
                            <th className="px-6 py-4 font-medium">Reference</th>
                            <th className="px-6 py-4 font-medium">Type</th>
                            <th className="px-6 py-4 font-medium">Counterparty</th>
                            <th className="px-6 py-4 font-medium text-right">Debit</th>
                            <th className="px-6 py-4 font-medium text-right">Credit</th>
                            <th className="px-6 py-4 font-medium text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {accountingTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-6 py-4 text-gray-500">{tx.date}</td>
                              <td className="px-6 py-4 font-medium text-gray-900">{tx.reference}</td>
                              <td className="px-6 py-4 text-gray-500">{tx.type}</td>
                              <td className="px-6 py-4 text-gray-900 font-medium">{tx.party}</td>
                              <td className="px-6 py-4 text-right font-semibold text-emerald-600">{tx.debit}</td>
                              <td className="px-6 py-4 text-right font-semibold text-rose-600">{tx.credit}</td>
                              <td className="px-6 py-4 text-center">
                                {getStatusBadge(tx.status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
                    <span>Double-Entry Balance: Balanced ($124,500.00 / $124,500.00)</span>
                    <span className="text-purple-600 font-medium">Demo Accounting Feed</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
