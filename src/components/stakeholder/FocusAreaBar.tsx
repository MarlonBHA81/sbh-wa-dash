import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from 'recharts'
import { Card } from '../ui/Card'
import { Spinner } from '../ui/Spinner'
import { EmptyState } from '../ui/EmptyState'
import type { CategoryStat } from '../../hooks/useCategoryBreakdown'

interface FocusAreaBarProps {
  data: CategoryStat[]
  loading: boolean
}

export function FocusAreaBar({ data, loading }: FocusAreaBarProps) {
  if (loading) {
    return (
      <Card title="Focus area distribution">
        <div className="h-64 flex items-center justify-center">
          <Spinner />
        </div>
      </Card>
    )
  }

  if (!data.length || data.every(d => d.total === 0)) {
    return (
      <Card title="Focus area distribution">
        <EmptyState />
      </Card>
    )
  }

  const chartData = data.map(d => ({
    name: d.label,
    Completed: d.completed,
    'In progress / abandoned': d.notCompleted,
    rate: d.completionRate,
  }))

  return (
    <Card title="Focus area distribution">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ left: 8, right: 56, top: 4, bottom: 4 }}
          barCategoryGap="22%"
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
            formatter={(value: number, name: string) => [value, name]}
          />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <Bar dataKey="Completed" stackId="a" fill="#4e8a88" radius={[0, 0, 0, 0]}>
            <LabelList
              dataKey="rate"
              position="right"
              formatter={(v: number) => `${v}%`}
              style={{ fontSize: 11, fill: '#484851' }}
            />
          </Bar>
          <Bar dataKey="In progress / abandoned" stackId="a" fill="#e0dedd" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
