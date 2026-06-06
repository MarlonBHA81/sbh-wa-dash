import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { EmptyState } from '../ui/EmptyState'
import { exportToCSV } from '../../lib/utils'
import type { VendorData } from '../../hooks/useVendorData'

interface VendorSplitProps {
  data: VendorData
  loading: boolean
}

const COLORS = ['#4e8a88', '#683f59']

export function VendorSplit({ data, loading }: VendorSplitProps) {
  const handleExport = () => {
    exportToCSV([
      { Type: 'Vendor', Count: data.vendor, Percentage: data.total ? Math.round(data.vendor / data.total * 100) : 0 },
      { Type: 'Non-Vendor', Count: data.nonVendor, Percentage: data.total ? Math.round(data.nonVendor / data.total * 100) : 0 },
    ], 'sbh-vendor-split.csv')
  }

  if (loading) {
    return (
      <Card title="Vendor split">
        <div className="h-52 flex items-center justify-center"><Spinner /></div>
      </Card>
    )
  }

  if (data.total === 0) {
    return <Card title="Vendor split"><EmptyState /></Card>
  }

  const chartData = [
    { name: 'Vendor', value: data.vendor },
    { name: 'Non-Vendor', value: data.nonVendor },
  ].filter(d => d.value > 0)

  const vendorPct = data.total ? Math.round(data.vendor / data.total * 100) : 0
  const nonVendorPct = data.total ? Math.round(data.nonVendor / data.total * 100) : 0

  return (
    <Card title="Vendor split">
      <div className="flex justify-end mb-2">
        <Button variant="outline" size="sm" onClick={handleExport}>Export CSV</Button>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #d3cfce', fontSize: 12 }}
            formatter={(v: number) => [v, 'Conversations']}
          />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-around mt-2">
        <div className="text-center">
          <p className="font-heading font-semibold text-xl text-primary">{vendorPct}%</p>
          <p className="font-body text-xs text-charcoal/50">Vendor</p>
        </div>
        <div className="text-center">
          <p className="font-heading font-semibold text-xl text-secondary">{nonVendorPct}%</p>
          <p className="font-body text-xs text-charcoal/50">Non-Vendor</p>
        </div>
      </div>
    </Card>
  )
}
