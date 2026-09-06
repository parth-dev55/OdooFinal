export type InvoiceStatus = 'DRAFT' | 'POSTED' | 'PAID' | 'PARTIALLY_PAID' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';

export interface InvoiceItem {
  id?: string | number;
  productId: string | number;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number; // percentage, e.g. 18
  taxAmount?: number;
  total: number; // line total
}

export interface CustomerInvoice {
  id: string | number;
  invoiceNumber: string;
  salesOrderId?: string | number;
  salesOrderNumber?: string;
  customerId: string | number;
  customerName: string;
  customerEmail?: string;
  customerMobile?: string;
  invoiceDate: string; // YYYY-MM-DD
  dueDate: string;     // YYYY-MM-DD
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number; // Grand total
  amountPaid?: number;
  balanceDue?: number;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceFilterParams {
  search?: string;
  customerId?: string;
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
}
