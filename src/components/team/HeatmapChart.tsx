import { useMemo } from 'react'
import { Card } from '../ui/Card'
import { Spinner } from '../ui/Spinner'
import type { HeatmapCell } from '../../types/database'

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function hourLabel(h: number): string {
  if (h === 0) return '12am'
  if (h === 12) return '12pm'
  return h < 12 ? `${h}am` : `${h - 12}pm`
}

interface HeatmapChartProps {
  cells: HeatmapCell[]
  loading: boolean
}

export function HeatmapChart({ cells, loading }: HeatmapChartProps) {
  const maxCount = useMemo(
    () => Math.max(1, ...cells.map(c => c.count)),
    [cells],
  )

  if (loading) {
    return (
      <Card title="Inbound volume — day × hour">
        <div className="h-48 flex items-center justify-center">
          <Spinner />
        </div>
      </Card>
    )
  }

  return (
    <Card title="Inbound volume — day × hour">
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Hour axis labels */}
          <div className="flex ml-10 mb-1">
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="flex-1 text-center text-[9px] text-charcoal/40">
                {h % 3 === 0 ? hourLabel(h) : ''}
              </div>
            ))}
          </div>

          {/* Rows: one per day-of-week */}
          {Array.from({ length: 7 }, (_, dow) => (
            <div key={dow} className="flex items-center gap-px mb-px">
              <span className="w-10 shrink-0 text-right pr-2 text-[10px] text-charcoal/60">
                {DOW_LABELS[dow]}
              </span>
              {Array.from({ length: 24 }, (_, hour) => {
                const cell = cells.find(c => c.dow === dow && c.hour === hour)
                const count = cell?.count ?? 0
                const intensity = count / maxCount
                return (
                  <div
                    key={hour}
                    className="flex-1 aspect-square rounded-sm cursor-default transition-opacity"
                    style={{
                      backgroundColor: count === 0
                        ? '#e0dedd'
                        : `rgba(78, 138, 136, ${0.12 + intensity * 0.88})`,
                    }}
                    title={`${DOW_LABELS[dow]} ${hourLabel(hour)}: ${count} inbound`}
                  />
                )
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 ml-10">
            <span className="text-[10px] text-charcoal/40">Less</span>
            {[0, 0.25, 0.5, 0.75, 1].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: i === 0
                    ? '#e0dedd'
                    : `rgba(78, 138, 136, ${0.12 + i * 0.88})`,
                }}
              />
            ))}
            <span className="text-[10px] text-charcoal/40">More</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
