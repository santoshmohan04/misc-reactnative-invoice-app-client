export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Invoice {
  id?: string;
  _id?: string;
  customerId?: string;
  customer?: string;
  items: InvoiceItem[];
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  createdAt?: string;
  issued?: string;
  number?: string;
}

export interface InvoiceItem {
  itemId: string;
  quantity: number;
  price: number;
}

export interface Customer {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface Item {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}