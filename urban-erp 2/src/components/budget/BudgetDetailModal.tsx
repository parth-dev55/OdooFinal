import React, { useState, useEffect } from 'react';
import { 
  X, 
  TrendingUp, 
  Calendar, 
  Layers, 
  DollarSign, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Edit, 
  RotateCw, 
  ArrowUpRight, 
  ArrowDownRight, 
  PieChart, 
  Lock, 
  ShieldCheck 
} from 'lucide-react';
import { Budget, BudgetSummary, BudgetStatus } from '../../types/budget';
import { budgetService } from '../../services/budgetService';

interface BudgetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
  onEdit?: (budget: Budget) => void;
  onStatusChange?: (budget: Budget, newStatus: BudgetStatus) => void;
}

export const BudgetDetailModal: React.FC<BudgetDetailModalProps> = ({
  isOpen,
  onClose,
  budget,
  onEdit,
  onStatusChange
}) => {
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && budget) {
      loadSummary();
    }
  }, [isOpen, budget]);

  const loadSummary = async () => {
    if (!budget) return;
    setLoading(true);
    try {
      const data = await budgetService.getBudgetSummary(budget.id);
      setSummary(data);
    } catch (err) {
      console.warn('Could not fetch budget summary from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: BudgetStatus) => {
    if (!budget) return;
    setUpdatingStatus(true);
    try {
      const updated = await budgetService.updateStatus(budget.id, newStatus);
      if (onStatusChange) {
        onStatusChange(updated, newStatus);
      }
      await loadSummary();
    } catch (err) {
      console.warn('Error updating budget status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!isOpen || !budget) return null;

  const isIncome = (summary?.analyticAccountType || budget.analyticAccountType) === 'INCOME';
  const planned = summary ? summary.plannedAmount : Number(budget.plannedAmount);
  const actual = summary ? summary.actualAmount : Number(budget.actualAmount || 0);
  const remaining = summary ? summary.remainingAmount : Math.max(0, planned - actual);
  const utilization = summary 
    ? summary.utilizationPercentage 
    : planned > 0 ? Math.round((actual / planned) * 100 * 10) / 10 : 0;

  // Status badge styling
  const getStatusBadge = (status: BudgetStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ACTIVE
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300">
            <Lock className="w-3 h-3 text-gray-500" />
            CLOSED
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            DRAFT
          </span>
        );
    }
  };

  // Color progress bar depending on utilization & income/expense
  const getProgressBarColor = () => {
    if (isIncome) {
      if (utilization >= 100) return 'bg-emerald-500';
      if (utilization >= 70) return 'bg-emerald-400';
      return 'bg-blue-500';
    } else {
      if (utilization > 100) return 'bg-rose-500';
      if (utilization >= 85) return 'bg-amber-500';
      return 'bg-[#6D54B5]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl border border-gray-100 overflow-hidden max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50/90 to-white">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-[#6D54B5] flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-gray-900 tracking-tight">
                  {budget.name}
                </h2>
                {getStatusBadge(summary?.status || budget.status)}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Budget ID: #{budget.id} • Created {new Date(budget.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Metadata Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200/70">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                Analytic Account
              </span>
              <p className="font-bold text-gray-900 text-xs truncate">
                {summary?.analyticAccountName || budget.analyticAccountName || 'General Account'}
              </p>
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full ${
                isIncome 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-orange-50 text-orange-700 border border-orange-200'
              }`}>
                {isIncome ? 'INCOME TARGET' : 'EXPENSE BUDGET'}
              </span>
            </div>

            <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200/70">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                Period Duration
              </span>
              <p className="font-bold text-gray-900 text-xs">
                {budget.periodStart}
              </p>
              <p className="text-[11px] text-gray-500">
                to {budget.periodEnd}
              </p>
            </div>

            <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200/70">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                Responsible Person
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <User className="w-3.5 h-3.5 text-[#6D54B5]" />
                <p className="font-bold text-gray-900 text-xs truncate">
                  {budget.responsiblePerson}
                </p>
              </div>
            </div>
          </div>

          {/* BUDGET VS ACTUAL VISUAL COMPARISON SECTION */}
          <div className="bg-gradient-to-br from-gray-50/80 to-purple-50/30 p-5 rounded-2xl border border-purple-100/70 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-100 text-[#6D54B5] flex items-center justify-center">
                  <PieChart className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-gray-900 text-xs tracking-tight">
                  Budget vs. Actual Performance
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-gray-500">
                {isIncome ? 'Revenue Achievement' : 'Expenditure Absorption'}
              </span>
            </div>

            {/* Three key comparison cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Planned Amount */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                  Planned Amount
                </span>
                <p className="text-base font-extrabold text-gray-900">
                  ₹{planned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-gray-500 mt-0.5 block">Allocated Target</span>
              </div>

              {/* Actual Amount */}
              <div className="bg-white p-4 rounded-xl border border-purple-200/80 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-[#6D54B5] block mb-1">
                    Actual Amount
                  </span>
                  {actual > planned ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </div>
                <p className="text-base font-extrabold text-[#6D54B5]">
                  ₹{actual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-gray-500 mt-0.5 block">Posted Accounting Records</span>
              </div>

              {/* Remaining Amount */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                    Remaining Amount
                  </span>
                  {actual > planned ? (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                      Over Budget
                    </span>
                  ) : null}
                </div>
                <p className={`text-base font-extrabold ${
                  actual > planned ? 'text-rose-600' : 'text-emerald-700'
                }`}>
                  ₹{remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-gray-500 mt-0.5 block">
                  {actual > planned ? 'Deficit Exceeded' : 'Available Balance'}
                </span>
              </div>
            </div>

            {/* Visual Progress Bar & Utilization */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700 flex items-center gap-1.5">
                  Budget Utilization:
                  <span className={`font-black text-sm ${
                    utilization > 100 
                      ? (isIncome ? 'text-emerald-600' : 'text-rose-600')
                      : 'text-[#6D54B5]'
                  }`}>
                    {utilization}%
                  </span>
                </span>
                <span className="text-[11px] text-gray-500 font-medium">
                  {utilization > 100 
                    ? (isIncome ? 'Exceeded Revenue Target! 🎯' : 'Exceeded Allocation limit') 
                    : `${(100 - utilization).toFixed(1)}% remaining margin`}
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor()}`}
                  style={{ width: `${Math.min(100, Math.max(0, utilization))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
                <span>0%</span>
                <span>50%</span>
                <span>100% Target</span>
                {utilization > 100 && (
                  <span className="font-bold text-rose-500">Over limit ({utilization}%)</span>
                )}
              </div>
            </div>
          </div>

          {/* Notes / Context */}
          {budget.notes && (
            <div>
              <span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">
                Strategic Notes & Assumptions
              </span>
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 leading-relaxed">
                {budget.notes}
              </div>
            </div>
          )}

          {/* Status Controls */}
          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Change Status:</span>
              {(['DRAFT', 'ACTIVE', 'CLOSED'] as BudgetStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  disabled={updatingStatus || (summary?.status || budget.status) === st}
                  onClick={() => handleStatusUpdate(st)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                    (summary?.status || budget.status) === st
                      ? 'bg-gray-900 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(budget);
                }}
                className="px-4 py-1.5 rounded-xl border border-purple-200 bg-purple-50 text-[#6D54B5] hover:bg-purple-100 font-bold transition-colors flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Budget</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2 text-gray-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Audited & verified against ledger transactions</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-[#6D54B5] hover:bg-[#5B4599] rounded-xl shadow-xs transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
export default BudgetDetailModal;
