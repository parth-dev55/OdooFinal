export type AnalyticAccountType = 'INCOME' | 'EXPENSE';
export type AnalyticAccountStatus = 'ACTIVE' | 'ARCHIVED';

export interface AnalyticAccount {
  id: string | number;
  name: string;
  type: AnalyticAccountType;
  status: AnalyticAccountStatus;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAnalyticAccountDto {
  name: string;
  type: AnalyticAccountType;
  description?: string;
}

export interface UpdateAnalyticAccountDto {
  name?: string;
  type?: AnalyticAccountType;
  description?: string;
  status?: AnalyticAccountStatus;
}

export type BudgetStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export interface Budget {
  id: string | number;
  name: string;
  analyticAccountId: string | number;
  analyticAccountName?: string;
  analyticAccountType?: AnalyticAccountType;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string;   // YYYY-MM-DD
  plannedAmount: number;
  responsiblePerson: string;
  responsiblePersonEmail?: string;
  status: BudgetStatus;
  notes?: string;
  actualAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBudgetDto {
  name: string;
  analyticAccountId: string | number;
  periodStart: string;
  periodEnd: string;
  plannedAmount: number;
  responsiblePerson: string;
  notes?: string;
}

export interface UpdateBudgetDto {
  name?: string;
  analyticAccountId?: string | number;
  periodStart?: string;
  periodEnd?: string;
  plannedAmount?: number;
  responsiblePerson?: string;
  status?: BudgetStatus;
  notes?: string;
}

export interface BudgetSummary {
  budgetId: string | number;
  budgetName: string;
  analyticAccountId: string | number;
  analyticAccountName: string;
  analyticAccountType: AnalyticAccountType;
  periodStart: string;
  periodEnd: string;
  plannedAmount: number;
  actualAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
  status: BudgetStatus;
  responsiblePerson: string;
}

export interface BudgetFilterParams {
  search?: string;
  analyticAccountId?: string;
  type?: 'ALL' | AnalyticAccountType;
  status?: 'ALL' | BudgetStatus;
  periodStart?: string;
  periodEnd?: string;
}

export interface ResponsibleUser {
  id: string;
  name: string;
  email: string;
  role: string;
}
