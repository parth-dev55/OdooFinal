import { apiClient } from './apiClient';
import { Journal, CreateJournalDTO, UpdateJournalDTO, JournalStatus } from '../types/journal';

export interface JournalFilterParams {
  search?: string;
  type?: string;
  status?: string;
}

const STORAGE_KEY = 'urban_erp_journals_store_v1';

// Initial fallback/demo journals for UI standby when Spring Boot backend is in standby
const DEMO_FALLBACK_JOURNALS: Journal[] = [
  {
    id: 'JRN-1001',
    name: 'Sales Journal',
    type: 'SALES',
    defaultAccountId: 'ACC-4001',
    defaultAccountName: 'Sales Income',
    defaultAccountType: 'INCOME',
    code: 'SJ-01',
    description: 'Records customer invoices, sales receipts, and operating revenues',
    status: 'ACTIVE',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'JRN-1002',
    name: 'Purchase Journal',
    type: 'PURCHASE',
    defaultAccountId: 'ACC-5001',
    defaultAccountName: 'Purchase Expense',
    defaultAccountType: 'EXPENSE',
    code: 'PJ-01',
    description: 'Records vendor bills, procurement costs, and supply expenses',
    status: 'ACTIVE',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'JRN-1003',
    name: 'Bank Journal',
    type: 'BANK',
    defaultAccountId: 'ACC-1002',
    defaultAccountName: 'Bank',
    defaultAccountType: 'ASSET',
    code: 'BJ-01',
    description: 'Records electronic transfers, wire settlements, and bank fee postings',
    status: 'ACTIVE',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'JRN-1004',
    name: 'Cash Journal',
    type: 'CASH',
    defaultAccountId: 'ACC-1001',
    defaultAccountName: 'Cash',
    defaultAccountType: 'ASSET',
    code: 'CJ-01',
    description: 'Records petty cash disbursements and direct counter cash intake',
    status: 'ACTIVE',
    createdAt: '2026-08-01T08:00:00Z',
  },
];

function getStoredJournals(): Journal[] {
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
  return DEMO_FALLBACK_JOURNALS;
}

function saveStoredJournals(journals: Journal[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(journals));
  } catch (e) {
    // Ignore storage quota errors
  }
}

export const journalService = {
  /**
   * GET /api/journals
   * Fetches real journals from backend, falling back to local buffer only if backend is unreachable.
   */
  getJournals: async (params?: JournalFilterParams): Promise<Journal[]> => {
    let endpoint = '/api/journals';
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

      let results: Journal[] = [];
      if (Array.isArray(data)) {
        results = data;
      } else if (data && Array.isArray(data.content)) {
        results = data.content;
      } else if (data && Array.isArray(data.data)) {
        results = data.data;
      }

      if (results.length > 0) {
        // Save real API data to cache so it is used instead of demo data
        saveStoredJournals(results);
      }
      return results;
    } catch (error: any) {
      console.warn('Spring Boot backend in standby for journals, using local buffer:', error?.message || error);
      let local = getStoredJournals();

      if (params?.type && params.type !== 'ALL') {
        local = local.filter(j => j.type === params.type);
      }
      if (params?.status && params.status !== 'ALL') {
        local = local.filter(j => j.status === params.status);
      }
      if (params?.search?.trim()) {
        const q = params.search.trim().toLowerCase();
        local = local.filter(j =>
          (j.name && j.name.toLowerCase().includes(q)) ||
          (j.code && j.code.toLowerCase().includes(q))
        );
      }
      return local;
    }
  },

  /**
   * GET /api/journals/{id}
   */
  getJournalById: async (id: string | number): Promise<Journal> => {
    try {
      return await apiClient(`/api/journals/${id}`, {
        method: 'GET',
      });
    } catch (error: any) {
      console.warn('Backend in standby, finding journal in local buffer:', error?.message || error);
      const jrn = getStoredJournals().find(j => String(j.id) === String(id));
      if (jrn) return jrn;
      throw error;
    }
  },

  /**
   * POST /api/journals
   * Saves a new journal to PostgreSQL via Spring Boot
   */
  createJournal: async (journalData: CreateJournalDTO): Promise<Journal> => {
    try {
      const created = await apiClient('/api/journals', {
        method: 'POST',
        body: JSON.stringify(journalData),
      });
      if (created && (created.id || created.name)) {
        const current = getStoredJournals();
        saveStoredJournals([created, ...current]);
        return created;
      }
    } catch (error: any) {
      console.warn('Backend in standby, buffering created journal locally:', error?.message || error);
    }

    const newJournal: Journal = {
      id: 'JRN-' + Date.now().toString().slice(-4),
      name: journalData.name,
      type: journalData.type,
      defaultAccountId: journalData.defaultAccountId,
      code: journalData.code,
      description: journalData.description,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    const current = getStoredJournals();
    saveStoredJournals([newJournal, ...current]);
    return newJournal;
  },

  /**
   * PUT /api/journals/{id}
   * Updates an existing journal
   */
  updateJournal: async (id: string | number, journalData: UpdateJournalDTO): Promise<Journal> => {
    try {
      const updated = await apiClient(`/api/journals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(journalData),
      });
      if (updated && (updated.id || updated.name)) {
        const current = getStoredJournals();
        saveStoredJournals(current.map(j => String(j.id) === String(id) ? { ...j, ...updated } : j));
        return updated;
      }
    } catch (error: any) {
      console.warn('Backend in standby, updating journal in local buffer:', error?.message || error);
    }

    const current = getStoredJournals();
    const existing = current.find(j => String(j.id) === String(id));
    const merged: Journal = {
      id,
      name: journalData.name || existing?.name || '',
      type: journalData.type || existing?.type || 'SALES',
      defaultAccountId: journalData.defaultAccountId || existing?.defaultAccountId || '',
      defaultAccountName: existing?.defaultAccountName,
      defaultAccountType: existing?.defaultAccountType,
      code: journalData.code || existing?.code,
      description: journalData.description !== undefined ? journalData.description : existing?.description,
      status: journalData.status || existing?.status || 'ACTIVE',
      createdAt: existing?.createdAt,
      updatedAt: new Date().toISOString(),
    };
    saveStoredJournals(current.map(j => String(j.id) === String(id) ? merged : j));
    return merged;
  },

  /**
   * PATCH /api/journals/{id}/status
   * Soft updates journal status (ACTIVE <-> INACTIVE)
   */
  updateJournalStatus: async (id: string | number, status: JournalStatus): Promise<Journal | void> => {
    try {
      const res = await apiClient(`/api/journals/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      const current = getStoredJournals();
      saveStoredJournals(current.map(j => String(j.id) === String(id) ? { ...j, status } : j));
      return res;
    } catch (error: any) {
      console.warn('Backend in standby, updating journal status in buffer:', error?.message || error);
      const current = getStoredJournals();
      saveStoredJournals(current.map(j => String(j.id) === String(id) ? { ...j, status } : j));
    }
  },
};
