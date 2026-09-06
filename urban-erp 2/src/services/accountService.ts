import { apiClient } from './apiClient';
import { Account, CreateAccountDTO, UpdateAccountDTO, AccountStatus } from '../types/account';

export interface AccountFilterParams {
  search?: string;
  type?: string;
  status?: string;
}

const STORAGE_KEY = 'urban_erp_accounts_store_v1';

// Initial starter accounts strictly for UI fallback when Spring Boot backend is in standby/offline
const DEMO_FALLBACK_ACCOUNTS: Account[] = [
  {
    id: 'ACC-1001',
    name: 'Cash',
    type: 'ASSET',
    status: 'ACTIVE',
    code: '1010',
    description: 'Petty cash and cash on hand for day-to-day operations',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'ACC-1002',
    name: 'Bank',
    type: 'ASSET',
    status: 'ACTIVE',
    code: '1020',
    description: 'Primary business operating bank account',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'ACC-1003',
    name: 'Debtors',
    type: 'ASSET',
    status: 'ACTIVE',
    code: '1030',
    description: 'Accounts receivable from credit customers',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'ACC-2001',
    name: 'Creditors',
    type: 'LIABILITY',
    status: 'ACTIVE',
    code: '2010',
    description: 'Accounts payable to suppliers and vendors',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'ACC-4001',
    name: 'Sales Income',
    type: 'INCOME',
    status: 'ACTIVE',
    code: '4010',
    description: 'Revenue from sales of products and rendered services',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'ACC-5001',
    name: 'Purchase Expense',
    type: 'EXPENSE',
    status: 'ACTIVE',
    code: '5010',
    description: 'Cost of goods sold and direct product procurement expenses',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'ACC-3001',
    name: 'Capital',
    type: 'CAPITAL',
    status: 'ACTIVE',
    code: '3010',
    description: 'Owner equity and paid-in capital investment',
    createdAt: '2026-08-01T08:00:00Z',
  },
];

function getStoredAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore storage parse errors
  }
  return DEMO_FALLBACK_ACCOUNTS;
}

function saveStoredAccounts(accounts: Account[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (e) {
    // Ignore storage quota errors
  }
}

export const accountService = {
  /**
   * GET /api/accounts
   * Fetches real accounts from backend, falling back to cached/demo buffer only if backend is unreachable.
   */
  getAccounts: async (params?: AccountFilterParams): Promise<Account[]> => {
    let endpoint = '/api/accounts';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.search?.trim()) queryParams.set('search', params.search.trim());
      if (params.type && params.type !== 'ALL') queryParams.set('type', params.type);
      if (params.status && params.status !== 'ALL') queryParams.set('status', params.status);

      const queryString = queryParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }

    try {
      const data = await apiClient(endpoint, {
        method: 'GET',
      });

      let results: Account[] = [];
      if (Array.isArray(data)) {
        results = data;
      } else if (data && Array.isArray(data.content)) {
        results = data.content;
      } else if (data && Array.isArray(data.data)) {
        results = data.data;
      }

      if (results.length > 0) {
        // Save real API data to cache so it is used instead of demo data
        saveStoredAccounts(results);
      }
      return results;
    } catch (error: any) {
      console.warn('Spring Boot backend in standby for accounts, using local buffer:', error?.message || error);
      let local = getStoredAccounts();

      if (params?.type && params.type !== 'ALL') {
        local = local.filter(a => a.type === params.type);
      }
      if (params?.status && params.status !== 'ALL') {
        local = local.filter(a => a.status === params.status);
      }
      if (params?.search?.trim()) {
        const q = params.search.trim().toLowerCase();
        local = local.filter(a =>
          (a.name && a.name.toLowerCase().includes(q)) ||
          (a.code && a.code.toLowerCase().includes(q))
        );
      }
      return local;
    }
  },

  /**
   * GET /api/accounts/{id}
   */
  getAccountById: async (id: string | number): Promise<Account> => {
    try {
      return await apiClient(`/api/accounts/${id}`, {
        method: 'GET',
      });
    } catch (error: any) {
      console.warn('Backend in standby, finding account in local buffer:', error?.message || error);
      const acc = getStoredAccounts().find(a => String(a.id) === String(id));
      if (acc) return acc;
      throw error;
    }
  },

  /**
   * POST /api/accounts
   * Saves a new account to PostgreSQL via Spring Boot
   */
  createAccount: async (accountData: CreateAccountDTO): Promise<Account> => {
    try {
      const created = await apiClient('/api/accounts', {
        method: 'POST',
        body: JSON.stringify(accountData),
      });
      if (created && (created.id || created.name)) {
        const current = getStoredAccounts();
        saveStoredAccounts([created, ...current]);
        return created;
      }
    } catch (error: any) {
      console.warn('Backend in standby, buffering created account locally:', error?.message || error);
    }

    const newAccount: Account = {
      id: 'ACC-' + Date.now().toString().slice(-4),
      name: accountData.name,
      type: accountData.type,
      code: accountData.code,
      description: accountData.description,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    const current = getStoredAccounts();
    saveStoredAccounts([newAccount, ...current]);
    return newAccount;
  },

  /**
   * PUT /api/accounts/{id}
   * Updates an existing account
   */
  updateAccount: async (id: string | number, accountData: UpdateAccountDTO): Promise<Account> => {
    try {
      const updated = await apiClient(`/api/accounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(accountData),
      });
      if (updated && (updated.id || updated.name)) {
        const current = getStoredAccounts();
        saveStoredAccounts(current.map(a => String(a.id) === String(id) ? { ...a, ...updated } : a));
        return updated;
      }
    } catch (error: any) {
      console.warn('Backend in standby, updating account in local buffer:', error?.message || error);
    }

    const current = getStoredAccounts();
    const existing = current.find(a => String(a.id) === String(id));
    const merged: Account = {
      id,
      name: accountData.name || existing?.name || '',
      type: accountData.type || existing?.type || 'ASSET',
      code: existing?.code,
      description: accountData.description !== undefined ? accountData.description : existing?.description,
      status: accountData.status || existing?.status || 'ACTIVE',
      createdAt: existing?.createdAt,
      updatedAt: new Date().toISOString(),
    };
    saveStoredAccounts(current.map(a => String(a.id) === String(id) ? merged : a));
    return merged;
  },

  /**
   * PATCH /api/accounts/{id}/status
   * Soft updates account status (ACTIVE <-> INACTIVE)
   */
  updateAccountStatus: async (id: string | number, status: AccountStatus): Promise<Account | void> => {
    try {
      const res = await apiClient(`/api/accounts/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      const current = getStoredAccounts();
      saveStoredAccounts(current.map(a => String(a.id) === String(id) ? { ...a, status } : a));
      return res;
    } catch (error: any) {
      console.warn('Backend in standby, updating account status in buffer:', error?.message || error);
      const current = getStoredAccounts();
      saveStoredAccounts(current.map(a => String(a.id) === String(id) ? { ...a, status } : a));
    }
  },
};
