import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ChartPoint } from '../utils/dates';
import { formatNumber } from '../utils/dates';

interface ExerciseChartProps {
  data: ChartPoint[];
  unit: string;
}

export function ExerciseChart({ data, unit }: ExerciseChartProps) {
  const tickInterval = Math.max(1, Math.floor(data.length / 6));

  return (
    <div className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#262626" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
            stroke="#737373"
            tick={{ fill: '#a3a3a3', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={tickInterval}
            tickFormatter={(day) => `D${day}`}
          />
          <YAxis
            stroke="#737373"
            tick={{ fill: '#a3a3a3', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(value) => formatNumber(value)}
          />
          <Tooltip
            contentStyle={{
              background: '#1a1a1a',
              border: '1px solid #262626',
              borderRadius: '0.75rem',
              color: '#f5f5f5',
            }}
            labelFormatter={(_, payload) => {
              const point = payload?.[0]?.payload as ChartPoint | undefined;
              return point?.date ?? '';
            }}
            formatter={(value: number, name: string) => [
              `${formatNumber(value, name === 'Ideal pace' ? 0 : 0)} ${unit}`,
              name,
            ]}
          />
          <Legend
            wrapperStyle={{ color: '#a3a3a3', fontSize: 12, paddingTop: 12 }}
          />
          <Line
            type="monotone"
            dataKey="ideal"
            name="Ideal pace"
            stroke="#737373"
            strokeDasharray="6 4"
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Logged"
            stroke="#4ade80"
            dot={false}
            strokeWidth={2.5}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
