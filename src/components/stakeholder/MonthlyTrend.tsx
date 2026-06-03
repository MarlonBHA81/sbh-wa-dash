import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import { Card } from '../ui/Card'
import { Spinner } from '../ui/Spinner'
import { EmptyState } from '../ui/EmptyState'
import type { MonthlyTrendRow } from '../../types/database'

interface MonthlyTrendProps {
  data: MonthlyTrendRow[]
  loading: boolean
}

export function MonthlyTrend({ data, loading }: MonthlyTrendProps) {
  const chartData = data.map(d => ({
    ...d,
    label: format(new Date(d.month), 'MMM yy'),
  }))

  if (loading) {
    return (
      <Card title="Monthly trend">
        <div className="h-56 flex items-center justify-center">
          <Spinner />
        </div>
      </Card>
    )
  }

  if (!chartData.length) {
    return (
      <Card title="Monthly trend">
        <EmptyState />
      </Card>
    )
  }

  return (
    <Card title="Monthly trend">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ left: -16, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d3cfce" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#484851' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#484851' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #d3cfce', fontSize: 12 }}
          />
          <Legend
            iconType="plainline"
            iconSize={16}
            formatter={(value: string) => (
              <span className="text-xs text-charcoal">{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="total_conversations"
            stroke="#4e8a88"
            strokeWidth={2}
            dot={{ r: 3, fill: '#4e8a88' }}
            activeDot={{ r: 5 }}
            name="Total"
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#5d7868"
            strokeWidth={2}
            dot={{ r: 3, fill: '#5d7868' }}
            activeDot={{ r: 5 }}
            name="Completed"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
