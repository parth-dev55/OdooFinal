import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Layers, 
  Search, 
  Filter, 
  Plus, 
  RotateCw, 
  Eye, 
  Edit, 
  Power, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Briefcase, 
  Building2 
} from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import { AnalyticAccount, AnalyticAccountType, AnalyticAccountStatus } from '../../types/budget';
import { analyticAccountService } from '../../services/analyticAccountService';
import { AnalyticAccountFormModal } from '../../components/budget/AnalyticAccountFormModal';
import { AnalyticAccountViewModal } from '../../components/budget/AnalyticAccountViewModal';
import { useAuth } from '../../contexts/AuthContext';

export const AnalyticAccountsPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<AnalyticAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [accountToEdit, setAccountToEdit] = useState<AnalyticAccount | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [viewAccount, setViewAccount] = useState<AnalyticAccount | null>(null);

  const [deactivatingId, setDeactivatingId] = useState<string | number | null>(null);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const data = await analyticAccountService.getAnalyticAccounts();
      setAccounts(data);
    } catch (err: any) {
      console.warn('Notice while fetching analytic accounts:', err?.message || err);
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

  // Status toggle (Deactivate or Activate) without hard deleting
  const handleToggleStatus = async (account: AnalyticAccount) => {
    const nextStatus: AnalyticAccountStatus = account.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    setDeactivatingId(account.id);
    try {
      await analyticAccountService.updateStatus(account.id, nextStatus);
      triggerToast(
        `Analytic Account "${account.name}" ${nextStatus === 'ARCHIVED' ? 'deactivated' : 'activated'} successfully.`,
        'success'
      );
      await fetchAccounts();
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to update account status.', 'error');
    } finally {
      setDeactivatingId(null);
    }
  };

  // Filtered list
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchesSearch = 
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (acc.description && acc.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        String(acc.id).toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'ALL' || acc.type === selectedType;
      const matchesStatus = selectedStatus === 'ALL' || acc.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [accounts, searchQuery, selectedType, selectedStatus]);

  // Metrics
  const incomeCount = accounts.filter(a => a.type === 'INCOME').length;
  const expenseCount = accounts.filter(a => a.type === 'EXPENSE').length;
  const activeCount = accounts.filter(a => a.status === 'ACTIVE').length;

  return (
    <div className="flex h-screen bg-[#FDFBF7] font-sans antialiased text-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Toast Notification */}
          {toastMessage && (
            <div
              className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold animate-in slide-in-from-top-2 duration-200 ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{toastMessage.message}</span>
              <button
                onClick={() => setToastMessage(null)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Module Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
            <Link
              to="/budget"
              className="px-4 py-2 text-xs font-bold rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span>Budgets</span>
            </Link>

            <Link
              to="/budget/analytic-accounts"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#6D54B5] text-white shadow-xs flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Analytic Accounts</span>
            </Link>
          </div>

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Analytic Accounts
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Group and monitor income or expenses for projects, departments, or cost centers.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={fetchAccounts}
                disabled={loading}
                className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 shadow-xs transition-colors"
                title="Refresh accounts"
              >
                <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#6D54B5]' : ''}`} />
              </button>

              <button
                onClick={() => {
                  setAccountToEdit(null);
                  setIsFormModalOpen(true);
                }}
                className="bg-[#6D54B5] hover:bg-[#5B4599] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Analytic Account</span>
              </button>
            </div>
          </div>

          {/* Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                Total Accounts
              </span>
              <p className="text-xl font-black text-gray-900">{accounts.length}</p>
              <span className="text-[10px] text-gray-500 mt-0.5 block">{activeCount} active in system</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-emerald-600 block mb-1">
                Income Cost Centers
              </span>
              <p className="text-xl font-black text-emerald-700">{incomeCount}</p>
              <span className="text-[10px] text-gray-500 mt-0.5 block">Revenue allocations</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-orange-600 block mb-1">
                Expense Cost Centers
              </span>
              <p className="text-xl font-black text-orange-700">{expenseCount}</p>
              <span className="text-[10px] text-gray-500 mt-0.5 block">Operating budgets</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-purple-600 block mb-1">
                Active Ratio
              </span>
              <p className="text-xl font-black text-[#6D54B5]">
                {accounts.length > 0 ? Math.round((activeCount / accounts.length) * 100) : 0}%
              </p>
              <span className="text-[10px] text-gray-500 mt-0.5 block">Audit compliance</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by account name or ID..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#6D54B5] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Selectors */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="ALL">All Types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Deactivated (Archived)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-200 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                    <th className="py-3.5 px-6">Name</th>
                    <th className="py-3.5 px-6">Type</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RotateCw className="w-5 h-5 animate-spin text-[#6D54B5]" />
                          <span>Loading analytic accounts...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Layers className="w-8 h-8 text-gray-300" />
                          <p className="font-semibold text-gray-600">No analytic accounts found</p>
                          <p className="text-[11px] text-gray-400">
                            {searchQuery || selectedType !== 'ALL' || selectedStatus !== 'ALL'
                              ? 'Try adjusting your search or filters.'
                              : 'Create your first analytic account to start grouping project revenues & expenses.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map((acc) => {
                      const isIncome = acc.type === 'INCOME';
                      const isActive = acc.status === 'ACTIVE';

                      return (
                        <tr key={acc.id} className="hover:bg-gray-50/60 transition-colors">
                          {/* Name */}
                          <td className="py-4 px-6">
                            <div className="font-bold text-gray-900">{acc.name}</div>
                            {acc.description && (
                              <p className="text-[11px] text-gray-400 truncate max-w-sm">
                                {acc.description}
                              </p>
                            )}
                          </td>

                          {/* Type */}
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                isIncome
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-orange-50 text-orange-700 border border-orange-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isIncome ? 'bg-emerald-500' : 'bg-orange-500'
                                }`}
                              />
                              {acc.type}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}
                            >
                              {isActive ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <AlertCircle className="w-3 h-3 text-gray-400" />
                              )}
                              {acc.status}
                            </span>
                          </td>

                          {/* Actions: View, Edit, Deactivate */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View */}
                              <button
                                onClick={() => {
                                  setViewAccount(acc);
                                  setIsViewModalOpen(true);
                                }}
                                className="p-1.5 text-gray-500 hover:text-[#6D54B5] hover:bg-purple-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => {
                                  setAccountToEdit(acc);
                                  setIsFormModalOpen(true);
                                }}
                                className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Edit Account"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              {/* Deactivate / Activate */}
                              <button
                                onClick={() => handleToggleStatus(acc)}
                                disabled={deactivatingId === acc.id}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isActive
                                    ? 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                                    : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                                title={isActive ? 'Deactivate Account' : 'Activate Account'}
                              >
                                {deactivatingId === acc.id ? (
                                  <RotateCw className="w-4 h-4 animate-spin text-gray-400" />
                                ) : (
                                  <Power className="w-4 h-4" />
                                )}
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

            {/* Table Footer */}
            <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
              <span>Showing {filteredAccounts.length} of {accounts.length} analytic accounts</span>
              <span className="text-[11px] text-gray-400">Historical records safely preserved</span>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <AnalyticAccountFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={(msg) => {
          triggerToast(msg, 'success');
          fetchAccounts();
        }}
        accountToEdit={accountToEdit}
      />

      <AnalyticAccountViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        account={viewAccount}
        onEdit={(acc) => {
          setAccountToEdit(acc);
          setIsFormModalOpen(true);
        }}
      />
    </div>
  );
};
export default AnalyticAccountsPage;
