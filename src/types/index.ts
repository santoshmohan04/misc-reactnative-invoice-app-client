/**
 * Types barrel export
 * Comprehensive TypeScript definitions for the entire application
 */

// ────────────────────────────────────────────────────────────────────────────
// Domain Types - Core business entities
// ────────────────────────────────────────────────────────────────────────────

/**
 * User/Authentication
 */
export interface User {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  address?: string;
  base_currency?: string;
  tax_id?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface AuthCredentials {
  access_token: string;
  refresh_token?: string | null;
  user?: User;
}

/**
 * Customer
 */
export interface Customer {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company?: string;
  address?: string;
  addresses?: string[];
  created_at?: string;
  updated_at?: string;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Item
 */
export interface Item {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  price?: number;
  unit_price?: number;
  quantity?: number;
  unit?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Invoice Item
 */
export interface InvoiceItem {
  _id?: string;
  id?: string;
  item_id?: string;
  item?: Item;
  description: string;
  quantity: number;
  price: number;
  unit_price?: number;
  discount?: number;
  subtotal?: number;
}

/**
 * Invoice
 */
export interface Invoice {
  _id?: string;
  id?: string;
  number: string;
  customer_id?: string;
  customer?: Customer;
  customer_name?: string;
  amount?: number;
  issued: string | number; // ISO date or timestamp
  issued_date?: string;
  due: string | number; // ISO date or timestamp
  due_date?: string;
  items?: InvoiceItem[];
  status?: 'draft' | 'sent' | 'paid' | 'cancelled';
  subtotal?: number;
  discount?: number;
  tax?: number;
  total?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Payment
 */
export interface Payment {
  _id: string;
  id?: string;
  invoice: string; // invoice ID
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentLink?: string;
  createdAt: number;
  updatedAt: number;
  created_at?: string;
  updated_at?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// API Response Types
// ────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  responseBody?: T;
  message?: string;
  errors?: Record<string, string[]>;
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
 * Pagination
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items?: T[];
  data?: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ────────────────────────────────────────────────────────────────────────────
// Authentication DTOs
// ────────────────────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────────────────────
// User DTOs
// ────────────────────────────────────────────────────────────────────────────

export interface GetUserResponse {
  user: User;
  userDetails?: User;
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

// ────────────────────────────────────────────────────────────────────────────
// Customer DTOs
// ────────────────────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────────────────────
// Item DTOs
// ────────────────────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────────────────────
// Invoice DTOs
// ────────────────────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────────────────────
// Payment DTOs
// ────────────────────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────────────────────
// Utility Types
// ────────────────────────────────────────────────────────────────────────────

/**
 * Nullable<T> - Explicitly nullable type
 */
export type Nullable<T> = T | null;

/**
 * Optional<T> - Explicitly optional type
 */
export type Optional<T> = T | undefined;

/**
 * DeepPartial<T> - All properties recursively optional
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * DeepReadonly<T> - All properties recursively readonly
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Async result wrapper
 */
export type AsyncResult<TSuccess, TError = Error> =
  | { status: 'pending' }
  | { status: 'success'; data: TSuccess }
  | { status: 'error'; error: TError };

/**
 * Form field error
 */
export interface FieldError {
  message: string;
  type?: string;
}

/**
 * Form state
 */
export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, FieldError>>;
  touched: Partial<Record<keyof T, boolean>>;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
}

/**
 * Navigation prop
 */
export interface NavigationProp<T = Record<string, any>> {
  navigate: (name: string, params?: T) => void;
  goBack: () => void;
  replace: (name: string, params?: T) => void;
  dispatch: (action: any) => void;
}

/**
 * API Error with status
 */
export class ApiErrorWithStatus extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiErrorWithStatus';
    this.status = status;
    this.data = data;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Type Guards
// ────────────────────────────────────────────────────────────────────────────

export const isNullable = <T,>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

export const isApiError = (error: unknown): error is ApiErrorWithStatus => {
  return error instanceof ApiErrorWithStatus;
};

export type {
  AuthStackParamList,
  AppStackParamList,
  BottomTabParamList,
  InvoicesStackParamList,
  CustomersStackParamList,
  ItemsStackParamList,
  RootStackParamList,
} from './navigation';

