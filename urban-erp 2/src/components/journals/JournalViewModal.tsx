import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Edit3, 
  Power, 
  Info, 
  Building2, 
  ShoppingCart, 
  CreditCard, 
  Wallet,
  ArrowRight,
  ListOrdered
} from 'lucide-react';
import { Journal, JournalType } from '../../types/journal';
import { Account } from '../../types/account';

interface JournalViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  journal: Journal | null;
  accounts: Account[];
  onEdit: (journal: Journal) => void;
  onToggleStatus: (journal: Journal) => void;
}

const TYPE_CONFIG: Record<JournalType, { label: string; icon: React.ElementType; badgeClass: string; nature: string }> = {
  SALES: {
    label: 'Sales Journal',
    icon: ShoppingCart,
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    nature: 'Records customer invoices, sales debits to accounts receivable, and credit to income accounts.',
  },
  PURCHASE: {
    label: 'Purchase Journal',
    icon: CreditCard,
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    nature: 'Records supplier bills, expense recognition, and credit to accounts payable.',
  },
  BANK: {
    label: 'Bank Journal',
    icon: Building2,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    nature: 'Records electronic bank inflows, vendor wire disbursements, and bank reconciliations.',
  },
  CASH: {
    label: 'Cash Journal',
    icon: Wallet,
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    nature: 'Records cash counter collections, petty cash vouchers, and physical currency movements.',
  },
};

export const JournalViewModal: React.FC<JournalViewModalProps> = ({
  isOpen,
  onClose,
  journal,
  accounts,
  onEdit,
  onToggleStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'entries'>('details');

  if (!isOpen || !journal) return null;

  const typeConfig = TYPE_CONFIG[journal.type] || TYPE_CONFIG.SALES;
  const TypeIcon = typeConfig.icon;

  // Resolve default account details
  const resolvedAccount = accounts.find(a => String(a.id) === String(journal.defaultAccountId));
  const accountName = resolvedAccount?.name || journal.defaultAccountName || 'Unassigned';
  const accountType = resolvedAccount?.type || journal.defaultAccountType || 'ASSET';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-[#6D54B5] flex items-center justify-center font-bold">
              <TypeIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">{journal.name}</h2>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    journal.status === 'ACTIVE'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {journal.status === 'ACTIVE' ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {journal.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mt-0.5">
                <span>ID: {journal.id}</span>
                {journal.code && <span>• Code: {journal.code}</span>}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Tabs */}
        <div className="flex border-b border-gray-100 mt-2">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-[#6D54B5] text-[#6D54B5]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Journal Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('entries')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'entries'
                ? 'border-[#6D54B5] text-[#6D54B5]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>View Journal Entries</span>
            <span className="text-[10px] bg-purple-100 text-[#6D54B5] px-1.5 py-0.2 rounded-full font-medium">
              Prepared
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto py-4 space-y-4 flex-1">
          {activeTab === 'details' ? (
            <>
              {/* Type Classification */}
              <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Journal Type
                  </span>
                  <span
                    className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${typeConfig.badgeClass}`}
                  >
                    {journal.type}
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {typeConfig.nature}
                </p>
              </div>

              {/* Default Account Link Card */}
              <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Default Ledger Account
                </span>
                <div className="flex items-center justify-between p-3 bg-purple-50/30 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-purple-200 text-[#6D54B5] flex items-center justify-center font-bold text-xs">
                      GL
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{accountName}</div>
                      <div className="text-xs text-gray-500 font-mono">
                        Type: {accountType} {resolvedAccount?.code ? `• Code: ${resolvedAccount.code}` : ''}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#6D54B5] px-2.5 py-1 bg-white rounded-lg border border-purple-200">
                    Primary Target
                  </span>
                </div>
              </div>

              {/* Description */}
              {journal.description && (
                <div className="p-3.5 bg-white rounded-xl border border-gray-200">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Description & Scope
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {journal.description}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="p-3.5 bg-gray-50/40 rounded-xl border border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-400">Journal Name:</span>
                  <span className="font-semibold text-gray-900">{journal.name}</span>
                </div>
                {journal.code && (
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-400">Short Code:</span>
                    <span className="font-mono text-gray-800 font-semibold">{journal.code}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-400">Status:</span>
                  <span className={`font-semibold ${journal.status === 'ACTIVE' ? 'text-green-700' : 'text-gray-600'}`}>
                    {journal.status}
                  </span>
                </div>
                {journal.createdAt && (
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Created Date:
                    </span>
                    <span className="text-gray-700">
                      {new Date(journal.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Future: View Journal Entries prepared view */
            <div className="space-y-3">
              <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl flex items-start gap-3">
                <Info className="w-5 h-5 text-[#6D54B5] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-700 leading-relaxed">
                  <strong className="block font-semibold text-[#6D54B5] mb-0.5">
                    View Journal Entries
                  </strong>
                  All double-entry lines and operational transaction batches assigned to <span className="font-semibold">{journal.name}</span> will populate here. Transactions balance against default account <span className="font-semibold">{accountName}</span>.
                </div>
              </div>

              <div className="p-6 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 text-center space-y-2">
                <BookOpen className="w-8 h-8 text-gray-300 mx-auto" />
                <h4 className="text-xs font-bold text-gray-700">No Journal Entries Posted in {journal.name}</h4>
                <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                  When sales invoices, vendor bills, or bank statement lines are committed, their corresponding debit/credit vouchers will appear here.
                </p>
              </div>

              {/* Prepared Entry Summary Columns */}
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Posted Entries</span>
                  <span className="text-sm font-bold text-gray-800">0</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Debits</span>
                  <span className="text-sm font-bold text-gray-800">$0.00</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Credits</span>
                  <span className="text-sm font-bold text-gray-800">$0.00</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              onClose();
              onToggleStatus(journal);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              journal.status === 'ACTIVE'
                ? 'border-red-200 text-red-600 hover:bg-red-50'
                : 'border-green-200 text-green-600 hover:bg-green-50'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {journal.status === 'ACTIVE' ? 'Deactivate Journal' : 'Reactivate Journal'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(journal);
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#6D54B5] hover:bg-[#5C459E] text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
