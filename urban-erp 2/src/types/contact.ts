export type ContactType = 'CUSTOMER' | 'VENDOR' | 'BOTH';
export type ContactStatus = 'ACTIVE' | 'INACTIVE';

export interface Contact {
  id: string | number;
  name: string;
  type: ContactType;
  email?: string;
  mobile?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  profileImage?: string;
  status: ContactStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateContactDTO {
  name: string;
  type: ContactType;
  email?: string;
  mobile?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  profileImage?: string;
}

export interface UpdateContactDTO extends Partial<CreateContactDTO> {
  status?: ContactStatus;
}
