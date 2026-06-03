import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'
import { Card } from '../ui/Card'
import { Spinner } from '../ui/Spinner'
import { EmptyState } from '../ui/EmptyState'
import type { FunnelStep } from '../../types/database'

const STEP_LABELS: Record<string, string> = {
  inbound:      'Inbound',
  greeting:     'Greeting',
  name_capture: 'Name',
  vendor_check: 'Vendor check',
  focus_area:   'Focus area',
  struggle:     'Struggle',
  lead_form:    'Lead form',
  completion:   'Complete',
}

interface FunnelChartProps {
  steps: FunnelStep[]
  loading: boolean
}

// Build a gradient of teal shades across funnel steps
const STEP_COLORS = [
  '#4e8a88', '#4e8585', '#4d8080', '#4d7b7b',
  '#4c7676', '#4c7171', '#4b6c6c', '#4b6767',
]

export function FunnelChart({ steps, loading }: FunnelChartProps) {
  if (loading) {
    return (
      <Card title="Intake funnel">
        <div className="h-72 flex items-center justify-center">
          <Spinner />
        </div>
      </Card>
    )
  }

  const hasData = steps.some(s => s.count > 0)
  if (!hasData) {
    return (
      <Card title="Intake funnel">
        <EmptyState description="No events found. Run the seed script or wait for real intake data." />
      </Card>
    )
  }

  const chartData = steps.map((s, i) => ({
    name: STEP_LABELS[s.step] ?? s.step,
    count: s.count,
    dropOff: s.dropOffPct,
    fill: STEP_COLORS[i % STEP_COLORS.length],
  }))

  return (
    <Card title="Intake funnel">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ left: 8, right: 48, top: 4, bottom: 4 }}
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
            width={88}
            tick={{ fontSize: 11, fill: '#484851' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #d3cfce', fontSize: 12 }}
            formatter={(value: number) => [value, 'Reached']}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              style={{ fontSize: 11, fill: '#484851' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
