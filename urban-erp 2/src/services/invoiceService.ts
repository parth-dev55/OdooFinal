import { apiClient } from './apiClient';
import { CustomerInvoice, InvoiceFilterParams, InvoiceStatus, PaymentStatus } from '../types/invoice';
import { UserProfile } from './authService';

const INVOICES_STORAGE_KEY = 'urban_erp_invoices_store_v1';
const SALES_ORDERS_STORAGE_KEY = 'urban_erp_sales_orders_store_v1';

export function getStoredInvoices(): CustomerInvoice[] {
  try {
    const raw = localStorage.getItem(INVOICES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore parse error
  }
  return [];
}

export function saveStoredInvoices(invoices: CustomerInvoice[]): void {
  try {
    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
  } catch (e) {
    // Ignore storage quota error
  }
}

/**
 * Synchronize invoices with invoiced sales orders in localStorage if offline/standby
 */
function syncInvoicesWithSalesOrders(invoices: CustomerInvoice[]): CustomerInvoice[] {
  try {
    const rawOrders = localStorage.getItem(SALES_ORDERS_STORAGE_KEY);
    if (!rawOrders) return invoices;
    const orders = JSON.parse(rawOrders);
    if (!Array.isArray(orders)) return invoices;

    const existingMap = new Map<string, CustomerInvoice>();
    invoices.forEach(inv => {
      existingMap.set(String(inv.id), inv);
      existingMap.set(inv.invoiceNumber, inv);
      if (inv.salesOrderId) existingMap.set(`SO-${inv.salesOrderId}`, inv);
    });

    const newInvoices: CustomerInvoice[] = [];

    orders.forEach((so: any) => {
      if (so.status === 'INVOICED' || so.invoiceId) {
        const invNum = so.invoiceId || `INV-${new Date(so.orderDate || Date.now()).getFullYear()}-${String(so.id).slice(-4)}`;
        if (!existingMap.has(String(so.invoiceId)) && !existingMap.has(invNum) && !existingMap.has(`SO-${so.id}`)) {
          // Calculate due date (+30 days default)
          const invDate = so.invoicedAt ? so.invoicedAt.split('T')[0] : (so.orderDate || new Date().toISOString().split('T')[0]);
          const d = new Date(invDate);
          d.setDate(d.getDate() + 30);
          const dueDate = d.toISOString().split('T')[0];

          const generatedInvoice: CustomerInvoice = {
            id: so.invoiceId || `inv-${Date.now()}-${so.id}`,
            invoiceNumber: invNum,
            salesOrderId: so.id,
            salesOrderNumber: so.orderNumber,
            customerId: so.customerId,
            customerName: so.customerName || 'Customer',
            customerEmail: so.customerEmail,
            customerMobile: so.customerMobile,
            invoiceDate: invDate,
            dueDate: dueDate,
            items: (so.items || []).map((item: any, idx: number) => ({
              id: item.id || `inv-item-${idx + 1}`,
              productId: item.productId,
              productName: item.productName || 'Item ' + (idx + 1),
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice || 0,
              taxRate: item.taxRate || 0,
              taxAmount: item.taxAmount || 0,
              total: item.total || ((item.quantity || 1) * (item.unitPrice || 0)),
            })),
            subtotal: so.subtotal || 0,
            taxAmount: so.taxAmount || 0,
            totalAmount: so.totalAmount || 0,
            amountPaid: 0,
            balanceDue: so.totalAmount || 0,
            status: 'POSTED',
            paymentStatus: 'UNPAID',
            notes: so.notes ? `Derived from Sales Order ${so.orderNumber}. ${so.notes}` : `Generated from Sales Order ${so.orderNumber}`,
            createdAt: so.invoicedAt || new Date().toISOString(),
          };

          newInvoices.push(generatedInvoice);
          existingMap.set(String(generatedInvoice.id), generatedInvoice);
          existingMap.set(generatedInvoice.invoiceNumber, generatedInvoice);
          existingMap.set(`SO-${so.id}`, generatedInvoice);
        }
      }
    });

    if (newInvoices.length > 0) {
      const combined = [...newInvoices, ...invoices];
      saveStoredInvoices(combined);
      return combined;
    }
  } catch (e) {
    // Ignore sync errors
  }
  return invoices;
}

export const invoiceService = {
  /**
   * GET /api/invoices
   * Loads all customer invoices
   */
  getInvoices: async (params?: InvoiceFilterParams): Promise<CustomerInvoice[]> => {
    try {
      let query = '';
      if (params) {
        const q = new URLSearchParams();
        if (params.search) q.append('search', params.search);
        if (params.customerId) q.append('customerId', params.customerId);
        if (params.status) q.append('status', params.status);
        if (params.paymentStatus) q.append('paymentStatus', params.paymentStatus);
        if (params.startDate) q.append('startDate', params.startDate);
        if (params.endDate) q.append('endDate', params.endDate);
        const qs = q.toString();
        if (qs) query = `?${qs}`;
      }

      const res = await apiClient(`/api/invoices${query}`, { method: 'GET' });
      if (Array.isArray(res)) {
        saveStoredInvoices(res);
        return res;
      }
    } catch (error: any) {
      console.warn('Backend in standby, loading invoices from local buffer:', error?.message || error);
    }

    let localInvoices = getStoredInvoices();
    localInvoices = syncInvoicesWithSalesOrders(localInvoices);

    // Apply filtering on local buffer
    if (params) {
      if (params.search) {
        const s = params.search.toLowerCase();
        localInvoices = localInvoices.filter(i => 
          i.invoiceNumber.toLowerCase().includes(s) || 
          i.customerName.toLowerCase().includes(s)
        );
      }
      if (params.customerId && params.customerId !== 'ALL') {
        localInvoices = localInvoices.filter(i => String(i.customerId) === String(params.customerId));
      }
      if (params.status && params.status !== 'ALL') {
        localInvoices = localInvoices.filter(i => i.status === params.status);
      }
      if (params.paymentStatus && params.paymentStatus !== 'ALL') {
        localInvoices = localInvoices.filter(i => i.paymentStatus === params.paymentStatus);
      }
      if (params.startDate) {
        localInvoices = localInvoices.filter(i => i.invoiceDate >= params.startDate!);
      }
      if (params.endDate) {
        localInvoices = localInvoices.filter(i => i.invoiceDate <= params.endDate!);
      }
    }

    return localInvoices;
  },

  /**
   * GET /api/invoices/{id}
   * Fetches single invoice details
   */
  getInvoiceById: async (id: string | number): Promise<CustomerInvoice> => {
    try {
      const res = await apiClient(`/api/invoices/${id}`, { method: 'GET' });
      if (res && (res.id || res.invoiceNumber)) {
        return res;
      }
    } catch (error: any) {
      console.warn(`Backend in standby, finding invoice #${id} locally:`, error?.message || error);
    }

    const current = syncInvoicesWithSalesOrders(getStoredInvoices());
    const found = current.find(i => String(i.id) === String(id) || i.invoiceNumber === String(id));
    if (found) {
      return found;
    }

    throw new Error(`Customer Invoice ${id} not found.`);
  },

  /**
   * POST /api/sales-orders/{id}/invoice
   * Converts a Sales Order into a Customer Invoice
   */
  generateInvoiceFromSalesOrder: async (salesOrderId: string | number, salesOrderData?: any): Promise<CustomerInvoice> => {
    const generatedInvoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    try {
      const res = await apiClient(`/api/sales-orders/${salesOrderId}/invoice`, {
        method: 'POST',
      });
      if (res && (res.id || res.invoiceNumber)) {
        const current = getStoredInvoices();
        saveStoredInvoices([res, ...current.filter(i => String(i.id) !== String(res.id))]);
        return res;
      }
    } catch (error: any) {
      console.warn('Backend in standby, generating invoice in buffer:', error?.message || error);
    }

    // Fallback if backend is on standby
    const so = salesOrderData;
    const invDate = new Date().toISOString().split('T')[0];
    const d = new Date();
    d.setDate(d.getDate() + 30);
    const dueDate = d.toISOString().split('T')[0];

    const newInvoice: CustomerInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: generatedInvoiceNumber,
      salesOrderId: salesOrderId,
      salesOrderNumber: so?.orderNumber || `SO-${salesOrderId}`,
      customerId: so?.customerId || '1',
      customerName: so?.customerName || 'Customer',
      customerEmail: so?.customerEmail,
      customerMobile: so?.customerMobile,
      invoiceDate: invDate,
      dueDate: dueDate,
      items: (so?.items || []).map((item: any, idx: number) => ({
        id: `item-${idx + 1}`,
        productId: item.productId,
        productName: item.productName || `Item #${item.productId}`,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        taxRate: item.taxRate || 0,
        taxAmount: item.taxAmount || 0,
        total: item.total || ((item.quantity || 1) * (item.unitPrice || 0)),
      })),
      subtotal: so?.subtotal || 0,
      taxAmount: so?.taxAmount || 0,
      totalAmount: so?.totalAmount || 0,
      amountPaid: 0,
      balanceDue: so?.totalAmount || 0,
      status: 'POSTED',
      paymentStatus: 'UNPAID',
      notes: so?.notes ? `Derived from Sales Order ${so?.orderNumber}. ${so?.notes}` : `Generated from Sales Order ${so?.orderNumber || salesOrderId}`,
      createdAt: new Date().toISOString(),
    };

    const current = getStoredInvoices();
    saveStoredInvoices([newInvoice, ...current]);
    return newInvoice;
  },

  /**
   * PATCH /api/invoices/{id}/status
   */
  updateInvoiceStatus: async (id: string | number, status: InvoiceStatus, paymentStatus?: PaymentStatus): Promise<CustomerInvoice> => {
    try {
      const res = await apiClient(`/api/invoices/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, paymentStatus }),
      });
      if (res) {
        const current = getStoredInvoices();
        saveStoredInvoices(current.map(i => String(i.id) === String(id) ? { ...i, ...res } : i));
        return res;
      }
    } catch (error: any) {
      console.warn('Backend in standby, updating invoice status locally:', error?.message || error);
    }

    const current = getStoredInvoices();
    const updated = current.map(i => {
      if (String(i.id) === String(id) || i.invoiceNumber === String(id)) {
        return {
          ...i,
          status,
          ...(paymentStatus ? { paymentStatus } : {}),
          updatedAt: new Date().toISOString(),
        };
      }
      return i;
    });

    saveStoredInvoices(updated);
    const target = updated.find(i => String(i.id) === String(id) || i.invoiceNumber === String(id));
    if (!target) throw new Error(`Invoice ${id} not found.`);
    return target;
  },

  /**
   * Filter invoices for CONTACT role so they only view their own
   */
  filterForRole: (invoices: CustomerInvoice[], profile: UserProfile | null): CustomerInvoice[] => {
    if (!profile) return invoices;
    if (profile.role === 'ADMIN' || profile.role === 'ACCOUNTANT') {
      return invoices;
    }
    // CONTACT role: only view invoices where customer matches their profile
    return invoices.filter(inv => {
      const matchesEmail = profile.email && inv.customerEmail?.toLowerCase() === profile.email.toLowerCase();
      const matchesId = profile.id && String(inv.customerId) === String(profile.id);
      const matchesName = profile.name && inv.customerName.toLowerCase().includes(profile.name.toLowerCase());
      return matchesEmail || matchesId || matchesName;
    });
  }
};
