/**
 * General utility functions for the application
 */

/**
 * Pad a number with leading zeros to reach desired length
 * 
 * @param num - Number to pad
 * @param places - Total desired string length
 * @returns Zero-padded string
 * 
 * @example
 * zeroPad(5, 3) // "005"
 * zeroPad(123, 5) // "00123"
 */
export const zeroPad = (num: number | string, places: number): string => {
  return String(num).padStart(places, '0');
};

/**
 * Format currency amount to 2 decimal places
 * 
 * @param amount - Amount to format
 * @returns Formatted amount string
 * 
 * @example
 * formatCurrency(1234.5) // "1234.50"
 * formatCurrency(1234) // "1234.00"
 */
export const formatCurrency = (amount: number): string => {
  return amount.toFixed(2);
};

/**
 * Format date to ISO string (YYYY-MM-DD)
 * 
 * @param date - Date to format
 * @returns ISO date string
 * 
 * @example
 * formatDateISO(new Date('2024-05-09')) // "2024-05-09"
 */
export const formatDateISO = (date: Date | number): string => {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

/**
 * Check if a value is empty
 * 
 * @param value - Value to check
 * @returns true if value is empty
 * 
 * @example
 * isEmpty(null) // true
 * isEmpty('') // true
 * isEmpty([]) // true
 * isEmpty({}) // true
 */
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string') {
    return value.trim().length === 0;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  return false;
};

/**
 * Debounce a function to delay execution
 * 
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 * 
 * @example
 * const debouncedSearch = debounce((query: string) => search(query), 300);
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

/**
 * Deep clone an object
 * 
 * @param obj - Object to clone
 * @returns Deep copy of object
 * 
 * @example
 * const original = { a: 1, b: { c: 2 } };
 * const cloned = deepClone(original);
 */
export const deepClone = <T,>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};
