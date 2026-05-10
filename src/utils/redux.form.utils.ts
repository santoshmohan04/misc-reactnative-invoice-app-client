/**
 * Validates that issued date is before due date
 */
export function validatePositiveTimeDifference(
  issued: number,
  due: number,
): string | undefined {
  return due < issued ? 'Due date should be after issuing' : undefined;
}

export const required = (value: unknown): string | undefined =>
  value ? undefined : 'Required';

export const email = (value: string | undefined): string | undefined =>
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? 'Invalid email address'
    : undefined;

export const number = (value: string | number | undefined): string | undefined =>
  value !== undefined && value !== '' && Number.isNaN(Number(value))
    ? 'Should be a number'
    : undefined;

export const integer = (value: number | undefined): string | undefined =>
  value !== undefined && !Number.isInteger(value)
    ? 'Should be an integer'
    : undefined;

export const phone = (value: string | undefined): string | undefined =>
  value && !/^[a-zA-Z0-9]{8,16}$/i.test(value)
    ? 'Invalid phone number'
    : undefined;

export const formatCurrency = (
  input: number | string | undefined,
  currency = '',
): string => {
  if (input === undefined || input === null || input === '') {
    return '';
  }

  return currency
    .concat(String(input))
    .replace(/,/g, '')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const normalizeCurrency = (val: string | undefined): string => {
  if (!val) {
    return '';
  }

  return val
    .replace(/\b(0(?!\b))+/g, '')
    .replace(/\D/g, '');
};
