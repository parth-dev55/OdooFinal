import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  RotateCw, 
  Eye, 
  Edit, 
  Power, 
  CheckCircle2, 
  XCircle, 
  X, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  Building2, 
  Briefcase 
} from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import { Account, AccountType, AccountStatus, CreateAccountDTO, UpdateAccountDTO } from '../../types/account';
import { accountService } from '../../services/accountService';
import { AccountFormModal } from '../../components/accounts/AccountFormModal';
import { AccountViewModal } from '../../components/accounts/AccountViewModal';
import { AccountDeactivateModal } from '../../components/accounts/AccountDeactivateModal';
import { useAuth } from '../../contexts/AuthContext';

export const AccountsPage: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [viewAccount, setViewAccount] = useState<Account | null>(null);

  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState<boolean>(false);
  const [deactivateTarget, setDeactivateTarget] = useState<Account | null>(null);

  // Fetch accounts from backend (with demo/cache fallback)
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const data = await accountService.getAccounts();
      setAccounts(data);
    } catch (err: any) {
      console.warn('Backend notice while fetching accounts:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Modal Triggers
  const handleOpenCreate = () => {
    setActiveAccount(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (account: Account) => {
    setActiveAccount(account);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  const handleOpenView = (account: Account) => {
    setViewAccount(account);
    setIsViewModalOpen(true);
  };

  const handleOpenDeactivate = (account: Account) => {
    setDeactivateTarget(account);
    setIsDeactivateModalOpen(true);
  };

  // Submit Handler (Create or Edit)
  const handleFormSubmit = async (data: CreateAccountDTO | UpdateAccountDTO) => {
    if (formMode === 'create') {
      const newAcc = await accountService.createAccount(data as CreateAccountDTO);
      setAccounts(prev => [newAcc, ...prev]);
      triggerToast(`Account "${newAcc.name}" created successfully.`);
    } else if (activeAccount) {
      const updatedAcc = await accountService.updateAccount(activeAccount.id, data);
      setAccounts(prev => prev.map(a => a.id === activeAccount.id ? (updatedAcc || { ...a, ...data }) : a));
      triggerToast(`Account "${data.name || activeAccount.name}" updated successfully.`);
    }
  };

  // Status Change Handler (Deactivate / Reactivate)
  const handleStatusChange = async (account: Account, newStatus: AccountStatus) => {
    await accountService.updateAccountStatus(account.id, newStatus);
    setAccounts(prev => prev.map(a => a.id === account.id ? { ...a, status: newStatus } : a));
    triggerToast(
      newStatus === 'INACTIVE'
        ? `Account "${account.name}" deactivated.`
        : `Account "${account.name}" reactivated successfully.`
    );
  };

  // Filter & Search Logic
  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      // Search by Account Name (or code)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        (acc.name && acc.name.toLowerCase().includes(q)) ||
        (acc.code && acc.code.toLowerCase().includes(q))
      );

      // Filter by Type (Asset, Liability, Expense, Income, Capital)
      const matchesType = selectedType === 'ALL' || acc.type === selectedType;

      // Filter by Status (Active, Inactive)
      const matchesStatus = selectedStatus === 'ALL' || acc.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [accounts, searchQuery, selectedType, selectedStatus]);

  // Metric stats
  const stats = useMemo(() => {
    const total = accounts.length;
    const assets = accounts.filter(a => a.type === 'ASSET').length;
    const liabilities = accounts.filter(a => a.type === 'LIABILITY').length;
    const incomes = accounts.filter(a => a.type === 'INCOME').length;
    const expenses = accounts.filter(a => a.type === 'EXPENSE').length;
    const capital = accounts.filter(a => a.type === 'CAPITAL').length;
    const active = accounts.filter(a => a.status === 'ACTIVE').length;
    return { total, assets, liabilities, incomes, expenses, capital, active };
  }, [accounts]);

  // Account Type Badge Helper
  const getTypeBadge = (type: AccountType) => {
    switch (type) {
      case 'ASSET':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
            ASSET
          </span>
        );
      case 'LIABILITY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <ArrowDownLeft className="w-3 h-3 text-amber-500" />
            LIABILITY
          </span>
        );
      case 'CAPITAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Building2 className="w-3 h-3 text-purple-500" />
            CAPITAL
          </span>
        );
      case 'INCOME':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <DollarSign className="w-3 h-3 text-blue-500" />
            INCOME
          </span>
        );
      case 'EXPENSE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Briefcase className="w-3 h-3 text-rose-500" />
            EXPENSE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
            {type}
          </span>
        );
    }
  };

  const isFiltered = selectedType !== 'ALL' || selectedStatus !== 'ALL' || searchQuery !== '';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setSelectedStatus('ALL');
  };

  return (
    <div className="flex h-screen bg-[#F8F9FC] overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Chart of Accounts</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage the accounts used to classify your financial transactions.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6D54B5] hover:bg-[#5C459E] text-white rounded-xl text-sm font-semibold shadow-sm shadow-purple-200 transition-all hover:shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Account</span>
                </button>
              </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3.5">
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
                <span className="text-xs font-semibold text-gray-500 block mb-1">Total Accounts</span>
                <span className="text-xl font-bold text-gray-900">{stats.total}</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
                <span className="text-xs font-semibold text-emerald-600 block mb-1">Assets</span>
                <span className="text-xl font-bold text-gray-900">{stats.assets}</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
                <span className="text-xs font-semibold text-amber-600 block mb-1">Liabilities</span>
                <span className="text-xl font-bold text-gray-900">{stats.liabilities}</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
                <span className="text-xs font-semibold text-purple-600 block mb-1">Capital</span>
                <span className="text-xl font-bold text-gray-900">{stats.capital}</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
                <span className="text-xs font-semibold text-blue-600 block mb-1">Income</span>
                <span className="text-xl font-bold text-gray-900">{stats.incomes}</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
                <span className="text-xs font-semibold text-rose-600 block mb-1">Expenses</span>
                <span className="text-xl font-bold text-gray-900">{stats.expenses}</span>
              </div>
            </div>

            {/* Toast Feedback */}
            {toastMessage && (
              <div className={`p-4 rounded-2xl border text-sm flex items-center justify-between shadow-md transition-all ${
                toastMessage.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-900' 
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="font-medium">{toastMessage.message}</span>
                </div>
                <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Top Action Controls: Search & Filter */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Accounts */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search accounts by name or code..."
                    className="w-full pl-10 pr-9 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D54B5] focus:bg-white transition-all text-gray-900"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter & Refresh Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      showFilterMenu || isFiltered
                        ? 'bg-purple-50 text-[#6D54B5] border-purple-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter</span>
                    {isFiltered && (
                      <span className="w-2 h-2 rounded-full bg-[#6D54B5]"></span>
                    )}
                  </button>

                  <button
                    onClick={fetchAccounts}
                    disabled={loading}
                    className="p-2 text-gray-500 hover:text-[#6D54B5] hover:bg-purple-50 rounded-xl border border-gray-200 transition-colors"
                    title="Refresh accounts list"
                  >
                    <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#6D54B5]' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Expandable Filter Panel */}
              {showFilterMenu && (
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs">
                  {/* Type Filter Buttons (Asset, Liability, Expense, Income, Capital) */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-gray-500 font-semibold uppercase mr-1">Type:</span>
                    {[
                      { label: 'All', value: 'ALL' },
                      { label: 'Asset', value: 'ASSET' },
                      { label: 'Liability', value: 'LIABILITY' },
                      { label: 'Expense', value: 'EXPENSE' },
                      { label: 'Income', value: 'INCOME' },
                      { label: 'Capital', value: 'CAPITAL' },
                    ].map(f => (
                      <button
                        key={f.value}
                        onClick={() => setSelectedType(f.value)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          selectedType === f.value
                            ? 'bg-[#6D54B5] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Status Filter Buttons (Active, Inactive) */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-gray-500 font-semibold uppercase mr-1">Status:</span>
                    {[
                      { label: 'All', value: 'ALL' },
                      { label: 'Active', value: 'ACTIVE' },
                      { label: 'Inactive', value: 'INACTIVE' },
                    ].map(s => (
                      <button
                        key={s.value}
                        onClick={() => setSelectedStatus(s.value)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          selectedStatus === s.value
                            ? 'bg-[#6D54B5] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {/* Reset Filters Link */}
                  {isFiltered && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-[#6D54B5] hover:underline font-semibold ml-auto"
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Accounts Table */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4 sm:px-6">Account Name</th>
                      <th className="py-3.5 px-4">Account Type</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4">Created Date</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {loading && accounts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-gray-400">
                          <RotateCw className="w-6 h-6 animate-spin mx-auto text-[#6D54B5] mb-2" />
                          <span>Loading Chart of Accounts from PostgreSQL...</span>
                        </td>
                      </tr>
                    ) : filteredAccounts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-gray-500">
                          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-base font-semibold text-gray-700">No accounts found</p>
                          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                            {isFiltered
                              ? 'No accounts match your search or filter criteria. Try resetting filters.'
                              : 'No ledger accounts configured yet. Click "+ Add Account" to create an account.'}
                          </p>
                          {isFiltered ? (
                            <button
                              onClick={resetFilters}
                              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
                            >
                              Clear All Filters
                            </button>
                          ) : (
                            <button
                              onClick={handleOpenCreate}
                              className="mt-4 px-4 py-2 bg-[#6D54B5] hover:bg-[#5C459E] text-white text-xs font-semibold rounded-xl transition-colors"
                            >
                              + Add Account
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredAccounts.map((account) => {
                        return (
                          <tr
                            key={account.id}
                            className="hover:bg-purple-50/20 transition-colors group"
                          >
                            {/* Account Name & Code */}
                            <td className="py-3.5 px-4 sm:px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#6D54B5] flex items-center justify-center font-bold text-xs flex-shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div
                                    onClick={() => handleOpenView(account)}
                                    className="font-semibold text-gray-900 truncate hover:text-[#6D54B5] cursor-pointer"
                                  >
                                    {account.name}
                                  </div>
                                  {account.code ? (
                                    <div className="text-xs text-gray-400 font-mono">
                                      Code: {account.code}
                                    </div>
                                  ) : account.description ? (
                                    <div className="text-xs text-gray-400 truncate max-w-xs">
                                      {account.description}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </td>

                            {/* Account Type */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {getTypeBadge(account.type)}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                  account.status === 'ACTIVE'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-gray-100 text-gray-500 border-gray-200'
                                }`}
                              >
                                {account.status === 'ACTIVE' ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <XCircle className="w-3 h-3" />
                                )}
                                {account.status}
                              </span>
                            </td>

                            {/* Created Date */}
                            <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap text-xs">
                              {account.createdAt ? (
                                <span className="inline-flex items-center gap-1 text-gray-600">
                                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                                  {new Date(account.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>

                            {/* Actions (View, Edit, Deactivate) */}
                            <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* View Action */}
                                <button
                                  onClick={() => handleOpenView(account)}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Account"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* Edit Action */}
                                <button
                                  onClick={() => handleOpenEdit(account)}
                                  className="p-1.5 text-gray-400 hover:text-[#6D54B5] hover:bg-purple-50 rounded-lg transition-colors"
                                  title="Edit Account"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                                {/* Deactivate / Reactivate Action */}
                                <button
                                  onClick={() => handleOpenDeactivate(account)}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    account.status === 'ACTIVE'
                                      ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                                      : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                  }`}
                                  title={account.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
                                >
                                  <Power className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Summary Footer */}
              <div className="px-6 py-3.5 bg-gray-50/60 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
                <span>
                  Showing <strong className="font-semibold text-gray-800">{filteredAccounts.length}</strong> of{' '}
                  <strong className="font-semibold text-gray-800">{accounts.length}</strong> accounts
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  Master Ledger API: /api/accounts
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Form Modal (Add / Edit) */}
      <AccountFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={activeAccount}
        mode={formMode}
        existingAccounts={accounts}
      />

      {/* View Details Modal */}
      <AccountViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        account={viewAccount}
        onEdit={(a) => handleOpenEdit(a)}
        onToggleStatus={(a) => handleOpenDeactivate(a)}
      />

      {/* Deactivate / Reactivate Confirmation Modal */}
      <AccountDeactivateModal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        account={deactivateTarget}
        onConfirm={handleStatusChange}
      />
    </div>
  );
};

export default AccountsPage;
