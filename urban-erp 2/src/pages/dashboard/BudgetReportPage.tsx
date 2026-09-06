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
  PieChart, 
  Filter, 
  Lock, 
  Clock, 
  TrendingUp 
} from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import { BudgetReport, BudgetReportItem } from '../../types/report';
import { AnalyticAccount } from '../../types/budget';
import { reportService } from '../../services/reportService';
import { analyticAccountService } from '../../services/analyticAccountService';

export const BudgetReportPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTo = searchParams.get('to') || new Date().toISOString().split('T')[0];
  const initialFrom = searchParams.get('from') || `${new Date().getFullYear()}-01-01`;

  const [fromDate, setFromDate] = useState<string>(initialFrom);
  const [toDate, setToDate] = useState<string>(initialTo);
  const [selectedAnalyticAccount, setSelectedAnalyticAccount] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [analyticAccounts, setAnalyticAccounts] = useState<AnalyticAccount[]>([]);
  const [report, setReport] = useState<BudgetReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const fetchBudgetReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reportData, accountsData] = await Promise.all([
        reportService.getBudgetReport({
          from: fromDate,
          to: toDate,
          analyticAccountId: selectedAnalyticAccount,
          status: selectedStatus,
        }),
        analyticAccountService.getAnalyticAccounts()
      ]);
      setReport(reportData);
      setAnalyticAccounts(accountsData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load budget report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetReport();
  }, []);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromDate && toDate && fromDate > toDate) {
      setError('From Date cannot be later than To Date.');
      return;
    }
    setSearchParams({ from: fromDate, to: toDate });
    fetchBudgetReport();
  };

  const handleExport = async () => {
    const result = await reportService.exportReport('budget', { from: fromDate, to: toDate });
    setExportNotice(result.message);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ACTIVE
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-gray-100 text-gray-700 border border-gray-200">
            <Lock className="w-3 h-3 text-gray-400" />
            CLOSED
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            DRAFT
          </span>
        );
    }
  };

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
              <Link to="/reports/profit-loss" className="font-semibold text-gray-600 hover:text-gray-900 px-2 py-0.5">
                Profit & Loss
              </Link>
              <span className="text-gray-300">|</span>
              <Link to="/reports/budget" className="font-bold text-[#6D54B5] px-2 py-0.5 rounded-lg bg-purple-50">
                Budget Report
              </Link>
            </div>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Budget Report
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Compare planned financial amounts with actual business activity.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={fetchBudgetReport}
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

          {/* Period & Attribute Filters Bar */}
          <form 
            onSubmit={handleApplyFilters}
            className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Period:</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-gray-500">From:</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-gray-500">To:</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                  />
                </div>
              </div>

              {/* Filters for Analytic Account and Status */}
              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={selectedAnalyticAccount}
                  onChange={(e) => setSelectedAnalyticAccount(e.target.value)}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-gray-700 font-medium"
                >
                  <option value="ALL">All Analytic Accounts</option>
                  {analyticAccounts.map((acc) => (
                    <option key={acc.id} value={String(acc.id)}>
                      {acc.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-gray-700 font-medium"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="CLOSED">Closed</option>
                </select>

                <button
                  type="submit"
                  className="bg-[#6D54B5] hover:bg-[#5B4599] text-white px-4 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Apply Filters</span>
                </button>
              </div>
            </div>
          </form>

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
              <p className="text-xs font-semibold text-gray-600">Generating Budget Variance Report...</p>
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Visual Comparison: Planned vs Actual Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                    Planned Total
                  </span>
                  <p className="text-xl font-black text-gray-900">
                    ₹{report.totalPlanned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] text-gray-400 mt-1 block">Allocated Target</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-[#6D54B5] block mb-1">
                    Actual Recorded
                  </span>
                  <p className="text-xl font-black text-[#6D54B5]">
                    ₹{report.totalActual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] text-gray-400 mt-1 block">Posted Transactions</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 block mb-1">
                    Remaining Headroom
                  </span>
                  <p className="text-xl font-black text-emerald-700">
                    ₹{report.totalRemaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] text-gray-400 mt-1 block">Remaining = Planned − Actual</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-purple-600 block mb-1">
                      Overall Utilization
                    </span>
                    <span className="text-xs font-black text-[#6D54B5]">{report.overallUtilization}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        report.overallUtilization > 100 ? 'bg-rose-500' : 'bg-[#6D54B5]'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, report.overallUtilization))}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1.5 block">Actual / Planned × 100</span>
                </div>
              </div>

              {/* BUDGET REPORT TABLE */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/70 border-b border-gray-200 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                        <th className="py-3.5 px-6">Budget Name</th>
                        <th className="py-3.5 px-6">Analytic Account</th>
                        <th className="py-3.5 px-6">Period</th>
                        <th className="py-3.5 px-6 text-right">Planned Amount</th>
                        <th className="py-3.5 px-6 text-right">Actual Amount</th>
                        <th className="py-3.5 px-6 text-right">Remaining</th>
                        <th className="py-3.5 px-6">Utilization</th>
                        <th className="py-3.5 px-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                      {report.budgets.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-gray-400">
                            <PieChart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="font-semibold text-gray-600">No budget records found</p>
                            <p className="text-[11px] text-gray-400">
                              Adjust date filters or create budgets in the Budget module.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        report.budgets.map((b, idx) => {
                          const isIncome = b.analyticAccountType === 'INCOME';
                          const isOver = b.utilizationPercentage > 100;

                          return (
                            <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                              {/* Budget Name */}
                              <td className="py-4 px-6 font-bold text-gray-900">
                                {b.budgetName}
                              </td>

                              {/* Analytic Account */}
                              <td className="py-4 px-6">
                                <div className="font-semibold text-gray-800">{b.analyticAccountName}</div>
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] mt-0.5 ${
                                    isIncome
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-orange-50 text-orange-700 border border-orange-200'
                                  }`}
                                >
                                  {b.analyticAccountType}
                                </span>
                              </td>

                              {/* Period */}
                              <td className="py-4 px-6">
                                <div className="font-medium text-gray-900 text-xs">{b.periodStart}</div>
                                <div className="text-[11px] text-gray-400">to {b.periodEnd}</div>
                              </td>

                              {/* Planned Amount */}
                              <td className="py-4 px-6 font-bold text-gray-900 text-right">
                                ₹{b.plannedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>

                              {/* Actual Amount */}
                              <td className="py-4 px-6 font-bold text-[#6D54B5] text-right">
                                ₹{b.actualAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>

                              {/* Remaining */}
                              <td className="py-4 px-6 font-bold text-right text-emerald-700">
                                ₹{b.remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>

                              {/* Utilization */}
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        isOver ? 'bg-rose-500' : 'bg-[#6D54B5]'
                                      }`}
                                      style={{ width: `${Math.min(100, Math.max(0, b.utilizationPercentage))}%` }}
                                    />
                                  </div>
                                  <span className={`text-[11px] font-bold ${isOver ? 'text-rose-600' : 'text-gray-700'}`}>
                                    {b.utilizationPercentage}%
                                  </span>
                                </div>
                              </td>

                              {/* Status */}
                              <td className="py-4 px-6">
                                {renderStatusBadge(b.status)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                    {report.budgets.length > 0 && (
                      <tfoot>
                        <tr className="border-t-2 border-gray-200 bg-gray-50/50 font-black text-xs text-gray-900">
                          <td colSpan={3} className="py-4 px-6 uppercase tracking-wider">
                            Total Summary
                          </td>
                          <td className="py-4 px-6 text-right">
                            ₹{report.totalPlanned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-6 text-right text-[#6D54B5]">
                            ₹{report.totalActual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-6 text-right text-emerald-700">
                            ₹{report.totalRemaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td colSpan={2} className="py-4 px-6 text-purple-700">
                            Overall: {report.overallUtilization}%
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
};
export default BudgetReportPage;
