export interface ReportPeriodParams {
  from?: string;
  to?: string;
  asOf?: string;
  analyticAccountId?: string;
  status?: string;
}

export interface BalanceSheetItem {
  category: string;
  code: string;
  name: string;
  balance: number;
}

export interface BalanceSheetReport {
  period: string;
  asOfDate: string;
  assets: BalanceSheetItem[];
  liabilities: BalanceSheetItem[];
  capital: BalanceSheetItem[];
  totalAssets: number;
  totalLiabilities: number;
  totalCapital: number;
}

export interface ProfitLossItem {
  category: string;
  code: string;
  name: string;
  amount: number;
}

export interface ProfitLossReport {
  period: string;
  from: string;
  to: string;
  income: ProfitLossItem[];
  expenses: ProfitLossItem[];
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

export interface BudgetReportItem {
  budgetId: string | number;
  budgetName: string;
  analyticAccountId: string | number;
  analyticAccountName: string;
  analyticAccountType: 'INCOME' | 'EXPENSE';
  period: string;
  periodStart: string;
  periodEnd: string;
  plannedAmount: number;
  actualAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
}

export interface BudgetReport {
  period: string;
  from: string;
  to: string;
  budgets: BudgetReportItem[];
  totalPlanned: number;
  totalActual: number;
  totalRemaining: number;
  overallUtilization: number;
}
