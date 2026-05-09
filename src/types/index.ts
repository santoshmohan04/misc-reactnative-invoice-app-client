/**
 * Entity types for the mobile app
 * Aligned with backend response formats
 */

export interface User {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  company?: string;
  base_currency?: string;
  tax_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Invoice {
  _id?: string;
  id?: string;
  customer_id: string;
  customer?: Customer;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  issued: string; // ISO date
  items?: InvoiceItem[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Item {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  unit_price: number;
  quantity?: number;
  unit?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItem {
  _id?: string;
  id?: string;
  item_id: string;
  item?: Item;
  quantity: number;
  unit_price: number;
}

/**
 * API Response envelope type
 * All API responses follow this structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Pagination types
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
