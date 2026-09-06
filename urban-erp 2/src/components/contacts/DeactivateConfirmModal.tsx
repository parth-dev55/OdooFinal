import { useState } from 'react';
import { Contact } from '../../types/contact';
import { AlertTriangle, Loader2, X, CheckCircle2 } from 'lucide-react';

interface DeactivateConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onConfirm: (contact: Contact, newStatus: 'ACTIVE' | 'INACTIVE') => Promise<void>;
}

export default function DeactivateConfirmModal({
  isOpen,
  onClose,
  contact,
  onConfirm
}: DeactivateConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !contact) return null;

  const isDeactivating = contact.status === 'ACTIVE';
  const targetStatus = isDeactivating ? 'INACTIVE' : 'ACTIVE';

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      await onConfirm(contact, targetStatus);
      onClose();
    } catch (err: any) {
      setError(err?.message || `Failed to update status. Please verify backend service.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isDeactivating ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
            }`}>
              {isDeactivating ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-lg font-bold text-gray-900">
            {isDeactivating ? 'Deactivate Contact' : 'Reactivate Contact'}
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            {isDeactivating ? (
              <>
                Are you sure you want to deactivate <strong className="text-gray-900">{contact.name}</strong>?
                This will change their status to <span className="font-semibold text-gray-800">INACTIVE</span>. The contact will not be deleted and can be reactivated anytime.
              </>
            ) : (
              <>
                Are you sure you want to reactivate <strong className="text-gray-900">{contact.name}</strong>?
                This will restore their status to <span className="font-semibold text-green-700">ACTIVE</span>.
              </>
            )}
          </p>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all flex items-center gap-2 shadow-sm ${
                isDeactivating 
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                  : 'bg-green-600 hover:bg-green-700 shadow-green-200'
              } disabled:opacity-60`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isDeactivating ? 'Confirm Deactivate' : 'Confirm Reactivate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
