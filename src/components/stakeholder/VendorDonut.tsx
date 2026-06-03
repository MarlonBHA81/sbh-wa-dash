import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card } from '../ui/Card'
import { Spinner } from '../ui/Spinner'
import { EmptyState } from '../ui/EmptyState'
import type { StakeholderMetrics } from '../../types/database'

const COLORS = ['#4e8a88', '#683f59']

interface VendorDonutProps {
  metrics: StakeholderMetrics | null
  loading: boolean
}

export function VendorDonut({ metrics, loading }: VendorDonutProps) {
  const data = metrics
    ? [
        { name: 'Vendor', value: metrics.cnt_vendor },
        { name: 'Non-Vendor', value: metrics.cnt_nonvendor },
      ]
    : []

  if (loading) {
    return (
      <Card title="Vendor type split">
        <div className="h-56 flex items-center justify-center">
          <Spinner />
        </div>
      </Card>
    )
  }

  if (!data.length || data.every(d => d.value === 0)) {
    return (
      <Card title="Vendor type split">
        <EmptyState />
      </Card>
    )
  }

  return (
    <Card title="Vendor type split">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            startAngle={90}
            endAngle={-270}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #d3cfce', fontSize: 12 }}
            formatter={(v: number, name: string) => [v, name]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span className="text-xs text-charcoal">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      {metrics && (
        <p className="text-center text-xs text-charcoal/40 font-body -mt-2">
          {metrics.total_conversations} total
        </p>
      )}
    </Card>
  )
}
