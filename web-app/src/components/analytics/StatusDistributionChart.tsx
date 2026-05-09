import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ChartEmptyState } from './ChartEmptyState';

interface StatusPoint {
  name: string;
  value: number;
  color: string;
}

export function StatusDistributionChart({ data }: { data: StatusPoint[] }) {
  const hasValues = data.some((entry) => entry.value > 0);
  if (!hasValues) {
    return <ChartEmptyState message="No status distribution available." />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={90}
          dataKey="value"
          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
