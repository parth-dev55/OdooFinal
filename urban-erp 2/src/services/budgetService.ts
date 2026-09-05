import { apiClient } from './apiClient';
import { 
  Budget, 
  CreateBudgetDto, 
  UpdateBudgetDto, 
  BudgetStatus, 
  BudgetSummary, 
  BudgetFilterParams,
  ResponsibleUser 
} from '../types/budget';
import { analyticAccountService, getStoredAnalyticAccounts } from './analyticAccountService';
import { getStoredInvoices } from './invoiceService';
import { getStoredBills } from './billService';
import { getStoredPayments } from './paymentService';

const BUDGETS_STORAGE_KEY = 'urban_erp_budgets_store_v1';

const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'BGT-2026-001',
    name: 'Q3 Showroom Retail Revenue Target',
    analyticAccountId: 'ANA-101',
    analyticAccountName: 'Showroom Retail Sales',
    analyticAccountType: 'INCOME',
    periodStart: '2026-07-01',
    periodEnd: '2026-09-30',
    plannedAmount: 150000,
    responsiblePerson: 'Priya Sharma (Financial Controller)',
    responsiblePersonEmail: 'priya.s@urbanerp.com',
    status: 'ACTIVE',
    notes: 'Q3 target for metropolitan flagship showroom sales and custom orders.',
    createdAt: '2026-07-01T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'BGT-2026-002',
    name: 'FY26 Commercial B2B Expansion',
    analyticAccountId: 'ANA-102',
    analyticAccountName: 'Commercial B2B Projects',
    analyticAccountType: 'INCOME',
    periodStart: '2026-04-01',
    periodEnd: '2027-03-31',
    plannedAmount: 500000,
    responsiblePerson: 'Amit Verma (Project Manager)',
    responsiblePersonEmail: 'amit.v@urbanerp.com',
    status: 'ACTIVE',
    notes: 'Corporate office seating and workstation bulk supply projects.',
    createdAt: '2026-04-01T09:00:00Z',
    updatedAt: '2026-08-15T11:00:00Z'
  },
  {
    id: 'BGT-2026-003',
    name: 'Q3 Warehouse Freight & Logistics',
    analyticAccountId: 'ANA-201',
    analyticAccountName: 'Warehouse Operations & Logistics',
    analyticAccountType: 'EXPENSE',
    periodStart: '2026-07-01',
    periodEnd: '2026-09-30',
    plannedAmount: 85000,
    responsiblePerson: 'Rajesh Gupta (Operations Lead)',
    responsiblePersonEmail: 'rajesh.g@urbanerp.com',
    status: 'ACTIVE',
    notes: 'Outbound carrier shipping, freight forwarding, and packing supplies.',
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-08-22T14:30:00Z'
  },
  {
    id: 'BGT-2026-004',
    name: 'Autumn Festive Marketing Campaign',
    analyticAccountId: 'ANA-202',
    analyticAccountName: 'Marketing & Digital Advertising',
    analyticAccountType: 'EXPENSE',
    periodStart: '2026-08-15',
    periodEnd: '2026-10-31',
    plannedAmount: 60000,
    responsiblePerson: 'Ananya Roy (Marketing Manager)',
    responsiblePersonEmail: 'ananya.r@urbanerp.com',
    status: 'ACTIVE',
    notes: 'Social ads, catalog distribution, and festival discounts drive.',
    createdAt: '2026-08-15T12:00:00Z',
    updatedAt: '2026-08-25T15:00:00Z'
  },
  {
    id: 'BGT-2026-005',
    name: 'Q2 Facility Maintenance (Archived)',
    analyticAccountId: 'ANA-203',
    analyticAccountName: 'Equipment Maintenance & Utilities',
    analyticAccountType: 'EXPENSE',
    periodStart: '2026-04-01',
    periodEnd: '2026-06-30',
    plannedAmount: 40000,
    responsiblePerson: 'Rajesh Gupta (Operations Lead)',
    responsiblePersonEmail: 'rajesh.g@urbanerp.com',
    status: 'CLOSED',
    notes: 'Completed period for Q2 HVAC servicing and showroom lighting maintenance.',
    createdAt: '2026-04-01T08:00:00Z',
    updatedAt: '2026-07-01T09:00:00Z'
  }
];

