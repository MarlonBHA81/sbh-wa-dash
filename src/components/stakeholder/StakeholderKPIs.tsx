import { KPICard } from '../ui/KPICard'
import type { StakeholderMetrics } from '../../types/database'

interface StakeholderKPIsProps {
  metrics: StakeholderMetrics | null
  loading: boolean
}

export function StakeholderKPIs({ metrics, loading }: StakeholderKPIsProps) {
  const vendorPct = metrics
    ? Math.round(metrics.cnt_vendor / (metrics.total_conversations || 1) * 100)
    : 0
  const vendorValue = metrics ? `${vendorPct}% Vendor` : '—'
  const vendorSubtext = metrics
    ? `${metrics.cnt_vendor} Vendor · ${metrics.cnt_nonvendor} Non-Vendor`
    : undefined

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <KPICard
        label="Total conversations"
        value={metrics?.total_conversations ?? 0}
        loading={loading}
      />
      <KPICard
        label="Completion rate"
        value={metrics ? `${metrics.completion_rate_pct}%` : '—'}
        loading={loading}
      />
      <KPICard
        label="Vendor split"
        value={vendorValue}
        loading={loading}
        subtext={vendorSubtext}
      />
    </div>
  )
}
