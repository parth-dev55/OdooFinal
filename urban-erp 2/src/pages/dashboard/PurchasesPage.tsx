import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Plus,
  RotateCw,
  Eye,
  Edit,
  CheckCircle2,
  X,
  Clock,
  PackageCheck,
  Ban,
  Receipt,
  Layers,
  Truck,
  Package
} from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import {
  PurchaseOrder,
  PurchaseOrderStatus,
  CreatePurchaseOrderDTO,
  UpdatePurchaseOrderDTO
} from '../../types/purchaseOrder';
import { Contact } from '../../types/contact';
import { Product } from '../../types/product';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import { contactService } from '../../services/contactService';
import { productService } from '../../services/productService';
import { PurchaseOrderFormModal } from '../../components/purchases/PurchaseOrderFormModal';
import { PurchaseOrderViewModal } from '../../components/purchases/PurchaseOrderViewModal';
import { PurchaseOrderCancelModal } from '../../components/purchases/PurchaseOrderCancelModal';

export const PurchasesPage: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [loadingRelatedData, setLoadingRelatedData] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedVendor, setSelectedVendor] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [activeOrder, setActiveOrder] = useState<PurchaseOrder | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [viewTargetOrder, setViewTargetOrder] = useState<PurchaseOrder | null>(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [cancelTargetOrder, setCancelTargetOrder] = useState<PurchaseOrder | null>(null);

  // Fetch purchase orders from PostgreSQL backend
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await purchaseOrderService.getPurchaseOrders({
        search: searchQuery,
        status: selectedStatus,
        vendorId: selectedVendor,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setOrders(data);
    } catch (err: any) {
      console.warn('Backend notice while fetching purchase orders:', err?.message || err);
      showToast(err?.message || 'Failed to fetch purchase orders from server.', 'error');
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
  }, [selectedStatus, selectedVendor, startDate, endDate]);

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
        order.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.notes && order.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (order.billId && String(order.billId).toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = selectedStatus === 'ALL' || order.status === selectedStatus;
      const matchesVendor = selectedVendor === 'ALL' || String(order.vendorId) === String(selectedVendor);
      const matchesStart = !startDate || order.orderDate >= startDate;
      const matchesEnd = !endDate || order.orderDate <= endDate;

      return matchesSearch && matchesStatus && matchesVendor && matchesStart && matchesEnd;
    });
  }, [orders, searchQuery, selectedStatus, selectedVendor, startDate, endDate]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalCount = orders.length;
    const draftCount = orders.filter(o => o.status === 'DRAFT').length;
    const confirmedCount = orders.filter(o => o.status === 'CONFIRMED').length;
    const receivedCount = orders.filter(o => o.status === 'RECEIVED').length;
    const billedCount = orders.filter(o => o.status === 'BILLED').length;
    const totalSpend = orders
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      totalCount,
      draftCount,
      confirmedCount,
      receivedCount,
      billedCount,
      totalSpend,
    };
  }, [orders]);

  // Handlers for Form Submissions
  const handleFormSubmit = async (
    data: CreatePurchaseOrderDTO | UpdatePurchaseOrderDTO,
    extraMeta: { vendorName: string; vendorEmail?: string; vendorMobile?: string }
  ) => {
    if (formMode === 'create') {
      const created = await purchaseOrderService.createPurchaseOrder(data as CreatePurchaseOrderDTO, extraMeta);
      showToast(`Purchase Order ${created.orderNumber} created successfully.`);
    } else if (activeOrder) {
      const updated = await purchaseOrderService.updatePurchaseOrder(activeOrder.id, data as UpdatePurchaseOrderDTO, extraMeta);
      showToast(`Purchase Order ${updated.orderNumber} updated successfully.`);
    }
    fetchOrders();
  };

  // Status progression (Confirm, Mark Received, Cancel)
  const handleStatusChange = async (id: string | number, newStatus: PurchaseOrderStatus) => {
    await purchaseOrderService.updatePurchaseOrderStatus(id, newStatus);
    showToast(`Purchase Order status updated to ${newStatus}.`);
    fetchOrders();
    if (viewTargetOrder && String(viewTargetOrder.id) === String(id)) {
      setViewTargetOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleMarkReceived = async (id: string | number) => {
    await purchaseOrderService.markGoodsReceived(id);
    showToast('Goods successfully marked as RECEIVED. Eligible for vendor billing!');
    fetchOrders();
    if (viewTargetOrder && String(viewTargetOrder.id) === String(id)) {
      setViewTargetOrder(prev => prev ? { ...prev, status: 'RECEIVED', receivedAt: new Date().toISOString() } : null);
    }
  };

  // Convert to Vendor Bill
  const handleConvertToBill = async (id: string | number) => {
    const res = await purchaseOrderService.convertToVendorBill(id);
    showToast(`Converted to Vendor Bill ${res.billId || ''} successfully!`);
    fetchOrders();
    if (viewTargetOrder && String(viewTargetOrder.id) === String(id)) {
      setViewTargetOrder(res.purchaseOrder);
    }
  };

  // Cancel order confirmation
  const handleConfirmCancel = async (id: string | number) => {
    await purchaseOrderService.updatePurchaseOrderStatus(id, 'CANCELLED');
    showToast('Purchase order cancelled. Historical transaction preserved for audit.', 'success');
    fetchOrders();
  };

  const getStatusBadge = (status: PurchaseOrderStatus) => {
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
      case 'RECEIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-[#6D54B5] border border-purple-200">
            <PackageCheck className="w-3 h-3" />
            <span>RECEIVED</span>
          </span>
        );
      case 'BILLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Receipt className="w-3 h-3" />
            <span>BILLED</span>
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

  const isFiltered = selectedStatus !== 'ALL' || selectedVendor !== 'ALL' || !!startDate || !!endDate;

  const resetFilters = () => {
    setSelectedStatus('ALL');
    setSelectedVendor('ALL');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

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
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Purchase Orders</h1>
                  <span className="px-2.5 py-0.5 bg-purple-50 text-[#6D54B5] text-xs font-semibold rounded-full border border-purple-100">
                    PostgreSQL Integrated
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Create and manage vendor purchase transactions.
                </p>
              </div>

              {/* Action Button: Create Purchase Order */}
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
                  <span>+ Create Purchase Order</span>
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
                  <span>All purchase orders</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
                <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Draft Orders</div>
                <div className="text-2xl font-bold text-amber-700 mt-1">{metrics.draftCount}</div>
                <div className="text-[11px] text-gray-400 mt-1">Pending vendor approval</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
                <div className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Received & Billed</div>
                <div className="text-2xl font-bold text-[#6D54B5] mt-1">{metrics.receivedCount + metrics.billedCount}</div>
                <div className="text-[11px] text-gray-400 mt-1">Fulfilled by vendors</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
                <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Total Spend</div>
                <div className="text-2xl font-bold text-emerald-700 mt-1">
                  ₹{metrics.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">Committed purchase cost</div>
              </div>
            </div>

            {/* Top Action Controls: Search & Filter */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Purchase Orders */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Purchase Orders by order number, vendor name, notes, bill ref..."
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
                    title="Refresh purchase orders"
                  >
                    <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#6D54B5]' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Filter Panel */}
              {showFilterMenu && (
                <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs animate-fade-in">
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
                      <option value="RECEIVED">RECEIVED</option>
                      <option value="BILLED">BILLED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Filter by Vendor</label>
                    <select
                      value={selectedVendor}
                      onChange={(e) => setSelectedVendor(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-xs focus:ring-1 focus:ring-[#6D54B5]"
                    >
                      <option value="ALL">All Vendors</option>
                      {contacts
                        .filter(c => c.type === 'VENDOR' || c.type === 'BOTH')
                        .map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-xs focus:ring-1 focus:ring-[#6D54B5]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">End Date</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-xs focus:ring-1 focus:ring-[#6D54B5]"
                      />
                      {isFiltered && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="px-2 py-1.5 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg text-[11px] whitespace-nowrap"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Purchase Orders Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Order Number</th>
                      <th className="py-3.5 px-4">Vendor</th>
                      <th className="py-3.5 px-4">Order Date</th>
                      <th className="py-3.5 px-4 text-center">Items</th>
                      <th className="py-3.5 px-4 text-right">Subtotal</th>
                      <th className="py-3.5 px-4 text-right">Total</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-400">
                          <RotateCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#6D54B5]" />
                          <span>Fetching purchase orders from PostgreSQL...</span>
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-500">
                          <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                          <p className="font-semibold text-gray-700">No Purchase Orders Found</p>
                          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                            {searchQuery || isFiltered
                              ? 'No purchase orders match your current filter parameters.'
                              : 'Create your first vendor purchase order to track procurement and receive inventory.'}
                          </p>
                          {(!searchQuery && !isFiltered) && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveOrder(null);
                                setFormMode('create');
                                setIsFormModalOpen(true);
                              }}
                              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#6D54B5] text-white rounded-xl text-xs font-semibold hover:bg-[#5C459E] transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Create First Purchase Order</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const itemsCount = order.items?.length || 0;
                        const firstItemName = order.items?.[0]?.productName;

                        return (
                          <tr key={order.id} className="hover:bg-purple-50/10 transition-colors">
                            {/* Order Number */}
                            <td className="py-3.5 px-4 font-semibold text-gray-900">
                              <div className="flex items-center gap-2">
                                <span>{order.orderNumber}</span>
                                {order.billId && (
                                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded">
                                    {order.billId}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Vendor */}
                            <td className="py-3.5 px-4">
                              <div className="font-medium text-gray-900">{order.vendorName}</div>
                              {order.vendorEmail && (
                                <div className="text-xs text-gray-400">{order.vendorEmail}</div>
                              )}
                            </td>

                            {/* Order Date */}
                            <td className="py-3.5 px-4 text-xs text-gray-600 whitespace-nowrap">
                              {order.orderDate || (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-')}
                            </td>

                            {/* Items count & summary */}
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium"
                                title={order.items?.map(i => `${i.productName} (${i.quantity}x)`).join(', ')}
                              >
                                <Package className="w-3 h-3 text-gray-500" />
                                <span>{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</span>
                              </span>
                              {firstItemName && itemsCount > 1 && (
                                <div className="text-[10px] text-gray-400 truncate max-w-[120px] mx-auto mt-0.5">
                                  {firstItemName} +{itemsCount - 1}
                                </div>
                              )}
                            </td>

                            {/* Subtotal */}
                            <td className="py-3.5 px-4 text-right text-gray-600 text-xs">
                              ₹{(order.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>

                            {/* Total */}
                            <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                              ₹{(order.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              {getStatusBadge(order.status)}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {/* View Order */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setViewTargetOrder(order);
                                    setIsViewModalOpen(true);
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="View Purchase Order Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* Edit Order (Only when DRAFT) */}
                                {order.status === 'DRAFT' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveOrder(order);
                                      setFormMode('edit');
                                      setIsFormModalOpen(true);
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-[#6D54B5] hover:bg-purple-50 rounded-lg transition-colors"
                                    title="Edit Draft Order"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Mark Goods Received (When CONFIRMED) */}
                                {order.status === 'CONFIRMED' && (
                                  <button
                                    type="button"
                                    onClick={() => handleMarkReceived(order.id)}
                                    className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-[#6D54B5] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                                    title="Mark Goods Received"
                                  >
                                    <PackageCheck className="w-3.5 h-3.5" />
                                    <span className="hidden md:inline">Receive</span>
                                  </button>
                                )}

                                {/* Convert to Vendor Bill (When RECEIVED) */}
                                {order.status === 'RECEIVED' && (
                                  <button
                                    type="button"
                                    onClick={() => handleConvertToBill(order.id)}
                                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                                    title="Convert to Vendor Bill"
                                  >
                                    <Receipt className="w-3.5 h-3.5" />
                                    <span className="hidden md:inline">Bill</span>
                                  </button>
                                )}

                                {/* Cancel Order (When DRAFT or CONFIRMED) */}
                                {(order.status === 'DRAFT' || order.status === 'CONFIRMED') && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCancelTargetOrder(order);
                                      setIsCancelModalOpen(true);
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Cancel Purchase Order"
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

      {/* Create / Edit Form Modal */}
      <PurchaseOrderFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={activeOrder}
        mode={formMode}
        contacts={contacts}
        products={products}
        loadingData={loadingRelatedData}
      />

      {/* View Purchase Order Modal */}
      <PurchaseOrderViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        order={viewTargetOrder}
        onStatusChange={handleStatusChange}
        onMarkReceived={handleMarkReceived}
        onConvertToBill={handleConvertToBill}
        canManageStatus={true}
      />

      {/* Cancel Order Confirmation Modal */}
      <PurchaseOrderCancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        order={cancelTargetOrder}
        onConfirmCancel={handleConfirmCancel}
      />
    </div>
  );
};

export default PurchasesPage;
