export type JournalType = 'SALES' | 'PURCHASE' | 'BANK' | 'CASH';
export type JournalStatus = 'ACTIVE' | 'INACTIVE';

export interface Journal {
  id: string | number;
  name: string;
  type: JournalType;
  defaultAccountId: string | number;
  defaultAccountName?: string;
  defaultAccountType?: string;
  code?: string;
  description?: string;
  status: JournalStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateJournalDTO {
  name: string;
  type: JournalType;
  defaultAccountId: string | number;
  code?: string;
  description?: string;
}

export interface UpdateJournalDTO {
  name?: string;
  type?: JournalType;
  defaultAccountId?: string | number;
  code?: string;
  description?: string;
  status?: JournalStatus;
}