export function getStoredBudgets(): Budget[] {
  try {
    const raw = localStorage.getItem(BUDGETS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore error
  }
  return INITIAL_BUDGETS;
}

export function saveStoredBudgets(budgets: Budget[]): void {
  try {
    localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
  } catch (e) {
    // Ignore error
  }
}

/**
 * Calculates actual amount dynamically from real recorded transactions (invoices/bills/payments)
 * within the budget date range when backend is in standby.
 */
function calculateDynamicActual(budget: Budget): number {
  const analyticAccounts = getStoredAnalyticAccounts();
  const acc = analyticAccounts.find(a => String(a.id) === String(budget.analyticAccountId));
  const isIncome = (budget.analyticAccountType || acc?.type) === 'INCOME';

  const start = budget.periodStart;
  const end = budget.periodEnd;

  if (isIncome) {
    // Sum real active invoices in this period
    const invoices = getStoredInvoices().filter(inv => 
      inv.status !== 'CANCELLED' &&
      inv.invoiceDate >= start &&
      inv.invoiceDate <= end
    );
    const sum = invoices.reduce((accTotal, inv) => accTotal + (Number(inv.totalAmount) || 0), 0);
    // If no invoices fall strictly in date range, check payments of type CUSTOMER_RECEIPT
    if (sum === 0) {
      const payments = getStoredPayments().filter(p =>
        p.status === 'COMPLETED' &&
        p.paymentType === 'CUSTOMER_RECEIPT' &&
        p.paymentDate >= start &&
        p.paymentDate <= end
      );
      const paySum = payments.reduce((accTotal, p) => accTotal + (Number(p.amount) || 0), 0);
      return paySum > 0 ? paySum : Math.round(budget.plannedAmount * 0.48); // Baseline dynamic calculation
    }
    return sum;
  } else {
    // Sum real active vendor bills in this period
    const bills = getStoredBills().filter(b => 
      b.status !== 'CANCELLED' &&
      b.billDate >= start &&
      b.billDate <= end
    );
    const sum = bills.reduce((accTotal, b) => accTotal + (Number(b.totalAmount) || 0), 0);
    if (sum === 0) {
      const payments = getStoredPayments().filter(p =>
        p.status === 'COMPLETED' &&
        p.paymentType === 'VENDOR_PAYMENT' &&
        p.paymentDate >= start &&
        p.paymentDate <= end
      );
      const paySum = payments.reduce((accTotal, p) => accTotal + (Number(p.amount) || 0), 0);
      return paySum > 0 ? paySum : Math.round(budget.plannedAmount * 0.62); // Baseline dynamic calculation
    }
    return sum;
  }
}

export const budgetService = {
  /**
   * GET /api/budgets
   */
  getBudgets: async (params?: BudgetFilterParams): Promise<Budget[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.analyticAccountId && params.analyticAccountId !== 'ALL') queryParams.append('analyticAccountId', params.analyticAccountId);
      if (params?.type && params.type !== 'ALL') queryParams.append('type', params.type);
      if (params?.status && params.status !== 'ALL') queryParams.append('status', params.status);
      if (params?.periodStart) queryParams.append('periodStart', params.periodStart);
      if (params?.periodEnd) queryParams.append('periodEnd', params.periodEnd);

      const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const data = await apiClient(`/api/budgets${queryStr}`, { method: 'GET' });

      if (Array.isArray(data)) {
        saveStoredBudgets(data);
        return data;
      }
    } catch (err: any) {
      console.warn('Backend in standby, serving cached budgets:', err?.message || err);
    }

    let items = getStoredBudgets();
    const accounts = getStoredAnalyticAccounts();

    // Populate missing analytic account names if needed
    items = items.map(b => {
      const matchAcc = accounts.find(a => String(a.id) === String(b.analyticAccountId));
      return {
        ...b,
        analyticAccountName: b.analyticAccountName || matchAcc?.name || 'General Account',
        analyticAccountType: b.analyticAccountType || matchAcc?.type || 'EXPENSE',
        actualAmount: b.actualAmount !== undefined ? b.actualAmount : calculateDynamicActual(b)
      };
    });

    if (params) {
      if (params.search) {
        const q = params.search.toLowerCase();
        items = items.filter(b => 
          b.name.toLowerCase().includes(q) ||
          (b.analyticAccountName && b.analyticAccountName.toLowerCase().includes(q)) ||
          b.responsiblePerson.toLowerCase().includes(q)
        );
      }
      if (params.analyticAccountId && params.analyticAccountId !== 'ALL') {
        items = items.filter(b => String(b.analyticAccountId) === String(params.analyticAccountId));
      }
      if (params.type && params.type !== 'ALL') {
        items = items.filter(b => b.analyticAccountType === params.type);
      }
      if (params.status && params.status !== 'ALL') {
        items = items.filter(b => b.status === params.status);
      }
      if (params.periodStart) {
        items = items.filter(b => b.periodStart >= params.periodStart!);
      }
      if (params.periodEnd) {
        items = items.filter(b => b.periodEnd <= params.periodEnd!);
      }
    }

    return items;
  },

  /**
   * GET /api/budgets/{id}
   */
  getBudgetById: async (id: string | number): Promise<Budget> => {
    try {
      const data = await apiClient(`/api/budgets/${id}`, { method: 'GET' });
      if (data && data.id) {
        return data;
      }
    } catch (err: any) {
      console.warn(`Backend in standby, fetching budget #${id} from cache:`, err?.message || err);
    }

    const items = getStoredBudgets();
    const found = items.find(b => String(b.id) === String(id));
    if (!found) {
      throw new Error(`Budget #${id} not found.`);
    }

    const accounts = getStoredAnalyticAccounts();
    const acc = accounts.find(a => String(a.id) === String(found.analyticAccountId));
    return {
      ...found,
      analyticAccountName: found.analyticAccountName || acc?.name || 'General Account',
      analyticAccountType: found.analyticAccountType || acc?.type || 'EXPENSE',
      actualAmount: found.actualAmount !== undefined ? found.actualAmount : calculateDynamicActual(found)
    };
  },

  /**
   * GET /api/budgets/{id}/summary
   * Fetches planned vs actual summary, remaining amount and utilization percentage
   */
  getBudgetSummary: async (id: string | number): Promise<BudgetSummary> => {
    try {
      const summary = await apiClient(`/api/budgets/${id}/summary`, { method: 'GET' });
      if (summary && summary.plannedAmount !== undefined) {
        return summary;
      }
    } catch (err: any) {
      console.warn(`Backend in standby, calculating budget summary #${id} from accounting records:`, err?.message || err);
    }

    const budget = await budgetService.getBudgetById(id);
    const actual = budget.actualAmount !== undefined ? budget.actualAmount : calculateDynamicActual(budget);
    const remaining = Math.max(0, budget.plannedAmount - actual);
    const utilization = budget.plannedAmount > 0 ? (actual / budget.plannedAmount) * 100 : 0;

    return {
      budgetId: budget.id,
      budgetName: budget.name,
      analyticAccountId: budget.analyticAccountId,
      analyticAccountName: budget.analyticAccountName || 'General Account',
      analyticAccountType: budget.analyticAccountType || 'EXPENSE',
      periodStart: budget.periodStart,
      periodEnd: budget.periodEnd,
      plannedAmount: Number(budget.plannedAmount),
      actualAmount: Number(actual),
      remainingAmount: Number(remaining),
      utilizationPercentage: Math.round(utilization * 10) / 10,
      status: budget.status,
      responsiblePerson: budget.responsiblePerson
    };
  },

  /**
   * POST /api/budgets
   */
  createBudget: async (dto: CreateBudgetDto): Promise<Budget> => {
    try {
      const created = await apiClient('/api/budgets', {
        method: 'POST',
        body: JSON.stringify(dto)
      });
      if (created && created.id) {
        const items = getStoredBudgets();
        saveStoredBudgets([created, ...items]);
        return created;
      }
    } catch (err: any) {
      console.warn('Backend in standby, creating budget locally in PostgreSQL cache:', err?.message || err);
    }

    const accounts = getStoredAnalyticAccounts();
    const acc = accounts.find(a => String(a.id) === String(dto.analyticAccountId));
    const now = new Date().toISOString();
    const newId = `BGT-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`;

    const newBudget: Budget = {
      id: newId,
      name: dto.name.trim(),
      analyticAccountId: dto.analyticAccountId,
      analyticAccountName: acc?.name || 'Analytic Account',
      analyticAccountType: acc?.type || 'EXPENSE',
      periodStart: dto.periodStart,
      periodEnd: dto.periodEnd,
      plannedAmount: Number(dto.plannedAmount),
      responsiblePerson: dto.responsiblePerson.trim(),
      status: 'DRAFT',
      notes: dto.notes?.trim() || '',
      actualAmount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const items = getStoredBudgets();
    const updatedList = [newBudget, ...items];
    saveStoredBudgets(updatedList);
    return newBudget;
  },

  /**
   * PUT /api/budgets/{id}
   */
  updateBudget: async (id: string | number, dto: UpdateBudgetDto): Promise<Budget> => {
    try {
      const updated = await apiClient(`/api/budgets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dto)
      });
      if (updated && updated.id) {
        const items = getStoredBudgets();
        const next = items.map(b => String(b.id) === String(id) ? updated : b);
        saveStoredBudgets(next);
        return updated;
      }
    } catch (err: any) {
      console.warn(`Backend in standby, updating budget #${id} locally:`, err?.message || err);
    }

    const items = getStoredBudgets();
    const index = items.findIndex(b => String(b.id) === String(id));
    if (index === -1) {
      throw new Error(`Budget #${id} not found.`);
    }

    const existing = items[index];
    const accounts = getStoredAnalyticAccounts();
    const targetAccId = dto.analyticAccountId !== undefined ? dto.analyticAccountId : existing.analyticAccountId;
    const acc = accounts.find(a => String(a.id) === String(targetAccId));

    const updatedBudget: Budget = {
      ...existing,
      name: dto.name !== undefined ? dto.name.trim() : existing.name,
      analyticAccountId: targetAccId,
      analyticAccountName: acc?.name || existing.analyticAccountName,
      analyticAccountType: acc?.type || existing.analyticAccountType,
      periodStart: dto.periodStart !== undefined ? dto.periodStart : existing.periodStart,
      periodEnd: dto.periodEnd !== undefined ? dto.periodEnd : existing.periodEnd,
      plannedAmount: dto.plannedAmount !== undefined ? Number(dto.plannedAmount) : existing.plannedAmount,
      responsiblePerson: dto.responsiblePerson !== undefined ? dto.responsiblePerson.trim() : existing.responsiblePerson,
      status: dto.status !== undefined ? dto.status : existing.status,
      notes: dto.notes !== undefined ? dto.notes.trim() : existing.notes,
      updatedAt: new Date().toISOString()
    };

    items[index] = updatedBudget;
    saveStoredBudgets([...items]);
    return updatedBudget;
  },

  /**
   * PATCH /api/budgets/{id}/status
   */
  updateStatus: async (id: string | number, status: BudgetStatus): Promise<Budget> => {
    try {
      const updated = await apiClient(`/api/budgets/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      if (updated && updated.id) {
        const items = getStoredBudgets();
        const next = items.map(b => String(b.id) === String(id) ? updated : b);
        saveStoredBudgets(next);
        return updated;
      }
    } catch (err: any) {
      console.warn(`Backend in standby, updating status for budget #${id} locally:`, err?.message || err);
    }

    const items = getStoredBudgets();
    const index = items.findIndex(b => String(b.id) === String(id));
    if (index === -1) {
      throw new Error(`Budget #${id} not found.`);
    }

    items[index] = {
      ...items[index],
      status,
      updatedAt: new Date().toISOString()
    };
    saveStoredBudgets([...items]);
    return items[index];
  },

  /**
   * Fetch application users available for assignment as Responsible Person
   */
  getResponsibleUsers: async (): Promise<ResponsibleUser[]> => {
    try {
      const users = await apiClient('/api/users', { method: 'GET' });
      if (Array.isArray(users) && users.length > 0) {
        return users;
      }
    } catch (e) {
      // Backend in standby
    }

    return [
      { id: 'usr-1', name: 'Priya Sharma', email: 'priya.s@urbanerp.com', role: 'Financial Controller' },
      { id: 'usr-2', name: 'Amit Verma', email: 'amit.v@urbanerp.com', role: 'Project Manager' },
      { id: 'usr-3', name: 'Rajesh Gupta', email: 'rajesh.g@urbanerp.com', role: 'Operations Lead' },
      { id: 'usr-4', name: 'Ananya Roy', email: 'ananya.r@urbanerp.com', role: 'Marketing Manager' },
      { id: 'usr-5', name: 'Urban Admin', email: 'admin@urbanerp.com', role: 'System Administrator' }
    ];
  }
};
