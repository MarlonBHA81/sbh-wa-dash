import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card } from '../ui/Card'
import { Spinner } from '../ui/Spinner'
import { EmptyState } from '../ui/EmptyState'
import type { StakeholderMetrics } from '../../types/database'

const CHART_COLORS = ['#4e8a88', '#683f59', '#5d7868', '#484851', '#4e8a88', '#683f59']

interface FocusAreaBarProps {
  metrics: StakeholderMetrics | null
  loading: boolean
}

export function FocusAreaBar({ metrics, loading }: FocusAreaBarProps) {
  const data = useMemo(() => {
    if (!metrics) return []
    return [
      { name: 'Sell & negotiate', count: metrics.fa_sell },
      { name: 'Finances & compliance', count: metrics.fa_finance },
      { name: 'Finding customers', count: metrics.fa_customers },
      { name: 'AI productivity', count: metrics.fa_ai },
      { name: 'RFPs & Tenders', count: metrics.fa_rfp },
      { name: 'Leadership & burnout', count: metrics.fa_leadership },
    ].sort((a, b) => b.count - a.count)
  }, [metrics])

  if (loading) {
    return (
      <Card title="Focus area distribution">
        <div className="h-64 flex items-center justify-center">
          <Spinner />
        </div>
      </Card>
    )
  }

  if (!data.length || data.every(d => d.count === 0)) {
    return (
      <Card title="Focus area distribution">
        <EmptyState />
      </Card>
    )
  }

  return (
    <Card title="Focus area distribution">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 8, right: 32, top: 4, bottom: 4 }}
          barCategoryGap="20%"
        >
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#484851' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fontSize: 11, fill: '#484851' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #d3cfce', fontSize: 12 }}
            formatter={(v: number) => [v, 'Conversations']}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Conversations">
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
