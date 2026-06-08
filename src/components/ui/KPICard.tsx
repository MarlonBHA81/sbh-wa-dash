import { Card } from './Card'
import { Spinner } from './Spinner'

interface KPICardProps {
  label: string
  value: number | string
  subtext?: string
  loading?: boolean
  accent?: 'teal' | 'amber' | 'rose'
  tooltip?: string
}

export function KPICard({
  label,
  value,
  subtext,
  loading,
  accent = 'teal',
  tooltip,
}: KPICardProps) {
  const accentClass = {
    teal:  'text-primary',
    amber: 'text-amber-600',
    rose:  'text-rose-600',
  }[accent]

  return (
    <Card>
      <p
        className="font-body text-xs text-charcoal/60 mb-1 uppercase tracking-wide"
        title={tooltip}
      >
        {label}{tooltip && <span className="ml-1 text-charcoal/30 normal-case tracking-normal">ⓘ</span>}
      </p>
      {loading ? (
        <div className="h-9 flex items-center">
          <Spinner size="sm" />
        </div>
      ) : (
        <p className={`font-heading font-semibold text-3xl leading-none ${accentClass}`}>{value}</p>
      )}
      {subtext && (
        <p className="font-body text-xs text-charcoal/40 mt-1.5">{subtext}</p>
      )}
    </Card>
  )
}
