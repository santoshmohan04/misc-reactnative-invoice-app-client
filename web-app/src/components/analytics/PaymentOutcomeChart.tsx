import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { ChartEmptyState } from './ChartEmptyState';

interface PaymentPoint {
  name: string;
  value: number;
  color: string;
}

export function PaymentOutcomeChart({ data }: { data: PaymentPoint[] }) {
  const hasValues = data.some((entry) => entry.value > 0);
  if (!hasValues) {
    return <ChartEmptyState message="No payment outcomes for selected range." />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value">
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
