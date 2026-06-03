import { Card } from './Card'
import { Spinner } from './Spinner'

interface KPICardProps {
  label: string
  value: number | string
  subtext?: string
  loading?: boolean
  accent?: 'teal' | 'amber' | 'rose'
}

export function KPICard({
  label,
  value,
  subtext,
  loading,
  accent = 'teal',
}: KPICardProps) {
  const accentClass = {
    teal:  'text-primary',
    amber: 'text-amber-600',
    rose:  'text-rose-600',
  }[accent]

  return (
    <Card>
      <p className="font-body text-xs text-charcoal/60 mb-1 uppercase tracking-wide">{label}</p>
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
