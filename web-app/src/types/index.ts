export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  items: InvoiceItem[];
  total: number;
  status: 'draft' | 'sent' | 'paid';
  createdAt: string;
}

export interface InvoiceItem {
  itemId: string;
  quantity: number;
  price: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface Item {
  id: string;
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