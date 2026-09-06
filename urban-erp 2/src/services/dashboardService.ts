import { apiClient } from './apiClient';

// ==========================================
// MOCK DATA (Temporary for Preview)
// ==========================================

export const mockDashboardSummary = {
  totalSales: { value: '$124,500', trend: '12%', trendUp: true },
  totalPurchases: { value: '$45,200', trend: '5%', trendUp: false },
  totalExpenses: { value: '$28,400', trend: '2%', trendUp: false },
  netProfit: { value: '$50,900', trend: '18%', trendUp: true },
  receivables: { value: '$32,100' },
  payables: { value: '$14,200' },
  cashBank: { value: '$88,500' },
  budgetUtilization: { value: '64%' }
};

export const mockRecentTransactions = [
  { id: '1', date: '2023-10-24', reference: 'INV-2023-001', type: 'Invoice', party: 'Acme Corp', amount: '$4,500.00', status: 'Paid' },
  { id: '2', date: '2023-10-23', reference: 'BILL-23-992', type: 'Bill', party: 'TechSupply Inc.', amount: '$1,200.00', status: 'Pending' },
  { id: '3', date: '2023-10-21', reference: 'PAY-8823', type: 'Payment', party: 'Acme Corp', amount: '$4,500.00', status: 'Paid' },
  { id: '4', date: '2023-10-20', reference: 'INV-2023-002', type: 'Invoice', party: 'Global Industries', amount: '$8,900.00', status: 'Overdue' },
  { id: '5', date: '2023-10-19', reference: 'BILL-23-993', type: 'Bill', party: 'Office Depot', amount: '$450.00', status: 'Paid' },
];

export const mockSalesTrend = [
  { name: 'Jan', sales: 4000, purchases: 2400 },
  { name: 'Feb', sales: 3000, purchases: 1398 },
  { name: 'Mar', sales: 2000, purchases: 9800 },
  { name: 'Apr', sales: 2780, purchases: 3908 },
  { name: 'May', sales: 1890, purchases: 4800 },
  { name: 'Jun', sales: 2390, purchases: 3800 },
  { name: 'Jul', sales: 3490, purchases: 4300 },
];

export const mockExpenseBreakdown = [
  { name: 'Payroll', value: 400 },
  { name: 'Marketing', value: 300 },
  { name: 'Software', value: 300 },
  { name: 'Office', value: 200 },
];

export const mockBudgetVsActual = [
  { name: 'Q1', actual: 4000, budget: 4400 },
  { name: 'Q2', actual: 3000, budget: 3200 },
  { name: 'Q3', actual: 2000, budget: 2400 },
  { name: 'Q4', actual: 2780, budget: 3000 },
];

// ==========================================
// DASHBOARD SERVICE
// ==========================================

export const dashboardService = {
  getSummary: async () => {
    try {
      return await apiClient('/dashboard/summary', { method: 'GET' });
    } catch (error) {
      console.warn("Backend unreachable, using mock dashboard summary data for preview.");
      return mockDashboardSummary;
    }
  },

  getRecentTransactions: async () => {
    try {
      return await apiClient('/dashboard/recent-transactions', { method: 'GET' });
    } catch (error) {
      console.warn("Backend unreachable, using mock recent transactions data for preview.");
      return mockRecentTransactions;
    }
  },

  getSalesTrend: async () => {
    try {
      return await apiClient('/dashboard/sales-trend', { method: 'GET' });
    } catch (error) {
      console.warn("Backend unreachable, using mock sales trend data for preview.");
      return mockSalesTrend;
    }
  },

  getPurchaseTrend: async () => {
    try {
      return await apiClient('/dashboard/purchase-trend', { method: 'GET' });
    } catch (error) {
      console.warn("Backend unreachable, using mock purchase trend data for preview. (Using sales trend structure temporarily)");
      return mockSalesTrend; // using same data structure for now
    }
  },

  getExpenseBreakdown: async () => {
    try {
      return await apiClient('/dashboard/expense-breakdown', { method: 'GET' });
    } catch (error) {
      console.warn("Backend unreachable, using mock expense breakdown data for preview.");
      return mockExpenseBreakdown;
    }
  },

  getBudgetVsActual: async () => {
    try {
      return await apiClient('/dashboard/budget-vs-actual', { method: 'GET' });
    } catch (error) {
      console.warn("Backend unreachable, using mock budget vs actual data for preview.");
      return mockBudgetVsActual;
    }
  }
};
