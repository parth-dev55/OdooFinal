import { apiClient } from './apiClient';
import { 
  AnalyticAccount, 
  CreateAnalyticAccountDto, 
  UpdateAnalyticAccountDto, 
  AnalyticAccountStatus, 
  AnalyticAccountType 
} from '../types/budget';
import { UserProfile } from './authService';

const STORAGE_KEY = 'urban_erp_analytic_accounts_store_v1';

const INITIAL_ANALYTIC_ACCOUNTS: AnalyticAccount[] = [
  {
    id: 'ANA-101',
    name: 'Showroom Retail Sales',
    type: 'INCOME',
    status: 'ACTIVE',
    description: 'Direct retail showroom customer sales and walk-in revenues',
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 'ANA-102',
    name: 'Commercial B2B Projects',
    type: 'INCOME',
    status: 'ACTIVE',
    description: 'Large scale corporate office interior and contract furniture revenues',
    createdAt: '2026-08-05T10:30:00Z',
    updatedAt: '2026-08-05T10:30:00Z',
  },
  {
    id: 'ANA-201',
    name: 'Warehouse Operations & Logistics',
    type: 'EXPENSE',
    status: 'ACTIVE',
    description: 'Storage, freight, local distribution, packaging, and handling costs',
    createdAt: '2026-08-10T11:15:00Z',
    updatedAt: '2026-08-10T11:15:00Z',
  },
  {
    id: 'ANA-202',
    name: 'Marketing & Digital Advertising',
    type: 'EXPENSE',
    status: 'ACTIVE',
    description: 'Online campaigns, catalog printing, social ads, and promotional events',
    createdAt: '2026-08-12T14:00:00Z',
    updatedAt: '2026-08-12T14:00:00Z',
  },
  {
    id: 'ANA-203',
    name: 'Equipment Maintenance & Utilities',
    type: 'EXPENSE',
    status: 'ACTIVE',
    description: 'Electricity, facility upkeep, tools repair, and showroom leasing fees',
    createdAt: '2026-08-15T16:20:00Z',
    updatedAt: '2026-08-15T16:20:00Z',
  }
];

export function getStoredAnalyticAccounts(): AnalyticAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore error
  }
  return INITIAL_ANALYTIC_ACCOUNTS;
}

export function saveStoredAnalyticAccounts(accounts: AnalyticAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (e) {
    // Ignore error
  }
}

export const analyticAccountService = {
  /**
   * GET /api/analytic-accounts
   */
  getAnalyticAccounts: async (type?: AnalyticAccountType, status?: AnalyticAccountStatus): Promise<AnalyticAccount[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (type) queryParams.append('type', type);
      if (status) queryParams.append('status', status);
      const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';

      const data = await apiClient(`/api/analytic-accounts${queryStr}`, {
        method: 'GET'
      });

      if (Array.isArray(data)) {
        saveStoredAnalyticAccounts(data);
        return data;
      }
    } catch (err: any) {
      console.warn('Backend in standby, serving cached analytic accounts:', err?.message || err);
    }

    let items = getStoredAnalyticAccounts();
    if (type) {
      items = items.filter(a => a.type === type);
    }
    if (status) {
      items = items.filter(a => a.status === status);
    }
    return items;
  },

  /**
   * GET /api/analytic-accounts/{id}
   */
  getAnalyticAccountById: async (id: string | number): Promise<AnalyticAccount> => {
    try {
      const data = await apiClient(`/api/analytic-accounts/${id}`, {
        method: 'GET'
      });
      if (data && data.id) {
        return data;
      }
    } catch (err: any) {
      console.warn(`Backend in standby, fetching analytic account #${id} from cache:`, err?.message || err);
    }

    const items = getStoredAnalyticAccounts();
    const found = items.find(a => String(a.id) === String(id));
    if (!found) {
      throw new Error(`Analytic Account #${id} not found.`);
    }
    return found;
  },

  /**
   * POST /api/analytic-accounts
   */
  createAnalyticAccount: async (dto: CreateAnalyticAccountDto, userProfile?: UserProfile | null): Promise<AnalyticAccount> => {
    try {
      const created = await apiClient('/api/analytic-accounts', {
        method: 'POST',
        body: JSON.stringify(dto)
      });
      if (created && created.id) {
        // Sync local cache
        const items = getStoredAnalyticAccounts();
        saveStoredAnalyticAccounts([created, ...items]);
        return created;
      }
    } catch (err: any) {
      console.warn('Backend in standby, creating analytic account locally:', err?.message || err);
    }

    const items = getStoredAnalyticAccounts();
    const newId = `ANA-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();
    const newAccount: AnalyticAccount = {
      id: newId,
      name: dto.name.trim(),
      type: dto.type,
      status: 'ACTIVE',
      description: dto.description?.trim() || '',
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newAccount, ...items];
    saveStoredAnalyticAccounts(updated);
    return newAccount;
  },

  /**
   * PUT /api/analytic-accounts/{id}
   */
  updateAnalyticAccount: async (id: string | number, dto: UpdateAnalyticAccountDto): Promise<AnalyticAccount> => {
    try {
      const updated = await apiClient(`/api/analytic-accounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dto)
      });
      if (updated && updated.id) {
        const items = getStoredAnalyticAccounts();
        const next = items.map(a => String(a.id) === String(id) ? updated : a);
        saveStoredAnalyticAccounts(next);
        return updated;
      }
    } catch (err: any) {
      console.warn(`Backend in standby, updating analytic account #${id} locally:`, err?.message || err);
    }

    const items = getStoredAnalyticAccounts();
    const index = items.findIndex(a => String(a.id) === String(id));
    if (index === -1) {
      throw new Error(`Analytic Account #${id} not found.`);
    }

    const existing = items[index];
    const updatedAccount: AnalyticAccount = {
      ...existing,
      name: dto.name !== undefined ? dto.name.trim() : existing.name,
      type: dto.type !== undefined ? dto.type : existing.type,
      description: dto.description !== undefined ? dto.description.trim() : existing.description,
      status: dto.status !== undefined ? dto.status : existing.status,
      updatedAt: new Date().toISOString(),
    };

    items[index] = updatedAccount;
    saveStoredAnalyticAccounts([...items]);
    return updatedAccount;
  },

  /**
   * PATCH /api/analytic-accounts/{id}/status
   * Updates status to ACTIVE or ARCHIVED (Deactivated)
   */
  updateStatus: async (id: string | number, status: AnalyticAccountStatus): Promise<AnalyticAccount> => {
    try {
      const updated = await apiClient(`/api/analytic-accounts/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      if (updated && updated.id) {
        const items = getStoredAnalyticAccounts();
        const next = items.map(a => String(a.id) === String(id) ? updated : a);
        saveStoredAnalyticAccounts(next);
        return updated;
      }
    } catch (err: any) {
      console.warn(`Backend in standby, toggling status for analytic account #${id} locally:`, err?.message || err);
    }

    const items = getStoredAnalyticAccounts();
    const index = items.findIndex(a => String(a.id) === String(id));
    if (index === -1) {
      throw new Error(`Analytic Account #${id} not found.`);
    }

    items[index] = {
      ...items[index],
      status,
      updatedAt: new Date().toISOString()
    };
    saveStoredAnalyticAccounts([...items]);
    return items[index];
  }
};
