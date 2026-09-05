import { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit2, 
  Ban, 
  CheckCircle2, 
  RotateCw, 
  AlertCircle, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  UserCheck, 
  UserX, 
  Layers,
  X
} from 'lucide-react';
import { Contact, ContactType, ContactStatus, CreateContactDTO, UpdateContactDTO } from '../../types/contact';
import { contactService } from '../../services/contactService';
import ContactFormModal from '../../components/contacts/ContactFormModal';
import ContactViewModal from '../../components/contacts/ContactViewModal';
import DeactivateConfirmModal from '../../components/contacts/DeactivateConfirmModal';
import { Link } from 'react-router-dom';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [activeContact, setActiveContact] = useState<Contact | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [viewContact, setViewContact] = useState<Contact | null>(null);

  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState<boolean>(false);
  const [deactivateTarget, setDeactivateTarget] = useState<Contact | null>(null);

  // Fetch contacts from Spring Boot backend
  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await contactService.getContacts();
      setContacts(data);
    } catch (err: any) {
      console.warn('Backend connection notice:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Show auto-dismissing toast message
  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handlers for Modals
  const handleOpenCreate = () => {
    setActiveContact(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (contact: Contact) => {
    setActiveContact(contact);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  const handleOpenView = (contact: Contact) => {
    setViewContact(contact);
    setIsViewModalOpen(true);
  };

  const handleOpenDeactivate = (contact: Contact) => {
    setDeactivateTarget(contact);
    setIsDeactivateModalOpen(true);
  };

  // Form Submission (Add or Edit)
  const handleFormSubmit = async (data: CreateContactDTO | UpdateContactDTO) => {
    if (formMode === 'create') {
      const newContact = await contactService.createContact(data as CreateContactDTO);
      setContacts(prev => [newContact, ...prev]);
      triggerToast(`Contact "${newContact.name}" added successfully.`);
    } else if (activeContact) {
      const updatedContact = await contactService.updateContact(activeContact.id, data);
      setContacts(prev => prev.map(c => c.id === activeContact.id ? (updatedContact || { ...c, ...data }) : c));
      triggerToast(`Contact "${data.name || activeContact.name}" updated successfully.`);
    }
  };

  // Status toggle (Deactivate/Reactivate)
  const handleStatusChange = async (contact: Contact, newStatus: ContactStatus) => {
    await contactService.updateContactStatus(contact.id, newStatus);
    setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, status: newStatus } : c));
    triggerToast(
      newStatus === 'INACTIVE' 
        ? `Contact "${contact.name}" has been deactivated.` 
        : `Contact "${contact.name}" reactivated successfully.`
    );
  };

  // Filter & Search Logic
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // Search matching Name, Email, or Mobile
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        (contact.name && contact.name.toLowerCase().includes(q)) ||
        (contact.email && contact.email.toLowerCase().includes(q)) ||
        (contact.mobile && contact.mobile.toLowerCase().includes(q)) ||
        (contact.city && contact.city.toLowerCase().includes(q))
      );

      // Type filter
      const matchesType = selectedType === 'ALL' || contact.type === selectedType;

      // Status filter
      const matchesStatus = selectedStatus === 'ALL' || contact.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [contacts, searchQuery, selectedType, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = contacts.length;
    const customers = contacts.filter(c => c.type === 'CUSTOMER' || c.type === 'BOTH').length;
    const vendors = contacts.filter(c => c.type === 'VENDOR' || c.type === 'BOTH').length;
    const active = contacts.filter(c => c.status === 'ACTIVE').length;
    return { total, customers, vendors, active };
  }, [contacts]);

  const activeFilterCount = (selectedType !== 'ALL' ? 1 : 0) + (selectedStatus !== 'ALL' ? 1 : 0);

  return (
    <div className="flex h-screen bg-gray-50/50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <Link to="/dashboard" className="hover:text-[#6D54B5] transition-colors">Dashboard</Link>
              <span>/</span>
              <span>Master Data</span>
              <span>/</span>
              <span className="text-gray-900 font-semibold">Contacts</span>
            </div>

            {/* Header & Subtitle */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100/80 text-[#6D54B5] flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  Contacts
                </h1>
                <p className="text-gray-500 mt-1 text-sm md:text-base">
                  Manage customers and vendors from one place.
                </p>
              </div>

              {/* + Add Contact Button */}
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#6D54B5] hover:bg-purple-700 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Contact
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Total Contacts</span>
                  <span className="text-xl font-bold text-gray-900">{stats.total}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Customers</span>
                  <span className="text-xl font-bold text-gray-900">{stats.customers}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Vendors</span>
                  <span className="text-xl font-bold text-gray-900">{stats.vendors}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Active Status</span>
                  <span className="text-xl font-bold text-gray-900">{stats.active}</span>
                </div>
              </div>
            </div>

            {/* Error Notification Banner */}
            {error && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-sm block">Backend Communication Notice</span>
                    <span className="text-xs sm:text-sm text-amber-800">{error}</span>
                  </div>
                </div>
                <button
                  onClick={fetchContacts}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition-colors flex-shrink-0"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Retry Connection
                </button>
              </div>
            )}

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
                {/* Search Contacts Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search contacts by name, email, mobile, or city..."
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

                {/* Filter Controls Toggle & Quick Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                      showFilterMenu || activeFilterCount > 0
                        ? 'bg-purple-50 border-[#6D54B5] text-[#6D54B5]'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                    {activeFilterCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#6D54B5] text-white text-xs flex items-center justify-center font-bold">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={fetchContacts}
                    disabled={loading}
                    className="p-2 text-gray-500 hover:text-[#6D54B5] hover:bg-purple-50 rounded-xl border border-gray-200 transition-colors"
                    title="Refresh list"
                  >
                    <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#6D54B5]' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Expandable Filter Panel */}
              {showFilterMenu && (
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs">
                  {/* Type Filter Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-gray-500 font-semibold uppercase mr-1">Type:</span>
                    {[
                      { label: 'All', value: 'ALL' },
                      { label: 'Customer', value: 'CUSTOMER' },
                      { label: 'Vendor', value: 'VENDOR' },
                      { label: 'Both', value: 'BOTH' },
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

                  <div className="h-4 w-px bg-gray-200 hidden md:block" />

                  {/* Status Filter Buttons */}
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

                  {(selectedType !== 'ALL' || selectedStatus !== 'ALL' || searchQuery) && (
                    <button
                      onClick={() => {
                        setSelectedType('ALL');
                        setSelectedStatus('ALL');
                        setSearchQuery('');
                      }}
                      className="text-xs text-[#6D54B5] hover:underline font-semibold ml-auto"
                    >
                      Reset all filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Contacts Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="py-4 px-5">Name</th>
                      <th className="py-4 px-5">Type</th>
                      <th className="py-4 px-5">Email</th>
                      <th className="py-4 px-5">Mobile</th>
                      <th className="py-4 px-5">City</th>
                      <th className="py-4 px-5">State</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                    {loading && contacts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <RotateCw className="w-6 h-6 animate-spin text-[#6D54B5]" />
                            <span className="text-sm font-medium">Fetching contacts from PostgreSQL...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredContacts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
                              <Users className="w-6 h-6" />
                            </div>
                            <h4 className="text-base font-bold text-gray-900">No contacts found</h4>
                            <p className="text-xs text-gray-500">
                              {searchQuery || selectedType !== 'ALL' || selectedStatus !== 'ALL'
                                ? 'No contacts match your current search or filter criteria.'
                                : 'Get started by creating your first customer or vendor contact in the system.'}
                            </p>
                            {searchQuery || selectedType !== 'ALL' || selectedStatus !== 'ALL' ? (
                              <button
                                onClick={() => {
                                  setSearchQuery('');
                                  setSelectedType('ALL');
                                  setSelectedStatus('ALL');
                                }}
                                className="mt-2 text-xs font-semibold text-[#6D54B5] hover:underline"
                              >
                                Clear filters
                              </button>
                            ) : (
                              <button
                                onClick={handleOpenCreate}
                                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D54B5] text-white text-xs font-semibold hover:bg-purple-700 transition-colors shadow-sm"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Add Contact
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredContacts.map((contact) => {
                        const typeBadgeStyle = 
                          contact.type === 'CUSTOMER' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          contact.type === 'VENDOR' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200';

                        const statusBadgeStyle = 
                          contact.status === 'ACTIVE' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-gray-100 text-gray-600 border-gray-200';

                        const initials = contact.name
                          .split(' ')
                          .filter(Boolean)
                          .slice(0, 2)
                          .map(p => p[0].toUpperCase())
                          .join('') || 'U';

                        return (
                          <tr 
                            key={contact.id} 
                            className="hover:bg-purple-50/30 transition-colors group"
                          >
                            {/* Name & Avatar */}
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                {contact.profileImage ? (
                                  <img 
                                    src={contact.profileImage} 
                                    alt={contact.name} 
                                    referrerPolicy="no-referrer"
                                    className="w-9 h-9 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-xl bg-[#6D54B5]/10 text-[#6D54B5] font-bold text-xs flex items-center justify-center flex-shrink-0">
                                    {initials}
                                  </div>
                                )}
                                <div>
                                  <span className="font-semibold text-gray-900 block group-hover:text-[#6D54B5] transition-colors">
                                    {contact.name}
                                  </span>
                                  {contact.address && (
                                    <span className="text-xs text-gray-400 truncate max-w-[180px] block">
                                      {contact.address}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Type */}
                            <td className="py-4 px-5 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeBadgeStyle}`}>
                                {contact.type === 'BOTH' ? 'Both' : contact.type}
                              </span>
                            </td>

                            {/* Email */}
                            <td className="py-4 px-5 whitespace-nowrap text-gray-600">
                              {contact.email ? (
                                <a 
                                  href={`mailto:${contact.email}`} 
                                  className="hover:text-[#6D54B5] transition-colors text-xs flex items-center gap-1.5"
                                >
                                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                                  <span>{contact.email}</span>
                                </a>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>

                            {/* Mobile */}
                            <td className="py-4 px-5 whitespace-nowrap text-gray-600 text-xs">
                              {contact.mobile ? (
                                <span className="flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                                  <span>{contact.mobile}</span>
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>

                            {/* City */}
                            <td className="py-4 px-5 whitespace-nowrap text-xs text-gray-600">
                              {contact.city || '—'}
                            </td>

                            {/* State */}
                            <td className="py-4 px-5 whitespace-nowrap text-xs text-gray-600">
                              {contact.state || '—'}
                            </td>

                            {/* Status */}
                            <td className="py-4 px-5 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadgeStyle}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${contact.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                {contact.status}
                              </span>
                            </td>

                            {/* Actions: View, Edit, Deactivate */}
                            <td className="py-4 px-5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleOpenView(contact)}
                                  className="p-1.5 text-gray-500 hover:text-[#6D54B5] hover:bg-purple-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenEdit(contact)}
                                  className="p-1.5 text-gray-500 hover:text-[#6D54B5] hover:bg-purple-50 rounded-lg transition-colors"
                                  title="Edit Contact"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                {contact.status === 'ACTIVE' ? (
                                  <button
                                    onClick={() => handleOpenDeactivate(contact)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Deactivate Contact"
                                  >
                                    <Ban className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleOpenDeactivate(contact)}
                                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Reactivate Contact"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer / Summary */}
              <div className="px-5 py-3.5 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>
                  Showing <strong className="text-gray-900">{filteredContacts.length}</strong> of <strong className="text-gray-900">{contacts.length}</strong> contacts
                </span>
                <span className="hidden sm:inline text-gray-400">
                  Synced with PostgreSQL • REST API v1
                </span>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Modals */}
      <ContactFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={activeContact}
        mode={formMode}
      />

      <ContactViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        contact={viewContact}
        onEdit={(contact) => {
          handleOpenEdit(contact);
        }}
        onDeactivate={(contact) => {
          handleOpenDeactivate(contact);
        }}
      />

      <DeactivateConfirmModal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        contact={deactivateTarget}
        onConfirm={handleStatusChange}
      />
    </div>
  );
}
