export type SalesOrderStatus = 'DRAFT' | 'CONFIRMED' | 'INVOICED' | 'CANCELLED';

export interface SalesOrderItem {
  id?: string | number;
  productId: string | number;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // percentage, e.g. 18 for 18%
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface SalesOrder {
  id: string | number;
  orderNumber: string;
  customerId: string | number;
  customerName: string;
  customerEmail?: string;
  customerMobile?: string;
  orderDate: string;
  items: SalesOrderItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: SalesOrderStatus;
  notes?: string;
  invoiceId?: string | number;
  invoicedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSalesOrderItemDTO {
  productId: string | number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface CreateSalesOrderDTO {
  customerId: string | number;
  orderDate: string;
  items: CreateSalesOrderItemDTO[];
  notes?: string;
}

export interface UpdateSalesOrderDTO {
  customerId?: string | number;
  orderDate?: string;
  items?: CreateSalesOrderItemDTO[];
  notes?: string;
  status?: SalesOrderStatus;
}

export interface SalesOrderFilterParams {
  search?: string;
  customerId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}
