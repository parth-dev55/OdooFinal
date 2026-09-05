export type AccountType = 'ASSET' | 'LIABILITY' | 'EXPENSE' | 'INCOME' | 'CAPITAL';
export type AccountStatus = 'ACTIVE' | 'INACTIVE';

export interface Account {
  id: string | number;
  name: string;
  type: AccountType;
  status: AccountStatus;
  code?: string;
  description?: string;
  balance?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAccountDTO {
  name: string;
  type: AccountType;
  code?: string;
  description?: string;
}

export interface UpdateAccountDTO {
  name?: string;
  type?: AccountType;
  description?: string;
  status?: AccountStatus;
}
