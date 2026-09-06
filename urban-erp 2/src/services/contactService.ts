import { apiClient } from './apiClient';
import { Contact, CreateContactDTO, UpdateContactDTO, ContactStatus } from '../types/contact';

export interface ContactFilterParams {
  search?: string;
  type?: string;
  status?: string;
}

const STORAGE_KEY = 'urban_erp_contacts_store_v1';

const INITIAL_STARTER_CONTACTS: Contact[] = [
  {
    id: 'CNT-1001',
    name: 'Acme Wood & Timber Ltd',
    type: 'VENDOR',
    email: 'orders@acmewood.com',
    mobile: '+1 (555) 234-5678',
    address: '100 Industrial Parkway',
    city: 'Portland',
    state: 'Oregon',
    pincode: '97201',
    status: 'ACTIVE',
    createdAt: '2026-08-15T08:30:00Z',
  },
  {
    id: 'CNT-1002',
    name: 'Urban Living Showroom',
    type: 'CUSTOMER',
    email: 'contact@urbanlivingshowroom.com',
    mobile: '+1 (555) 876-5432',
    address: '450 Fashion Avenue, Suite 12',
    city: 'New York',
    state: 'New York',
    pincode: '10018',
    status: 'ACTIVE',
    createdAt: '2026-08-20T10:15:00Z',
  },
  {
    id: 'CNT-1003',
    name: 'Northwest Logistics & Freight',
    type: 'BOTH',
    email: 'dispatch@nwfreight.com',
    mobile: '+1 (555) 345-6789',
    address: '88 Terminal Way',
    city: 'Seattle',
    state: 'Washington',
    pincode: '98134',
    status: 'ACTIVE',
    createdAt: '2026-08-28T14:45:00Z',
  },
];

function getStoredContacts(): Contact[] {
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
  return INITIAL_STARTER_CONTACTS;
}

function saveStoredContacts(contacts: Contact[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  } catch (e) {
    // Ignore storage quota errors
  }
}

export const contactService = {
  /**
   * GET /api/contacts
   * Fetches the list of contacts, optionally filtered.
   */
  getContacts: async (params?: ContactFilterParams): Promise<Contact[]> => {
    let endpoint = '/api/contacts';
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

      let results: Contact[] = [];
      if (Array.isArray(data)) {
        results = data;
      } else if (data && Array.isArray(data.content)) {
        results = data.content;
      } else if (data && Array.isArray(data.data)) {
        results = data.data;
      }

      if (results.length > 0) {
        saveStoredContacts(results);
      }
      return results;
    } catch (error: any) {
      console.warn('Spring Boot backend currently in standby or unreachable:', error?.message || error);
      let local = getStoredContacts();
      if (params?.type && params.type !== 'ALL') {
        local = local.filter(c => c.type === params.type);
      }
      if (params?.status && params.status !== 'ALL') {
        local = local.filter(c => c.status === params.status);
      }
      if (params?.search?.trim()) {
        const q = params.search.trim().toLowerCase();
        local = local.filter(c => 
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.mobile && c.mobile.toLowerCase().includes(q)) ||
          (c.city && c.city.toLowerCase().includes(q))
        );
      }
      return local;
    }
  },

  /**
   * GET /api/contacts/{id}
   * Fetches single contact by ID
   */
  getContactById: async (id: string | number): Promise<Contact> => {
    try {
      return await apiClient(`/api/contacts/${id}`, {
        method: 'GET',
      });
    } catch (error: any) {
      console.warn('Backend offline, retrieving contact from local buffer:', error?.message || error);
      const contact = getStoredContacts().find(c => String(c.id) === String(id));
      if (contact) return contact;
      throw error;
    }
  },

  /**
   * POST /api/contacts
   * Creates a new contact
   */
  createContact: async (contactData: CreateContactDTO): Promise<Contact> => {
    try {
      const created = await apiClient('/api/contacts', {
        method: 'POST',
        body: JSON.stringify(contactData),
      });
      if (created && (created.id || created.name)) {
        const current = getStoredContacts();
        saveStoredContacts([created, ...current]);
        return created;
      }
    } catch (error: any) {
      console.warn('Backend unavailable, buffering created contact locally:', error?.message || error);
    }

    const newContact: Contact = {
      id: 'CNT-' + Date.now().toString().slice(-4),
      name: contactData.name,
      type: contactData.type,
      email: contactData.email,
      mobile: contactData.mobile,
      address: contactData.address,
      city: contactData.city,
      state: contactData.state,
      pincode: contactData.pincode,
      profileImage: contactData.profileImage,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    const current = getStoredContacts();
    saveStoredContacts([newContact, ...current]);
    return newContact;
  },

  /**
   * PUT /api/contacts/{id}
   * Updates an existing contact
   */
  updateContact: async (id: string | number, contactData: UpdateContactDTO): Promise<Contact> => {
    try {
      const updated = await apiClient(`/api/contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(contactData),
      });
      if (updated && (updated.id || updated.name)) {
        const current = getStoredContacts();
        saveStoredContacts(current.map(c => String(c.id) === String(id) ? { ...c, ...updated } : c));
        return updated;
      }
    } catch (error: any) {
      console.warn('Backend unavailable, updating contact in local buffer:', error?.message || error);
    }

    const current = getStoredContacts();
    const existing = current.find(c => String(c.id) === String(id));
    const merged: Contact = {
      id,
      name: contactData.name || existing?.name || '',
      type: contactData.type || existing?.type || 'CUSTOMER',
      email: contactData.email !== undefined ? contactData.email : existing?.email,
      mobile: contactData.mobile !== undefined ? contactData.mobile : existing?.mobile,
      address: contactData.address !== undefined ? contactData.address : existing?.address,
      city: contactData.city !== undefined ? contactData.city : existing?.city,
      state: contactData.state !== undefined ? contactData.state : existing?.state,
      pincode: contactData.pincode !== undefined ? contactData.pincode : existing?.pincode,
      profileImage: contactData.profileImage !== undefined ? contactData.profileImage : existing?.profileImage,
      status: contactData.status || existing?.status || 'ACTIVE',
      createdAt: existing?.createdAt,
      updatedAt: new Date().toISOString(),
    };
    saveStoredContacts(current.map(c => String(c.id) === String(id) ? merged : c));
    return merged;
  },

  /**
   * PATCH /api/contacts/{id}/status
   * Updates status (e.g. ACTIVE -> INACTIVE)
   */
  updateContactStatus: async (id: string | number, status: ContactStatus): Promise<Contact | void> => {
    try {
      const res = await apiClient(`/api/contacts/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      const current = getStoredContacts();
      saveStoredContacts(current.map(c => String(c.id) === String(id) ? { ...c, status } : c));
      return res;
    } catch (error: any) {
      console.warn('Backend unavailable, updating status in local buffer:', error?.message || error);
      const current = getStoredContacts();
      saveStoredContacts(current.map(c => String(c.id) === String(id) ? { ...c, status } : c));
    }
  },
};

