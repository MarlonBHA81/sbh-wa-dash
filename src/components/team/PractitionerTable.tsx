import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { EmptyState } from '../ui/EmptyState'
import { exportToCSV } from '../../lib/utils'
import type { PractitionerRow } from '../../hooks/usePractitionerData'

interface PractitionerTableProps {
  data: PractitionerRow[]
  loading: boolean
}

export function PractitionerTable({ data, loading }: PractitionerTableProps) {
  const handleExport = () => {
    exportToCSV(
      data.map(r => ({
        Practitioner: r.practitioner,
        Total: r.total,
        Completed: r.completed,
        'In Progress': r.inProgress,
        Abandoned: r.abandoned,
        'Completion %': r.total ? Math.round(r.completed / r.total * 100) : 0,
      })),
      'sbh-practitioners.csv',
    )
  }

  if (loading) {
    return (
      <Card title="Practitioner load">
        <div className="h-40 flex items-center justify-center"><Spinner /></div>
      </Card>
    )
  }

  const hasReal = data.some(r => r.practitioner !== 'Unassigned')

  if (!hasReal) {
    return (
      <Card title="Practitioner load">
        <EmptyState description="Practitioner assignments appear once n8n v1.1 is active." />
      </Card>
    )
  }

  return (
    <Card title="Practitioner load">
      <div className="flex justify-end mb-3">
        <Button variant="outline" size="sm" onClick={handleExport}>Export CSV</Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-surface">
        <table className="w-full text-xs font-body">
          <thead className="bg-surface">
            <tr>
              {['Practitioner', 'Total', 'Completed', 'In progress', 'Abandoned', 'Rate'].map(h => (
                <th key={h} className="text-left px-3 py-2 font-heading font-semibold text-charcoal/60 uppercase tracking-wide text-[10px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.filter(r => r.practitioner !== 'Unassigned').map((r, i) => {
              const rate = r.total ? Math.round(r.completed / r.total * 100) : 0
              return (
                <tr key={i} className="border-t border-surface-2 hover:bg-surface/40">
                  <td className="px-3 py-2 font-semibold text-charcoal">{r.practitioner}</td>
                  <td className="px-3 py-2 text-charcoal">{r.total}</td>
                  <td className="px-3 py-2 text-teal-700">{r.completed}</td>
                  <td className="px-3 py-2 text-amber-700">{r.inProgress}</td>
                  <td className="px-3 py-2 text-rose-700">{r.abandoned}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-surface rounded-full h-1.5 min-w-[48px]">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${rate}%` }} />
                      </div>
                      <span className="text-charcoal/60 w-8 text-right">{rate}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
