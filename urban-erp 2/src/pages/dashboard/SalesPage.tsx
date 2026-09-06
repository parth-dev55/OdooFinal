import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Plus, 
  RotateCw, 
  Eye, 
  Edit, 
  CheckCircle2, 
  X, 
  Clock, 
  FileCheck, 
  Ban, 
  Receipt, 
  AlertCircle,
  TrendingUp,
  User,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import { SalesOrder, SalesOrderStatus, CreateSalesOrderDTO, UpdateSalesOrderDTO } from '../../types/salesOrder';
import { Contact } from '../../types/contact';
import { Product } from '../../types/product';
import { salesOrderService } from '../../services/salesOrderService';
import { contactService } from '../../services/contactService';
import { productService } from '../../services/productService';
import { SalesOrderFormModal } from '../../components/sales/SalesOrderFormModal';
import { SalesOrderViewModal } from '../../components/sales/SalesOrderViewModal';
import { SalesOrderCancelModal } from '../../components/sales/SalesOrderCancelModal';
import { useAuth } from '../../contexts/AuthContext';

export const SalesPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingRelatedData, setLoadingRelatedData] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [activeOrder, setActiveOrder] = useState<SalesOrder | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [viewTargetOrder, setViewTargetOrder] = useState<SalesOrder | null>(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [cancelTargetOrder, setCancelTargetOrder] = useState<SalesOrder | null>(null);

  // Fetch sales orders from PostgreSQL backend
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await salesOrderService.getSalesOrders({
        search: searchQuery,
        status: selectedStatus,
        customerId: selectedCustomer,
      });
      setOrders(data);
    } catch (err: any) {
      console.warn('Backend notice while fetching sales orders:', err?.message || err);
      showToast(err?.message || 'Failed to fetch sales orders from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Contacts & Products for dropdown selectors
  const fetchRelatedData = async () => {
    setLoadingRelatedData(true);
    try {
      const [fetchedContacts, fetchedProducts] = await Promise.all([
        contactService.getContacts(),
        productService.getProducts(),
      ]);
      setContacts(fetchedContacts);
      setProducts(fetchedProducts);
    } catch (err: any) {
      console.warn('Backend notice while fetching contacts/products:', err?.message || err);
    } finally {
      setLoadingRelatedData(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, selectedCustomer]);

  useEffect(() => {
    fetchRelatedData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Filtered orders client-side for rapid search
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch =
        !searchQuery.trim() ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.notes && order.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (order.invoiceId && order.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = selectedStatus === 'ALL' || order.status === selectedStatus;
      const matchesCustomer = selectedCustomer === 'ALL' || String(order.customerId) === String(selectedCustomer);

      return matchesSearch && matchesStatus && matchesCustomer;
    });
  }, [orders, searchQuery, selectedStatus, selectedCustomer]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalCount = orders.length;
    const draftCount = orders.filter(o => o.status === 'DRAFT').length;
    const confirmedCount = orders.filter(o => o.status === 'CONFIRMED').length;
    const invoicedCount = orders.filter(o => o.status === 'INVOICED').length;
    const totalRevenue = orders
      .filter(o => o.status === 'CONFIRMED' || o.status === 'INVOICED')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      totalCount,
      draftCount,
      confirmedCount,
      invoicedCount,
      totalRevenue,
    };
  }, [orders]);

  // Handlers for Form Submissions
  const handleCreateOrder = async (
    data: CreateSalesOrderDTO | UpdateSalesOrderDTO, 
    extraMeta: { customerName: string; customerEmail?: string; customerMobile?: string }
  ) => {
    if (formMode === 'create') {
      const created = await salesOrderService.createSalesOrder(data as CreateSalesOrderDTO, extraMeta);
      showToast(`Sales Order ${created.orderNumber} created successfully.`);
    } else if (activeOrder) {
      const updated = await salesOrderService.updateSalesOrder(activeOrder.id, data as UpdateSalesOrderDTO, extraMeta);
      showToast(`Sales Order ${updated.orderNumber} updated successfully.`);
    }
    fetchOrders();
  };

  // Status progression (Confirm, Cancel)
  const handleStatusChange = async (id: string | number, newStatus: SalesOrderStatus) => {
    await salesOrderService.updateSalesOrderStatus(id, newStatus);
    showToast(`Order status updated to ${newStatus}.`);
    fetchOrders();
    if (viewTargetOrder && String(viewTargetOrder.id) === String(id)) {
      setViewTargetOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Invoice Generation
  const handleGenerateInvoice = async (id: string | number) => {
    const res = await salesOrderService.generateCustomerInvoice(id);
    showToast(`Customer invoice ${res.invoiceId || ''} generated successfully! Ledger accounts updated.`);
    fetchOrders();
    if (viewTargetOrder && String(viewTargetOrder.id) === String(id)) {
      setViewTargetOrder(res.salesOrder);
    }
  };

  // Cancel order confirmation
  const handleConfirmCancel = async (id: string | number) => {
    await salesOrderService.updateSalesOrderStatus(id, 'CANCELLED');
    showToast('Sales order cancelled. Historical transaction preserved for audit.', 'success');
    fetchOrders();
  };

  const getStatusBadge = (status: SalesOrderStatus) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>DRAFT</span>
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>CONFIRMED</span>
          </span>
        );
      case 'INVOICED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FileCheck className="w-3 h-3" />
            <span>INVOICED</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300">
            <Ban className="w-3 h-3" />
            <span>CANCELLED</span>
          </span>
        );
      default:
        return null;
    }
  };

  const isFiltered = selectedStatus !== 'ALL' || selectedCustomer !== 'ALL';

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sales Orders</h1>
                  <span className="px-2.5 py-0.5 bg-purple-50 text-[#6D54B5] text-xs font-semibold rounded-full border border-purple-100">
                    PostgreSQL Integrated
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Create and manage customer sales transactions.
                </p>
              </div>

              {/* Action Button: Create Sales Order */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveOrder(null);
                    setFormMode('create');
                    setIsFormModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6D54B5] hover:bg-[#5C459E] text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Sales Order</span>
                </button>
              </div>
            </div>

            {/* Toast Notification */}
            {toastMessage && (
              <div
                className={`p-4 rounded-xl border flex items-center justify-between text-sm animate-fade-in ${
                  toastMessage.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="font-medium">{toastMessage.message}</span>
                </div>
                <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Metric Cards Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Orders</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalCount}</div>
                <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-[#6D54B5]" />
                  <span>All active sales orders</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
                <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Draft Orders</div>
                <div className="text-2xl font-bold text-amber-700 mt-1">{metrics.draftCount}</div>
                <div className="text-[11px] text-gray-400 mt-1">Pending customer approval</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Confirmed & Invoiced</div>
                <div className="text-2xl font-bold text-blue-700 mt-1">{metrics.confirmedCount + metrics.invoicedCount}</div>
                <div className="text-[11px] text-gray-400 mt-1">Approved for fulfillment</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
                <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Committed Revenue</div>
                <div className="text-2xl font-bold text-emerald-700 mt-1">
                  ₹{metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">From confirmed orders</div>
              </div>
            </div>

            {/* Top Action Controls: Search & Filter */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Sales Orders */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Sales Orders by number, customer, notes, invoice..."
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

                {/* Filter & Refresh Controls */}
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
                    {isFiltered && <span className="w-2 h-2 rounded-full bg-[#6D54B5]"></span>}
                  </button>

                  <button
                    onClick={() => {
                      fetchOrders();
                      fetchRelatedData();
                    }}
                    disabled={loading}
                    className="p-2 text-gray-500 hover:text-[#6D54B5] hover:bg-purple-50 rounded-xl border border-gray-200 transition-colors"
                    title="Refresh sales orders"
                  >
                    <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#6D54B5]' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Filter Panel */}
              {showFilterMenu && (
                <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-fade-in">
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Filter by Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-xs focus:ring-1 focus:ring-[#6D54B5]"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="INVOICED">INVOICED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Filter by Customer</label>
                    <select
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-xs focus:ring-1 focus:ring-[#6D54B5]"
                    >
                      <option value="ALL">All Customers</option>
                      {contacts
                        .filter(c => c.type === 'CUSTOMER' || c.type === 'BOTH')
                        .map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Sales Orders Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Order Number</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Order Date</th>
                      <th className="py-3.5 px-4 text-right">Total Amount</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400">
                          <RotateCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#6D54B5]" />
                          <span>Fetching sales transactions from PostgreSQL...</span>
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-500">
                          <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                          <p className="font-semibold text-gray-700">No Sales Orders Found</p>
                          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                            {searchQuery || isFiltered
                              ? 'No orders match your current filter parameters.'
                              : 'Create your first customer sales order to record transactions and issue invoices.'}
                          </p>
                          {(!searchQuery && !isFiltered) && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveOrder(null);
                                setFormMode('create');
                                setIsFormModalOpen(true);
                              }}
                              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#6D54B5] text-white rounded-xl text-xs font-semibold hover:bg-[#5C459E] transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Create Sales Order</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const isDraft = order.status === 'DRAFT';
                        const isConfirmed = order.status === 'CONFIRMED';
                        const isInvoiced = order.status === 'INVOICED';
                        const isCancelled = order.status === 'CANCELLED';

                        return (
                          <tr key={order.id} className="hover:bg-purple-50/20 transition-colors">
                            {/* Order Number */}
                            <td className="py-3.5 px-4 font-semibold text-gray-900">
                              <div className="flex items-center gap-2">
                                <span>{order.orderNumber}</span>
                                {order.invoiceId && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-[#6D54B5] border border-purple-100 rounded font-normal" title={`Invoiced: ${order.invoiceId}`}>
                                    {order.invoiceId}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Customer */}
                            <td className="py-3.5 px-4">
                              <div className="font-medium text-gray-900">{order.customerName}</div>
                              {order.customerEmail && (
                                <div className="text-xs text-gray-400">{order.customerEmail}</div>
                              )}
                            </td>

                            {/* Order Date */}
                            <td className="py-3.5 px-4 text-xs text-gray-600">
                              {order.orderDate || new Date(order.createdAt || '').toLocaleDateString()}
                            </td>

                            {/* Total Amount */}
                            <td className="py-3.5 px-4 text-right font-semibold text-gray-900">
                              <div>
                                ₹{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <div className="text-[10px] text-gray-400 font-normal">
                                Tax: ₹{order.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 text-center">
                              {getStatusBadge(order.status)}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* View */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setViewTargetOrder(order);
                                    setIsViewModalOpen(true);
                                  }}
                                  className="p-1.5 text-gray-500 hover:text-[#6D54B5] hover:bg-purple-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* Edit (Allowed only in DRAFT) */}
                                {isDraft && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveOrder(order);
                                      setFormMode('edit');
                                      setIsFormModalOpen(true);
                                    }}
                                    className="p-1.5 text-gray-500 hover:text-[#6D54B5] hover:bg-purple-50 rounded-lg transition-colors"
                                    title="Edit Draft Order"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Confirm Button (for DRAFT) */}
                                {isDraft && (
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(order.id, 'CONFIRMED')}
                                    className="px-2.5 py-1 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                                    title="Confirm Sales Order"
                                  >
                                    Confirm
                                  </button>
                                )}

                                {/* Generate Invoice Button (for CONFIRMED) */}
                                {isConfirmed && (
                                  <button
                                    type="button"
                                    onClick={() => handleGenerateInvoice(order.id)}
                                    className="px-2.5 py-1 text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-[#6D54B5] rounded-lg transition-colors flex items-center gap-1"
                                    title="Generate Customer Invoice"
                                  >
                                    <Receipt className="w-3.5 h-3.5" />
                                    <span>Invoice</span>
                                  </button>
                                )}

                                {/* Cancel Order (for DRAFT or CONFIRMED) */}
                                {(isDraft || isConfirmed) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCancelTargetOrder(order);
                                      setIsCancelModalOpen(true);
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Cancel Order"
                                  >
                                    <Ban className="w-4 h-4" />
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
            </div>

          </div>
        </main>
      </div>

      {/* Form Modal (Create / Edit) */}
      <SalesOrderFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleCreateOrder}
        initialData={activeOrder}
        mode={formMode}
        contacts={contacts}
        products={products}
        loadingData={loadingRelatedData}
      />

      {/* View Modal with Status Progression & Invoicing */}
      <SalesOrderViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        order={viewTargetOrder}
        onStatusChange={handleStatusChange}
        onGenerateInvoice={handleGenerateInvoice}
      />

      {/* Cancellation Modal (Safe audit soft-cancellation) */}
      <SalesOrderCancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        order={cancelTargetOrder}
      />
    </div>
  );
};

export default SalesPage;
