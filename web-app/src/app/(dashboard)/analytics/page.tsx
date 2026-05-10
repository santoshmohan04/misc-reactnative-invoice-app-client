'use client';

import { useMemo, useState } from 'react';
import {
  DateRangeFilter,
  ChartCard,
  RevenueTrendChart,
  StatusDistributionChart,
  PaymentOutcomeChart,
  TopCustomersChart,
} from '@/components/analytics';
import {
  buildInvoiceStatusDistribution,
  buildPaymentOutcomeSeries,
  buildRevenueTrend,
  buildTopCustomers,
  filterInvoicesByDateRange,
  type AnalyticsDateRange,
} from '@/lib/analytics/buildSeries';
import { useGetCustomersQuery, useGetInvoicesQuery } from '@/store/apiSlice';
import type { Customer, Invoice } from '@/types';

const getDefaultRange = (): AnalyticsDateRange => {
  const today = new Date();
  const from = new Date();
  from.setDate(today.getDate() - 90);

  return {
    from: from.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
  };
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>(getDefaultRange);
  const { data: invoicesData = [], isLoading: invoicesLoading } = useGetInvoicesQuery({});
  const { data: customersData = [], isLoading: customersLoading } = useGetCustomersQuery({});

  const invoices = invoicesData as Invoice[];
  const customers = customersData as Customer[];

  const filteredInvoices = useMemo(
    () => filterInvoicesByDateRange(invoices, dateRange),
    [invoices, dateRange],
  );

  const revenueTrend = useMemo(() => buildRevenueTrend(filteredInvoices), [filteredInvoices]);
  const statusDistribution = useMemo(
    () => buildInvoiceStatusDistribution(filteredInvoices),
    [filteredInvoices],
  );
  const paymentOutcomes = useMemo(
    () => buildPaymentOutcomeSeries(filteredInvoices),
    [filteredInvoices],
  );
  const topCustomers = useMemo(
    () => buildTopCustomers(filteredInvoices, customers),
    [filteredInvoices, customers],
  );

  const isLoading = invoicesLoading || customersLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Revenue, invoices, payments, and customer trends</p>
      </div>

      <DateRangeFilter value={dateRange} onChange={setDateRange} />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-[340px] animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Revenue Trends" subtitle="Monthly revenue in selected range">
              <RevenueTrendChart data={revenueTrend} />
            </ChartCard>

            <ChartCard title="Invoice Status Distribution" subtitle="Draft vs sent vs paid vs cancelled">
              <StatusDistributionChart data={statusDistribution} />
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Payment Outcomes" subtitle="Success, pending, and failed payment states">
              <PaymentOutcomeChart data={paymentOutcomes} />
            </ChartCard>

            <ChartCard title="Top Customers" subtitle="Top customers by invoice revenue">
              <TopCustomersChart data={topCustomers} />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
