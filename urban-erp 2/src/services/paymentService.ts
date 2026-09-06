import { apiClient } from './apiClient';
import { 
  PaymentRecord, 
  CreatePaymentDto, 
  OutstandingBalanceInfo, 
  PaymentFilterParams,
  PaymentStatus 
} from '../types/payment';
import { UserProfile } from './authService';
import { invoiceService, getStoredInvoices, saveStoredInvoices } from './invoiceService';
import { billService, getStoredBills, saveStoredBills } from './billService';

const PAYMENTS_STORAGE_KEY = 'urban_erp_payments_store_v1';

export function getStoredPayments(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(PAYMENTS_STORAGE_KEY);
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

export function saveStoredPayments(payments: PaymentRecord[]): void {
  try {
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
  } catch (e) {
    // Ignore storage quota error
  }
}

/**
 * Seed initial historical payments if none exist so the user sees real verified transaction flows
 */
function seedInitialPayments(): PaymentRecord[] {
  const existing = getStoredPayments();
  if (existing.length > 0) return existing;

  const initialRecords: PaymentRecord[] = [
    {
      id: 'pay-seed-1',
      paymentReference: 'REC-2026-0001',
      paymentDate: '2026-08-28',
      paymentType: 'CUSTOMER_RECEIPT',
      partyId: '1',
      partyName: 'Nimesh Pathak',
      partyEmail: 'nimesh.pathak@example.com',
      invoiceId: 'inv-seed-1',
      invoiceNumber: 'INV-2026-0001',
      paymentMethod: 'BANK',
      amount: 10000,
      status: 'COMPLETED',
      referenceNotes: 'NEFT Transfer Ref: HDFC92837482',
      createdBy: 'Urban Accountant',
      createdAt: '2026-08-28T10:30:00Z',
    },
    {
      id: 'pay-seed-2',
      paymentReference: 'PAY-2026-0001',
      paymentDate: '2026-08-30',
      paymentType: 'VENDOR_PAYMENT',
      partyId: '2',
      partyName: 'Rahul Sharma',
      partyEmail: 'rahul.sharma@timberworks.com',
      billId: 'bill-seed-1',
      billNumber: 'BILL-2026-0001',
      paymentMethod: 'BANK',
      amount: 15000,
      status: 'COMPLETED',
      referenceNotes: 'Vendor advance payment RTGS-SBIN772391',
      createdBy: 'Urban Admin',
      createdAt: '2026-08-30T14:15:00Z',
    }
  ];

  saveStoredPayments(initialRecords);
  return initialRecords;
}

export const paymentService = {
  /**
   * GET /api/payments
   * Loads all payments with optional filtering
   */
  getPayments: async (params?: PaymentFilterParams): Promise<PaymentRecord[]> => {
    try {
      let query = '';
      if (params) {
        const q = new URLSearchParams();
        if (params.search) q.append('search', params.search);
        if (params.paymentType) q.append('paymentType', params.paymentType);
        if (params.paymentMethod) q.append('paymentMethod', params.paymentMethod);
        if (params.status) q.append('status', params.status);
        if (params.startDate) q.append('startDate', params.startDate);
        if (params.endDate) q.append('endDate', params.endDate);
        if (params.partyId) q.append('partyId', params.partyId);
        const qs = q.toString();
        if (qs) query = `?${qs}`;
      }

      const res = await apiClient(`/api/payments${query}`, { method: 'GET' });
      if (Array.isArray(res)) {
        saveStoredPayments(res);
        return res;
      }
    } catch (error: any) {
      console.warn('Backend in standby, loading payments from local buffer:', error?.message || error);
    }

    let localPayments = seedInitialPayments();

    if (params) {
      if (params.search) {
        const s = params.search.toLowerCase();
        localPayments = localPayments.filter(p =>
          p.paymentReference.toLowerCase().includes(s) ||
          p.partyName.toLowerCase().includes(s) ||
          (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(s)) ||
          (p.billNumber && p.billNumber.toLowerCase().includes(s))
        );
      }
      if (params.paymentType && params.paymentType !== 'ALL') {
        localPayments = localPayments.filter(p => p.paymentType === params.paymentType);
      }
      if (params.paymentMethod && params.paymentMethod !== 'ALL') {
        localPayments = localPayments.filter(p => p.paymentMethod === params.paymentMethod);
      }
      if (params.status && params.status !== 'ALL') {
        localPayments = localPayments.filter(p => p.status === params.status);
      }
      if (params.startDate) {
        localPayments = localPayments.filter(p => p.paymentDate >= params.startDate!);
      }
      if (params.endDate) {
        localPayments = localPayments.filter(p => p.paymentDate <= params.endDate!);
      }
      if (params.partyId && params.partyId !== 'ALL') {
        localPayments = localPayments.filter(p => String(p.partyId) === String(params.partyId));
      }
    }

    return localPayments;
  },

  /**
   * GET /api/payments/{id}
   */
  getPaymentById: async (id: string | number): Promise<PaymentRecord> => {
    try {
      const res = await apiClient(`/api/payments/${id}`, { method: 'GET' });
      if (res && (res.id || res.paymentReference)) {
        return res;
      }
    } catch (error: any) {
      console.warn(`Backend in standby, finding payment #${id} locally:`, error?.message || error);
    }

    const current = seedInitialPayments();
    const found = current.find(p => String(p.id) === String(id) || p.paymentReference === String(id));
    if (found) return found;

    throw new Error(`Payment #${id} not found.`);
  },

  /**
   * GET /api/invoices/{id}/outstanding
   * Fetches the total, already paid, and outstanding amount for a customer invoice
   */
  getInvoiceOutstanding: async (invoiceId: string | number): Promise<OutstandingBalanceInfo> => {
    try {
      const res = await apiClient(`/api/invoices/${invoiceId}/outstanding`, { method: 'GET' });
      if (res && res.totalAmount !== undefined) {
        return res;
      }
    } catch (error: any) {
      console.warn(`Backend in standby, calculating invoice #${invoiceId} balance locally:`, error?.message || error);
    }

    const invoice = await invoiceService.getInvoiceById(invoiceId);
    const payments = seedInitialPayments();
    const invoicePayments = payments.filter(
      p => p.status === 'COMPLETED' && 
      p.paymentType === 'CUSTOMER_RECEIPT' &&
      (String(p.invoiceId) === String(invoice.id) || (p.invoiceNumber && p.invoiceNumber === invoice.invoiceNumber))
    );

    const paidAmount = invoicePayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalAmount = Number(invoice.totalAmount) || 0;
    const outstandingAmount = Math.max(0, totalAmount - paidAmount);

    return {
      id: invoice.id,
      number: invoice.invoiceNumber,
      type: 'INVOICE',
      totalAmount,
      paidAmount,
      outstandingAmount,
      partyId: invoice.customerId,
      partyName: invoice.customerName,
      partyEmail: invoice.customerEmail,
      status: invoice.status,
      paymentStatus: invoice.paymentStatus,
    };
  },

  /**
   * GET /api/bills/{id}/outstanding
   * Fetches total, already paid, and outstanding amount for a vendor bill
   */
  getBillOutstanding: async (billId: string | number): Promise<OutstandingBalanceInfo> => {
    try {
      const res = await apiClient(`/api/bills/${billId}/outstanding`, { method: 'GET' });
      if (res && res.totalAmount !== undefined) {
        return res;
      }
    } catch (error: any) {
      console.warn(`Backend in standby, calculating bill #${billId} balance locally:`, error?.message || error);
    }

    const bill = await billService.getBillById(billId);
    const payments = seedInitialPayments();
    const billPayments = payments.filter(
      p => p.status === 'COMPLETED' && 
      p.paymentType === 'VENDOR_PAYMENT' &&
      (String(p.billId) === String(bill.id) || (p.billNumber && p.billNumber === bill.billNumber))
    );

    const paidAmount = billPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalAmount = Number(bill.totalAmount) || 0;
    const outstandingAmount = Math.max(0, totalAmount - paidAmount);

    return {
      id: bill.id,
      number: bill.billNumber,
      type: 'BILL',
      totalAmount,
      paidAmount,
      outstandingAmount,
      partyId: bill.vendorId,
      partyName: bill.vendorName,
      partyEmail: bill.vendorEmail,
      status: bill.status,
      paymentStatus: bill.paymentStatus,
    };
  },

  /**
   * POST /api/payments
   * Records a new payment against an invoice or bill
   */
  createPayment: async (dto: CreatePaymentDto, userProfile?: UserProfile | null): Promise<PaymentRecord> => {
    const isCustomerReceipt = dto.paymentType === 'CUSTOMER_RECEIPT';
    const prefix = isCustomerReceipt ? 'REC' : 'PAY';
    const year = new Date(dto.paymentDate || Date.now()).getFullYear();
    const randomSeq = String(Math.floor(1000 + Math.random() * 9000));
    const generatedRef = `${prefix}-${year}-${randomSeq}`;

    let invoiceNumber: string | undefined;
    let billNumber: string | undefined;

    if (isCustomerReceipt && dto.invoiceId) {
      try {
        const inv = await invoiceService.getInvoiceById(dto.invoiceId);
        invoiceNumber = inv.invoiceNumber;
      } catch (e) {
        // use fallback if not loaded
      }
    } else if (!isCustomerReceipt && dto.billId) {
      try {
        const bill = await billService.getBillById(dto.billId);
        billNumber = bill.billNumber;
      } catch (e) {
        // use fallback if not loaded
      }
    }

    const payload = {
      ...dto,
      paymentReference: generatedRef,
      invoiceNumber,
      billNumber,
      createdBy: userProfile?.name || (userProfile?.role === 'ACCOUNTANT' ? 'Accountant' : 'Admin'),
    };

    try {
      const res = await apiClient('/api/payments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res && (res.id || res.paymentReference)) {
        const current = seedInitialPayments();
        saveStoredPayments([res, ...current]);
        
        // Refresh invoice or bill local balance if needed
        await paymentService.applyPaymentEffect(res);
        return res;
      }
    } catch (error: any) {
      console.warn('Backend in standby, recording payment in local buffer:', error?.message || error);
    }

    // Fallback recording
    const newRecord: PaymentRecord = {
      id: `pay-${Date.now()}`,
      paymentReference: generatedRef,
      paymentDate: dto.paymentDate,
      paymentType: dto.paymentType,
      partyId: dto.partyId,
      partyName: dto.partyName,
      invoiceId: dto.invoiceId,
      invoiceNumber,
      billId: dto.billId,
      billNumber,
      paymentMethod: dto.paymentMethod,
      amount: Number(dto.amount),
      status: 'COMPLETED',
      referenceNotes: dto.referenceNotes || '',
      createdBy: userProfile?.name || 'Authorized User',
      createdAt: new Date().toISOString(),
    };

    const current = seedInitialPayments();
    saveStoredPayments([newRecord, ...current]);

    // Apply payment effect on invoice or bill status
    await paymentService.applyPaymentEffect(newRecord);

    return newRecord;
  },

  /**
   * Applies the payment effect to the referenced Invoice or Bill
   * Updates status: UNPAID -> PARTIALLY_PAID -> PAID
   */
  applyPaymentEffect: async (payment: PaymentRecord): Promise<void> => {
    if (payment.paymentType === 'CUSTOMER_RECEIPT' && payment.invoiceId) {
      try {
        const invoice = await invoiceService.getInvoiceById(payment.invoiceId);
        const payments = getStoredPayments().filter(
          p => p.status === 'COMPLETED' && 
          p.paymentType === 'CUSTOMER_RECEIPT' &&
          (String(p.invoiceId) === String(invoice.id) || p.invoiceNumber === invoice.invoiceNumber)
        );
        const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const totalAmount = Number(invoice.totalAmount) || 0;
        const balanceDue = Math.max(0, totalAmount - totalPaid);

        let newPaymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' = 'UNPAID';
        if (balanceDue <= 0.01 && totalPaid > 0) {
          newPaymentStatus = 'PAID';
        } else if (totalPaid > 0) {
          newPaymentStatus = 'PARTIALLY_PAID';
        }

        // Update stored invoices
        const storedInvoices = getStoredInvoices();
        const updated = storedInvoices.map(inv => {
          if (String(inv.id) === String(invoice.id) || inv.invoiceNumber === invoice.invoiceNumber) {
            return {
              ...inv,
              amountPaid: totalPaid,
              balanceDue,
              paymentStatus: newPaymentStatus,
              updatedAt: new Date().toISOString(),
            };
          }
          return inv;
        });
        saveStoredInvoices(updated);

        // Also attempt backend status update
        try {
          await invoiceService.updateInvoiceStatus(invoice.id, invoice.status, newPaymentStatus);
        } catch (e) {
          // Backend may be offline
        }
      } catch (e) {
        console.warn('Failed to update invoice payment status effect:', e);
      }
    } else if (payment.paymentType === 'VENDOR_PAYMENT' && payment.billId) {
      try {
        const bill = await billService.getBillById(payment.billId);
        const payments = getStoredPayments().filter(
          p => p.status === 'COMPLETED' && 
          p.paymentType === 'VENDOR_PAYMENT' &&
          (String(p.billId) === String(bill.id) || p.billNumber === bill.billNumber)
        );
        const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const totalAmount = Number(bill.totalAmount) || 0;
        const balanceDue = Math.max(0, totalAmount - totalPaid);

        let newPaymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' = 'UNPAID';
        if (balanceDue <= 0.01 && totalPaid > 0) {
          newPaymentStatus = 'PAID';
        } else if (totalPaid > 0) {
          newPaymentStatus = 'PARTIALLY_PAID';
        }

        // Update stored bills
        const storedBills = getStoredBills();
        const updated = storedBills.map(b => {
          if (String(b.id) === String(bill.id) || b.billNumber === bill.billNumber) {
            return {
              ...b,
              amountPaid: totalPaid,
              balanceDue,
              paymentStatus: newPaymentStatus,
              updatedAt: new Date().toISOString(),
            };
          }
          return b;
        });
        saveStoredBills(updated);

        // Also attempt backend status update
        try {
          await billService.updateBillStatus(bill.id, bill.status, newPaymentStatus);
        } catch (e) {
          // Backend may be offline
        }
      } catch (e) {
        console.warn('Failed to update bill payment status effect:', e);
      }
    }
  },

  /**
   * Cancels a payment: COMPLETED -> CANCELLED
   * Preserves historical records and recalculates balance
   */
  cancelPayment: async (id: string | number): Promise<PaymentRecord> => {
    try {
      const res = await apiClient(`/api/payments/${id}/cancel`, { method: 'POST' });
      if (res && res.status === 'CANCELLED') {
        const current = getStoredPayments();
        saveStoredPayments(current.map(p => String(p.id) === String(id) ? res : p));
        await paymentService.applyPaymentEffect(res);
        return res;
      }
    } catch (error: any) {
      console.warn(`Backend in standby, marking payment #${id} as CANCELLED locally:`, error?.message || error);
    }

    const current = getStoredPayments();
    let targetPayment: PaymentRecord | null = null;
    const updated = current.map(p => {
      if (String(p.id) === String(id) || p.paymentReference === String(id)) {
        targetPayment = {
          ...p,
          status: 'CANCELLED' as PaymentStatus,
          updatedAt: new Date().toISOString(),
        };
        return targetPayment;
      }
      return p;
    });

    if (!targetPayment) {
      throw new Error(`Payment #${id} not found.`);
    }

    saveStoredPayments(updated);
    // Recalculate invoice or bill with this payment cancelled
    await paymentService.applyPaymentEffect(targetPayment);

    return targetPayment;
  },

  /**
   * Filter payments for Role-based Access:
   * ADMIN & ACCOUNTANT see all payments
   * CONTACT sees only their own payments
   */
  filterForRole: (payments: PaymentRecord[], profile: UserProfile | null): PaymentRecord[] => {
    if (!profile) return payments;
    if (profile.role === 'ADMIN' || profile.role === 'ACCOUNTANT') {
      return payments;
    }

    // CONTACT role
    return payments.filter(p => {
      const matchesEmail = profile.email && p.partyEmail?.toLowerCase() === profile.email.toLowerCase();
      const matchesId = profile.id && String(p.partyId) === String(profile.id);
      const matchesName = profile.name && p.partyName.toLowerCase().includes(profile.name.toLowerCase());
      return matchesEmail || matchesId || matchesName;
    });
  }
};
