import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChartEmptyState } from './ChartEmptyState';

interface TopCustomerPoint {
  customer: string;
  total: number;
}

export function TopCustomersChart({ data }: { data: TopCustomerPoint[] }) {
  if (!data.length) {
    return <ChartEmptyState message="No customer spend data for selected range." />;
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" margin={{ left: 24, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="customer" width={120} />
        <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']} />
        <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 4, 4]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
