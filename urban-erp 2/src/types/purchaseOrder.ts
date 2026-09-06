export type PurchaseOrderStatus = 'DRAFT' | 'CONFIRMED' | 'RECEIVED' | 'BILLED' | 'CANCELLED';

export interface PurchaseOrderItem {
  id?: string | number;
  productId: string | number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string | number;
  orderNumber: string;
  vendorId: string | number;
  vendorName: string;
  vendorEmail?: string;
  vendorMobile?: string;
  orderDate: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  totalAmount: number;
  status: PurchaseOrderStatus;
  notes?: string;
  billId?: string | number;
  billedAt?: string;
  receivedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePurchaseOrderItemDTO {
  productId: string | number;
  productName?: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseOrderDTO {
  vendorId: string | number;
  orderDate: string;
  items: CreatePurchaseOrderItemDTO[];
  notes?: string;
}

export interface UpdatePurchaseOrderDTO {
  vendorId?: string | number;
  orderDate?: string;
  items?: CreatePurchaseOrderItemDTO[];
  notes?: string;
  status?: PurchaseOrderStatus;
}

export interface PurchaseOrderFilterParams {
  search?: string;
  vendorId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}
