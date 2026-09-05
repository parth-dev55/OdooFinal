import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  RotateCw, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Filter, 
  Layers 
} from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import { ProfitLossReport } from '../../types/report';
import { reportService } from '../../services/reportService';

export const ProfitLossPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTo = searchParams.get('to') || new Date().toISOString().split('T')[0];
  const initialFrom = searchParams.get('from') || `${new Date().getFullYear()}-01-01`;

  const [fromDate, setFromDate] = useState<string>(initialFrom);
  const [toDate, setToDate] = useState<string>(initialTo);
  const [report, setReport] = useState<ProfitLossReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const fetchProfitLoss = async (from: string, to: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportService.getProfitLoss({ from, to });
      setReport(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load Profit & Loss report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitLoss(fromDate, toDate);
  }, []);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromDate && toDate && fromDate > toDate) {
      setError('From Date cannot be later than To Date.');
      return;
    }
    setSearchParams({ from: fromDate, to: toDate });
    fetchProfitLoss(fromDate, toDate);
  };

  const handleExport = async () => {
    const result = await reportService.exportReport('profit-loss', { from: fromDate, to: toDate });
    setExportNotice(result.message);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const isProfitable = (report?.netProfit || 0) >= 0;

  return (
    <div className="flex h-screen bg-[#FDFBF7] font-sans antialiased text-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Breadcrumbs & Sub Navigation */}
          <div className="flex items-center justify-between">
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#6D54B5] hover:text-purple-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Reports</span>
            </Link>

            <div className="flex items-center gap-1.5 text-xs bg-white px-3 py-1.5 rounded-xl border border-gray-200">
              <Link to="/reports/balance-sheet" className="font-semibold text-gray-600 hover:text-gray-900 px-2 py-0.5">
                Balance Sheet
              </Link>
              <span className="text-gray-300">|</span>
              <Link to="/reports/profit-loss" className="font-bold text-[#6D54B5] px-2 py-0.5 rounded-lg bg-purple-50">
                Profit & Loss
              </Link>
              <span className="text-gray-300">|</span>
              <Link to="/reports/budget" className="font-semibold text-gray-600 hover:text-gray-900 px-2 py-0.5">
                Budget Report
              </Link>
            </div>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Profit & Loss
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Understand revenue, purchases, expenses and net profit for the selected period.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => fetchProfitLoss(fromDate, toDate)}
                disabled={loading}
                className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 shadow-xs transition-colors"
                title="Refresh report"
              >
                <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#6D54B5]' : ''}`} />
              </button>

              <button
                onClick={handleExport}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-[#6D54B5]" />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {/* Export Toast Notice */}
          {exportNotice && (
            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-[#6D54B5] font-semibold flex items-center gap-2 animate-in fade-in">
              <ShieldCheck className="w-4 h-4" />
              <span>{exportNotice}</span>
            </div>
          )}

          {/* Period Filter Bar */}
          <form 
            onSubmit={handleApplyFilters}
            className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-bold text-gray-700">Period:</span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[11px] font-semibold text-gray-500">From:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[11px] font-semibold text-gray-500">To:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#6D54B5] hover:bg-[#5B4599] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </button>
          </form>

          {/* Period Indicator */}
          <div className="flex items-center justify-between text-xs bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-xs">
            <span className="font-bold text-gray-700">
              Selected Period: <span className="text-[#6D54B5] font-black">{report?.period || `${fromDate} to ${toDate}`}</span>
            </span>
            <span className="text-[11px] text-gray-400 font-medium">
              Currency: INR (₹) • Accounting Basis: Accrual
            </span>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
              <RotateCw className="w-6 h-6 animate-spin text-[#6D54B5] mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-600">Calculating Profit & Loss from posted accounting records...</p>
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Top Summary Cards: Total Income, Total Expenses, Net Profit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 block mb-1">
                    Total Income
                  </span>
                  <p className="text-xl font-black text-emerald-700">
                    ₹{report.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] text-gray-400 mt-1 block">Operating Revenue</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-orange-600 block mb-1">
                    Total Expenses
                  </span>
                  <p className="text-xl font-black text-orange-700">
                    ₹{report.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] text-gray-400 mt-1 block">Cost of Goods + Operating Costs</span>
                </div>

                <div className={`p-5 rounded-2xl border shadow-xs ${
                  isProfitable ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase block mb-1 ${
                      isProfitable ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      Net Profit
                    </span>
                    {isProfitable ? (
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-rose-600" />
                    )}
                  </div>
                  <p className={`text-xl font-black ${
                    isProfitable ? 'text-emerald-800' : 'text-rose-800'
                  }`}>
                    ₹{report.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <span className={`text-[10px] font-semibold mt-1 block ${
                    isProfitable ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {isProfitable ? 'Positive Operating Surplus' : 'Net Period Deficit'}
                  </span>
                </div>
              </div>

              {/* INCOME SECTION */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="px-6 py-4 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-700">
                    INCOME
                  </span>
                  <span className="text-xs font-bold text-emerald-600">Sales & Operating Revenues</span>
                </div>

                <div className="p-6">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 text-[11px]">
                        <th className="pb-2 font-medium">Income Stream</th>
                        <th className="pb-2 font-medium">Code</th>
                        <th className="pb-2 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {report.income.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="py-2.5 font-semibold text-gray-900">• {item.name}</td>
                          <td className="py-2.5 text-gray-500 font-mono text-[11px]">{item.code}</td>
                          <td className="py-2.5 font-bold text-gray-900 text-right">
                            ₹{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200 font-black text-sm">
                        <td colSpan={2} className="pt-3 text-gray-900">Total Income</td>
                        <td className="pt-3 text-right text-emerald-700 font-black">
                          ₹{report.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* EXPENSES SECTION */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="px-6 py-4 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-700">
                    EXPENSES
                  </span>
                  <span className="text-xs font-bold text-orange-600">Procurement & Operations</span>
                </div>

                <div className="p-6">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 text-[11px]">
                        <th className="pb-2 font-medium">Expense Category</th>
                        <th className="pb-2 font-medium">Code</th>
                        <th className="pb-2 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {report.expenses.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="py-2.5 font-semibold text-gray-900">• {item.name}</td>
                          <td className="py-2.5 text-gray-500 font-mono text-[11px]">{item.code}</td>
                          <td className="py-2.5 font-bold text-gray-900 text-right">
                            ₹{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200 font-black text-sm">
                        <td colSpan={2} className="pt-3 text-gray-900">Total Expenses</td>
                        <td className="pt-3 text-right text-orange-700 font-black">
                          ₹{report.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* NET PROFIT SUMMARY ROW */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-gray-900">
                    Period Net Profit Summary
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Net Profit = Total Income (₹{report.totalIncome.toLocaleString()}) − Total Expenses (₹{report.totalExpenses.toLocaleString()})
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                    Calculated Margin
                  </span>
                  <span className={`text-xl font-black ${
                    isProfitable ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    ₹{report.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
};
export default ProfitLossPage;
