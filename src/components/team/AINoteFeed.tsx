import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { EmptyState } from '../ui/EmptyState'
import { exportToCSV, formatDate } from '../../lib/utils'

interface AINote {
  id: string
  first_name: string | null
  last_name: string | null
  focus_area: string | null
  ai_note: string | null
  practitioner: string | null
  completed_at: string | null
}

export function AINoteFeed({ refreshKey = 0 }: { refreshKey?: number }) {
  const [notes, setNotes] = useState<AINote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('conversations')
      .select('id, first_name, last_name, focus_area, ai_note, practitioner, completed_at')
      .not('ai_note', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (!cancelled) {
          setNotes((data ?? []) as AINote[])
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [refreshKey])

  const handleExport = () => {
    exportToCSV(
      notes.map(n => ({
        Name: [n.first_name, n.last_name].filter(Boolean).join(' '),
        'Focus Area': n.focus_area ?? '',
        Practitioner: n.practitioner ?? '',
        'AI Note': n.ai_note ?? '',
        Completed: n.completed_at ? formatDate(n.completed_at) : '',
      })),
      'sbh-ai-notes.csv',
    )
  }

  if (loading) {
    return (
      <Card title="AI intake notes">
        <div className="h-32 flex items-center justify-center"><Spinner /></div>
      </Card>
    )
  }

  if (!notes.length) {
    return (
      <Card title="AI intake notes">
        <EmptyState description="AI notes appear here once Orbie completes intakes with Claude." />
      </Card>
    )
  }

  return (
    <Card title="AI intake notes">
      <div className="flex items-center justify-between mb-4">
        <p className="font-body text-xs text-charcoal/50">Most recent 10 completed intakes</p>
        <Button variant="outline" size="sm" onClick={handleExport}>Export CSV</Button>
      </div>
      <div className="space-y-3">
        {notes.map(n => (
          <div key={n.id} className="p-3 bg-surface/50 rounded-lg border border-surface">
            <div className="flex items-start justify-between gap-4 mb-1">
              <div>
                <span className="font-body text-sm font-semibold text-charcoal">
                  {[n.first_name, n.last_name].filter(Boolean).join(' ') || 'Unknown'}
                </span>
                {n.focus_area && (
                  <span className="ml-2 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {n.focus_area}
                  </span>
                )}
              </div>
              {n.practitioner && (
                <span className="text-xs text-charcoal/50 whitespace-nowrap">{n.practitioner}</span>
              )}
            </div>
            <p className="font-body text-xs text-charcoal/70 leading-relaxed">{n.ai_note}</p>
            {n.completed_at && (
              <p className="font-body text-[10px] text-charcoal/30 mt-1">{formatDate(n.completed_at)}</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
