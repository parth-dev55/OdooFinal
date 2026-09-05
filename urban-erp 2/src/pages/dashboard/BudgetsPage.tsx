import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Search, 
  Filter, 
  Plus, 
  RotateCw, 
  Eye, 
  Edit, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Layers, 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  PieChart, 
  Lock, 
  ArrowUpRight 
} from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import { Budget, BudgetStatus, AnalyticAccount, BudgetFilterParams } from '../../types/budget';
import { budgetService } from '../../services/budgetService';
import { analyticAccountService } from '../../services/analyticAccountService';
import { BudgetFormModal } from '../../components/budget/BudgetFormModal';
import { BudgetDetailModal } from '../../components/budget/BudgetDetailModal';
import { useAuth } from '../../contexts/AuthContext';

export const BudgetsPage: React.FC = () => {
  const { profile } = useAuth();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [analyticAccounts, setAnalyticAccounts] = useState<AnalyticAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAnalyticAccount, setSelectedAnalyticAccount] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [filterPeriodStart, setFilterPeriodStart] = useState<string>('');
  const [filterPeriodEnd, setFilterPeriodEnd] = useState<string>('');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const [budgetsData, accountsData] = await Promise.all([
        budgetService.getBudgets(),
        analyticAccountService.getAnalyticAccounts()
      ]);
      setBudgets(budgetsData);
      setAnalyticAccounts(accountsData);
    } catch (err: any) {
      console.warn('Notice while fetching budgets:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Filtered Budgets List
  const filteredBudgets = useMemo(() => {
    return budgets.filter((b) => {
      // Search by Budget Name
      const matchesSearch = 
        !searchQuery ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.analyticAccountName && b.analyticAccountName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        b.responsiblePerson.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by Analytic Account
      const matchesAccount = 
        selectedAnalyticAccount === 'ALL' || 
        String(b.analyticAccountId) === selectedAnalyticAccount;

      // Filter by Type (INCOME / EXPENSE)
      const matchesType = 
        selectedType === 'ALL' || 
        b.analyticAccountType === selectedType;

      // Filter by Status (DRAFT / ACTIVE / CLOSED)
      const matchesStatus = 
        selectedStatus === 'ALL' || 
        b.status === selectedStatus;

      // Filter by Period
      const matchesPeriodStart = 
        !filterPeriodStart || b.periodStart >= filterPeriodStart;
      const matchesPeriodEnd = 
        !filterPeriodEnd || b.periodEnd <= filterPeriodEnd;

      return (
        matchesSearch &&
        matchesAccount &&
        matchesType &&
        matchesStatus &&
        matchesPeriodStart &&
        matchesPeriodEnd
      );
    });
  }, [
    budgets,
    searchQuery,
    selectedAnalyticAccount,
    selectedType,
    selectedStatus,
    filterPeriodStart,
    filterPeriodEnd
  ]);

  // Totals & KPI Metrics
  const totalPlanned = useMemo(() => {
    return budgets.reduce((sum, b) => sum + (Number(b.plannedAmount) || 0), 0);
  }, [budgets]);

  const totalActual = useMemo(() => {
    return budgets.reduce((sum, b) => sum + (Number(b.actualAmount) || 0), 0);
  }, [budgets]);

  const activeBudgetsCount = useMemo(() => {
    return budgets.filter(b => b.status === 'ACTIVE').length;
  }, [budgets]);

  const overallUtilization = useMemo(() => {
    if (totalPlanned === 0) return 0;
    return Math.round((totalActual / totalPlanned) * 100 * 10) / 10;
  }, [totalPlanned, totalActual]);

  // Status badge styling helper
  const renderStatusBadge = (status: BudgetStatus) => {
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
          {/* Toast Notification */}
          {toastMessage && (
            <div
              className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold animate-in slide-in-from-top-2 duration-200 ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{toastMessage.message}</span>
              <button
                onClick={() => setToastMessage(null)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Module Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
            <Link
              to="/budget"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#6D54B5] text-white shadow-xs flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Budgets</span>
            </Link>

            <Link
              to="/budget/analytic-accounts"
              className="px-4 py-2 text-xs font-bold rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-gray-400" />
              <span>Analytic Accounts</span>
            </Link>
          </div>

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Budgets
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Plan and monitor financial activity against defined budgets.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={fetchBudgets}
                disabled={loading}
                className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 shadow-xs transition-colors"
                title="Refresh budgets"
              >
                <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#6D54B5]' : ''}`} />
              </button>

              <button
                onClick={() => {
                  setBudgetToEdit(null);
                  setIsFormModalOpen(true);
                }}
                className="bg-[#6D54B5] hover:bg-[#5B4599] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Budget</span>
              </button>
            </div>
          </div>

          {/* Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Total Planned */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                Total Planned Budget
              </span>
              <p className="text-xl font-black text-gray-900">
                ₹{totalPlanned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-gray-500 mt-0.5 block">{budgets.length} total portfolios</span>
            </div>

            {/* Total Actual Recorded */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-[#6D54B5] block mb-1">
                Total Actual Financials
              </span>
              <p className="text-xl font-black text-[#6D54B5]">
                ₹{totalActual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-gray-500 mt-0.5 block">Posted accounting records</span>
            </div>

            {/* Active Budgets */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-emerald-600 block mb-1">
                Active Budgets
              </span>
              <p className="text-xl font-black text-emerald-700">{activeBudgetsCount}</p>
              <span className="text-[10px] text-gray-500 mt-0.5 block">Currently monitoring</span>
            </div>

            {/* Overall Utilization */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-purple-600 block mb-1">
                Overall Utilization
              </span>
              <p className="text-xl font-black text-[#6D54B5]">{overallUtilization}%</p>
              <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-[#6D54B5] rounded-full" 
                  style={{ width: `${Math.min(100, Math.max(0, overallUtilization))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search by Budget Name */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Budget Name or Person..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#6D54B5] transition-all"
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

              {/* Filters Group: Analytic Account, Type, Status */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                {/* Filter by Analytic Account */}
                <select
                  value={selectedAnalyticAccount}
                  onChange={(e) => setSelectedAnalyticAccount(e.target.value)}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="ALL">All Analytic Accounts</option>
                  {analyticAccounts.map((acc) => (
                    <option key={acc.id} value={String(acc.id)}>
                      {acc.name}
                    </option>
                  ))}
                </select>

                {/* Filter by Type */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="ALL">All Types</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>

                {/* Filter by Status */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>

            {/* Period Filters */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 text-xs">
              <span className="text-gray-400 font-semibold text-[11px] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Filter by Period:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-[11px]">From:</span>
                <input
                  type="date"
                  value={filterPeriodStart}
                  onChange={(e) => setFilterPeriodStart(e.target.value)}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-[11px]">To:</span>
                <input
                  type="date"
                  value={filterPeriodEnd}
                  onChange={(e) => setFilterPeriodEnd(e.target.value)}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700"
                />
              </div>

              {(filterPeriodStart || filterPeriodEnd || selectedAnalyticAccount !== 'ALL' || selectedType !== 'ALL' || selectedStatus !== 'ALL' || searchQuery) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedAnalyticAccount('ALL');
                    setSelectedType('ALL');
                    setSelectedStatus('ALL');
                    setFilterPeriodStart('');
                    setFilterPeriodEnd('');
                  }}
                  className="text-[11px] font-semibold text-[#6D54B5] hover:text-purple-800 ml-auto"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-200 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                    <th className="py-3.5 px-6">Budget Name</th>
                    <th className="py-3.5 px-6">Analytic Account</th>
                    <th className="py-3.5 px-6">Period</th>
                    <th className="py-3.5 px-6">Planned Amount</th>
                    <th className="py-3.5 px-6">Responsible Person</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RotateCw className="w-5 h-5 animate-spin text-[#6D54B5]" />
                          <span>Loading budgets...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredBudgets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <TrendingUp className="w-8 h-8 text-gray-300" />
                          <p className="font-semibold text-gray-600">No budgets found</p>
                          <p className="text-[11px] text-gray-400">
                            {searchQuery || selectedAnalyticAccount !== 'ALL' || selectedType !== 'ALL' || selectedStatus !== 'ALL'
                              ? 'Try adjusting your search query or filter parameters.'
                              : 'Click "+ Create Budget" above to plan your financial target.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBudgets.map((b) => {
                      const isIncome = b.analyticAccountType === 'INCOME';
                      const plannedAmt = Number(b.plannedAmount) || 0;
                      const actualAmt = Number(b.actualAmount) || 0;
                      const utilPercent = plannedAmt > 0 ? Math.round((actualAmt / plannedAmt) * 100) : 0;

                      return (
                        <tr 
                          key={b.id} 
                          className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedBudget(b);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          {/* Budget Name */}
                          <td className="py-4 px-6">
                            <div className="font-bold text-gray-900">{b.name}</div>
                            <span className="text-[10px] text-gray-400">ID: #{b.id}</span>
                          </td>

                          {/* Analytic Account */}
                          <td className="py-4 px-6">
                            <div className="font-semibold text-gray-800">
                              {b.analyticAccountName || 'General Account'}
                            </div>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] mt-0.5 ${
                                isIncome
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-orange-50 text-orange-700 border border-orange-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isIncome ? 'bg-emerald-500' : 'bg-orange-500'
                                }`}
                              />
                              {b.analyticAccountType || 'EXPENSE'}
                            </span>
                          </td>

                          {/* Period */}
                          <td className="py-4 px-6">
                            <div className="font-medium text-gray-900 text-xs">
                              {b.periodStart}
                            </div>
                            <div className="text-[11px] text-gray-400">
                              to {b.periodEnd}
                            </div>
                          </td>

                          {/* Planned Amount & Mini progress */}
                          <td className="py-4 px-6">
                            <div className="font-extrabold text-gray-900 text-xs">
                              ₹{plannedAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
                              <span>Act: ₹{actualAmt.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                              <span className="font-semibold text-[#6D54B5]">({utilPercent}%)</span>
                            </div>
                          </td>

                          {/* Responsible Person */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                              <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate max-w-[160px]">{b.responsiblePerson}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                            {renderStatusBadge(b.status)}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Details */}
                              <button
                                onClick={() => {
                                  setSelectedBudget(b);
                                  setIsDetailModalOpen(true);
                                }}
                                className="p-1.5 text-gray-500 hover:text-[#6D54B5] hover:bg-purple-50 rounded-lg transition-colors"
                                title="View Budget Details & Actuals"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => {
                                  setBudgetToEdit(b);
                                  setIsFormModalOpen(true);
                                }}
                                className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Edit Budget"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
              <span>Showing {filteredBudgets.length} of {budgets.length} budgets</span>
              <span className="text-[11px] text-gray-400">All planned vs actuals synced with accounting records</span>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <BudgetFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={(msg) => {
          triggerToast(msg, 'success');
          fetchBudgets();
        }}
        budgetToEdit={budgetToEdit}
      />

      <BudgetDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        budget={selectedBudget}
        onEdit={(b) => {
          setBudgetToEdit(b);
          setIsFormModalOpen(true);
        }}
        onStatusChange={(updatedBudget, newStatus) => {
          triggerToast(`Budget "${updatedBudget.name}" status changed to ${newStatus}.`, 'success');
          fetchBudgets();
        }}
      />
    </div>
  );
};
export default BudgetsPage;
