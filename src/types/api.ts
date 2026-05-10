/**
 * API DTO types - Request and response shapes
 * These represent the data structures sent to/from the API
 */

import type { User, Customer, Item, Invoice, Payment } from './domain';

/**
 * API response envelope
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  responseBody?: T;
  error?: string | Record<string, unknown>;
  status?: number;
}

export interface ApiError {
  success: false;
  message?: string;
  error?: string | Record<string, unknown>;
  status?: number;
  responseBody?: Record<string, unknown>;
}

/**
 * Authentication DTOs
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user?: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  token: string;
  refreshToken?: string;
  user?: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
}

/**
 * User DTOs
 */
export interface GetUserResponse {
  user: User;
}

export interface UpdateUserRequest {
  name?: string;
  company?: string;
  phone?: string;
  address?: string;
  base_currency?: string;
}

export interface UpdateUserResponse {
  user: User;
}

/**
 * Customer DTOs
 */
export interface GetCustomersResponse {
  customers: Customer[];
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  mobile?: string;
  addresses?: string[];
}

export interface UpdateCustomerRequest extends CreateCustomerRequest {
  _id: string;
}

export interface UpsertCustomerRequest {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  mobile?: string;
  addresses?: string[];
  _id?: string;
}

export interface UpsertCustomerResponse {
  customer: Customer;
}

/**
 * Item DTOs
 */
export interface GetItemsResponse {
  items: Item[];
}

export interface CreateItemRequest {
  name: string;
  price: number;
  description?: string;
}

export interface UpdateItemRequest extends CreateItemRequest {
  _id: string;
}

export interface UpsertItemRequest {
  name: string;
  price: number;
  description?: string;
  _id?: string;
}

export interface UpsertItemResponse {
  item: Item;
}

/**
 * Invoice DTOs
 */
export interface GetInvoicesResponse {
  invoices: Invoice[];
}

export interface CreateInvoiceRequest {
  number: string;
  customer: string;
  issued: number;
  due: number;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
    discount?: number;
  }>;
  notes?: string;
}

export interface UpdateInvoiceRequest extends CreateInvoiceRequest {
  _id: string;
}

export interface UpsertInvoiceRequest {
  number: string;
  customer: string;
  issued: number;
  due: number;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
    discount?: number;
  }>;
  notes?: string;
  _id?: string;
}

export interface UpsertInvoiceResponse {
  invoice: Invoice;
}

/**
 * Payment DTOs
 */
export interface CreatePaymentRequest {
  invoiceId: string;
  amount: number;
}

export interface CreatePaymentResponse {
  payment: Payment;
  paymentLink: string;
}

export interface SendInvoiceEmailRequest {
  invoiceId: string;
}

export interface SendInvoiceEmailResponse {
  success: boolean;
  message: string;
}
