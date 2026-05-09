/**
 * Utility types - Reusable type helpers
 */

/**
 * Nullable<T> - Makes a type explicitly nullable
 * Usage: Nullable<string> === string | null
 */
export type Nullable<T> = T | null;

/**
 * Optional<T> - Makes a type explicitly optional
 * Usage: Optional<string> === string | undefined
 */
export type Optional<T> = T | undefined;

/**
 * DeepPartial<T> - Makes all properties recursively optional
 * Usage: DeepPartial<User> allows partial user objects
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * DeepReadonly<T> - Makes all properties recursively readonly
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Omit<T, K> - Remove properties K from type T
 * (Built-in in TS 3.5+, included for reference)
 */
export type OmitProperties<T, K extends keyof T> = Omit<T, K>;

/**
 * Pick<T, K> - Select only properties K from type T
 * (Built-in in TS, included for reference)
 */
export type PickProperties<T, K extends keyof T> = Pick<T, K>;

/**
 * Async result wrapper for API calls
 */
export type AsyncResult<TSuccess, TError = Error> =
  | { status: 'pending' }
  | { status: 'success'; data: TSuccess }
  | { status: 'error'; error: TError };

/**
 * RTK Query result
 */
export type QueryResult<T> = {
  data?: T;
  isLoading: boolean;
  error?: unknown;
  isSuccess: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
};

/**
 * RTK Query mutation result
 */
export type MutationResult<T> = [
  trigger: (arg: any) => Promise<T>,
  state: {
    data?: T;
    isLoading: boolean;
    error?: unknown;
    isSuccess: boolean;
    isError: boolean;
  },
];

/**
 * Form field error
 */
export interface FieldError {
  message: string;
  type?: string;
}

/**
 * Form state wrapper
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
 * Navigation route params
 */
export interface RouteParams {
  [key: string]: any;
}

/**
 * Navigation prop type
 */
export interface NavigationProp<T = RouteParams> {
  navigate: (name: string, params?: T) => void;
  goBack: () => void;
  replace: (name: string, params?: T) => void;
  dispatch: (action: any) => void;
}

/**
 * API error with status code
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

/**
 * Type guard helpers
 */
export const isNullable = <T,>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

export const isApiError = (error: unknown): error is ApiErrorWithStatus => {
  return error instanceof ApiErrorWithStatus;
};
