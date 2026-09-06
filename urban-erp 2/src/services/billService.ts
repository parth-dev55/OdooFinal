import { apiClient } from './apiClient';
import { VendorBill, BillFilterParams, BillStatus, PaymentStatus } from '../types/bill';
import { UserProfile } from './authService';

const BILLS_STORAGE_KEY = 'urban_erp_bills_store_v1';
const PURCHASE_ORDERS_STORAGE_KEY = 'urban_erp_purchase_orders_store_v1';

export function getStoredBills(): VendorBill[] {
  try {
    const raw = localStorage.getItem(BILLS_STORAGE_KEY);
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

export function saveStoredBills(bills: VendorBill[]): void {
  try {
    localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(bills));
  } catch (e) {
    // Ignore storage quota error
  }
}

/**
 * Synchronize bills with billed purchase orders in localStorage if offline/standby
 */
function syncBillsWithPurchaseOrders(bills: VendorBill[]): VendorBill[] {
  try {
    const rawOrders = localStorage.getItem(PURCHASE_ORDERS_STORAGE_KEY);
    if (!rawOrders) return bills;
    const orders = JSON.parse(rawOrders);
    if (!Array.isArray(orders)) return bills;

    const existingMap = new Map<string, VendorBill>();
    bills.forEach(bill => {
      existingMap.set(String(bill.id), bill);
      existingMap.set(bill.billNumber, bill);
      if (bill.purchaseOrderId) existingMap.set(`PO-${bill.purchaseOrderId}`, bill);
    });

    const newBills: VendorBill[] = [];

    orders.forEach((po: any) => {
      if (po.status === 'BILLED' || po.billId) {
        const bNum = po.billId || `BILL-${new Date(po.orderDate || Date.now()).getFullYear()}-${String(po.id).slice(-4)}`;
        if (!existingMap.has(String(po.billId)) && !existingMap.has(bNum) && !existingMap.has(`PO-${po.id}`)) {
          // Calculate due date (+30 days default)
          const billDate = po.billedAt ? po.billedAt.split('T')[0] : (po.orderDate || new Date().toISOString().split('T')[0]);
          const d = new Date(billDate);
          d.setDate(d.getDate() + 30);
          const dueDate = d.toISOString().split('T')[0];

          const generatedBill: VendorBill = {
            id: po.billId || `bill-${Date.now()}-${po.id}`,
            billNumber: bNum,
            purchaseOrderId: po.id,
            purchaseOrderNumber: po.orderNumber,
            vendorId: po.vendorId,
            vendorName: po.vendorName || 'Vendor',
            vendorEmail: po.vendorEmail,
            vendorMobile: po.vendorMobile,
            billDate: billDate,
            dueDate: dueDate,
            items: (po.items || []).map((item: any, idx: number) => ({
              id: item.id || `bill-item-${idx + 1}`,
              productId: item.productId,
              productName: item.productName || 'Product ' + (idx + 1),
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice || 0,
              total: item.total || ((item.quantity || 1) * (item.unitPrice || 0)),
            })),
            subtotal: po.subtotal || po.totalAmount || 0,
            totalAmount: po.totalAmount || 0,
            amountPaid: 0,
            balanceDue: po.totalAmount || 0,
            status: 'POSTED',
            paymentStatus: 'UNPAID',
            notes: po.notes ? `Derived from Purchase Order ${po.orderNumber}. ${po.notes}` : `Generated from Purchase Order ${po.orderNumber}`,
            createdAt: po.billedAt || new Date().toISOString(),
          };

          newBills.push(generatedBill);
          existingMap.set(String(generatedBill.id), generatedBill);
          existingMap.set(generatedBill.billNumber, generatedBill);
          existingMap.set(`PO-${po.id}`, generatedBill);
        }
      }
    });

    if (newBills.length > 0) {
      const combined = [...newBills, ...bills];
      saveStoredBills(combined);
      return combined;
    }
  } catch (e) {
    // Ignore sync errors
  }
  return bills;
}

export const billService = {
  /**
   * GET /api/bills
   * Loads all vendor bills
   */
  getBills: async (params?: BillFilterParams): Promise<VendorBill[]> => {
    try {
      let query = '';
      if (params) {
        const q = new URLSearchParams();
        if (params.search) q.append('search', params.search);
        if (params.vendorId) q.append('vendorId', params.vendorId);
        if (params.status) q.append('status', params.status);
        if (params.paymentStatus) q.append('paymentStatus', params.paymentStatus);
        if (params.startDate) q.append('startDate', params.startDate);
        if (params.endDate) q.append('endDate', params.endDate);
        const qs = q.toString();
        if (qs) query = `?${qs}`;
      }

      const res = await apiClient(`/api/bills${query}`, { method: 'GET' });
      if (Array.isArray(res)) {
        saveStoredBills(res);
        return res;
      }
    } catch (error: any) {
      console.warn('Backend in standby, loading bills from local buffer:', error?.message || error);
    }

    let localBills = getStoredBills();
    localBills = syncBillsWithPurchaseOrders(localBills);

    // Apply filtering on local buffer
    if (params) {
      if (params.search) {
        const s = params.search.toLowerCase();
        localBills = localBills.filter(b => 
          b.billNumber.toLowerCase().includes(s) || 
          b.vendorName.toLowerCase().includes(s)
        );
      }
      if (params.vendorId && params.vendorId !== 'ALL') {
        localBills = localBills.filter(b => String(b.vendorId) === String(params.vendorId));
      }
      if (params.status && params.status !== 'ALL') {
        localBills = localBills.filter(b => b.status === params.status);
      }
      if (params.paymentStatus && params.paymentStatus !== 'ALL') {
        localBills = localBills.filter(b => b.paymentStatus === params.paymentStatus);
      }
      if (params.startDate) {
        localBills = localBills.filter(b => b.billDate >= params.startDate!);
      }
      if (params.endDate) {
        localBills = localBills.filter(b => b.billDate <= params.endDate!);
      }
    }

    return localBills;
  },

  /**
   * GET /api/bills/{id}
   * Fetches single vendor bill details
   */
  getBillById: async (id: string | number): Promise<VendorBill> => {
    try {
      const res = await apiClient(`/api/bills/${id}`, { method: 'GET' });
      if (res && (res.id || res.billNumber)) {
        return res;
      }
    } catch (error: any) {
      console.warn(`Backend in standby, finding bill #${id} locally:`, error?.message || error);
    }

    const current = syncBillsWithPurchaseOrders(getStoredBills());
    const found = current.find(b => String(b.id) === String(id) || b.billNumber === String(id));
    if (found) {
      return found;
    }

    throw new Error(`Vendor Bill ${id} not found.`);
  },

  /**
   * POST /api/purchase-orders/{id}/bill
   * Converts a Purchase Order into a Vendor Bill
   */
  generateBillFromPurchaseOrder: async (purchaseOrderId: string | number, purchaseOrderData?: any): Promise<VendorBill> => {
    const generatedBillNumber = `BILL-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    try {
      const res = await apiClient(`/api/purchase-orders/${purchaseOrderId}/bill`, {
        method: 'POST',
      });
      if (res && (res.id || res.billNumber)) {
        const current = getStoredBills();
        saveStoredBills([res, ...current.filter(b => String(b.id) !== String(res.id))]);
        return res;
      }
    } catch (error: any) {
      console.warn('Backend in standby, generating vendor bill in buffer:', error?.message || error);
    }

    // Fallback if backend is on standby
    const po = purchaseOrderData;
    const billDate = new Date().toISOString().split('T')[0];
    const d = new Date();
    d.setDate(d.getDate() + 30);
    const dueDate = d.toISOString().split('T')[0];

    const newBill: VendorBill = {
      id: `bill-${Date.now()}`,
      billNumber: generatedBillNumber,
      purchaseOrderId: purchaseOrderId,
      purchaseOrderNumber: po?.orderNumber || `PO-${purchaseOrderId}`,
      vendorId: po?.vendorId || '1',
      vendorName: po?.vendorName || 'Vendor',
      vendorEmail: po?.vendorEmail,
      vendorMobile: po?.vendorMobile,
      billDate: billDate,
      dueDate: dueDate,
      items: (po?.items || []).map((item: any, idx: number) => ({
        id: `bill-item-${idx + 1}`,
        productId: item.productId,
        productName: item.productName || `Item #${item.productId}`,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        total: item.total || ((item.quantity || 1) * (item.unitPrice || 0)),
      })),
      subtotal: po?.subtotal || po?.totalAmount || 0,
      totalAmount: po?.totalAmount || 0,
      amountPaid: 0,
      balanceDue: po?.totalAmount || 0,
      status: 'POSTED',
      paymentStatus: 'UNPAID',
      notes: po?.notes ? `Derived from Purchase Order ${po?.orderNumber}. ${po?.notes}` : `Generated from Purchase Order ${po?.orderNumber || purchaseOrderId}`,
      createdAt: new Date().toISOString(),
    };

    const current = getStoredBills();
    saveStoredBills([newBill, ...current]);
    return newBill;
  },

  /**
   * PATCH /api/bills/{id}/status
   */
  updateBillStatus: async (id: string | number, status: BillStatus, paymentStatus?: PaymentStatus): Promise<VendorBill> => {
    try {
      const res = await apiClient(`/api/bills/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, paymentStatus }),
      });
      if (res) {
        const current = getStoredBills();
        saveStoredBills(current.map(b => String(b.id) === String(id) ? { ...b, ...res } : b));
        return res;
      }
    } catch (error: any) {
      console.warn('Backend in standby, updating bill status locally:', error?.message || error);
    }

    const current = getStoredBills();
    const updated = current.map(b => {
      if (String(b.id) === String(id) || b.billNumber === String(id)) {
        return {
          ...b,
          status,
          ...(paymentStatus ? { paymentStatus } : {}),
          updatedAt: new Date().toISOString(),
        };
      }
      return b;
    });

    saveStoredBills(updated);
    const target = updated.find(b => String(b.id) === String(id) || b.billNumber === String(id));
    if (!target) throw new Error(`Vendor Bill ${id} not found.`);
    return target;
  },

  /**
   * Filter bills for CONTACT role
   */
  filterForRole: (bills: VendorBill[], profile: UserProfile | null): VendorBill[] => {
    if (!profile) return bills;
    if (profile.role === 'ADMIN' || profile.role === 'ACCOUNTANT') {
      return bills;
    }
    // CONTACT role: only view bills where vendor matches profile
    return bills.filter(b => {
      const matchesEmail = profile.email && b.vendorEmail?.toLowerCase() === profile.email.toLowerCase();
      const matchesId = profile.id && String(b.vendorId) === String(profile.id);
      const matchesName = profile.name && b.vendorName.toLowerCase().includes(profile.name.toLowerCase());
      return matchesEmail || matchesId || matchesName;
    });
  }
};
