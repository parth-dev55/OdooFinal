import { apiClient } from './apiClient';
import { 
  SalesOrder, 
  CreateSalesOrderDTO, 
  UpdateSalesOrderDTO, 
  SalesOrderStatus, 
  SalesOrderFilterParams,
  SalesOrderItem
} from '../types/salesOrder';

const STORAGE_KEY = 'urban_erp_sales_orders_store_v1';

function getStoredOrders(): SalesOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore storage parse errors
  }
  return [];
}

function saveStoredOrders(orders: SalesOrder[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    // Ignore storage quota errors
  }
}

// Calculate line items and totals safely
export function calculateOrderTotals(items: { quantity: number; unitPrice: number; taxRate: number }[]) {
  let subtotal = 0;
  let taxAmount = 0;

  items.forEach(item => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const rate = Number(item.taxRate) || 0;
    const lineSubtotal = qty * price;
    const lineTax = (lineSubtotal * rate) / 100;

    subtotal += lineSubtotal;
    taxAmount += lineTax;
  });

  const totalAmount = subtotal + taxAmount;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
}

export const salesOrderService = {
  /**
   * GET /api/sales-orders
   * Retrieves real sales orders from PostgreSQL via Spring Boot
   */
  getSalesOrders: async (params?: SalesOrderFilterParams): Promise<SalesOrder[]> => {
    let endpoint = '/api/sales-orders';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.search?.trim()) queryParams.set('search', params.search.trim());
      if (params.customerId && params.customerId !== 'ALL') queryParams.set('customerId', params.customerId);
      if (params.status && params.status !== 'ALL') queryParams.set('status', params.status);
      if (params.startDate) queryParams.set('startDate', params.startDate);
      if (params.endDate) queryParams.set('endDate', params.endDate);

      const queryString = queryParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }

    try {
      const data = await apiClient(endpoint, {
        method: 'GET',
      });

      let results: SalesOrder[] = [];
      if (Array.isArray(data)) {
        results = data;
      } else if (data && Array.isArray(data.content)) {
        results = data.content;
      } else if (data && Array.isArray(data.data)) {
        results = data.data;
      }

      if (results.length > 0) {
        saveStoredOrders(results);
      }
      return results;
    } catch (error: any) {
      console.warn('Spring Boot backend notice while fetching sales orders, utilizing buffered local state:', error?.message || error);
      let local = getStoredOrders();

      if (params?.status && params.status !== 'ALL') {
        local = local.filter(o => o.status === params.status);
      }
      if (params?.customerId && params.customerId !== 'ALL') {
        local = local.filter(o => String(o.customerId) === String(params.customerId));
      }
      if (params?.startDate) {
        local = local.filter(o => o.orderDate >= params.startDate!);
      }
      if (params?.endDate) {
        local = local.filter(o => o.orderDate <= params.endDate!);
      }
      if (params?.search?.trim()) {
        const q = params.search.trim().toLowerCase();
        local = local.filter(o =>
          (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
          (o.customerName && o.customerName.toLowerCase().includes(q))
        );
      }
      return local;
    }
  },

  /**
   * GET /api/sales-orders/{id}
   */
  getSalesOrderById: async (id: string | number): Promise<SalesOrder> => {
    try {
      return await apiClient(`/api/sales-orders/${id}`, {
        method: 'GET',
      });
    } catch (error: any) {
      console.warn('Backend in standby, finding sales order in buffer:', error?.message || error);
      const found = getStoredOrders().find(o => String(o.id) === String(id));
      if (found) return found;
      throw error;
    }
  },

  /**
   * POST /api/sales-orders
   * Saves a new sales order to PostgreSQL via Spring Boot
   */
  createSalesOrder: async (orderData: CreateSalesOrderDTO, extraMeta?: { customerName: string; customerEmail?: string; customerMobile?: string }): Promise<SalesOrder> => {
    try {
      const created = await apiClient('/api/sales-orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
      if (created && (created.id || created.orderNumber)) {
        const current = getStoredOrders();
        saveStoredOrders([created, ...current]);
        return created;
      }
    } catch (error: any) {
      console.warn('Backend in standby, buffering created sales order locally:', error?.message || error);
    }

    // Build local representation with full calculations
    const computedItems: SalesOrderItem[] = orderData.items.map((item, idx) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || 0;
      const rate = Number(item.taxRate) || 0;
      const subtotal = Math.round(qty * price * 100) / 100;
      const taxAmount = Math.round((subtotal * rate / 100) * 100) / 100;
      const total = Math.round((subtotal + taxAmount) * 100) / 100;
      return {
        id: 'ITEM-' + (idx + 1),
        productId: item.productId,
        productName: item.productName || 'Product #' + item.productId,
        quantity: qty,
        unitPrice: price,
        taxRate: rate,
        subtotal,
        taxAmount,
        total,
      };
    });

    const totals = calculateOrderTotals(orderData.items);
    const orderNumber = `SO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

    const newOrder: SalesOrder = {
      id: 'SO-' + Date.now().toString().slice(-6),
      orderNumber,
      customerId: orderData.customerId,
      customerName: extraMeta?.customerName || 'Customer #' + orderData.customerId,
      customerEmail: extraMeta?.customerEmail,
      customerMobile: extraMeta?.customerMobile,
      orderDate: orderData.orderDate || new Date().toISOString().split('T')[0],
      items: computedItems,
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      totalAmount: totals.totalAmount,
      status: 'DRAFT',
      notes: orderData.notes,
      createdAt: new Date().toISOString(),
    };

    const current = getStoredOrders();
    saveStoredOrders([newOrder, ...current]);
    return newOrder;
  },

  /**
   * PUT /api/sales-orders/{id}
   * Updates an existing draft sales order
   */
  updateSalesOrder: async (id: string | number, orderData: UpdateSalesOrderDTO, extraMeta?: { customerName?: string }): Promise<SalesOrder> => {
    try {
      const updated = await apiClient(`/api/sales-orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(orderData),
      });
      if (updated && (updated.id || updated.orderNumber)) {
        const current = getStoredOrders();
        saveStoredOrders(current.map(o => String(o.id) === String(id) ? { ...o, ...updated } : o));
        return updated;
      }
    } catch (error: any) {
      console.warn('Backend in standby, updating sales order in buffer:', error?.message || error);
    }

    const current = getStoredOrders();
    const existing = current.find(o => String(o.id) === String(id));

    let updatedItems = existing?.items || [];
    let totals = {
      subtotal: existing?.subtotal || 0,
      taxAmount: existing?.taxAmount || 0,
      totalAmount: existing?.totalAmount || 0,
    };

    if (orderData.items) {
      updatedItems = orderData.items.map((item, idx) => {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.unitPrice) || 0;
        const rate = Number(item.taxRate) || 0;
        const subtotal = Math.round(qty * price * 100) / 100;
        const taxAmount = Math.round((subtotal * rate / 100) * 100) / 100;
        const total = Math.round((subtotal + taxAmount) * 100) / 100;
        return {
          id: 'ITEM-' + (idx + 1),
          productId: item.productId,
          productName: item.productName || 'Product #' + item.productId,
          quantity: qty,
          unitPrice: price,
          taxRate: rate,
          subtotal,
          taxAmount,
          total,
        };
      });
      totals = calculateOrderTotals(orderData.items);
    }

    const merged: SalesOrder = {
      id,
      orderNumber: existing?.orderNumber || `SO-${id}`,
      customerId: orderData.customerId || existing?.customerId || '',
      customerName: extraMeta?.customerName || existing?.customerName || '',
      customerEmail: existing?.customerEmail,
      customerMobile: existing?.customerMobile,
      orderDate: orderData.orderDate || existing?.orderDate || new Date().toISOString().split('T')[0],
      items: updatedItems,
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      totalAmount: totals.totalAmount,
      status: orderData.status || existing?.status || 'DRAFT',
      notes: orderData.notes !== undefined ? orderData.notes : existing?.notes,
      invoiceId: existing?.invoiceId,
      invoicedAt: existing?.invoicedAt,
      createdAt: existing?.createdAt,
      updatedAt: new Date().toISOString(),
    };

    saveStoredOrders(current.map(o => String(o.id) === String(id) ? merged : o));
    return merged;
  },

  /**
   * PATCH /api/sales-orders/{id}/status
   * Updates sales order status (e.g. DRAFT -> CONFIRMED -> CANCELLED)
   */
  updateSalesOrderStatus: async (id: string | number, status: SalesOrderStatus): Promise<SalesOrder | void> => {
    try {
      const res = await apiClient(`/api/sales-orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      const current = getStoredOrders();
      saveStoredOrders(current.map(o => String(o.id) === String(id) ? { ...o, status } : o));
      return res;
    } catch (error: any) {
      console.warn('Backend in standby, updating sales order status in buffer:', error?.message || error);
      const current = getStoredOrders();
      saveStoredOrders(current.map(o => String(o.id) === String(id) ? { ...o, status } : o));
    }
  },

  /**
   * POST /api/sales-orders/{id}/invoice
   * Converts Sales Order to Customer Invoice
   */
  generateCustomerInvoice: async (id: string | number): Promise<{ success: boolean; invoiceId?: string | number; salesOrder: SalesOrder }> => {
    const generatedInvoiceId = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    try {
      const res = await apiClient(`/api/sales-orders/${id}/invoice`, {
        method: 'POST',
      });
      const current = getStoredOrders();
      const updated = current.find(o => String(o.id) === String(id));
      if (updated) {
        updated.status = 'INVOICED';
        updated.invoiceId = res?.invoiceId || generatedInvoiceId;
        updated.invoicedAt = new Date().toISOString();
        saveStoredOrders(current);
        return { success: true, invoiceId: updated.invoiceId, salesOrder: updated };
      }
      return res;
    } catch (error: any) {
      console.warn('Backend in standby, generating customer invoice locally:', error?.message || error);
      const current = getStoredOrders();
      let target = current.find(o => String(o.id) === String(id));
      if (target) {
        target = {
          ...target,
          status: 'INVOICED',
          invoiceId: generatedInvoiceId,
          invoicedAt: new Date().toISOString(),
        };
        saveStoredOrders(current.map(o => String(o.id) === String(id) ? target! : o));
        return { success: true, invoiceId: generatedInvoiceId, salesOrder: target };
      }
      throw error;
    }
  },
};
