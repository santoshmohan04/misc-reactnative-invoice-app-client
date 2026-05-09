import type { Customer, Invoice } from '@/types';
import { getInvoiceCustomerId, getInvoiceDate, mapCustomerName } from './normalize';

export interface AnalyticsDateRange {
  from: string;
  to: string;
}

const toMonthLabel = (date: Date): string => {
  return date.toLocaleString('default', { month: 'short' });
};

export const filterInvoicesByDateRange = (invoices: Invoice[], range: AnalyticsDateRange): Invoice[] => {
  const from = new Date(range.from);
  const to = new Date(range.to);
  to.setHours(23, 59, 59, 999);

  return invoices.filter((invoice) => {
    const date = getInvoiceDate(invoice);
    if (!date) {
      return false;
    }
    return date >= from && date <= to;
  });
};

export const buildRevenueTrend = (invoices: Invoice[]) => {
  const grouped = new Map<string, { month: string; revenue: number; invoices: number }>();

  invoices.forEach((invoice) => {
    const date = getInvoiceDate(invoice);
    if (!date) {
      return;
    }

    const month = toMonthLabel(date);
    const existing = grouped.get(month) || { month, revenue: 0, invoices: 0 };
    existing.revenue += Number(invoice.total || 0);
    existing.invoices += 1;
    grouped.set(month, existing);
  });

  return Array.from(grouped.values());
};

export const buildInvoiceStatusDistribution = (invoices: Invoice[]) => {
  const seed = {
    paid: 0,
    sent: 0,
    draft: 0,
    cancelled: 0,
  };

  invoices.forEach((invoice) => {
    const status = invoice.status || 'draft';
    if (status in seed) {
      seed[status as keyof typeof seed] += 1;
    }
  });

  return [
    { name: 'Paid', value: seed.paid, color: '#16a34a' },
    { name: 'Sent', value: seed.sent, color: '#2563eb' },
    { name: 'Draft', value: seed.draft, color: '#d97706' },
    { name: 'Cancelled', value: seed.cancelled, color: '#dc2626' },
  ];
};

export const buildPaymentOutcomeSeries = (invoices: Invoice[]) => {
  const paid = invoices.filter((invoice) => invoice.status === 'paid').length;
  const failed = invoices.filter((invoice) => invoice.status === 'cancelled').length;
  const pending = invoices.filter((invoice) => invoice.status === 'sent' || invoice.status === 'draft').length;

  return [
    { name: 'Success', value: paid, color: '#16a34a' },
    { name: 'Pending', value: pending, color: '#f59e0b' },
    { name: 'Failed', value: failed, color: '#dc2626' },
  ];
};

export const buildTopCustomers = (invoices: Invoice[], customers: Customer[]) => {
  const totals = new Map<string, number>();

  invoices.forEach((invoice) => {
    const customerId = getInvoiceCustomerId(invoice);
    if (!customerId) {
      return;
    }
    totals.set(customerId, (totals.get(customerId) || 0) + Number(invoice.total || 0));
  });

  return Array.from(totals.entries())
    .map(([customerId, total]) => ({ customer: mapCustomerName(customerId, customers), total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
};
