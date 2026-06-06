import { KPICard } from '../ui/KPICard'
import type { TeamKpis } from '../../types/database'

interface TeamKPIsProps {
  kpis: TeamKpis | null
  loading: boolean
}

export function TeamKPIs({ kpis, loading }: TeamKPIsProps) {
  const avgCompletionValue = (() => {
    if (!kpis) return '—'
    if (kpis.avgCompletionHours === null) return '—'
    if (kpis.avgCompletionHours < 24) return `${kpis.avgCompletionHours}h`
    return `${(kpis.avgCompletionHours / 24).toFixed(1)}d`
  })()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
      <KPICard
        label="Today"
        value={kpis?.today ?? 0}
        loading={loading}
      />
      <KPICard
        label="This week"
        value={kpis?.thisWeek ?? 0}
        loading={loading}
      />
      <KPICard
        label="This month"
        value={kpis?.thisMonth ?? 0}
        loading={loading}
      />
      <KPICard
        label="Completion rate"
        value={kpis ? `${kpis.completionRate}%` : '—'}
        loading={loading}
      />
      <KPICard
        label="Awaiting follow-up"
        value={kpis?.leadsAwaitingFollowup ?? 0}
        loading={loading}
        subtext="lead_complete status"
      />
      <KPICard
        label="Reply window closing"
        value={kpis?.approaching24hWindow ?? 0}
        loading={loading}
        accent={kpis && kpis.approaching24hWindow > 0 ? 'amber' : 'teal'}
        subtext="< 4 h remaining"
      />
      <KPICard
        label="Avg completion"
        value={avgCompletionValue}
        loading={loading}
        subtext="lead to close"
      />
      <KPICard
        label="Opt-outs"
        value={kpis?.optOutCount ?? 0}
        loading={loading}
        accent={kpis && kpis.optOutCount > 0 ? 'rose' : 'teal'}
        subtext="STOP received"
      />
    </div>
  )
}
