import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, Loader2, Power, ShieldAlert } from 'lucide-react';
import { Account, AccountStatus } from '../../types/account';

interface AccountDeactivateModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  onConfirm: (account: Account, newStatus: AccountStatus) => Promise<void>;
}

export const AccountDeactivateModal: React.FC<AccountDeactivateModalProps> = ({
  isOpen,
  onClose,
  account,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  if (!isOpen || !account) return null;

  const isCurrentlyActive = account.status === 'ACTIVE';
  const targetStatus: AccountStatus = isCurrentlyActive ? 'INACTIVE' : 'ACTIVE';

  const handleConfirm = async () => {
    setLoading(true);
    setApiError(null);
    try {
      await onConfirm(account, targetStatus);
      onClose();
    } catch (err: any) {
      setApiError(err?.message || 'Failed to update account status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 overflow-hidden">
        {/* Modal Header Icon */}
        <div className="flex items-center justify-between pb-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isCurrentlyActive ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
            }`}
          >
            {isCurrentlyActive ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-2 space-y-3">
          <h3 className="text-base font-bold text-gray-900">
            {isCurrentlyActive ? 'Deactivate Account?' : 'Reactivate Account?'}
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            {isCurrentlyActive ? (
              <>
                Are you sure you want to deactivate{' '}
                <strong className="text-gray-900 font-semibold">{account.name}</strong>? Its status will become{' '}
                <strong className="text-amber-700">INACTIVE</strong>.
              </>
            ) : (
              <>
                Are you sure you want to reactivate{' '}
                <strong className="text-gray-900 font-semibold">{account.name}</strong>? Its status will become{' '}
                <strong className="text-green-700">ACTIVE</strong> and will be available for financial posting.
              </>
            )}
          </p>

          {/* Critical Accounting Audit Notice */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
            <div className="leading-tight">
              <span className="font-semibold block mb-0.5">Audit Trail & Historical Integrity</span>
              In accordance with standard accounting principles, ledger accounts are never hard-deleted. Historical journal entries and trial balance reports remain 100% intact.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs flex justify-between items-center text-gray-700">
            <span className="text-gray-500">Target Status:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-md ${
                isCurrentlyActive
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {targetStatus}
            </span>
          </div>

          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {apiError}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 ${
              isCurrentlyActive
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating Status...</span>
              </>
            ) : (
              <>
                <Power className="w-3.5 h-3.5" />
                <span>{isCurrentlyActive ? 'Confirm Deactivate' : 'Confirm Reactivate'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
