/**
 * Domain types - Core business entities
 * These represent the shape of data in the application domain
 */

/**
 * User/Authentication types
 */
export interface User {
  _id?: string;
  email?: string;
  name?: string;
  company?: string;
  phone?: string;
  address?: string;
  base_currency?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface AuthCredentials {
  access_token: string;
  refresh_token?: string | null;
  user?: User;
}

/**
 * Customer types
 */
export interface Customer {
  _id?: string;
  name: string;
  email?: string;
  company?: string;
  phone?: string;
  mobile?: string;
  addresses?: string[];
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Item types
 */
export interface Item {
  _id?: string;
  name: string;
  price?: number;
  description?: string;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Invoice types
 */
export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  discount?: number;
  subtotal?: number;
}

export interface Invoice {
  _id?: string;
  number: string;
  customer?: string; // customer name or ID
  customer_name?: string;
  issued: string | number; // ISO date or Unix timestamp
  due: string | number; // ISO date or Unix timestamp
  items?: InvoiceItem[];
  subtotal?: number;
  discount?: number;
  tax?: number;
  total?: number;
  status?: 'draft' | 'sent' | 'paid' | 'cancelled';
  notes?: string;
  createdAt?: number;
  updatedAt?: number;
  created_at?: string | number;
  due_date?: string | number;
}

/**
 * Payment types
 */
export interface Payment {
  _id: string;
  invoice: string; // invoice ID
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentLink?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Pagination types
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
