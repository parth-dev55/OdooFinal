import React, { useState, useEffect } from 'react';
import { X, AlertCircle, FileText, CheckCircle2, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Account, AccountType, CreateAccountDTO, UpdateAccountDTO } from '../../types/account';

interface AccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAccountDTO | UpdateAccountDTO) => Promise<void>;
  initialData?: Account | null;
  mode: 'create' | 'edit';
  existingAccounts: Account[];
}

interface AccountTypeOption {
  type: AccountType;
  label: string;
  category: string;
  description: string;
  badgeClass: string;
  codePrefix: string;
}

const ACCOUNT_TYPE_OPTIONS: AccountTypeOption[] = [
  {
    type: 'ASSET',
    label: 'Asset',
    category: 'Economic Resource',
    description: 'Cash, bank accounts, receivables, and inventory owned by the company.',
    badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    codePrefix: '1000s',
  },
  {
    type: 'LIABILITY',
    label: 'Liability',
    category: 'Obligation',
    description: 'Debts, payables, loans, and financial obligations owed to external parties.',
    badgeClass: 'text-amber-700 bg-amber-50 border-amber-200',
    codePrefix: '2000s',
  },
  {
    type: 'CAPITAL',
    label: 'Capital',
    category: 'Equity',
    description: 'Owners equity, invested funds, retained earnings, and reserves.',
    badgeClass: 'text-purple-700 bg-purple-50 border-purple-200',
    codePrefix: '3000s',
  },
  {
    type: 'INCOME',
    label: 'Income',
    category: 'Revenue',
    description: 'Gross revenue generated from sales, service delivery, or consulting.',
    badgeClass: 'text-blue-700 bg-blue-50 border-blue-200',
    codePrefix: '4000s',
  },
  {
    type: 'EXPENSE',
    label: 'Expense',
    category: 'Cost',
    description: 'Costs incurred in operational activity, inventory purchases, and payroll.',
    badgeClass: 'text-rose-700 bg-rose-50 border-rose-200',
    codePrefix: '5000s',
  },
];

export const AccountFormModal: React.FC<AccountFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  existingAccounts,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('ASSET');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setName(initialData.name || '');
      setType(initialData.type || 'ASSET');
      setCode(initialData.code || '');
      setDescription(initialData.description || '');
    } else {
      setName('');
      setType('ASSET');
      setCode('');
      setDescription('');
    }
    setErrors({});
    setApiError(null);
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      errs.name = 'Account Name is required';
    } else {
      // Prevent duplicate active account names where appropriate
      const isDuplicate = existingAccounts.some(
        acc =>
          acc.status === 'ACTIVE' &&
          acc.name.toLowerCase().trim() === trimmedName.toLowerCase() &&
          (mode === 'create' || String(acc.id) !== String(initialData?.id))
      );
      if (isDuplicate) {
        errs.name = `An active account named "${trimmedName}" already exists. Please choose a unique name.`;
      }
    }

    if (!type) {
      errs.type = 'Account Type is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError(null);

    try {
      const payload: CreateAccountDTO = {
        name: name.trim(),
        type,
        code: code.trim() || undefined,
        description: description.trim() || undefined,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setApiError(err?.message || 'Failed to save account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D54B5] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {mode === 'create' ? 'Add Account' : 'Edit Account'}
              </h2>
              <p className="text-xs text-gray-500">
                {mode === 'create'
                  ? 'Define account title, financial classification, and code'
                  : `Update specifications for ${initialData?.name || 'this account'}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto py-4 space-y-4 flex-1 pr-1">
          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Historical Accounting Guard Notice in Edit Mode */}
          {mode === 'edit' && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="font-semibold block text-amber-900">Accounting Integrity Guard</strong>
                Modifying account properties will update ledger classifications. Historical journal records remain tied to this account ID.
              </div>
            </div>
          )}

          {/* Account Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Account Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Petty Cash, Office Equipment, Accounts Receivable"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? 'border-red-300 focus:ring-red-400 bg-red-50/30 text-gray-900'
                  : 'border-gray-200 focus:ring-[#6D54B5] focus:border-transparent text-gray-900'
              }`}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Account Type Options */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Account Type <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-gray-400">Classification</span>
            </div>

            <div className="space-y-2">
              {ACCOUNT_TYPE_OPTIONS.map((opt) => {
                const isSelected = type === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setType(opt.type)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-[#6D54B5] bg-purple-50/50 ring-1 ring-[#6D54B5]'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isSelected ? 'text-[#6D54B5]' : 'text-gray-900'}`}>
                          {opt.label}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${opt.badgeClass}`}>
                          {opt.category}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {opt.codePrefix}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 leading-tight">
                        {opt.description}
                      </p>
                    </div>
                    <div className="pt-0.5">
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-[#6D54B5]" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-300" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {errors.type && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.type}</span>
              </p>
            )}
          </div>

          {/* Account Code & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Account Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 1010"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6D54B5] text-gray-900 font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Description / Notes
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Operational purpose or classification notes"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6D54B5] text-gray-900"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2.5 bg-[#6D54B5] hover:bg-[#5C459E] text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Account...</span>
              </>
            ) : (
              <span>Save Account</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
