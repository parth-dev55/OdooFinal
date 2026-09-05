import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Tag, 
  BookOpen, 
  Edit3, 
  Power, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Info,
  Clock
} from 'lucide-react';
import { Account, AccountType } from '../../types/account';

interface AccountViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  onEdit: (account: Account) => void;
  onToggleStatus: (account: Account) => void;
}

const TYPE_CONFIG: Record<AccountType, { label: string; badgeClass: string; nature: string; normalBalance: string }> = {
  ASSET: {
    label: 'Asset',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    nature: 'Debit Normal Balance (Increases with Debit, Decreases with Credit)',
    normalBalance: 'Debit',
  },
  LIABILITY: {
    label: 'Liability',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    nature: 'Credit Normal Balance (Increases with Credit, Decreases with Debit)',
    normalBalance: 'Credit',
  },
  CAPITAL: {
    label: 'Capital',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    nature: 'Credit Normal Balance (Owner Equity / Invested Capital)',
    normalBalance: 'Credit',
  },
  INCOME: {
    label: 'Income',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    nature: 'Credit Normal Balance (Revenue / Sales Increases)',
    normalBalance: 'Credit',
  },
  EXPENSE: {
    label: 'Expense',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    nature: 'Debit Normal Balance (Operating Expenses & Direct Costs)',
    normalBalance: 'Debit',
  },
};

export const AccountViewModal: React.FC<AccountViewModalProps> = ({
  isOpen,
  onClose,
  account,
  onEdit,
  onToggleStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'ledger'>('details');

  if (!isOpen || !account) return null;

  const typeConfig = TYPE_CONFIG[account.type] || TYPE_CONFIG.ASSET;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-[#6D54B5] flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">{account.name}</h2>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    account.status === 'ACTIVE'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {account.status === 'ACTIVE' ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {account.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mt-0.5">
                <span>ID: {account.id}</span>
                {account.code && <span>• Code: {account.code}</span>}
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

        {/* View Navigation Tabs */}
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
            Account Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'ledger'
                ? 'border-[#6D54B5] text-[#6D54B5]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Ledger & History</span>
            <span className="text-[10px] bg-purple-100 text-[#6D54B5] px-1.5 py-0.2 rounded-full font-medium">
              Prepared
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto py-4 space-y-4 flex-1">
          {activeTab === 'details' ? (
            <>
              {/* Account Type Classification Card */}
              <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Account Classification
                  </span>
                  <span
                    className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${typeConfig.badgeClass}`}
                  >
                    {account.type}
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {typeConfig.nature}
                </p>

                <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs text-gray-600">
                  <span className="text-gray-500">Normal Balance:</span>
                  <span className="font-semibold text-gray-800">{typeConfig.normalBalance}</span>
                </div>
              </div>

              {/* Description Card */}
              {account.description && (
                <div className="p-3.5 bg-white rounded-xl border border-gray-200">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Description & Purpose
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {account.description}
                  </p>
                </div>
              )}

              {/* Account Properties */}
              <div className="p-3.5 bg-gray-50/40 rounded-xl border border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-400">Account Name:</span>
                  <span className="font-semibold text-gray-900">{account.name}</span>
                </div>
                {account.code && (
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-400">General Ledger Code:</span>
                    <span className="font-mono text-gray-800 font-semibold">{account.code}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-400">Account Status:</span>
                  <span className={`font-semibold ${account.status === 'ACTIVE' ? 'text-green-700' : 'text-gray-600'}`}>
                    {account.status}
                  </span>
                </div>
                {account.createdAt && (
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Created Date:
                    </span>
                    <span className="text-gray-700">
                      {new Date(account.createdAt).toLocaleDateString(undefined, {
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
            /* Future Ledger / History Prepared Section */
            <div className="space-y-3">
              <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl flex items-start gap-3">
                <Info className="w-5 h-5 text-[#6D54B5] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-700 leading-relaxed">
                  <strong className="block font-semibold text-[#6D54B5] mb-0.5">
                    General Ledger Integration Ready
                  </strong>
                  This account is hooked to the chart of accounts master registry. When transactions, invoices, or journal entries are posted to <span className="font-semibold">{account.name}</span>, debit and credit lines will automatically aggregate here.
                </div>
              </div>

              <div className="p-6 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 text-center space-y-2">
                <BookOpen className="w-8 h-8 text-gray-300 mx-auto" />
                <h4 className="text-xs font-bold text-gray-700">No Journal Entries Posted Yet</h4>
                <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                  Historical journal entries will be listed chronologically with reference numbers, debit amounts, credit amounts, and running balances.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
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
              onToggleStatus(account);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              account.status === 'ACTIVE'
                ? 'border-red-200 text-red-600 hover:bg-red-50'
                : 'border-green-200 text-green-600 hover:bg-green-50'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {account.status === 'ACTIVE' ? 'Deactivate Account' : 'Reactivate Account'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(account);
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
