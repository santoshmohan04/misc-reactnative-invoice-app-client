'use client';

import { useMemo } from 'react';
import { useGetCustomersQuery, useGetInvoicesQuery } from '@/store/apiSlice';
import type { Customer, Invoice } from '@/types';
import { getInvoiceDate } from '@/lib/analytics/normalize';

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

export default function ReportsPage() {
  const { data: invoicesData = [], isLoading: invoicesLoading } = useGetInvoicesQuery({});
  const { data: customersData = [], isLoading: customersLoading } = useGetCustomersQuery({});

  const invoices = invoicesData as Invoice[];
  const customers = customersData as Customer[];

  const metrics = useMemo(() => {
    const totalRevenue = invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
    const paidRevenue = invoices
      .filter((invoice) => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
    const unpaidRevenue = Math.max(totalRevenue - paidRevenue, 0);

    const currentMonth = new Date().getMonth();
    const currentMonthInvoices = invoices.filter((invoice) => {
      const date = getInvoiceDate(invoice);
      return date?.getMonth() === currentMonth;
    }).length;

    return {
      totalRevenue,
      paidRevenue,
      unpaidRevenue,
      totalInvoices: invoices.length,
      totalCustomers: customers.length,
      currentMonthInvoices,
    };
  }, [invoices, customers]);

  const isLoading = invoicesLoading || customersLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-gray-600 dark:text-gray-400">Operational summary for finance and account management</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="h-24 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ReportCard label="Total Revenue" value={formatCurrency(metrics.totalRevenue)} />
          <ReportCard label="Paid Revenue" value={formatCurrency(metrics.paidRevenue)} />
          <ReportCard label="Outstanding Revenue" value={formatCurrency(metrics.unpaidRevenue)} />
          <ReportCard label="Total Invoices" value={String(metrics.totalInvoices)} />
          <ReportCard label="Invoices This Month" value={String(metrics.currentMonthInvoices)} />
          <ReportCard label="Total Customers" value={String(metrics.totalCustomers)} />
        </div>
      )}
    </div>
  );
}

function ReportCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
