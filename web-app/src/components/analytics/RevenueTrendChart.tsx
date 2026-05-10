import { ResponsiveContainer, CartesianGrid, LineChart, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { ChartEmptyState } from './ChartEmptyState';

interface RevenueDataPoint {
  month: string;
  revenue: number;
  invoices: number;
}

export function RevenueTrendChart({ data }: { data: RevenueDataPoint[] }) {
  if (!data.length) {
    return <ChartEmptyState message="No revenue data for selected range." />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
