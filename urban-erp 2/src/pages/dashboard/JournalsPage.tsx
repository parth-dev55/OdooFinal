import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
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
  ShoppingCart, 
  CreditCard, 
  Building2, 
  Wallet,
  Tag
} from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import { Journal, JournalType, JournalStatus, CreateJournalDTO, UpdateJournalDTO } from '../../types/journal';
import { Account } from '../../types/account';
import { journalService } from '../../services/journalService';
import { accountService } from '../../services/accountService';
import { JournalFormModal } from '../../components/journals/JournalFormModal';
import { JournalViewModal } from '../../components/journals/JournalViewModal';
import { JournalDeactivateModal } from '../../components/journals/JournalDeactivateModal';
import { useAuth } from '../../contexts/AuthContext';

export const JournalsPage: React.FC = () => {
  const { user } = useAuth();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingAccounts, setLoadingAccounts] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [activeJournal, setActiveJournal] = useState<Journal | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [viewJournal, setViewJournal] = useState<Journal | null>(null);

  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState<boolean>(false);
  const [deactivateTarget, setDeactivateTarget] = useState<Journal | null>(null);

  // Fetch Chart of Accounts data for account dropdown resolution
  const fetchAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const data = await accountService.getAccounts();
      setAccounts(data);
    } catch (err: any) {
      console.warn('Backend notice while fetching accounts for journals:', err?.message || err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Fetch journals from PostgreSQL / backend
  const fetchJournals = async () => {
    setLoading(true);
    try {
      const data = await journalService.getJournals();
      setJournals(data);
    } catch (err: any) {
      console.warn('Backend notice while fetching journals:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
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
    setActiveJournal(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (journal: Journal) => {
    setActiveJournal(journal);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  const handleOpenView = (journal: Journal) => {
    setViewJournal(journal);
    setIsViewModalOpen(true);
  };

  const handleOpenDeactivate = (journal: Journal) => {
    setDeactivateTarget(journal);
    setIsDeactivateModalOpen(true);
  };

  // Submit Handler (Create or Edit)
  const handleFormSubmit = async (data: CreateJournalDTO | UpdateJournalDTO) => {
    if (formMode === 'create') {
      const newJournal = await journalService.createJournal(data as CreateJournalDTO);
      setJournals(prev => [newJournal, ...prev]);
      triggerToast(`Journal "${newJournal.name}" created successfully.`);
    } else if (activeJournal) {
      const updatedJournal = await journalService.updateJournal(activeJournal.id, data);
      setJournals(prev => prev.map(j => j.id === activeJournal.id ? (updatedJournal || { ...j, ...data }) : j));
      triggerToast(`Journal "${data.name || activeJournal.name}" updated successfully.`);
    }
  };

  // Status Change Handler (Deactivate / Reactivate)
  const handleStatusChange = async (journal: Journal, newStatus: JournalStatus) => {
    await journalService.updateJournalStatus(journal.id, newStatus);
    setJournals(prev => prev.map(j => j.id === journal.id ? { ...j, status: newStatus } : j));
    triggerToast(
      newStatus === 'INACTIVE'
        ? `Journal "${journal.name}" deactivated.`
        : `Journal "${journal.name}" reactivated successfully.`
    );
  };

  // Helper to resolve Account details for a given Journal
  const getAccountDisplay = (journal: Journal) => {
    const acc = accounts.find(a => String(a.id) === String(journal.defaultAccountId));
    if (acc) {
      return {
        name: acc.name,
        type: acc.type,
      };
    }
    return {
      name: journal.defaultAccountName || 'Unassigned',
      type: journal.defaultAccountType || 'ASSET',
    };
  };

  // Filter & Search Logic
  const filteredJournals = useMemo(() => {
    return journals.filter(jrn => {
      // Search by Journal Name or code
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        (jrn.name && jrn.name.toLowerCase().includes(q)) ||
        (jrn.code && jrn.code.toLowerCase().includes(q))
      );

      // Filter by Type (Sales, Purchase, Bank, Cash)
      const matchesType = selectedType === 'ALL' || jrn.type === selectedType;

      // Filter by Status (Active, Inactive)
      const matchesStatus = selectedStatus === 'ALL' || jrn.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [journals, searchQuery, selectedType, selectedStatus]);

  // Metric stats
  const stats = useMemo(() => {
    const total = journals.length;
    const sales = journals.filter(j => j.type === 'SALES').length;
    const purchase = journals.filter(j => j.type === 'PURCHASE').length;
    const bank = journals.filter(j => j.type === 'BANK').length;
    const cash = journals.filter(j => j.type === 'CASH').length;
    const active = journals.filter(j => j.status === 'ACTIVE').length;
    return { total, sales, purchase, bank, cash, active };
  }, [journals]);

  // Journal Type Badge Helper
  const getTypeBadge = (type: JournalType) => {
    switch (type) {
      case 'SALES':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ShoppingCart className="w-3.5 h-3.5 text-blue-500" />
            SALES
          </span>
        );
      case 'PURCHASE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <CreditCard className="w-3.5 h-3.5 text-amber-500" />
            PURCHASE
          </span>
        );
      case 'BANK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Building2 className="w-3.5 h-3.5 text-emerald-500" />
            BANK
          </span>
        );
      case 'CASH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Wallet className="w-3.5 h-3.5 text-purple-500" />
            CASH
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
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Journals</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Organize sales, purchase, bank and cash accounting activity.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6D54B5] hover:bg-[#5C459E] text-white rounded-xl text-sm font-semibold shadow-sm shadow-purple-200 transition-all hover:shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Journal</span>
                </button>
              </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3.5">
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
                <span className="text-xs font-semibold text-gray-500 block mb-1">Total Journals</span>
                <span className="text-xl font-bold text-gray-900">{stats.total}</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
                <span className="text-xs font-semibold text-blue-600 block mb-1">Sales</span>
                <span className="text-xl font-bold text-gray-900">{stats.sales}</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
                <span className="text-xs font-semibold text-amber-600 block mb-1">Purchase</span>
                <span className="text-xl font-bold text-gray-900">{stats.purchase}</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
                <span className="text-xs font-semibold text-emerald-600 block mb-1">Bank</span>
                <span className="text-xl font-bold text-gray-900">{stats.bank}</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
                <span className="text-xs font-semibold text-purple-600 block mb-1">Cash</span>
                <span className="text-xl font-bold text-gray-900">{stats.cash}</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
                <span className="text-xs font-semibold text-green-600 block mb-1">Active</span>
                <span className="text-xl font-bold text-gray-900">{stats.active}</span>
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
                {/* Search Journals */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search journals by name or code..."
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
                    onClick={() => {
                      fetchJournals();
                      fetchAccounts();
                    }}
                    disabled={loading}
                    className="p-2 text-gray-500 hover:text-[#6D54B5] hover:bg-purple-50 rounded-xl border border-gray-200 transition-colors"
                    title="Refresh journals list"
                  >
                    <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#6D54B5]' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Expandable Filter Panel */}
              {showFilterMenu && (
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs">
                  {/* Type Filter Buttons (Sales, Purchase, Bank, Cash) */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-gray-500 font-semibold uppercase mr-1">Type:</span>
                    {[
                      { label: 'All', value: 'ALL' },
                      { label: 'Sales', value: 'SALES' },
                      { label: 'Purchase', value: 'PURCHASE' },
                      { label: 'Bank', value: 'BANK' },
                      { label: 'Cash', value: 'CASH' },
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

            {/* Journals Table */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4 sm:px-6">Journal Name</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Default Account</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4">Created Date</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {loading && journals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400">
                          <RotateCw className="w-6 h-6 animate-spin mx-auto text-[#6D54B5] mb-2" />
                          <span>Loading Journals from PostgreSQL...</span>
                        </td>
                      </tr>
                    ) : filteredJournals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-500">
                          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-base font-semibold text-gray-700">No journals found</p>
                          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                            {isFiltered
                              ? 'No journals match your search or filter criteria. Try resetting filters.'
                              : 'No journals configured yet. Click "+ Add Journal" to create your first accounting journal.'}
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
                              + Add Journal
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredJournals.map((journal) => {
                        const accInfo = getAccountDisplay(journal);

                        return (
                          <tr
                            key={journal.id}
                            className="hover:bg-purple-50/20 transition-colors group"
                          >
                            {/* Journal Name & Code */}
                            <td className="py-3.5 px-4 sm:px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#6D54B5] flex items-center justify-center font-bold text-xs flex-shrink-0">
                                  <BookOpen className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div
                                    onClick={() => handleOpenView(journal)}
                                    className="font-semibold text-gray-900 truncate hover:text-[#6D54B5] cursor-pointer"
                                  >
                                    {journal.name}
                                  </div>
                                  {journal.code ? (
                                    <div className="text-xs text-gray-400 font-mono">
                                      Code: {journal.code}
                                    </div>
                                  ) : journal.description ? (
                                    <div className="text-xs text-gray-400 truncate max-w-xs">
                                      {journal.description}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </td>

                            {/* Journal Type */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {getTypeBadge(journal.type)}
                            </td>

                            {/* Default Account */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-gray-900 text-xs">
                                  {accInfo.name}
                                </span>
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                  {accInfo.type}
                                </span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                  journal.status === 'ACTIVE'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-gray-100 text-gray-500 border-gray-200'
                                }`}
                              >
                                {journal.status === 'ACTIVE' ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <XCircle className="w-3 h-3" />
                                )}
                                {journal.status}
                              </span>
                            </td>

                            {/* Created Date */}
                            <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap text-xs">
                              {journal.createdAt ? (
                                <span className="inline-flex items-center gap-1 text-gray-600">
                                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                                  {new Date(journal.createdAt).toLocaleDateString(undefined, {
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
                                  onClick={() => handleOpenView(journal)}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Journal"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* Edit Action */}
                                <button
                                  onClick={() => handleOpenEdit(journal)}
                                  className="p-1.5 text-gray-400 hover:text-[#6D54B5] hover:bg-purple-50 rounded-lg transition-colors"
                                  title="Edit Journal"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                                {/* Deactivate / Reactivate Action */}
                                <button
                                  onClick={() => handleOpenDeactivate(journal)}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    journal.status === 'ACTIVE'
                                      ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                                      : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                  }`}
                                  title={journal.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
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
                  Showing <strong className="font-semibold text-gray-800">{filteredJournals.length}</strong> of{' '}
                  <strong className="font-semibold text-gray-800">{journals.length}</strong> journals
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  Master Accounting API: /api/journals
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Form Modal (Add / Edit) */}
      <JournalFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={activeJournal}
        mode={formMode}
        existingJournals={journals}
        availableAccounts={accounts}
        loadingAccounts={loadingAccounts}
      />

      {/* View Details Modal */}
      <JournalViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        journal={viewJournal}
        accounts={accounts}
        onEdit={(j) => handleOpenEdit(j)}
        onToggleStatus={(j) => handleOpenDeactivate(j)}
      />

      {/* Deactivate / Reactivate Confirmation Modal */}
      <JournalDeactivateModal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        journal={deactivateTarget}
        onConfirm={handleStatusChange}
      />
    </div>
  );
};

export default JournalsPage;
