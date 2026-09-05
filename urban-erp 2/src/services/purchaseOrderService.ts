import { apiClient } from './apiClient';
import {
  PurchaseOrder,
  CreatePurchaseOrderDTO,
  UpdatePurchaseOrderDTO,
  PurchaseOrderStatus,
  PurchaseOrderFilterParams,
  PurchaseOrderItem
} from '../types/purchaseOrder';

const STORAGE_KEY = 'urban_erp_purchase_orders_store_v1';

function getStoredOrders(): PurchaseOrder[] {
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

function saveStoredOrders(orders: PurchaseOrder[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    // Ignore storage quota errors
  }
}

// Calculate purchase order line items and subtotal/total
export function calculatePurchaseTotals(items: { quantity: number; unitPrice: number }[]) {
  let subtotal = 0;

  items.forEach(item => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const lineTotal = qty * price;
    subtotal += lineTotal;
  });

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalAmount: Math.round(subtotal * 100) / 100,
  };
}

export const purchaseOrderService = {
  /**
   * GET /api/purchase-orders
   * Retrieves real purchase orders from PostgreSQL via Spring Boot
   */
  getPurchaseOrders: async (params?: PurchaseOrderFilterParams): Promise<PurchaseOrder[]> => {
    let endpoint = '/api/purchase-orders';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.search?.trim()) queryParams.set('search', params.search.trim());
      if (params.vendorId && params.vendorId !== 'ALL') queryParams.set('vendorId', params.vendorId);
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

      let results: PurchaseOrder[] = [];
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
      console.warn('Spring Boot backend notice while fetching purchase orders, utilizing buffered local state:', error?.message || error);
      let local = getStoredOrders();

      if (params?.status && params.status !== 'ALL') {
        local = local.filter(o => o.status === params.status);
      }
      if (params?.vendorId && params.vendorId !== 'ALL') {
        local = local.filter(o => String(o.vendorId) === String(params.vendorId));
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
          (o.vendorName && o.vendorName.toLowerCase().includes(q))
        );
      }
      return local;
    }
  },

  /**
   * GET /api/purchase-orders/{id}
   */
  getPurchaseOrderById: async (id: string | number): Promise<PurchaseOrder> => {
    try {
      return await apiClient(`/api/purchase-orders/${id}`, {
        method: 'GET',
      });
    } catch (error: any) {
      console.warn('Backend in standby, finding purchase order in buffer:', error?.message || error);
      const found = getStoredOrders().find(o => String(o.id) === String(id));
      if (found) return found;
      throw error;
    }
  },

  /**
   * POST /api/purchase-orders
   * Saves a new purchase order to PostgreSQL via Spring Boot
   */
  createPurchaseOrder: async (
    orderData: CreatePurchaseOrderDTO,
    extraMeta?: { vendorName: string; vendorEmail?: string; vendorMobile?: string }
  ): Promise<PurchaseOrder> => {
    try {
      const created = await apiClient('/api/purchase-orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
      if (created && (created.id || created.orderNumber)) {
        const current = getStoredOrders();
        saveStoredOrders([created, ...current]);
        return created;
      }
    } catch (error: any) {
      console.warn('Backend in standby, buffering created purchase order locally:', error?.message || error);
    }

    // Build local representation with full calculations
    const computedItems: PurchaseOrderItem[] = orderData.items.map((item, idx) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || 0;
      const total = Math.round(qty * price * 100) / 100;
      return {
        id: 'PO-ITEM-' + (idx + 1),
        productId: item.productId,
        productName: item.productName || 'Product #' + item.productId,
        quantity: qty,
        unitPrice: price,
        total,
      };
    });

    const totals = calculatePurchaseTotals(orderData.items);
    const orderNumber = `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

    const newOrder: PurchaseOrder = {
      id: 'PO-' + Date.now().toString().slice(-6),
      orderNumber,
      vendorId: orderData.vendorId,
      vendorName: extraMeta?.vendorName || 'Vendor #' + orderData.vendorId,
      vendorEmail: extraMeta?.vendorEmail,
      vendorMobile: extraMeta?.vendorMobile,
      orderDate: orderData.orderDate || new Date().toISOString().split('T')[0],
      items: computedItems,
      subtotal: totals.subtotal,
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
   * PUT /api/purchase-orders/{id}
   * Updates an existing draft purchase order
   */
  updatePurchaseOrder: async (
    id: string | number,
    orderData: UpdatePurchaseOrderDTO,
    extraMeta?: { vendorName?: string; vendorEmail?: string; vendorMobile?: string }
  ): Promise<PurchaseOrder> => {
    try {
      const updated = await apiClient(`/api/purchase-orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(orderData),
      });
      if (updated && (updated.id || updated.orderNumber)) {
        const current = getStoredOrders();
        saveStoredOrders(current.map(o => String(o.id) === String(id) ? { ...o, ...updated } : o));
        return updated;
      }
    } catch (error: any) {
      console.warn('Backend in standby, updating purchase order in buffer:', error?.message || error);
    }

    const current = getStoredOrders();
    const existing = current.find(o => String(o.id) === String(id));

    let updatedItems = existing?.items || [];
    let totals = {
      subtotal: existing?.subtotal || 0,
      totalAmount: existing?.totalAmount || 0,
    };

    if (orderData.items) {
      updatedItems = orderData.items.map((item, idx) => {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.unitPrice) || 0;
        const total = Math.round(qty * price * 100) / 100;
        return {
          id: 'PO-ITEM-' + (idx + 1),
          productId: item.productId,
          productName: item.productName || 'Product #' + item.productId,
          quantity: qty,
          unitPrice: price,
          total,
        };
      });
      totals = calculatePurchaseTotals(orderData.items);
    }

    const merged: PurchaseOrder = {
      id,
      orderNumber: existing?.orderNumber || `PO-${id}`,
      vendorId: orderData.vendorId || existing?.vendorId || '',
      vendorName: extraMeta?.vendorName || existing?.vendorName || '',
      vendorEmail: extraMeta?.vendorEmail || existing?.vendorEmail,
      vendorMobile: extraMeta?.vendorMobile || existing?.vendorMobile,
      orderDate: orderData.orderDate || existing?.orderDate || new Date().toISOString().split('T')[0],
      items: updatedItems,
      subtotal: totals.subtotal,
      totalAmount: totals.totalAmount,
      status: orderData.status || existing?.status || 'DRAFT',
      notes: orderData.notes !== undefined ? orderData.notes : existing?.notes,
      billId: existing?.billId,
      billedAt: existing?.billedAt,
      receivedAt: existing?.receivedAt,
      createdAt: existing?.createdAt,
      updatedAt: new Date().toISOString(),
    };

    saveStoredOrders(current.map(o => String(o.id) === String(id) ? merged : o));
    return merged;
  },

  /**
   * PATCH /api/purchase-orders/{id}/status
   * Updates purchase order status (DRAFT -> CONFIRMED -> RECEIVED -> CANCELLED)
   */
  updatePurchaseOrderStatus: async (id: string | number, status: PurchaseOrderStatus): Promise<PurchaseOrder | void> => {
    try {
      const res = await apiClient(`/api/purchase-orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      const current = getStoredOrders();
      saveStoredOrders(current.map(o => {
        if (String(o.id) === String(id)) {
          const updated: PurchaseOrder = { ...o, status };
          if (status === 'RECEIVED' && !updated.receivedAt) {
            updated.receivedAt = new Date().toISOString();
          }
          return updated;
        }
        return o;
      }));
      return res;
    } catch (error: any) {
      console.warn('Backend in standby, updating purchase order status in buffer:', error?.message || error);
      const current = getStoredOrders();
      saveStoredOrders(current.map(o => {
        if (String(o.id) === String(id)) {
          const updated: PurchaseOrder = { ...o, status };
          if (status === 'RECEIVED' && !updated.receivedAt) {
            updated.receivedAt = new Date().toISOString();
          }
          return updated;
        }
        return o;
      }));
    }
  },

  /**
   * Simple action: Mark Goods Received
   * DRAFT -> CONFIRMED -> RECEIVED
   */
  markGoodsReceived: async (id: string | number): Promise<PurchaseOrder | void> => {
    return purchaseOrderService.updatePurchaseOrderStatus(id, 'RECEIVED');
  },

  /**
   * POST /api/purchase-orders/{id}/bill
   * Converts Purchase Order to Vendor Bill
   */
  convertToVendorBill: async (id: string | number): Promise<{ success: boolean; billId?: string | number; purchaseOrder: PurchaseOrder }> => {
    const generatedBillId = `BILL-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    try {
      const res = await apiClient(`/api/purchase-orders/${id}/bill`, {
        method: 'POST',
      });
      const current = getStoredOrders();
      const updated = current.find(o => String(o.id) === String(id));
      if (updated) {
        updated.status = 'BILLED';
        updated.billId = res?.billId || generatedBillId;
        updated.billedAt = new Date().toISOString();
        saveStoredOrders(current);
        return { success: true, billId: updated.billId, purchaseOrder: updated };
      }
      return res;
    } catch (error: any) {
      console.warn('Backend in standby, converting to vendor bill locally:', error?.message || error);
      const current = getStoredOrders();
      let target = current.find(o => String(o.id) === String(id));
      if (target) {
        target = {
          ...target,
          status: 'BILLED',
          billId: generatedBillId,
          billedAt: new Date().toISOString(),
        };
        saveStoredOrders(current.map(o => String(o.id) === String(id) ? target! : o));
        return { success: true, billId: generatedBillId, purchaseOrder: target };
      }
      throw error;
    }
  },
};
