import { useEffect, useState } from 'react'
import { startOfDay, startOfWeek, startOfMonth, subHours } from 'date-fns'
import { supabase } from '../lib/supabase'
import type { TeamKpis } from '../types/database'

export function useTeamKPIs(refreshKey = 0) {
  const [kpis, setKpis] = useState<TeamKpis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('conversations')
        .select('id, status, started_at, last_message_at')

      if (cancelled) return

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      const now = new Date()
      const todayStart   = startOfDay(now).toISOString()
      const weekStart    = startOfWeek(now, { weekStartsOn: 1 }).toISOString()
      const monthStart   = startOfMonth(now).toISOString()
      const h20ago       = subHours(now, 20).toISOString()
      const h24ago       = subHours(now, 24).toISOString()

      const rows = (data ?? []) as Array<{
        id: string
        status: string
        started_at: string
        last_message_at: string
      }>
      const total = rows.length
      const completed = rows.filter(r =>
        r.status === 'lead_complete' || r.status === 'nonvendor_complete'
      ).length

      setKpis({
        today:                 rows.filter(r => r.started_at >= todayStart).length,
        thisWeek:              rows.filter(r => r.started_at >= weekStart).length,
        thisMonth:             rows.filter(r => r.started_at >= monthStart).length,
        completionRate:        total === 0 ? 0 : Math.round(completed / total * 100),
        leadsAwaitingFollowup: rows.filter(r => r.status === 'lead_complete').length,
        approaching24hWindow:  rows.filter(r =>
          r.status === 'in_progress' &&
          r.last_message_at < h20ago &&
          r.last_message_at > h24ago
        ).length,
      })
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [refreshKey])

  return { kpis, loading, error }
}
