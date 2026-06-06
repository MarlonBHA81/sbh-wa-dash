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
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { EmptyState } from '../ui/EmptyState'
import { exportToCSV } from '../../lib/utils'
import type { CategoryStat } from '../../hooks/useCategoryBreakdown'

interface CategoryBreakdownProps {
  data: CategoryStat[]
  loading: boolean
}

export function CategoryBreakdown({ data, loading }: CategoryBreakdownProps) {
  const handleExport = () => {
    exportToCSV(
      data.map(d => ({
        Category: d.category,
        Total: d.total,
        Completed: d.completed,
        'Not Completed': d.notCompleted,
        'Completion Rate %': d.completionRate,
      })),
      'sbh-category-breakdown.csv',
    )
  }

  if (loading) {
    return (
      <Card title="Category breakdown">
        <div className="h-72 flex items-center justify-center">
          <Spinner />
        </div>
      </Card>
    )
  }

  if (!data.length) {
    return (
      <Card title="Category breakdown">
        <EmptyState description="No conversations found. Once WhatsApp intakes start, categories will appear here." />
      </Card>
    )
  }

  const allUnselected = data.every(d => d.category === '(no category)')
  if (allUnselected) {
    return (
      <Card title="Category breakdown">
        <EmptyState
          description={`${data[0]?.total ?? 0} conversation(s) found but no focus area recorded. Check that n8n is writing the focus_area column — the field name must be snake_case (focus_area), not camelCase.`}
        />
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
    <Card title="Category breakdown">
      <div className="flex items-center justify-between mb-4">
        <p className="font-body text-xs text-charcoal/50">
          Stacked by outcome — completed vs. in-progress or abandoned
        </p>
        <Button variant="outline" size="sm" onClick={handleExport}>Export CSV</Button>
      </div>
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
          <Legend
            iconSize={10}
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          />
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
