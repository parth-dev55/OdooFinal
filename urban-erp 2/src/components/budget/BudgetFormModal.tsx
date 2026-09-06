import React, { useState, useEffect } from 'react';
import { 
  X, 
  TrendingUp, 
  Calendar, 
  Layers, 
  DollarSign, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  RotateCw, 
  Plus 
} from 'lucide-react';
import { Budget, CreateBudgetDto, UpdateBudgetDto, AnalyticAccount, ResponsibleUser } from '../../types/budget';
import { budgetService } from '../../services/budgetService';
import { analyticAccountService } from '../../services/analyticAccountService';

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  budgetToEdit?: Budget | null;
}

export const BudgetFormModal: React.FC<BudgetFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  budgetToEdit
}) => {
  const isEditing = Boolean(budgetToEdit);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [analyticAccountId, setAnalyticAccountId] = useState<string>('');
  const [periodStart, setPeriodStart] = useState<string>('');
  const [periodEnd, setPeriodEnd] = useState<string>('');
  const [plannedAmount, setPlannedAmount] = useState<string>('');
  const [responsiblePerson, setResponsiblePerson] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Dropdown data & states
  const [analyticAccounts, setAnalyticAccounts] = useState<AnalyticAccount[]>([]);
  const [responsibleUsers, setResponsibleUsers] = useState<ResponsibleUser[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  // Errors & submission
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      loadDependencies();
      if (budgetToEdit) {
        setName(budgetToEdit.name);
        setAnalyticAccountId(String(budgetToEdit.analyticAccountId));
        setPeriodStart(budgetToEdit.periodStart);
        setPeriodEnd(budgetToEdit.periodEnd);
        setPlannedAmount(String(budgetToEdit.plannedAmount));
        setResponsiblePerson(budgetToEdit.responsiblePerson);
        setNotes(budgetToEdit.notes || '');
      } else {
        // Defaults for new budget
        setName('');
        setAnalyticAccountId('');
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const endOfQuarter = new Date(today.getFullYear(), today.getMonth() + 3, 0).toISOString().split('T')[0];
        setPeriodStart(startOfMonth);
        setPeriodEnd(endOfQuarter);
        setPlannedAmount('');
        setResponsiblePerson('');
        setNotes('');
      }
      setErrors({});
    }
  }, [isOpen, budgetToEdit]);

  const loadDependencies = async () => {
    setLoadingData(true);
    try {
      const [accounts, users] = await Promise.all([
        analyticAccountService.getAnalyticAccounts(undefined, 'ACTIVE'),
        budgetService.getResponsibleUsers()
      ]);
      setAnalyticAccounts(accounts);
      setResponsibleUsers(users);

      // If new budget and accounts exist, select first
      if (!budgetToEdit && accounts.length > 0 && !analyticAccountId) {
        setAnalyticAccountId(String(accounts[0].id));
      }
      if (!budgetToEdit && users.length > 0 && !responsiblePerson) {
        setResponsiblePerson(`${users[0].name} (${users[0].role})`);
      }
    } catch (err) {
      console.warn('Error loading budget form dependencies:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!name.trim()) {
      errs.name = 'Budget Name is required.';
    } else if (name.trim().length < 3) {
      errs.name = 'Budget Name must be at least 3 characters.';
    }

    if (!analyticAccountId) {
      errs.analyticAccountId = 'Please select an Analytic Account.';
    }

    if (!periodStart) {
      errs.periodStart = 'Period Start is required.';
    }

    if (!periodEnd) {
      errs.periodEnd = 'Period End is required.';
    }

    if (periodStart && periodEnd && periodStart >= periodEnd) {
      errs.periodEnd = 'Period Start must be before Period End.';
    }

    const numAmount = parseFloat(plannedAmount);
    if (!plannedAmount || isNaN(numAmount)) {
      errs.plannedAmount = 'Planned Amount is required.';
    } else if (numAmount < 0) {
      errs.plannedAmount = 'Planned Amount must be greater than or equal to 0.';
    }

    if (!responsiblePerson.trim()) {
      errs.responsiblePerson = 'Responsible Person is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const amountVal = parseFloat(plannedAmount);

      if (isEditing && budgetToEdit) {
        const dto: UpdateBudgetDto = {
          name: name.trim(),
          analyticAccountId,
          periodStart,
          periodEnd,
          plannedAmount: amountVal,
          responsiblePerson: responsiblePerson.trim(),
          notes: notes.trim() || undefined
        };
        await budgetService.updateBudget(budgetToEdit.id, dto);
        onSuccess(`Budget "${name.trim()}" successfully updated.`);
      } else {
        const dto: CreateBudgetDto = {
          name: name.trim(),
          analyticAccountId,
          periodStart,
          periodEnd,
          plannedAmount: amountVal,
          responsiblePerson: responsiblePerson.trim(),
          notes: notes.trim() || undefined
        };
        await budgetService.createBudget(dto);
        onSuccess(`Budget "${name.trim()}" (₹${amountVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}) successfully created.`);
      }
      onClose();
    } catch (err: any) {
      setErrors(prev => ({
        ...prev,
        form: err?.message || 'Failed to save budget. Please check inputs and try again.'
      }));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full flex flex-col shadow-2xl border border-gray-100 overflow-hidden max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50/80 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D54B5] flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                {isEditing ? 'Edit Budget' : '+ Create Budget'}
              </h2>
              <p className="text-xs text-gray-500">
                Plan and allocate target amounts for business units and projects
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errors.form && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Budget Name */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Budget Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors(prev => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Q3 Sales Target, FY26 Marketing Budget, IT Infrastructure"
              className={`w-full text-xs bg-gray-50/70 border rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all ${
                errors.name ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200 focus:border-[#6D54B5]'
              }`}
            />
            {errors.name && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>

          {/* Analytic Account (from GET /api/analytic-accounts) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Analytic Account <span className="text-rose-500">*</span>
              </label>
              {loadingData && (
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <RotateCw className="w-3 h-3 animate-spin" /> Loading...
                </span>
              )}
            </div>
            <select
              value={analyticAccountId}
              onChange={(e) => {
                setAnalyticAccountId(e.target.value);
                setErrors(prev => ({ ...prev, analyticAccountId: '' }));
              }}
              className={`w-full text-xs bg-gray-50/70 border rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all ${
                errors.analyticAccountId ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200 focus:border-[#6D54B5]'
              }`}
            >
              <option value="">-- Select Analytic Account --</option>
              {analyticAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type})
                </option>
              ))}
            </select>
            {errors.analyticAccountId && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.analyticAccountId}
              </p>
            )}
          </div>

          {/* Period Range (Start & End) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Period Start <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={periodStart}
                  onChange={(e) => {
                    setPeriodStart(e.target.value);
                    setErrors(prev => ({ ...prev, periodStart: '', periodEnd: '' }));
                  }}
                  className={`w-full text-xs bg-gray-50/70 border rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
                    errors.periodStart ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200 focus:border-[#6D54B5]'
                  }`}
                />
              </div>
              {errors.periodStart && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.periodStart}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Period End <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => {
                    setPeriodEnd(e.target.value);
                    setErrors(prev => ({ ...prev, periodEnd: '' }));
                  }}
                  className={`w-full text-xs bg-gray-50/70 border rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
                    errors.periodEnd ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200 focus:border-[#6D54B5]'
                  }`}
                />
              </div>
              {errors.periodEnd && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.periodEnd}
                </p>
              )}
            </div>
          </div>

          {/* Planned Amount (>= 0) */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Planned Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={plannedAmount}
                onChange={(e) => {
                  setPlannedAmount(e.target.value);
                  setErrors(prev => ({ ...prev, plannedAmount: '' }));
                }}
                placeholder="0.00"
                className={`w-full pl-8 pr-4 py-2.5 text-xs bg-gray-50/70 border rounded-xl text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all ${
                  errors.plannedAmount ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200 focus:border-[#6D54B5]'
                }`}
              />
            </div>
            {errors.plannedAmount && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.plannedAmount}
              </p>
            )}
          </div>

          {/* Responsible Person (from existing app users) */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Responsible Person <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-2">
              <select
                value={responsiblePerson}
                onChange={(e) => {
                  setResponsiblePerson(e.target.value);
                  setErrors(prev => ({ ...prev, responsiblePerson: '' }));
                }}
                className={`w-full text-xs bg-gray-50/70 border rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all ${
                  errors.responsiblePerson ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200 focus:border-[#6D54B5]'
                }`}
              >
                <option value="">-- Select Responsible User --</option>
                {responsibleUsers.map((u) => (
                  <option key={u.id} value={`${u.name} (${u.role})`}>
                    {u.name} — {u.role} ({u.email})
                  </option>
                ))}
              </select>

              {/* Or allow typing custom responsible person if needed */}
              <input
                type="text"
                value={responsiblePerson}
                onChange={(e) => {
                  setResponsiblePerson(e.target.value);
                  setErrors(prev => ({ ...prev, responsiblePerson: '' }));
                }}
                placeholder="Or type responsible person name..."
                className="w-full text-xs bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#6D54B5]"
              />
            </div>
            {errors.responsiblePerson && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.responsiblePerson}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Notes / Objectives <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Budget objectives, department allocations, or assumptions..."
              className="w-full text-xs bg-gray-50/70 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#6D54B5] transition-all"
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
            className="px-5 py-2 text-xs font-bold text-white bg-[#6D54B5] hover:bg-[#5B4599] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Budget...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Save Changes' : 'Create Budget'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default BudgetFormModal;
