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
  Layers, 
  DollarSign, 
  FileSpreadsheet, 
  Filter 
} from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import { BalanceSheetReport } from '../../types/report';
import { reportService } from '../../services/reportService';

export const BalanceSheetPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTo = searchParams.get('to') || new Date().toISOString().split('T')[0];
  const initialFrom = searchParams.get('from') || `${new Date().getFullYear()}-01-01`;

  const [fromDate, setFromDate] = useState<string>(initialFrom);
  const [toDate, setToDate] = useState<string>(initialTo);
  const [report, setReport] = useState<BalanceSheetReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const fetchBalanceSheet = async (asOf: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportService.getBalanceSheet({ from: fromDate, to: asOf, asOf });
      setReport(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load balance sheet report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalanceSheet(toDate);
  }, []);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromDate && toDate && fromDate > toDate) {
      setError('From Date cannot be later than To Date.');
      return;
    }
    setSearchParams({ from: fromDate, to: toDate });
    fetchBalanceSheet(toDate);
  };

  const handleExport = async () => {
    const result = await reportService.exportReport('balance-sheet', { from: fromDate, to: toDate });
    setExportNotice(result.message);
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="flex h-screen bg-[#FDFBF7] font-sans antialiased text-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Breadcrumb & Sub Navigation */}
          <div className="flex items-center justify-between">
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#6D54B5] hover:text-purple-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Reports</span>
            </Link>

            <div className="flex items-center gap-1.5 text-xs bg-white px-3 py-1.5 rounded-xl border border-gray-200">
              <Link to="/reports/balance-sheet" className="font-bold text-[#6D54B5] px-2 py-0.5 rounded-lg bg-purple-50">
                Balance Sheet
              </Link>
              <span className="text-gray-300">|</span>
              <Link to="/reports/profit-loss" className="font-semibold text-gray-600 hover:text-gray-900 px-2 py-0.5">
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
                Balance Sheet
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                View the company's financial position for the selected period.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => fetchBalanceSheet(toDate)}
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
                <label className="text-[11px] font-semibold text-gray-500">To / As Of:</label>
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

          {/* As Of Indicator */}
          <div className="flex items-center justify-between text-xs bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-xs">
            <span className="font-bold text-gray-700">
              As of: <span className="text-[#6D54B5] font-black">{report?.asOfDate || toDate}</span>
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
              <p className="text-xs font-semibold text-gray-600">Generating Balance Sheet from posted records...</p>
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* ASSETS SECTION */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="px-6 py-4 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-700">
                    ASSETS
                  </span>
                  <span className="text-xs font-bold text-[#6D54B5]">Current Assets</span>
                </div>

                <div className="p-6">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Current Assets
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 text-[11px]">
                        <th className="pb-2 font-medium">Account</th>
                        <th className="pb-2 font-medium">Code</th>
                        <th className="pb-2 font-medium text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {report.assets.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="py-2.5 font-semibold text-gray-900">• {item.name}</td>
                          <td className="py-2.5 text-gray-500 font-mono text-[11px]">{item.code}</td>
                          <td className="py-2.5 font-bold text-gray-900 text-right">
                            ₹{item.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200 font-black text-sm">
                        <td colSpan={2} className="pt-3 text-gray-900">Total Assets</td>
                        <td className="pt-3 text-right text-emerald-700 font-black">
                          ₹{report.totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* LIABILITIES SECTION */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="px-6 py-4 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-700">
                    LIABILITIES
                  </span>
                  <span className="text-xs font-bold text-orange-600">Accounts Payable</span>
                </div>

                <div className="p-6">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 text-[11px]">
                        <th className="pb-2 font-medium">Account</th>
                        <th className="pb-2 font-medium">Code</th>
                        <th className="pb-2 font-medium text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {report.liabilities.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="py-2.5 font-semibold text-gray-900">• {item.name}</td>
                          <td className="py-2.5 text-gray-500 font-mono text-[11px]">{item.code}</td>
                          <td className="py-2.5 font-bold text-gray-900 text-right">
                            ₹{item.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200 font-black text-sm">
                        <td colSpan={2} className="pt-3 text-gray-900">Total Liabilities</td>
                        <td className="pt-3 text-right text-orange-700 font-black">
                          ₹{report.totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* CAPITAL / EQUITY SECTION */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="px-6 py-4 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-700">
                    CAPITAL
                  </span>
                  <span className="text-xs font-bold text-purple-600">Owner's Equity</span>
                </div>

                <div className="p-6">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 text-[11px]">
                        <th className="pb-2 font-medium">Account</th>
                        <th className="pb-2 font-medium">Code</th>
                        <th className="pb-2 font-medium text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {report.capital.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="py-2.5 font-semibold text-gray-900">• {item.name}</td>
                          <td className="py-2.5 text-gray-500 font-mono text-[11px]">{item.code}</td>
                          <td className="py-2.5 font-bold text-gray-900 text-right">
                            ₹{item.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200 font-black text-sm">
                        <td colSpan={2} className="pt-3 text-gray-900">Total Capital</td>
                        <td className="pt-3 text-right text-[#6D54B5] font-black">
                          ₹{report.totalCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* ACCOUNTING EQUATION SUMMARY BANNER */}
              <div className="bg-gradient-to-br from-purple-50/80 to-white p-5 rounded-2xl border border-purple-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6D54B5] flex items-center justify-center font-black">
                    =
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">
                      Fundamental Accounting Equation Balance
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Total Assets (₹{report.totalAssets.toLocaleString()}) = Total Liabilities (₹{report.totalLiabilities.toLocaleString()}) + Total Capital (₹{report.totalCapital.toLocaleString()})
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Balanced
                </span>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
};
export default BalanceSheetPage;
