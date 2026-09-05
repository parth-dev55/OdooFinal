import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertCircle, 
  BookOpen, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  Building2, 
  ShoppingCart, 
  CreditCard, 
  Wallet,
  Tag
} from 'lucide-react';
import { Journal, JournalType, CreateJournalDTO, UpdateJournalDTO } from '../../types/journal';
import { Account } from '../../types/account';

interface JournalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateJournalDTO | UpdateJournalDTO) => Promise<void>;
  initialData?: Journal | null;
  mode: 'create' | 'edit';
  existingJournals: Journal[];
  availableAccounts: Account[];
  loadingAccounts?: boolean;
}

interface JournalTypeOption {
  type: JournalType;
  label: string;
  icon: React.ElementType;
  description: string;
  badgeClass: string;
  suggestedAccountType: string;
}

const JOURNAL_TYPE_OPTIONS: JournalTypeOption[] = [
  {
    type: 'SALES',
    label: 'Sales',
    icon: ShoppingCart,
    description: 'Customer invoices, sales receipts, and operating revenue streams.',
    badgeClass: 'text-blue-700 bg-blue-50 border-blue-200',
    suggestedAccountType: 'INCOME',
  },
  {
    type: 'PURCHASE',
    label: 'Purchase',
    icon: CreditCard,
    description: 'Vendor bills, inventory orders, and operational expenditures.',
    badgeClass: 'text-amber-700 bg-amber-50 border-amber-200',
    suggestedAccountType: 'EXPENSE',
  },
  {
    type: 'BANK',
    label: 'Bank',
    icon: Building2,
    description: 'Electronic wire transfers, bank accounts, and merchant payouts.',
    badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    suggestedAccountType: 'ASSET',
  },
  {
    type: 'CASH',
    label: 'Cash',
    icon: Wallet,
    description: 'Petty cash accounts, physical registers, and counter disbursements.',
    badgeClass: 'text-purple-700 bg-purple-50 border-purple-200',
    suggestedAccountType: 'ASSET',
  },
];

export const JournalFormModal: React.FC<JournalFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  existingJournals,
  availableAccounts,
  loadingAccounts = false,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<JournalType>('SALES');
  const [defaultAccountId, setDefaultAccountId] = useState<string>('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setName(initialData.name || '');
      setType(initialData.type || 'SALES');
      setDefaultAccountId(String(initialData.defaultAccountId || ''));
      setCode(initialData.code || '');
      setDescription(initialData.description || '');
    } else {
      setName('');
      setType('SALES');
      // Auto-suggest a default account if available
      const matchingAccount = availableAccounts.find(a => a.status === 'ACTIVE' && a.type === 'INCOME');
      setDefaultAccountId(matchingAccount ? String(matchingAccount.id) : (availableAccounts[0] ? String(availableAccounts[0].id) : ''));
      setCode('');
      setDescription('');
    }
    setErrors({});
    setApiError(null);
  }, [initialData, mode, isOpen, availableAccounts]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      errs.name = 'Journal Name is required';
    } else {
      // Prevent duplicate active journal names
      const isDuplicate = existingJournals.some(
        j =>
          j.status === 'ACTIVE' &&
          j.name.toLowerCase().trim() === trimmedName.toLowerCase() &&
          (mode === 'create' || String(j.id) !== String(initialData?.id))
      );
      if (isDuplicate) {
        errs.name = `An active journal named "${trimmedName}" already exists. Please choose a unique name.`;
      }
    }

    if (!type) {
      errs.type = 'Journal Type is required';
    }

    if (!defaultAccountId) {
      errs.defaultAccountId = 'Default Account is required. Select an account from the Chart of Accounts.';
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
      const selectedAcc = availableAccounts.find(a => String(a.id) === String(defaultAccountId));

      const payload: CreateJournalDTO = {
        name: name.trim(),
        type,
        defaultAccountId,
        code: code.trim() || undefined,
        description: description.trim() || undefined,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setApiError(err?.message || 'Failed to save journal. Please try again.');
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
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {mode === 'create' ? 'Add Journal' : 'Edit Journal'}
              </h2>
              <p className="text-xs text-gray-500">
                {mode === 'create'
                  ? 'Organize financial entries by selecting a journal type and default account'
                  : `Update specifications for ${initialData?.name || 'this journal'}`}
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

          {/* Historical Guard in Edit Mode */}
          {mode === 'edit' && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="font-semibold block text-amber-900">Journal Integrity Guard</strong>
                Modifying journal type or default account affects future entries. Historical journal postings remain safely recorded.
              </div>
            </div>
          )}

          {/* Journal Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Journal Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sales Journal, Main Bank Journal, Petty Cash"
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

          {/* Journal Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Journal Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {JOURNAL_TYPE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = type === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => {
                      setType(opt.type);
                      // Auto-select a recommended account of this type if currently unselected or mismatched
                      const matchingAccount = availableAccounts.find(
                        a => a.status === 'ACTIVE' && a.type === opt.suggestedAccountType
                      );
                      if (matchingAccount && mode === 'create') {
                        setDefaultAccountId(String(matchingAccount.id));
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#6D54B5] bg-purple-50/50 ring-1 ring-[#6D54B5]'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-lg ${isSelected ? 'bg-[#6D54B5] text-white' : 'bg-gray-100 text-gray-600'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-xs font-bold ${isSelected ? 'text-[#6D54B5]' : 'text-gray-900'}`}>
                          {opt.label}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#6D54B5]" />}
                    </div>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border inline-block w-fit ${opt.badgeClass}`}>
                      {opt.suggestedAccountType}
                    </span>
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

          {/* Default Account (Loaded from Chart of Accounts) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Default Account <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-gray-400">From Chart of Accounts</span>
            </div>

            {loadingAccounts ? (
              <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6D54B5]" />
                <span>Loading Chart of Accounts...</span>
              </div>
            ) : (
              <select
                value={defaultAccountId}
                onChange={(e) => setDefaultAccountId(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 ${
                  errors.defaultAccountId
                    ? 'border-red-300 focus:ring-red-400 bg-red-50/30'
                    : 'border-gray-200 focus:ring-[#6D54B5]'
                }`}
              >
                <option value="">-- Select Default Account --</option>
                {availableAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type}) {acc.code ? `• ${acc.code}` : ''} {acc.status === 'INACTIVE' ? '[Inactive]' : ''}
                  </option>
                ))}
              </select>
            )}

            {errors.defaultAccountId && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.defaultAccountId}</span>
              </p>
            )}
            <p className="mt-1 text-[11px] text-gray-400">
              Transactions posted to this journal will automatically balance against this default ledger account.
            </p>
          </div>

          {/* Code & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Short Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. SJ-01, BK-01"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6D54B5] text-gray-900 font-mono uppercase"
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
                placeholder="Business purpose or scope notes"
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
                <span>Saving Journal...</span>
              </>
            ) : (
              <span>Save Journal</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
