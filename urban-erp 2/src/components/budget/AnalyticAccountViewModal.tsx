import React from 'react';
import { X, Layers, Calendar, Clock, CheckCircle2, AlertCircle, Tag, FileText } from 'lucide-react';
import { AnalyticAccount } from '../../types/budget';

interface AnalyticAccountViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AnalyticAccount | null;
  onEdit?: (account: AnalyticAccount) => void;
}

export const AnalyticAccountViewModal: React.FC<AnalyticAccountViewModalProps> = ({
  isOpen,
  onClose,
  account,
  onEdit
}) => {
  if (!isOpen || !account) return null;

  const isIncome = account.type === 'INCOME';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50/80 to-white">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${
              isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
            }`}>
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{account.name}</h2>
              <span className="text-xs text-gray-400">Analytic Account #{account.id}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Badges Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/60">
              <span className="text-[10px] uppercase font-semibold text-gray-400 block mb-1">Type</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold ${
                isIncome 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-orange-50 text-orange-700 border border-orange-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isIncome ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                {account.type}
              </span>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/60">
              <span className="text-[10px] uppercase font-semibold text-gray-400 block mb-1">Status</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold ${
                account.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                {account.status === 'ACTIVE' ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-gray-400" />
                )}
                {account.status}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Description
            </span>
            <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-200/60 text-gray-700 leading-relaxed">
              {account.description || 'No additional description provided.'}
            </div>
          </div>

          {/* Timestamps */}
          <div className="pt-2 border-t border-gray-100 space-y-1.5 text-gray-500 text-[11px]">
            {account.createdAt && (
              <div className="flex items-center justify-between">
                <span>Created At</span>
                <span className="font-medium text-gray-700">
                  {new Date(account.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
            {account.updatedAt && (
              <div className="flex items-center justify-between">
                <span>Last Updated</span>
                <span className="font-medium text-gray-700">
                  {new Date(account.updatedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Close
          </button>
          {onEdit && (
            <button
              onClick={() => {
                onClose();
                onEdit(account);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-[#6D54B5] hover:bg-[#5B4599] rounded-xl shadow-xs transition-colors"
            >
              Edit Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default AnalyticAccountViewModal;
