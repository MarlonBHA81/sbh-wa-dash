import { useState } from 'react'
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { EmptyState } from '../ui/EmptyState'
import { useTimeSeries } from '../../hooks/useTimeSeries'

export function TimeSeriesChart() {
  const [period, setPeriod] = useState<30 | 90>(30)
  const { data, loading } = useTimeSeries(period)

  const chartData = data.map(d => ({
    ...d,
    label: format(new Date(d.date), period === 30 ? 'MMM d' : 'MMM d'),
  }))

  // Thin out x-axis labels when period is 90 days
  const xTickFormatter = (val: string, index: number) => {
    if (period === 90 && index % 7 !== 0) return ''
    return val
  }

  return (
    <Card title="Conversations over time">
      <div className="flex gap-2 mb-4">
        <Button
          variant={period === 30 ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setPeriod(30)}
        >
          30 days
        </Button>
        <Button
          variant={period === 90 ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setPeriod(90)}
        >
          90 days
        </Button>
      </div>

      {loading ? (
        <div className="h-56 flex items-center justify-center">
          <Spinner />
        </div>
      ) : chartData.every(d => d.count === 0) ? (
        <EmptyState />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ left: -16, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d3cfce" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#484851' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={xTickFormatter}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#484851' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #d3cfce', fontSize: 12 }}
              labelStyle={{ color: '#484851' }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#4e8a88"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#4e8a88' }}
              name="Conversations"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
