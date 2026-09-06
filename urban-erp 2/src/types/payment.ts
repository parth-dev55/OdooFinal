export type PaymentType = 'CUSTOMER_RECEIPT' | 'VENDOR_PAYMENT';
export type PaymentMethod = 'CASH' | 'BANK';
export type PaymentStatus = 'COMPLETED' | 'CANCELLED';

export interface PaymentRecord {
  id: string | number;
  paymentReference: string; // e.g. "REC-2026-0001" or "PAY-2026-0001"
  paymentDate: string;      // YYYY-MM-DD
  paymentType: PaymentType;
  partyId: string | number;
  partyName: string;
  partyEmail?: string;
  invoiceId?: string | number;
  invoiceNumber?: string;
  billId?: string | number;
  billNumber?: string;
  paymentMethod: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  referenceNotes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OutstandingBalanceInfo {
  id: string | number;
  number: string;
  type: 'INVOICE' | 'BILL';
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  partyId: string | number;
  partyName: string;
  partyEmail?: string;
  status: string;
  paymentStatus: string;
}

export interface CreatePaymentDto {
  paymentType: PaymentType;
  invoiceId?: string | number;
  billId?: string | number;
  partyId: string | number;
  partyName: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  amount: number;
  referenceNotes?: string;
}

export interface PaymentFilterParams {
  search?: string;
  paymentType?: string;
  paymentMethod?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  partyId?: string;
}
