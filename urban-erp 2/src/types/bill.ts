export type BillStatus = 'DRAFT' | 'POSTED' | 'PAID' | 'PARTIALLY_PAID' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';

export interface BillItem {
  id?: string | number;
  productId: string | number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number; // line total
}

export interface VendorBill {
  id: string | number;
  billNumber: string;
  purchaseOrderId?: string | number;
  purchaseOrderNumber?: string;
  vendorId: string | number;
  vendorName: string;
  vendorEmail?: string;
  vendorMobile?: string;
  billDate: string; // YYYY-MM-DD
  dueDate: string;  // YYYY-MM-DD
  items: BillItem[];
  subtotal: number;
  totalAmount: number; // Grand total
  amountPaid?: number;
  balanceDue?: number;
  status: BillStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BillFilterParams {
  search?: string;
  vendorId?: string;
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
}
