import React, { useState, useEffect } from 'react';
import { X, Layers, AlertCircle, CheckCircle2, RotateCw } from 'lucide-react';
import { AnalyticAccount, AnalyticAccountType, CreateAnalyticAccountDto, UpdateAnalyticAccountDto } from '../../types/budget';
import { analyticAccountService } from '../../services/analyticAccountService';
import { useAuth } from '../../contexts/AuthContext';

interface AnalyticAccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  accountToEdit?: AnalyticAccount | null;
}

export const AnalyticAccountFormModal: React.FC<AnalyticAccountFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  accountToEdit
}) => {
  const { profile } = useAuth();
  const isEditing = Boolean(accountToEdit);

  const [name, setName] = useState<string>('');
  const [type, setType] = useState<AnalyticAccountType>('EXPENSE');
  const [description, setDescription] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (accountToEdit) {
        setName(accountToEdit.name);
        setType(accountToEdit.type);
        setDescription(accountToEdit.description || '');
      } else {
        setName('');
        setType('EXPENSE');
        setDescription('');
      }
      setErrors({});
    }
  }, [isOpen, accountToEdit]);

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!name.trim()) {
      errs.name = 'Analytic Account Name is required.';
    } else if (name.trim().length < 3) {
      errs.name = 'Account Name must be at least 3 characters.';
    }

    if (!type) {
      errs.type = 'Type is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEditing && accountToEdit) {
        const dto: UpdateAnalyticAccountDto = {
          name: name.trim(),
          type,
          description: description.trim()
        };
        await analyticAccountService.updateAnalyticAccount(accountToEdit.id, dto);
        onSuccess(`Analytic Account "${name.trim()}" successfully updated.`);
      } else {
        const dto: CreateAnalyticAccountDto = {
          name: name.trim(),
          type,
          description: description.trim()
        };
        await analyticAccountService.createAnalyticAccount(dto, profile);
        onSuccess(`Analytic Account "${name.trim()}" successfully created.`);
      }
      onClose();
    } catch (err: any) {
      setErrors(prev => ({
        ...prev,
        form: err?.message || 'Failed to save analytic account. Please check inputs.'
      }));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full flex flex-col shadow-2xl border border-gray-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50/80 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D54B5] flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                {isEditing ? 'Edit Analytic Account' : '+ Add Analytic Account'}
              </h2>
              <p className="text-xs text-gray-500">
                Group and monitor income or expenses for projects or cost centers
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          {errors.form && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Account Name */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Analytic Account Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors(prev => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Living Room Launch, Warehouse Logistics, Q3 Marketing"
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

          {/* Type Selection */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType('EXPENSE');
                  setErrors(prev => ({ ...prev, type: '' }));
                }}
                className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  type === 'EXPENSE'
                    ? 'bg-orange-50 text-orange-700 border-orange-300 ring-2 ring-orange-500/20 shadow-xs'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span>EXPENSE</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('INCOME');
                  setErrors(prev => ({ ...prev, type: '' }));
                }}
                className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  type === 'INCOME'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>INCOME</span>
              </button>
            </div>
            {errors.type && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.type}
              </p>
            )}
            <p className="text-[11px] text-gray-400 mt-1.5">
              Expense accounts track department or project disbursements; Income accounts track revenue targets.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Description <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context on projects, cost centers, or business units..."
              className="w-full text-xs bg-gray-50/70 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#6D54B5] transition-all"
            />
          </div>
        </form>

        {/* Footer */}
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
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Save Changes' : 'Create Analytic Account'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default AnalyticAccountFormModal;
