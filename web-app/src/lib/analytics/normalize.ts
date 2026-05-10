import type { Customer, Invoice } from '@/types';

export const getEntityId = (entity: { id?: string; _id?: string }): string => {
  return entity.id || entity._id || '';
};

export const getInvoiceDate = (invoice: Invoice): Date | null => {
  const raw = invoice.createdAt || invoice.issued;
  if (!raw) {
    return null;
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getInvoiceCustomerId = (invoice: Invoice): string => {
  return invoice.customerId || invoice.customer || '';
};

export const mapCustomerName = (customerId: string, customers: Customer[]): string => {
  const customer = customers.find((entry) => getEntityId(entry) === customerId);
  return customer?.name || 'Unknown customer';
};
